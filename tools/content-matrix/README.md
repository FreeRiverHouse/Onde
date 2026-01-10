# Content Matrix Generator

**Matrice automatica: Libro X genera TUTTO**

Sistema/template JSON che per ogni libro genera automaticamente le specifiche complete per tutti i tipi di contenuti derivati.

## Output Generati

| Tipo | Quantita | Formato | Destinazione |
|------|----------|---------|--------------|
| **Audiobook** | 1 | m4b | Audible, Apple Books, Spotify |
| **Podcast Episode** | 1 | mp3 | Spotify, Apple Podcasts |
| **YouTube Long** | 1 | mp4 16:9 | YouTube |
| **YouTube Shorts** | 5 | mp4 9:16 | YouTube Shorts |
| **TikTok** | 5 | mp4 9:16 | TikTok |
| **Instagram Reels** | 5 | mp4 9:16 | Instagram, Facebook |
| **Tweets** | 10 | text + media | X/Twitter |
| **Spotify Track** | 1 | wav | Spotify, Apple Music |
| **Cartone Animato** | 1 | mp4 | YouTube, Prime Video |

## Usage

### Da un libro esistente

```bash
node generate-matrix.js --book /path/to/book/
```

### Da titolo e contenuto

```bash
node generate-matrix.js --title "Il Mio Libro" --author "Gianni Parola" --content story.md
```

### Con output personalizzato

```bash
node generate-matrix.js --book books/aiko/ --output ./my-matrices/
```

## Esempio Output

Dopo l'esecuzione, ottieni un file JSON completo:

```
output/matrices/aiko-ai-children-content-matrix.json
```

Con tutte le specifiche per:
- Formati video/audio
- Script e testi
- Prompt per AI (immagini, musica)
- Metadati per distribuzione
- Schedule di pubblicazione

## Template JSON

Il template base si trova in:

```
content-matrix-template.json
```

Contiene la struttura completa con tutti i campi disponibili per personalizzazione.

## Integrazione con Cross-Pollination

Questo tool genera le SPECIFICHE. Per la generazione effettiva dei contenuti:

1. `generate-matrix.js` → Genera specifiche JSON
2. `../cross-pollination/pollinate.js` → Esegue la generazione

Workflow consigliato:

```bash
# 1. Genera la matrice
node tools/content-matrix/generate-matrix.js --book books/mio-libro/

# 2. Review del JSON generato
cat output/matrices/mio-libro-content-matrix.json

# 3. Esegui cross-pollination
node tools/cross-pollination/pollinate.js --book books/mio-libro/
```

## Struttura Output JSON

```json
{
  "book": {
    "id": "mio-libro",
    "title": "Il Mio Libro",
    "slug": "mio-libro",
    "author": "Onde Publishing",
    "chapters": [...]
  },
  "audiobook": {
    "enabled": true,
    "specs": { "format": "m4b", "voice_id": "gianni-parola-v1", ... },
    "chapters": [...],
    "output": { "filename": "...", "path": "..." },
    "distribution": { "platforms": [...], "price_usd": 4.99 }
  },
  "podcast": { ... },
  "youtube_long": { ... },
  "youtube_shorts": { ... },
  "tiktok": { ... },
  "instagram_reels": { ... },
  "tweets": { ... },
  "spotify_track": { ... },
  "cartoon": { ... },
  "metadata": {
    "created_at": "...",
    "status": "draft"
  },
  "generation_queue": {
    "priority": 1,
    "estimated_time_hours": 5
  }
}
```

## Specifiche Dettagliate

### Audiobook

- Formato: M4B (compatibile iTunes/Audible)
- Voce: Gianni Parola (ElevenLabs)
- Include: intro, capitoli, outro
- Musica di sottofondo opzionale

### Podcast Episode

- Formato: MP3 192kbps
- Show: "Onde Stories - Storie della Buonanotte"
- Include: jingle, narrazione, CTA

### YouTube Long

- Risoluzione: 1920x1080
- Stile: Illustrazioni animate
- Include: thumbnail prompt, description, tags

### YouTube Shorts (5)

- Risoluzione: 1080x1920 (verticale)
- Durata max: 60 secondi
- Varieta: hook, personaggi, lezione, teaser, finale

### TikTok (5)

- Risoluzione: 1080x1920
- Formati: teaser, character-intro, moral, behind-scenes, reading
- Include: suggerimenti sound/hashtag

### Instagram Reels (5)

- Risoluzione: 1080x1920
- Durata max: 90 secondi
- Include: caption, cover text, cross-post FB

### Tweets (10)

- Tipi: announcement, quote, behind-scenes, character, educational, engagement, testimonial, fun-fact, milestone, throwback
- Schedule: distribuiti su 30 giorni

### Spotify Track

- Formato: WAV 44.1kHz 16bit
- Stile: Italian lullaby, piano, strings
- Generatore: Suno AI
- Include: prompt ottimizzato

### Cartone Animato

- Risoluzione: 1920x1080
- Stile: 2D watercolor animato
- Include: storyboard prompts, voice assignments

## Requisiti

- Node.js 18+
- Libri in formato markdown con struttura standard

## File Structure

```
tools/content-matrix/
├── README.md
├── content-matrix-template.json  # Template base riutilizzabile
├── generate-matrix.js            # Script generatore
└── examples/                     # Esempi output (opzionale)
```

## TODO

- [ ] Schema JSON per validazione
- [ ] CLI interattiva
- [ ] Integrazione diretta con API (ElevenLabs, Suno, etc.)
- [ ] Dashboard web per gestione matrici
- [ ] Batch processing per multipli libri
