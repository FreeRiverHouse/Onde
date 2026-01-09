# Multi-Platform Auto-Post System

Sistema di auto-posting che permette di approvare contenuti via Telegram e pubblicarli automaticamente su X, Instagram, TikTok e YouTube.

## Workflow

```
1. Contenuto aggiunto alla coda (CLI o API)
         |
         v
2. Notifica Telegram con bottoni Approva/Rifiuta
         |
         v
3. Mattia approva da iPhone (anche mentre lava i piatti!)
         |
         v
4. Sistema posta automaticamente su tutte le piattaforme
         |
         v
5. Log del risultato e conferma su Telegram
```

## Quick Start

```bash
# 1. Test connessione Telegram
node multi-post.js test

# 2. Aggiungi un post alla coda
node multi-post.js add "Nuovo libro in arrivo!" --platforms x,ig --account onde

# 3. Avvia polling per ricevere approvazioni
node multi-post.js poll
```

## Comandi

### `add "testo"` - Aggiungi post alla coda

Aggiunge un nuovo post alla coda e invia richiesta di approvazione su Telegram.

```bash
# Post solo su X (default)
node multi-post.js add "Hello world!"

# Post su multiple piattaforme
node multi-post.js add "Nuovo video!" --platforms x,ig,tiktok

# Specifica account X
node multi-post.js add "Building in public" --account frh --platforms x

# Con media
node multi-post.js add "Guarda questa illustrazione!" --media https://cdn.onde.surf/img.jpg

# Video per TikTok
node multi-post.js add "Ninna nanna" --platforms tiktok --media /path/to/video.mp4
```

Opzioni:
- `--platforms` - Lista piattaforme separate da virgola: `x`, `ig`, `tiktok`, `youtube`
- `--account` - Account X da usare: `onde`, `frh`, `magmatic`
- `--media` - URL o path del media (immagine o video)

### `poll` - Avvia polling Telegram

Avvia il bot in modalita' polling per ricevere approvazioni da Telegram.

```bash
node multi-post.js poll
```

Il bot risponde a:
- **Bottone Approva** - Pubblica il post su tutte le piattaforme
- **Bottone Rifiuta** - Scarta il post
- **Bottone Anteprima** - Mostra il testo completo
- **Bottone Modifica** - Permette di editare il testo

### `process` - Processa coda approvati

Processa tutti gli item approvati nella coda (utile per cron job).

```bash
node multi-post.js process
```

### `status` - Mostra stato coda

```bash
node multi-post.js status
```

### `test` - Test connessione

```bash
node multi-post.js test
```

## Configurazione

### File `config.json`

Contiene la configurazione delle piattaforme e degli account.

```json
{
  "platforms": {
    "x": {
      "enabled": true,
      "accounts": {
        "onde": { "name": "Onde_FRH", "envPrefix": "X_ONDE" },
        "frh": { "name": "FreeRiverHouse", "envPrefix": "X_FRH" },
        "magmatic": { "name": "magmatic__", "envPrefix": "X_MAGMATIC" }
      }
    },
    "instagram": { "enabled": true },
    "tiktok": { "enabled": true },
    "youtube": { "enabled": false }
  },
  "telegram": {
    "botToken": "...",
    "chatId": "..."
  }
}
```

### File `.env`

Credenziali API (nella root del progetto):

