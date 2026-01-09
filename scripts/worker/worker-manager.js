#!/usr/bin/env node
/**
 * ONDE WORKER MANAGER
 * Sistema di ticketing per agenti Claude
 *
 * Comandi:
 *   node worker-manager.js status          - Mostra stato tutti i task
 *   node worker-manager.js available       - Lista task disponibili (senza dipendenze bloccanti)
 *   node worker-manager.js claim <task-id> - Prendi un task
 *   node worker-manager.js release <task-id> - Rilascia un task
 *   node worker-manager.js complete <task-id> - Segna task come completato
 *   node worker-manager.js next            - Prendi il prossimo task disponibile
 *   node worker-manager.js workers         - Mostra worker attivi
 */

const fs = require('fs');
const path = require('path');

const WORKER_DIR = path.join(__dirname, '../../.claude-workers');
const TASKS_FILE = path.join(WORKER_DIR, 'TASKS.json');
const LOCKS_DIR = path.join(WORKER_DIR, 'locks');
const LOGS_DIR = path.join(WORKER_DIR, 'logs');

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function c(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Carica tasks
function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    console.error(c('red', 'ERRORE: TASKS.json non trovato'));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

// Salva tasks
function saveTasks(data) {
  data.last_updated = new Date().toISOString();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

// Ottieni ID worker corrente (PID del processo parent - la sessione Claude)
function getWorkerId() {
  // Usa una combinazione di PID e timestamp per unicità
  return `claude-${process.ppid}-${Date.now().toString(36)}`;
}

// Crea lock file per un task
function createLock(taskId, workerId) {
  const lockFile = path.join(LOCKS_DIR, `${taskId}.lock`);
  const lockData = {
    task_id: taskId,
    worker_id: workerId,
    locked_at: new Date().toISOString(),
    pid: process.ppid
  };
  fs.writeFileSync(lockFile, JSON.stringify(lockData, null, 2));
  return lockFile;
}

// Rimuovi lock file
function removeLock(taskId) {
  const lockFile = path.join(LOCKS_DIR, `${taskId}.lock`);
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
}

// Verifica se un task è lockato
function isLocked(taskId) {
  const lockFile = path.join(LOCKS_DIR, `${taskId}.lock`);
  return fs.existsSync(lockFile);
}

// Verifica se le dipendenze di un task sono soddisfatte
function dependenciesMet(task, tasks) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }

  for (const depId of task.dependencies) {
    const depTask = tasks.find(t => t.id === depId);
    if (!depTask || depTask.status !== 'completed') {
      return false;
    }
  }
  return true;
}

// Ottieni task disponibili (non claimed, dipendenze soddisfatte)
function getAvailableTasks(data) {
  return data.tasks
    .filter(t => t.status === 'available' && !isLocked(t.id))
    .filter(t => dependenciesMet(t, data.tasks))
    .sort((a, b) => a.priority - b.priority);
}

// Ottieni worker attivi
function getActiveWorkers() {
  if (!fs.existsSync(LOCKS_DIR)) return [];

  const locks = fs.readdirSync(LOCKS_DIR).filter(f => f.endsWith('.lock'));
  return locks.map(lockFile => {
    const data = JSON.parse(fs.readFileSync(path.join(LOCKS_DIR, lockFile), 'utf8'));
    return data;
  });
}

// Log attività
function logActivity(action, taskId, workerId, details = '') {
  const logFile = path.join(LOGS_DIR, `${new Date().toISOString().split('T')[0]}.log`);
  const logEntry = `[${new Date().toISOString()}] ${action} | Task: ${taskId} | Worker: ${workerId} | ${details}\n`;
  fs.appendFileSync(logFile, logEntry);
}

// === COMANDI ===

