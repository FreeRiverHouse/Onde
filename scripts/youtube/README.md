# YouTube Shorts Automation

Script per creare e pubblicare YouTube Shorts automaticamente.

## Prerequisiti

```bash
# macOS
brew install ffmpeg

# Node.js dependencies (per upload)
npm install googleapis
```

## Script Disponibili

### 1. create-short.sh

Crea un singolo YouTube Short da immagine + audio.

```bash
./create-short.sh immagine.jpg audio.mp3 output.mp4
```

**Opzioni:**
| Opzione | Descrizione | Default |
|---------|-------------|---------|
| `-t, --title` | Titolo sovrapposto | - |
| `-s, --subtitle` | Sottotitolo | - |
| `-e, --effect` | zoom-in, zoom-out, pan-up, pan-down | zoom-in |
| `-d, --duration` | Durata forzata (sec) | durata audio |
| `-f, --fade` | Fade in/out (sec) | 0.3 |
| `--no-text` | Nessun testo overlay | - |

**Esempi:**
```bash
# Short base
./create-short.sh foto.jpg voce.mp3 short.mp4

# Con titolo e effetto
./create-short.sh foto.jpg voce.mp3 short.mp4 -t "Stella Stellina" -e zoom-out

# Pan verticale per poesie
./create-short.sh panorama.jpg recita.mp3 short.mp4 -e pan-down
```

### 2. batch-shorts.js

Genera shorts in batch da una cartella strutturata.

**Struttura cartella:**
```
input/
├── 01-stella-stellina/
│   ├── image.jpg
│   ├── audio.mp3
│   └── meta.json (opzionale)
├── 02-pioggerellina/
│   ├── image.png
│   └── audio.wav
└── 03-befana/
    ├── image.jpg
    ├── audio.m4a
    └── meta.json
```

**Formato meta.json:**
```json
{
  "title": "Stella Stellina",
  "subtitle": "Ninna nanna tradizionale",
  "effect": "zoom-out"
}
```

**Uso:**
```bash
node batch-shorts.js ./input ./output

# Con opzioni
node batch-shorts.js ./input -e pan-up -p 4

# Dry run
node batch-shorts.js ./input --dry-run
```

### 3. upload-short.js

Carica shorts su YouTube via API.

**Setup iniziale:**
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto
3. Abilita "YouTube Data API v3"
4. Crea credenziali OAuth 2.0 (tipo "Desktop app")
5. Scarica il JSON e salvalo come `youtube-credentials.json`
6. Esegui autenticazione:
   ```bash
   node upload-short.js --auth
   ```

**Uso:**
```bash
node upload-short.js short.mp4 --title "Stella Stellina" --privacy public

# Con tags e descrizione
node upload-short.js short.mp4 \
  --title "Stella Stellina" \
  --description "Ninna nanna tradizionale italiana" \
  --tags "poesia,bambini,ninna nanna" \
  --privacy public
```

**Privacy:**
- `private` - Solo tu puoi vedere (default)
- `unlisted` - Chi ha il link può vedere
- `public` - Tutti possono vedere

## Workflow Completo

### 1. Prepara i contenuti

```
content/
├── 01-stella-stellina/
│   ├── image.jpg      # Illustrazione 1080x1920 o simile
│   ├── audio.mp3      # Voce narrante
│   └── meta.json      # {"title": "Stella Stellina"}
└── 02-pioggerellina/
    └── ...
```

### 2. Genera i video

```bash
node batch-shorts.js ./content ./shorts -p 4
```

### 3. Verifica manualmente

Apri i video generati in `./shorts/` e verifica qualita'.

### 4. Carica su YouTube

```bash
# Uno alla volta
node upload-short.js ./shorts/01-stella-stellina.mp4 --title "Stella Stellina" --privacy unlisted

# Oppure crea uno script batch
for f in ./shorts/*.mp4; do
  name=$(basename "$f" .mp4)
  node upload-short.js "$f" --title "$name" --privacy private
done
```

## Formato Ottimale

| Parametro | Valore |
|-----------|--------|
| Risoluzione | 1080x1920 (9:16) |
| FPS | 30 |
| Durata | < 60 secondi |
| Codec video | H.264 |
| Codec audio | AAC |
| Bitrate audio | 192 kbps |

## Tips

### Immagini per Shorts
- Usa immagini verticali o quadrate
- Minimo 1080px di larghezza
- Evita troppo dettaglio ai bordi (verranno tagliati)

### Audio
- Normalizza il volume prima di usare
- Aggiungi un fade in/out se l'audio inizia/finisce bruscamente
- Durata ideale: 15-30 secondi

### Effetti
- `zoom-in`: Classico, attira attenzione al centro
- `zoom-out`: Reveal, mostra contesto
- `pan-up`: Buono per testo/poesie verticali
- `pan-down`: Movimento naturale di lettura

## Troubleshooting

### "ffmpeg not found"
```bash
brew install ffmpeg
```

### "Quota exceeded" (YouTube)
YouTube ha limiti giornalieri. Aspetta 24 ore o aumenta la quota nel Cloud Console.

### Video non appare come Short
- Verifica che sia verticale (9:16)
- Verifica che duri < 60 secondi
- Aggiungi #Shorts nella descrizione