```bash
# X/Twitter API
X_ONDE_API_KEY=...
X_ONDE_API_SECRET=...
X_ONDE_ACCESS_TOKEN=...
X_ONDE_ACCESS_SECRET=...

# Instagram Graph API
INSTAGRAM_BUSINESS_ACCOUNT_ID=...
INSTAGRAM_ACCESS_TOKEN=...

# TikTok
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
TIKTOK_ACCESS_TOKEN=...

# Telegram (gia' configurato)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

## Piattaforme Supportate

### X (Twitter)

- **API**: Twitter API v2 con OAuth 1.0a
- **Account**: `onde`, `frh`, `magmatic`
- **Media**: Testo (TODO: immagini e video)
- **Credenziali**: `X_[ACCOUNT]_API_KEY`, `X_[ACCOUNT]_API_SECRET`, etc.

### Instagram

- **API**: Meta Graph API
- **Requisiti**: Business Account collegato a Facebook Page
- **Media**: Immagini (JPEG/PNG), Video (MP4/MOV), Carousel
- **Credenziali**: `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN`

Vedi `../instagram/SETUP-GUIDE.md` per la configurazione.

### TikTok

- **API**: TikTok Content Posting API
- **Requisiti**: Creator Account, App approvata
- **Media**: Solo video (MP4/MOV/WebM)
- **Privacy**: `SELF_ONLY`, `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`
- **Credenziali**: `TIKTOK_ACCESS_TOKEN`

Vedi `../tiktok/README.md` per la configurazione OAuth.

### YouTube (Coming Soon)

- **API**: YouTube Data API v3
- **Requisiti**: Google Cloud Project, OAuth2
- **Media**: Video
- **Status**: Non ancora implementato

## Coda e Logging

### Queue File

La coda e' salvata in `queue.json`:

```json
{
  "items": [
    {
      "id": 1736380800000,
      "status": "pending_approval",
      "platforms": ["x", "ig"],
      "xAccount": "onde",
      "text": "Nuovo libro!",
      "mediaUrl": "https://...",
      "telegramMessageId": 123,
      "results": {},
      "createdAt": "2026-01-09T00:00:00Z"
    }
  ]
}
```

Stati possibili:
- `pending_approval` - In attesa di approvazione
- `approved` - Approvato, in attesa di pubblicazione
- `posting` - Pubblicazione in corso
- `posted` - Pubblicato con successo
- `partial_failure` - Pubblicato su alcune piattaforme
- `rejected` - Rifiutato

### Log Files

I log sono salvati in `logs/YYYY-MM-DD.log`:

```json
{"timestamp":"2026-01-09T12:00:00Z","level":"info","message":"Posted to X","account":"onde"}
```

## Integrazione con Approval Dashboard

Il sistema si integra con la Approval Dashboard esistente (porta 3456):

```javascript
// Da approval-dashboard, aggiungi item approvato
const multiPost = require('./multi-post');

multiPost.addToQueue({
  text: item.caption,
  platforms: ['x', 'ig'],
  xAccount: 'onde',
  mediaUrl: item.image,
  status: 'approved' // Skip approvazione Telegram
});
```

## Uso come Modulo

```javascript
const { MultiPoster, addToQueue } = require('./multi-post');

// Aggiungi alla coda
const item = addToQueue({
  text: 'Hello world!',
  platforms: ['x'],
  xAccount: 'onde'
});

// Posta direttamente (senza approvazione)
const poster = new MultiPoster();
const results = await poster.postToAllPlatforms(item);
```

## Automazione

### Cron Job per Processing

```bash
# Ogni 5 minuti, processa coda approvati
*/5 * * * * cd /path/to/multi-post && node multi-post.js process >> /var/log/multi-post.log 2>&1
```

### Daemon con PM2

```bash
# Avvia polling come daemon
pm2 start multi-post.js --name "onde-multipost" -- poll

# Vedi log
pm2 logs onde-multipost

# Restart
pm2 restart onde-multipost
```

### Systemd Service

```ini
[Unit]
Description=Onde Multi-Post Bot
After=network.target

[Service]
Type=simple
User=mattia
WorkingDirectory=/Users/mattia/Projects/Onde/tools/social-automation/multi-post
ExecStart=/usr/local/bin/node multi-post.js poll
Restart=always

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### "X credentials not configured"

Verifica che le variabili ambiente siano impostate in `.env`:

```bash
node -e "require('dotenv').config({path:'../../../.env'}); console.log(process.env.X_ONDE_API_KEY)"
```

### "Instagram requires media URL"

Instagram richiede sempre un'immagine o video. Usa `--media`:

```bash
node multi-post.js add "Post" --platforms ig --media https://cdn.example.com/image.jpg
```

### "Telegram test failed"

Verifica il token bot e chat ID in `config.json`. Assicurati che il bot sia attivo e che tu abbia avviato una conversazione con esso.

### "TikTok access token not configured"

TikTok richiede OAuth flow. Esegui prima:

```bash
cd ../tiktok
node oauth-server.js
# Apri URL nel browser e completa OAuth
```

## Roadmap

- [ ] Upload media su X (immagini e video)
- [ ] YouTube posting
- [ ] Scheduling (post programmati)
- [ ] Analytics integration
- [ ] Web dashboard per gestione coda
- [ ] Webhook per notifiche invece di polling

---

Task: social-auto-001
Data: 2026-01-09
Autore: Onde Engineering
