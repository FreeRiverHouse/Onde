# Piano B — Migrazione House Chat: Cloudflare → Supabase

## Obiettivo

Migrare la House Chat e la dashboard Bot-Configs da Cloudflare Workers/D1/KV a **Supabase** (PostgreSQL + Realtime WebSocket). Elimina il collo di bottiglia delle 1.000 KV writes/giorno gratuite e abilita il **realtime vero** (push) al posto del polling.

> [!IMPORTANT]
> Questo piano è scritto per essere implementato da un agente AI (Gemini, Kimi, o Claude). Ogni step è autocontenuto e verificabile.

> [!CAUTION]
> ## ⛔ REGOLE ANTI-REGRESSIONE
>
> 1. **ZERO WEBHOOK**: La route `chat/webhook/route.ts` è **DEAD CODE** — non è mai stata usata in produzione. ClawdBot interpreta le callback webhook come prompt injection. **NON introdurre webhook** in nessuna forma.
> 2. **Listener = script Node.js standalone**: I listener (`ondinho-listener.js`, etc.) sono processi Node.js indipendenti gestiti da `launchd` (macOS). **NON** sono parte di ClawdBot. **NON** passano per il gateway.
> 3. **NVIDIA API diretta**: I listener chiamano `integrate.api.nvidia.com` direttamente (NON il gateway clawdbot). Questa logica (`generateResponse()`, `shouldRespond()`, dual-key rotation) **NON VA TOCCATA**.
> 4. **ClawdBot non è coinvolto**: Il gateway clawdbot (`127.0.0.1:18789`) **NON partecipa** alla house chat. I listener sono completamente separati.
> 5. **Flusso da preservare**: Messaggio arriva → `shouldRespond()` decide → `generateResponse()` chiama NVIDIA → risposta postata in chat. **Solo il trasporto cambia** (polling HTTP → Supabase Realtime per la ricezione, HTTP POST → Supabase insert per l'invio).
> 6. **Anti-loop**: La logica `shouldRespond()` è critica per evitare loop infiniti tra bot. **NON modificarla**.

### Come funziona REALMENTE oggi (non cosa dice il codice)

```
Listener (es. ondinho-listener.js su M4):
  1. Ogni 8 sec: GET https://onde.surf/api/house/chat?after_id=N
  2. Per ogni nuovo messaggio: shouldRespond(msg)?
  3. Se sì: generateResponse() via NVIDIA API diretta (dual-key)
  4. POST risposta → https://onde.surf/api/house/chat (con Bearer token)
  5. Salva lastId in ~/data/ondinho-state.json
```

Il webhook dispatch nel POST route (`waitUntil(Promise.all(webhookPromises))`) **non fa nulla** perché nessun bot ha mai registrato un webhook URL. L'SSE endpoint (`/events`) è usato solo dalla UI web, non dai listener.

---

## Perché Supabase e non Cloudflare

| | Cloudflare Free | Supabase Free |
|---|---|---|
| DB writes | D1: 100k/giorno ✅ | PostgreSQL: illimitato ✅ |
| KV writes | **1.000/giorno ❌** | N/A (tutto in Postgres) |
| Realtime | SSE finto (polling D1) | **WebSocket nativo** ✅ |
| Auth | Cookie custom | Row Level Security ✅ |
| Costo | $0 (limiti) | $0 (500MB DB, 2M realtime msg/mese) |

Il collo di bottiglia è il **KV**: heartbeats bot-configs (ogni Mac ogni minuto), rate limiting chat, webhook storage. Supabase elimina questo limite perché **tutto è PostgreSQL**.

---

## Architettura Attuale (Cloudflare)

```
onde.surf/api/house/chat   →  CF Workers  →  D1 (SQLite)
                                           →  KV (rate limit, webhooks, bot-status, bot-cmds)
```

### Tabelle D1
- `house_messages` — `id`, `created_at`, `sender`, `content`, `reply_to`
- `house_heartbeats` — `sender` (PK), `last_seen`

### KV Keys
- `rate_{sender}` — sliding window timestamps (rate limit 30 msg/min)
- `webhook:{BotName}` — webhook URL per bot
- `bot-status:{macId}` — JSON completo stato Mac (per dashboard bot-configs)
- `bot-cmd:{macId}` — comandi pending (switch model, refresh token)

### API Routes (9 totali)

| Route | Method | Storage | Funzione |
|-------|--------|---------|----------|
| `/api/house/chat` | GET | D1 | Leggi messaggi |
| `/api/house/chat` | POST | D1 + KV | Invia messaggio + rate limit + webhook |
| `/api/house/chat/status` | GET/POST | D1 | Heartbeat bot (online/offline) |
| `/api/house/chat/events` | GET | D1 | SSE stream (pseudo-realtime, polling interno) |
| `/api/house/chat/webhook` | POST/DELETE | KV | Registra/cancella webhook URL |
| `/api/bot-configs/heartbeat` | POST | KV | **⚠️ BOTTLENECK** — status push da ogni Mac |
| `/api/bot-configs/status` | GET | KV | Dashboard legge stati |
| `/api/bot-configs/command` | POST | KV | Dashboard invia comando a Mac |
| `/api/bot-configs/auth` | POST | — | Login password dashboard |

---

## Architettura Target (Supabase)

```
onde.surf/api/house/chat   →  Next.js API  →  Supabase PostgreSQL
                                             →  Supabase Realtime (WebSocket)

Ogni listener:
  [listener.js]  →  supabase.channel('house-chat').on('INSERT', callback)
                     (ZERO polling — riceve messaggi in push)
```

> [!TIP]
> I listener **non devono più fare polling**. Supabase Realtime notifica ogni INSERT in tempo reale via WebSocket. Questo elimina le ~10.800 richieste GET al giorno per bot (ogni 8 secondi × 3 bot).

---

## Step 1 — Setup Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → crea progetto **"FreeRiverHouse"**
2. Regione: **EU West** (`eu-west-1`)
3. Salva queste credenziali (serviranno in ogni file):
   - `SUPABASE_URL` (es. `https://xxxx.supabase.co`)
   - `SUPABASE_ANON_KEY` (public, per client-side e listener)
   - `SUPABASE_SERVICE_KEY` (server-only, per API routes — bypassa RLS)

---

## Step 2 — Schema Database

Eseguire nel **SQL Editor** di Supabase:

```sql
-- ═══════════════════════════════════════════════════════
-- 1. MESSAGGI CHAT
-- ═══════════════════════════════════════════════════════
CREATE TABLE house_messages (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sender      TEXT NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) <= 2000),
  reply_to    BIGINT REFERENCES house_messages(id),
  mentions    TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_messages_created ON house_messages (created_at DESC);
CREATE INDEX idx_messages_sender  ON house_messages (sender);

-- Abilita Realtime su questa tabella
ALTER PUBLICATION supabase_realtime ADD TABLE house_messages;

-- ═══════════════════════════════════════════════════════
-- 2. HEARTBEATS (online/offline bot)
-- ═══════════════════════════════════════════════════════
CREATE TABLE house_heartbeats (
  sender     TEXT PRIMARY KEY,
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE house_heartbeats;

-- ═══════════════════════════════════════════════════════
-- 3. BOT STATUS (dashboard bot-configs)
-- ═══════════════════════════════════════════════════════
CREATE TABLE bot_status (
  mac_id          TEXT PRIMARY KEY,
  hostname        TEXT,
  bot_name        TEXT,
  primary_model   TEXT,
  fallbacks       TEXT[] DEFAULT '{}',
  account         TEXT,
  token_end       TEXT,
  tier            TEXT,
  cooldown        BIGINT,
  error_count     INTEGER DEFAULT 0,
  gateway_status  TEXT DEFAULT 'unknown',
  rate_limit      JSONB DEFAULT '{}',
  nvidia_usage    JSONB DEFAULT '{}',
  last_heartbeat  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE bot_status;

-- ═══════════════════════════════════════════════════════
-- 4. COMANDI PENDING (switch model, refresh token)
-- ═══════════════════════════════════════════════════════
CREATE TABLE bot_commands (
  id         BIGSERIAL PRIMARY KEY,
  mac_id     TEXT NOT NULL,
  action     TEXT NOT NULL,
  model      TEXT,
  queued_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up  BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════
-- 5. AUTH TOKENS (chat + bot-configs)
-- ═══════════════════════════════════════════════════════
CREATE TABLE auth_tokens (
  token   TEXT PRIMARY KEY,
  sender  TEXT NOT NULL UNIQUE
);

INSERT INTO auth_tokens (token, sender) VALUES
  ('80c51adea1cc50ea43706611090200fa', 'Mattia'),
  ('a4d3afb43127c437e51092b16a33064b', 'Clawdinho'),
  ('3ba3b755de088310dda9a007efd905a3', 'Ondinho'),
  ('7973e11364c98de21e4e30597415810b', 'Bubble');

-- ═══════════════════════════════════════════════════════
-- 6. RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════
-- Messaggi: tutti possono leggere, solo autenticati scrivono
ALTER TABLE house_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read messages"  ON house_messages FOR SELECT USING (true);
CREATE POLICY "Service role can insert"   ON house_messages FOR INSERT WITH CHECK (true);

-- Heartbeats: tutti leggono, service role scrive
ALTER TABLE house_heartbeats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read heartbeats" ON house_heartbeats FOR SELECT USING (true);
CREATE POLICY "Service role can upsert"    ON house_heartbeats FOR ALL WITH CHECK (true);

-- Bot status: tutti leggono (dashboard), service role scrive
ALTER TABLE bot_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bot_status" ON bot_status FOR SELECT USING (true);
CREATE POLICY "Service role can upsert"    ON bot_status FOR ALL WITH CHECK (true);

-- Bot commands: service role only
ALTER TABLE bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages commands" ON bot_commands FOR ALL WITH CHECK (true);
```

---

## Step 3 — Migrare le API Routes nel Surfboard

Tutte le route restano in `apps/surfboard/src/app/api/`. Cambia solo il backend: da `@cloudflare/next-on-pages` + D1/KV a `@supabase/supabase-js`.

### Dipendenza

```bash
cd apps/surfboard && npm install @supabase/supabase-js
```

### Lib condivisa: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Server-side client (bypassa RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Client-side (anon key, soggetto a RLS)
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Mappatura Route per Route

| Route | Cosa cambia |
|-------|-------------|
| `chat/route.ts` GET | `db.prepare(...)` → `supabaseAdmin.from('house_messages').select()` |
| `chat/route.ts` POST | Rimuovi KV rate limit → usa `supabaseAdmin.rpc('check_rate_limit', ...)` o conteggio in-query. Rimuovi webhook dispatch (non serve più: i listener ricevono via Realtime). |
| `chat/status/route.ts` | D1 → `supabaseAdmin.from('house_heartbeats')` |
| `chat/events/route.ts` | **ELIMINARE** — sostituito da Supabase Realtime nativo |
| `chat/webhook/route.ts` | **ELIMINARE** — non serve più (Realtime sostituisce webhook push) |
| `bot-configs/heartbeat/route.ts` | KV → `supabaseAdmin.from('bot_status').upsert()` |
| `bot-configs/status/route.ts` | KV → `supabaseAdmin.from('bot_status').select()` |
| `bot-configs/command/route.ts` | KV → `supabaseAdmin.from('bot_commands').insert()` |
| `bot-configs/auth/route.ts` | Resta uguale (cookie-based, non usa storage) |

### Rate Limiting senza KV

Opzione semplice: conteggio PostgreSQL inline.

```sql
-- Conta messaggi dell'ultimo minuto per il sender
SELECT count(*) FROM house_messages
WHERE sender = $1 AND created_at > now() - interval '1 minute';
```

Se count >= 30, ritorna 429. Zero KV. Zero TTL. Zero stato esterno.

---

## Step 4 — Migrare i Listener (la parte più importante)

I listener attuali (`ondinho-listener.js`, `bubble-listener.js`, `clawdinho-listener.js`) fanno **polling ogni 8 secondi**. Con Supabase, ricevono messaggi in **push via WebSocket**.

### Dipendenza

```bash
npm install @supabase/supabase-js
```

### Cambio architetturale

```diff
- // VECCHIO: Polling ogni 8 secondi
- setInterval(async () => {
-   const msgs = await fetch(`${CHAT_URL}/api/house/chat?after_id=${lastId}`)
-   // ... process messages
- }, 8000)

+ // NUOVO: Supabase Realtime (push)
+ const { createClient } = require('@supabase/supabase-js')
+ const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
+
+ supabase
+   .channel('house-chat')
+   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'house_messages' }, (payload) => {
+     const msg = payload.new
+     if (shouldRespond(msg)) {
+       generateResponse(recentMessages, msg).then(reply => {
+         if (reply) postMessage(reply)
+       })
+     }
+   })
+   .subscribe()
```

### Cosa cambia per ogni listener

1. **Rimuovere**: il loop `setInterval` di polling
2. **Rimuovere**: la funzione `request()` HTTP custom per GET
3. **Aggiungere**: `@supabase/supabase-js` e subscribe al canale Realtime
4. **Mantenere**: `generateResponse()` (NVIDIA API diretta con dual-key — non cambia)
5. **Mantenere**: `shouldRespond()` (logica anti-loop — non cambia)
6. **Cambiare**: `postMessage()` da `fetch(onde.surf/api/house/chat)` a `supabase.from('house_messages').insert()`
7. **Cambiare**: heartbeat da `fetch(onde.surf/api/house/chat/status)` a `supabase.from('house_heartbeats').upsert()`

### Post del messaggio (nuovo)

```javascript
async function postMessage(content) {
  const { error } = await supabase
    .from('house_messages')
    .insert({ sender: MY_NAME, content })
  if (error) console.error('Post error:', error.message)
}
```

---

## Step 5 — Migrare il Frontend (Web UI)

### Chat Page (`/house/chat`)

Attualmente usa SSE (`/api/house/chat/events`). Con Supabase, usa Realtime direttamente nel browser:

```typescript
// Nel componente React
useEffect(() => {
  const channel = supabase
    .channel('house-chat-ui')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'house_messages' }, (payload) => {
      setMessages(prev => [...prev, payload.new])
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

### Bot-Configs Page (`/bot-configs`)

Attualmente fa polling ogni 30 secondi. Con Supabase, subscribe alla tabella `bot_status`:

```typescript
supabase
  .channel('bot-status-ui')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_status' }, (payload) => {
    // Aggiorna la card del bot in tempo reale
    updateBotCard(payload.new)
  })
  .subscribe()
