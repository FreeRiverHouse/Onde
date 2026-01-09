const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3500;
const ONDE_ROOT = path.join(__dirname, '..', '..');
const WORKERS_DIR = path.join(ONDE_ROOT, '.claude-workers');
const TASKS_FILE = path.join(WORKERS_DIR, 'TASKS.json');
const LOCKS_DIR = path.join(WORKERS_DIR, 'locks');
const MESSAGES_FILE = path.join(WORKERS_DIR, 'messages.json');

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read tasks file
function getTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading TASKS.json:', err.message);
    return { tasks: [], version: '2.0', total_tasks: 0 };
  }
}

// Helper: Save tasks file
function saveTasks(tasksData) {
  tasksData.last_updated = new Date().toISOString();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksData, null, 2));
}

// Helper: Get active workers from lock files
function getWorkers() {
  const workers = [];
  try {
    if (!fs.existsSync(LOCKS_DIR)) return workers;

    const lockFiles = fs.readdirSync(LOCKS_DIR).filter(f => f.endsWith('.lock'));

    for (const lockFile of lockFiles) {
      const lockPath = path.join(LOCKS_DIR, lockFile);
      const taskId = lockFile.replace('.lock', '');

      try {
        const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        const stats = fs.statSync(lockPath);
        const ageMinutes = Math.floor((Date.now() - stats.mtimeMs) / 60000);

        workers.push({
          taskId,
          workerId: lockData.worker_id,
          claimedAt: lockData.claimed_at,
          ageMinutes,
          status: ageMinutes > 30 ? 'stale' : 'active'
        });
      } catch (err) {
        // Invalid lock file
        workers.push({
          taskId,
          workerId: 'unknown',
          claimedAt: null,
          ageMinutes: 0,
          status: 'invalid'
        });
      }
    }
  } catch (err) {
    console.error('Error reading workers:', err.message);
  }

  return workers;
}

// Helper: Get messages
function getMessages() {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) return [];
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Helper: Save message
function saveMessage(message) {
  const messages = getMessages();
  messages.push({
    id: Date.now(),
    text: message,
    timestamp: new Date().toISOString(),
    from: 'Mattia'
  });
  // Keep only last 100 messages
  const trimmed = messages.slice(-100);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(trimmed, null, 2));
  return trimmed;
}

// Broadcast to all WebSocket clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// ============ API ENDPOINTS ============

// GET /api/workers - lista worker attivi
app.get('/api/workers', (req, res) => {
  const workers = getWorkers();
  res.json({ workers, count: workers.length });
});

// GET /api/tasks - lista task con status
app.get('/api/tasks', (req, res) => {
  const tasksData = getTasks();
  const tasks = tasksData.tasks || [];

  // Group by status
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    available: tasks.filter(t => t.status === 'available').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };

  res.json({
    tasks,
    stats,
    last_updated: tasksData.last_updated
  });
});

// GET /api/tasks/active - solo task in progress e bloccati
app.get('/api/tasks/active', (req, res) => {
  const tasksData = getTasks();
  const tasks = (tasksData.tasks || []).filter(t =>
    t.status === 'in_progress' || t.status === 'blocked'
  );
  res.json({ tasks });
});

// POST /api/tasks/:id/unblock - sblocca un task
app.post('/api/tasks/:id/unblock', (req, res) => {
  const { id } = req.params;
  const tasksData = getTasks();

  const task = tasksData.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Remove lock file
  const lockFile = path.join(LOCKS_DIR, `${id}.lock`);
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }

  // Update task status
  task.status = 'available';
  task.claimed_by = null;
  task.claimed_at = null;

  saveTasks(tasksData);
  broadcast({ type: 'task_updated', task });

  res.json({ success: true, task });
});

// POST /api/tasks/:id/complete - segna task come completato
app.post('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  const tasksData = getTasks();

  const task = tasksData.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Remove lock file
  const lockFile = path.join(LOCKS_DIR, `${id}.lock`);
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }

  // Update task status
  task.status = 'completed';
  task.completed_at = new Date().toISOString();

  saveTasks(tasksData);
  broadcast({ type: 'task_updated', task });

  res.json({ success: true, task });
});

// POST /api/message - invia messaggio a tutti i Claude
app.post('/api/message', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const messages = saveMessage(message);
  broadcast({ type: 'new_message', message: messages[messages.length - 1] });

  res.json({ success: true, message: messages[messages.length - 1] });
});

// GET /api/messages - ottieni messaggi recenti
app.get('/api/messages', (req, res) => {
  const messages = getMessages();
  res.json({ messages });
});

// GET /api/stats - statistiche rapide
app.get('/api/stats', (req, res) => {
  const tasksData = getTasks();
  const tasks = tasksData.tasks || [];
  const workers = getWorkers();

  res.json({
    workers_active: workers.filter(w => w.status === 'active').length,
    workers_stale: workers.filter(w => w.status === 'stale').length,
    tasks_completed: tasks.filter(t => t.status === 'completed').length,
    tasks_in_progress: tasks.filter(t => t.status === 'in_progress').length,
    tasks_available: tasks.filter(t => t.status === 'available').length,
    tasks_total: tasks.length,
    last_updated: tasksData.last_updated
  });
});

