# Onde One-Click Publishing Pipeline

Script per orchestrare la pubblicazione multi-piattaforma da un singolo comando.

## Panoramica

Questo script automatizza il processo di preparazione e pubblicazione dei contenuti Onde su tutte le piattaforme supportate:

| Piattaforma | Formati | Tipo Contenuto |
|-------------|---------|----------------|
| **KDP** | ePub, PDF | Libri, eBook |
| **Spotify** | MP3 | Podcast, Audiolibri |
| **YouTube** | MP4, Thumbnail | Video, Storie animate |
| **TikTok** | MP4 (9:16) | Video brevi verticali |
| **Instagram** | Image, Carousel, Reel | Immagini, Storie |
| **X** | Text, Image, Video | Post social |

## Uso

### Comando Base

```bash
# Pubblica su TUTTE le piattaforme
node scripts/publish/publish-all.js --book <book-id>

# Pubblica solo su piattaforme specifiche
node scripts/publish/publish-all.js --book piccole-rime --platforms kdp,youtube

# Mostra piattaforme disponibili
node scripts/publish/publish-all.js --list-platforms

# Help
node scripts/publish/publish-all.js --help
```

### Esempi

```bash
# Pubblica "Piccole Rime" ovunque
node scripts/publish/publish-all.js --book piccole-rime

# Solo YouTube e TikTok per "AIKO"
node scripts/publish/publish-all.js --book aiko-ai-children --platforms youtube,tiktok

# Solo KDP per un nuovo libro
node scripts/publish/publish-all.js --book salmo-23-bambini --platforms kdp
```

## Workflow

### 1. Preparazione

Lo script:
1. Carica i metadati del libro da `books/<book-id>/metadata.json`
2. Scansiona gli asset esistenti (immagini, audio, video, PDF, ePub)
3. Identifica cosa manca per ogni piattaforma

### 2. Generazione Formati

Per ogni piattaforma, verifica/genera i formati necessari:

- **ePub**: Usa `scripts/factory/generate-epub.js`
- **Audio**: Usa `scripts/factory/generate-audio.js` (ElevenLabs)
- **Video**: Combina immagini + audio con FFmpeg
- **Thumbnail**: Usa prima immagine o genera con Grok

### 3. Preparazione Metadati

Prepara i metadati specifici per ogni piattaforma:

- **KDP**: Titolo, autore, descrizione, categorie, prezzo
- **YouTube**: Titolo, descrizione, tag, categoria, privacy
- **TikTok**: Caption, hashtag, sound
- **Instagram**: Caption, hashtag, alt text
- **X**: Testo (max 280 char), no hashtag

### 4. Output

Lo script genera:
1. **Log completo** delle azioni da fare
2. **Manifest JSON** con tutti i dettagli
3. **Comandi esatti** per ogni upload

## Struttura File

```
scripts/publish/
├── README.md           # Questa documentazione
└── publish-all.js      # Script principale

books/<book-id>/
├── metadata.json       # Metadati del libro
├── images/             # Illustrazioni
├── audio/              # File audio (se esistente)
├── video/              # File video (se esistente)
└── *.epub, *.pdf       # Formati finali

output/<book-id>/
└── publish-manifest.json  # Output dello script
```

## metadata.json

Esempio di file metadata per un libro:

```json
{
  "title": "Piccole Rime",
  "author": "Onde Publishing",
  "description": "Una raccolta di filastrocche per bambini...",
  "language": "it",
  "categories": ["Children's Books", "Poetry"],
  "keywords": ["filastrocche", "bambini", "poesia"],
  "price": {
    "amount": 2.99,
    "currency": "EUR"
  },
  "tags": ["bambini", "storie", "italiano"],
  "hashtags": ["#storieperbambini", "#filastrocche"],
  "youtubeTitle": "Piccole Rime - Filastrocche per Bambini",
  "xText": "Nuova raccolta di filastrocche per bambini"
}
```

## Piattaforme

### KDP (Kindle Direct Publishing)

- **Formati richiesti**: ePub, PDF
- **Upload manuale**: https://kdp.amazon.com
- **Note**: Richiede account KDP, ISBN opzionale

### Spotify

- **Formati richiesti**: MP3
- **Upload manuale**: https://podcasters.spotify.com
- **Note**: Richiede account Spotify for Podcasters

### YouTube

- **Formati richiesti**: MP4, Thumbnail (JPG/PNG)
- **Upload automatico**: `node scripts/factory/youtube-upload.js`
- **Note**: Richiede OAuth setup, vedi youtube-upload.js

### TikTok

- **Formati richiesti**: MP4 verticale (9:16)
- **Upload**: App TikTok o Creator Portal
- **Note**: Max 3 minuti, vertical video

### Instagram

- **Formati richiesti**: Immagini (1:1 o 4:5), Reel (9:16)
- **Upload**: App o Meta Business Suite
- **Note**: Carousel max 10 immagini

### X (Twitter)

- **Formati richiesti**: Testo, Immagine/Video opzionale
- **Upload**: API o @OndePR_bot (`/onde <text>`)
- **Note**: Max 280 caratteri, NO hashtag (regola Onde)

## Integrazione con Factory

Lo script usa gli altri script della factory:

```
scripts/factory/
├── generate-epub.js      # Generazione ePub
├── generate-audio.js     # Audio con ElevenLabs
├── youtube-upload.js     # Upload YouTube
├── prepare-assets.js     # Preparazione asset
└── translate-content.js  # Traduzioni
```

## Note

### Logging

Tutti i log vengono salvati in `logs/publish-all.log`.

### Manifest

Ogni esecuzione genera un manifest JSON con tutti i dettagli:
- Asset esistenti
- Asset mancanti
- Metadati per piattaforma
- Stato ready/not ready

### Azioni Manuali

Lo script **non fa upload automatici** (tranne YouTube se configurato).
Genera invece la lista delle azioni da fare per ogni piattaforma.

## Troubleshooting

### "Book not found"

Verifica che la cartella esista in `books/<book-id>/`.

### "Needs generation"

L'asset richiesto non esiste. Esegui il comando suggerito per generarlo.

### Metadati mancanti

Crea/aggiorna `books/<book-id>/metadata.json` con i campi necessari.

## Roadmap

- [ ] Upload automatico YouTube (gia' supportato)
- [ ] Upload automatico X via API
- [ ] Integrazione Meta API per Instagram
- [ ] Generazione video automatica con FFmpeg
- [ ] Dashboard web per monitoraggio

---

*Onde Factory - One-Click Publishing Pipeline v1.0*
