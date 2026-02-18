# TASKS.md - Onde Tasks

## 🔥 PROC-002: Grok Feedback Loop (REGOLA PERMANENTE)

Per ogni task completato:
1. Invia testo/risultato a Grok (x.com/i/grok)
2. Ricevi feedback e migliora
3. Genera 2 nuovi task dal feedback
4. Aggiorna TASKS.md

### ⛔ REGOLA ASSOLUTA — GRAFICA FIRST (per game tasks)
**Nessun task game può essere completato o ricevere receipt senza:**
1. Grafica a livello Horizon Chase 2 / Mario Kart
2. Screenshot mandato nel gruppo FRH o a Grok
3. Approvazione visiva di Mattia
4. Solo DOPO si procede con altri task

**Receipt senza screenshot approvato = RIFIUTATA.**
I task devono AUMENTARE (ogni feedback → 2 nuovi task).

---

## 🔴 CRITICAL — Kalshi Autotrader

### KALSHI-001: Autotrader Uptime 24/7
**Owner:** Clawdinho 🔵
**Status:** IN_PROGRESS
**Priority:** P0

**Obiettivo:** Autotrader deve girare 24/7 senza interruzioni. Se muore, va riavviato automaticamente.

**TODO:**
- [ ] Creare LaunchAgent/cron per auto-restart se processo muore
- [ ] Alert automatico nel gruppo se autotrader down >5 min
- [ ] Health check endpoint su onde.surf
- [ ] Log rotation (evitare log file troppo grossi)

---

### KALSHI-002: Win Rate Improvement
**Owner:** Clawdinho 🔵 + Grok
**Status:** IN_PROGRESS
**Priority:** P0

**Obiettivo:** Portare win rate sopra 55% per essere profittevoli

**Stato attuale:**
- Paper balance: $77.58 / $100
- Win rate: ~46% (troppo basso)
- 12 posizioni aperte

**TODO:**
- [ ] Analisi Grok: perché WR non sale? Quali mercati funzionano vs no?
- [ ] Backtest ultimi 3 giorni con parametri attuali
- [ ] Implementare trailing stop loss
- [ ] Sentiment integration (news headlines)
- [ ] A/B test: parametri current vs Grok-recommended

---

### KALSHI-003: Dashboard Real-Time
**Owner:** Clawdinho 🔵
**Status:** TODO
**Priority:** P1

**Obiettivo:** onde.surf/betting deve mostrare dati PAPER mode real-time

**TODO:**
- [ ] Fix push-stats-to-gist.py per paper mode
- [ ] Grafico win rate trend (ultimi 3 giorni)
- [ ] PnL per mercato breakdown
- [ ] Auto-refresh ogni 5 min

---

## 🟡 GAME — Pizza Gelato Rush

### ⛔ REGOLA ASSOLUTA: NEVER USE WEB PROTOTYPE!!!
**Da 2026-02-17 09:57 PST — Ordine diretto di Mattia**
- ❌ MAI web prototype (web-prototype/index.html) 
- ✅ SOLO Unity app standalone
- Chi usa web prototype = task RIFIUTATO

### PGR-001: Grafica HC2-Level — App Unity Standalone
**Locked by:** @clawd
**Owner:** Ondinho 🟢
**QA:** Bubble 🫧 (PROC002B)
**Status:** IN_PROGRESS
**Priority:** P0

**Obiettivo:** App Unity standalone con grafica livello Horizon Chase 2

**PROC002B Loop:**
1. Ondinho fix in Unity
2. Screenshot a Bubble
3. Bubble analizza + chiede a Grok
4. Bubble crea task
5. Repeat

**TODO Grafica (must fix before anything else):**
- [ ] Erba con striature/pattern/variazioni colore
- [ ] Edifici dettagliati (non blocky)  
- [ ] Alberi con ombre e dettagli
- [ ] Parallax/layering nello sfondo
- [ ] Curve visibili nella strada
- [ ] Dettagli bordo strada (guard rail, cartelli)
- [ ] Lighting/shading realistico
- [ ] Screenshot review Mattia ✅

---

## 🟢 BOOKS

