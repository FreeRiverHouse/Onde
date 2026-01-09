# TikTok Integration - Onde Social Automation

## Overview

Questa integrazione permette di pubblicare video automaticamente su TikTok come parte del sistema Onde Social Automation.

## TikTok Content Posting API

### Requisiti

1. **Account TikTok Business** o **Creator Account**
2. **App registrata su TikTok for Developers**: https://developers.tiktok.com/
3. **Content Posting API access** - Richiede approvazione

### Scopes Necessari

- `video.upload` - Upload video
- `video.publish` - Pubblicazione video

### Limitazioni API

| Limite | Valore |
|--------|--------|
| Video max per giorno | 30 (per app) |
| Durata video min | 3 secondi |
| Durata video max | 10 minuti (180 sec per API) |
| Formato | MP4, WebM |
| Risoluzione min | 360x360 |
| Dimensione max | 4GB (128MB per API diretta) |

---

## Setup

### 1. Registra App su TikTok for Developers

1. Vai su https://developers.tiktok.com/
2. Crea una nuova app
3. Seleziona "Content Posting API"
4. Completa la verifica (richiede tempo)

### 2. Configurazione .env

Aggiungi al file `/Users/mattia/Projects/Onde/.env`:

```env
# TikTok API
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=https://onde.surf/callback/tiktok
```

### 3. OAuth Flow

TikTok usa OAuth 2.0. L'utente deve autorizzare l'app una volta.

```javascript
// Authorization URL
const authUrl = `https://www.tiktok.com/v2/auth/authorize?` +
  `client_key=${TIKTOK_CLIENT_KEY}` +
  `&scope=video.upload,video.publish` +
  `&response_type=code` +
  `&redirect_uri=${TIKTOK_REDIRECT_URI}`;
```

---

## API Endpoints

### 1. Get Access Token

```http
POST https://open.tiktokapis.com/v2/oauth/token/
Content-Type: application/x-www-form-urlencoded

client_key={client_key}
&client_secret={client_secret}
&code={authorization_code}
&grant_type=authorization_code
&redirect_uri={redirect_uri}
```

### 2. Upload Video (Init)

```http
POST https://open.tiktokapis.com/v2/post/publish/video/init/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "post_info": {
    "title": "Video title",
    "privacy_level": "SELF_ONLY",  // or PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS
    "disable_duet": false,
    "disable_stitch": false,
    "disable_comment": false
  },
  "source_info": {
    "source": "FILE_UPLOAD",
    "video_size": 1234567
  }
}
```

### 3. Upload Video Chunks

```http
PUT {upload_url}
Content-Type: video/mp4
Content-Range: bytes {start}-{end}/{total}

[video binary data]
```

### 4. Publish Video

```http
POST https://open.tiktokapis.com/v2/post/publish/video/publish/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "publish_id": "{publish_id_from_init}"
}
```

---

## Script di Posting

Vedi `post-tiktok.js` per lo script completo.

### Uso

```bash
# Pubblica un video
node tools/social-automation/tiktok/post-tiktok.js \
  --video /path/to/video.mp4 \
  --title "Il titolo del video" \
  --privacy PUBLIC_TO_EVERYONE
```

---

## Workflow Onde

### Contenuti da Pubblicare

1. **Ninna nanne animate** - Video 15-60 sec da Piccole Rime
2. **AIKO clips** - Scene dal libro AIKO animate
3. **Poesie visuali** - Video con testo sovrapposto
4. **Behind the scenes** - Creazione libri

### Formati Consigliati

| Tipo | Durata | Ratio |
|------|--------|-------|
| Short form | 15-60 sec | 9:16 (vertical) |
| Educativo | 60-180 sec | 9:16 |
| Ambient | 60 sec loop | 9:16 |

### Hashtag Strategy

```
#OndePublishing #LibriPerBambini #NinnaNanna #PoesiaPerBambini
#ItalianPoetry #KidsBooks #Storytime #Bedtimestory
```

---

## Alternativa: TikTok Scheduling Tools

Se l'API non e' approvata, usare:

1. **Later** - https://later.com/ (supporta TikTok)
2. **Hootsuite** - https://hootsuite.com/
3. **Buffer** - https://buffer.com/
4. **Metricool** - https://metricool.com/

Questi tool permettono scheduling senza API diretta.

---

## Status

- [ ] Account TikTok @onde creato
- [ ] App registrata su TikTok for Developers
- [ ] Content Posting API approvato
- [ ] OAuth flow implementato
- [ ] Script posting funzionante
- [ ] Test video pubblicato

---

## Riferimenti

- [TikTok for Developers](https://developers.tiktok.com/)
- [Content Posting API Docs](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Login Kit](https://developers.tiktok.com/doc/login-kit-web)

---

*Task: tools-003*
*Ultimo aggiornamento: 2026-01-09*
