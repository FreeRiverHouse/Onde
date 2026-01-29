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
- **Notes**: Versione multilingue. Checklist: books/salmo-23-kdp/KDP-CHECKLIST.md

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created sitemap.ts + robots.ts for Next.js auto-generation. /sitemap.xml and /robots.txt now available.

### [T042] Favicon personalizzata Onde
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Wave icon SVG created for onde-portal and surfboard. icon.svg + apple-icon.svg in app/ directories.

### [T043] Health check in CI
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Already implemented! scripts/health/check.ts + smoke-test.ts exist. CI runs bot-health job with `npm run health:check`.

---

## 📋 TODO - MOONLIGHT HOUSE

### [T050] Sprite mood diversi
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added CSS-based mood visual effects! Luna now has distinct appearances for each mood: happy (golden glow, gentle bounce), neutral (soft blue), sad (desaturated, droop animation), sleepy (dim, slow nod), hungry (green tint, wobble), excited (rainbow glow, jump). Both map and room views updated. Foundation for real sprite images later.

### [T051] Sound effects
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created full sound system! useSoundManager hook with: 12 sound effects (ui-click, action-eat/sleep/play/bath/shop/drive, coin-collect, level-up, achievement), 3 ambient tracks (home/garden/shop), mute toggle, volume control, localStorage persistence. Uses Web Audio API oscillator fallback when MP3s not available. Sounds play on all interactions. Mute button in header.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ INTEGRATED! Momentum was calculated but never used. Now: 1) get_btc_ohlc() fetches 2-day OHLC, 2) get_multi_timeframe_momentum() calculates 1h/4h/24h composite, 3) adjust_probability_with_momentum() adjusts edge calc, 4) Skip trades that conflict with strong momentum, 5) 2% edge bonus for aligned momentum trades

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T087]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already implemented! Autotrader makes YES bets when bullish (113 YES vs 821 NO in trade log). Logic: same MIN_EDGE, skips YES on bearish momentum, 2% bonus when momentum aligns.

### [T091] Log edge calcolato per ogni skip
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added verbose skip logging to find_opportunities(). Shows breakdown by skip reason, and for insufficient edge shows top 5 closest opportunities with exact edge gap needed.

### [T092] PDF formattato "La Repubblica dell'Innovazione"
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T013]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already exists! traduzioni/republic-of-innovation-IT.pdf (394KB, 8 pages). Created from Claude Opus translation.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: kalshi-weekly-report.py. PDF with daily breakdown, best/worst trades, PnL. Cron: Sunday 08:00 UTC. Output: data/reports/

### [T096] Trade history web viewer su /trading/history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T222]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created /trading/history page with: paginated table, filters (result/asset/side), CSV export, responsive design. Uses new /api/trading/history endpoint.

### [T097] Cleanup vecchi backup > 30 giorni
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T093]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: scripts/cleanup-old-backups.sh + cron 01:00 UTC daily. Keeps last 30 days of backups.

### [T205] Install Playwright for automated testing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Installed via npm: playwright + @playwright/test. Chromium + FFmpeg downloaded to ~/Library/Caches/ms-playwright/

### [T206] Fix onde.surf GH Actions deploy (billing issue)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Deploy blocked due to GitHub Actions billing limit. Mattia needs to check billing or switch to Cloudflare Pages direct.

### [T207] Create centralized test-pre-deploy.sh script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Already exists as test-website-before-deploy.sh! Comprehensive Playwright tests + curl fallback. Used by deploy-onde-la-prod.sh.

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

### [T208] Test playwright integration in deploy verification
- **Status**: TODO
- **Owner**: 
- **Depends**: [T205]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Update deploy-onde-la-prod.sh to use playwright for full browser tests instead of curl fallback

### [T209] Canonical URLs for all pages
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added metadataBase + alternates.canonical to root and all page layouts. Prevents duplicate content issues.

### [T210] Meta descriptions per page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added layout.tsx with Metadata for /about, /catalogo, /collezioni, /famiglia, /giochi, /health. Each has unique title+description for SEO.

### [T211] Telegram alert se autotrader crasha
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Enhanced watchdog-autotrader.sh: creates kalshi-autotrader-crash.alert on crash detection. 30min cooldown. Heartbeat picks up alert and notifies.

### [T212] Backup memory files to git daily
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: backup-memory-git.sh. Cron 02:00 daily. Backs up MEMORY.md, memory/, SOUL.md, USER.md, TOOLS.md, IDENTITY.md, HEARTBEAT.md. 30-day retention.

