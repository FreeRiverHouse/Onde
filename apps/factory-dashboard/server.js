const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3600;
const ONDE_ROOT = path.join(__dirname, '..', '..');
const WORKERS_DIR = path.join(ONDE_ROOT, '.claude-workers');
const TASKS_FILE = path.join(WORKERS_DIR, 'TASKS.json');
const LOCKS_DIR = path.join(WORKERS_DIR, 'locks');
const LOGS_DIR = path.join(WORKERS_DIR, 'logs');

// Store completion history in memory (last 50 completions)
let completionHistory = [];
const MAX_HISTORY = 50;

// Store connected clients
const clients = new Set();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ HELPER FUNCTIONS ============

function getTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading TASKS.json:', err.message);
    return { tasks: [], version: '2.0', total_tasks: 0 };
  }
}

function getActiveWorkers() {
  const workers = [];
  try {
    if (!fs.existsSync(LOCKS_DIR)) return workers;

    const lockFiles = fs.readdirSync(LOCKS_DIR).filter(f => f.endsWith('.lock'));
    const tasksData = getTasks();

    for (const lockFile of lockFiles) {
      const lockPath = path.join(LOCKS_DIR, lockFile);
      const taskId = lockFile.replace('.lock', '');

      try {
        const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        const stats = fs.statSync(lockPath);
        const ageMinutes = Math.floor((Date.now() - stats.mtimeMs) / 60000);
        const task = tasksData.tasks.find(t => t.id === taskId);

        workers.push({
          taskId,
          taskTitle: task ? task.title : taskId,
          taskCategory: task ? task.category : 'unknown',
          workerId: lockData.worker_id,
          claimedAt: lockData.claimed_at || lockData.locked_at,
          ageMinutes,
          status: ageMinutes > 30 ? 'stale' : 'active',
          progress: estimateProgress(ageMinutes, task ? task.estimated_effort : 'medium')
        });
      } catch (err) {
        workers.push({
          taskId,
          taskTitle: taskId,
          taskCategory: 'unknown',
          workerId: 'unknown',
          claimedAt: null,
          ageMinutes: 0,
          status: 'invalid',
          progress: 0
        });
      }
    }
  } catch (err) {
    console.error('Error reading workers:', err.message);
  }

  return workers.sort((a, b) => a.ageMinutes - b.ageMinutes);
}

function estimateProgress(ageMinutes, effort) {
  const effortMinutes = {
    'small': 10,
    'medium': 30,
    'large': 60
  };
  const expected = effortMinutes[effort] || 30;
  return Math.min(95, Math.round((ageMinutes / expected) * 100));
}

function getTaskQueue() {
  const tasksData = getTasks();
  const tasks = tasksData.tasks || [];

  // Available tasks with met dependencies
  const available = tasks.filter(t => {
    if (t.status !== 'available') return false;
    if (!t.dependencies || t.dependencies.length === 0) return true;
    return t.dependencies.every(depId => {
      const dep = tasks.find(d => d.id === depId);
      return dep && dep.status === 'completed';
    });
  }).sort((a, b) => (a.priority || 3) - (b.priority || 3));

  // Blocked tasks (dependencies not met)
  const blocked = tasks.filter(t => {
    if (t.status !== 'available') return false;
    if (!t.dependencies || t.dependencies.length === 0) return false;
    return !t.dependencies.every(depId => {
      const dep = tasks.find(d => d.id === depId);
      return dep && dep.status === 'completed';
    });
  });

  return { available, blocked };
}

