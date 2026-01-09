# Onde Instagram Reels Automation

Sistema automatico per generare e gestire Instagram Reels.

## Caratteristiche

- Genera Reels 9:16 (1080x1920) da immagini
- Effetto Ken Burns (zoom lento)
- Slideshow con transizioni fade
- Overlay testo
- Sistema di code per batch processing
- Pronto per Meta Graph API

## Installazione

```bash
cd tools/instagram-reels
npm install
```

Richiede ffmpeg installato:
```bash
brew install ffmpeg
```

## Uso

### Generare un Reel Singolo

```bash
# Da immagine statica (15 secondi, effetto Ken Burns)
node generate-reel.js immagine.jpg

# Con audio
node generate-reel.js immagine.jpg musica.mp3

# Output specifico
node generate-reel.js immagine.jpg musica.mp3 output/mio-reel.mp4
```

### Slideshow da Multiple Immagini

```bash
node generate-reel.js slideshow img1.jpg img2.jpg img3.jpg --audio music.mp3
```

### Gestione Coda

```bash
# Aggiungere job alla coda
node queue-manager.js add --image cover.jpg --audio music.mp3

# Vedere statistiche
node queue-manager.js stats

# Listare job
node queue-manager.js list pending
node queue-manager.js list completed
```

## Formati Supportati

### Input
- **Immagini**: JPG, PNG, WEBP
- **Audio**: MP3, AAC, WAV

### Output
- **Video**: MP4 (H.264 + AAC)
- **Dimensioni**: 1080x1920 (9:16)
- **FPS**: 30
- **Durata**: 15-60 secondi

## Struttura Progetto

```
instagram-reels/
├── generate-reel.js    # Generatore video
├── queue-manager.js    # Gestione coda
├── process-queue.js    # Worker coda
├── output/             # Reels generati
├── temp/               # File temporanei
└── queue.json          # Stato coda
```

## Workflow Tipico per Onde

1. **Prepara contenuto**
   - Immagine da libro/copertina
   - Audio (musica o narrazione)

2. **Genera Reel**
   ```bash
   node generate-reel.js copertina.jpg ninna-nanna.mp3
   ```

3. **Aggiungi alla coda pubblicazione**
   ```bash
   node queue-manager.js add \
     --video output/reel-123.mp4 \
     --caption "Stella Stellina - ninna nanna della tradizione italiana" \
     --hashtags "ninna,nanna,bambini,storie"
   ```

4. **Pubblica su Instagram**
   - Manuale: scarica e carica da telefono
   - Automatico: Meta Graph API (richiede business account)

## Note sulla Pubblicazione

### Manuale (Consigliato per ora)
1. Trasferisci video su telefono (AirDrop, Drive, etc.)
2. Apri Instagram
3. Crea nuovo Reel
4. Carica video
5. Aggiungi caption e hashtag

### Automatica (Meta Graph API)
Richiede:
- Account Instagram Business
- Facebook Page collegata
- App Facebook Developer
- Access Token con permessi:
  - `instagram_basic`
  - `instagram_content_publish`
  - `pages_read_engagement`

## Prossimi Sviluppi

- [ ] Integrazione Meta Graph API
- [ ] Scheduling pubblicazioni
- [ ] Templates per diversi tipi di contenuto
- [ ] Analytics post-pubblicazione
- [ ] Generazione automatica caption con AI

---

*Onde Publishing - 2026*
