# Onde Podcast RSS Feed

Sistema per generare e servire il feed RSS del podcast "Piccole Rime - Storie della Buonanotte".

## Quick Start

```bash
cd apps/podcast-rss
npm install
npm run generate   # Genera feed.xml
npm start          # Avvia server
```

Server disponibile su http://localhost:3001

## Struttura

```
podcast-rss/
├── episodes.json    # Database episodi
├── generate-feed.js # Generatore RSS
├── server.js        # Server Express
├── public/
│   └── feed.xml     # Feed generato
└── audio/           # File MP3 episodi
```

## Aggiungere Episodi

1. Modifica `episodes.json` aggiungendo nuovo episodio
2. Aggiungi file audio in `audio/`
3. Esegui `npm run generate`

Oppure via API:

```bash
curl -X POST http://localhost:3001/api/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuovo Episodio",
    "description": "Descrizione...",
    "author": "Autore Originale",
    "narrator": "Gianni Parola",
    "audioFile": "ep004-titolo.mp3",
    "duration": "00:03:00",
    "explicit": false,
    "keywords": ["keyword1", "keyword2"]
  }'
```

## Distribuzione

### Spotify for Podcasters
1. Vai a https://podcasters.spotify.com/
2. "Add your podcast"
3. Inserisci URL del feed: `https://onde.it/podcast/feed.xml`

### Apple Podcasts
1. Vai a https://podcastsconnect.apple.com/
2. "New Show" > "Add a show with an RSS feed"
3. Inserisci URL del feed

### Google Podcasts
1. Vai a https://podcastsmanager.google.com/
2. "Add a podcast"
3. Inserisci URL del feed

## Validazione

Prima di sottomettere, valida il feed:
- https://podba.se/validate/
- https://castfeedvalidator.com/
- https://www.rssboard.org/rss-validator/

## Requisiti Piattaforme

### Spotify
- Cover: minimo 1400x1400px, massimo 3000x3000px
- Audio: MP3, AAC o Ogg Vorbis
- Descrizione: minimo 150 caratteri

### Apple Podcasts
- Cover: esattamente 3000x3000px, JPEG o PNG
- Audio: MP3 o AAC
- Email proprietario richiesta

## Note

- Il feed include tutti i tag iTunes per compatibilita' Apple Podcasts
- I file audio devono essere hostati su URL pubblici HTTPS
- Aggiornare `PODCAST_BASE_URL` in produzione

---

*Onde Publishing - 2026*
