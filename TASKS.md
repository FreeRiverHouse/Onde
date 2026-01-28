# TASKS.md — Lista Task Attivi

> Basato su ROADMAP.md + priorità correnti. Aggiornato automaticamente.

## 🔥 IN CORSO ORA

| Task | Agente | Status |
|------|--------|--------|
| Deploy onde.surf | GitHub Actions | ✅ completato |
| Traduzione cap 5 Republic of Innovation | diretto | ✅ COMPLETATO (594 righe) |
| Traduzione capussela-spirito-EN | translate-amd.py | ✅ completato (1622 righe) |
| Autotrader Kalshi | Script Python | ✅ running |

## 📋 PROSSIMI (Alta Priorità)

### Traduzione
- [ ] Tradurre cap 5-6 "Republic of Innovation" (se agente bloccato, farlo direttamente)
- [ ] Verificare qualità traduzione con stile cap 1-4

### Deploy & Infra
- [x] Verificare deploy onde.surf completato ✅
- [x] Test curl dopo deploy ✅
- [x] Aggiornare ROADMAP con progressi ✅
- [x] **FIX:** onde.surf/frh → 307 redirect ✅ (verified working 200 OK)

### Trading
- [ ] Monitorare win rate autotrader
- [ ] Analizzare trades in `scripts/kalshi-trades.jsonl`
- [ ] Ottimizzare se win rate < 50%

### Libri (da ROADMAP TIER 1)
- [ ] Frankenstein illustrato EN
- [ ] Meditations illustrato EN
- [ ] The Prophet illustrato EN
- [ ] AIKO EN su KDP
- [ ] Psalm 23 multilingua su KDP

### Portal onde.la
- [x] Verificare homepage funzionante ✅
- [x] Test ebook reader /leggi ✅ (6 libri OK)
- [ ] Analytics Google

### App & VR
- [ ] AIKO Interactive app
- [ ] FreeRiver Flow voice prototype
- [ ] Onde Books VR per Quest

### 🌙 Moonlight House (STATO: GIÀ MOLTO AVANZATO!)
- [x] Implementare glassmorphism UI ✅
- [x] Aggiungere glow effects ✅
- [x] Character sprite (luna-happy.jpg) ✅
- [x] Particle system (stelle, sparkles) ✅
- [x] Background images per tutte le stanze ✅
- [x] Transizioni stanze con Framer Motion ✅ (2026-01-28)
- [x] Responsive + mobile test ✅ (2026-01-28) - Added 768px, 480px, 360px, 600px-height breakpoints
- [ ] Sprite mood diversi (ora usa emoji 😊😢 ecc)
- [ ] **Target: qualità App Store featured**

## 📅 BACKLOG (Media Priorità)

### Content
- [ ] Video Piccole Rime su @Onde_FRH
- [ ] Postare 3 video già pronti
- [ ] Cross-pollination catalogo → social

### PR & Social
- [ ] Bio @Onde_FRH: "AI Publishing House + PR Agency"
- [ ] Instagram revival @magmatic__
- [ ] Content pillars strategy

### Tech
- [ ] Sally CRO Dashboard
- [ ] Worker Dashboard miglioramenti
- [ ] Approval Dashboard notifiche

## ✅ COMPLETATI OGGI (2026-01-27)

- [x] Trading strategy fix (Kelly 0.08, MinEdge 15%)
- [x] Betting dashboard upgrade (LastBetCard, PortfolioChart, RecentFillsTable)
- [x] Estratto originale EN "Republic of Innovation"
- [x] Setup script traduzione Helsinki-NLP
- [x] Trigger deploy onde.surf via GitHub Actions
- [x] **Deploy onde.surf COMPLETATO** ✅
- [x] **Traduzione CAP 5 "Rimedi liberali" COMPLETATO** (~12k parole)
- [x] **Traduzione AMD/tinygrad COMPLETATA** (594 righe, 20k parole) → traduzioni/republic-of-innovation-IT.md

## 🆕 AGGIUNTI OGGI (2026-01-28)

- [x] Watchdog autotrader + cron ✅
- [x] Ondinho welcome letter ✅
- [x] Moonlight Framer Motion ✅
- [x] Moonlight responsive CSS ✅

### Nuovi Task (aggiunti da agente)
- [ ] **Trading**: Aggiungere tracking settlement per calcolare win rate reale
- [ ] **Moonlight**: Creare sprite mood diversi (happy, sad, sleepy, hungry) invece di emoji
- [x] **Monitoring**: Creare pagina status `/health` che mostra stato tutti i servizi ✅

### Task aggiunti dopo health page
- [x] **Portal**: Deploy onde.la per attivare /health ✅ (live at https://onde.la/health/)
- [x] **Trading**: Script analisi PnL giornaliero da kalshi-trades.jsonl ✅ (scripts/analyze-trades-pnl.py)
- [ ] **Docs**: Aggiornare README con nuove funzionalità (health, responsive)

### Task aggiunti 2026-01-28 13:05
- [ ] **Trading**: Integrare settlement tracking automatico (BTC price a expiry) per calcolare win/loss reale
- [x] **Portal**: Aggiungere metadati Open Graph per preview social su /libri ✅
- [ ] **Moonlight**: Aggiungere sound effects (ambient music, interaction sounds)

---

*Ultimo aggiornamento: 2026-01-28 13:02 PST*
