#!/usr/bin/env node

/**
 * Factory Controller - Lancia agenti in parallelo con monitoraggio risorse
 *
 * Monitora CPU, RAM e disco. Se tutto sotto 85%, lancia nuovi agenti.
 * Se sopra 85%, aspetta o stoppa agenti.
 *
 * Uso: node scripts/factory/factory-controller.js
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// Configurazione
const CONFIG = {
  MAX_CPU_PERCENT: 85,
  MAX_RAM_PERCENT: 85,
  MAX_DISK_PERCENT: 85,
  CHECK_INTERVAL_MS: 10000, // 10 secondi
  MAX_CONCURRENT_AGENTS: 3,
  WORKER_MANAGER_PATH: path.join(__dirname, '../worker/worker-manager.js'),
  EXCLUDED_TASKS: ['flow-voice-007', 'flow-voice-003', 'flow-voice-004'] // Wispr/voice stuff esclusi
};

// Stato
let runningAgents = [];
let totalAgentsLaunched = 0;

/**
 * Ottiene statistiche di sistema
 */
function getSystemStats() {
  try {
    // CPU - usa top per ottenere la percentuale di utilizzo
    const topOutput = execSync('top -l 1 | head -10', { encoding: 'utf-8' });
    const cpuMatch = topOutput.match(/CPU usage:\s*([\d.]+)% user,\s*([\d.]+)% sys/);
    const cpuUsed = cpuMatch ? parseFloat(cpuMatch[1]) + parseFloat(cpuMatch[2]) : 0;

    // RAM - usa vm_stat per memoria
    const vmOutput = execSync('vm_stat', { encoding: 'utf-8' });
    const pageSize = 16384; // macOS ARM page size

    const freeMatch = vmOutput.match(/Pages free:\s*(\d+)/);
    const activeMatch = vmOutput.match(/Pages active:\s*(\d+)/);
    const inactiveMatch = vmOutput.match(/Pages inactive:\s*(\d+)/);
    const wiredMatch = vmOutput.match(/Pages wired down:\s*(\d+)/);
    const compressedMatch = vmOutput.match(/Pages occupied by compressor:\s*(\d+)/);

    const freePages = freeMatch ? parseInt(freeMatch[1]) : 0;
    const activePages = activeMatch ? parseInt(activeMatch[1]) : 0;
    const inactivePages = inactiveMatch ? parseInt(inactiveMatch[1]) : 0;
    const wiredPages = wiredMatch ? parseInt(wiredMatch[1]) : 0;
    const compressedPages = compressedMatch ? parseInt(compressedMatch[1]) : 0;

    const totalUsed = activePages + wiredPages + compressedPages;
    const totalPages = totalUsed + freePages + inactivePages;
    const ramPercent = totalPages > 0 ? (totalUsed / totalPages) * 100 : 0;

    // Disco - usa df
    const dfOutput = execSync('df -h / | tail -1', { encoding: 'utf-8' });
    const dfMatch = dfOutput.match(/(\d+)%/);
    const diskPercent = dfMatch ? parseInt(dfMatch[1]) : 0;

    return {
      cpu: Math.round(cpuUsed),
      ram: Math.round(ramPercent),
      disk: diskPercent,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Errore nel leggere stats:', error.message);
    return { cpu: 100, ram: 100, disk: 100 }; // Valori sicuri in caso di errore
  }
}

/**
 * Verifica se le risorse sono sotto i limiti
 */
function resourcesOk(stats) {
  return (
    stats.cpu < CONFIG.MAX_CPU_PERCENT &&
    stats.ram < CONFIG.MAX_RAM_PERCENT &&
    stats.disk < CONFIG.MAX_DISK_PERCENT
  );
}

/**
 * Ottiene la lista dei task disponibili
 */
function getAvailableTasks() {
  try {
    const output = execSync(`node ${CONFIG.WORKER_MANAGER_PATH} available --json`, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '../..')
    });

    // Parse output - il worker manager potrebbe non supportare --json, quindi parsing manuale
    const tasks = [];
    const lines = output.split('\n');
    let currentTask = null;

    for (const line of lines) {
      // Match task ID line (es: "lipsync-001 [P1] - Titolo")
      const taskMatch = line.match(/^\x1b\[32m([a-z0-9-]+)\x1b\[0m \[P(\d)\] - (.+)$/);
      if (taskMatch) {
        if (currentTask) tasks.push(currentTask);
        currentTask = {
          id: taskMatch[1],
          priority: parseInt(taskMatch[2]),
          title: taskMatch[3].trim()
        };
      }
      // Match senza colori ANSI
      const plainMatch = line.match(/^([a-z0-9-]+) \[P(\d)\] - (.+)$/);
      if (plainMatch) {
        if (currentTask) tasks.push(currentTask);
        currentTask = {
          id: plainMatch[1],
          priority: parseInt(plainMatch[2]),
          title: plainMatch[3].trim()
        };
      }
    }
    if (currentTask) tasks.push(currentTask);

    // Filtra task esclusi
    return tasks.filter(t => !CONFIG.EXCLUDED_TASKS.includes(t.id));
  } catch (error) {
    console.error('Errore nel leggere task:', error.message);
    return [];
  }
}

/**
 * Lancia un agente per un task
 */
function launchAgent(task) {
  console.log(`\n🚀 Lancio agente per task: ${task.id} - ${task.title}`);

  // Claim il task prima
  try {
    execSync(`node ${CONFIG.WORKER_MANAGER_PATH} claim ${task.id}`, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '../..')
    });
    console.log(`   ✅ Task ${task.id} claimed`);
  } catch (error) {
    console.error(`   ❌ Errore nel claim: ${error.message}`);
    return null;
  }

  const agentInfo = {
    taskId: task.id,
    taskTitle: task.title,
    startTime: new Date(),
    status: 'running'
  };

  runningAgents.push(agentInfo);
  totalAgentsLaunched++;

  return agentInfo;
}

