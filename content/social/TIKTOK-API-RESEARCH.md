# TikTok API Research - Posting Automatico

## Overview

TikTok offre diverse API, ma il posting automatico e' limitato.

---

## Tipi di API TikTok

### 1. TikTok for Developers (Login Kit, Share Kit)
- **URL**: https://developers.tiktok.com
- **Uso**: Login, condivisione dall'app
- **Posting**: NO - Non permette posting diretto

### 2. TikTok Marketing API
- **URL**: https://business-api.tiktok.com
- **Uso**: Ads, analytics per campagne
- **Posting**: Solo contenuti sponsorizzati (ads)
- **Requisiti**: Business account, budget minimo

### 3. TikTok Content Posting API (NUOVA 2024)
- **URL**: https://developers.tiktok.com/doc/content-posting-api
- **Uso**: Posting diretto da app terze
- **Posting**: SI - Ma con limitazioni

---

## Content Posting API - Dettagli

### Requisiti
1. TikTok for Developers account
2. App approvata (review manuale)
3. Business account TikTok
4. Verifica organizzazione

### Limitazioni
- Solo video (non foto)
- Max 10 video/giorno per utente
- Video max 10 minuti
- Richiede OAuth2 con utente
- Non funziona per account personali

### Endpoints

```
POST https://open.tiktokapis.com/v2/post/publish/video/init/
POST https://open.tiktokapis.com/v2/post/publish/video/
GET  https://open.tiktokapis.com/v2/post/publish/status/
```

### Flusso di Upload

1. **Init upload** - Ottieni URL per caricare video
2. **Upload video** - Carica il file
3. **Publish** - Pubblica con caption e settings
4. **Check status** - Verifica stato pubblicazione

---

## Alternativa: TikTok Web Automation

Se l'API non e' fattibile, si puo' usare browser automation.

### Opzioni

| Tool | Pro | Contro |
|------|-----|--------|
| Puppeteer | Gratuito, flessibile | Fragile, rate limits |
| Playwright | Moderno, stabile | Stesso di Puppeteer |
| Claude for Chrome | Gia' integrato | Richiede browser attivo |

### Rischi Browser Automation
- TikTok puo' bannare l'account
- Rate limits stretti
- Captcha frequenti
- Richiede login manuale periodico

---

## Servizi Terzi

### Hootsuite / Later / Buffer
- Supportano TikTok scheduling
- API propria piu' semplice
- Costo: $15-50/mese

### Publer
- https://publer.io
- TikTok auto-posting
- $12/mese

### SocialBee
- https://socialbee.io
- TikTok + altri social
- $19/mese

---

## Raccomandazione per Onde

### Fase 1: Manuale + Scheduling
1. Creare video con pipeline esistente
2. Caricare manualmente su TikTok
3. Usare TikTok native scheduling (gratuito)

### Fase 2: Servizio Terzo
1. Se volume aumenta (10+ video/settimana)
2. Usare Publer o Later per scheduling
3. Costo giustificato da tempo risparmiato

### Fase 3: API Diretta
1. Se diventa strategico
2. Registrare app TikTok for Developers
3. Implementare Content Posting API
4. Solo se account business verificato

---

## Implementazione Consigliata

### Script Preparazione Video

```javascript
// tools/social/prepare-tiktok-video.js

const ffmpeg = require('fluent-ffmpeg');

async function prepareTikTokVideo(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = { prepareTikTokVideo };
```

### Struttura Output

```
content/tiktok/
├── ready/          # Video pronti per upload
│   ├── 2026-01-09-stellina.mp4
│   └── 2026-01-09-pioggerellina.mp4
├── uploaded/       # Video gia' caricati
└── queue.json      # Coda pubblicazione
```

### Queue Format

```json
{
  "queue": [
    {
      "id": "video-001",
      "file": "2026-01-09-stellina.mp4",
      "caption": "Stella stellina, la notte s'avvicina...",
      "scheduledFor": "2026-01-10T18:00:00Z",
      "status": "pending"
    }
  ]
}
```

---

## Conclusione

**Per ora**: Upload manuale + TikTok native scheduling
**Prossimo step**: Valutare Publer se volume > 10 video/settimana
**Futuro**: API diretta solo se strategicamente necessario

---

## Link Utili

- TikTok Developers: https://developers.tiktok.com
- Content Posting API: https://developers.tiktok.com/doc/content-posting-api
- TikTok Business: https://www.tiktok.com/business
- Publer: https://publer.io
- Later: https://later.com

---

*Task: social-tiktok-002*
*Ultimo aggiornamento: 2026-01-09*
