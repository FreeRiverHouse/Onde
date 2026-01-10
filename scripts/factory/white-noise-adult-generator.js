#!/usr/bin/env node
/**
 * WHITE NOISE VIDEO GENERATOR - ADULT VERSION
 *
 * Genera video 8 ore con:
 * - White noise audio continuo
 * - Sfondo SCURO (per chi dorme)
 * - Mindfulness/psychology tips
 *
 * Requisiti:
 * - FFmpeg installato
 * - ImageMagick installato (per testo su immagini)
 *
 * Come usare:
 *   node scripts/factory/white-noise-adult-generator.js --test
 *   node scripts/factory/white-noise-adult-generator.js --full
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readdirSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// ═══════════════════════════════════════════════════════════
// CONFIGURAZIONE - ADULT VERSION (SFONDO SCURO)
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  outputDir: join(PROJECT_ROOT, 'output/white-noise-adult'),
  tipsFile: join(PROJECT_ROOT, 'content/white-noise/adult-mindfulness-tips.md'),
  backgroundsDir: join(PROJECT_ROOT, 'assets/backgrounds/dark'),

  // Video settings
  videoDuration: 8 * 60 * 60, // 8 ore in secondi
  tipDuration: 60, // secondi per tip (più lento per adulti)
  resolution: '1920x1080',
  fps: 1,

  // Visual settings - DARK THEME
  backgroundColor: '#0D0D0D', // Very dark gray (not pure black)
  textColor: '#E8E8E8', // Soft white (less harsh)
  accentColor: '#4A90A4', // Calming blue
  fontFamily: 'Georgia',
};

// ═══════════════════════════════════════════════════════════
// PARSING TIPS
// ═══════════════════════════════════════════════════════════

function parseTips(filePath) {
  if (!existsSync(filePath)) {
    console.error('File tips non trovato:', filePath);
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  const tips = [];

  // Formato MULTILINGUAL: 🇬🇧 "testo in inglese"
  const multilingualRegex = /🇬🇧\s*"([^"]+)"/g;
  let match;

  while ((match = multilingualRegex.exec(content)) !== null) {
    tips.push(match[1]);
  }

  // Fallback: formato standard numero. "testo"
  if (tips.length === 0) {
    const tipRegex = /^\d+\.\s*[""'](.+?)[""']\s*$/gm;
    while ((match = tipRegex.exec(content)) !== null) {
      tips.push(match[1]);
    }
  }

  console.log(`Trovati ${tips.length} tips`);
  return tips;
}

// ═══════════════════════════════════════════════════════════
// GENERA IMMAGINE CON TESTO (ImageMagick) - DARK THEME
// ═══════════════════════════════════════════════════════════

function generateTipImage(tip, tipNumber, outputPath) {
  const width = 1920;
  const height = 1080;

  // Escape quotes for shell
  const escapedTip = tip.replace(/"/g, '\\"').replace(/'/g, "'\\''");

  // Crea immagine con ImageMagick - sfondo SCURO + testo chiaro
  const cmd = `convert -size ${width}x${height} xc:"${CONFIG.backgroundColor}" \
    -gravity center \
    -fill "${CONFIG.textColor}" \
    -font "Georgia" \
    -pointsize 44 \
    -annotate 0 "${escapedTip}" \
    -gravity south \
    -fill "${CONFIG.accentColor}" \
    -pointsize 24 \
    -annotate +0+60 "Mindfulness | Sleep" \
    "${outputPath}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`Errore generazione immagine tip ${tipNumber}:`, err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// GENERA WHITE NOISE AUDIO
// ═══════════════════════════════════════════════════════════

function generateWhiteNoise(duration, outputPath) {
  console.log(`Generando ${duration/3600} ore di white noise...`);

  // Genera white noise con FFmpeg - volume più basso per adulti
  const cmd = `ffmpeg -y -f lavfi -i "anoisesrc=d=${duration}:c=white:r=44100:a=0.4" \
    -c:a libmp3lame -b:a 128k \
    "${outputPath}"`;

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 600000 }); // 10 min timeout
    console.log('White noise generato:', outputPath);
    return true;
  } catch (err) {
    console.error('Errore generazione white noise:', err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// GENERA VIDEO COMPLETO
// ═══════════════════════════════════════════════════════════

async function generateVideo(tips, outputName) {
  const workDir = join(CONFIG.outputDir, 'temp');
  const imagesDir = join(workDir, 'images');
  const audioPath = join(workDir, 'white-noise.mp3');
  const videoPath = join(CONFIG.outputDir, `${outputName}.mp4`);

  // Crea directories
  mkdirSync(imagesDir, { recursive: true });

  console.log('═══════════════════════════════════════════════════════');
  console.log('WHITE NOISE GENERATOR - ADULT VERSION (DARK THEME)');
  console.log('═══════════════════════════════════════════════════════');

  // 1. Genera immagini per ogni tip
  console.log('\n1. Generando immagini tips...');
  const numTips = tips.length;
  const tipsNeeded = Math.ceil(CONFIG.videoDuration / CONFIG.tipDuration);

  for (let i = 0; i < Math.min(tipsNeeded, numTips); i++) {
    const tipIndex = i % numTips;
    const imagePath = join(imagesDir, `tip_${String(i).padStart(4, '0')}.png`);

    if (generateTipImage(tips[tipIndex], tipIndex + 1, imagePath)) {
      process.stdout.write(`\r  Tip ${i + 1}/${tipsNeeded}`);
    }
  }
  console.log('\n  ✅ Immagini generate');

  // 2. Genera white noise audio
  console.log('\n2. Generando white noise audio...');
  if (!existsSync(audioPath)) {
    generateWhiteNoise(CONFIG.videoDuration, audioPath);
  } else {
    console.log('  ✅ White noise già esistente');
  }

  // 3. Crea video da sequenza immagini + audio
  console.log('\n3. Assemblando video finale...');

  // Crea file concat per FFmpeg
  const concatFile = join(workDir, 'concat.txt');
  let concatContent = '';

  for (let i = 0; i < tipsNeeded; i++) {
    const tipIndex = i % Math.min(tipsNeeded, numTips);
    const imagePath = join(imagesDir, `tip_${String(tipIndex).padStart(4, '0')}.png`);
    concatContent += `file '${imagePath}'\n`;
    concatContent += `duration ${CONFIG.tipDuration}\n`;
  }
  writeFileSync(concatFile, concatContent);

  // Assembla video
  const ffmpegCmd = `ffmpeg -y \
    -f concat -safe 0 -i "${concatFile}" \
    -i "${audioPath}" \
    -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 128k \
    -shortest \
    -pix_fmt yuv420p \
    "${videoPath}"`;

  try {
    console.log('  Assemblaggio in corso (può richiedere diversi minuti)...');
    execSync(ffmpegCmd, { stdio: 'inherit', timeout: 3600000 }); // 1 ora timeout
    console.log(`\n✅ Video creato: ${videoPath}`);
    return videoPath;
  } catch (err) {
    console.error('Errore assemblaggio video:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// GENERA VIDEO BREVE (TEST)
// ═══════════════════════════════════════════════════════════

async function generateTestVideo(tips) {
  console.log('\n🧪 Generando video TEST (5 minuti)...\n');

  // Override config per test
  const originalDuration = CONFIG.videoDuration;
  CONFIG.videoDuration = 5 * 60; // 5 minuti

  const result = await generateVideo(tips.slice(0, 10), 'test-mindful-sleep-5min');

  CONFIG.videoDuration = originalDuration;
  return result;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  // Crea output directory
  mkdirSync(CONFIG.outputDir, { recursive: true });

  // Parse tips
  const tips = parseTips(CONFIG.tipsFile);

  if (tips.length === 0) {
    console.error('Nessun tip trovato! Verifica il file:', CONFIG.tipsFile);
    process.exit(1);
  }

  console.log(`\n📝 Caricati ${tips.length} tips mindfulness/psicologia\n`);

  if (args.includes('--test')) {
    // Genera video test di 5 minuti
    await generateTestVideo(tips);
  } else if (args.includes('--full')) {
    // Genera video completo 8 ore
    await generateVideo(tips, 'mindful-sleep-sounds-8h');
  } else {
    console.log(`
WHITE NOISE GENERATOR - ADULT VERSION

Uso:
  node white-noise-adult-generator.js --test    # Video test 5 minuti
  node white-noise-adult-generator.js --full    # Video completo 8 ore

Requisiti:
  - FFmpeg: brew install ffmpeg
  - ImageMagick: brew install imagemagick

Tips caricati: ${tips.length}
Output: ${CONFIG.outputDir}

DIFFERENZE dalla versione baby:
  - Sfondo SCURO (#0D0D0D) invece di crema
  - Tips più lenti (60 sec invece di 45)
  - Volume white noise più basso
  - Font leggermente più piccolo
`);
  }
}

main().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
