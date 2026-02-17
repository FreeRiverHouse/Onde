#!/usr/bin/env node
/**
 * batch-shorts.js - Genera YouTube Shorts in batch da una cartella
 *
 * Uso:
 *   node batch-shorts.js <cartella_input> [cartella_output] [opzioni]
 *
 * Struttura cartella input:
 *   input/
 *   ├── 01-nome/
 *   │   ├── image.jpg (o .png)
 *   │   ├── audio.mp3 (o .wav, .m4a)
 *   │   └── meta.json (opzionale - titolo, subtitle, effect)
 *   ├── 02-altro/
 *   │   └── ...
 *
 * Opzioni:
 *   -e, --effect <tipo>     Effetto default: zoom-in, zoom-out, pan-up, pan-down
 *   -p, --parallel <n>      Processi paralleli (default: 2)
 *   --dry-run               Simula senza eseguire
 *   -h, --help              Mostra questo help
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERRORE]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  progress: (msg) => process.stdout.write(`${colors.cyan}[PROGRESS]${colors.reset} ${msg}\r`),
};

// Configurazione
const config = {
  effect: 'zoom-in',
  parallel: 2,
  dryRun: false,
};

// Estensioni supportate
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const AUDIO_EXT = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];

function parseArgs(args) {
  let inputDir = null;
  let outputDir = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      case '-e':
      case '--effect':
        config.effect = next;
        i++;
        break;
      case '-p':
      case '--parallel':
        config.parallel = parseInt(next);
        i++;
        break;
      case '--dry-run':
        config.dryRun = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          if (!inputDir) inputDir = arg;
          else if (!outputDir) outputDir = arg;
        }
    }
  }

  return { inputDir, outputDir };
}

function showHelp() {
  console.log(`
batch-shorts.js - Genera YouTube Shorts in batch

Uso:
  node batch-shorts.js <cartella_input> [cartella_output] [opzioni]

Struttura cartella input:
  input/
  ├── 01-nome/
  │   ├── image.jpg (o .png)
  │   ├── audio.mp3 (o .wav, .m4a)
  │   └── meta.json (opzionale)
  ├── 02-altro/
  │   └── ...

Opzioni:
  -e, --effect <tipo>     Effetto: zoom-in, zoom-out, pan-up, pan-down (default: zoom-in)
  -p, --parallel <n>      Processi paralleli (default: 2)
  --dry-run               Simula senza eseguire
  -h, --help              Mostra questo help

Formato meta.json:
  {
    "title": "Titolo del video",
    "subtitle": "Sottotitolo opzionale",
    "effect": "zoom-out"
  }
`);
}

// Trova immagine e audio in una cartella
function findAssets(dir) {
  const files = fs.readdirSync(dir);

  const image = files.find(f => IMAGE_EXT.includes(path.extname(f).toLowerCase()));
  const audio = files.find(f => AUDIO_EXT.includes(path.extname(f).toLowerCase()));
  const metaFile = files.find(f => f === 'meta.json');

  let meta = {};
  if (metaFile) {
    try {
      meta = JSON.parse(fs.readFileSync(path.join(dir, metaFile), 'utf8'));
    } catch (e) {
      log.warn(`Errore parsing meta.json in ${dir}`);
    }
  }

  return {
    image: image ? path.join(dir, image) : null,
    audio: audio ? path.join(dir, audio) : null,
    meta,
  };
}

// Crea un singolo Short
function createShort(imagePath, audioPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'create-short.sh');

    const args = [
      '-e', options.effect || config.effect,
      imagePath,
      audioPath,
      outputPath
    ];

    if (options.title) {
      args.unshift('-t', options.title);
    }
    if (options.subtitle) {
      args.unshift('-s', options.subtitle);
    }

    if (config.dryRun) {
      log.info(`[DRY-RUN] ${scriptPath} ${args.join(' ')}`);
      resolve({ output: outputPath, success: true });
      return;
    }

    const proc = spawn(scriptPath, args, { stdio: 'pipe' });

    let stderr = '';
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ output: outputPath, success: true });
      } else {
        reject(new Error(`Errore: ${stderr}`));
      }
    });

    proc.on('error', reject);
  });
}

// Processa in parallelo
async function processInParallel(jobs, outputDir) {
  const results = [];
  const queue = [...jobs];
  const active = new Map();

  let completed = 0;
  const total = jobs.length;

  const updateProgress = () => {
    const pct = Math.round((completed / total) * 100);
    log.progress(`${completed}/${total} shorts completati (${pct}%)`);
  };

  while (queue.length > 0 || active.size > 0) {
    while (queue.length > 0 && active.size < config.parallel) {
      const job = queue.shift();
      const outputPath = path.join(outputDir, `${job.name}.mp4`);

      const promise = createShort(job.image, job.audio, outputPath, {
        title: job.meta.title,
        subtitle: job.meta.subtitle,
        effect: job.meta.effect || config.effect,
      })
        .then(result => {
          results.push({ ...result, name: job.name });
          completed++;
          updateProgress();
          active.delete(promise);
        })
        .catch(err => {
          log.error(`${job.name}: ${err.message}`);
          active.delete(promise);
        });

      active.set(promise, job.name);
    }

    if (active.size > 0) {
      await Promise.race(active.keys());
    }
  }

  console.log('');
  return results;
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }

  const { inputDir, outputDir: customOutput } = parseArgs(args);

  if (!inputDir) {
    log.error('Specifica la cartella di input');
    process.exit(1);
  }

  if (!fs.existsSync(inputDir)) {
    log.error(`Cartella non trovata: ${inputDir}`);
    process.exit(1);
  }

  const outputDir = customOutput || path.join(inputDir, 'shorts');

  // Trova tutti i job (sottocartelle con assets)
  const subdirs = fs.readdirSync(inputDir)
    .filter(d => fs.statSync(path.join(inputDir, d)).isDirectory())
    .sort();

  const jobs = [];
  for (const subdir of subdirs) {
    const assets = findAssets(path.join(inputDir, subdir));

    if (assets.image && assets.audio) {
      jobs.push({
        name: subdir,
        ...assets,
      });
    } else {
      log.warn(`${subdir}: manca immagine o audio, saltato`);
    }
  }

  if (jobs.length === 0) {
    log.error('Nessun job trovato. Verifica la struttura delle cartelle.');
    process.exit(1);
  }

  log.info(`Trovati ${jobs.length} shorts da creare`);
  log.info(`Output: ${outputDir}`);
  log.info(`Effetto default: ${config.effect}`);
  log.info(`Processi paralleli: ${config.parallel}`);

  // Crea cartella output
  if (!config.dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Processa
  const startTime = Date.now();
  const results = await processInParallel(jobs, outputDir);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  log.success(`Completati ${results.length} shorts in ${elapsed}s`);

  // Riepilogo
  if (!config.dryRun) {
    console.log('\n--- Riepilogo ---');
    results.forEach(r => {
      console.log(`  ${colors.green}✓${colors.reset} ${r.name}.mp4`);
    });
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
