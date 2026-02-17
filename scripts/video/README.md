# Video Animation Scripts

Script per animare immagini statiche con effetti Ken Burns usando ffmpeg.

## Prerequisiti

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

## Scripts Disponibili

### 1. animate-image.sh

Anima una singola immagine con effetti Ken Burns (zoom/pan).

#### Uso Base

```bash
./animate-image.sh foto.jpg video.mp4
```

#### Opzioni

| Opzione | Descrizione | Default |
|---------|-------------|---------|
| `-d, --duration <sec>` | Durata del video | 5 |
| `-e, --effect <tipo>` | Tipo di effetto | zoom-in |
| `-i, --intensity <val>` | Intensità (0.1-0.5) | 0.2 |
| `-f, --fade <sec>` | Durata fade in/out | 0.5 |
| `-r, --resolution <WxH>` | Risoluzione output | 1920x1080 |
| `-fps, --framerate <n>` | Frame rate | 30 |
| `-q, --quality <crf>` | Qualità CRF (0-51, lower=better) | 18 |
| `--no-fade` | Disabilita fade in/out | - |

#### Effetti Disponibili

| Effetto | Descrizione |
|---------|-------------|
| `zoom-in` | Zoom lento verso il centro |
| `zoom-out` | Zoom lento dal centro verso l'esterno |
| `pan-left` | Movimento orizzontale da destra a sinistra |
| `pan-right` | Movimento orizzontale da sinistra a destra |
| `pan-up` | Movimento verticale dal basso verso l'alto |
| `pan-down` | Movimento verticale dall'alto verso il basso |
| `zoom-pan` | Combinazione di zoom e movimento diagonale |

#### Esempi

```bash
# Video di 10 secondi con zoom-out intenso
./animate-image.sh -d 10 -e zoom-out -i 0.3 foto.jpg video.mp4

# Video verticale per Instagram Stories (9:16)
./animate-image.sh -r 1080x1920 -e pan-down foto.jpg story.mp4

# Video alta qualità senza fade
./animate-image.sh -q 15 --no-fade -d 8 foto.jpg video.mp4

# Pan orizzontale lento
./animate-image.sh -e pan-left -i 0.15 -d 12 panorama.jpg video.mp4
```

### 2. batch-animate.js

Processa cartelle di immagini in batch con supporto parallelo.

#### Uso Base

```bash
node batch-animate.js ./images ./videos
```

#### Opzioni

| Opzione | Descrizione | Default |
|---------|-------------|---------|
| `-d, --duration <sec>` | Durata di ogni video | 5 |
| `-e, --effect <tipo>` | Effetto (o "random") | random |
| `-i, --intensity <val>` | Intensità effetto | 0.2 |
| `-f, --fade <sec>` | Durata fade | 0.5 |
| `-r, --resolution <WxH>` | Risoluzione | 1920x1080 |
| `-q, --quality <crf>` | Qualità CRF | 18 |
| `-p, --parallel <n>` | Processi paralleli | 2 |
| `-c, --concat` | Concatena tutti i video | - |
| `--concat-output <file>` | Nome file concatenato | output.mp4 |
| `--dry-run` | Simula senza eseguire | - |

#### Esempi

```bash
# Processa cartella con effetti casuali
node batch-animate.js ./images

# Tutti zoom-in, 8 secondi ciascuno, 4 processi paralleli
node batch-animate.js ./images ./videos -e zoom-in -d 8 -p 4

# Crea slideshow concatenato
node batch-animate.js ./images ./videos --concat --concat-output slideshow.mp4

# Preview (dry-run)
node batch-animate.js ./images --dry-run

# Video verticali per TikTok/Reels
node batch-animate.js ./images ./videos -r 1080x1920 -d 3 --concat
```

## Formati Supportati

### Input (Immagini)
- JPG/JPEG
- PNG
- WebP
- TIFF
- BMP

### Output (Video)
- MP4 (H.264)

## Tips

### Intensità Consigliata

| Uso | Intensità |
|-----|-----------|
| Sottile/elegante | 0.1 |
| Standard | 0.2 |
| Evidente | 0.3 |
| Dinamico | 0.4-0.5 |

### Durata Consigliata

| Piattaforma | Durata |
|-------------|--------|
| Instagram Reels | 3-5s |
| YouTube Shorts | 5-8s |
| Slideshow | 5-10s |
| Presentazioni | 8-15s |

### Risoluzioni Comuni

| Formato | Risoluzione |
|---------|-------------|
| Full HD (16:9) | 1920x1080 |
| 4K (16:9) | 3840x2160 |
| Instagram Stories (9:16) | 1080x1920 |
| Instagram Square (1:1) | 1080x1080 |
| TikTok/Reels (9:16) | 1080x1920 |

## Integrazione con Pipeline Onde

Questi script sono progettati per integrarsi con la pipeline di produzione video Onde:

```bash
# Esempio workflow
# 1. Genera immagini con AI
# 2. Anima immagini
node batch-animate.js ./generated-images ./animated -d 5 --concat

# 3. Aggiungi audio (con altro script)
# 4. Upload su piattaforme
```

## Troubleshooting

### "ffmpeg non trovato"
Installa ffmpeg con il package manager del tuo sistema.

### Video troppo pesante
- Aumenta il valore CRF (es. `-q 23`)
- Riduci la risoluzione
- Riduci il framerate (es. `-fps 24`)

### Effetto troppo veloce/lento
- Aumenta la durata per effetti più lenti
- Riduci l'intensità per movimenti più sottili

### Immagine distorta
- Usa immagini con aspect ratio simile all'output
- L'effetto zoom/pan compensa automaticamente, ma immagini troppo diverse possono apparire distorte
