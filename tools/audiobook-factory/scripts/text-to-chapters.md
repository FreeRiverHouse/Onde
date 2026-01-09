# Text to Chapters - Script Documentation

Come splittare un libro in capitoli pronti per la generazione audio.

---

## Overview

Questo script prende il testo completo di un libro e lo divide in:
- Capitoli separati
- Segmenti per personaggio
- Marcatori di pausa e effetti

---

## Input Format

Il testo di input dovrebbe essere in formato semplice con marcatori:

```
CAPITOLO 1: Titolo del Capitolo

Testo del capitolo...

CAPITOLO 2: Secondo Capitolo

Altro testo...
```

---

## Output Format

Lo script genera una struttura di file:

```
audiobook/
├── config.json           # Configurazione audiobook
├── chapters/
│   ├── chapter-01.json   # Testo + metadata capitolo 1
│   ├── chapter-02.json   # Testo + metadata capitolo 2
│   └── ...
└── full-script.json      # Script completo con tutti i marcatori
```

### Esempio chapter-01.json

```json
{
  "chapter": 1,
  "title": "L'Arrivo di AIKO",
  "segments": [
    {
      "type": "narration",
      "speaker": "narrator",
      "text": "Era un sabato mattina di sole quando Sofia ricevette il regalo piu' speciale della sua vita.",
      "duration_estimate": 5.2
    },
    {
      "type": "pause",
      "duration": 1
    },
    {
      "type": "dialogue",
      "speaker": "mom",
      "text": "Sofia, vieni giu'! C'e' un pacco per te!",
      "duration_estimate": 2.8
    },
    {
      "type": "dialogue",
      "speaker": "sofia",
      "text": "Arrivo subito, mamma!",
      "duration_estimate": 1.5
    }
  ],
  "total_duration_estimate": 42.5,
  "character_count": 1250
}
```

---

## Usage

### Command Line

```bash
# Basic usage
node scripts/text-to-chapters.js \
  --input books/aiko-2-robotaxi/RAW/aiko-2-full-text.txt \
  --output books/aiko-2-robotaxi/audiobook/

# With options
node scripts/text-to-chapters.js \
  --input books/aiko-2-robotaxi/RAW/aiko-2-full-text.txt \
  --output books/aiko-2-robotaxi/audiobook/ \
  --language it \
  --narrator gianni
```

### As Module

```javascript
const { splitToChapters } = require('./text-to-chapters');

const result = await splitToChapters({
  inputPath: 'books/aiko-2-robotaxi/RAW/aiko-2-full-text.txt',
  outputPath: 'books/aiko-2-robotaxi/audiobook/',
  options: {
    language: 'it',
    defaultNarrator: 'gianni',
    pauseBetweenChapters: 3,
    pauseBetweenParagraphs: 0.5
  }
});

console.log(`Created ${result.chapters.length} chapters`);
console.log(`Total characters: ${result.totalCharacters}`);
console.log(`Estimated duration: ${result.estimatedDuration} minutes`);
```

---

## Marcatori Riconosciuti

### Capitoli
```
CAPITOLO 1: Titolo
Chapter 1: Title
[CHAPTER 1]
---CHAPTER 1---
# Chapter 1
```

### Personaggi/Dialoghi
```
[SOFIA]: "Testo dialogo"
SOFIA: Testo dialogo
"Testo dialogo," disse Sofia.
```

### Pause
```
[PAUSE]           → 1 secondo default
[PAUSE 2s]        → 2 secondi
[PAUSA 3 secondi] → 3 secondi
...               → 0.5 secondi (ellipsis)
```

### Effetti Sonori (opzionale)
```
[SFX: door_open]
[MUSIC: fade_in]
[AMBIENT: city_traffic]
```

---

## Configurazione Automatica

Lo script genera anche un `config.json` basato sul contenuto:

```json
{
  "title": "AIKO 2: The Robotaxi Adventure",
  "author": "Onde Publishing",
  "language": "it-IT",
  "narrator": "gianni",
  "chapters": 8,
  "total_characters": 18500,
  "estimated_duration_minutes": 35,
  "voices_needed": ["narrator", "sofia", "aiko", "mom"],
  "created": "2026-01-09T10:30:00Z"
}
```

---

