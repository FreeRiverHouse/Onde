# Workflow: Generare un Episodio Podcast

> Guida completa step-by-step per produrre un singolo episodio del podcast Onde

---

## Prerequisiti

### Software Necessario

```bash
# FFmpeg per editing audio
brew install ffmpeg

# Python per TTS
python3 -m venv ~/venvs/podcast
source ~/venvs/podcast/bin/activate
pip install edge-tts coqui-tts pydub

# Node.js per script automazione
npm install -g node
```

### File Necessari

- Script episodio (`.md`)
- Jingle intro (`jingle-intro.mp3`)
- Jingle outro (`jingle-outro.mp3`)
- Background music (opzionale)

---

## Step 1: Preparazione Script

### 1.1 Crea Configurazione Episodio

```bash
# Copia template
cp templates/episode-config.json output/ep006-config.json

# Modifica con i dati dell'episodio
```

### 1.2 Scrivi lo Script

Usa il template in `templates/intro-script.md` e `templates/outro-script.md`.

**Struttura script completo:**

```markdown
# Podcast Onde - Episodio XX
## "Titolo" di Autore

**Serie:** Piccole Rime
**Voce:** Gianni Parola
**Target:** Bambini 4-8 anni
**Durata stimata:** X minuti

---

## SCRIPT COMPLETO

### INTRO (30 secondi)
**[MUSICA: Descrizione]**
**GIANNI PAROLA:**
[Testo intro]

### LETTURA (XX secondi)
**[MUSICA: Descrizione]**
**GIANNI PAROLA:**
[Testo principale - poesia/storia]

### COMMENTO (XX secondi)
**[MUSICA: Descrizione]**
**GIANNI PAROLA:**
[Spiegazione per bambini]

### OUTRO (30 secondi)
**[MUSICA: Descrizione]**
**GIANNI PAROLA:**
[Saluto finale]

---

## NOTE DI REGIA
[Indicazioni tecniche]

## CREDITS
[Attribuzioni]
```

### 1.3 Estrai Testo Pulito per TTS

```bash
# Rimuovi indicazioni di regia, tieni solo il parlato
grep -v "^\*\*\[" script.md | grep -v "^---" | grep -v "^##" > script-clean.txt
```

---

## Step 2: Generazione Narrazione

### Opzione A: Edge TTS (Gratuito)

```python
#!/usr/bin/env python3
"""generate_narration.py - Edge TTS per podcast Onde"""

import asyncio
import edge_tts

# Configurazione Gianni Parola
VOICE = "it-IT-DiegoNeural"
RATE = "-15%"  # Piu lento per bambini
PITCH = "-5Hz"  # Leggermente piu grave

async def generate(text: str, output_file: str):
    communicate = edge_tts.Communicate(
        text,
        VOICE,
        rate=RATE,
        pitch=PITCH
    )
    await communicate.save(output_file)
    print(f"Audio generato: {output_file}")

if __name__ == "__main__":
    import sys

    # Leggi testo da file
    with open(sys.argv[1], 'r') as f:
        text = f.read()

    output = sys.argv[2] if len(sys.argv) > 2 else "narration.mp3"
    asyncio.run(generate(text, output))
```

**Uso:**
```bash
python generate_narration.py script-clean.txt output/ep006-narration.mp3
```

### Opzione B: ElevenLabs (Premium)

```python
#!/usr/bin/env python3
"""generate_narration_elevenlabs.py"""

import os
from elevenlabs import generate, save, set_api_key

set_api_key(os.environ.get("ELEVENLABS_API_KEY"))

# Voice ID di Gianni Parola (da configurare)
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_GIANNI", "default")

def generate_audio(text: str, output_file: str):
    audio = generate(
        text=text,
        voice=VOICE_ID,
        model="eleven_multilingual_v2",
        voice_settings={
            "stability": 0.50,
            "similarity_boost": 0.75,
            "style": 0.35,
            "use_speaker_boost": True
        }
    )
    save(audio, output_file)
    print(f"Audio generato: {output_file}")

if __name__ == "__main__":
    import sys
    with open(sys.argv[1], 'r') as f:
        text = f.read()
    generate_audio(text, sys.argv[2])
```

### Opzione C: XTTS-v2 (Locale, Alta Qualita')

```python
#!/usr/bin/env python3
"""generate_narration_xtts.py"""

import torch
from TTS.api import TTS

# Usa MPS su Apple Silicon
device = "mps" if torch.backends.mps.is_available() else "cpu"

# Carica modello
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

def generate_audio(text: str, output_file: str, reference_wav: str = None):
    if reference_wav:
        # Voice cloning
        tts.tts_to_file(
            text=text,
            language="it",
            speaker_wav=reference_wav,
            file_path=output_file
        )
    else:
        # Voce default
        tts.tts_to_file(
            text=text,
            language="it",
            file_path=output_file
        )
    print(f"Audio generato: {output_file}")

if __name__ == "__main__":
    import sys
    with open(sys.argv[1], 'r') as f:
        text = f.read()
    generate_audio(text, sys.argv[2])
```

---

## Step 3: Background Music

### 3.1 Genera con Suno

1. Vai su https://suno.com
2. Usa prompt appropriato per il tema (vedi `../music-ai/suno-prompts/`)
3. Genera 3-4 varianti
4. Scarica la migliore

### 3.2 Prepara Background

```bash
# Estendi a durata narrazione + margine
NARRATION_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 narration.mp3)
MUSIC_DURATION=$(echo "$NARRATION_DURATION + 10" | bc)

# Loop se necessario
ffmpeg -stream_loop -1 -i background-short.mp3 -t $MUSIC_DURATION -c copy background-extended.mp3

# Normalizza volume
ffmpeg -i background-extended.mp3 -af "volume=0.15" background-quiet.mp3
```

