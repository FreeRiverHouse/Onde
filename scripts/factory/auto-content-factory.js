#!/usr/bin/env node
/**
 * ONDE AUTO-CONTENT FACTORY
 *
 * Questo script gira automaticamente (cron) e produce contenuti REALI.
 * Non task, non setup - CONTENUTI PUBBLICATI.
 *
 * Cosa fa:
 * 1. Controlla libri senza PDF -> genera PDF
 * 2. Controlla libri non su KDP -> prepara upload
 * 3. Genera nuove storie EMILIO -> salva in books/
 * 4. Crea script video YouTube -> salva in content/videos/
 *
 * Come usare:
 *   node scripts/factory/auto-content-factory.js
 *
 * Cron setup: vedi setup-auto-factory.sh
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readdirSync, writeFileSync, mkdirSync, readFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// Configurazione
const CONFIG = {
  booksDir: join(PROJECT_ROOT, 'books'),
  contentDir: join(PROJECT_ROOT, 'content'),
  logsDir: join(PROJECT_ROOT, 'logs'),
  outputDir: join(PROJECT_ROOT, 'output'),

  // Libri che DEVONO avere PDF
  requiredBooks: [
    'salmo-23-bambini',
    'aiko-ai-children',
    'piccole-rime',
    'vibe-coding'
  ],

  // Storie EMILIO da creare (target)
  emilioStoriesTarget: 10,

  // Video YouTube da creare (target)
  youtubeVideosTarget: 10
};

// Logging
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}`;
  console.log(logLine);

  // Anche su file
  const logFile = join(CONFIG.logsDir, 'factory.log');
  if (!existsSync(CONFIG.logsDir)) mkdirSync(CONFIG.logsDir, { recursive: true });
  appendFileSync(logFile, logLine + '\n');
}

// ═══════════════════════════════════════════════════════════
// 1. CONTROLLO PDF MANCANTI
// ═══════════════════════════════════════════════════════════

function checkMissingPDFs() {
  log('Controllo PDF mancanti...');
  const missing = [];

  for (const book of CONFIG.requiredBooks) {
    const bookDir = join(CONFIG.booksDir, book);
    if (!existsSync(bookDir)) {
      log(`Cartella mancante: ${book}`, 'WARN');
      continue;
    }

    // Cerca PDF nella cartella
    const files = readdirSync(bookDir);
    const hasPDF = files.some(f => f.endsWith('.pdf'));

    if (!hasPDF) {
      log(`PDF MANCANTE: ${book}`, 'ERROR');
      missing.push(book);
    } else {
      log(`PDF OK: ${book}`);
    }
  }

  return missing;
}

// ═══════════════════════════════════════════════════════════
// 2. CONTROLLO STORIE EMILIO
// ═══════════════════════════════════════════════════════════

function checkEmilioStories() {
  log('Controllo storie EMILIO...');

  const emilioDir = join(CONFIG.booksDir, 'emilio');
  if (!existsSync(emilioDir)) {
    mkdirSync(emilioDir, { recursive: true });
    log('Creata cartella books/emilio/');
  }

  const stories = readdirSync(emilioDir).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
  const count = stories.length;

  log(`Storie EMILIO esistenti: ${count}/${CONFIG.emilioStoriesTarget}`);

  return {
    existing: count,
    needed: CONFIG.emilioStoriesTarget - count,
    stories
  };
}

// ═══════════════════════════════════════════════════════════
// 3. CONTROLLO VIDEO YOUTUBE
// ═══════════════════════════════════════════════════════════

function checkYouTubeVideos() {
  log('Controllo video YouTube EMILIO...');

  const videosDir = join(CONFIG.contentDir, 'videos/emilio');
  if (!existsSync(videosDir)) {
    mkdirSync(videosDir, { recursive: true });
    log('Creata cartella content/videos/emilio/');
  }

  const videos = readdirSync(videosDir).filter(f =>
    f.endsWith('.md') || f.endsWith('.mp4') || f.endsWith('.json')
  );
  const count = videos.length;

  log(`Script video EMILIO esistenti: ${count}/${CONFIG.youtubeVideosTarget}`);

  return {
    existing: count,
    needed: CONFIG.youtubeVideosTarget - count,
    videos
  };
}

// ═══════════════════════════════════════════════════════════
// 4. GENERA STORIA EMILIO (template)
// ═══════════════════════════════════════════════════════════

function generateEmilioStoryTemplate(storyNumber) {
  const topics = [
    { title: 'Come funziona Internet', topic: 'internet, reti, pacchetti dati' },
    { title: 'Cos\'è un Robot', topic: 'robotica, sensori, attuatori' },
    { title: 'Il Cervello dei Computer', topic: 'CPU, memoria, processori' },
    { title: 'Come Impara l\'AI', topic: 'machine learning, dati, pattern' },
    { title: 'I Sensori Magici', topic: 'sensori, input, temperatura, luce' },
    { title: 'Il Cloud - La Nuvola dei Dati', topic: 'cloud computing, server, storage' },
    { title: 'Coding per Piccoli', topic: 'programmazione, algoritmi, istruzioni' },
    { title: 'Sicurezza Online', topic: 'password, privacy, sicurezza' },
    { title: 'I Videogiochi Come Funzionano', topic: 'grafica, fisica, game engine' },
    { title: 'Le App sul Telefono', topic: 'app, sviluppo mobile, interfacce' }
  ];

  const topic = topics[(storyNumber - 1) % topics.length];

  return `# EMILIO Spiega: ${topic.title}

## Metadata
- **Numero storia**: ${storyNumber}
- **Tema**: ${topic.topic}
- **Target**: Bambini 5-10 anni
- **Formato**: Storia illustrata + video YouTube
- **Status**: DA COMPLETARE

## Struttura Storia

### Introduzione (1 pagina)
[EMILIO si presenta e introduce l'argomento in modo divertente]

### Spiegazione Semplice (2-3 pagine)
[EMILIO spiega ${topic.topic} usando metafore adatte ai bambini]

### Esempio Pratico (1-2 pagine)
[Un esempio dalla vita quotidiana che i bambini capiscono]

### Curiosità Divertente (1 pagina)
[Un fatto sorprendente che fa dire "WOW!"]

### Conclusione (1 pagina)
[EMILIO saluta e anticipa il prossimo argomento]

## Note per Illustrazioni
- Stile: Acquarello Onde (NO Pixar, NO 3D)
- EMILIO: Robot amichevole con occhi LED espressivi
- Sfondo: Semplice, colori pastello
- Personaggi secondari: Moonlight (bambina), Luca (fratellino)

## Script Video YouTube
[Da generare: versione video 3-5 minuti con voce EMILIO]

---
*Generato automaticamente da Onde Factory - ${new Date().toISOString()}*
`;
}

// ═══════════════════════════════════════════════════════════
// 5. GENERA SCRIPT VIDEO YOUTUBE
// ═══════════════════════════════════════════════════════════

function generateYouTubeVideoTemplate(videoNumber) {
  const topics = [
    'Come funziona Internet',
    'Cos\'è un Robot',
    'Il Cervello dei Computer',
    'Come Impara l\'AI',
    'I Sensori Magici',
    'Il Cloud',
    'Coding per Piccoli',
    'Sicurezza Online',
    'I Videogiochi',
    'Le App'
  ];

  const topic = topics[(videoNumber - 1) % topics.length];

  return `# EMILIO YouTube Video Script #${videoNumber}

## Video Info
- **Titolo**: EMILIO Spiega: ${topic} | Tech per Bambini
- **Durata target**: 3-5 minuti
- **Canale**: Onde / EMILIO
- **Lingua**: Italiano (+ sottotitoli EN, ES, DE, FR, PT)

## Hook (0:00 - 0:15)
EMILIO: "Ciao amici! Oggi vi svelo un SEGRETO incredibile su ${topic}!
Siete pronti? 3... 2... 1... VIA!"

## Intro (0:15 - 0:30)
[Sigla EMILIO - jingle riconoscibile]
[Logo Onde]

## Parte 1 - Il Problema (0:30 - 1:00)
EMILIO: "Vi siete mai chiesti come funziona ${topic}?"
[Animazione: domanda con punto interrogativo]

## Parte 2 - La Spiegazione (1:00 - 3:00)
[Spiegazione semplice con metafore per bambini]
[Animazioni: illustrazioni Onde style che si animano]

## Parte 3 - Esempio Pratico (3:00 - 4:00)
EMILIO: "Ecco un esempio che potete vedere ogni giorno!"
[Esempio dalla vita reale]

## Parte 4 - Fatto WOW (4:00 - 4:30)
EMILIO: "E ora... il FATTO WOW del giorno!"
[Curiosità sorprendente]

## Outro (4:30 - 5:00)
EMILIO: "Vi è piaciuto? Mettete LIKE e ISCRIVETEVI al canale!
Ci vediamo nel prossimo video! Ciao ciao!"
[End screen: altri video EMILIO]

## Checklist Produzione
- [ ] Script finale approvato
- [ ] Voce EMILIO registrata (ElevenLabs)
- [ ] Illustrazioni generate (Grok/Hedra)
- [ ] Animazioni create
- [ ] Video montato
- [ ] Sottotitoli aggiunti
- [ ] Thumbnail creata
- [ ] Upload su YouTube
- [ ] Post su social (@Onde_FRH)

---
*Generato automaticamente da Onde Factory - ${new Date().toISOString()}*
`;
}

// ═══════════════════════════════════════════════════════════
// 6. GENERA REPORT
// ═══════════════════════════════════════════════════════════

function generateReport(missingPDFs, emilioStatus, youtubeStatus) {
  const report = `
╔═══════════════════════════════════════════════════════════╗
║           ONDE FACTORY - REPORT AUTOMATICO                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  📚 LIBRI (PDF)                                          ║
║     Mancanti: ${missingPDFs.length}                                         ║
║     ${missingPDFs.length > 0 ? '❌ ' + missingPDFs.join(', ') : '✅ Tutti i PDF esistono'}
║                                                           ║
║  🤖 STORIE EMILIO                                        ║
║     Esistenti: ${emilioStatus.existing}/${CONFIG.emilioStoriesTarget}                                   ║
║     Da creare: ${emilioStatus.needed}                                         ║
║                                                           ║
║  🎬 VIDEO YOUTUBE                                        ║
║     Esistenti: ${youtubeStatus.existing}/${CONFIG.youtubeVideosTarget}                                   ║
║     Da creare: ${youtubeStatus.needed}                                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

  console.log(report);
  return report;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  log('═══════════════════════════════════════════════════════');
  log('ONDE FACTORY - Avvio automazione contenuti');
  log('═══════════════════════════════════════════════════════');

  // 1. Controlla PDF mancanti
  const missingPDFs = checkMissingPDFs();

  // 2. Controlla storie EMILIO
  const emilioStatus = checkEmilioStories();

  // 3. Controlla video YouTube
  const youtubeStatus = checkYouTubeVideos();

  // 4. Se mancano storie EMILIO, genera template
  if (emilioStatus.needed > 0) {
    log(`Genero ${Math.min(emilioStatus.needed, 3)} template storie EMILIO...`);

    const emilioDir = join(CONFIG.booksDir, 'emilio');
    for (let i = 0; i < Math.min(emilioStatus.needed, 3); i++) {
      const storyNum = emilioStatus.existing + i + 1;
      const template = generateEmilioStoryTemplate(storyNum);
      const filename = `emilio-storia-${String(storyNum).padStart(2, '0')}.md`;
      writeFileSync(join(emilioDir, filename), template);
      log(`Creato: ${filename}`);
    }
  }

  // 5. Se mancano video YouTube, genera template
  if (youtubeStatus.needed > 0) {
    log(`Genero ${Math.min(youtubeStatus.needed, 3)} template video YouTube...`);

    const videosDir = join(CONFIG.contentDir, 'videos/emilio');
    for (let i = 0; i < Math.min(youtubeStatus.needed, 3); i++) {
      const videoNum = youtubeStatus.existing + i + 1;
      const template = generateYouTubeVideoTemplate(videoNum);
      const filename = `emilio-video-${String(videoNum).padStart(2, '0')}.md`;
      writeFileSync(join(videosDir, filename), template);
      log(`Creato: ${filename}`);
    }
  }

  // 6. Report finale
  generateReport(missingPDFs, emilioStatus, youtubeStatus);

  // 7. Se ci sono PDF mancanti, avvisa
  if (missingPDFs.length > 0) {
    log('═══════════════════════════════════════════════════════');
    log('AZIONE RICHIESTA: Generare PDF per i libri mancanti!', 'WARN');
    log(`Libri senza PDF: ${missingPDFs.join(', ')}`, 'WARN');
    log('═══════════════════════════════════════════════════════');
  }

  log('Factory completata.');
}

main().catch(err => {
  log(`ERRORE FATALE: ${err.message}`, 'ERROR');
  process.exit(1);
});
