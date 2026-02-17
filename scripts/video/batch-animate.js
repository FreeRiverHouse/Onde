#!/usr/bin/env node
/**
 * batch-animate.js - Processa cartelle di immagini per creare video animati
 *
 * Uso:
 *   node batch-animate.js <cartella_input> [cartella_output] [opzioni]
 *
 * Opzioni:
 *   --duration, -d <sec>     Durata di ogni video (default: 5)
 *   --effect, -e <tipo>      Effetto: zoom-in, zoom-out, pan-left, pan-right,
 *                            pan-up, pan-down, zoom-pan, random (default: random)
 *   --intensity, -i <val>    Intensità effetto 0.1-0.5 (default: 0.2)
 *   --fade, -f <sec>         Durata fade in/out (default: 0.5)
 *   --resolution, -r <WxH>   Risoluzione output (default: 1920x1080)
 *   --quality, -q <crf>      Qualità video CRF (default: 18)
 *   --parallel, -p <n>       Numero di processi paralleli (default: 2)
 *   --concat, -c             Concatena tutti i video in uno solo
 *   --concat-output <file>   Nome del file concatenato (default: output.mp4)
 *   --dry-run                Mostra cosa verrebbe fatto senza eseguire
 *   --help, -h               Mostra questo help
 *
 * Esempi:
 *   node batch-animate.js ./images ./videos
 *   node batch-animate.js ./images --effect zoom-in --duration 8
 *   node batch-animate.js ./images ./videos --concat --parallel 4
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERRORE]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  progress: (msg) => process.stdout.write(`${colors.cyan}[PROGRESS]${colors.reset} ${msg}\r`),
};

// Configurazione di default
const config = {
  duration: 5,
  effect: 'random',
  intensity: 0.2,
  fade: 0.5,
  resolution: '1920x1080',
  quality: 18,
  parallel: 2,
  concat: false,
  concatOutput: 'output.mp4',
  dryRun: false,
};

// Effetti disponibili (escluso 'random')
const EFFECTS = ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'zoom-pan'];

// Estensioni immagine supportate
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];

/**
 * Parse degli argomenti da linea di comando
 */
function parseArgs(args) {
  let inputDir = null;
  let outputDir = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      case '-d':
      case '--duration':
        config.duration = parseFloat(nextArg);
        i++;
        break;
      case '-e':
      case '--effect':
        config.effect = nextArg;
        i++;
        break;
      case '-i':
      case '--intensity':
        config.intensity = parseFloat(nextArg);
        i++;
        break;
      case '-f':
      case '--fade':
        config.fade = parseFloat(nextArg);
        i++;
        break;
      case '-r':
      case '--resolution':
        config.resolution = nextArg;
        i++;
        break;
      case '-q':
      case '--quality':
        config.quality = parseInt(nextArg);
        i++;
        break;
      case '-p':
      case '--parallel':
        config.parallel = parseInt(nextArg);
        i++;
        break;
      case '-c':
      case '--concat':
        config.concat = true;
        break;
      case '--concat-output':
        config.concatOutput = nextArg;
        config.concat = true;
        i++;
        break;
      case '--dry-run':
        config.dryRun = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          if (!inputDir) {
            inputDir = arg;
          } else if (!outputDir) {
            outputDir = arg;
          }
        }
    }
  }

  return { inputDir, outputDir };
}

/**
 * Mostra l'help
 */
function showHelp() {
  const helpText = `
batch-animate.js - Processa cartelle di immagini per creare video animati

Uso:
  node batch-animate.js <cartella_input> [cartella_output] [opzioni]

Opzioni:
  --duration, -d <sec>     Durata di ogni video (default: 5)
  --effect, -e <tipo>      Effetto: zoom-in, zoom-out, pan-left, pan-right,
                           pan-up, pan-down, zoom-pan, random (default: random)
  --intensity, -i <val>    Intensità effetto 0.1-0.5 (default: 0.2)
  --fade, -f <sec>         Durata fade in/out (default: 0.5)
  --resolution, -r <WxH>   Risoluzione output (default: 1920x1080)
  --quality, -q <crf>      Qualità video CRF (default: 18)
  --parallel, -p <n>       Numero di processi paralleli (default: 2)
  --concat, -c             Concatena tutti i video in uno solo
  --concat-output <file>   Nome del file concatenato (default: output.mp4)
  --dry-run                Mostra cosa verrebbe fatto senza eseguire
  --help, -h               Mostra questo help

Esempi:
  node batch-animate.js ./images ./videos
  node batch-animate.js ./images --effect zoom-in --duration 8
  node batch-animate.js ./images ./videos --concat --parallel 4
`;
  console.log(helpText);
}

/**
 * Trova tutte le immagini in una cartella
 */