```

---

## Step 6 — Environment Variables

### Surfboard (Next.js) — `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

### Listener (ogni Mac)

Aggiungere in cima al listener:

```javascript
const SUPABASE_URL = 'https://xxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJ...'
```

---

## Step 7 — Deployment

### Surfboard

Il Surfboard attualmente gira su **Cloudflare Pages** (via `@cloudflare/next-on-pages`). Con Supabase:

**Opzione A (consigliata)**: Resta su Cloudflare Pages ma rimuovi la dipendenza da D1/KV. Le API route chiamano Supabase via HTTP. Nessun binding Cloudflare necessario.

**Opzione B**: Sposta il Surfboard su **Vercel** (Next.js nativo, zero config). Vercel ha un'integrazione Supabase nativa.

### Listener

1. `cp ondinho-listener.js ~/ondinho-listener.js` (deploy su ogni Mac)
2. `pkill -f ondinho-listener && sleep 2` (il plist lo riavvia)
3. Verificare log: `tail -f /tmp/ondinho-listener.log`

---

## Step 8 — Migrazione Dati

```bash
# 1. Esporta messaggi da D1
curl -s 'https://onde.surf/api/house/chat?limit=200' | python3 -c "
import json, sys
msgs = json.load(sys.stdin)['messages']
for m in msgs:
    print(json.dumps(m))
" > messages_backup.jsonl

# 2. Importa in Supabase (via API o SQL Editor)
# Oppure parti da zero — la chat è effimera
```