function cmdStatus() {
  const data = loadTasks();

  console.log(c('bold', '\n📊 ONDE TASK STATUS\n'));
  console.log(`Ultimo aggiornamento: ${data.last_updated}\n`);

  const categories = [...new Set(data.tasks.map(t => t.category))];

  for (const cat of categories) {
    console.log(c('cyan', `\n═══ ${cat.toUpperCase()} ═══`));
    const catTasks = data.tasks.filter(t => t.category === cat);

    for (const task of catTasks) {
      let statusIcon = '⬜';
      let statusColor = 'white';

      switch (task.status) {
        case 'available':
          if (dependenciesMet(task, data.tasks)) {
            statusIcon = '🟢';
            statusColor = 'green';
          } else {
            statusIcon = '🟡';
            statusColor = 'yellow';
          }
          break;
        case 'claimed':
        case 'in_progress':
          statusIcon = '🔵';
          statusColor = 'blue';
          break;
        case 'completed':
          statusIcon = '✅';
          statusColor = 'green';
          break;
        case 'blocked':
          statusIcon = '🔴';
          statusColor = 'red';
          break;
      }

      const depInfo = task.dependencies?.length > 0
        ? c('yellow', ` [deps: ${task.dependencies.join(', ')}]`)
        : '';

      const claimedInfo = task.claimed_by
        ? c('magenta', ` [${task.claimed_by}]`)
        : '';

      console.log(`${statusIcon} [P${task.priority}] ${c(statusColor, task.id)}: ${task.title}${depInfo}${claimedInfo}`);
    }
  }

  // Summary
  const available = data.tasks.filter(t => t.status === 'available' && dependenciesMet(t, data.tasks)).length;
  const inProgress = data.tasks.filter(t => t.status === 'in_progress' || t.status === 'claimed').length;
  const completed = data.tasks.filter(t => t.status === 'completed').length;
  const blocked = data.tasks.filter(t => t.status === 'available' && !dependenciesMet(t, data.tasks)).length;

  console.log(c('bold', '\n📈 SUMMARY'));
  console.log(`   🟢 Disponibili: ${available}`);
  console.log(`   🔵 In Progress: ${inProgress}`);
  console.log(`   ✅ Completati:  ${completed}`);
  console.log(`   🟡 Bloccati (dipendenze): ${blocked}`);
  console.log(`   📦 Totale: ${data.tasks.length}\n`);
}

function cmdAvailable() {
  const data = loadTasks();
  const available = getAvailableTasks(data);

  console.log(c('bold', '\n🟢 TASK DISPONIBILI (pronti per essere presi)\n'));

  if (available.length === 0) {
    console.log(c('yellow', 'Nessun task disponibile al momento.'));
    console.log('Possibili cause:');
    console.log('  - Tutti i task sono claimed o completati');
    console.log('  - I task rimanenti hanno dipendenze non soddisfatte\n');
    return;
  }

  for (const task of available) {
    console.log(`${c('green', task.id)} [P${task.priority}] - ${task.title}`);
    console.log(`   ${c('cyan', task.description)}`);
    console.log(`   Effort: ${task.estimated_effort} | Category: ${task.category}`);
    if (task.files_involved?.length > 0) {
      console.log(`   Files: ${task.files_involved.join(', ')}`);
    }
    console.log('');
  }

  console.log(c('bold', `\n💡 Per prendere un task: node worker-manager.js claim <task-id>`));
  console.log(c('bold', `   Oppure: node worker-manager.js next (prende il primo disponibile)\n`));
}

function cmdClaim(taskId) {
  if (!taskId) {
    console.error(c('red', 'ERRORE: Specifica task-id'));
    process.exit(1);
  }

  const data = loadTasks();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(c('red', `ERRORE: Task "${taskId}" non trovato`));
    process.exit(1);
  }

  if (task.status !== 'available') {
    console.error(c('red', `ERRORE: Task "${taskId}" non è disponibile (status: ${task.status})`));
    process.exit(1);
  }

  if (isLocked(taskId)) {
    console.error(c('red', `ERRORE: Task "${taskId}" è già stato preso da un altro worker`));
    process.exit(1);
  }

  if (!dependenciesMet(task, data.tasks)) {
    console.error(c('red', `ERRORE: Task "${taskId}" ha dipendenze non soddisfatte`));
    console.log(`Dipendenze: ${task.dependencies.join(', ')}`);
    process.exit(1);
  }

  const workerId = getWorkerId();

  // Crea lock e aggiorna task
  createLock(taskId, workerId);
  task.status = 'in_progress';
  task.claimed_by = workerId;
  task.claimed_at = new Date().toISOString();
  saveTasks(data);

  logActivity('CLAIM', taskId, workerId, task.title);

  console.log(c('green', `\n✅ Task "${taskId}" assegnato a ${workerId}\n`));
  console.log(c('bold', 'TASK DETAILS:'));
  console.log(`   ID: ${task.id}`);
  console.log(`   Title: ${task.title}`);
  console.log(`   Description: ${task.description}`);
  console.log(`   Category: ${task.category}`);
  console.log(`   Effort: ${task.estimated_effort}`);
  if (task.files_involved?.length > 0) {
    console.log(`   Files: ${task.files_involved.join(', ')}`);
  }
  console.log(`\n${c('yellow', '⚠️  Quando finisci: node worker-manager.js complete ' + taskId)}\n`);

  // Ritorna il task per uso programmatico
  return task;
}

