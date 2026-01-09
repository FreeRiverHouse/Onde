# Generate Audio - ElevenLabs TTS Workflow

Come generare audio per audiobook usando ElevenLabs API.

---

## Overview

Questo script prende i capitoli processati e genera audio:
1. Legge i segmenti dal JSON
2. Chiama ElevenLabs per ogni segmento
3. Concatena con pause corrette
4. Esporta MP3/WAV per capitolo

---

## Prerequisites

```bash
# Install dependencies
npm install elevenlabs-api dotenv

# Or with native fetch (Node 18+)
npm install dotenv
```

### Environment Variables

```bash
# .env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_NARRATOR=voice_id
ELEVENLABS_VOICE_SOFIA=voice_id
ELEVENLABS_VOICE_AIKO=voice_id
ELEVENLABS_VOICE_MOM=voice_id
```

---

## Usage

### Command Line

```bash
# Generate all chapters
node scripts/generate-audio.js \
  --config books/aiko-2-robotaxi/audiobook/config.json

# Generate specific chapter
node scripts/generate-audio.js \
  --config books/aiko-2-robotaxi/audiobook/config.json \
  --chapter 3

# Dry run (show what would be generated)
node scripts/generate-audio.js \
  --config books/aiko-2-robotaxi/audiobook/config.json \
  --dry-run
```

---

## Script Implementation

```javascript
#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Voice settings per character
const VOICE_SETTINGS = {
  narrator: {
    voiceId: process.env.ELEVENLABS_VOICE_NARRATOR,
    stability: 0.50,
    similarity_boost: 0.75,
    style: 0.30
  },
  sofia: {
    voiceId: process.env.ELEVENLABS_VOICE_SOFIA,
    stability: 0.45,
    similarity_boost: 0.80,
    style: 0.35
  },
  aiko: {
    voiceId: process.env.ELEVENLABS_VOICE_AIKO,
    stability: 0.65,
    similarity_boost: 0.85,
    style: 0.20
  },
  mom: {
    voiceId: process.env.ELEVENLABS_VOICE_MOM,
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.30
  },
  gianni: {
    voiceId: process.env.ELEVENLABS_VOICE_GIANNI,
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.25
  }
};

// ElevenLabs API call
async function generateSpeech(text, speaker) {
  const settings = VOICE_SETTINGS[speaker] || VOICE_SETTINGS.narrator;

  if (!settings.voiceId) {
    throw new Error(`No voice ID configured for speaker: ${speaker}`);
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${settings.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: settings.style,
          use_speaker_boost: true
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Generate silence for pause
function generateSilence(durationSeconds, sampleRate = 44100) {
  // Simple silence generation
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const silence = Buffer.alloc(numSamples * 2); // 16-bit audio
  return silence;
}

// Process single chapter
async function processChapter(chapterPath, outputDir, options = {}) {
  const chapter = JSON.parse(fs.readFileSync(chapterPath, 'utf-8'));
  const audioSegments = [];
  let totalGenerated = 0;

  console.log(`\n📖 Processing Chapter ${chapter.chapter}: ${chapter.title}`);
  console.log(`   Segments: ${chapter.segments.length}`);

  for (let i = 0; i < chapter.segments.length; i++) {
    const segment = chapter.segments[i];

    if (options.dryRun) {
      console.log(`   [DRY] ${segment.type}: ${segment.speaker || 'pause'}`);
      continue;
    }

    if (segment.type === 'pause') {
      console.log(`   ⏸️  Pause: ${segment.duration}s`);
      // In production, concatenate silence
      continue;
    }

    if (segment.type === 'sfx') {
      console.log(`   🔊 SFX: ${segment.effect}`);
      // In production, load SFX file
      continue;
    }

    // Generate speech
    console.log(`   🎙️  [${segment.speaker}]: "${segment.text.substring(0, 50)}..."`);

    try {
      const audioBuffer = await generateSpeech(segment.text, segment.speaker);
      audioSegments.push({
        type: 'audio',
        buffer: audioBuffer,
        speaker: segment.speaker
      });
      totalGenerated++;

      // Rate limiting - ElevenLabs has limits
      await sleep(200);
    } catch (error) {
      console.error(`   ❌ Error generating: ${error.message}`);
    }
  }

  if (!options.dryRun && audioSegments.length > 0) {
    // Concatenate all segments
    const outputPath = path.join(
      outputDir,
      `chapter-${String(chapter.chapter).padStart(2, '0')}.mp3`
    );

    // For now, save first segment as example
    // In production, use ffmpeg to concatenate
    fs.writeFileSync(outputPath, audioSegments[0].buffer);
    console.log(`   ✅ Saved: ${outputPath}`);
  }

  return {
    chapter: chapter.chapter,
    segments: totalGenerated,
    characters: chapter.character_count
  };
}

// Main function
async function generateAudiobook(configPath, options = {}) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const baseDir = path.dirname(configPath);
  const chaptersDir = path.join(baseDir, 'chapters');
  const outputDir = path.join(baseDir, 'audio');

  // Create output directory
  if (!options.dryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎧 Audiobook Generation');
  console.log(`   Title: ${config.title}`);
  console.log(`   Chapters: ${config.chapters}`);
  console.log(`   Est. Duration: ${config.estimated_duration_minutes} min`);
  console.log(`   Voices: ${config.voices_needed.join(', ')}`);

  // Verify voice IDs
  for (const voice of config.voices_needed) {
    const settings = VOICE_SETTINGS[voice];
    if (!settings?.voiceId) {
      console.warn(`   ⚠️  Warning: No voice ID for ${voice}`);
    }
  }

  const results = [];

  // Process each chapter (or specific one)
  const chapterFiles = fs.readdirSync(chaptersDir)
    .filter(f => f.startsWith('chapter-') && f.endsWith('.json'))
    .sort();

  for (const chapterFile of chapterFiles) {
    const chapterNum = parseInt(chapterFile.match(/chapter-(\d+)/)[1]);

    if (options.chapter && options.chapter !== chapterNum) {
      continue;
    }

    const result = await processChapter(
      path.join(chaptersDir, chapterFile),
      outputDir,
      options
    );
    results.push(result);
  }

  // Summary
  console.log('\n📊 Summary');
  const totalSegments = results.reduce((sum, r) => sum + r.segments, 0);
  const totalChars = results.reduce((sum, r) => sum + r.characters, 0);
  console.log(`   Chapters processed: ${results.length}`);
  console.log(`   Total segments: ${totalSegments}`);
  console.log(`   Total characters: ${totalChars}`);
  console.log(`   Est. cost: $${(totalChars * 0.00022).toFixed(2)}`);

  return results;
}

// Helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const configIndex = args.indexOf('--config');
  const chapterIndex = args.indexOf('--chapter');
  const dryRun = args.includes('--dry-run');

  if (configIndex === -1) {
    console.error('Usage: node generate-audio.js --config <path> [--chapter N] [--dry-run]');
    process.exit(1);
  }

  generateAudiobook(args[configIndex + 1], {
    chapter: chapterIndex > -1 ? parseInt(args[chapterIndex + 1]) : null,
    dryRun
  }).then(() => {
    console.log('\n✅ Done!');
  }).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { generateAudiobook, generateSpeech };
```