---

## Step 4: Assemblaggio

### 4.1 Mix Narrazione + Background

```bash
ffmpeg -i narration.mp3 -i background-quiet.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:weights=1 0.15" \
  mix-temp.mp3
```

### 4.2 Aggiungi Jingle Intro

```bash
ffmpeg -i assets/jingle-intro.mp3 -i mix-temp.mp3 \
  -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" \
  with-intro.mp3
```

### 4.3 Aggiungi Jingle Outro

```bash
ffmpeg -i with-intro.mp3 -i assets/jingle-outro.mp3 \
  -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" \
  assembled.mp3
```

### 4.4 Normalizza Audio Finale

```bash
# Normalizza a -14 LUFS (standard podcast)
ffmpeg -i assembled.mp3 \
  -af "loudnorm=I=-14:TP=-1:LRA=11" \
  -ar 44100 -ab 192k \
  final.mp3
```

---

## Step 5: Metadati ID3

### Aggiungi Metadati con FFmpeg

```bash
ffmpeg -i final.mp3 \
  -metadata title="Ep. 06 - Titolo Episodio" \
  -metadata artist="Onde - Gianni Parola" \
  -metadata album="Piccole Rime - Storie della Buonanotte" \
  -metadata year="2026" \
  -metadata genre="Podcast" \
  -metadata comment="Produzione Onde Publishing" \
  -codec copy \
  final-tagged.mp3
```

### Oppure con eyeD3

```bash
pip install eyeD3

eyeD3 --title "Ep. 06 - Titolo Episodio" \
      --artist "Onde - Gianni Parola" \
      --album "Piccole Rime - Storie della Buonanotte" \
      --year 2026 \
      --genre "Podcast" \
      final.mp3
```

---

## Step 6: Quality Check

Esegui la checklist in `quality-checklist.md`:

```bash
# Verifica durata
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 final.mp3

# Verifica loudness
ffmpeg -i final.mp3 -af "loudnorm=print_format=json" -f null - 2>&1 | grep "input_i"

# Verifica bitrate
ffprobe -v error -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 final.mp3
```

---

## Step 7: Upload e Distribuzione

### 7.1 Copia in Output Directory

```bash
EPISODE_ID="ep006"
mkdir -p output/podcast/$EPISODE_ID
mv final-tagged.mp3 output/podcast/$EPISODE_ID/$EPISODE_ID-final.mp3
cp script.md output/podcast/$EPISODE_ID/script.md
```

### 7.2 Aggiorna RSS Feed

```bash
cd apps/podcast-rss
# Aggiorna episodes.json
npm run generate
```

### 7.3 Upload su Spotify

1. Vai su https://podcasters.spotify.com/
2. Dashboard > Episodi > Nuovo Episodio
3. Carica MP3
4. Compila metadati
5. Schedule o Pubblica

---

## Script Completo Automazione

```bash
#!/bin/bash
# generate-episode.sh - Genera un episodio completo

set -e

EPISODE_ID=$1
SCRIPT_FILE=$2

if [ -z "$EPISODE_ID" ] || [ -z "$SCRIPT_FILE" ]; then
    echo "Uso: ./generate-episode.sh ep006 script.md"
    exit 1
fi

OUTPUT_DIR="output/podcast/$EPISODE_ID"
mkdir -p $OUTPUT_DIR

echo "=== Step 1: Estrazione testo ==="
grep -v "^\*\*\[" $SCRIPT_FILE | grep -v "^---" | grep -v "^##" > $OUTPUT_DIR/script-clean.txt

echo "=== Step 2: Generazione narrazione ==="
python scripts/generate_narration.py $OUTPUT_DIR/script-clean.txt $OUTPUT_DIR/narration.mp3

echo "=== Step 3: Mix con background ==="
ffmpeg -i $OUTPUT_DIR/narration.mp3 -i assets/background-default.mp3 \
  -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first" \
  $OUTPUT_DIR/mix-temp.mp3 -y

echo "=== Step 4: Aggiungi jingle ==="
ffmpeg -i assets/jingle-intro.mp3 -i $OUTPUT_DIR/mix-temp.mp3 -i assets/jingle-outro.mp3 \
  -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1" \
  $OUTPUT_DIR/assembled.mp3 -y

echo "=== Step 5: Normalizza ==="
ffmpeg -i $OUTPUT_DIR/assembled.mp3 \
  -af "loudnorm=I=-14:TP=-1:LRA=11" \
  -ar 44100 -ab 192k \
  $OUTPUT_DIR/$EPISODE_ID-final.mp3 -y

echo "=== Step 6: Cleanup ==="
rm $OUTPUT_DIR/mix-temp.mp3 $OUTPUT_DIR/assembled.mp3

echo "=== FATTO! ==="
echo "Output: $OUTPUT_DIR/$EPISODE_ID-final.mp3"
```

---

## Troubleshooting

### Problema: Audio troppo veloce/lento
- Modifica `RATE` in Edge TTS (es. "-20%" per piu' lento)

### Problema: Volume non uniforme
- Usa `loudnorm` filter con parametri custom

### Problema: Background copre voce
- Riduci volume background (es. `volume=0.10`)

### Problema: Clipping
- Riduci volume totale: `ffmpeg -af "volume=-3dB"`

---

*Documento creato: 9 Gennaio 2026*
*Task: podcast-pipeline-001*