### [T213] Kalshi API retry logic con exponential backoff
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added exponential backoff (2^n + jitter) to api_request(). Retries 5xx/timeout/conn errors up to 3x. Also added retry to CoinGecko and Fear&Greed APIs.

### [T214] Cleanup vecchi log autotrader > 7 giorni
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: scripts/cleanup-autotrader-logs.sh. Rotates logs >10MB, keeps last 1000 lines. Cron 03:00 daily.

### [T215] Watchdog health check - verify cron is running
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: meta-watchdog.sh. Cron */15 * * * *. Alerts if watchdog.log stale >15min. 1h cooldown.

### [T216] Trading stats hourly snapshot for trend analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: kalshi-hourly-snapshot.py. Saves to data/trading/snapshots/YYYY-MM-DD.jsonl. Tracks all-time + today stats (trades, win rate, PnL, by asset/side). Cron: hourly at :00.

### [T217] Aggregate alert check in heartbeat pickup
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added watchdog-stale.alert to HEARTBEAT.md alert file list

### [T218] Autotrader uptime percentage tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: autotrader-uptime.py. Parses watchdog.log, calculates uptime % (24h + 7d). Saves to data/trading/autotrader-uptime.json. Cron: hourly at :30. Current: 95% uptime.

### [T219] Email notification fallback for critical alerts
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: If Telegram notification fails, send via email as backup

### [T220] A/B testing framework for trading strategies
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare different model parameters side-by-side. Track paper trades vs real trades.

### [T221] Export trading stats to CSV
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: kalshi-export-csv.py. Usage: `--days N` for last N days, `--output file.csv` for custom path. Output: data/exports/

### [T222] Trade history API with pagination
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ /api/trading/history with pagination (page, limit), filters (result, asset, side, from, to), and sorting (sort, order). Returns trades with calculated PnL.

---

### [T223] Add ETH (KXETHD) market support to autotrader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added! Now scans both KXBTCD (BTC) and KXETHD (ETH) markets. Uses ETH_HOURLY_VOL (0.7%) for ETH. Separate momentum tracking for each asset. Trade log now includes `asset` field.

### [T224] Save skip logs to file for pattern analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T091]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added log_skip() function + SKIP_LOG_FILE constant. Logs to scripts/kalshi-skips.jsonl with: ticker, reason, edge, edge_needed, edge_gap, probabilities, strike, current_price, asset, minutes_to_expiry. Covers both low_edge_yes/no and expiry skips.

### [T225] Add trade entry reason field to trade logs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "reason" field + full context to trade_log. Reason includes: edge %, momentum direction (bullish/bearish/neutral), extreme sentiment, high volatility. Also logs momentum, volatility, sentiment values for post-trade analysis.

### [T226] Add JSON-LD structured data for books
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Schema.org Book + ItemList + CollectionPage markup to /libri layout.tsx. Includes author, translator, datePublished, offers with price=0. Google rich snippets ready.

### [T227] Lighthouse CI check for performance regression
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add Lighthouse audit to CI pipeline. Fail if performance score < 80 or accessibility < 90.

### [T232] Add momentum analysis to weekly trading report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T095]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Weekly report now includes: 1) Momentum Correlation Analysis section comparing aligned vs non-aligned trade win rates with insight, 2) Performance by Market Regime section showing win rate/PnL per regime (trending_bullish/bearish, sideways, choppy).

### [T233] Add Fear & Greed index to trade decision logging
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Completed as part of T225. Sentiment now logged in trade_log with value + included in reason string when extreme (<30 or >70).

### [T234] Implement trailing stop-loss for open positions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added! check_stop_losses() monitors open positions every cycle. Exits if position value drops 50% from entry. Functions: sell_position(), check_stop_losses(), execute_stop_losses(), get_entry_price_for_position(). Logs to kalshi-stop-loss.log.

### [T235] ETH settlement tracker support
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Updated! Now handles KXETHD tickers. Functions renamed: get_price_at_time(), get_price_binance(), get_price_cryptocompare() with asset param. Logs asset type in settlement records.

### [T236] Separate win rate tracking per asset (BTC vs ETH)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-winrate-by-asset.py. Shows per-asset: total trades, win rate, PnL, ROI, YES/NO breakdown. Currently 41 BTC trades (old v1 data), ETH ready.

### [T237] Auto-rebalance between assets based on volatility
- **Status**: TODO
- **Owner**: 
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When one asset has significantly higher volatility (implied vs realized), prefer trading that asset for better edge opportunities.

### [T228] Add error boundary to ClientLayout
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created ErrorBoundary.tsx with "Try Again" + "Go Home" buttons. Shows error details in dev mode. Wraps children in ClientLayout.

