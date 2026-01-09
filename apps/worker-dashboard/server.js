const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3457;

const TASKS_FILE = path.join(__dirname, '../../.claude-workers/TASKS.json');
const LOCKS_DIR = path.join(__dirname, '../../.claude-workers/locks');

// API: Get all tasks with status
app.get('/api/tasks', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));

    // Check locks for accurate status
    const locks = fs.existsSync(LOCKS_DIR) ?
      fs.readdirSync(LOCKS_DIR).filter(f => f.endsWith('.lock')) : [];

    const lockedTaskIds = locks.map(f => f.replace('.lock', ''));

    // Add real-time lock info
    data.tasks = data.tasks.map(task => ({
      ...task,
      is_locked: lockedTaskIds.includes(task.id),
      dependencies_met: checkDependencies(task, data.tasks)
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get active workers
app.get('/api/workers', (req, res) => {
  try {
    if (!fs.existsSync(LOCKS_DIR)) {
      return res.json([]);
    }

    const locks = fs.readdirSync(LOCKS_DIR).filter(f => f.endsWith('.lock'));
    const workers = locks.map(lockFile => {
      const data = JSON.parse(fs.readFileSync(path.join(LOCKS_DIR, lockFile), 'utf8'));
      const duration = Math.round((Date.now() - new Date(data.locked_at).getTime()) / 1000 / 60);
      return { ...data, duration_minutes: duration };
    });

    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Claim task
app.post('/api/tasks/:id/claim', express.json(), (req, res) => {
  try {
    const taskId = req.params.id;
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    const task = data.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'available') {
      return res.status(400).json({ error: 'Task not available' });
    }

    const workerId = `web-${Date.now().toString(36)}`;

    // Create lock
    const lockFile = path.join(LOCKS_DIR, `${taskId}.lock`);
    fs.writeFileSync(lockFile, JSON.stringify({
      task_id: taskId,
      worker_id: workerId,
      locked_at: new Date().toISOString(),
      source: 'web-dashboard'
    }, null, 2));

    // Update task
    task.status = 'in_progress';
    task.claimed_by = workerId;
    task.claimed_at = new Date().toISOString();
    data.last_updated = new Date().toISOString();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, task, worker_id: workerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Complete task
app.post('/api/tasks/:id/complete', express.json(), (req, res) => {
  try {
    const taskId = req.params.id;
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    const task = data.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove lock
    const lockFile = path.join(LOCKS_DIR, `${taskId}.lock`);
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);

    // Update task
    task.status = 'completed';
    task.completed_at = new Date().toISOString();
    data.last_updated = new Date().toISOString();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Release task
app.post('/api/tasks/:id/release', express.json(), (req, res) => {
  try {
    const taskId = req.params.id;
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    const task = data.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove lock
    const lockFile = path.join(LOCKS_DIR, `${taskId}.lock`);
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);

    // Update task
    task.status = 'available';
    task.claimed_by = null;
    task.claimed_at = null;
    data.last_updated = new Date().toISOString();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function checkDependencies(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) return true;

  for (const depId of task.dependencies) {
    const depTask = allTasks.find(t => t.id === depId);
    if (!depTask || depTask.status !== 'completed') return false;
  }
  return true;
}

// Dashboard HTML
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏭 Onde Worker Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    h1 { text-align: center; margin-bottom: 10px; font-size: 28px; }
    .subtitle { text-align: center; color: #888; margin-bottom: 20px; }
    .stats {
      display: flex; gap: 15px; justify-content: center; margin-bottom: 25px; flex-wrap: wrap;
    }
    .stat {
      background: rgba(255,255,255,0.1);
      padding: 15px 25px;
      border-radius: 10px;
      text-align: center;
    }
    .stat-number { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 12px; color: #aaa; margin-top: 5px; }
    .stat.available .stat-number { color: #4ade80; }
    .stat.in-progress .stat-number { color: #60a5fa; }
    .stat.completed .stat-number { color: #a78bfa; }
    .stat.blocked .stat-number { color: #fbbf24; }

    .board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      max-width: 1400px;
      margin: 0 auto;
    }
    @media (max-width: 1200px) { .board { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .board { grid-template-columns: 1fr; } }

    .column {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 15px;
      min-height: 400px;
    }
    .column-header {
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .column-count {
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
    }

    .card {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      border-left: 4px solid #4ade80;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .card.in-progress { border-left-color: #60a5fa; }
    .card.completed { border-left-color: #a78bfa; opacity: 0.7; }
    .card.blocked { border-left-color: #fbbf24; }
    .card-id {
      font-size: 11px;
      color: #888;
      margin-bottom: 4px;
    }
    .card-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 6px;
    }
    .card-meta {
      font-size: 11px;
      color: #aaa;
      display: flex;
      gap: 10px;
    }
    .card-deps {
      font-size: 10px;
      color: #fbbf24;
      margin-top: 5px;
    }
    .priority {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .priority.p1 { background: #ef4444; }
    .priority.p2 { background: #f97316; }
    .priority.p3 { background: #eab308; color: #000; }

    .workers-panel {
      max-width: 1400px;
      margin: 25px auto 0;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 15px;
    }
    .workers-header { font-weight: 600; margin-bottom: 10px; }
    .worker {
      background: rgba(96,165,250,0.2);
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .worker-id { font-family: monospace; font-size: 12px; }
    .worker-task { font-weight: 500; }
    .worker-time { color: #888; font-size: 12px; }
    .no-workers { color: #888; font-style: italic; }

    .refresh-note {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>🏭 Onde Worker Dashboard</h1>
  <p class="subtitle">Task Ticketing per Agenti Claude</p>

  <div class="stats" id="stats"></div>

  <div class="board" id="board">
    <div class="column" id="col-available">
      <div class="column-header">🟢 Disponibili <span class="column-count" id="count-available">0</span></div>
      <div class="cards" id="cards-available"></div>
    </div>
    <div class="column" id="col-in-progress">
      <div class="column-header">🔵 In Progress <span class="column-count" id="count-in-progress">0</span></div>
      <div class="cards" id="cards-in-progress"></div>
    </div>
    <div class="column" id="col-blocked">
      <div class="column-header">🟡 Bloccati <span class="column-count" id="count-blocked">0</span></div>
      <div class="cards" id="cards-blocked"></div>
    </div>
    <div class="column" id="col-completed">
      <div class="column-header">✅ Completati <span class="column-count" id="count-completed">0</span></div>
      <div class="cards" id="cards-completed"></div>
    </div>
  </div>

  <div class="workers-panel">
    <div class="workers-header">👷 Worker Attivi</div>
    <div id="workers"></div>
  </div>

  <p class="refresh-note">Auto-refresh ogni 5 secondi</p>

  <script>
    async function loadData() {
      try {
        const [tasksRes, workersRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/workers')
        ]);
        const tasksData = await tasksRes.json();
        const workers = await workersRes.json();

        renderTasks(tasksData.tasks);
        renderWorkers(workers);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }

    function renderTasks(tasks) {
      const available = tasks.filter(t => t.status === 'available' && t.dependencies_met);
      const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'claimed');
      const blocked = tasks.filter(t => t.status === 'available' && !t.dependencies_met);
      const completed = tasks.filter(t => t.status === 'completed');

      // Stats
      document.getElementById('stats').innerHTML = \`
        <div class="stat available">
          <div class="stat-number">\${available.length}</div>
          <div class="stat-label">DISPONIBILI</div>
        </div>
        <div class="stat in-progress">
          <div class="stat-number">\${inProgress.length}</div>
          <div class="stat-label">IN PROGRESS</div>
        </div>
        <div class="stat blocked">
          <div class="stat-number">\${blocked.length}</div>
          <div class="stat-label">BLOCCATI</div>
        </div>
        <div class="stat completed">
          <div class="stat-number">\${completed.length}</div>
          <div class="stat-label">COMPLETATI</div>
        </div>
      \`;

      // Columns
      renderColumn('available', available);
      renderColumn('in-progress', inProgress, 'in-progress');
      renderColumn('blocked', blocked, 'blocked');
      renderColumn('completed', completed, 'completed');
    }

    function renderColumn(id, tasks, cardClass = '') {
      document.getElementById(\`count-\${id}\`).textContent = tasks.length;
      document.getElementById(\`cards-\${id}\`).innerHTML = tasks
        .sort((a, b) => a.priority - b.priority)
        .map(t => \`
          <div class="card \${cardClass}" onclick="showTask('\${t.id}')">
            <div class="card-id">\${t.id}</div>
            <div class="card-title">\${t.title}</div>
            <div class="card-meta">
              <span class="priority p\${t.priority}">P\${t.priority}</span>
              <span>\${t.category}</span>
              <span>\${t.estimated_effort}</span>
            </div>
            \${t.dependencies?.length ? \`<div class="card-deps">⚠️ Deps: \${t.dependencies.join(', ')}</div>\` : ''}
            \${t.claimed_by ? \`<div class="card-deps">👷 \${t.claimed_by}</div>\` : ''}
          </div>
        \`).join('');
    }

    function renderWorkers(workers) {
      const el = document.getElementById('workers');
      if (workers.length === 0) {
        el.innerHTML = '<div class="no-workers">Nessun worker attivo</div>';
        return;
      }
      el.innerHTML = workers.map(w => \`
        <div class="worker">
          <div>
            <div class="worker-task">\${w.task_id}</div>
            <div class="worker-id">\${w.worker_id}</div>
          </div>
          <div class="worker-time">\${w.duration_minutes} min</div>
        </div>
      \`).join('');
    }

    function showTask(id) {
      alert('Task: ' + id + '\\n\\nPer interagire usa:\\nnode scripts/worker/worker-manager.js claim ' + id);
    }

    loadData();
    setInterval(loadData, 5000);
  </script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🏭 Onde Worker Dashboard');
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${getLocalIP()}:${PORT}`);
  console.log('');
});

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
