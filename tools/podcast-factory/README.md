# Podcast Factory - Onde

> Pipeline completa per generare episodi podcast: script, narrazione, musica, assemblaggio e distribuzione.

---

## Quick Start

```bash
# 1. Crea configurazione episodio
cp templates/episode-config.json episodes/ep00X-config.json

# 2. Scrivi lo script (Gianni Parola voice)
# Usa il template in templates/episode-script-template.md

# 3. Genera audio narrazione
# ElevenLabs o Edge TTS (vedi scripts/generate-episode.md)

# 4. Genera/seleziona background music
# Suno AI (vedi ../music-ai/)

# 5. Assembla con ffmpeg
ffmpeg -i narration.mp3 -i background.mp3 -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first" output.mp3

# 6. Export finale per Spotify/Apple
# Vedi quality-checklist.md
```

---

## Struttura Directory

```
tools/podcast-factory/
├── README.md                 # Questa guida
├── templates/
│   ├── episode-config.json   # Template configurazione episodio
│   ├── intro-script.md       # Script intro standard
│   └── outro-script.md       # Script outro standard
├── assets/
│   └── jingles.md            # Specifiche jingle intro/outro
├── scripts/
│   ├── generate-episode.md   # Workflow completo singolo episodio
│   └── batch-generate.md     # Workflow batch per multipli episodi
└── quality-checklist.md      # QC pre-pubblicazione

# Output directory (generata)
output/podcast/
├── ep001-[titolo]/
│   ├── script.md
│   ├── narration.mp3
│   ├── background.mp3
│   ├── final.mp3
│   └── metadata.json
```

---

## Workflow Produzione Episodio

### Fase 1: Script Writing (Gianni Parola Voice)

La voce narrante del podcast Onde e' **Gianni Parola**: calda, rassicurante, paterna.

**Struttura standard episodio (4-6 minuti):**

| Sezione | Durata | Contenuto |
|---------|--------|-----------|
| **Jingle Intro** | 3 sec | Suono onde + "Onde" |
| **Intro** | 20-30 sec | Saluto, presentazione episodio |
| **Lettura/Contenuto** | 60-180 sec | Testo principale (poesia, storia, etc.) |
| **Commento** | 60-90 sec | Spiegazione per bambini |
| **Outro** | 20-30 sec | Saluto finale, anticipazione prossimo |
| **Jingle Outro** | 3 sec | Suono onde |

**Riferimenti script esistenti:**
- `content/podcast/ep02-pioggerellina-script.md`
- `content/podcast/ep03-befana-script.md`
- `content/podcast/ep04-pulcino-script.md`
- `content/podcast/ep05-pesciolino-script.md`

### Fase 2: Narrazione (ElevenLabs / Edge TTS)

**Opzione A - ElevenLabs (Qualita premium)**

```python
# Impostazioni Gianni Parola
voice_settings = {
    "stability": 0.50,          # Leggermente variato, naturale
    "clarity": 0.75,            # Chiaro ma non robotico
    "style": "warm, grandfatherly, storytelling"
}
```

**Opzione B - Edge TTS (Gratuito)**

```python
import edge_tts

VOICE = "it-IT-DiegoNeural"
RATE = "-15%"  # Piu lento per bambini
PITCH = "-5Hz" # Leggermente piu grave

async def generate():
    communicate = edge_tts.Communicate(TEXT, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save("output.mp3")
```

**Opzione C - TTS Locale (Vedi tools/audio-gen/LOCAL-TTS-SETUP.md)**
- XTTS-v2 per qualita
- Piper per velocita

### Fase 3: Background Music (Suno AI)

**Stili consigliati per podcast bambini:**

| Tipo Episodio | Stile Musica | BPM |
|---------------|--------------|-----|
| Poesia natura | Ambient piano, archi leggeri | 60-70 |
| Favola | Music box, arpa, flauto | 70-80 |
| Ninna nanna | Piano dolce, pad morbidi | 50-60 |
| Avventura | Legno, percussioni leggere | 80-90 |

**Prompt esempio per Suno:**
```
Gentle Italian children's podcast background music,
soft piano and warm strings, 65 BPM,
cozy bedtime atmosphere, no vocals,
subtle and unobtrusive, European lullaby feel
[Instrumental]
```

**Riferimenti:** `tools/music-ai/suno-prompts/`

### Fase 4: Assemblaggio con FFmpeg

**Script base assemblaggio:**