### [T229] Add hreflang tags for multilingual pages
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add hreflang alternate links for IT/EN versions of pages. Helps Google show correct language version.

### [T230] Preload critical fonts for faster LCP
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added preload for Playfair Display woff2 (latin subset). Reduces render-blocking on LCP.

### [T231] Add breadcrumb structured data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Organization + WebSite schema to root layout. Added BreadcrumbList to /libri and /catalogo. SearchAction for catalog search.

---

## 📋 TODO - CHIEDIALO (AI Publishing)

### [T238] ChiedIAlo USA - Personaggi Editore Capo e Pina Pennello
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Creare versione USA di ChiedIAlo. Personaggi: Editore Capo + Pina Pennello per illustrazioni. Creare design personaggi.

### [T239] Stop-loss Telegram notification
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T234]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added write_stop_loss_alert() to autotrader-v2. Creates kalshi-stop-loss.alert with JSON payload (ticker, side, entry/exit price, loss %). HEARTBEAT.md updated to check and forward to Telegram.

### [T240] Stop-loss performance tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T234]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-stop-loss.py. Compares actual loss at exit vs potential loss if held to settlement. Shows net savings. No stop-losses triggered yet (good!).

### [T241] Configurable stop-loss threshold via env
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T234]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! STOP_LOSS_THRESHOLD (default 0.50) and MIN_STOP_LOSS_VALUE (default 5) now read from environment variables.

### [T242] Analyze skip log patterns - find optimal MIN_EDGE
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T224]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-skip-patterns.py. Findings: Old 15%/25% thresholds were too conservative. Current v2 uses 10% for both - appropriate since most skipped trades had <2% edge. 65% of NO skips had positive edge under old thresholds.

### [T243] Market regime detection (bullish/bearish/sideways)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! detect_market_regime() classifies: trending_bullish, trending_bearish, sideways, choppy. Dynamic MIN_EDGE: 7% trending, 12% sideways, 15% choppy + volatility adjustments. Integrated into find_opportunities() and trade logging.

### [T244] Implied volatility extraction from Kalshi prices
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Reverse-engineer implied vol from Kalshi market prices. Compare vs realized vol to find mispriced options (high IV vs low realized = sell premium).

### [T245] Filter extreme prices (≤5¢ or ≥95¢) from opportunities
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed "Bet too small" bug. Was selecting 100¢ NO contracts with no profit potential. Now skips prices ≤5¢ or ≥95¢ (bad risk/reward).

### [T246] Multi-exchange price feeds (Binance + CoinGecko + Coinbase)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Average prices from multiple exchanges for more accurate probability calculations. Reduces risk of single-source price manipulation or API lag.

### [T247] Daily stop-loss stats summary in report
- **Status**: TODO
- **Owner**: 
- **Depends**: [T239], [T085]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Include stop-loss stats in daily report: count triggered, total loss prevented vs if held, average loss %. Helps evaluate stop-loss threshold tuning.

### [T248] Position sizing analysis (Kelly effectiveness tracking)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track actual bet sizes vs theoretical Kelly optimal. Compare win rates and PnL at different position sizes to optimize KELLY_FRACTION.

---

### [T249] Trade analysis by hour of day
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-trades-by-hour.py. Shows win rate/PnL per hour UTC. Currently all trades from broken v1 model. V2 needs more data.

### [T250] Momentum indicator on /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T087]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ API: /api/momentum (CoinGecko OHLC). UI: BTC/ETH momentum cards with 1h/4h/24h changes + composite score + signal (bullish/bearish/neutral).

