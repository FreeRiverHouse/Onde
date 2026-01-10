#!/usr/bin/env node
/**
 * ONDE VIDEO FACTORY - PRODUZIONE NOTTURNA
 *
 * Questo script gira di NOTTE e genera video per YouTube.
 * Usa: Hedra/Grok per immagini, ElevenLabs per voci, FFmpeg per assemblaggio.
 *
 * Canali YouTube da riempire:
 * 1. EMILIO - Tech per bambini
 * 2. Onde Stories - Storie animate (Salmo 23, Respiro Magico, etc.)
 * 3. Onde Lounge - Ambient/relax (camino, pioggia, lo-fi)
 * 4. FreeRiverHouse - Tech per adulti (vibe coding, tutorials)
 *
 * Come usare:
 *   node scripts/factory/video-factory-overnight.js
 *
 * Cron (ogni notte alle 2 AM):
 *   0 2 * * * cd /Users/mattia/Projects/Onde && node scripts/factory/video-factory-overnight.js
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readdirSync, writeFileSync, mkdirSync, readFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// ═══════════════════════════════════════════════════════════
// CONFIGURAZIONE
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  outputDir: join(PROJECT_ROOT, 'output/videos'),
  scriptsDir: join(PROJECT_ROOT, 'content/videos'),
  logsDir: join(PROJECT_ROOT, 'logs'),

  // Canali YouTube
  channels: {
    emilio: {
      name: 'EMILIO - Tech per Bambini',
      type: 'educational',
      voice: 'emilio',  // Voce naturale, amichevole
      style: 'cartoon-acquarello'
    },
    stories: {
      name: 'Onde Stories',
      type: 'animated-stories',
      voice: 'gianni',  // Voce Mattia/Gianni
      style: 'acquarello-onde'
    },
    lounge: {
      name: 'Onde Lounge',
      type: 'ambient',
      voice: null,  // Solo musica
      style: 'scenic'
    },
    tech: {
      name: 'FreeRiverHouse Tech',
      type: 'tutorial',
      voice: 'professional',
      style: 'screen-recording'
    }
  },

  // Limiti YouTube per evitare spam
  maxVideosPerDay: 5,  // Conservativo per canale nuovo
  minVariety: true,    // Varia titoli, thumbnail, contenuto

  // Voci ElevenLabs (da configurare con API key)
  voices: {
    emilio: {
      id: 'VOICE_ID_EMILIO',  // Da creare - voce naturale amichevole
      style: 'friendly, warm, not robotic'
    },
    gianni: {
      id: 'VOICE_ID_GIANNI',  // Clonata da Mattia
      style: 'narrator, warm, italian'
    }
  }
};

// ═══════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [VIDEO-FACTORY] [${level}] ${message}`;
  console.log(logLine);

  if (!existsSync(CONFIG.logsDir)) mkdirSync(CONFIG.logsDir, { recursive: true });
  appendFileSync(join(CONFIG.logsDir, 'video-factory.log'), logLine + '\n');
}

// ═══════════════════════════════════════════════════════════
// CONTENUTI DA GENERARE
// ═══════════════════════════════════════════════════════════

const VIDEO_QUEUE = [
  // EMILIO - Tech per Bambini
  {
    channel: 'emilio',
    title: 'EMILIO Spiega: Come Funziona Internet | Tech per Bambini',
    description: 'EMILIO il robot spiega ai bambini come funziona Internet in modo semplice e divertente!',
    script: 'emilio-internet.md',
    duration: '3-5 min',
    priority: 1
  },
  {
    channel: 'emilio',
    title: 'EMILIO Spiega: Cos\'è un Robot | Tech per Bambini',
    description: 'EMILIO spiega cos\'è un robot e come funziona. Perfetto per bambini curiosi!',
    script: 'emilio-robot.md',
    duration: '3-5 min',
    priority: 1
  },
  {
    channel: 'emilio',
    title: 'EMILIO Spiega: Come Impara l\'Intelligenza Artificiale | AI per Bambini',
    description: 'L\'AI spiegata ai bambini in modo semplice da EMILIO il robot amico!',
    script: 'emilio-ai.md',
    duration: '3-5 min',
    priority: 1
  },

  // Onde Stories - Storie animate
  {
    channel: 'stories',
    title: 'Il Salmo 23 per Bambini | Storia Animata della Buonanotte',
    description: 'Una bellissima versione illustrata del Salmo 23 per i più piccoli.',
    script: 'salmo-23-animato.md',
    duration: '5-7 min',
    priority: 1
  },
  {
    channel: 'stories',
    title: 'Stella Stellina | Ninna Nanna Italiana Animata',
    description: 'La classica ninna nanna italiana con bellissime illustrazioni ad acquarello.',
    script: 'stella-stellina-animato.md',
    duration: '3 min',
    priority: 1
  },
  {
    channel: 'stories',
    title: 'Il Respiro Magico | Mindfulness per Bambini',
    description: 'Impara a respirare con calma con questa storia animata.',
    script: 'respiro-magico-animato.md',
    duration: '5 min',
    priority: 2
  },

  // Onde Lounge - Ambient
  {
    channel: 'lounge',
    title: 'Camino Italiano | 3 Ore Musica Rilassante e Fuoco',
    description: 'Rilassati con il suono del camino e musica italiana soft.',
    script: 'camino-3ore.md',
    duration: '3 hours',
    priority: 2
  },
  {
    channel: 'lounge',
    title: 'Pioggia sulla Finestra | 2 Ore per Dormire e Studiare',
    description: 'Suoni di pioggia rilassanti con paesaggio italiano.',
    script: 'pioggia-2ore.md',
    duration: '2 hours',
    priority: 2
  },

  // FreeRiverHouse Tech
  {
    channel: 'tech',
    title: 'Vibe Coding: Come Ho Creato un\'App in 2 Ore con Claude',
    description: 'Tutorial su come usare AI per sviluppare app velocemente.',
    script: 'vibe-coding-tutorial.md',
    duration: '15 min',
    priority: 2
  }
];

// ═══════════════════════════════════════════════════════════
// GENERAZIONE VIDEO (PIPELINE)
// ═══════════════════════════════════════════════════════════

async function generateVideoScript(video) {
  const scriptPath = join(CONFIG.scriptsDir, video.channel, video.script);
  const scriptDir = dirname(scriptPath);

  if (!existsSync(scriptDir)) {
    mkdirSync(scriptDir, { recursive: true });
  }

  // Se lo script non esiste, crealo come template
  if (!existsSync(scriptPath)) {
    const template = `# ${video.title}

## Metadata
- Canale: ${CONFIG.channels[video.channel].name}
- Durata: ${video.duration}
- Voce: ${CONFIG.channels[video.channel].voice || 'nessuna'}
- Stile: ${CONFIG.channels[video.channel].style}

## Descrizione YouTube
${video.description}

## Script

### Intro (0:00 - 0:15)
[Scrivere hook iniziale]

### Contenuto Principale
[Scrivere contenuto]

### Outro
[Scrivere conclusione con CTA]

## Note Produzione
- [ ] Script completato
- [ ] Audio generato (ElevenLabs)
- [ ] Immagini generate (Hedra/Grok)
- [ ] Video assemblato (FFmpeg)
- [ ] Thumbnail creata
- [ ] Sottotitoli aggiunti
- [ ] Upload su YouTube

---
*Generato da Onde Video Factory - ${new Date().toISOString()}*
`;

    writeFileSync(scriptPath, template);
    log(`Creato script template: ${video.script}`);
    return { status: 'template_created', path: scriptPath };
  }

  return { status: 'script_exists', path: scriptPath };
}

async function checkVideoAssets(video) {
  const channel = video.channel;
  const videoDir = join(CONFIG.outputDir, channel, video.script.replace('.md', ''));

  const assets = {
    script: false,
    audio: false,
    images: false,
    video: false,
    thumbnail: false
  };

  if (existsSync(join(CONFIG.scriptsDir, channel, video.script))) {
    assets.script = true;
  }

  if (existsSync(join(videoDir, 'audio.mp3'))) {
    assets.audio = true;
  }

  if (existsSync(join(videoDir, 'images'))) {
    const images = readdirSync(join(videoDir, 'images'));
    assets.images = images.length > 0;
  }

  if (existsSync(join(videoDir, 'final.mp4'))) {
    assets.video = true;
  }

  if (existsSync(join(videoDir, 'thumbnail.jpg'))) {
    assets.thumbnail = true;
  }

  return assets;
}

// ═══════════════════════════════════════════════════════════
// REPORT
// ═══════════════════════════════════════════════════════════

async function generateReport() {
  log('═══════════════════════════════════════════════════════');
  log('ONDE VIDEO FACTORY - REPORT');
  log('═══════════════════════════════════════════════════════');

  const report = {
    total: VIDEO_QUEUE.length,
    ready: 0,
    inProgress: 0,
    todo: 0,
    byChannel: {}
  };

  for (const video of VIDEO_QUEUE) {
    const assets = await checkVideoAssets(video);

    if (!report.byChannel[video.channel]) {
      report.byChannel[video.channel] = { ready: 0, inProgress: 0, todo: 0 };
    }

    if (assets.video && assets.thumbnail) {
      report.ready++;
      report.byChannel[video.channel].ready++;
    } else if (assets.script || assets.audio || assets.images) {
      report.inProgress++;
      report.byChannel[video.channel].inProgress++;
    } else {
      report.todo++;
      report.byChannel[video.channel].todo++;
    }
  }

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           ONDE VIDEO FACTORY - STATUS                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  📊 TOTALE VIDEO                                         ║
║     ✅ Pronti per upload: ${report.ready}                              ║
║     🔄 In produzione: ${report.inProgress}                                 ║
║     📝 Da iniziare: ${report.todo}                                   ║
║                                                           ║
║  📺 PER CANALE                                           ║
${Object.entries(report.byChannel).map(([ch, stats]) =>
  `║     ${ch}: ✅${stats.ready} 🔄${stats.inProgress} 📝${stats.todo}`
).join('\n')}
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

  return report;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  log('═══════════════════════════════════════════════════════');
  log('ONDE VIDEO FACTORY - AVVIO PRODUZIONE NOTTURNA');
  log('═══════════════════════════════════════════════════════');

  // Crea directory necessarie
  if (!existsSync(CONFIG.outputDir)) mkdirSync(CONFIG.outputDir, { recursive: true });
  if (!existsSync(CONFIG.scriptsDir)) mkdirSync(CONFIG.scriptsDir, { recursive: true });

  // Genera script mancanti
  log('Generando script mancanti...');
  for (const video of VIDEO_QUEUE) {
    await generateVideoScript(video);
  }

  // Report
  await generateReport();

  log('═══════════════════════════════════════════════════════');
  log('AZIONI RICHIESTE:');
  log('1. Completare gli script in content/videos/');
  log('2. Generare audio con ElevenLabs');
  log('3. Generare immagini con Hedra/Grok');
  log('4. Assemblare video con FFmpeg');
  log('5. Upload su YouTube');
  log('═══════════════════════════════════════════════════════');
}

main().catch(err => {
  log(`ERRORE: ${err.message}`, 'ERROR');
  process.exit(1);
});