```bash
#!/bin/bash
EPISODE_ID=$1
NARRATION="$EPISODE_ID-narration.mp3"
BACKGROUND="$EPISODE_ID-background.mp3"
INTRO_JINGLE="assets/jingle-intro.mp3"
OUTRO_JINGLE="assets/jingle-outro.mp3"
OUTPUT="$EPISODE_ID-final.mp3"

# Mix narrazione + background (background al 15%)
ffmpeg -i "$NARRATION" -i "$BACKGROUND" \
  -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first" \
  temp-mix.mp3

# Aggiungi jingle intro
ffmpeg -i "$INTRO_JINGLE" -i temp-mix.mp3 \
  -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" \
  temp-with-intro.mp3

# Aggiungi jingle outro
ffmpeg -i temp-with-intro.mp3 -i "$OUTRO_JINGLE" \
  -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" \
  "$OUTPUT"

# Normalizza audio (-14 LUFS per podcast)
ffmpeg -i "$OUTPUT" -af loudnorm=I=-14:TP=-1:LRA=11 \
  -ar 44100 -ab 192k "${OUTPUT%.mp3}-normalized.mp3"

# Cleanup
rm temp-*.mp3
```

### Fase 5: Export per Piattaforme

**Formato finale obbligatorio:**

| Parametro | Valore |
|-----------|--------|
| Codec | MP3 |
| Bitrate | 192 kbps (min 128) |
| Sample Rate | 44.1 kHz |
| Canali | Stereo (consigliato) o Mono |
| Loudness | -14 LUFS |
| Max True Peak | -1 dB |

**Metadati ID3 obbligatori:**
- Title: "Ep. XX - Titolo Episodio"
- Artist: "Onde - Gianni Parola"
- Album: "Piccole Rime - Storie della Buonanotte"
- Year: 2026
- Genre: Podcast / Children
- Comment: Credits e copyright

---

## Batch Processing

Per generare multipli episodi, vedi `scripts/batch-generate.md`

**Esempio batch:**
```bash
# Genera 5 episodi in serie
for i in 01 02 03 04 05; do
  ./scripts/generate-single.sh ep$i
done
```

---

## Distribuzione

### Spotify for Podcasters

1. Accedi a https://podcasters.spotify.com/
2. Carica episodio con metadati
3. Schedule o pubblica immediatamente

**Guida completa:** `content/podcast/SPOTIFY-SETUP-GUIDE.md`

### Apple Podcasts

1. Accedi a https://podcastsconnect.apple.com/
2. Verifica RSS feed
3. Submit per review

### RSS Feed Self-Hosted

Usa `apps/podcast-rss/` per generare feed RSS custom.

---

## Episodi Esistenti (Riferimento)

### Batch 01-05

| Ep | Titolo | Autore | Status |
|----|--------|--------|--------|
| 01 | Stella Stellina | Lina Schwarz | Script pronto |
| 02 | Che Dice la Pioggerellina | A.S. Novaro | Script pronto |
| 03 | La Befana | Guido Gozzano | Script pronto |
| 04 | Il Pulcino Bagnato | Tradizionale | Script pronto |
| 05 | Il Pesciolino d'Oro | A. Pushkin | Script pronto |

### Batch 06-10

| Ep | Titolo | Autore | Status |
|----|--------|--------|--------|
| 06 | La Lumachella | Trilussa | Script pronto |
| 07 | Il Salmo 23 | Gianni Parola | Script pronto |
| 08 | La Formica e la Cicala | Esopo/La Fontaine | Script pronto |
| 09 | Il Bruco e la Farfalla | Onde Original | Script pronto |
| 10 | Buonanotte Bambini | Onde Original | Script pronto |

**File batch:** `content/podcast-episodes/EPISODES-BATCH-02.md` e `EPISODES-BATCH-03.md`

---

## Checklist Pre-Pubblicazione

Vedi `quality-checklist.md` per la checklist completa.

**Quick check:**
- [ ] Audio 192kbps MP3
- [ ] Loudness -14 LUFS
- [ ] Jingle intro/outro presenti
- [ ] Nessun clipping o distorsione
- [ ] Metadati ID3 completi
- [ ] Durata 4-8 minuti
- [ ] Titolo segue naming convention

---

## Tools Collegati

| Tool | Path | Uso |
|------|------|-----|
| TTS Locale | `tools/audio-gen/` | Generazione voce |
| Music AI | `tools/music-ai/` | Background music |
| Lip Sync | `tools/lip-sync/` | Video animati |
| RSS Server | `apps/podcast-rss/` | Feed RSS |

---

## Risorse Utili

- **ElevenLabs**: https://elevenlabs.io
- **Edge TTS**: `pip install edge-tts`
- **Suno AI**: https://suno.com
- **FFmpeg**: https://ffmpeg.org
- **Spotify for Podcasters**: https://podcasters.spotify.com

---

*Documento creato: 9 Gennaio 2026*
*Task: podcast-pipeline-001*
*Autore: Code Worker (Fabbrica Onde)*
