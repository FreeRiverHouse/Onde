# Add Background Music - Audio Mixing Workflow

Come aggiungere musica di sottofondo agli audiobook.

---

## Overview

La musica di sottofondo:
- Migliora l'atmosfera
- Copre imperfezioni audio
- Crea esperienza immersiva
- E' opzionale ma consigliata

---

## Best Practices

### Volume
- **Voce**: 0dB (reference)
- **Musica**: -18dB a -24dB sotto la voce
- La musica non deve MAI competere con la voce

### Stile Musica
| Tipo Libro | Musica Consigliata |
|------------|-------------------|
| Bambini | Piano dolce, arpa, glockenspiel |
| Spirituale | Pad ambient, organo soft, nature |
| Tech/Educativo | Elettronica soft, lo-fi beats |
| Avventura | Orchestrale leggera |

### Fade In/Out
- **Intro**: Fade in 3-5 secondi
- **Outro**: Fade out 5-8 secondi
- **Tra capitoli**: Cross-fade 2 secondi

---

## Fonti Musica Royalty-Free

### Gratuite
- **Pixabay Music** - pixabay.com/music/
- **Free Music Archive** - freemusicarchive.org
- **YouTube Audio Library** - studio.youtube.com (richiede account)

### A Pagamento
- **Epidemic Sound** - $15/mese
- **Artlist** - $199/anno
- **AudioJungle** - Pay per track

### AI Generated
- **Suno AI** - suno.ai (gratis tier)
- **Mubert** - mubert.com
- **Soundraw** - soundraw.io

---

## Libreria Musica Onde

Organizzazione consigliata:

```
tools/audiobook-factory/music/
├── ambient/
│   ├── soft-piano-loop.mp3
│   ├── gentle-strings.mp3
│   └── nature-ambient.mp3
├── children/
│   ├── playful-glockenspiel.mp3
│   ├── lullaby-piano.mp3
│   └── magical-bells.mp3
├── spiritual/
│   ├── meditation-pad.mp3
│   ├── peaceful-organ.mp3
│   └── choir-soft.mp3
└── tech/
    ├── lofi-study.mp3
    ├── electronic-soft.mp3
    └── corporate-light.mp3
```

---

## Usage

### Command Line (ffmpeg)

```bash
# Basic mix - voce + musica a -18dB
ffmpeg -i chapter-01.mp3 -i background.mp3 \
  -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first" \
  -ac 2 chapter-01-with-music.mp3

# Con fade in/out
ffmpeg -i chapter-01.mp3 -i background.mp3 \
  -filter_complex "\
    [1:a]volume=0.15,afade=t=in:d=3,afade=t=out:st=300:d=5[bg];\
    [0:a][bg]amix=inputs=2:duration=first" \
  -ac 2 output.mp3
```

### Script Node.js

```javascript
#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuration
const DEFAULT_CONFIG = {
  musicVolume: 0.15,      // -18dB circa
  fadeIn: 3,              // secondi
  fadeOut: 5,             // secondi
  loopMusic: true         // ripeti se piu' corta del capitolo
};

// Get audio duration
async function getAudioDuration(filePath) {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`
  );
  return parseFloat(stdout.trim());
}

// Mix single file
async function mixAudioWithBackground(voicePath, musicPath, outputPath, config = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config };

  // Get voice duration for fade out timing
  const voiceDuration = await getAudioDuration(voicePath);
  const fadeOutStart = voiceDuration - settings.fadeOut;

  // Build filter
  let musicFilter = `volume=${settings.musicVolume}`;

  // Add fades
  musicFilter += `,afade=t=in:d=${settings.fadeIn}`;
  musicFilter += `,afade=t=out:st=${fadeOutStart}:d=${settings.fadeOut}`;

  // Loop if needed
  const musicDuration = await getAudioDuration(musicPath);
  const loopNeeded = settings.loopMusic && musicDuration < voiceDuration;

  let inputOptions = `-i "${voicePath}" -i "${musicPath}"`;
  let filterComplex;

  if (loopNeeded) {
    // Loop music to match voice length
    filterComplex = `\
      [1:a]aloop=loop=-1:size=2e+09,asetpts=N/SR/TB,\
      atrim=0:${voiceDuration},${musicFilter}[bg];\
      [0:a][bg]amix=inputs=2:duration=first[out]`;
  } else {
    filterComplex = `\
      [1:a]${musicFilter}[bg];\
      [0:a][bg]amix=inputs=2:duration=first[out]`;
  }

  const cmd = `ffmpeg -y ${inputOptions} \
    -filter_complex "${filterComplex}" \
    -map "[out]" -ac 2 "${outputPath}"`;

  console.log(`Mixing: ${path.basename(voicePath)}`);
  await execAsync(cmd);
  console.log(`  ✅ Output: ${outputPath}`);

  return outputPath;
}

