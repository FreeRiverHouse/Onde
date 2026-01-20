# POSTS DA PUBBLICARE - 20 Gennaio 2026

**PATH QUESTO FILE:** `/Users/mattia/Projects/Onde/POSTS-DA-FARE.md`

---

## POST 1 - @Onde_FRH

**TESTO ESATTO (copia tutto tra le righe):**

---
You know that feeling when you read something to your kid and they stop to think, or to laugh?

That's why we make books.

Not to sell. To create those moments.

If they sell too, great. But the moment comes first.
---

**Credenziali nel .env:**
- X_ONDE_API_KEY
- X_ONDE_API_SECRET
- X_ONDE_ACCESS_TOKEN
- X_ONDE_ACCESS_SECRET

---

## POST 2 - @FreeRiverHouse

**TESTO ESATTO (copia tutto tra le righe):**

---
We mass-produce apps.

Not because we're a factory.

Because every child deserves something built just for them.

And if it takes mass-producing uniqueness to get there—so be it.
---

**Credenziali nel .env:**
- TWITTER_API_KEY
- TWITTER_API_SECRET
- TWITTER_ACCESS_TOKEN
- TWITTER_ACCESS_SECRET

---

## POST 3 - @magmatic__

**TESTO ESATTO (copia tutto tra le righe):**

---
"People usually consider walking on water or in thin air a miracle. But I think the real miracle is not to walk either on water or in thin air, but to walk on earth."

— Thich Nhat Hanh
---

**Credenziali nel .env:**
- X_MAGMATIC_API_KEY
- X_MAGMATIC_API_SECRET
- X_MAGMATIC_ACCESS_TOKEN
- X_MAGMATIC_ACCESS_SECRET

---

## COME POSTARE

```javascript
const { TwitterApi } = require('twitter-api-v2');

// Esempio per @Onde_FRH
const client = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY,
  appSecret: process.env.X_ONDE_API_SECRET,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET,
});

await client.v2.tweet('TESTO QUI');
```

---

## SE ERRORE 401

1. Token scaduti o permessi sbagliati
2. Vai su developer.twitter.com
3. App settings -> User authentication -> Read and Write
4. Rigenera i token
5. Aggiorna .env