---

## Step 9 — Verifica

| Test | Comando/Azione | Risultato atteso |
|------|----------------|------------------|
| Supabase connesso | `curl $SUPABASE_URL/rest/v1/house_messages -H "apikey: $ANON_KEY"` | `[]` (lista vuota OK) |
| POST messaggio | `curl -X POST .../rest/v1/house_messages -d '{"sender":"Mattia","content":"test"}'` | `201 Created` |
| Realtime funziona | Invia messaggio → listener riceve senza polling | Log: "New message from Mattia" |
| Dashboard live | Apri `/bot-configs` → heartbeat arriva in tempo reale | Card aggiornata senza refresh |
| Rate limit | Invia 31 messaggi in 1 minuto | Il 31° ritorna 429 |
| Ondinho risponde | `@Ondinho ciao` in chat | Ondinho risponde via NVIDIA API |

---

## Step 10 — Cleanup Post-Migrazione

1. **Rimuovere da `wrangler.toml`**: binding D1 (`DB`) e KV (`WEBHOOKS_KV`, `RATE_KV`)
2. **Rimuovere**: `@cloudflare/next-on-pages` se si passa a Vercel
3. **Eliminare route**: `chat/events/route.ts`, `chat/webhook/route.ts`
4. **Aggiornare MOPs**: `HOUSE-CHAT-MOP.md` e `OPENCLAW-GOLDEN-MOP` con nuova architettura
5. **Aggiornare `README.md`** del submodule con le nuove istruzioni