function getStats() {
  const tasksData = getTasks();
  const tasks = tasksData.tasks || [];
  const workers = getActiveWorkers();
  const queue = getTaskQueue();

  // Calculate today's completions
  const today = new Date().toISOString().split('T')[0];
  const completedToday = tasks.filter(t =>
    t.status === 'completed' &&
    t.completed_at &&
    t.completed_at.startsWith(today)
  ).length;

  // Category breakdown
  const categories = {};
  tasks.forEach(t => {
    const cat = t.category || 'other';
    if (!categories[cat]) {
      categories[cat] = { total: 0, completed: 0, in_progress: 0 };
    }
    categories[cat].total++;
    if (t.status === 'completed') categories[cat].completed++;
    if (t.status === 'in_progress') categories[cat].in_progress++;
  });

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    completedToday,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    available: queue.available.length,
    blocked: queue.blocked.length,
    activeWorkers: workers.filter(w => w.status === 'active').length,
    staleWorkers: workers.filter(w => w.status === 'stale').length,
    categories,
    lastUpdated: tasksData.last_updated
  };
}

function addToHistory(event) {
  completionHistory.unshift({
    ...event,
    timestamp: new Date().toISOString()
  });
  if (completionHistory.length > MAX_HISTORY) {
    completionHistory = completionHistory.slice(0, MAX_HISTORY);
  }
}

// Broadcast to all WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ============ FILE WATCHER ============

let previousTasks = null;

function watchForChanges() {
  const watcher = chokidar.watch([TASKS_FILE, LOCKS_DIR], {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('all', (event, filePath) => {
    // Debounce to avoid multiple triggers
    setTimeout(() => {
      const newTasksData = getTasks();

      // Detect completions
      if (previousTasks) {
        const prevTasks = previousTasks.tasks || [];
        const newTasks = newTasksData.tasks || [];

        newTasks.forEach(task => {
          const prev = prevTasks.find(t => t.id === task.id);
          if (prev && prev.status !== 'completed' && task.status === 'completed') {
            addToHistory({
              type: 'completion',
              taskId: task.id,
              taskTitle: task.title,
              category: task.category,
              completedBy: task.claimed_by
            });
            broadcast({
              type: 'task_completed',
              task: {
                id: task.id,
                title: task.title,
                category: task.category
              }
            });
          }
        });
      }

      previousTasks = newTasksData;

      // Broadcast general update
      broadcast({
        type: 'update',
        stats: getStats(),
        workers: getActiveWorkers(),
        queue: getTaskQueue()
      });
    }, 100);
  });

  console.log('File watcher started');
}

// ============ API ENDPOINTS ============

app.get('/api/dashboard', (req, res) => {
  res.json({
    stats: getStats(),
    workers: getActiveWorkers(),
    queue: getTaskQueue(),
    history: completionHistory.slice(0, 20)
  });
});

app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

app.get('/api/workers', (req, res) => {
  res.json({ workers: getActiveWorkers() });
});

app.get('/api/queue', (req, res) => {
  res.json(getTaskQueue());
});

app.get('/api/history', (req, res) => {
  res.json({ history: completionHistory });
});

app.get('/api/tasks', (req, res) => {
  const tasksData = getTasks();
  res.json(tasksData);
});

app.get('/api/tasks/:category', (req, res) => {
  const { category } = req.params;
  const tasksData = getTasks();
  const tasks = (tasksData.tasks || []).filter(t =>
    t.category && t.category.toLowerCase() === category.toLowerCase()
  );
  res.json({ tasks });
});

// ============ WEBSOCKET ============

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  // Send initial data
  ws.send(JSON.stringify({
    type: 'init',
    stats: getStats(),
    workers: getActiveWorkers(),
    queue: getTaskQueue(),
    history: completionHistory.slice(0, 20)
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket connection closed');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clients.delete(ws);
  });
});

// ============ SERVE DASHBOARD ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ START SERVER ============

previousTasks = getTasks();
watchForChanges();

server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
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
+===========================================================+
|                                                           |
|   ONDE FACTORY DASHBOARD                                  |
|   Real-time agent monitoring & task visualization         |
|                                                           |
+-----------------------------------------------------------+
|                                                           |
|   Local:   http://localhost:${PORT}                         |
|   Network: http://${lanIP}:${PORT}                        |
|                                                           |
|   Open on iPhone to monitor factory live!                 |
|                                                           |
+===========================================================+
  `);
});
