#!/usr/bin/env node
/**
 * upload-short.js - Carica un video su YouTube come Short
 *
 * NOTA: Richiede OAuth2 configurato con YouTube Data API v3
 *
 * Setup:
 *   1. Crea progetto su Google Cloud Console
 *   2. Abilita YouTube Data API v3
 *   3. Crea credenziali OAuth2 (Desktop app)
 *   4. Scarica credentials.json in questa cartella
 *   5. Esegui: node upload-short.js --auth (prima volta)
 *
 * Uso:
 *   node upload-short.js <video> [opzioni]
 *
 * Opzioni:
 *   --title <text>          Titolo del video (obbligatorio)
 *   --description <text>    Descrizione
 *   --tags <t1,t2,t3>       Tag separati da virgola
 *   --privacy <p>           public, unlisted, private (default: private)
 *   --auth                  Esegui autenticazione OAuth2
 *   -h, --help              Mostra questo help
 *
 * Esempio:
 *   node upload-short.js short.mp4 --title "Stella Stellina" --privacy public
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = path.join(__dirname, 'youtube-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'youtube-credentials.json');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERRORE]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
};

// Parse argomenti
function parseArgs(args) {
  const options = {
    videoPath: null,
    title: null,
    description: '',
    tags: [],
    privacy: 'private',
    auth: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      case '--title':
        options.title = next;
        i++;
        break;
      case '--description':
        options.description = next;
        i++;
        break;
      case '--tags':
        options.tags = next.split(',').map(t => t.trim());
        i++;
        break;
      case '--privacy':
        options.privacy = next;
        i++;
        break;
      case '--auth':
        options.auth = true;
        break;
      default:
        if (!arg.startsWith('-') && !options.videoPath) {
          options.videoPath = arg;
        }
    }
  }

  return options;
}

function showHelp() {
  console.log(`
upload-short.js - Carica video su YouTube come Short

Uso:
  node upload-short.js <video> [opzioni]

Opzioni:
  --title <text>          Titolo del video (obbligatorio)
  --description <text>    Descrizione
  --tags <t1,t2,t3>       Tag separati da virgola
  --privacy <p>           public, unlisted, private (default: private)
  --auth                  Esegui autenticazione OAuth2
  -h, --help              Mostra questo help

Setup iniziale:
  1. Crea progetto su Google Cloud Console
  2. Abilita YouTube Data API v3
  3. Crea credenziali OAuth2 (Desktop app)
  4. Salva come youtube-credentials.json in questa cartella
  5. Esegui: node upload-short.js --auth

Esempio:
  node upload-short.js short.mp4 --title "Stella Stellina" --privacy public --tags "poesia,bambini"
`);
}

// Autenticazione OAuth2
async function authorize() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    log.error(`File credenziali non trovato: ${CREDENTIALS_PATH}`);
    log.info('Scarica le credenziali OAuth2 da Google Cloud Console');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Controlla se abbiamo già un token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Ottieni nuovo token
  return getNewToken(oAuth2Client);
}

function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    log.info('Apri questo URL nel browser per autorizzare:');
    console.log(`\n${authUrl}\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Inserisci il codice dalla pagina: ', async (code) => {
      rl.close();

      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        log.success('Token salvato!');

        resolve(oAuth2Client);
      } catch (err) {
        reject(new Error(`Errore ottenendo token: ${err.message}`));
      }
    });
  });
}

// Upload video
async function uploadVideo(auth, options) {
  const youtube = google.youtube({ version: 'v3', auth });

  const fileSize = fs.statSync(options.videoPath).size;

  log.info(`Caricamento: ${path.basename(options.videoPath)} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
  log.info(`Titolo: ${options.title}`);
  log.info(`Privacy: ${options.privacy}`);

  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: options.title,
        description: options.description + '\n\n#Shorts',
        tags: options.tags,
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: options.privacy,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(options.videoPath),
    },
  }, {
    onUploadProgress: (evt) => {
      const pct = Math.round((evt.bytesRead / fileSize) * 100);
      process.stdout.write(`\r${colors.blue}[UPLOAD]${colors.reset} ${pct}%`);
    },
  });

  console.log('');
  return res.data;
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }

  const options = parseArgs(args);

  // Solo autenticazione
  if (options.auth) {
    log.info('Avvio autenticazione OAuth2...');
    await authorize();
    log.success('Autenticazione completata!');
    process.exit(0);
  }

  // Validazione
  if (!options.videoPath) {
    log.error('Specifica il file video');
    process.exit(1);
  }

  if (!fs.existsSync(options.videoPath)) {
    log.error(`Video non trovato: ${options.videoPath}`);
    process.exit(1);
  }

  if (!options.title) {
    log.error('Titolo obbligatorio (--title)');
    process.exit(1);
  }

  try {
    const auth = await authorize();
    const result = await uploadVideo(auth, options);

    log.success('Video caricato!');
    console.log(`  ID: ${result.id}`);
    console.log(`  URL: https://youtube.com/shorts/${result.id}`);
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }
}

main();
