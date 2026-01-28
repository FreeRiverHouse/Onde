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
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T011], [T012], [T013]
- **Priority**: P1
- **Notes**: ✅ NLLB-200 (facebook/nllb-200-distilled-600M) installato. Script: ~/clawd/translator.py

### [T011] Tradurre libro Capussela IT→EN
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: [T010]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Già completato in T102! File: traduzioni/capussela-spirito-EN.txt (1622 righe). "Capussela spirito" = "Republic of Innovation"

### [T012] Tradurre Republic of Innovation cap 6+
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: [T010]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Capitolo 6 (finale) completato. File: traduzioni/republic-of-innovation-IT.md (887 righe totali)

### [T013] Verificare qualità traduzione vs cap 1-4
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T012]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ QA completato. Voto 9/10. Report: traduzioni/QA-REPORT-republic-innovation.md

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

### [T032] Ottimizzare se win rate < 50%
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Fixed! Black-Scholes inspired model with momentum tracking. Higher min edge (25%) for NO bets. Removed bearish bias.

---

## 📋 TODO - AUTOTRADER V2

### [T033] Backtest del nuovo modello su dati storici
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ v2 model avrebbe SKIPPATO tutti 41 trade! v1 calcolava edge 45% quando era in realtà <10%. Script: backtest-v2-model.py

### [T034] Alert Telegram se balance < $5
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ kalshi-balance-alert.py + integrazione in autotrader. Scrive alert file se cash < $5, cooldown 1h

### [T035] Log win/loss settati via settlement tracker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Settlement tracker ora aggiorna automaticamente result_status in kalshi-trades.jsonl (won/lost)

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Wave icon SVG created for onde-portal and surfboard. icon.svg + apple-icon.svg in app/ directories.

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

### [T081] Alert Telegram se win rate < 40%
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ kalshi-winrate-alert.py + cron ogni 6h. Alert file kalshi-low-winrate.alert per heartbeat

### [T082] Dashboard trading stats su /trade
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added /api/trading/stats API + Trading Performance section in /betting with win rate, PnL, today stats, and recent trades grid.

### [T083] Trade log cleanup: rimuovere duplicati per stesso ticker/hour
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Multiple trades per stesso contratto (es. 4 trades T88499.99@04) - consolidare o tenere separati?

### [T084] API endpoint per trade stats JSON
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created as part of T082. GET /api/trading/stats returns winRate, pnl, todayStats, recentTrades.

### [T085] Notifica Telegram riassunto giornaliero trade
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: kalshi-daily-summary.py + kalshi-daily-notify.sh. Cron 07:00 UTC (23:00 PST). Alert file per heartbeat pickup.

### [T086] Autotrader: pausa se PnL giornaliero < -$1
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implementato! Autotrader ora pausa automaticamente se daily loss > $1. File pause: kalshi-daily-pause.json. Reset a mezzanotte UTC.

### [T087] Migliorare modello: momentum tracking multi-timeframe
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Usare 1h, 4h, 24h momentum invece di solo volatility istantanea

### [T088] Grafici trend BTC su /trade dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Chart con price action e trade markers

### [T089] Verificare v2 autotrader sta usando modello corretto
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ FIXED! Era in esecuzione v1 (broken). Killato e riavviato con v2 (PID 22269). Ora usa Black-Scholes corretto.

### [T090] Aggiungere YES bets quando trend bullish
- **Status**: TODO
- **Owner**: 
- **Depends**: [T087]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Se momentum è fortemente bullish, considerare YES invece di NO

### [T091] Log edge calcolato per ogni skip
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Debug: loggare il motivo preciso per cui ogni trade viene skippato

### [T092] PDF formattato "La Repubblica dell'Innovazione"
- **Status**: TODO
- **Owner**: 
- **Depends**: [T013]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Generare PDF professionale dalla traduzione IT approvata (QA 9/10)

### [T093] Backup automatico kalshi-trades.jsonl su git
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: scripts/backup-trades-git.sh + cron 00:05 UTC daily. Backup in data/trading/. 2007 trades backed up.

### [T094] Grafana/Prometheus setup per trading metrics
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Dashboard real-time per win rate, PnL, open positions

### [T095] Weekly trading report (PDF summary)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Generate PDF report ogni domenica con: trades totali, win rate, PnL, best/worst trade

### [T096] Trade history web viewer su /trading/history
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Simple HTML table con filtri per date, risultato (won/lost/pending), ordinamento

### [T097] Cleanup vecchi backup > 30 giorni
- **Status**: TODO
- **Owner**: 
- **Depends**: [T093]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Evitare bloat repo: tenere solo ultimi 30 giorni in data/trading/

### [T098] Generare favicon.ico da SVG per compatibilità legacy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T042]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created PNG fallbacks (16px, 32px) in public/. Skipped .ico generation - IE is EOL (Jan 2022), all modern browsers support SVG/PNG.

### [T099] Meta tags Open Graph per onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added OpenGraph, Twitter cards, and icon metadata to surfboard layout.tsx. Moved icons to public/.

### [T200] Verificare favicon appare su onde.la dopo deploy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T042]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed stray app/ folder that broke homepage routing. Icons moved to src/app/. Deployed to onde.la successfully.

### [T204] Fix homepage 404 - stray app/ folder
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T200]
- **Priority**: P1
- **Notes**: ✅ Next.js prefers app/ over src/app/. Empty app/ folder (only icons) caused homepage 404. Moved icons to src/app/, removed stray folder.

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

### [T110] Cron settlement tracker ogni ora
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Cron job `0 * * * *` esegue settlement tracker

### [T111] Analisi win rate reale
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: 41 trade NO, 0% win rate - BTC +2.3% ($88k→$90k). Script: analyze-winrate.py

### [T112] Fix duplicate runtime export surfboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: betting/page.tsx aveva `export const runtime = 'edge'` duplicato. Fixed e pushed. ⚠️ Deploy fallito per GitHub billing issue!

---

### [T201] PnL calculation fix: handle YES bets correctly
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Analyzed - current formula is CORRECT for both YES and NO! profit = (100-price)*contracts when won, loss = price*contracts when lost. Same for both sides.

### [T202] Historical win rate trend chart
- **Status**: TODO
- **Owner**: 
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add line chart showing win rate over time (daily rolling average) to /betting dashboard

### [T203] Trade filtering by date range
- **Status**: TODO
- **Owner**: 
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Allow filtering trading stats by custom date range (today, week, month, custom)

---

*Ultimo aggiornamento: 2026-01-28 15:10 PST*
*Sistema coordinamento: vedi TASK-RULES.md*