// Process all chapters in directory
async function processAudiobook(audioDir, musicPath, outputDir, config = {}) {
  fs.mkdirSync(outputDir, { recursive: true });

  const audioFiles = fs.readdirSync(audioDir)
    .filter(f => f.endsWith('.mp3') || f.endsWith('.wav'))
    .filter(f => !f.includes('-with-music'))
    .sort();

  console.log(`\n🎵 Adding background music to ${audioFiles.length} files`);
  console.log(`   Music: ${musicPath}`);
  console.log(`   Volume: ${(config.musicVolume || DEFAULT_CONFIG.musicVolume) * 100}%`);

  for (const file of audioFiles) {
    const inputPath = path.join(audioDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.(mp3|wav)$/, '-with-music.mp3'));

    await mixAudioWithBackground(inputPath, musicPath, outputPath, config);
  }

  console.log('\n✅ All files processed!');
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  const inputIndex = args.indexOf('--input');
  const musicIndex = args.indexOf('--music');
  const outputIndex = args.indexOf('--output');
  const volumeIndex = args.indexOf('--volume');

  if (inputIndex === -1 || musicIndex === -1) {
    console.error('Usage: node add-background.js --input <dir> --music <file> [--output <dir>] [--volume 0.15]');
    process.exit(1);
  }

  const inputDir = args[inputIndex + 1];
  const musicPath = args[musicIndex + 1];
  const outputDir = outputIndex > -1 ? args[outputIndex + 1] : inputDir;
  const volume = volumeIndex > -1 ? parseFloat(args[volumeIndex + 1]) : undefined;

  processAudiobook(inputDir, musicPath, outputDir, { musicVolume: volume })
    .then(() => console.log('Done!'))
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { mixAudioWithBackground, processAudiobook };
```

---

## Uso Pratico

### Per un singolo capitolo:

```bash
node tools/audiobook-factory/scripts/add-background.js \
  --input books/aiko-2-robotaxi/audiobook/audio/chapter-01.mp3 \
  --music tools/audiobook-factory/music/children/magical-bells.mp3 \
  --output books/aiko-2-robotaxi/audiobook/audio-mixed/
```

### Per tutto l'audiobook:

```bash
node tools/audiobook-factory/scripts/add-background.js \
  --input books/aiko-2-robotaxi/audiobook/audio/ \
  --music tools/audiobook-factory/music/children/magical-bells.mp3 \
  --output books/aiko-2-robotaxi/audiobook/audio-mixed/ \
  --volume 0.12
```

---

## Configurazione per Tipo di Libro

### AIKO Series (Bambini/Tech)
```json
{
  "music": "children/playful-glockenspiel.mp3",
  "volume": 0.12,
  "fadeIn": 3,
  "fadeOut": 5
}
```

### Salmo 23 (Spirituale)
```json
{
  "music": "spiritual/peaceful-organ.mp3",
  "volume": 0.10,
  "fadeIn": 5,
  "fadeOut": 8
}
```

### Piccole Rime (Poesia)
```json
{
  "music": "children/lullaby-piano.mp3",
  "volume": 0.15,
  "fadeIn": 2,
  "fadeOut": 4
}
```

---

## Dynamic Ducking (Avanzato)

Per abbassare automaticamente la musica quando c'e' voce:

```bash
ffmpeg -i voice.mp3 -i music.mp3 \
  -filter_complex "\
    [0:a]asplit=2[voice][sc];\
    [1:a][sc]sidechaincompress=threshold=0.02:ratio=10:attack=50:release=500[bg];\
    [voice][bg]amix=inputs=2:duration=first" \
  -ac 2 output.mp3
```

Questo usa sidechain compression per abbassare la musica automaticamente quando c'e' voce.

---

## Prerequisites

### ffmpeg
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg

# Windows
# Download from ffmpeg.org
```

### Verifica installazione
```bash
ffmpeg -version
ffprobe -version
```

---

## Troubleshooting

### Musica troppo forte
Riduci volume: `--volume 0.10` o meno

### Musica finisce prima del capitolo
Attiva loop: `loopMusic: true` nel config

### Audio distorto
- Verifica che input sia -6dB max
- Normalizza voce prima di mixare

### ffmpeg non trovato
- Installa ffmpeg
- Verifica che sia nel PATH

---

## Output Structure

```
audiobook/
├── audio/                    # Voce sola
│   ├── chapter-01.mp3
│   └── ...
└── audio-mixed/              # Con musica
    ├── chapter-01-with-music.mp3
    └── ...
```

---

## Reference

- **Fonti Musica**: pixabay.com/music/
- **ffmpeg Docs**: ffmpeg.org/documentation.html
- **Next Step**: Export finale (export-audiobook.md)

---

*Documento creato: 2026-01-09*
*Onde Audiobook Factory*
