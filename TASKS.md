# TASKS.md — Task Condivisi Multi-Agente

> ⚠️ **LEGGERE TASK-RULES.md PRIMA DI TOCCARE QUESTO FILE!**
> 
> Questo file è SHARED tra tutti gli agenti. Rispettare il protocollo di lock!

---

## 🔥 IN PROGRESS

### [T001] Autotrader Kalshi Monitoring
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: Watchdog attivo, monitorare win rate

---

## 📋 TODO - TRADUZIONI

### [T010] Installare modello traduzione su M4 Mac
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: [T011], [T012], [T013]
- **Priority**: P1
- **Notes**: LLaMA 3 8B o Helsinki-NLP. Serve per tutte le traduzioni.

### [T011] Tradurre libro Capussela IT→EN
- **Status**: TODO
- **Owner**: 
- **Depends**: [T010]
- **Blocks**: -
- **Priority**: P2
- **Notes**: capussela-spirito. Chi finisce T010 prende questo.

### [T012] Tradurre Republic of Innovation cap 6+
- **Status**: TODO
- **Owner**: 
- **Depends**: [T010]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Continuare dopo cap 5 completato.

### [T013] Verificare qualità traduzione vs cap 1-4
- **Status**: TODO
- **Owner**: 
- **Depends**: [T012]
- **Blocks**: -
- **Priority**: P2
- **Notes**: QA sui capitoli tradotti.

---

## 📋 TODO - LIBRI (TIER 1)

### [T020] Frankenstein illustrato EN
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Da ROADMAP TIER 1

### [T021] Meditations illustrato EN
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Da ROADMAP TIER 1

### [T022] The Prophet illustrato EN
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Da ROADMAP TIER 1

### [T023] AIKO EN su KDP
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Pubblicare su Amazon

### [T024] Psalm 23 multilingua su KDP
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Versione multilingue

---

## 📋 TODO - TRADING

### [T031] Analisi win rate reale
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Settlement tracking completato (T109) - ora calcolare stats accurate

### [T032] Ottimizzare se win rate < 50%
- **Status**: TODO
- **Owner**: 
- **Depends**: [T031]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Tune parametri Kelly/MinEdge se serve

---

## 📋 TODO - PORTAL & INFRA

### [T040] Analytics Google per onde.la
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Aggiungere GA4

### [T041] Sitemap.xml automatico per onde.la
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: SEO improvement

### [T042] Favicon personalizzata Onde
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Wave icon

### [T043] Health check in CI
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Test automatico endpoint /health

---

## 📋 TODO - MOONLIGHT HOUSE

### [T050] Sprite mood diversi
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Happy, sad, sleepy, hungry invece di emoji

### [T051] Sound effects
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Ambient music, interaction sounds

---

## 📋 TODO - CONTENT & SOCIAL

### [T060] Video Piccole Rime su @Onde_FRH
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Content per social

### [T061] Postare 3 video già pronti
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Video esistenti da pubblicare

### [T062] Bio @Onde_FRH update
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: "AI Publishing House + PR Agency"

---

## 📋 TODO - APP & VR

### [T070] AIKO Interactive app
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: App interattiva

### [T071] FreeRiver Flow voice prototype
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Voice AI prototype

### [T072] Onde Books VR per Quest
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: VR reading experience

---

## 📋 TODO - AUTOTRADER IMPROVEMENTS

### [T080] Cron settlement tracker ogni ora
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: Eseguire kalshi-settlement-tracker.py periodicamente

### [T081] Alert Telegram se win rate < 40%
- **Status**: TODO
- **Owner**: 
- **Depends**: [T031]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Notifica se performance scende troppo

### [T082] Dashboard trading stats su /trade
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Pagina web con win rate, PnL, ultimi trade

---

## ✅ DONE

### [T100] Deploy onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-27
- **Notes**: GitHub Actions deploy completato

### [T101] Traduzione cap 5 Republic of Innovation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-27
- **Notes**: 594 righe, ~12k parole

### [T102] Traduzione capussela-spirito-EN
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-27
- **Notes**: 1622 righe via translate-amd.py

### [T103] Watchdog autotrader + cron
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Script watchdog ogni 5 min

### [T104] Moonlight Framer Motion transitions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Animazioni stanze

### [T105] Moonlight responsive CSS
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: 768px, 480px, 360px, 600px-height breakpoints

### [T106] Health page /health
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Status tutti servizi

### [T107] Open Graph metadati /libri
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Preview social

### [T108] Script analisi PnL
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: scripts/analyze-trades-pnl.py

### [T109] Settlement tracking automatico
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: scripts/kalshi-settlement-tracker.py - multi-source BTC price fetching

---

*Ultimo aggiornamento: 2026-01-28 13:43 PST*
*Sistema coordinamento: vedi TASK-RULES.md*