/**
 * Pulisce gli agenti completati
 */
function cleanupCompletedAgents() {
  // Per ora non facciamo nulla - gli agenti Task sono gestiti da Claude Code
  // In futuro potremmo controllare lo stato dei task
}

/**
 * Loop principale del controller
 */
async function mainLoop() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FACTORY CONTROLLER - Stato');
  console.log('='.repeat(60));

  // 1. Ottieni stats
  const stats = getSystemStats();
  console.log(`\n📈 Risorse Sistema:`);
  console.log(`   CPU:  ${stats.cpu}% ${stats.cpu >= CONFIG.MAX_CPU_PERCENT ? '⚠️ ALTO' : '✅'}`);
  console.log(`   RAM:  ${stats.ram}% ${stats.ram >= CONFIG.MAX_RAM_PERCENT ? '⚠️ ALTO' : '✅'}`);
  console.log(`   Disk: ${stats.disk}% ${stats.disk >= CONFIG.MAX_DISK_PERCENT ? '⚠️ ALTO' : '✅'}`);

  // 2. Check se possiamo lanciare agenti
  if (!resourcesOk(stats)) {
    console.log(`\n⚠️ Risorse sopra limite (${CONFIG.MAX_CPU_PERCENT}%). Attendo...`);
    return;
  }

  // 3. Check numero agenti correnti
  if (runningAgents.length >= CONFIG.MAX_CONCURRENT_AGENTS) {
    console.log(`\n⏸️ Max agenti raggiunto (${CONFIG.MAX_CONCURRENT_AGENTS}). Attendo...`);
    return;
  }

  // 4. Ottieni task disponibili
  const availableTasks = getAvailableTasks();
  console.log(`\n📋 Task disponibili: ${availableTasks.length}`);

  if (availableTasks.length === 0) {
    console.log('   Nessun task disponibile.');
    return;
  }

  // 5. Prendi il primo task per priorità (già ordinati)
  const nextTask = availableTasks[0];

  // 6. Lancia agente
  const agent = launchAgent(nextTask);
  if (agent) {
    console.log(`\n✨ Agente lanciato! Totale lanciati: ${totalAgentsLaunched}`);
  }
}