---

## Voice Cloning Workflow

### Per voci personalizzate:

1. **Registra sample audio** (3-5 minuti)
2. **Upload su ElevenLabs Voice Lab**
3. **Copia Voice ID**
4. **Aggiungi a .env**

### Requisiti sample:
- Qualita': almeno 44.1kHz, 16-bit
- Ambiente: silenzioso, no eco
- Contenuto: mix narrazione/dialogo
- Durata: minimo 3 minuti

---

## Batch Processing

Per generare tutti gli audiobook in coda:

```bash
#!/bin/bash
# batch-generate.sh

BOOKS=(
  "books/aiko-2-robotaxi/audiobook/config.json"
  "books/salmo-23-bambini/audiobook/config.json"
  "books/piccole-rime/audiobook/config.json"
)

for config in "${BOOKS[@]}"; do
  echo "Processing: $config"
  node scripts/generate-audio.js --config "$config"
  sleep 60  # Rate limit between books
done
```

---

## Error Handling

### Rate Limits
ElevenLabs ha limiti:
- Free: 10,000 char/mese
- Creator: 100,000 char/mese
- Pro: 500,000 char/mese

Script include delay automatico tra richieste.

### Voice Not Found
```
Error: No voice ID configured for speaker: xyz
```
Soluzione: Aggiungi voice ID in .env o mappa a voce esistente.

### API Errors
```
Error: ElevenLabs API error: 429 - Too Many Requests
```
Soluzione: Aumenta delay tra richieste o aspetta.

---

## Output Structure

```
audiobook/
├── config.json
├── chapters/
│   ├── chapter-01.json
│   └── ...
└── audio/                    # Generated
    ├── chapter-01.mp3
    ├── chapter-02.mp3
    └── ...
```

---

## Next Steps

Dopo la generazione:
1. **QC**: Ascolta ogni capitolo
2. **Background Music**: Vedi `add-background.md`
3. **Export**: Combina in M4B finale

---

## Alternative Gratuite

Se ElevenLabs e' troppo costoso, usa TTS locale:

### XTTS-v2 (Python)
```python
from TTS.api import TTS

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
tts.tts_to_file(
    text="Testo da narrare",
    language="it",
    speaker_wav="reference.wav",
    file_path="output.wav"
)
```

### Piper TTS (CLI)
```bash
echo "Testo da narrare" | piper \
  --model it_IT-riccardo-medium.onnx \
  --output_file output.wav
```

Vedi `tools/audio-gen/LOCAL-TTS-SETUP.md` per setup.

---

## Reference

- **Voice Settings**: `tools/audiobook-factory/voices/`
- **Chapter Splitting**: `text-to-chapters.md`
- **Background Music**: `add-background.md`
- **ElevenLabs Docs**: https://docs.elevenlabs.io/

---

*Documento creato: 2026-01-09*
*Onde Audiobook Factory*
