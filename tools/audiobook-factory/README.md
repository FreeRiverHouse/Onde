# Audiobook Factory - Onde Publishing

Pipeline automatizzata per generare audiobook da ogni libro Onde.

---

## Overview

Ogni libro Onde diventa automaticamente un audiobook professionale:
- **Voci ElevenLabs** per narratore e personaggi
- **Splitting automatico** in capitoli
- **Musica di sottofondo** ambientale
- **Quality check** prima della pubblicazione
- **Export multi-formato** (MP3, M4B, WAV)

---

## Quick Start

### 1. Prepara il testo
```bash
# Crea script formattato dal libro
node tools/audiobook-factory/scripts/text-to-chapters.js \
  --input books/[nome-libro]/testo.txt \
  --output books/[nome-libro]/audiobook/
```

### 2. Genera audio
```bash
# Genera audio capitolo per capitolo
node tools/audiobook-factory/scripts/generate-audio.js \
  --config books/[nome-libro]/audiobook/config.json
```

### 3. Aggiungi musica (opzionale)
```bash
# Mixa con musica di sottofondo
node tools/audiobook-factory/scripts/add-background.js \
  --input books/[nome-libro]/audiobook/chapters/ \
  --music tools/audiobook-factory/music/ambient-piano.mp3
```

### 4. QC e Export
```bash
# Verifica qualita e genera output finale
node tools/audiobook-factory/scripts/export-audiobook.js \
  --input books/[nome-libro]/audiobook/ \
  --format m4b  # o mp3
```

---

## Directory Structure

```
tools/audiobook-factory/
├── README.md                    # Questa guida
├── voices/
│   ├── gianni-voice.md          # Voce narratore Gianni Parola
│   └── character-voices.md      # Voci personaggi (Sofia, AIKO, etc.)
├── scripts/
│   ├── text-to-chapters.md      # Come splittare in capitoli
│   ├── generate-audio.md        # Workflow ElevenLabs TTS
│   └── add-background.md        # Aggiungere musica ambient
├── templates/
│   └── audiobook-config.json    # Template configurazione
├── music/                       # Libreria musica royalty-free
│   └── [scaricata da Pixabay/Epidemic]
└── quality-checklist.md         # Checklist QC pre-pubblicazione
```

---

## Workflow Completo

### Step 1: Preparazione Testo

Il testo deve essere formattato per la lettura:
- Marcatori capitolo: `[CHAPTER X: Titolo]`
- Marcatori personaggio: `[SOFIA]:`, `[AIKO]:`, `[NARRATOR]:`
- Pause: `[PAUSE 2s]`, `[PAUSE 1s]`
- Effetti: `[SFX: door_open]`, `[MUSIC: fade_in]`

Esempio:
```
[CHAPTER 1: L'Arrivo di AIKO]

[NARRATOR]: Era un sabato mattina di sole quando tutto comincio.

[PAUSE 1s]

[MOM]: "Oggi andiamo dalla nonna!"

[SOFIA]: "Davvero? Come ci arriviamo?"

[AIKO]: "Sofia, questo e' un ROBOTAXI. Un'auto che guida da sola!"

[PAUSE 2s]
```

### Step 2: Configurazione Voci

Ogni libro ha un file `audiobook-config.json`:

```json
{
  "title": "AIKO 2: The Robotaxi Adventure",
  "language": "it-IT",
  "voices": {
    "narrator": "VOICE_ID_GIANNI",
    "sofia": "VOICE_ID_SOFIA",
    "aiko": "VOICE_ID_AIKO",
    "mom": "VOICE_ID_MOM"
  },
  "settings": {
    "stability": 0.50,
    "similarity_boost": 0.75,
    "style": 0.30,
    "model": "eleven_multilingual_v2"
  },
  "background_music": {
    "enabled": true,
    "volume": -18,
    "fade_in": 3,
    "fade_out": 5
  }
}
```

### Step 3: Generazione Audio

ElevenLabs genera l'audio capitolo per capitolo:

1. **Parse script** - Estrae testo per ogni voce
2. **API call** - Chiama ElevenLabs per ogni segmento
3. **Concatenazione** - Unisce i segmenti con pause corrette
4. **Export** - Salva MP3/WAV per capitolo

### Step 4: Post-Processing

- **Normalizzazione volume** - LUFS target: -16
- **Compressione dinamica** - Per ascolto mobile
- **Noise reduction** - Se necessario
- **Background music** - Mix a -18dB sotto voce

### Step 5: Quality Check

Vedi `quality-checklist.md` per la checklist completa.

---

## ElevenLabs Setup

### API Key
```bash
# In .env
ELEVENLABS_API_KEY=your_api_key_here
```

### Voice IDs
Salvare in `.env`:
```bash
ELEVENLABS_VOICE_GIANNI=<voice_id>
ELEVENLABS_VOICE_SOFIA=<voice_id>
ELEVENLABS_VOICE_AIKO=<voice_id>
ELEVENLABS_VOICE_MOM=<voice_id>
ELEVENLABS_VOICE_NARRATOR=<voice_id>
```

### Costi Stimati

| Libro | Caratteri | Costo (~$0.30/1000 char) |
|-------|-----------|--------------------------|
| AIKO 1 | ~15,000 | ~$4.50 |
| AIKO 2 | ~20,000 | ~$6.00 |
| Salmo 23 | ~3,000 | ~$0.90 |
| Piccole Rime | ~5,000 | ~$1.50 |

---

## Formati Export

### MP3 (per Spotify, YouTube, distribuzione)
- Bitrate: 128-192 kbps
- Sample rate: 44.1 kHz
- Metadata: ID3v2 tags

### M4B (per Apple Books, Audible)
- Codec: AAC
- Capitoli embedded
- Artwork embedded
- Bookmarking supportato

### WAV (per archivio, editing)
- 16-bit, 44.1 kHz
- Lossless
- Per backup e re-editing

---

## Piattaforme Distribuzione

| Piattaforma | Formato | Note |
|-------------|---------|------|
| **Spotify** | MP3 | Via Anchor/Spotify for Podcasters |
| **Apple Books** | M4B | Richiede ISBN audiobook |
| **Audible** | M4B | Via ACX (richiede esclusiva) |
| **YouTube** | MP4/Video | Immagine statica + audio |
| **SoundCloud** | MP3 | Per preview gratuiti |
| **Onde Portal** | MP3/M4B | Vendita diretta |

---

## Alternative Locali (GRATIS)

Se ElevenLabs e' troppo costoso, vedi `tools/audio-gen/LOCAL-TTS-SETUP.md`:

| Tool | Qualita | Italiano | Costo |
|------|---------|----------|-------|
| **XTTS-v2** | Eccellente | Si | Gratis |
| **Piper TTS** | Buona | Si | Gratis |
| **Bark** | Ottima | Si | Gratis |

---

## Reference

- **AIKO Voices**: `content/voices/AIKO-VOICES-GUIDE.md`
- **Local TTS**: `tools/audio-gen/LOCAL-TTS-SETUP.md`
- **Salmo 23 Script**: `books/salmo-23-bambini/audiobook-script.txt`

---

*Documento creato: 2026-01-09*
*Onde Publishing - Audiobook Factory v1.0*
