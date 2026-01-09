# Meta Graph API - Guida Completa per Instagram Auto-Posting

**Data**: 2026-01-09
**Task**: social-ig-002
**Account**: @onde_publishing

---

## Indice

1. [Prerequisiti](#prerequisiti)
2. [Setup Meta Business Suite](#setup-meta-business-suite)
3. [Configurazione App Facebook Developer](#configurazione-app-facebook-developer)
4. [Endpoints API](#endpoints-api)
5. [Workflow Posting](#workflow-posting)
6. [Rate Limits](#rate-limits)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisiti

Prima di iniziare, assicurati di avere:

| Requisito | Status | Note |
|-----------|--------|------|
| Account Instagram Business | Obbligatorio | NON funziona con account personali |
| Facebook Page collegata | Obbligatorio | L'IG deve essere collegato a una Page |
| App Facebook Developer | Obbligatorio | Per generare Access Token |
| Business Manager | Consigliato | Per gestione avanzata |

---

## Setup Meta Business Suite

### Step 1: Crea Facebook Page (se non esiste)

1. Vai su https://www.facebook.com/pages/create
2. Scegli "Business or Brand"
3. Nome: "Onde Publishing"
4. Categoria: "Publishing Company" o "Book Publisher"
5. Completa il setup

### Step 2: Collega Instagram alla Facebook Page

1. Vai su Meta Business Suite: https://business.facebook.com/
2. Settings (ingranaggio in basso a sinistra)
3. "Instagram accounts" nel menu
4. Click "Connect account"
5. Login con credenziali @onde_publishing
6. Autorizza il collegamento

### Step 3: Verifica Business Account IG

L'account Instagram DEVE essere "Professional" (Business o Creator):

1. Instagram app > Settings > Account
2. "Switch to Professional Account"
3. Scegli "Business"
4. Seleziona la categoria (Publishing Company)
5. Collega alla Facebook Page creata

---

## Configurazione App Facebook Developer

### Step 1: Crea App su Facebook Developers

1. Vai su https://developers.facebook.com/
2. Click "My Apps" > "Create App"
3. Scegli use case: "Other" > "Business"
4. App name: "Onde Publishing Bot"
5. Business portfolio: seleziona il tuo Business Manager

### Step 2: Aggiungi Instagram Graph API

1. Nella dashboard dell'app, vai su "Add products"
2. Trova "Instagram Graph API"
3. Click "Set Up"
4. Segui il wizard di configurazione

### Step 3: Configura Permessi

Nella sezione "App Review" > "Permissions and Features", richiedi:

| Permesso | Descrizione | Tipo |
|----------|-------------|------|
| `instagram_basic` | Accesso base al profilo | Standard |
| `instagram_content_publish` | Pubblicare contenuti | Advanced |
| `instagram_manage_comments` | Gestire commenti | Advanced |
| `instagram_manage_insights` | Accesso analytics | Standard |
| `pages_show_list` | Lista pagine collegate | Standard |
| `pages_read_engagement` | Leggere engagement | Standard |
| `business_management` | Gestione business | Standard |

**Nota**: Per `instagram_content_publish` serve App Review con video demo.

### Step 4: Genera Access Token

**Metodo 1: Graph API Explorer (Dev/Test)**

1. Vai su https://developers.facebook.com/tools/explorer/
2. Seleziona la tua app
3. Scegli permessi necessari
4. Click "Generate Access Token"
5. Copia il token (scade in 1-2 ore)

**Metodo 2: Long-Lived Token (Produzione)**

```bash
# Converti short-lived token in long-lived (60 giorni)
curl -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

**Metodo 3: System User Token (Raccomandato per Automazione)**

1. Business Manager > Business Settings > System Users
2. Crea nuovo System User
3. Assegna assets (Page + Instagram Account)
4. Genera token permanente

### Step 5: Ottieni Instagram Business Account ID

```bash
curl -X GET "https://graph.facebook.com/v21.0/me/accounts?access_token={ACCESS_TOKEN}"
```

Response:
```json
{
  "data": [
    {
      "id": "PAGE_ID",
      "name": "Onde Publishing",
      "instagram_business_account": {
        "id": "IG_BUSINESS_ACCOUNT_ID"  // <-- Questo ti serve!
      }
    }
  ]
}
```

---

## Endpoints API

### Base URL

```
https://graph.facebook.com/v21.0/
```

**Versione API**: v21.0 (Gennaio 2026 - verificare aggiornamenti)

### Endpoint: Crea Media Container (Step 1)

**Per IMMAGINI:**

```http
POST https://graph.facebook.com/v21.0/{ig-user-id}/media

Parameters:
- image_url: URL pubblico dell'immagine (HTTPS obbligatorio)
- caption: Testo del post (max 2200 caratteri)
- access_token: Il tuo token

Response:
{
  "id": "CONTAINER_ID"
}
```

**Per VIDEO (Reels):**

```http
POST https://graph.facebook.com/v21.0/{ig-user-id}/media

Parameters:
- video_url: URL pubblico del video (HTTPS obbligatorio)
- media_type: "REELS"
- caption: Testo del post
- share_to_feed: true/false
- access_token: Il tuo token

Response:
{
  "id": "CONTAINER_ID"
}
```

**Per CAROSELLO:**

```http
# Step 1: Crea container per ogni immagine
POST https://graph.facebook.com/v21.0/{ig-user-id}/media
Parameters:
- image_url: URL immagine
- is_carousel_item: true

# Step 2: Crea container carosello
POST https://graph.facebook.com/v21.0/{ig-user-id}/media
Parameters:
- media_type: "CAROUSEL"
- children: ["CONTAINER_ID_1", "CONTAINER_ID_2", ...]
- caption: Testo del post
```

### Endpoint: Pubblica Media (Step 2)

```http
POST https://graph.facebook.com/v21.0/{ig-user-id}/media_publish

Parameters:
- creation_id: CONTAINER_ID dal passaggio precedente
- access_token: Il tuo token

Response:
{
  "id": "MEDIA_ID"  // ID del post pubblicato
}
```

### Endpoint: Verifica Status Container

```http
GET https://graph.facebook.com/v21.0/{container-id}?fields=status_code

Possible status_code values:
- EXPIRED: Container scaduto (ricrea)
- ERROR: Errore durante upload
- FINISHED: Pronto per pubblicazione
- IN_PROGRESS: Upload in corso
- PUBLISHED: Gia' pubblicato
```

### Endpoint: Ottieni Info Post

```http
GET https://graph.facebook.com/v21.0/{media-id}?fields=id,caption,media_type,permalink,timestamp,like_count,comments_count
```

---

## Workflow Posting

### Flusso Completo per Immagine Singola

```
1. Carica immagine su server/CDN (URL pubblico HTTPS)
2. POST /media → ottieni container_id
3. (Opzionale) GET /container_id → verifica status
4. POST /media_publish → pubblica
5. Salva media_id per tracking
```

### Flusso per Video/Reels

```
1. Carica video su server/CDN (URL pubblico HTTPS)
2. POST /media (media_type=REELS) → ottieni container_id
3. WAIT: Polling status fino a "FINISHED" (puo' richiedere minuti)
4. POST /media_publish → pubblica
5. Salva media_id
```

**Nota Video**: I video richiedono processing lato Meta. Implementa retry con backoff.

---

## Rate Limits

### Limiti Posting

| Tipo | Limite | Periodo |
|------|--------|---------|
| Post singoli | 25 | 24 ore |
| API calls totali | 200 | 1 ora |
| API calls per utente | 200 | 1 ora |

### Limiti Media

| Tipo | Limite |
|------|--------|
| Immagine max size | 8MB |
| Video max size | 1GB |
| Video max durata | 60 min (Reels: 90 sec) |
| Caption max caratteri | 2,200 |
| Hashtag max | 30 |
| Mention max | 20 |
| Carosello max items | 10 |

### Rate Limit Headers

```
x-business-use-case-usage: {"[APP_ID]":[{"type":"IG_GRAPH_API","call_count":X,"total_cputime":Y,"total_time":Z}]}
```

Monitora questi header per evitare ban.

---

## Best Practices

### 1. Hosting Immagini

**NON funziona:**
- URL localhost
- URL con redirect
- URL HTTP (solo HTTPS)
- URL con auth

**Funziona:**
- Cloudflare R2 (raccomandato - free tier generoso)
- AWS S3 con CloudFront
- Google Cloud Storage
- Cloudinary

**Raccomandazione Onde**: Usa Cloudflare R2 + Workers per URL firmati

### 2. Gestione Token

```javascript
// Controlla scadenza token
async function checkTokenExpiry(token) {
  const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
  const response = await fetch(url);
  const data = await response.json();

  const expiresAt = data.data.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const daysRemaining = (expiresAt - now) / 86400;

  if (daysRemaining < 7) {
    console.warn(`Token scade in ${daysRemaining.toFixed(1)} giorni!`);
    // Invia alert su Telegram
  }

  return daysRemaining;
}
```

### 3. Retry Strategy

```javascript
async function publishWithRetry(containerId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await publishMedia(containerId);
      return result;
    } catch (error) {
      if (error.code === 9 && attempt < maxRetries) {
        // Rate limit - attendi exponential backoff
        const waitTime = Math.pow(2, attempt) * 60 * 1000;
        console.log(`Rate limited. Attendo ${waitTime/1000}s...`);
        await sleep(waitTime);
      } else {
        throw error;
      }
    }
  }
}
```

### 4. Scheduling Posts

Per scheduling nativo non supportato da Graph API. Opzioni:

1. **BullMQ + Redis**: Queue con delayed jobs
2. **GitHub Actions**: Cron workflow
3. **Cloudflare Workers**: Cron triggers

### 5. Caption Formatting

```javascript
function formatCaption(text, hashtags = []) {
  // Limite 2200 caratteri
  let caption = text.slice(0, 2000);

  // Aggiungi separatore
  caption += '\n\n---\n';

  // Credits (come da CLAUDE.md)
  caption += 'Illustrazione: Pina Pennello con @grok\n\n';

  // Hashtag (max 30, ma usarne meno e' meglio)
  if (hashtags.length > 0) {
    const tags = hashtags.slice(0, 10).map(t => `#${t}`).join(' ');
    caption += tags;
  }

  return caption.slice(0, 2200);
}
```

---

## Troubleshooting

### Errore: "Media posted before business account conversion"

**Causa**: L'account non e' Business
**Fix**: Converti a Business Account in Instagram settings

### Errore: "Invalid image URL"

**Causa**: URL non accessibile o non HTTPS
**Fix**:
- Verifica URL sia pubblico
- Usa HTTPS
- Rimuovi redirect

### Errore: "Application does not have permission"

**Causa**: Mancano permessi nell'app
**Fix**:
- Richiedi `instagram_content_publish` in App Review
- Verifica asset assignment in Business Manager

### Errore: "Rate limit exceeded"

**Causa**: Troppe richieste
**Fix**:
- Implementa exponential backoff
- Riduci frequenza posting
- Controlla header rate limit

### Container Status "ERROR"

**Causa**: Problema con media
**Fix**:
- Verifica formato supportato
- Controlla dimensioni file
- Verifica encoding video

---

## Variabili Ambiente

Aggiungi a `/Users/mattia/Projects/Onde/.env`:

```env
# Meta/Instagram Graph API
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_business_id
FACEBOOK_PAGE_ID=your_page_id

# Cloudflare R2 (per hosting immagini)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=onde-media
```

---

## Links Utili

- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Content Publishing Guide](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)
- [App Review](https://developers.facebook.com/docs/app-review/)

---

*Documento creato: 2026-01-09*
*Ultimo aggiornamento: 2026-01-09*
