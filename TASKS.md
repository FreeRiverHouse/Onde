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

### PGR-001: Grafica HC2-Level — Motorino su Percorso Circolare
**Owner:** Ondinho 🟢 guida, Bubble 🫧 esegue
**Status:** IN_PROGRESS
**Priority:** P0

**Obiettivo:** Motorino su percorso circolare con grafica livello Horizon Chase 2

**TODO:**
- [ ] Screenshot ogni 10 min — comparare con HC2 reference
- [ ] Cel-shading / toon shader implementato
- [ ] Low-poly environment con colori vibranti
- [ ] Skybox tramonto come HC2
- [ ] Camera follow smooth

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
**Owner:** Bubble 🫧
**Status:** NEW
**Priority:** P0

**Obiettivo:** Nessun bot può "dormire" o sparire. Heartbeat ogni 10 min obbligatorio.

**TODO:**
- [ ] Verificare heartbeat config su TUTTI i bot (Clawdinho, Ondinho, Bubble)
- [ ] HEARTBEAT.md NON vuoto — task di check attivi
- [ ] Alert se un bot non risponde per >15 min
- [ ] Watchdog cross-bot: ogni bot controlla gli altri

### OPS-002: Cross-Bot Communication
**Owner:** Bubble 🫧
**Status:** NEW
**Priority:** P1

**TODO:**
- [ ] Webhook per bot-to-bot messaging automatico
- [ ] Escalation automatica se task bloccato
- [ ] Report consolidato giornaliero

---

## ⚪ BACKLOG

- ADS-001: Ads kid-friendly su onde.la
- SEO-002: Meta optimization
- VIRAL-002: Crafting Guide / Cookie Clicker deploy
- MKTG-001: X posting strategy
- MONEY-001: Micro-monetizzazione generale

