#!/usr/bin/env node

/**
 * Post to Instagram - Workflow Completo
 *
 * Combina upload media su CDN + posting via Graph API in un unico comando.
 *
 * Uso:
 *   node post-to-instagram.js image /path/to/image.jpg "Caption del post"
 *   node post-to-instagram.js video /path/to/video.mp4 "Caption del post"
 *   node post-to-instagram.js carousel "/path/1.jpg,/path/2.jpg" "Caption del post"
 *
 * Task: social-ig-002
 * Data: 2026-01-09
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { uploadToR2, deleteFile } = require('./media-uploader');
const { postImage, postVideo, postCarousel, formatCaption } = require('./instagram-poster');

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const CONFIG = {
  // Pulizia automatica file dopo posting
  cleanupAfterPost: true,

  // Ritardo tra upload e post (per propagazione CDN)
  cdnPropagationDelayMs: 2000,

  // Directory temporanea per file processati
  tempDir: path.resolve(__dirname, '../../../.tmp/instagram'),
};

// ============================================================================
// WORKFLOW FUNCTIONS
// ============================================================================

/**
 * Post singola immagine (upload + publish)
 */
async function postImageComplete(imagePath, caption) {
  console.log('\n========================================');
  console.log('[WORKFLOW: POST IMMAGINE]');
  console.log('========================================\n');

  // Step 1: Verifica file
  if (!fs.existsSync(imagePath)) {
    throw new Error(`File non trovato: ${imagePath}`);
  }

  console.log(`File: ${imagePath}`);
  console.log(`Caption: ${caption.slice(0, 50)}...`);

  // Step 2: Upload su CDN
  console.log('\n[1/3] Upload su CDN...');
  const uploadResult = await uploadToR2(imagePath);

  // Step 3: Attendi propagazione CDN
  console.log(`\n[2/3] Attendo propagazione CDN (${CONFIG.cdnPropagationDelayMs}ms)...`);
  await sleep(CONFIG.cdnPropagationDelayMs);

  // Step 4: Pubblica su Instagram
  console.log('\n[3/3] Pubblicazione su Instagram...');
  const postResult = await postImage(uploadResult.publicUrl, caption);

  // Step 5: Cleanup (opzionale)
  if (CONFIG.cleanupAfterPost) {
    console.log('\n[Cleanup] Rimozione file da CDN...');
    try {
      await deleteFile(uploadResult.fileName);
    } catch (e) {
      console.warn('  Warning: Cleanup fallito (ignorato)');
    }
  }

  console.log('\n========================================');
  console.log('[SUCCESSO] Post pubblicato!');
  console.log('========================================');
  console.log(`\nPermalink: ${postResult.permalink}`);

  return postResult;
}

/**
 * Post video/reel (upload + publish)
 */
async function postVideoComplete(videoPath, caption) {
  console.log('\n========================================');
  console.log('[WORKFLOW: POST VIDEO/REEL]');
  console.log('========================================\n');

  // Step 1: Verifica file
  if (!fs.existsSync(videoPath)) {
    throw new Error(`File non trovato: ${videoPath}`);
  }

  const stats = fs.statSync(videoPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`File: ${videoPath}`);
  console.log(`Dimensione: ${sizeMB}MB`);
  console.log(`Caption: ${caption.slice(0, 50)}...`);

  // Step 2: Upload su CDN
  console.log('\n[1/3] Upload su CDN...');
  const uploadResult = await uploadToR2(videoPath);

  // Step 3: Attendi propagazione CDN (piu' lungo per video)
  const videoDelay = CONFIG.cdnPropagationDelayMs * 2;
  console.log(`\n[2/3] Attendo propagazione CDN (${videoDelay}ms)...`);
  await sleep(videoDelay);

  // Step 4: Pubblica su Instagram (include wait per processing)
  console.log('\n[3/3] Pubblicazione su Instagram...');
  console.log('  (I video richiedono processing - potrebbe richiedere alcuni minuti)');
  const postResult = await postVideo(uploadResult.publicUrl, caption);

  // Step 5: Cleanup (opzionale)
  if (CONFIG.cleanupAfterPost) {
    console.log('\n[Cleanup] Rimozione file da CDN...');
    try {
      await deleteFile(uploadResult.fileName);
    } catch (e) {
      console.warn('  Warning: Cleanup fallito (ignorato)');
    }
  }

  console.log('\n========================================');
  console.log('[SUCCESSO] Video pubblicato!');
  console.log('========================================');
  console.log(`\nPermalink: ${postResult.permalink}`);

  return postResult;
}

/**
 * Post carousel (upload multipli + publish)
 */
