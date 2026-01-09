/**
 * Onde Instagram Reels Queue Manager
 * Gestisce la coda di reels da generare e pubblicare
 */

const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'queue.json');

// Inizializza queue se non esiste
function initQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    const initialQueue = {
      pending: [],
      processing: [],
      completed: [],
      failed: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(initialQueue, null, 2));
  }
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
}

// Salva queue
function saveQueue(queue) {
  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Aggiunge un reel alla coda
 */
function addToQueue(reelConfig) {
  const queue = initQueue();

  const job = {
    id: `reel-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    config: reelConfig,
    // Configurazione reel
    // - type: 'single' | 'slideshow'
    // - images: array di path immagini
    // - audio: path audio opzionale
    // - text: testo overlay opzionale
    // - duration: durata in secondi
    // - caption: caption per Instagram
    // - hashtags: array di hashtag
    // - scheduledFor: data/ora pubblicazione (opzionale)
  };

  queue.pending.push(job);
  saveQueue(queue);

  console.log(`Job aggiunto: ${job.id}`);
  return job;
}

/**
 * Ottiene il prossimo job da processare
 */
function getNextJob() {
  const queue = initQueue();

  if (queue.pending.length === 0) return null;

  const job = queue.pending.shift();
  job.status = 'processing';
  job.startedAt = new Date().toISOString();

  queue.processing.push(job);
  saveQueue(queue);

  return job;
}

/**
 * Marca un job come completato
 */
function completeJob(jobId, result) {
  const queue = initQueue();

  const jobIndex = queue.processing.findIndex(j => j.id === jobId);
  if (jobIndex === -1) return null;

  const job = queue.processing.splice(jobIndex, 1)[0];
  job.status = 'completed';
  job.completedAt = new Date().toISOString();
  job.result = result;

  queue.completed.push(job);
  saveQueue(queue);

  return job;
}

/**
 * Marca un job come fallito
 */
function failJob(jobId, error) {
  const queue = initQueue();

  const jobIndex = queue.processing.findIndex(j => j.id === jobId);
  if (jobIndex === -1) return null;

  const job = queue.processing.splice(jobIndex, 1)[0];
  job.status = 'failed';
  job.failedAt = new Date().toISOString();
  job.error = error.message || error;

  queue.failed.push(job);
  saveQueue(queue);

  return job;
}

/**
 * Ottiene statistiche della coda
 */
function getStats() {
  const queue = initQueue();

  return {
    pending: queue.pending.length,
    processing: queue.processing.length,
    completed: queue.completed.length,
    failed: queue.failed.length,
    lastUpdated: queue.lastUpdated
  };
}

/**
 * Lista tutti i job
 */
function listJobs(status = null) {
  const queue = initQueue();

  if (status) {
    return queue[status] || [];
  }

  return {
    pending: queue.pending,
    processing: queue.processing,
    completed: queue.completed.slice(-10), // ultimi 10
    failed: queue.failed.slice(-10)
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'add':
      // Esempio: node queue-manager.js add --image cover.jpg --audio music.mp3
      const config = {};
      for (let i = 1; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        config[key] = value;
      }
      addToQueue(config);
      break;

    case 'next':
      const job = getNextJob();
      console.log(job ? JSON.stringify(job, null, 2) : 'Nessun job in coda');
      break;

    case 'stats':
      console.log(getStats());
      break;

    case 'list':
      console.log(JSON.stringify(listJobs(args[1]), null, 2));
      break;

    default:
      console.log(`
Onde Reels Queue Manager

Comandi:
  add --image <path> [--audio <path>]  Aggiunge job alla coda
  next                                  Ottiene prossimo job
  stats                                 Mostra statistiche
  list [status]                         Lista job (pending|processing|completed|failed)
      `);
  }
}

module.exports = {
  addToQueue,
  getNextJob,
  completeJob,
  failJob,
  getStats,
  listJobs
};
