# TASKS.md - Lista Task Attivi

## 🔴 In Attesa (da fare)
- [x] ~~Aggiungere volatility-adjusted buffer~~ ✅ (2σ daily vol)
- [ ] Raccogliere dati per ICA/PCA analysis
- [x] ~~**MULTI-AGENT GROK STYLE**~~ ✅ `scripts/kalshi-multiagent.py`
- [x] ~~Implementare risk limits~~ ✅ FATTO
- [x] ~~Beast Mode per edge alto (>30%)~~ ✅ integrato in multiagent (1.5x size)

## ✅ Appena Completato
- [x] Kelly criterion sizing implementato in kalshi-microbet.py
- [x] Risk limits implementati (5% max position, 15% drawdown, 15 max positions)

## 🟡 In Corso
- [~] Microbetting API - 5 trade eseguiti, portfolio $13.65 (+127%!)
- [~] Whale detection via volume spike (no leaderboard pubblica)

## 🟡 In Corso
<!-- Task su cui sto lavorando -->

## 🟢 Completati Oggi
- [x] Creare API key Kalshi ✅
- [x] Script kalshi-api-trader.py funzionante ✅
- [x] Test API: balance $6.57, 9 posizioni ✅
- [x] **ORDINE REALE VIA API** - comprato 1 YES BTC≥$88,750 @ 62¢ ✅
- [x] API Kalshi completamente funzionante (no browser needed!) ✅

---

## 📋 Regole
1. **Ogni richiesta** → aggiungi a "In Attesa"
2. **Quando lavoro** → sposto a "In Corso"
3. **Heartbeat senza messaggi** → lavoro ai task pendenti o spawno agenti
4. **Mai dimenticare** → se non capisco, chiedo subito

---
*Ultimo update: 2026-01-27 16:20 PST*