### BOOK-001: Marco Aurelio - Impaginazione Lussuosa
**Owner:** Bubble 🫧
**Status:** IN_PROGRESS
**Created:** 2026-02-16

**Completato:**
- [x] Generazione 10 immagini stile Pina Pennello
- [x] Prima impaginazione HTML lussuosa
- [x] Generazione PDF (4.7MB)

**TODO:**
- [ ] Feedback Grok sul testo
- [ ] Revisione testo basata su feedback
- [ ] Rigenerazione PDF finale
- [ ] Review con Mattia

---

## 🔵 OPS — Monitoring & Infrastructure

### OPS-001: Heartbeat Reliability
**Owner:** Ondinho 🌊 (@clawd)
**Status:** IN_PROGRESS
**Priority:** P0

**Obiettivo:** Nessun bot può "dormire" o sparire. Heartbeat ogni 10 min obbligatorio.

**TODO:**
- [ ] Verificare heartbeat config su TUTTI i bot (Clawdinho, Ondinho, Bubble)
- [ ] HEARTBEAT.md NON vuoto — task di check attivi
- [ ] Alert se un bot non risponde per >15 min
- [ ] Watchdog cross-bot: ogni bot controlla gli altri

### OPS-002: House Chat — Inter-Bot Communication via sessions_send
**Owner:** Clawdinho 🔵
**Status:** IN_PROGRESS
**Priority:** P0

**Obiettivo:** Chat di gruppo funzionante su onde.surf/house dove Mattia + tutti i bot (Clawdinho, Ondinho, Bubble) possono comunicare in real-time. Under the hood usa `sessions_send` del Gateway Clawdbot.

**Architettura:**
- Frontend: pagina web su onde.surf (sezione House) con chat UI
- Backend: Gateway HTTP API (`/agent`) + `sessions_send` per inter-agent comms
- Storage: messages.json (file-based) + real-time via Gateway API
- Auth: Gateway authentication per API calls

**Sub-tasks:**

#### HOUSE-001: Gateway Config — Multi-Agent + sessions_send
**Status:** TODO
- [ ] Aggiungere agent entries per ondinho e bubble in clawdbot.json
- [ ] Abilitare `tools.agentToAgent.enabled: true`
- [ ] Configurare `allow: ["main", "ondinho", "bubble"]`
- [ ] Verificare che `sessions_send` funzioni tra agent
- [ ] Test: Clawdinho manda messaggio a Ondinho, riceve risposta

#### HOUSE-002: Chat Backend API
**Status:** TODO
- [ ] Endpoint POST per mandare messaggi (proxy a Gateway `/agent`)
- [ ] Endpoint GET per leggere messaggi recenti
- [ ] Message persistence (append to messages.json)
- [ ] Supporto per messaggi da Mattia (via web UI)
- [ ] Supporto per messaggi tra bot (via sessions_send)

#### HOUSE-003: Chat Frontend UI
**Status:** TODO
- [ ] Upgrade index.html con input box per mandare messaggi
- [ ] Real-time polling (ogni 3s) o WebSocket
- [ ] Indicatore online/offline per ogni bot
- [ ] Supporto markdown nel rendering messaggi
- [ ] Mobile responsive
- [ ] Diversi colori per bot (già fatto: bubble=blu, ondinho=cyan, clawdinho=arancio, mattia=viola)

#### HOUSE-004: Bot Integration
**Status:** TODO
- [ ] Ogni bot può postare nella House chat via API
- [ ] Ogni bot riceve notifiche quando menzionato (@clawdinho, @ondinho, @bubble)
- [ ] Auto-post: status updates, task completati, errori critici
- [ ] Mattia può mandare comandi ai bot via chat web

#### HOUSE-005: Deploy su onde.surf
**Status:** TODO
- [ ] Hostare su onde.surf/house (Cloudflare Pages o simile)
- [ ] CORS config per API calls al Gateway
- [ ] Auth basica per accesso (solo Mattia)
- [ ] SSL/HTTPS

#### HOUSE-006: SQLite Migration (GROK TASK 1 — PROC-002)
**Status:** ✅ DONE
**Completed:** 2026-02-17
**Source:** Grok feedback 2026-02-17
**Effort:** 2-3 ore