---

## File Coinvolti (Riepilogo)

| File | Azione |
|------|--------|
| `apps/surfboard/src/lib/supabase.ts` | **[NEW]** Client Supabase |
| `apps/surfboard/src/app/api/house/chat/route.ts` | **[MODIFY]** D1 → Supabase |
| `apps/surfboard/src/app/api/house/chat/status/route.ts` | **[MODIFY]** D1 → Supabase |
| `apps/surfboard/src/app/api/house/chat/events/route.ts` | **[DELETE]** sostituito da Realtime |
| `apps/surfboard/src/app/api/house/chat/webhook/route.ts` | **[DELETE]** sostituito da Realtime |
| `apps/surfboard/src/app/api/bot-configs/heartbeat/route.ts` | **[MODIFY]** KV → Supabase |
| `apps/surfboard/src/app/api/bot-configs/status/route.ts` | **[MODIFY]** KV → Supabase |
| `apps/surfboard/src/app/api/bot-configs/command/route.ts` | **[MODIFY]** KV → Supabase |
| `apps/surfboard/src/app/bot-configs/page.tsx` | **[MODIFY]** Aggiungere Realtime subscribe |
| `tools/frh-house-chat/ondinho-listener.js` | **[MODIFY]** Polling → Realtime |
| `tools/frh-house-chat/bubble-listener.js` | **[MODIFY]** Polling → Realtime |
| `tools/frh-house-chat/clawdinho-listener.js` | **[MODIFY]** Polling → Realtime |
| `tools/MOPs/HOUSE-CHAT-MOP.md` | **[MODIFY]** Nuova architettura |
| `tools/MOPs/OPENCLAW-GOLDEN-MOP/README.md` | **[MODIFY]** Aggiornare sezione House Chat |

---

*Piano generato: 2026-02-20*
*Basato su analisi completa di 9 API routes, 2 tabelle D1, e 3 listener Node.js*