### [T251] Memory file search CLI tool
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: memory-search.sh. Case-insensitive grep with context. Searches MEMORY.md, memory/*.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md.

### [T252] Auto-cleanup stale alert files > 24h
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: cleanup-stale-alerts.sh. Removes alert files >24h old. Cron every 6h. Checks all 6 alert types.

### [T253] Win rate by market type (hourly vs daily)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-market-types.py. Analyzes by asset (BTC/ETH), trading session, side (YES/NO), and hour UTC. V1 data: 0% WR (broken model). V2 awaiting trades.

### [T254] Dashboard last heartbeat timestamp
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Local monitoring: memory/heartbeat-state.json. Scripts: update-heartbeat-state.sh + check-heartbeat-state.sh. Run `scripts/check-heartbeat-state.sh` to verify bot is alive. Web dashboard integration would need GitHub API (future task).

### [T255] Alert file age warning (12h threshold)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-alert-ages.sh. Integrated into meta-watchdog.sh. Logs warnings for alerts aged 12-24h to help debug heartbeat pickup issues.

### [T256] Cron job health dashboard on /health
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API: /api/health/cron checks log file ages. UI: "Scheduled Jobs" section on /health shows each cron job with status (healthy/stale/error), schedule, and last run time.

### [T257] Trading PnL notification on market close
- **Status**: DONE (duplicate)
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Superseded by T085 (daily summary at 07:00 UTC). Same functionality via kalshi-daily-summary.py.

---

### [T258] Momentum history chart (sparkline)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add 24h sparkline chart showing momentum trend on each asset card.

### [T259] Momentum alert when direction changes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Functions: load_momentum_state(), check_momentum_change(), write_momentum_alert(). Only alerts on significant flips (bullish↔bearish, ignores neutral). 30min cooldown. Alert file: kalshi-momentum-change.alert. Added to HEARTBEAT.md pickup.

### [T260] Trading stats API caching
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ File-based caching with 60s TTL. Cache at data/trading/stats-cache.json. Validates by TTL + source file mtime. Response includes cached: true/false + cacheAge.

---

### [T261] Add JSON-LD structured data for /catalogo
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Schema.org CollectionPage + ItemList with 5 featured books (Alice, Meditations, Grimm, Pride&Prejudice, Pinocchio). numberOfItems: 1000. Multi-language support.

### [T262] RSS feed for book releases
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created /feed.xml with 50 featured books. Added RSS autodiscovery to layout. Fixed static export for robots.ts, sitemap.ts, api/health/cron.

### [T263] Reading time estimate on book cards
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added pages + readingTime fields to Book interface. Shows "X pages" and "~Xh" on /libri cards with icons. UX improvement for users to gauge content before download.

### [T264] Regime change Telegram alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Integrated into autotrader-v2! Checks for regime changes each cycle. Alert file: kalshi-regime-change.alert. Shows old→new regime per asset with 4h/24h price changes and new MIN_EDGE. 1h cooldown between alerts. Added to HEARTBEAT.md pickup.

### [T265] Analyze win rate by regime
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-winrate-by-regime.py. Reads from kalshi-trades-v2.jsonl, groups by regime (trending_bullish/bearish, sideways, choppy), calculates win rate/PnL/ROI per regime, compares performance. Awaiting v2 trades for data.

### [T266] Backtest regime detection on historical data
- **Status**: TODO
- **Owner**: 
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run regime detection on past OHLC data to see how often each regime occurs and if predictions align with actual price movement.

---

### [T267] Add Atom feed alternative (/feed.atom)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created /feed.atom with proper Atom 1.0 format. Same 50 books as RSS. Added autodiscovery links in layout metadata + explicit link tags.

### [T268] RSS feed with dynamic book descriptions
- **Status**: TODO
- **Owner**: 
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Current feed uses generic descriptions. Pull actual book summaries from Gutenberg API or local data.

### [T269] Deploy onde.la with RSS feed
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed to Cloudflare Pages. RSS feed live at https://onde.la/feed.xml

---

### [T270] Fix curl redirect in verify-deployment-content.sh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed! Script was using `curl -s` but /libri redirects to /libri/. Changed to `curl -sL` to follow redirects. False positive "Meditations not found" resolved.

### [T271] Make playwright optional in verification scripts
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Modified verify-deployment-content.sh to check if playwright module exists before using it. Falls back gracefully with warning. curl check is sufficient for verification.

### [T272] Add autotrader v2 trade count to /health page
- **Status**: BLOCKED
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⏸️ Blocked: Static export to Cloudflare Pages cannot access local files at runtime. Needs server deployment or external API (GitHub API to read from repo, or dedicated monitoring endpoint).

### [T273] Profit factor calculation in trading stats
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API now returns grossProfitCents, grossLossCents, profitFactor. Dashboard shows Profit Factor card with color coding (>1.5=strong, >1=profitable). Grid expanded to 6 columns.

### [T274] Sharpe ratio calculation for trading strategy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T273]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns sharpeRatio (avg return / std dev). Dashboard shows Sharpe Ratio card with color coding (≥2=excellent, ≥1=good, ≥0=fair, <0=poor). Grid changed to 4-column layout.

### [T275] Max drawdown tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns maxDrawdownCents and maxDrawdownPercent. Calculates largest peak-to-trough decline in cumulative PnL. Dashboard card shows % with color coding (≤10%=green, ≤20%=orange, >20%=red).

### [T276] Trade latency logging (order to fill time)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added latency_ms tracking to both regular trades and stop-loss exits. Prints latency to console, logs to trade file. Analysis script: analyze-trade-latency.py (shows min/avg/p50/p95/p99/max + distribution).

---

### [T277] External trade stats API (GitHub Gist or webhook)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: [T272]
- **Priority**: P3
- **Notes**: Push trade stats to GitHub Gist periodically for static site to fetch. Bypasses static export limitation.

### [T278] Cache historical BTC/ETH OHLC data locally
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Download and cache CoinGecko OHLC data daily. Reduces API calls and enables faster backtesting.

### [T279] Trade entry latency profiling
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add timing logs for each API call in autotrader (market fetch, order placement, etc). Identify bottlenecks.

### [T280] Calmar ratio calculation (return / max drawdown)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T275]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API calculates: total invested, trading period, annualized return, then Calmar = annualized return / max drawdown %. Dashboard shows card with color coding (≥3=excellent, ≥1=good). Grid now has 9 stat cards.

### [T281] Rolling 30-day win rate trend chart
- **Status**: TODO
- **Owner**: 
- **Depends**: [T202]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Sparkline or chart showing win rate trend over last 30 days. Helps identify strategy degradation early.

### [T282] Trade return distribution histogram on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Visualize return distribution (profit/loss per trade). Helps understand strategy characteristics (small wins vs big losses, etc).

---

### [T283] Sortino ratio calculation (downside risk adjusted)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T274]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Sortino = avg return / downside deviation (only penalizes negative returns). Dashboard card shows excellent (≥2), good (≥1), fair (>0). Grid now has 10 stat cards.

### [T284] Average trade duration tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Uses minutes_to_expiry field from trades, converts to hours. Dashboard shows "Avg Duration" card with labels: short-term (<1h), medium-term (1-4h), longer holds (>4h). Grid now has 11 stat cards.

### [T285] Trade correlation with BTC volatility
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze if win rate changes based on BTC hourly volatility at trade time. Create script to correlate trade outcomes with volatility levels.

### [T286] Kelly criterion effectiveness tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare actual bet sizes vs theoretical Kelly optimal. Track how Kelly fraction affects outcomes. Add kelly_fraction_used field to trade logs.

### [T287] Add streak tracking (consecutive wins/losses)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns longestWinStreak, longestLossStreak, currentStreak, currentStreakType. Dashboard shows 3 new cards: Current Streak (🔥/❄️), Best Streak (🏆), Worst Streak (💀). Grid now has 14 stat cards.

---

### [T288] Streak alert when hitting new records
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Functions: calculate_current_streaks(), check_streak_records(), write_streak_alert(). Tracks longest win/loss streaks in kalshi-streak-records.json. Alerts when new record ≥3 is set. Win records celebrated 🏆🔥, loss records warned 💀📉. Alert file: kalshi-streak-record.alert. Integrated into update_trade_results() flow.

### [T289] Consecutive loss circuit breaker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Auto-pauses after CIRCUIT_BREAKER_THRESHOLD consecutive losses (default 5, env configurable). Resumes automatically when a trade wins. Functions: get_consecutive_losses(), check_circuit_breaker(), write_circuit_breaker_alert(). Alert file: kalshi-circuit-breaker.alert. State: kalshi-circuit-breaker.json.

### [T290] Win rate by streak position analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze if win rate changes based on position in streak (e.g., do we perform worse after 3+ consecutive wins/losses?). Detect psychological patterns.

### [T291] Average return per trade on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added avgReturnCents to API (route.ts) + Avg Return card to /betting dashboard. Shows +/- per trade average.

### [T292] Timezone indicator on /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added timezone info section showing: Cron TZ (UTC), user TZ, UTC time, local time. Helps debug cron scheduling.

### [T293] Trade confidence tracking (edge vs outcome)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track calculated edge at entry vs actual outcome. Analyze if higher edge correlates with higher win rate. Add edge_at_entry to trade log if missing.

### [T294] Add latency stats to /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T276]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns avgLatencyMs, p95LatencyMs, minLatencyMs, maxLatencyMs, latencyTradeCount. Dashboard shows "Avg Latency" card with color coding (<500ms=green, <1s=orange, >1s=red). Shows "N/A" until latency data available in trade logs.

### [T295] Alert if avg latency exceeds 2 seconds
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T276]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Checks avg latency of last 10 trades. Alert file kalshi-latency.alert when >2s (configurable via LATENCY_THRESHOLD_MS). 1h cooldown. Added to HEARTBEAT.md pickup.

### [T296] Analyze edge vs win rate correlation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-edge-vs-winrate.py. Groups trades by edge bucket (0-10%, 10-15%, etc.), shows win rate per bucket, checks for positive correlation (higher edge → higher WR), compares expected vs actual WR. Awaiting v2 trade data.

### [T297] Reading time for /catalogo books (Gutenberg API integration)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T263]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend reading time feature to /catalogo. Fetch page counts from Gutenberg API metadata or estimate from file size (~250 words/page, 200 wpm).

### [T298] Book preview modal (first 3 pages)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "Preview" button to book cards. Modal shows first 3 pages via PDF.js or image snapshots. Helps users decide before download.

### [T299] Download analytics (track popular books)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track download events via simple counter (localStorage + periodic sync, or Cloudflare Analytics). Show "Most Downloaded" section on /libri.

---

### [T300] Momentum strength indicator on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added visual signal bars (like cell signal) next to momentum badge. 3 bars light up based on strength: weak (1), moderate (2), strong (3). Color matches signal direction. More intuitive than text labels.

### [T301] Alert when momentum aligns across all timeframes
- **Status**: TODO
- **Owner**: 
- **Depends**: [T259]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Super strong signal when 1h/4h/24h all agree. Telegram alert for high-conviction opportunities.

### [T302] Momentum reversion detection
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Detect extended momentum (>2% in 4h) that often precedes reversals. Alert as contrarian opportunity.

### [T303] Momentum divergence alert (price vs momentum)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when price makes new high/low but momentum composite doesn't confirm (divergence). Classic reversal signal. Integrate into autotrader decision logic.

### [T304] Trading dashboard mobile responsiveness audit
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed! Added responsive breakpoints (sm/md/lg/xl) for stat cards grid, header, and text sizes. Reduced padding on mobile, added truncate for text overflow, smaller icons/labels on small screens.

### [T305] Autotrader dry-run mode for strategy testing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! DRY_RUN=true env flag logs trades to kalshi-trades-dryrun.jsonl without executing. Shows 🧪 indicator in console. Useful for backtesting new strategies without risking capital.

---

### [T306] Analyze dry-run trades vs actual outcomes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T305]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-dryrun-trades.py. Parses KXBTCD/KXETHD tickers, fetches settlement prices from CoinGecko, calculates win rate + theoretical PnL. Caches results. Use: `python3 scripts/analyze-dryrun-trades.py --days 7`

### [T307] Position sizing comparison (fixed vs Kelly)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analysis script comparing actual Kelly-based position sizing vs fixed-size betting. Calculate which would have better risk-adjusted returns on historical data.

### [T308] API rate limit monitoring
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track Kalshi/CoinGecko API call counts per hour. Alert if approaching rate limits. Add headers logging for remaining quota.

---

### [T309] Add PWA manifest for mobile install
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created manifest.json with app metadata, theme colors, SVG icons, and shortcuts (Trading Terminal, Moonlight House). Added PWA meta tags to layout.tsx. Users can now "Add to Home Screen" on mobile.

### [T310] Keyboard shortcuts for trading dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Shortcuts: R (refresh), / (focus input), ? (show shortcuts help), K (open Kalshi), H (toggle help), Esc (close modal). Modal with kbd styling. Footer hint. Help button in header.

### [T311] Stat cards collapse/expand on mobile
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T304]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Mobile shows first 6 stats by default. "More/Less" button in header expands all 15 cards. Keyboard shortcut 'E' toggles expand. CSS selector `max-md:[&>*:nth-child(n+7)]:hidden` hides cards 7+ on mobile.

### [T312] Service worker for offline PWA caching
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T309]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created sw.js with 3 caching strategies: 1) Cache-first for static assets, 2) Network-first for API routes with cache fallback, 3) Network-first for HTML with offline support. Precaches /, /betting, /house. ServiceWorkerRegistration component auto-registers and handles updates. API responses cached for 60s TTL.

### [T313] Export trading stats to Google Sheets
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to push daily trading stats to Google Sheets for historical tracking and charting. Use Google Sheets API with service account.

### [T314] Voice TTS alerts for significant trading events
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Use ElevenLabs/TTS to announce major events: circuit breaker triggered, big win/loss, regime change. Optional Telegram voice message delivery.

### [T315] Light/dark mode toggle for trading dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! ThemeToggle component with animated sun/moon icons in header. Keyboard shortcut 'T' on /betting. Light mode CSS already existed. Persists to localStorage via ThemeProvider.

### [T316] Touch gestures for mobile dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add swipe gestures: pull-to-refresh, swipe down on modal to close. Use @use-gesture/react or native touch events.

### [T317] Position size display in Kalshi positions list
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show contract count and cost basis per position. Calculate unrealized PnL based on current market price vs entry price.

### [T318] Offline indicator UI for PWA
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created OfflineIndicator component. Shows orange banner when offline ("showing cached data"), green toast when reconnected (auto-hides 3s). Uses navigator.onLine + online/offline events. Animated with Tailwind.

### [T319] SW cache version bump script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created scripts/bump-sw-version.sh. Auto-increments cache version (v1→v2) or accepts custom version. Updates CACHE_NAME, STATIC_CACHE, API_CACHE. Run before deploy to force fresh caches.

### [T320] Background sync for trading dashboard refresh
- **Status**: TODO
- **Owner**: 
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Use Background Sync API to queue data fetches when offline. Auto-refresh trading stats when connection restored.

### [T321] Precache additional routes in service worker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added /corde, /pr, /robots.txt to PRECACHE_ASSETS. Added /api/health/cron to API_ROUTES. Better offline coverage for all main pages.

### [T322] Cache invalidation on API error recovery
- **Status**: TODO
- **Owner**: 
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When API returns error but cache has valid data, show cached + indicate staleness. Add "last updated: Xm ago" to dashboard.

### [T323] Network status in /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T318]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Shows: 1) Online/offline status with Network Information API details (effectiveType, downlink, RTT), 2) Service Worker status (active/installing/waiting/none) with cache version, 3) Cache Storage usage bar with percentage. Auto-refreshes every 30s, responds to online/offline events.

### [T324] Performance metrics on /health page (Core Web Vitals)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Uses web-vitals library. Shows CLS, FCP, INP, LCP, TTFB with color-coded ratings (good/needs-improvement/poor) per Google's thresholds. Grid layout, auto-updates as metrics become available.

### [T325] Browser storage breakdown (cookies, localStorage, sessionStorage)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T323]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend /health network section to show breakdown of browser storage usage by type.

### [T326] SW update button when waiting version available
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T323]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! When swStatus is 'waiting', shows "🔄 Update Now" button. Triggers postMessage({type:'SKIP_WAITING'}) to activate new SW. Added message handler to sw.js. Button shows loading state, auto-reloads page on update.

### [T327] Latency threshold alert (>2s avg)
- **Status**: DONE (duplicate of T295)
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T294]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented in T295. Alert file kalshi-latency.alert when avg >2s. Heartbeat pickup enabled.

### [T328] Latency trend chart on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T294]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Sparkline showing latency trend over last 24h/7d. Requires storing historical latency data per trade.

### [T329] Trade execution success rate tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track ratio of successful order placements vs rejections/failures. Add rejectionCount, retryCount to API response. Alert if success rate drops below 95%.

### [T330] API call count monitoring per hour
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track Kalshi/CoinGecko API calls per hour. Log to api-calls.jsonl. Alert if approaching rate limits. Helps debug 429 errors.

### [T331] Trade prediction accuracy logging for ML
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Log predicted probability + actual outcome for each trade. Creates training data for future ML model improvements. Fields: predicted_prob, actual_outcome, edge_at_entry, features.

### [T332] VIX correlation with crypto volatility
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Fetch VIX from Yahoo Finance. Correlate with BTC/ETH hourly vol. Macro fear indicator may improve regime detection.

### [T333] Real-time trade ticker on /betting
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Live feed showing recent trades as they happen. WebSocket or polling every 10s. Shows ticker, side, price, result.

### [T334] Book category filtering on /catalogo
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add dropdown/pills to filter books by category (classici, fiabe, favole, romanzi, etc). Persists in URL params.

### [T335] WCAG accessibility audit
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run axe-core or Lighthouse accessibility audit on all main pages. Fix any violations (color contrast, alt text, aria labels).

---

### [T336] System theme preference detection (prefers-color-scheme)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T315]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! ThemeProvider now detects OS `prefers-color-scheme`. Theme cycles: dark → light → system. System mode auto-follows OS preference with real-time listener. Monitor icon for system mode. First-visit defaults to system.

### [T337] Smooth theme transition animations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T315]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Body has 0.3s ease transition for background and color. Theme toggle icons already had animations. Smooth fade between dark/light/system modes.

### [T338] Theme-aware chart colors for trading graphs
- **Status**: TODO
- **Owner**: 
- **Depends**: [T315], [T328]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When implementing latency/trend charts, ensure colors adapt properly to light/dark mode for readability.

### [T339] Add link to /trading/history from /betting dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "View All Trades" button/link in Recent Trades section of /betting that navigates to /trading/history.

### [T340] Date range picker for trade history
- **Status**: TODO
- **Owner**: 
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add from/to date picker to /trading/history filters. Uses ?from=YYYY-MM-DD&to=YYYY-MM-DD params already supported by API.

### [T341] Keyboard navigation for trade history table
- **Status**: TODO
- **Owner**: 
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add j/k for row navigation, Enter to expand trade details, arrow keys for pagination.

### [T342] Trading history API caching
- **Status**: TODO
- **Owner**: 
- **Depends**: [T260]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Apply same file-based caching pattern from T260 to /api/trading/history. 60s TTL + source mtime validation.

### [T343] Cache invalidation endpoint for trading APIs
- **Status**: TODO
- **Owner**: 
- **Depends**: [T260]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add POST /api/trading/cache/invalidate endpoint to force refresh stats without waiting for TTL. Useful after manual trades.

### [T344] Trading stats for v2 autotrader file
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added ?source=v2 param. Reads from kalshi-trades-v2.jsonl (v1 default). Separate cache files per source. Returns source in response.

### [T345] Dashboard toggle for v1/v2 stats
- **Status**: TODO
- **Owner**: 
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add toggle on /betting dashboard to switch between v1 and v2 trading stats. Uses ?source param from T344.

### [T346] Combined v1+v2 trading stats view
- **Status**: TODO
- **Owner**: 
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add ?source=all option to merge v1+v2 trades for overall performance view. Useful for seeing total portfolio performance.

### [T347] V2 trades settlement tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Updated! Now processes both v1 and v2 files by default. Separate settlements JSON per source. CLI flags: --v1, --v2, --stats (shows both).

### [T348] Settlement cron job for v2 trades
- **Status**: TODO
- **Owner**: 
- **Depends**: [T347]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Verify cron job calls settlement tracker correctly for v2. May need update to crontab entry.

### [T349] Unified settlements dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T347]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add API endpoint /api/trading/settlements that combines v1+v2 settlement stats. Show on dashboard.

### [T350] V2 win rate comparison chart
- **Status**: TODO
- **Owner**: 
- **Depends**: [T344], [T347]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Side-by-side win rate chart comparing v1 (broken model) vs v2 (Black-Scholes) performance on /betting dashboard.

### [T351] Real sprite images for Luna moods
- **Status**: TODO
- **Owner**: 
- **Depends**: [T050]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Upgrade CSS-based mood effects to actual sprite images. 6 states: luna-happy.png, luna-neutral.png, luna-sad.png, luna-sleepy.png, luna-hungry.png, luna-excited.png. Use AI image generation or commission artist.

### [T352] Luna idle animations per room
- **Status**: TODO
- **Owner**: 
- **Depends**: [T050]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Room-specific idle animations: bedroom (yawn), kitchen (look at food), garden (look at flowers), living (watch TV), etc. Make Luna feel more alive.

### [T353] Save game state to localStorage
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! SaveData interface stores stats, achievements, gameState (with roomsVisited as array for JSON). loadSaveData() on mount initializes state. saveSaveData() in useEffect auto-saves on any change. Progress persists across browser refreshes.

### [T354] Verify settlement prices match Kalshi official
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare CoinGecko settlement prices with Kalshi's official settlement prices (from order history). Script to validate our settlement tracker accuracy.

### [T355] Paper balance tracking in dry-run mode
- **Status**: TODO
- **Owner**: 
- **Depends**: [T305]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track virtual balance in kalshi-dryrun-balance.json. Start with $100, update on each dry-run trade settlement. Shows cumulative PnL over time.

### [T356] Strategy parameter sweep (MIN_EDGE optimization)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T306]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run multiple dry-run instances with different MIN_EDGE values (5%, 8%, 10%, 12%, 15%). Compare win rates to find optimal threshold. Output: data/backtests/edge-sweep.json

### [T357] Add streak stats to daily summary report
- **Status**: TODO
- **Owner**: 
- **Depends**: [T288], [T085]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Include current streak, best win streak, worst loss streak in kalshi-daily-summary.py. Adds context to daily performance.

### [T358] Analyze win rate by day of week
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: analyze-trades-by-weekday.py. Check if certain days of week have better/worse performance. Market patterns may differ on weekends.

### [T359] Add streak visualization to /betting dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T287], [T288]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Visual streak indicator showing recent trade outcomes (🟢🟢🟢🔴🟢 pattern). Click to see full history timeline.

---

*Ultimo aggiornamento: 2026-01-30 heartbeat*
*Sistema coordinamento: vedi TASK-RULES.md*