## Script Implementation

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns per riconoscere i marcatori
const PATTERNS = {
  chapter: /^(?:CAPITOLO|Chapter|CHAPTER|\#)\s*(\d+)[\:\.\s]*(.*)$/im,
  speaker: /^\[([A-Z_]+)\][\:\s]*["']?(.+?)["']?$/,
  pause: /^\[PAUSE?\s*(\d*\.?\d*)s?\]$/i,
  sfx: /^\[SFX[\:\s]*(.+)\]$/i
};

// Stima durata basata su caratteri (~150 parole/minuto, ~5 char/parola)
function estimateDuration(text) {
  const words = text.split(/\s+/).length;
  return (words / 150) * 60; // secondi
}

// Identifica speaker da dialogo
function identifySpeaker(line, context) {
  // Check marcatore esplicito [SPEAKER]:
  const speakerMatch = line.match(PATTERNS.speaker);
  if (speakerMatch) {
    return {
      speaker: speakerMatch[1].toLowerCase(),
      text: speakerMatch[2]
    };
  }

  // Check dialogo con attribuzione
  const dialogueMatch = line.match(/"(.+?)["']?,?\s*(?:disse|said|asked|replied)\s+(\w+)/i);
  if (dialogueMatch) {
    return {
      speaker: dialogueMatch[2].toLowerCase(),
      text: dialogueMatch[1]
    };
  }

  // Default a narrator
  return {
    speaker: context.defaultNarrator || 'narrator',
    text: line
  };
}

// Parse singolo capitolo
function parseChapter(text, chapterNum, options) {
  const lines = text.split('\n').filter(l => l.trim());
  const segments = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty
    if (!trimmed) continue;

    // Check pause
    const pauseMatch = trimmed.match(PATTERNS.pause);
    if (pauseMatch) {
      segments.push({
        type: 'pause',
        duration: parseFloat(pauseMatch[1]) || 1
      });
      continue;
    }

    // Check SFX
    const sfxMatch = trimmed.match(PATTERNS.sfx);
    if (sfxMatch) {
      segments.push({
        type: 'sfx',
        effect: sfxMatch[1]
      });
      continue;
    }

    // Check ellipsis pause
    if (trimmed === '...' || trimmed === '…') {
      segments.push({ type: 'pause', duration: 0.5 });
      continue;
    }

    // Parse come dialogo o narrazione
    const { speaker, text: segmentText } = identifySpeaker(trimmed, options);

    segments.push({
      type: speaker === 'narrator' ? 'narration' : 'dialogue',
      speaker: speaker,
      text: segmentText,
      duration_estimate: estimateDuration(segmentText)
    });
  }

  // Calcola totali
  const totalDuration = segments.reduce((sum, s) => {
    if (s.type === 'pause') return sum + s.duration;
    return sum + (s.duration_estimate || 0);
  }, 0);

  const characterCount = segments
    .filter(s => s.text)
    .reduce((sum, s) => sum + s.text.length, 0);

  return {
    chapter: chapterNum,
    segments,
    total_duration_estimate: Math.round(totalDuration * 10) / 10,
    character_count: characterCount
  };
}

// Funzione principale
async function splitToChapters({ inputPath, outputPath, options = {} }) {
  // Leggi input
  const fullText = fs.readFileSync(inputPath, 'utf-8');

  // Split per capitoli
  const chapterSplits = fullText.split(PATTERNS.chapter);
  const chapters = [];

  let chapterNum = 1;
  for (let i = 1; i < chapterSplits.length; i += 3) {
    const num = parseInt(chapterSplits[i]);
    const title = chapterSplits[i + 1]?.trim() || `Chapter ${num}`;
    const content = chapterSplits[i + 2] || '';

    const chapter = parseChapter(content, num, options);
    chapter.title = title;
    chapters.push(chapter);
    chapterNum++;
  }

  // Crea output directory
  fs.mkdirSync(path.join(outputPath, 'chapters'), { recursive: true });

  // Scrivi capitoli singoli
  for (const chapter of chapters) {
    const filename = `chapter-${String(chapter.chapter).padStart(2, '0')}.json`;
    fs.writeFileSync(
      path.join(outputPath, 'chapters', filename),
      JSON.stringify(chapter, null, 2)
    );
  }

  // Identifica voci necessarie
  const voicesNeeded = [...new Set(
    chapters.flatMap(c => c.segments.map(s => s.speaker).filter(Boolean))
  )];

  // Calcola totali
  const totalCharacters = chapters.reduce((sum, c) => sum + c.character_count, 0);
  const totalDuration = chapters.reduce((sum, c) => sum + c.total_duration_estimate, 0);

  // Genera config
  const config = {
    title: options.title || path.basename(inputPath, path.extname(inputPath)),
    author: options.author || 'Onde Publishing',
    language: options.language || 'it-IT',
    narrator: options.defaultNarrator || 'narrator',
    chapters: chapters.length,
    total_characters: totalCharacters,
    estimated_duration_minutes: Math.round(totalDuration / 60),
    voices_needed: voicesNeeded,
    created: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(outputPath, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  // Scrivi script completo
  fs.writeFileSync(
    path.join(outputPath, 'full-script.json'),
    JSON.stringify({ config, chapters }, null, 2)
  );

  return {
    chapters: chapters.length,
    totalCharacters,
    estimatedDuration: Math.round(totalDuration / 60)
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');

  if (inputIndex === -1 || outputIndex === -1) {
    console.error('Usage: node text-to-chapters.js --input <file> --output <dir>');
    process.exit(1);
  }

  splitToChapters({
    inputPath: args[inputIndex + 1],
    outputPath: args[outputIndex + 1]
  }).then(result => {
    console.log('Done!');
    console.log(`Chapters: ${result.chapters}`);
    console.log(`Characters: ${result.totalCharacters}`);
    console.log(`Duration: ~${result.estimatedDuration} minutes`);
  });
}

module.exports = { splitToChapters };
```

---

## Tips

### Preparazione Testo

1. **Pulisci il testo** prima di processare:
   - Rimuovi header/footer ripetuti
   - Correggi encoding (UTF-8)
   - Standardizza virgolette ("" non '')

2. **Aggiungi marcatori** dove mancano:
   - Identifica chiaramente i capitoli
   - Marca i dialoghi con [SPEAKER]:
   - Inserisci [PAUSE] dove serve

3. **Verifica output** prima di generare audio:
   - Controlla che i personaggi siano corretti
   - Verifica le durate stimate
   - Assicurati che il testo sia completo

---

## Reference

- **AIKO 2 Full Text**: `books/aiko-2-robotaxi/RAW/aiko-2-full-text.txt`
- **Salmo 23 Script**: `books/salmo-23-bambini/audiobook-script.txt`
- **Next Step**: `generate-audio.md`

---

*Documento creato: 2026-01-09*
*Onde Audiobook Factory*
