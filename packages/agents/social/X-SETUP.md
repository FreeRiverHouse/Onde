# Guida Setup X/Twitter API

Questa guida spiega come ottenere le credenziali API per X/Twitter e configurare l'integrazione con Onde.

## Indice

1. [Creare un Developer Account](#1-creare-un-developer-account)
2. [Creare un'App nel Developer Portal](#2-creare-unapp-nel-developer-portal)
3. [Generare le Credenziali](#3-generare-le-credenziali)
4. [Configurare i Permessi](#4-configurare-i-permessi)
5. [Configurazione in Onde](#5-configurazione-in-onde)
6. [Multi-Account Setup](#6-multi-account-setup)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Creare un Developer Account

1. Vai su [developer.twitter.com](https://developer.twitter.com)
2. Clicca su **Sign up** (o accedi se hai gia' un account)
3. Completa il processo di registrazione:
   - Accetta i termini di servizio
   - Descrivi il tuo caso d'uso (es: "Automated posting for brand marketing")
   - Conferma la tua email

> **Nota**: L'approvazione puo' richiedere da pochi minuti a qualche giorno.

---

## 2. Creare un'App nel Developer Portal

1. Accedi alla [Dashboard Developer](https://developer.twitter.com/en/portal/dashboard)
2. Vai su **Projects & Apps** > **Overview**
3. Clicca su **+ Add App** o **Create Project**

### Opzione A: Creare un Project (raccomandato)

```
Project Name: Onde Social Agent
App Environment: Production
App Name: onde-social-bot
```

### Opzione B: Standalone App

Se non hai bisogno di un progetto, puoi creare un'app standalone.

---

## 3. Generare le Credenziali

Nella pagina dell'app, vai alla sezione **Keys and Tokens**:

### API Key e Secret (Consumer Keys)

1. Nella sezione **Consumer Keys**, clicca **Regenerate**
2. Salva immediatamente:
   - **API Key** (anche chiamata Consumer Key)
   - **API Secret** (anche chiamata Consumer Secret)

### Access Token e Secret

1. Nella sezione **Authentication Tokens**, clicca **Generate**
2. Salva:
   - **Access Token**
   - **Access Token Secret**

### Bearer Token (opzionale)

1. Nella sezione **Bearer Token**, clicca **Generate**
2. Salva il **Bearer Token** (usato per alcune API read-only)

> **IMPORTANTE**: Queste credenziali vengono mostrate UNA SOLA VOLTA. Salvale immediatamente in un posto sicuro!

---

## 4. Configurare i Permessi

Per poter postare tweet, l'app necessita dei permessi corretti:

1. Vai su **Settings** > **User authentication settings**
2. Clicca **Set up** o **Edit**
3. Configura:

```
App permissions: Read and write
Type of App: Web App, Automated App or Bot
Callback URI: https://example.com/callback (non usato, ma richiesto)
Website URL: https://your-website.com
```

4. Salva le modifiche

### Permessi Richiesti

| Permesso | Descrizione |
|----------|-------------|
| Read | Leggere tweet e profili |
| Write | Postare tweet, thread, media |
| Direct Messages | (opzionale) Per DM |

---

## 5. Configurazione in Onde

### Singolo Account

Aggiungi al tuo file `.env`:

```env
# X/Twitter API - Account Singolo
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_SECRET=your-access-token-secret
TWITTER_BEARER_TOKEN=your-bearer-token
```

### Uso nel codice

```typescript
import { SocialAgent } from '@onde/agent-social';

const agent = new SocialAgent({
  apiKey: process.env.OPENAI_API_KEY!,
  twitter: {
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  },
});

// Pubblica un tweet
await agent.postTweet('Ciao mondo da Onde!');
```

---

## 6. Multi-Account Setup

Per gestire piu' account X/Twitter (es: brand diversi, lingue diverse):

### Variabili d'ambiente

```env
# Account Brand Principale
X_BRAND_MAIN_NAME=Brand Principale
X_BRAND_MAIN_API_KEY=your-api-key-1
X_BRAND_MAIN_API_SECRET=your-api-secret-1
X_BRAND_MAIN_ACCESS_TOKEN=your-access-token-1
X_BRAND_MAIN_ACCESS_SECRET=your-access-secret-1

# Account Brand Italia
X_BRAND_IT_NAME=Brand Italia
X_BRAND_IT_API_KEY=your-api-key-2
X_BRAND_IT_API_SECRET=your-api-secret-2
X_BRAND_IT_ACCESS_TOKEN=your-access-token-2
X_BRAND_IT_ACCESS_SECRET=your-access-secret-2

# Account Brand US
X_BRAND_US_NAME=Brand US
X_BRAND_US_API_KEY=your-api-key-3
X_BRAND_US_API_SECRET=your-api-secret-3
X_BRAND_US_ACCESS_TOKEN=your-access-token-3
X_BRAND_US_ACCESS_SECRET=your-access-secret-3
```

### Pattern delle variabili

```
X_{ACCOUNT_ID}_{CREDENTIAL}
```

Dove:
- `ACCOUNT_ID`: Identificativo univoco (es: BRAND_MAIN, BRAND_IT)
- `CREDENTIAL`: Uno tra API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET, BEARER_TOKEN, NAME

### Uso nel codice

```typescript
import { SocialAgent, createManagerFromEnv } from '@onde/agent-social';

// Opzione 1: Usa helper per caricare da env
const xManager = createManagerFromEnv(
  ['brand_main', 'brand_it', 'brand_us'],
  'brand_main' // account default
);

const agent = new SocialAgent({
  apiKey: process.env.OPENAI_API_KEY!,
  xManager,
});

// Opzione 2: Configura manualmente
const agent = new SocialAgent({
  apiKey: process.env.OPENAI_API_KEY!,
  xAccounts: [
    {
      accountId: 'brand_main',
      name: 'Brand Principale',
      apiKey: process.env.X_BRAND_MAIN_API_KEY!,
      apiSecret: process.env.X_BRAND_MAIN_API_SECRET!,
      accessToken: process.env.X_BRAND_MAIN_ACCESS_TOKEN!,
      accessTokenSecret: process.env.X_BRAND_MAIN_ACCESS_SECRET!,
    },
    {
      accountId: 'brand_it',
      name: 'Brand Italia',
      apiKey: process.env.X_BRAND_IT_API_KEY!,
      apiSecret: process.env.X_BRAND_IT_API_SECRET!,
      accessToken: process.env.X_BRAND_IT_ACCESS_TOKEN!,
      accessTokenSecret: process.env.X_BRAND_IT_ACCESS_SECRET!,
    },
  ],
  defaultXAccount: 'brand_main',
});

// Post su account specifico
await agent.postTweet('Ciao Italia!', 'brand_it');
await agent.postTweet('Hello World!', 'brand_main');

// Post su account default
await agent.postTweet('Tweet generico');
```

---

## 7. Troubleshooting

### Errore: "Unauthorized"

**Causa**: Credenziali errate o scadute.

**Soluzione**:
1. Rigenera le credenziali nel Developer Portal
2. Verifica che le variabili d'ambiente siano corrette
3. Controlla che i permessi dell'app includano "Write"

### Errore: "Rate limit exceeded"

**Causa**: Troppe richieste in poco tempo.

**Soluzione**:
- Attendi 15 minuti prima di riprovare
- Implementa retry con backoff esponenziale
- Riduci la frequenza dei post

### Errore: "Forbidden"

**Causa**: L'app non ha i permessi necessari.

**Soluzione**:
1. Vai su Developer Portal > App Settings
2. Verifica che "User authentication" sia configurato
3. Assicurati che i permessi includano "Read and write"
4. Rigenera Access Token dopo aver modificato i permessi

### Errore: "Media upload failed"

**Causa**: File troppo grande o formato non supportato.

**Soluzione**:
- Immagini: max 5MB, formati JPG/PNG/GIF/WEBP
- Video: max 512MB, formato MP4
- GIF animate: max 15MB

### Verificare le credenziali

```typescript
const manager = agent.getXManager();
const results = await manager.verifyAllAccounts();

for (const [accountId, result] of results) {
  if (result.valid) {
    console.log(`${accountId}: OK (@${result.username})`);
  } else {
    console.error(`${accountId}: ERRORE - ${result.error}`);
  }
}
```

---

## Link Utili

- [X Developer Portal](https://developer.twitter.com)
- [X API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [twitter-api-v2 npm](https://www.npmjs.com/package/twitter-api-v2)

---

## Costi API

| Tier | Tweets/mese | Costo |
|------|-------------|-------|
| Free | 1,500 | $0 |
| Basic | 3,000 | $100/mese |
| Pro | 300,000 | $5,000/mese |

> I limiti si applicano per app, non per account.
