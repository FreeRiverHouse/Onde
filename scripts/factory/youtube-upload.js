#!/usr/bin/env node
/**
 * YOUTUBE UPLOAD - Upload programmatico
 *
 * Usa YouTube Data API v3 per caricare video automaticamente.
 *
 * Setup richiesto:
 * 1. Creare progetto su Google Cloud Console
 * 2. Abilitare YouTube Data API v3
 * 3. Creare OAuth 2.0 credentials
 * 4. Salvare client_secret.json in questo folder
 *
 * Limiti YouTube:
 * - Canale nuovo: ~6 video/giorno
 * - Canale verificato: ~100 video/giorno
 * - Per evitare spam: variare titoli, thumbnail, descrizioni
 *
 * Come usare:
 *   node youtube-upload.js --video path/to/video.mp4 --title "Titolo" --description "Desc"
 */

import { google } from 'googleapis';
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════
// CONFIGURAZIONE
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  credentialsPath: join(__dirname, 'client_secret.json'),
  tokenPath: join(__dirname, 'youtube_token.json'),
  scopes: ['https://www.googleapis.com/auth/youtube.upload'],

  // Default per video Onde
  defaults: {
    categoryId: '27',  // Education
    privacyStatus: 'public',  // o 'unlisted' per test
    tags: ['bambini', 'educativo', 'italiano', 'onde'],
    defaultLanguage: 'it',
    license: 'youtube'
  }
};

// ═══════════════════════════════════════════════════════════
// AUTENTICAZIONE OAUTH
// ═══════════════════════════════════════════════════════════

async function authorize() {
  if (!existsSync(CONFIG.credentialsPath)) {
    console.error(`
╔═══════════════════════════════════════════════════════════╗
║  SETUP RICHIESTO - YouTube API                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  1. Vai su: https://console.cloud.google.com              ║
║  2. Crea nuovo progetto "Onde YouTube"                    ║
║  3. Abilita "YouTube Data API v3"                         ║
║  4. Crea credenziali OAuth 2.0 (Desktop app)              ║
║  5. Scarica JSON e salvalo come:                          ║
║     ${CONFIG.credentialsPath}
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }

  const credentials = JSON.parse(readFileSync(CONFIG.credentialsPath));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Controlla se abbiamo già un token salvato
  if (existsSync(CONFIG.tokenPath)) {
    const token = JSON.parse(readFileSync(CONFIG.tokenPath));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Altrimenti, richiedi autorizzazione
  return getNewToken(oAuth2Client);
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: CONFIG.scopes,
  });

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  AUTORIZZAZIONE YOUTUBE RICHIESTA                        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  1. Apri questo URL nel browser:                          ║
║                                                           ║
║  ${authUrl}
║                                                           ║
║  2. Autorizza l'app                                       ║
║  3. Copia il codice e incollalo qui sotto                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Inserisci il codice: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Salva token per usi futuri
        writeFileSync(CONFIG.tokenPath, JSON.stringify(tokens));
        console.log('✅ Token salvato in:', CONFIG.tokenPath);

        resolve(oAuth2Client);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════
// UPLOAD VIDEO
// ═══════════════════════════════════════════════════════════

async function uploadVideo(auth, options) {
  const youtube = google.youtube({ version: 'v3', auth });

  const {
    videoPath,
    title,
    description,
    tags = CONFIG.defaults.tags,
    categoryId = CONFIG.defaults.categoryId,
    privacyStatus = CONFIG.defaults.privacyStatus,
    thumbnailPath = null
  } = options;

  if (!existsSync(videoPath)) {
    throw new Error(`Video non trovato: ${videoPath}`);
  }

  console.log(`
📤 Uploading: ${basename(videoPath)}
   Titolo: ${title}
   Privacy: ${privacyStatus}
`);

  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId,
        defaultLanguage: CONFIG.defaults.defaultLanguage,
      },
      status: {
        privacyStatus,
        license: CONFIG.defaults.license,
        embeddable: true,
        publicStatsViewable: true,
      },
    },
    media: {
      body: createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  console.log(`✅ Video caricato! ID: ${videoId}`);
  console.log(`   URL: https://youtube.com/watch?v=${videoId}`);

  // Upload thumbnail se fornita
  if (thumbnailPath && existsSync(thumbnailPath)) {
    console.log('📷 Uploading thumbnail...');
    await youtube.thumbnails.set({
      videoId,
      media: {
        body: createReadStream(thumbnailPath),
      },
    });
    console.log('✅ Thumbnail caricata!');
  }

  return {
    videoId,
    url: `https://youtube.com/watch?v=${videoId}`,
  };
}

// ═══════════════════════════════════════════════════════════
// BATCH UPLOAD
// ═══════════════════════════════════════════════════════════

async function batchUpload(auth, videos) {
  const results = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    console.log(`\n[${i + 1}/${videos.length}] Processing: ${video.title}`);

    try {
      const result = await uploadVideo(auth, video);
      results.push({ ...video, ...result, status: 'success' });

      // Pausa tra upload per evitare rate limiting
      if (i < videos.length - 1) {
        console.log('⏳ Pausa 30 secondi...');
        await new Promise(r => setTimeout(r, 30000));
      }
    } catch (err) {
      console.error(`❌ Errore: ${err.message}`);
      results.push({ ...video, status: 'error', error: err.message });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
ONDE YouTube Upload

Uso:
  node youtube-upload.js --video <path> --title <title> [options]

Opzioni:
  --video       Path al file video (obbligatorio)
  --title       Titolo del video (obbligatorio)
  --description Descrizione
  --tags        Tags separati da virgola
  --thumbnail   Path alla thumbnail
  --privacy     public, unlisted, private (default: public)
  --batch       Path a JSON con lista video da caricare

Esempi:
  node youtube-upload.js --video output/emilio-ep1.mp4 --title "EMILIO Ep.1"

  node youtube-upload.js --batch videos-to-upload.json
`);
    return;
  }

  // Autenticazione
  console.log('🔐 Autenticazione YouTube...');
  const auth = await authorize();
  console.log('✅ Autenticato!\n');

  // Batch upload
  if (args.includes('--batch')) {
    const batchIndex = args.indexOf('--batch');
    const batchPath = args[batchIndex + 1];

    if (!existsSync(batchPath)) {
      console.error(`File batch non trovato: ${batchPath}`);
      process.exit(1);
    }

    const videos = JSON.parse(readFileSync(batchPath));
    const results = await batchUpload(auth, videos);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('RISULTATI BATCH UPLOAD');
    console.log('═══════════════════════════════════════════════════════');
    results.forEach(r => {
      if (r.status === 'success') {
        console.log(`✅ ${r.title} → ${r.url}`);
      } else {
        console.log(`❌ ${r.title} → ${r.error}`);
      }
    });

    return;
  }

  // Single upload
  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx > -1 ? args[idx + 1] : null;
  };

  const videoPath = getArg('--video');
  const title = getArg('--title');

  if (!videoPath || !title) {
    console.error('❌ --video e --title sono obbligatori');
    process.exit(1);
  }

  const result = await uploadVideo(auth, {
    videoPath,
    title,
    description: getArg('--description') || '',
    tags: getArg('--tags')?.split(',') || CONFIG.defaults.tags,
    thumbnailPath: getArg('--thumbnail'),
    privacyStatus: getArg('--privacy') || 'public',
  });

  console.log('\n✅ Upload completato!');
  console.log(`   URL: ${result.url}`);
}

main().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