/**
 * Mostra stato corrente
 */
function showStatus() {
  const stats = getSystemStats();
  const tasks = getAvailableTasks();

  console.log('\n' + '='.repeat(60));
  console.log('🏭 FACTORY CONTROLLER - Status Report');
  console.log('='.repeat(60));
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`\n📈 Risorse:`);
  console.log(`   CPU:  ${stats.cpu}% (limite: ${CONFIG.MAX_CPU_PERCENT}%)`);
  console.log(`   RAM:  ${stats.ram}% (limite: ${CONFIG.MAX_RAM_PERCENT}%)`);
  console.log(`   Disk: ${stats.disk}% (limite: ${CONFIG.MAX_DISK_PERCENT}%)`);
  console.log(`   Status: ${resourcesOk(stats) ? '✅ OK per lanciare agenti' : '⚠️ Risorse troppo alte'}`);
  console.log(`\n📋 Task disponibili: ${tasks.length}`);
  tasks.slice(0, 5).forEach(t => {
    console.log(`   - [P${t.priority}] ${t.id}: ${t.title}`);
  });
  if (tasks.length > 5) {
    console.log(`   ... e altri ${tasks.length - 5}`);
  }
  console.log(`\n🤖 Agenti attivi: ${runningAgents.length}/${CONFIG.MAX_CONCURRENT_AGENTS}`);
  console.log(`   Totale lanciati questa sessione: ${totalAgentsLaunched}`);

  return { stats, tasks, canLaunch: resourcesOk(stats) && runningAgents.length < CONFIG.MAX_CONCURRENT_AGENTS };
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.includes('-s')) {
    showStatus();
    process.exit(0);
  }

  if (args.includes('--once') || args.includes('-1')) {
    // Esegui una volta sola
    await mainLoop();
    process.exit(0);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Factory Controller - Lancia agenti in parallelo con monitoraggio risorse

Uso:
  node factory-controller.js           Avvia loop continuo
  node factory-controller.js --status  Mostra stato corrente
  node factory-controller.js --once    Esegui una volta e esci
  node factory-controller.js --help    Mostra questo help

Configurazione:
  MAX_CPU: ${CONFIG.MAX_CPU_PERCENT}%
  MAX_RAM: ${CONFIG.MAX_RAM_PERCENT}%
  MAX_DISK: ${CONFIG.MAX_DISK_PERCENT}%
  MAX_AGENTS: ${CONFIG.MAX_CONCURRENT_AGENTS}
  CHECK_INTERVAL: ${CONFIG.CHECK_INTERVAL_MS / 1000}s
`);
    process.exit(0);
  }

  // Loop continuo
  console.log('🏭 Factory Controller avviato');
  console.log(`   Limiti: CPU ${CONFIG.MAX_CPU_PERCENT}%, RAM ${CONFIG.MAX_RAM_PERCENT}%, Disk ${CONFIG.MAX_DISK_PERCENT}%`);
  console.log(`   Max agenti concorrenti: ${CONFIG.MAX_CONCURRENT_AGENTS}`);
  console.log(`   Check ogni: ${CONFIG.CHECK_INTERVAL_MS / 1000}s`);
  console.log('\nPremi Ctrl+C per fermare\n');

  // Prima esecuzione
  await mainLoop();

  // Loop
  setInterval(mainLoop, CONFIG.CHECK_INTERVAL_MS);
}

// Export per uso come modulo
module.exports = { getSystemStats, resourcesOk, getAvailableTasks, showStatus, CONFIG };

// Run se eseguito direttamente
if (require.main === module) {
  main().catch(console.error);
}