Migrato a Cloudflare D1 (SQLite) su prod:
- [x] D1 database con tabella house_messages (id, created_at, sender, content, reply_to)
- [x] D1 tabella house_heartbeats per status online/offline
- [x] API REST: GET /api/house/chat, POST con Bearer token auth
- [x] API status: GET/POST /api/house/chat/status
- [x] Frontend Next.js su onde.surf/house/chat (polling 3s, @mention highlights, token login)
- [x] Deploy via deploy-onde-surf.sh
- [x] 11/11 test passati (auth, CRUD, polling, replies, errors, site integrity)
- [x] PROC-002 Grok review completata

**PROC-002 Grok Feedback:** Rate limiting mancante, token rotation da migliorare, message retention/cleanup necessario, CORS/security headers da verificare.

#### HOUSE-007: Real-time Chat via SSE (GROK TASK — PROC-002 round 2)
**Status:** TODO
**Source:** Grok PROC-002 feedback 2026-02-17
**Effort:** 6-10 ore

Sostituire polling 3s con Server-Sent Events push real-time:
- [ ] Endpoint GET /api/house/chat/events → SSE stream
- [ ] Frontend EventSource, aggiorna messaggi live senza polling
- [ ] Fallback: se EventSource fallisce → polling 10s
- [ ] Mantiene @mention highlights e reply visuali
- [ ] Test: nuovo msg < 2s, multi-tab sync, riconnessione auto dopo network drop

**Benefici:** UX istantanea, meno query D1, risparmio costi

#### HOUSE-008: Rate Limiting + Bot Abuse Protection (GROK TASK — PROC-002 round 2)
**Status:** ✅ DONE
**Completed:** 2026-02-17
**Source:** Grok PROC-002 feedback 2026-02-17
**Effort:** ~1 ora

Proteggere API da spam/flood:
- [x] Rate limit: 30 msg/min per sender via KV sliding window
- [x] KV namespace RATE_KV con TTL 120s auto-cleanup
- [x] Headers RateLimit-Limit / Remaining / Reset su tutte le POST responses
- [x] 429 Too Many Requests con Retry-After header
- [x] Graceful fallback se KV non disponibile
- [x] Test prod: burst 5 msg OK, headers corretti, decremento remaining
- [x] PROC-002 Grok consultation + feedback round

**Nota:** Ban temporaneo (3× violations) non implementato — per ora il 429 è sufficiente con 4 utenti.
**Grok architettura:** KV > D1 per rate limiting (low latency, TTL nativo, globally distributed)

#### HOUSE-009: Input Validation + Zod Schema (GROK TASK — PROC-002 round 3)
**Status:** ✅ DONE
**Completed:** 2026-02-17
**Source:** Grok PROC-002 feedback su HOUSE-008
**Effort:** 2-3 ore

Validazione rigorosa del body POST:
- [ ] Zod schema per body (content: max 2000 char, no solo whitespace)
- [ ] Strip HTML per prevenire XSS (anche se sender trusted)
- [ ] reply_to: check che esista nel DB (opzionale)
- [ ] Return 400 con dettagli errore ({ error: "Content too long", max: 2000 })
- [ ] Test: body invalido → 400 chiaro, client esistenti non rotti

#### HOUSE-010: Mentions Parsing + DB Storage (GROK TASK — PROC-002 round 3)
**Status:** ✅ DONE
**Completed:** 2026-02-17
**Source:** Grok PROC-002 feedback su HOUSE-008
**Effort:** 3-4 ore

Mentions @user con highlight e storage:
- [ ] Regex parsing @Mattia, @Clawdinho etc. su content
- [ ] Salva mentions come colonna separata o JSON in DB
- [ ] Campo mentions: string[] nel GET response
- [ ] ?mentioning=Mattia continua a funzionare
- [ ] Frontend highlight (CSS) per mentions
- [ ] No regressioni performance GET

---

## ⚪ BACKLOG

- ADS-001: Ads kid-friendly su onde.la
- SEO-002: Meta optimization
- VIRAL-002: Crafting Guide / Cookie Clicker deploy
- MKTG-001: X posting strategy
- MONEY-001: Micro-monetizzazione generale