// GET /api/status - full status for dashboard (matches frontend)
app.get('/api/status', (req, res) => {
  const tasksData = getTasks();
  const tasks = tasksData.tasks || [];
  const workers = getWorkers();

  // Get pending approvals (tasks waiting for human approval)
  const pendingApprovals = tasks
    .filter(t => t.status === 'in_progress' && t.needs_approval)
    .map(t => ({
      id: t.id,
      worker: t.claimed_by ? t.claimed_by.slice(-12) : 'unknown',
      task: t.title,
      time: t.claimed_at ? formatTimeAgo(new Date(t.claimed_at)) : '?'
    }));

  // Active workers
  const activeWorkers = workers
    .filter(w => w.status === 'active')
    .map(w => ({
      id: w.taskId,
      name: getTaskTitle(tasks, w.taskId),
      time: `${w.ageMinutes}min`,
      status: 'active'
    }));

  // Blocked tasks (stale locks or blocked status)
  const blockedTasks = [
    ...workers.filter(w => w.status === 'stale').map(w => ({
      id: w.taskId,
      name: getTaskTitle(tasks, w.taskId),
      reason: `Stale ${w.ageMinutes}min`,
      time: `${w.ageMinutes}min`
    })),
    ...tasks.filter(t => t.status === 'blocked').map(t => ({
      id: t.id,
      name: t.title,
      reason: 'Dependencies not met',
      time: '-'
    }))
  ];

  res.json({
    stats: {
      completed: tasks.filter(t => t.status === 'completed').length,
      active: workers.filter(w => w.status === 'active').length,
      pending: pendingApprovals.length,
      blocked: blockedTasks.length
    },
    pending: pendingApprovals,
    active: activeWorkers,
    blocked: blockedTasks
  });
});

// POST /api/unblock/:id - sblocca un task (alias for frontend)
app.post('/api/unblock/:id', (req, res) => {
  const { id } = req.params;
  const tasksData = getTasks();

  const task = tasksData.tasks.find(t => t.id === id);

  // Remove lock file
  const lockFile = path.join(LOCKS_DIR, `${id}.lock`);
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }

  if (task) {
    task.status = 'available';
    task.claimed_by = null;
    task.claimed_at = null;
    saveTasks(tasksData);
  }

  broadcast({ type: 'task_unblocked', taskId: id });
  res.json({ success: true });
});

// POST /api/broadcast - send message to all workers
app.post('/api/broadcast', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const messages = saveMessage(message);
  broadcast({ type: 'broadcast', message });

  res.json({ success: true });
});

// POST /api/approve/:id - approve a pending task
app.post('/api/approve/:id', (req, res) => {
  const { id } = req.params;
  const tasksData = getTasks();
  const task = tasksData.tasks.find(t => t.id === id);

  if (task) {
    task.needs_approval = false;
    task.approved_at = new Date().toISOString();
    saveTasks(tasksData);
  }

  broadcast({ type: 'task_approved', taskId: id });
  res.json({ success: true });
});

// POST /api/reject/:id - reject a pending task
app.post('/api/reject/:id', (req, res) => {
  const { id } = req.params;
  const tasksData = getTasks();
  const task = tasksData.tasks.find(t => t.id === id);

  if (task) {
    task.status = 'available';
    task.claimed_by = null;
    task.claimed_at = null;
    task.needs_approval = false;

    const lockFile = path.join(LOCKS_DIR, `${id}.lock`);
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }

    saveTasks(tasksData);
  }

  broadcast({ type: 'task_rejected', taskId: id });
  res.json({ success: true });
});

// POST /api/approve-all - approve all pending tasks
app.post('/api/approve-all', (req, res) => {
  const tasksData = getTasks();

  tasksData.tasks.forEach(task => {
    if (task.needs_approval) {
      task.needs_approval = false;
      task.approved_at = new Date().toISOString();
    }
  });

  saveTasks(tasksData);
  broadcast({ type: 'all_approved' });
  res.json({ success: true });
});

// POST /api/reject-all - reject all pending tasks
app.post('/api/reject-all', (req, res) => {
  const tasksData = getTasks();

  tasksData.tasks.forEach(task => {
    if (task.needs_approval && task.status === 'in_progress') {
      task.status = 'available';
      task.claimed_by = null;
      task.claimed_at = null;
      task.needs_approval = false;

      const lockFile = path.join(LOCKS_DIR, `${task.id}.lock`);
      if (fs.existsSync(lockFile)) {
        try { fs.unlinkSync(lockFile); } catch (e) {}
      }
    }
  });

  saveTasks(tasksData);
  broadcast({ type: 'all_rejected' });
  res.json({ success: true });
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// Helper function to get task title
function getTaskTitle(tasks, taskId) {
  const task = tasks.find(t => t.id === taskId);
  return task ? task.title : taskId;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Send initial data
  ws.send(JSON.stringify({
    type: 'init',
    stats: getWorkers(),
    tasks: getTasks().tasks
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
    } catch (err) {
      console.error('Invalid message:', err);
    }
  });
});

// Serve the dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const interfaces = require('os').networkInterfaces();
  let lanIP = 'localhost';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIP = iface.address;
        break;
      }
    }
  }

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║       CLAUDE COMMAND CENTER - Running!                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   Local:  http://localhost:${PORT}                         ║
║   LAN:    http://${lanIP}:${PORT}                        ║
║                                                           ║
║   Open on iPhone to control all Claude workers!          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