function cmdRelease(taskId) {
  if (!taskId) {
    console.error(c('red', 'ERRORE: Specifica task-id'));
    process.exit(1);
  }

  const data = loadTasks();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(c('red', `ERRORE: Task "${taskId}" non trovato`));
    process.exit(1);
  }

  const workerId = task.claimed_by || 'unknown';

  // Rimuovi lock e resetta task
  removeLock(taskId);
  task.status = 'available';
  task.claimed_by = null;
  task.claimed_at = null;
  saveTasks(data);

  logActivity('RELEASE', taskId, workerId, task.title);

  console.log(c('yellow', `\n🔓 Task "${taskId}" rilasciato e tornato disponibile\n`));
}

function cmdComplete(taskId) {
  if (!taskId) {
    console.error(c('red', 'ERRORE: Specifica task-id'));
    process.exit(1);
  }

  const data = loadTasks();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(c('red', `ERRORE: Task "${taskId}" non trovato`));
    process.exit(1);
  }

  const workerId = task.claimed_by || 'unknown';

  // Rimuovi lock e marca come completato
  removeLock(taskId);
  task.status = 'completed';
  task.completed_at = new Date().toISOString();
  saveTasks(data);

  logActivity('COMPLETE', taskId, workerId, task.title);

  console.log(c('green', `\n✅ Task "${taskId}" COMPLETATO!\n`));

  // Mostra task che ora sono sbloccati
  const newlyAvailable = data.tasks.filter(t =>
    t.status === 'available' &&
    t.dependencies?.includes(taskId) &&
    dependenciesMet(t, data.tasks)
  );

  if (newlyAvailable.length > 0) {
    console.log(c('cyan', '🔓 Task sbloccati:'));
    for (const t of newlyAvailable) {
      console.log(`   - ${t.id}: ${t.title}`);
    }
    console.log('');
  }
}

function cmdNext() {
  const data = loadTasks();
  const available = getAvailableTasks(data);

  if (available.length === 0) {
    console.log(c('yellow', '\n⚠️  Nessun task disponibile al momento.\n'));
    process.exit(0);
  }

  // Prendi il primo (già ordinato per priorità)
  const task = available[0];
  return cmdClaim(task.id);
}

function cmdWorkers() {
  const workers = getActiveWorkers();

  console.log(c('bold', '\n👷 WORKER ATTIVI\n'));

  if (workers.length === 0) {
    console.log(c('yellow', 'Nessun worker attivo al momento.\n'));
    return;
  }

  for (const w of workers) {
    const duration = Math.round((Date.now() - new Date(w.locked_at).getTime()) / 1000 / 60);
    console.log(`${c('blue', w.worker_id)}`);
    console.log(`   Task: ${w.task_id}`);
    console.log(`   PID: ${w.pid}`);
    console.log(`   Attivo da: ${duration} minuti`);
    console.log('');
  }
}

// === MAIN ===

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case 'status':
    cmdStatus();
    break;
  case 'available':
    cmdAvailable();
    break;
  case 'claim':
    cmdClaim(param);
    break;
  case 'release':
    cmdRelease(param);
    break;
  case 'complete':
    cmdComplete(param);
    break;
  case 'next':
    cmdNext();
    break;
  case 'workers':
    cmdWorkers();
    break;
  default:
    console.log(c('bold', '\n🏭 ONDE WORKER MANAGER\n'));
    console.log('Comandi disponibili:');
    console.log('  status     - Mostra stato tutti i task');
    console.log('  available  - Lista task disponibili (senza dipendenze bloccanti)');
    console.log('  claim <id> - Prendi un task');
    console.log('  release <id> - Rilascia un task');
    console.log('  complete <id> - Segna task come completato');
    console.log('  next       - Prendi il prossimo task disponibile (priorità)');
    console.log('  workers    - Mostra worker attivi\n');
}