async function postCarouselComplete(imagePaths, caption) {
  console.log('\n========================================');
  console.log('[WORKFLOW: POST CAROUSEL]');
  console.log('========================================\n');

  // Step 1: Verifica file
  const paths = imagePaths.split(',').map((p) => p.trim());

  if (paths.length < 2) {
    throw new Error('Carousel richiede almeno 2 immagini');
  }

  if (paths.length > 10) {
    throw new Error('Carousel supporta massimo 10 immagini');
  }

  console.log(`Immagini: ${paths.length}`);
  console.log(`Caption: ${caption.slice(0, 50)}...`);

  for (const p of paths) {
    if (!fs.existsSync(p)) {
      throw new Error(`File non trovato: ${p}`);
    }
  }

  // Step 2: Upload tutti i file su CDN
  console.log('\n[1/3] Upload immagini su CDN...');
  const uploadResults = [];

  for (let i = 0; i < paths.length; i++) {
    console.log(`\n  Immagine ${i + 1}/${paths.length}:`);
    const result = await uploadToR2(paths[i]);
    uploadResults.push(result);
  }

  // Step 3: Attendi propagazione CDN
  console.log(`\n[2/3] Attendo propagazione CDN (${CONFIG.cdnPropagationDelayMs}ms)...`);
  await sleep(CONFIG.cdnPropagationDelayMs);

  // Step 4: Pubblica su Instagram
  console.log('\n[3/3] Pubblicazione carousel su Instagram...');
  const urls = uploadResults.map((r) => r.publicUrl);
  const postResult = await postCarousel(urls, caption);

  // Step 5: Cleanup (opzionale)
  if (CONFIG.cleanupAfterPost) {
    console.log('\n[Cleanup] Rimozione file da CDN...');
    for (const result of uploadResults) {
      try {
        await deleteFile(result.fileName);
      } catch (e) {
        console.warn(`  Warning: Cleanup ${result.fileName} fallito (ignorato)`);
      }
    }
  }

  console.log('\n========================================');
  console.log('[SUCCESSO] Carousel pubblicato!');
  console.log('========================================');
  console.log(`\nPermalink: ${postResult.permalink}`);

  return postResult;
}

// ============================================================================
// UTILITY
// ============================================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const filePath = args[1];
  const caption = args[2];

  // Verifica configurazione base
  const requiredEnvVars = [
    'INSTAGRAM_BUSINESS_ACCOUNT_ID',
    'INSTAGRAM_ACCESS_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY',
    'CLOUDFLARE_R2_SECRET_KEY',
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('[ERRORE] Mancano variabili ambiente:');
    missingVars.forEach((v) => console.error(`  - ${v}`));
    console.error('\nConfigura in .env file');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'image':
        if (!filePath || !caption) {
          console.error('Uso: node post-to-instagram.js image /path/to/image.jpg "Caption"');
          process.exit(1);
        }
        await postImageComplete(filePath, caption);
        break;

      case 'video':
        if (!filePath || !caption) {
          console.error('Uso: node post-to-instagram.js video /path/to/video.mp4 "Caption"');
          process.exit(1);
        }
        await postVideoComplete(filePath, caption);
        break;

      case 'carousel':
        if (!filePath || !caption) {
          console.error(
            'Uso: node post-to-instagram.js carousel "/path/1.jpg,/path/2.jpg" "Caption"'
          );
          process.exit(1);
        }
        await postCarouselComplete(filePath, caption);
        break;

      default:
        console.log(`
Post to Instagram - Workflow Completo
=====================================

Combina upload media su CDN + posting via Meta Graph API.

Comandi:

  image /path/image.jpg "Caption"
    Pubblica singola immagine

  video /path/video.mp4 "Caption"
    Pubblica video/reel

  carousel "/path/1.jpg,/path/2.jpg,..." "Caption"
    Pubblica carousel (2-10 immagini)

Esempi:

  node post-to-instagram.js image ~/Downloads/copertina.jpg "Nuovo libro! Scopri di piu' sul link in bio."

  node post-to-instagram.js video ~/Downloads/reel.mp4 "Dietro le quinte della produzione..."

  node post-to-instagram.js carousel "~/a.jpg,~/b.jpg,~/c.jpg" "Una serie di illustrazioni..."

Note:
  - I file vengono caricati su Cloudflare R2 come CDN temporaneo
  - Dopo la pubblicazione, i file vengono rimossi dal CDN
  - Credits "Pina Pennello con @grok" vengono aggiunti automaticamente

Configurazione richiesta in .env:
  # Instagram Graph API
  INSTAGRAM_BUSINESS_ACCOUNT_ID
  INSTAGRAM_ACCESS_TOKEN

  # Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_R2_ACCESS_KEY
  CLOUDFLARE_R2_SECRET_KEY
  CLOUDFLARE_R2_BUCKET (default: onde-media)
        `);
    }
  } catch (error) {
    console.error('\n[ERRORE]', error.message);
    process.exit(1);
  }
}

// Export per uso come modulo
module.exports = {
  postImageComplete,
  postVideoComplete,
  postCarouselComplete,
};

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}