function findImages(dir) {
  if (!fs.existsSync(dir)) {
    log.error(`Cartella non trovata: ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir);
  const images = files
    .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort()
    .map(f => path.join(dir, f));

  return images;
}

/**
 * Seleziona un effetto (casuale se richiesto)
 */
function getEffect() {
  if (config.effect === 'random') {
    return EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
  }
  return config.effect;
}

/**
 * Esegue animate-image.sh per una singola immagine
 */
function animateImage(inputPath, outputPath, effect) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'animate-image.sh');

    const args = [
      '-d', config.duration.toString(),
      '-e', effect,
      '-i', config.intensity.toString(),
      '-f', config.fade.toString(),
      '-r', config.resolution,
      '-q', config.quality.toString(),
      inputPath,
      outputPath
    ];

    if (config.dryRun) {
      log.info(`[DRY-RUN] ${scriptPath} ${args.join(' ')}`);
      resolve({ input: inputPath, output: outputPath, effect });
      return;
    }

    const proc = spawn(scriptPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ input: inputPath, output: outputPath, effect });
      } else {
        reject(new Error(`Errore processando ${inputPath}: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Processa immagini in parallelo
 */
async function processInParallel(images, outputDir) {
  const results = [];
  const queue = [...images];
  const activePromises = new Map();

  let completed = 0;
  const total = images.length;

  const updateProgress = () => {
    const percent = Math.round((completed / total) * 100);
    log.progress(`${completed}/${total} video completati (${percent}%)`);
  };

  while (queue.length > 0 || activePromises.size > 0) {
    // Avvia nuovi processi fino al limite
    while (queue.length > 0 && activePromises.size < config.parallel) {
      const inputPath = queue.shift();
      const baseName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(outputDir, `${baseName}.mp4`);
      const effect = getEffect();

      const promise = animateImage(inputPath, outputPath, effect)
        .then(result => {
          results.push(result);
          completed++;
          updateProgress();
          activePromises.delete(promise);
          return result;
        })
        .catch(err => {
          log.error(err.message);
          activePromises.delete(promise);
        });

      activePromises.set(promise, inputPath);
    }

    // Aspetta che almeno uno finisca
    if (activePromises.size > 0) {
      await Promise.race(activePromises.keys());
    }
  }

  console.log(''); // Nuova riga dopo progress
  return results;
}

/**
 * Concatena tutti i video in uno solo usando ffmpeg
 */
async function concatenateVideos(videos, outputPath) {
  if (videos.length === 0) {
    log.warn('Nessun video da concatenare');
    return;
  }

  log.info(`Concatenazione di ${videos.length} video...`);

  if (config.dryRun) {
    log.info(`[DRY-RUN] Concatenerebbe in: ${outputPath}`);
    return;
  }

  // Crea file lista per ffmpeg
  const listPath = path.join(path.dirname(outputPath), '.concat_list.txt');
  const listContent = videos
    .map(v => `file '${v.output}'`)
    .join('\n');

  fs.writeFileSync(listPath, listContent);

  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, {
      stdio: 'pipe'
    });

    // Rimuovi file lista temporaneo
    fs.unlinkSync(listPath);

    const size = fs.statSync(outputPath).size;
    const sizeStr = size > 1024 * 1024
      ? `${(size / 1024 / 1024).toFixed(1)} MB`
      : `${(size / 1024).toFixed(1)} KB`;

    log.success(`Video concatenato creato: ${outputPath} (${sizeStr})`);
  } catch (err) {
    log.error(`Errore nella concatenazione: ${err.message}`);
    if (fs.existsSync(listPath)) {
      fs.unlinkSync(listPath);
    }
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }

  const { inputDir, outputDir: customOutputDir } = parseArgs(args);

  if (!inputDir) {
    log.error('Specifica la cartella di input');
    process.exit(1);
  }

  const outputDir = customOutputDir || path.join(inputDir, 'videos');

  // Trova immagini
  const images = findImages(inputDir);

  if (images.length === 0) {
    log.error(`Nessuna immagine trovata in: ${inputDir}`);
    log.info(`Estensioni supportate: ${IMAGE_EXTENSIONS.join(', ')}`);
    process.exit(1);
  }

  log.info(`Trovate ${images.length} immagini in: ${inputDir}`);
  log.info(`Output: ${outputDir}`);
  log.info(`Configurazione:`);
  log.info(`  Durata: ${config.duration}s`);
  log.info(`  Effetto: ${config.effect}`);
  log.info(`  Intensità: ${config.intensity}`);
  log.info(`  Risoluzione: ${config.resolution}`);
  log.info(`  Processi paralleli: ${config.parallel}`);
  if (config.concat) {
    log.info(`  Concatenazione: ${config.concatOutput}`);
  }

  // Crea cartella output se non esiste
  if (!config.dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Processa immagini
  const startTime = Date.now();
  const results = await processInParallel(images, outputDir);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  log.success(`Processate ${results.length} immagini in ${elapsed}s`);

  // Concatena se richiesto
  if (config.concat && results.length > 0) {
    const concatPath = path.join(outputDir, config.concatOutput);
    // Ordina per nome file originale
    results.sort((a, b) => a.input.localeCompare(b.input));
    await concatenateVideos(results, concatPath);
  }

  // Mostra riepilogo
  if (!config.dryRun) {
    console.log('\n--- Riepilogo ---');
    results.forEach(r => {
      const name = path.basename(r.output);
      console.log(`  ${colors.green}✓${colors.reset} ${name} (${r.effect})`);
    });
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
