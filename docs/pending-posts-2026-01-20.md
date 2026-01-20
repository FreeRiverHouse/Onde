# Post da Pubblicare - 20 Gennaio 2026

## Istruzioni per l'altra sessione Claude

**LEGGI QUESTO FILE E POSTA I 3 TWEET SUI 3 ACCOUNT.**

Le credenziali sono nel `.env`:
- `X_ONDE_*` per @Onde_FRH
- `X_MAGMATIC_*` per @magmatic__
- `X_FRH_*` o `TWITTER_*` per @FreeRiverHouse

Usa il file `packages/telegram-bot/src/x-client.ts` o le API X direttamente.

---

## POST 1 - @Onde_FRH

```
You know that feeling when you read something to your kid and they stop to think, or to laugh?

That's why we make books.

Not to sell. To create those moments.

If they sell too, great. But the moment comes first.
```

**Account:** @Onde_FRH
**Credenziali:** `X_ONDE_API_KEY`, `X_ONDE_API_SECRET`, `X_ONDE_ACCESS_TOKEN`, `X_ONDE_ACCESS_SECRET`

---

## POST 2 - @FreeRiverHouse

```
We mass-produce apps.

Not because we're a factory.

Because every child deserves something built just for them.

And if it takes mass-producing uniqueness to get there—so be it.
```

**Account:** @FreeRiverHouse
**Credenziali:** `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
(oppure `X_FRH_*` se configurate)

---

## POST 3 - @magmatic__

```
"People usually consider walking on water or in thin air a miracle. But I think the real miracle is not to walk either on water or in thin air, but to walk on earth."

— Thích Nhất Hạnh
```

**Account:** @magmatic__
**Credenziali:** `X_MAGMATIC_API_KEY`, `X_MAGMATIC_API_SECRET`, `X_MAGMATIC_ACCESS_TOKEN`, `X_MAGMATIC_ACCESS_SECRET`

---

## Come Postare (Node.js)

```javascript
import { TwitterApi } from 'twitter-api-v2';

// Per ogni account:
const client = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY,      // cambia per ogni account
  appSecret: process.env.X_ONDE_API_SECRET,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET,
});

await client.v2.tweet('TESTO DEL POST QUI');
```

---

## Verifica Credenziali

Se ricevi errore 401:
1. Le credenziali potrebbero essere scadute
2. L'app potrebbe avere solo permessi "Read" (servono "Read and Write")
3. Vai su developer.twitter.com → App → User authentication settings → cambia a Read+Write → Rigenera token

---

## Dopo aver postato

Conferma a Mattia su Telegram che i 3 post sono stati pubblicati.
