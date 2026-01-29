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

## 🚨 URGENTE - DA MATTIA 2026-01-28

### [T090] Creare REGOLE-AGENTI.md
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Creato! 3 regole: Git (pull/push), Procedure (segui docs), Task extraction (estrai da conversazioni).

### [T091] Creare agente PM per review task
- **Status**: DUPLICATE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T090]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ⚠️ DUPLICATE di T402 (già completato 2026-01-28). PM Review già eseguita.

### [T400] Rollback onde.surf a PRIMA di Google Auth
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T401]
- **Priority**: P0
- **Notes**: ✅ Rimosso auth(), sito ora pubblico. Deploy OK via Wrangler.

### [T401] Migrare onde.surf a stesso approccio di onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T400]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Middleware semplificato (no auth redirect), tutto pubblico come onde.la.

### [T402] Creare agente PM per review task/dipendenze/priorità
- **Status**: DONE
- **Owner**: @pm-agent
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ PM Review completata! Report: memory/pm-review-2026-01-28.md. Analizzati 377 task, verificate dipendenze, identificati 2 blocked, 3 duplicati gestiti, 3 priorità da rivedere.

### [T403] Creare procedura ROLLBACK per deploy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Aggiunta sezione ROLLBACK a DEPLOY-PROCEDURES.md. 3 metodi: CF Dashboard, Git Revert, Wrangler.

### [T404] Fix onde.surf still redirecting to /login
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T351]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Regression fix! T351 fixed middleware but page.tsx still had auth() check. Removed auth import and session check from page.tsx. Now truly public. curl -sI https://onde.surf returns HTTP 200.

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

### [T015] Pipeline revisione 2 cicli (Capussela EN→IT)
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: [T012]
- **Blocks**: -
- **Priority**: P1
- **Notes**: 2 cicli RILETTTORE→REVISORE con llama3:70b locale. Script: scripts/translation-pipeline.py. ⛔ MAI TOKEN CLAUDE

---

## 📋 TODO - LIBRI (TIER 1)

### [T020] Frankenstein illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Da ROADMAP TIER 1. Libro pubblico dominio. Cerco testo + genero illustrazioni.

### [T021] Meditations illustrato EN
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: già pubblicato
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ GIÀ PUBBLICATO! Ondinho ha duplicato per errore - verificare sempre prima di iniziare.

### [T022] The Prophet illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Kahlil Gibran - pubblico dominio (1923). Setup + prompts.

### [T023] AIKO EN su KDP
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Pubblicare su Amazon

### [T024] Psalm 23 multilingua su KDP
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Versione multilingue. Checklist: books/salmo-23-kdp/KDP-CHECKLIST.md. SEGUENDO PROCEDURA.

### [T025] The Art of War illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Sun Tzu - pubblico dominio. Stile: Chinese ink wash + dramatic warfare

### [T026] Tao Te Ching illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Lao Tzu - pubblico dominio. Stile: Minimalist Chinese calligraphy + nature

### [T027] Divine Comedy illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Dante - pubblico dominio. Stile: Gustave Doré inspired, epic gothic

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ GA4 code added to layout.tsx! Set NEXT_PUBLIC_GA_ID env var with measurement ID (G-XXXXXXX) to activate. Gets from Google Analytics console.

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
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script `scripts/analyze-trade-duplicates.py` creato. 41 trades → 21 unique combos → 11 duplicati. Raccomandazione: KEEP SEPARATE (mostra frequenza trading). Script può generare summaries se serve.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Now uses real OHLC data! Extended /api/momentum to return priceHistory (last 24h close prices). BTC/ETH sparklines now show actual price trend with fallback to mock data.
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
- **Status**: OBSOLETE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: -
- **Notes**: ✅ OBSOLETE: Migrato a Wrangler diretto. GitHub Actions non più necessario per deploy. Procedura permanente: `npm run build && npm run build:cf && wrangler pages deploy`.

---

## 🚨 PRIORITÀ MASSIMA - DEPLOY GRATIS

### [T350] Deploy GRATIS per tutti i siti FRH
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T351], [T352]
- **Priority**: P0
- **Notes**: ✅ Solved! Both sites deploy free via Cloudflare Pages + Wrangler. onde.la uses deploy-onde-la-prod.sh. onde.surf uses wrangler pages deploy. No GH Actions needed.

### [T351] Fix onde.surf BROKEN dopo deploy sbagliato
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ FIXED (2 rounds)! Round 1 (Jan 28): basic wrangler redeploy. Round 2 (Jan 29): Fixed ThemeToggleMinimal export missing (caused global 500), simplified middleware (removed auth() wrapper), added login/layout.tsx with edge runtime. Deploy via Wrangler direct (GH Actions blocked for billing).

### [T352] Rimuovere "made with love" da onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Removed "made with love" from hero, removed "Powered by Vercel" from footer. Cleaner branding.

### [T353] Sistemare onde.la mezzo italiano mezzo inglese
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Fixed /catalogo page to use i18n system. Added catalog translations to en.json and it.json. Now respects user language preference via localStorage/browser detection.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! WinRateTrendChart component (SVG-based, no external libs). Shows 30-day rolling average with tooltips, gradient fill, trend color. Uses mock data for now (edge runtime can't read local files).

### [T203] Trade filtering by date range
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API: period (today/week/month) + custom from/to params. UI: period selector buttons (All/Today/7D/30D) + custom calendar icon. Includes dateRange and filteredFromTotal in response.

---

### [T208] Test playwright integration in deploy verification
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T205]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created deploy-verification.spec.ts with 17 tests covering: homepage, navigation, critical pages, performance, assets, accessibility. Updated test-website-before-deploy.sh to use Node.js Playwright (preferred) → Python Playwright → curl fallback. Added npm scripts: test:playwright, test:playwright:ui, test:deploy.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created lighthouserc.js config + scripts/lighthouse-audit.sh. Thresholds: perf≥80%, a11y≥90%. npm scripts: `npm run lighthouse` (full) and `npm run lighthouse:quick` (curl-based). Core Web Vitals assertions: LCP≤2.5s, CLS≤0.1, TBT≤300ms.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Functions: calculate_realized_volatility(), get_volatility_advantage(). Compares 24h realized vol vs assumed hourly vol for BTC/ETH. When realized/assumed ratio >1.15 favors YES bets (+bonus), <0.85 favors NO bets (+bonus). Max ±2% edge bonus. Logs vol_ratio, vol_aligned, vol_bonus in trade data. Shows preferred_asset when one has 10%+ higher ratio.

### [T228] Add error boundary to ClientLayout
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created ErrorBoundary.tsx with "Try Again" + "Go Home" buttons. Shows error details in dev mode. Wraps children in ClientLayout.

### [T229] Add hreflang tags for multilingual pages
- **Status**: BLOCKED
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⏸️ Blocked: Site doesn't have separate language URLs (/en/, /it/) yet. hreflang requires actual alternate versions. Needs multilingual routing implementation first.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: extract-implied-vol.py. Uses log-normal model to back-solve IV from market prices. Compares to 24h realized vol. Shows SELL_YES (IV>RV, overpriced) and BUY_YES (IV<RV, underpriced) signals. Output: data/trading/implied-vol-analysis.json. Finding: Near-ATM strikes show very high IV ratios.

### [T245] Filter extreme prices (≤5¢ or ≥95¢) from opportunities
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed "Bet too small" bug. Was selecting 100¢ NO contracts with no profit potential. Now skips prices ≤5¢ or ≥95¢ (bad risk/reward).

### [T246] Multi-exchange price feeds (Binance + CoinGecko + Coinbase)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! get_crypto_prices() now fetches from 3 sources (Binance, CoinGecko, Coinbase). Uses median price for robustness. Logs source count and warns on >0.5% price spread. Separate functions: get_prices_binance(), get_prices_coingecko(), get_prices_coinbase().

### [T247] Daily stop-loss stats summary in report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T239], [T085]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Daily summary (kalshi-daily-summary.py) shows: count triggered, total loss at exit, avg loss %. Weekly report (kalshi-weekly-report.py) includes: total stop-losses, loss breakdown, daily details if multiple days.

### [T248] Position sizing analysis (Kelly effectiveness tracking)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-kelly-effectiveness.py. Analyzes: actual vs theoretical Kelly, win rate by position size bucket, bankroll simulation under different Kelly fractions. Generates recommendations. V1 data shows 0% WR (broken model), v2 awaiting trades.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! 24h price trend sparkline on each momentum card. Shows priceHistory from /api/momentum. Includes % change label and color-coded chart (green/orange/cyan based on signal).

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: backtest-regime-detection.py. Uses cached OHLC (90 days). Analyzes: regime distribution, prediction accuracy (4h ahead), transitions. Findings: BTC/ETH mostly sideways (75-86%), sideways most accurate (83-90%), trend regimes show continuation. Results: data/trading/regime-backtest-{btc,eth}.json

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Enhanced both RSS and Atom feeds! Added category-specific descriptions, reading time estimates (pages + hours), and richer HTML content in Atom. 14 category descriptions defined.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T272]
- **Priority**: P3
- **Notes**: ✅ Done! Script: push-stats-to-gist.py. Gist: 43b0815cc640bba8ac799ecb27434579. Raw URL: https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json. Cron: hourly at :45. Static site can fetch this for real stats.

### [T278] Cache historical BTC/ETH OHLC data locally
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: cache-ohlc-data.py. Fetches 90 days OHLC from CoinGecko for BTC+ETH. Saves to data/ohlc/. Cron: 00:30 UTC daily. 180 candles per asset, JSON format with ISO timestamps.

### [T279] Trade entry latency profiling
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Comprehensive latency profiling added! 1) API_LATENCY_LOG tracks all API calls, 2) record_api_latency() records per-endpoint timing, 3) calculate_latency_stats() computes min/avg/p50/p95/p99/max, 4) print_latency_summary() shows formatted report, 5) identify_bottlenecks() detects slow endpoints, 6) External APIs tracked: Binance, CoinGecko, Coinbase, Fear&Greed, OHLC, 7) Profile saved to kalshi-latency-profile.json every 30min, 8) Analysis script: analyze-api-latency.py with detailed reporting.

### [T280] Calmar ratio calculation (return / max drawdown)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T275]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API calculates: total invested, trading period, annualized return, then Calmar = annualized return / max drawdown %. Dashboard shows card with color coding (≥3=excellent, ≥1=good). Grid now has 9 stat cards.

### [T281] Rolling 30-day win rate trend chart
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T202]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! API: /api/trading/trend returns 30-day rolling stats. Script: compute-winrate-trend.py calculates from real trades. Dashboard now shows real data with trend indicator (improving/declining/stable) and overall avg. Falls back to mock if API unavailable.

### [T282] Trade return distribution histogram on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created ReturnDistributionChart.tsx component! SVG-based histogram showing PnL distribution in buckets (<-$10, -$10 to -$5, ..., >$10). Shows avg/median return, max win/loss, color-coded bars (green=wins, red=losses). Integrated into /betting dashboard after Win Rate Trend. Falls back to simulated data when <5 real trades available.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-volatility-correlation.py. Buckets trades by hourly volatility (very_low/<0.3%, low/0.3-0.5%, medium/0.5-1%, high/1-2%, very_high/>2%). Uses cached OHLC data. V1 trades: all 41 in medium-high vol periods with 0% WR (broken model). V2 will show real correlation. Saves to data/trading/volatility-correlation.json.

### [T286] Kelly criterion effectiveness tracking
- **Status**: DUPLICATE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⚠️ DUPLICATE of T248. Script analyze-kelly-effectiveness.py already covers this: theoretical vs actual Kelly, position size buckets, bankroll simulation.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-streak-position.py. Analyzes win rate by preceding context (after N wins/losses) and streak continuation probability. Detects hot hand, tilt risk, mean reversion patterns. Usage: `python3 scripts/analyze-streak-position.py [--v2] [--min-trades N]`

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

### [T293] Volatility-adjusted position sizing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T285]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Kelly fraction now adjusts based on: 1) Regime (choppy=0.5x, sideways=0.75x, trending=1.1x), 2) Volatility alignment (aligned=1.15x, high-not-aligned=0.8x). Added volatility field to opportunity data. Prints size adjustment when not 1.0x.

### [T294] Alert on extreme volatility entry
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T285]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Volatility now classified into 5 buckets (very_low/low/normal/high/very_high). When trade placed during very_high vol (>2% hourly range), writes kalshi-extreme-vol.alert with full trade details. 1h cooldown. Added to HEARTBEAT.md pickup.

### [T295] Weekend vs weekday performance analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-weekend-weekday.py. Analyzes by day of week, compares weekend vs weekday win rate/PnL/ROI. Shows day-by-day breakdown + actionable insights. Saves to data/trading/weekend-weekday-analysis.json. V1 data skewed (all Wed). V2 awaiting trades.

---

## 🔥 REGOLE SISTEMA - DA MATTIA 2026-01-28 22:35 PST

### [T405] Aggiornare AGENTS.md con REGOLA UNO (Procedure)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T406], [T407]
- **Priority**: P0
- **Notes**: ✅ Implementato via REGOLE-AGENTI.md + riferimento in AGENTS.md. REGOLA 1: Fai SEMPRE tutto usando procedure esistenti.

### [T406] Aggiornare AGENTS.md con REGOLA DUE (Estrai Task)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T405]
- **Blocks**: [T407]
- **Priority**: P0
- **Notes**: ✅ Implementato via REGOLE-AGENTI.md + riferimento in AGENTS.md. REGOLA 2: Estrai task da ogni messaggio!

### [T407] Propagare REGOLA UNO e DUE a Ondinho
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T405], [T406]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Regole già nel workspace condiviso! REGOLE-AGENTI.md + AGENTS.md sono letti da tutti gli agenti che lavorano in /Users/mattia/Projects/Onde.

### [T293] Trade confidence tracking (edge vs outcome)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-edge-effectiveness.py. Analyzes: 1) Win rate by edge bucket, 2) Edge-outcome correlation coefficient, 3) Model calibration (predicted vs actual WR). Shows if higher edge → higher win rate. V1 data shows 0% WR with 0.4% edge (broken model). Usage: `python3 scripts/analyze-edge-effectiveness.py [--v2] [--buckets N]`

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

---

## 📋 TODO - VIRTUAL OFFICE (Free River House 2.0)

> **Vision Doc:** docs/VIRTUAL-OFFICE-VISION.md
> **Goal:** Ufficio virtuale 2D → VR con agenti AI reali (Clawdinho, Onde-bot)

### [T500] Registrare Clawdinho come agent nel DB
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T502], [T503]
- **Priority**: P1
- **Notes**: ✅ Clawdinho registrato! type=orchestrator, room=office, color=#00D4FF

### [T501] Registrare Onde-bot come agent nel DB
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T502], [T503]
- **Priority**: P1
- **Notes**: ✅ Onde-bot (ex Ondinho) registrato! type=creative, room=lounge, color=#FF6B35

### [T502] Creare avatar Clawdinho (surfer emoji style)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created SVG avatar at /public/house/agents/clawdinho.svg. Robot surfista style con visor animato, antenna pulsante, surfboard giallo, colore cyan (#00D4FF). Animazioni CSS per glow effect.

### [T503] Creare avatar Onde-bot (wave emoji style)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T501]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created SVG avatar at /public/house/agents/onde-bot.svg. Wave character con faccia friendly, cresta onda animata, corpo acqua gradient, colore arancione (#FF6B35). Animazioni CSS per movimento onda.

### [T504] Connettere status Clawdinho a Clawdbot sessions reali
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script agent-heartbeat.sh + cron */5. Checks LaunchAgent status, sends heartbeat to /api/sync. FreeRiverHouse shows "online" if last_seen < 5min. ⚠️ Funziona quando migration 0005 è applicata (aggiunge Clawdinho a DB).

### [T505] Activity log live per ogni agente
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500], [T501]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added Activity tab to FreeRiverHouse panel! 3 modes now: Tasks/Chat/Activity. Fetches from /api/activity, filters by agent name. Shows type-colored dots (deploy=green, image=purple, etc). Auto-refresh 30s.

### [T506] Voice input per assegnare task
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Whisper local → testo → create task. Bottone microfono nell'input

### [T507] TTS per risposte agenti
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ElevenLabs/sag per voce. Toggle "Read aloud" per chat responses

### [T508] Notifiche browser quando task completato
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added! Notification bell toggle in FreeRiverHouse header. Click to request permission (shows toast feedback). When enabled: receives browser notification on task completion with agent name and task description. Uses Web Notifications API, auto-closes after 5s.

### [T509] XP e livelli per agenti (gamification)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: +10 XP per task done. Level up ogni 100 XP. Badge per achievements

### [T510] Mood indicator basato su workload
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Agente "stressed" se >5 task pending, "happy" se alta win rate, "sleepy" se idle >1h

### [T511] WebXR export per futuro VR
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P4
- **Notes**: Three.js/R3F scene con stanze 3D. Beach office o futuristic HQ. Bender AI per generare ambienti

### [T512] Deploy Free River House su onde.surf/house
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500], [T501], [T502], [T503]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Deployed! Onde-bot (ex Ondinho) visible in house. Both onde.surf and /house return HTTP 200.

### [T513] Setup Cloudflare D1 per Virtual Office persistenza
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T504], [T505]
- **Priority**: P1
- **Notes**: ✅ D1 già configurato! DB: onde-surf-db. Schema includes: agents, agent_tasks, books, posts, users. Migration 0005 creata per aggiungere Clawdinho/Onde-bot. ⚠️ Token API non ha D1:import - applicare migration via CF Dashboard o con token aggiornato.

### [T296] Analyze edge vs win rate correlation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-edge-vs-winrate.py. Groups trades by edge bucket (0-10%, 10-15%, etc.), shows win rate per bucket, checks for positive correlation (higher edge → higher WR), compares expected vs actual WR. Awaiting v2 trade data.

### [T297] Reading time for /catalogo books (Gutenberg API integration)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T263]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Category-based reading estimates (200 wpm, ~250 words/page). Added categoryReadingEstimates map + getBookReadingEstimate() helper to books.ts. Updated /catalogo cards to show pages + reading time with icons.

### [T298] Book preview modal (first 3 pages)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "Preview" button to book cards. Modal shows first 3 pages via PDF.js or image snapshots. Helps users decide before download.

### [T299] Download analytics (track popular books)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created useDownloadTracker hook: tracks downloads in localStorage, counts per book + format (PDF/EPUB), sends beacon to analytics endpoint. Updated /libri page: shows download count per book, total downloads counter in hero, "Be the first to download!" for new books.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T259]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Checks alignment + minimum composite strength (0.5). When all timeframes agree with strong signal, writes kalshi-momentum-aligned.alert with details per asset. 2h cooldown (rare event). Added to HEARTBEAT.md pickup.

### [T302] Momentum reversion detection
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Functions: detect_momentum_reversion(), check_reversion_alert(), write_reversion_alert(), get_reversion_edge_adjustment(). Triggers when 4h move >2% or 8h move >3% with strong momentum (>0.7). Alert file: kalshi-momentum-reversion.alert. Provides contrarian trading signals with confidence levels. Added to HEARTBEAT.md pickup.

### [T303] Momentum divergence alert (price vs momentum)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Functions: calculate_rsi(), detect_momentum_divergence(), check_divergence_alert(), write_divergence_alert(), get_divergence_edge_adjustment(). Detects bullish (price lower low + RSI higher low) and bearish (price higher high + RSI lower high) divergences. Alert file: kalshi-momentum-divergence.alert. 1h cooldown. Confidence levels (medium/high/very_high) based on divergence strength. Edge bonus for trades aligned with divergence signal. Added to HEARTBEAT.md pickup.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-position-sizing.py. Simulates Full/Half/Quarter Kelly + Fixed $1/2/5. Calculates: return %, max drawdown, Sharpe ratio, avg bet size. V1 data shows 0% WR killed all aggressive strategies. Recommendation: smaller sizing beats Kelly when edge is uncertain. Results: data/trading/position-sizing-comparison.json

### [T308] API rate limit monitoring
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Tracks calls per hour for Kalshi, CoinGecko, Binance, Coinbase, Fear&Greed. Extracts rate limit headers from responses. Alerts at 80% threshold via kalshi-rate-limit.alert. Logs to kalshi-api-rate-log.jsonl every 30min. Analysis script: analyze-api-rate-limits.py. Console shows rate limit summary with 🟢🟡🔴 indicators.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Enhanced position cards! Now shows: 1) Asset type indicator (BTC/ETH), 2) YES/NO side (clearer than LONG/SHORT), 3) Contracts count with per-contract cost in cents, 4) PnL if available, 5) Max win potential calculation. Better visual hierarchy with grouped info.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T323]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Browser Storage section to /health page. Shows localStorage, sessionStorage, cookies with size (formatted bytes) and item count. StorageCard component with emoji icons.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added EXECUTION_LOG_FILE + log_execution() function to autotrader-v2. Logs all order attempts (success/error/pending) with latency, ticker, side, count, status. Script: analyze-execution-rate.py analyzes success rate, latency stats, by-asset breakdown. Tracks both regular trades and stop-loss executions.

### [T330] API call count monitoring per hour
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: track-api-calls.py. Logs to api-calls.jsonl, shows current hour stats + 24h summary. Rate limit warnings. Flags: --status, --summary, --reset, --log. JSON output to data/trading/api-call-stats.json.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Quick-filter pills for top 8 categories with counts, URL persistence for all filters (category, lang, search, sort), active filter indicator with clear button, Suspense fallback, dark mode support.

### [T335] WCAG accessibility audit
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed! Lighthouse a11y audit 89%→100%: Added aria-label/aria-expanded to mobile menu button, fixed heading hierarchy (h4→h2 in footer), added aria-labels to social links, added aria-hidden to decorative icons.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "View All Trades" link with arrow icon below Recent Trades grid. Links to /trading/history. Styled consistently with glass design.

### [T340] Date range picker for trade history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added From/To date pickers to /trading/history filters. Uses native date inputs. Auto-resets to page 1 when dates change. Clear button resets dates too. Styled consistent with existing filters.

### [T341] Keyboard navigation for trade history table
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added vim-style navigation! j/k for rows, g/G first/last, h/l or arrows for pages, r refresh, f filters, ? help modal. Click to select rows, Esc to clear. Blue highlight ring for selected row.

### [T342] Trading history API caching
- **Status**: N/A
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T260]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⏭️ N/A: /api/trading/history runs on Edge runtime (Cloudflare), cannot access local files. Returns mock data on production. Caching not applicable for edge deployment.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added toggle button group in Trading Performance header. v1/v2 buttons with visual active state. Defaults to v2. Triggers refetch when changed. Styled consistent with existing UI.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T347]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Verified! Cron runs every hour. Script already processes both v1 and v2 files by default (T347). V2 file will be auto-processed when first v2 trades are made.

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
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T305]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: kalshi-dryrun-balance.py. Tracks virtual $100 balance for dry-run trades. Uses CoinGecko for settlement prices. Flags: --reset (restart), --status (show balance). State: kalshi-dryrun-balance.json. Shows win rate, PnL, pending trades.

### [T356] Strategy parameter sweep (MIN_EDGE optimization)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T306]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run multiple dry-run instances with different MIN_EDGE values (5%, 8%, 10%, 12%, 15%). Compare win rates to find optimal threshold. Output: data/backtests/edge-sweep.json

### [T357] Add streak stats to daily summary report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T288], [T085]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added streak section to daily summary! Shows: current streak (🔥 wins / ❄️ losses), best win streak 🏆, worst loss streak 💀. Added calculate_streaks() function to daily summary script. Prefers v2 trade log.

### [T358] Analyze win rate by day of week
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-trades-by-weekday.py. Shows per-day stats (trades, W/L, win rate, PnL, ROI). Includes weekend vs weekday comparison and insights. Usage: `python3 scripts/analyze-trades-by-weekday.py [--v2]`

### [T359] Add streak visualization to /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T287], [T288]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "Trade History Pattern" section with colored dots (green=won, red=lost, gray=pending). Shows last 10 trades. Dots have glow effect and hover tooltip with trade details. Responsive sizing.

### [T360] Quick date filter presets for trade history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T340]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Preset buttons (All, Today, 7D, 30D) in filter bar. Auto-detects active preset, highlights with blue. Separated by border from other filters. Clicking sets from/to dates automatically.

### [T361] Daily PnL summary in trade history header
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T340]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added summary bar to /trading/history with: total PnL (color-coded), trades breakdown (W/L/P), win rate %, date range display. Shows pagination note when viewing partial results. Uses useMemo for efficient calculation.

### [T362] JSON export option for trade history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! FileJson icon button next to CSV export. Exports full trade data with metadata (timestamp, filters, all fields including regime/reason). Formatted JSON with indent.

### [T363] Date range display in trading stats header
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T203]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Shows active date filter in cyan under "Trading Performance" title. Formats: "Today", "Last 7 days", "Last 30 days", or custom "Jan 20 → Jan 27". Only shows when filter is not "All time".

### [T364] Date range comparison mode (vs previous period)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T203]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare stats with previous period. E.g., "This week vs last week" showing +/-% change for win rate, PnL, trades.

### [T365] URL sync for trading stats filters
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T203]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Filters sync to URL (?source=v1&period=week&from=...&to=...). Loads from URL on mount. Uses router.replace for history-friendly updates. Defaults omitted from URL.

### [T366] Stop-loss effectiveness over time dashboard widget
- **Status**: TODO
- **Owner**: 
- **Depends**: [T247], [T240]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add widget to /betting showing stop-loss performance: total triggered, cumulative savings vs holding, win rate of positions that would have hit stop-loss. Visualizes whether stop-loss threshold is optimal.

### [T367] Circuit breaker cooldown configuration via env
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T289]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! CIRCUIT_BREAKER_COOLDOWN_HOURS env var (default 4h). Circuit breaker now resumes after EITHER a win OR cooldown elapsed. Shows remaining hours in status message. Alert includes cooldown info.

### [T368] Trade edge confidence buckets on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T296]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show pie/bar chart of trades by edge bucket (0-5%, 5-10%, 10-15%, 15%+). Color code by win rate per bucket. Helps visualize edge distribution and optimal thresholds.

### [T369] Analyze trades by volatility bucket
- **Status**: DUPLICATE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⚠️ DUPLICATE of T285 (analyze-volatility-correlation.py). Already buckets trades by hourly volatility (very_low to very_high) and compares win rates.

### [T370] Memory files age warning in heartbeat
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-memory-age.sh. Checks MEMORY.md, memory/*.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md for >7 days old. 24h cooldown. Alert file: memory-stale.alert. Added to HEARTBEAT.md pickup.

### [T371] Dark mode toggle for trading dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Toggle button in header with Sun/Moon/Monitor icons for light/dark/system. Keyboard shortcut 'T'. Background, grid, and container adapt to theme. Persists in localStorage via ThemeProvider.

### [T372] Add language switcher UI to onde-portal header
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already implemented! LanguageSwitcher.tsx component with globe icon, dropdown menu showing EN/IT with checkmark for active. Integrated in Navigation.tsx for both desktop and mobile views. Uses useLocale() from i18n context.

### [T373] Convert homepage (page.tsx) to use i18n translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Homepage now uses useTranslations()! Added hero.*, whyOnde.*, featuresNew.*, library.*, testimonials.*, ctaNew.*, footerNew.* translation keys to en.json and it.json. Respects user language preference via i18n system.

### [T374] Audit remaining pages for hardcoded strings
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ All pages converted to i18n! /famiglia (T422), /collezioni, /giochi (T423), /about (T424), /health (T425). Homepage + catalogo were already done. Full Italian localization complete.

### [T375] Analyze vol_aligned trades vs non-aligned
- **Status**: TODO
- **Owner**: 
- **Depends**: [T237]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to compare win rate and PnL of trades where vol_aligned=true vs false. Validate that volatility rebalancing improves performance. Similar to momentum alignment analysis.

### [T376] Volatility preference alert (multi-day divergence)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T237]
- **Blocks**: -
- **Priority**: P3
- **Notes**: If one asset's vol ratio stays >1.2 for 3+ consecutive cycles, send Telegram alert recommending focus on that asset. Helps identify sustained edge opportunities.

### [T377] Historical volatility vs model assumptions analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T237]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Weekly script to compute average realized vol for BTC/ETH over past 30 days. Compare to BTC_HOURLY_VOL/ETH_HOURLY_VOL constants. Suggest adjustments if consistently off by >20%.

### [T378] GA4 custom events for book downloads
- **Status**: TODO
- **Owner**: 
- **Depends**: [T040]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track "book_download" event with book title, format (PDF/EPUB), language. Helps understand which books are popular and in what formats.

### [T379] Trading PnL daily goal tracker
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add configurable daily profit target ($X). Show progress bar on /betting dashboard. Alert when goal reached or when significantly behind. Track goal hit rate over time.

### [T380] Reading list / bookmark feature for books
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! useReadingList hook (localStorage), bookmark buttons on /libri book cards, reading list counter in hero, dedicated /my-books page with empty state + bookmarked books grid. i18n translations added (EN/IT). Clear list button.

### [T381] Use cached OHLC in autotrader momentum calculation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added load_cached_ohlc() function to autotrader-v2. Strategy: 1) Try cache first, 2) If fresh (<24h), use it, 3) If stale but exists, try live API then fallback to cache, 4) Reduces CoinGecko calls from ~12/cycle to 0-2. Tested: BTC/ETH cache loading works, 180 candles each.

### [T382] OHLC cache health check in heartbeat
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Script: check-ohlc-cache.sh. Checks if data/ohlc/*.json >24h old or missing. Creates ohlc-cache-stale.alert for heartbeat pickup. 6h cooldown. Added to HEARTBEAT.md alert list.

### [T383] Calculate historical volatility from cached OHLC
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: calculate-historical-volatility.py. Computes 7d/14d/30d/60d volatility from cached OHLC. Converts 4h candle vol to hourly. Compares to model assumptions. Output: data/ohlc/volatility-stats.json. Finding: Model currently OVERESTIMATES vol (BTC 0.32% actual vs 0.5% assumed, ETH 0.46% vs 0.7%).

### [T384] Price source reliability tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: track-api-reliability.py. Checks BTC/ETH availability from Binance, CoinGecko, Coinbase. Logs to api-reliability.jsonl. --report generates uptime % and recommendations. Cron: hourly check, weekly report (Sunday 10:00 UTC). Finding: Binance blocked (geo-restricted), CoinGecko/Coinbase 100%.

### [T385] Price spread anomaly detection
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: detect-price-spread.py. Monitors BTC/ETH prices from Binance, CoinGecko, Coinbase. Alerts when spread >1%. Logs anomalies to price-anomalies.jsonl. Features: continuous mode, history view, 30min cooldown. Alert file: kalshi-price-spread.alert. Added to HEARTBEAT.md pickup.

### [T386] Add exchange sources to trade logs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "price_sources" field to trade_data. Shows which exchanges (binance, coingecko, coinbase) contributed to the price at trade entry. Enables future analysis of source-specific win rates.

### [T387] Streak position stats on /betting dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T290]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add widget showing win rate by streak position context (after 2+ wins, after 2+ losses). Uses analyze-streak-position.py output. Helps traders recognize when they're in high/low probability contexts.

### [T388] Streak-based position sizing adjustment
- **Status**: TODO
- **Owner**: 
- **Depends**: [T290]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Reduce position size after N consecutive wins (hot hand fallacy risk) or losses (tilt prevention). Configurable via STREAK_SIZE_REDUCTION_THRESHOLD env var. Log size adjustments in trade data.

### [T389] Historical streak analysis by asset (BTC vs ETH)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T290], [T236]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend streak position analysis to compare BTC vs ETH streak patterns. Do different assets have different streak tendencies? May indicate model calibration differences.

### [T390] Log position size multipliers in trade data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T293]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added to trade_data: kelly_fraction_base, kelly_fraction_used, regime_multiplier, vol_multiplier, size_multiplier_total. Enables analysis of how sizing adjustments correlate with outcomes per T391.

### [T391] Analyze volatility-adjusted sizing effectiveness
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T390]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-sizing-effectiveness.py. Categorizes trades by size multiplier (reduced/standard/increased), compares win rate, PnL, ROI. Usage: `python3 scripts/analyze-sizing-effectiveness.py [--v2] [--threshold 0.1]`. Output: data/trading/sizing-effectiveness.json. Awaiting trades with T390 data.

### [T392] Compare cached vs live OHLC momentum accuracy
- **Status**: TODO
- **Owner**: 
- **Depends**: [T381]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track when momentum calc uses cached vs live data. Compare accuracy of resulting trades. Validates that cached OHLC doesn't degrade performance.

### [T393] Whipsaw detection (momentum flip twice in same day)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T259]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! check_whipsaw() tracks direction_history in momentum state, detects 2+ bullish↔bearish flips within 24h. Alert file: kalshi-whipsaw.alert (2h cooldown). Recommends reduced position sizes for choppy conditions. Added to HEARTBEAT.md pickup.

### [T394] Analyze win rate by momentum alignment status
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T301]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-momentum-alignment.py. Categorizes trades by alignment (full/partial/none), compares win rate, PnL, ROI. Usage: `python3 scripts/analyze-momentum-alignment.py [--v2]`. Output: data/trading/momentum-alignment-analysis.json. V2 trades will have proper alignment data.

### [T395] Log momentum alignment status in trade data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T301]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added full_alignment field to opportunity data + trade_log. Captures when all timeframes (1h/4h/24h) agree regardless of direction. Enables T394 analysis of alignment effectiveness.

### [T396] Latency-based exchange source prioritization
- **Status**: TODO
- **Owner**: 
- **Depends**: [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Use latency profile data to dynamically prioritize faster exchanges. If Binance avg <200ms but CoinGecko >500ms, try Binance first. Update priority order in get_crypto_prices() based on recent latency stats.

### [T397] Latency anomaly detection and alerting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when latency suddenly increases beyond historical baseline. Calculate rolling avg + std dev. Alert when current avg > rolling_avg + 2*std_dev. Could indicate API issues or network problems.

### [T398] Latency dashboard on /health page
- **Status**: TODO
- **Owner**: 
- **Depends**: [T279], [T256]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add latency metrics section to /health page. Show: avg latency per endpoint category, slowest endpoints, error rates, latency trend sparklines. Read from kalshi-latency-profile.json via API.

### [T410] Holiday trading performance analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T295]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend weekend analysis to US market holidays (Christmas, Thanksgiving, etc). Lower liquidity may affect crypto volatility patterns. Script: analyze-holiday-trading.py

### [T411] Time-of-day heatmap visualization on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Visual heatmap (7 days × 24 hours grid) showing win rate by day/hour. Color-coded: green=profitable hours, red=losing hours. Helps identify optimal trading windows.

### [T412] Auto-detect optimal trading hours from historical data
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249], [T295]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to recommend trading windows based on historical performance. Output: suggested active hours, days to avoid, confidence intervals. Could feed into autotrader to pause during historically bad times.

### [T413] Track API error rates per source
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T384]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-api-errors.py. Parses autotrader-v2.log for error patterns per source (Kalshi, CoinGecko, Binance, Coinbase, network). Detects retry attempts, timeouts, rate limits. Outputs success/error rates with sample errors. Stats saved to data/trading/api-error-stats.json. Usage: `python3 scripts/analyze-api-errors.py --days 7`

### [T414] Auto-pause autotrader during market holidays
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: US market holidays often have lower crypto liquidity and unusual patterns. Script to check if today is a holiday (python-holidays or hardcoded list). Skip trading on Christmas, Thanksgiving, etc.

### [T415] Memory file auto-archiving for old daily notes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T370]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: archive-old-memory.sh. Cron: 1st of each month at midnight. Moves memory/YYYY-MM-DD.md files >30 days old to memory/archive/. Auto-commits changes. DAYS_OLD env configurable.

---

*Ultimo aggiornamento: 2026-01-30 17:00 UTC*
*Sistema coordinamento: vedi TASK-RULES.md*

### [T416] Auto-reduce position size during whipsaw
- **Status**: TODO
- **Owner**: 
- **Depends**: [T393]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When whipsaw is detected, automatically reduce position sizes by 50% for affected asset until momentum stabilizes (no flip for 6h). Extend T293 sizing logic.

### [T417] Weekly volatility calibration check
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-volatility-calibration.py. Compares 7d realized vol vs model assumptions. Alert if >20% deviation. Cron: Sundays 8 AM UTC. Alert file: kalshi-vol-calibration.alert. Initial run found BTC +28%, ETH +35% deviation - may need recalibration!

### [T418] Analyze win rate by momentum direction (bullish vs bearish)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-momentum-direction.py. Compares bullish/bearish/neutral win rate, PnL, ROI, avg edge. Includes side breakdown (YES/NO) per direction. Usage: `python3 scripts/analyze-momentum-direction.py [--v2]`. Output: data/trading/momentum-direction-analysis.json.

### [T419] Integrate API call tracking into autotrader
- **Status**: TODO
- **Owner**: 
- **Depends**: [T330]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Hook track-api-calls.py logging into autotrader for Kalshi, CoinGecko, Binance, Coinbase calls. Add import and call log_api_call() after each request. Enables rate limit monitoring.

### [T420] OHLC cache staleness alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: check-ohlc-cache-age.sh. Checks btc-ohlc.json + eth-ohlc.json age. Alert if >24h old or missing. Alert file: ohlc-cache-stale.alert. Added to HEARTBEAT.md. Run with meta-watchdog or separate cron.

### [T421] Autotrader health JSON endpoint
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: autotrader-health.py. Outputs JSON with: running, pid, uptime_24h/7d, last_trade_time, trade_count_today, won/lost/pending, win_rate_today, balance, status emoji. Flags: --pretty for human-readable, --json for raw. Usage: `python3 scripts/autotrader-health.py --pretty`

### [T422] i18n: /famiglia page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added famiglia section to en.json/it.json with ~25 translation keys (title, years, parent, profile types, stats, form fields, buttons, info text). Page now uses useTranslations() hook.

### [T423] i18n: /giochi page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added games.status (playNow/comingSoon/inDevelopment/inPlanning), games.features (15+ feature labels), games.gameTitles.moonlightMagicHouse to both en.json and it.json. Page now uses useTranslations() hook with translated game data.

### [T424] i18n: /about page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added about section to it.json (badge, title, intro, whatWeDo, orchestra, team, values, contact). Updated page.tsx to use useTranslations() hook with t.about.* syntax.

### [T425] i18n: /health page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added 60+ translation keys for health page: title, subtitle, overall status, services, cron jobs, network/PWA, web vitals, timezone, storage. Page now uses useTranslations() hook. Italian translations included.

### [T426] Multi-exchange price consistency alerting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when price spread across exchanges (Binance/CoinGecko/Coinbase) exceeds 1%. Currently logs warning but no alert file. Potential arbitrage indicator or data quality issue.

### [T427] External API response caching (reduce redundant calls)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T308]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added 60s in-memory cache for: CoinGecko, Binance, Coinbase price fetches + Fear&Greed index. Functions: get_cached_response(), set_cached_response(), get_cache_stats(). Tracks cache hits via latency profiling (e.g., "prices_coingecko_cache_hit"). Reduces redundant API calls per cycle.

### [T428] Weekly rate limit usage report (trend analysis)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T308]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Generate weekly summary of API usage trends. Include avg/peak calls per source, busiest hours, comparison vs previous week. Email or Telegram delivery via cron.

### [T429] Autotrader health cron with alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T421]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: autotrader-health-cron.sh. Checks health, alerts if down >30min OR win rate <30% with 5+ settled trades. State tracking: kalshi-health-state.json. Alert file: kalshi-health.alert. 1h cooldown. Cron: `*/15 * * * *`. Added to HEARTBEAT.md pickup.

### [T430] Trading dashboard API health endpoint
- **Status**: TODO
- **Owner**: 
- **Depends**: [T421]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Expose /api/trading/health endpoint that serves autotrader-health.py output. Enables /health page to show autotrader status without local file access. Requires server deployment or GitHub Gist sync.

### [T431] Trade outcome prediction confidence calibration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-edge-calibration.py. Groups trades by edge bucket (0-5%, 5-10%, etc), compares actual WR vs expected (50%+edge). Shows calibration error per bucket with interpretation. Flags: --v2, --buckets N. V1 analysis: 0% WR with 45%+ edge = catastrophically overconfident (broken model). V2 awaiting data.

### [T432] API latency breakdown widget on /betting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add expandable section showing per-endpoint latency breakdown: Kalshi API, Binance, CoinGecko, Coinbase, Fear&Greed. Bar chart or list with p50/p95/p99. Helps identify bottlenecks.

### [T433] Trade execution audit log viewer
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Web UI to view trade execution logs with full context: opportunity details, decision reason, API responses, timing breakdown. Useful for debugging why specific trades were taken/skipped.

### [T434] Weekly OHLC volatility summary report
- **Status**: TODO
- **Owner**: 
- **Depends**: [T278], [T383]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Cron Sunday 08:00 UTC: compute 7d/30d realized vol from cached OHLC, compare to model assumptions, flag if >20% divergence. Output: data/reports/volatility-week-YYYY-WW.json. Alert if calibration needed.

### [T435] i18n: /app page translations
- **Status**: TODO
- **Owner**: 
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Convert /app page to use i18n system. Similar to /giochi conversion - extract hardcoded strings to en.json/it.json and use useTranslations() hook.

### [T436] Add skeleton loading state for games grid
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created Skeleton.tsx component with shimmer animation + GameCardSkeleton + GameCardsSkeletonGrid. Integrated into /giochi page with 300ms loading state. Improves perceived performance.

### [T437] Game card hover effects enhancement
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Enhanced AnimatedCard with: 1) scale(1.02) on hover with smooth easing, 2) variant-specific shadow depth (coral/gold/teal colors), 3) shine effect sweep animation, 4) whileTap scale(0.98) for tactile feedback, 5) card-icon class with wobble (scale+rotate) on hover. Updated /giochi play buttons with gradient swap, scale, and pulse animation.

### [T438] Cron job for historical volatility calculation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T383]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Cron: `0 9 * * 0` (Sundays 09:00 UTC, after OHLC cache + calibration check). Logs to scripts/historical-vol.log. Keeps data/ohlc/volatility-stats.json fresh weekly.

### [T439] Auto-recalibrate model volatility assumptions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T383], [T417]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: auto-calibrate-volatility.py. Compares 30d realized vs assumed vol, recommends new values if >25% divergence. Flags: --apply (update script), --threshold N, --no-alert. Alert file: kalshi-vol-recalibration.alert. Findings: BTC 0.50%→0.35%, ETH 0.70%→0.51% recommended. Adds 10% safety buffer above realized vol. Requires manual --apply to update (safety).

### [T440] Volatility trend visualization on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T383]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add sparkline or chart to /betting showing 30d volatility trend for BTC/ETH. Read from data/ohlc/volatility-stats.json. Helps visualize if market vol is increasing/decreasing over time.

### [T441] Reversion signal win rate tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: [T302]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track win rate specifically for trades made during reversion signals (T302). Analyze if contrarian trades outperform or underperform. Script: analyze-reversion-trades.py. Log reversion_signal: true/false in trade data.

### [T442] Multi-asset correlation monitoring
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track BTC/ETH price correlation coefficient over time. When correlation breaks down (usually during liquidation events), adjust strategy accordingly. Script: analyze-asset-correlation.py using OHLC cache.

### [T443] Dashboard refresh rate configuration
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add user setting for dashboard auto-refresh interval (30s/60s/5min/off). Currently hardcoded. Save preference to localStorage. Show countdown timer in header.

### [T444] Auto-adjust Kelly fraction based on rolling win rate
- **Status**: TODO
- **Owner**: 
- **Depends**: [T248]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Dynamic Kelly adjustment using last 50 trades rolling win rate. If WR drops below 40%, reduce Kelly by 50%. If WR rises above 60%, allow 25% increase. Caps at 2x base Kelly. Prevents overleveraging during drawdowns.

### [T445] Trading strategy A/B test: momentum vs mean-reversion
- **Status**: TODO
- **Owner**: 
- **Depends**: [T220]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run parallel paper trades: one uses momentum-aligned strategy, other uses contrarian/mean-reversion. Compare win rates over 100+ trades to determine which performs better in current market regime.

### [T446] Alert: consecutive losing streak threshold
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already implemented! check_circuit_breaker() in autotrader-v2.py. Pauses trading on 5+ consecutive losses, writes kalshi-circuit-breaker.alert. State file: kalshi-circuit-breaker.json. Resumes on first win.

### [T447] Trade PnL breakdown by day of week
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-trades-by-weekday.py. Shows trades/win rate/PnL/avg PnL per day. Identifies best/worst days, gives recommendations. V1 data shows all trades on Wednesday (broken model batch). V2 awaiting more trades.

### [T448] Real-time trade notifications polling on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add toast/notification on /betting when new trade is placed or settled. Poll /api/trading/stats every 30s, compare trade count, show notification with trade details (ticker, side, result). Use browser Notification API with permission.

### [T449] Backtest position sizing strategies
- **Status**: TODO
- **Owner**: 
- **Depends**: [T248]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare historical performance using: fixed $5 per trade, Kelly criterion, half-Kelly, volatility-scaled sizing. Use settlement data to simulate each strategy. Report final PnL and max drawdown for each. Script: backtest-position-sizing.py.

### [T450] Book cover image generation for /catalogo
- **Status**: TODO
- **Owner**: 
- **Depends**: [T297]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Replace placeholder 📖 emoji with AI-generated book covers. Use consistent style (minimalist, watercolor, or vintage). Generate on-demand or pre-cache top 50 books. Store in /public/covers/ or use image CDN.

### [T451] Sort options for /catalogo (title, author, reading time)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T297]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Sort dropdown with 4 options: Title (A-Z), Author (A-Z), Shortest first, Longest first. Persists to localStorage. Added i18n translations (EN/IT). Builds on T297 reading time estimates.

### [T452] Autotrader: market hours optimization (skip low-volume times)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze trade performance by hour (T249 exists). Automatically reduce position size or skip trades during historically low-WR hours (e.g., 03:00-06:00 UTC). Configurable via TRADING_HOURS_BONUS/PENALTY dict.

### [T449] Lighthouse score history tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: [T227]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Save Lighthouse scores to data/lighthouse/history.jsonl after each run. Track performance/a11y/seo/practices over time. Script: track-lighthouse-history.sh. Alerts if score drops >10% from 7-day average.

### [T450] Performance budget in build pipeline
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add budgets.json config for asset size limits (e.g., JS bundle <300KB, CSS <50KB, images <500KB each). Script: check-bundle-sizes.sh. Fail deploy if exceeded. Uses `du` and `find` to check build output.

### [T451] SEO audit automation (broken links, alt text)
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: seo-audit.sh. Crawl site for: broken internal links (404), images missing alt text, missing meta descriptions, orphan pages. Output report to data/seo/audit-YYYY-MM-DD.json. Integrate with deploy verification.

### [T453] Deploy onde.la with a11y + catalog improvements
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T334], [T335]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! Category pill filters, URL persistence, WCAG fixes all live on onde.la. Verified: HTTP 200, content correct.

### [T454] Skip-to-content link for keyboard accessibility
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! SkipToContent component in ClientLayout.tsx. Link visually hidden (sr-only) but appears on focus with styled appearance. Main element has id="main-content" and tabIndex={-1} for focus management. i18n translations added (EN/IT).

### [T455] Visible focus indicators for all interactive elements
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T335]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Global focus-visible styles in globals.css for all interactive elements (a, button, input, select, textarea, [role="button"], [tabindex]). Uses gold ring with dark offset for visibility on all backgrounds. Added utility classes: focus-ring-gold, focus-ring-teal, focus-ring-white, focus-ring-inset for custom styling.

### [T456] Weekly cron for volatility calibration check
- **Status**: TODO
- **Owner**: 
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run auto-calibrate-volatility.py weekly (Sundays 10:00 UTC, after T417). Creates alert if recalibration needed. Cron: `0 10 * * 0`. Log to volatility-calibration.log.

### [T457] Auto-restart autotrader after manual calibration
- **Status**: TODO
- **Owner**: 
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend auto-calibrate-volatility.py --apply to optionally restart autotrader. Add --restart flag. Kill old process, wait 2s, start new one. Safer than leaving outdated model running.

### [T458] Track calibration accuracy over time
- **Status**: TODO
- **Owner**: 
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to analyze volatility-calibration.log. Compare recommended vs actual vol 30 days later. Shows if calibration improved model accuracy. Weekly report: avg prediction error before/after calibration.

### [T459] Backtest divergence signals on historical OHLC
- **Status**: TODO
- **Owner**: 
- **Depends**: [T303], [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: backtest-divergence.py. Analyze historical divergence signals (from cached OHLC) against actual price moves 1h/4h/24h later. Calculate hit rate by confidence level. Shows if divergence detection is predictive. Output: data/trading/divergence-backtest.json.

### [T460] Combined signal scoring (divergence + reversion + momentum)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T303], [T302], [T301]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Create composite signal score combining: divergence, reversion, and momentum alignment. Higher score = higher conviction. Add to opportunity evaluation. Trades with multiple confirming signals get edge bonus. Single function: calculate_composite_signal_score().

### [T461] Weekly divergence signal accuracy report
- **Status**: TODO
- **Owner**: 
- **Depends**: [T303], [T095]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend kalshi-weekly-report.py to include divergence signals section: signals fired, hit rate (price moved in predicted direction), avg move size, best/worst signals. Helps calibrate confidence thresholds over time.

### [T462] OHLC cache freshness alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: check-ohlc-cache.sh. Checks newest JSON in data/ohlc/, alerts if >24h old. Cron every 6h. Alert file: ohlc-cache-stale.alert. Auto-clears when cache refreshed. Already in HEARTBEAT.md pickup list.

### [T463] Bankroll growth visualization script
- **Status**: TODO
- **Owner**: 
- **Depends**: [T307]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: plot-bankroll-growth.py. Generate ASCII/SVG chart showing cumulative PnL over time from trade logs. Compare actual vs simulated strategies (Kelly/fixed). Output to data/trading/bankroll-chart.svg.

### [T464] Trade timing optimization analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: analyze-trade-timing.py. Analyze which hour of day and day of week have best edge/win rate. Recommend optimal trading windows. Could inform trading schedule (pause during poor hours). Uses historical trades + cached OHLC volatility data.

### [T465] Deploy onde.la with health page i18n
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T425]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! Built 1022 pages, passed tests, deployed to Cloudflare Pages. Verified HTTP 200, /libri page loads with Meditations book showing "Free". Download analytics (T299) also included in this deploy.

### [T466] Add i18n completeness check script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: scripts/check-i18n.sh. Extracts all nested keys from en.json and it.json, compares using comm. Shows key counts, lists missing keys (max 20), exits with error code if mismatched. npm script: `npm run i18n:check`. Current status: 511 keys in sync!

### [T467] Language preference persistence in cookie for SSR
- **Status**: TODO
- **Owner**: 
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Currently using localStorage which doesn't work for SSR. Add HTTP cookie fallback so server can render correct language on first load. Use next-cookies or similar. Prevents flash of wrong language.


### [T468] Most Downloaded section on /libri page
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "Popular Books" or "Most Downloaded" section at top of /libri page. Uses download data from useDownloadTracker. Shows top 5 books by download count. Re-orders books dynamically based on popularity.

### [T469] Server-side download analytics with D1
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Persist download counts server-side using Cloudflare D1. Create downloads table (book_id, format, count, last_download). Add API endpoint /api/analytics/track to increment. Aggregate counts across all users instead of just localStorage per-user.

### [T470] Book recommendation system based on downloads
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299], [T469]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show "Readers also downloaded" on book detail pages. Track co-download patterns (users who downloaded A also downloaded B). Simple collaborative filtering without user accounts - just aggregate patterns.

### [T471] Circuit breaker history logging
- **Status**: TODO
- **Owner**: 
- **Depends**: [T367]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Log each circuit breaker trigger/release to kalshi-circuit-breaker-history.jsonl. Track: trigger time, release time, release reason (win/cooldown/manual), streak at trigger, trades skipped while paused. Analyze patterns to optimize threshold.

### [T472] Autotrader health dashboard endpoint
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Create kalshi-health-status.json written by autotrader every cycle with: is_running, last_cycle_time, trades_today, positions_count, circuit_breaker_status, win_rate_24h, balance. Can be read by external monitoring or /health page API.

### [T473] Trading session summary on process exit
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add signal handler (SIGTERM/SIGINT) to autotrader that prints session summary before exit: trades made, win rate, PnL, hours running, positions left open. Log to file for crash analysis.

### [T474] Weekly API error rate cron job
- **Status**: TODO
- **Owner**: 
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add cron job (Sundays 09:00 UTC) to run analyze-api-errors.py and generate weekly report. Send summary to Telegram if error rate >5% for any source. Helps catch degrading APIs early.

### [T475] Alert on high API error rate
- **Status**: TODO
- **Owner**: 
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend analyze-api-errors.py to write kalshi-api-error.alert when any source exceeds 10% error rate over 24h. Add to HEARTBEAT.md pickup. Integrates with existing alert infrastructure.

### [T476] API error stats on /health page
- **Status**: TODO
- **Owner**: 
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add API reliability section to /health page showing error rates per source from data/trading/api-error-stats.json. Color-coded status indicators (green/yellow/red). Requires server-side or GitHub Gist storage for static export.

### [T477] ARIA live regions for dynamic content
- **Status**: TODO
- **Owner**: 
- **Depends**: [T454]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add aria-live regions for dynamic updates (toast notifications, loading states, form validations). Ensures screen reader users are informed of changes. Use aria-live="polite" for non-urgent, "assertive" for errors.

### [T478] High contrast mode toggle
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add optional high-contrast mode for users with visual impairments. Toggle in header/settings. CSS custom properties for contrast-safe color values. Respects prefers-contrast media query. Persist to localStorage.

### [T479] Reduce motion support (prefers-reduced-motion)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Global prefers-reduced-motion media query in globals.css. Disables/reduces: particles, floating orbs, blob animations, spotlight, holographic effects, gradient flows, hover transforms, scroll indicators. Keeps essential transitions instant. Added motion-safe/motion-reduce utility classes. WCAG 2.3.3 compliant.

### [T480] Price spread monitoring cron job
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T385]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Cron job added: `*/15 * * * *`. Runs detect-price-spread.py with 1% threshold. Logs to price-spread.log. Alert file triggers Telegram notification via heartbeat.

### [T481] Multi-timeframe volatility dashboard widget
- **Status**: TODO
- **Owner**: 
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add volatility widget to /betting showing realized vol for 1h/4h/24h timeframes vs model assumptions. Uses cached OHLC data. Color-coded: green when vol matches model, orange when diverging >20%. Helps traders understand current market conditions.

### [T482] Trade execution audit log
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Comprehensive audit log for all trade attempts (successful and failed). Include: timestamp, ticker, side, price, size, API response, latency, any errors. Store in kalshi-audit.jsonl. Useful for debugging failed trades and compliance.

### [T483] Fetch real stats from gist on /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T277]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added fetchTradingStatsWithFallback() to /betting page. Tries local API first (dev), then falls back to gist URL for static Cloudflare Pages deploy. Maps gist format to TradingStats interface. TRADING_STATS_GIST_URL constant added.

### [T484] Migrate V1 trades to V2 format
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Create migration script to convert kalshi-trades.jsonl (v1) to kalshi-trades-v2.jsonl format. Add missing fields: asset, reason, momentum, volatility, regime. Preserves historical data for trend analysis. Run once, then verify stats.

### [T485] Auto-discovery of new Kalshi crypto markets
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to detect when Kalshi adds new crypto markets (SOL, DOGE, etc.). Check /markets API for series starting with KX. Alert when new tickers found. Could auto-expand autotrader coverage.

### [T486] E2E tests for onde.surf (surfboard)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T208]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend Playwright tests for surfboard environment. Test /betting dashboard, trading stats display, momentum cards, charts. Verify data loading and error states.

### [T487] Playwright visual regression tests
- **Status**: TODO
- **Owner**: 
- **Depends**: [T208]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add screenshot comparison tests using playwright.toHaveScreenshot(). Baseline screenshots for key pages (/libri, /catalogo, /betting). CI fails if visual diff >threshold. Catches unintended style regressions.

### [T488] Autotrader health endpoint API
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created scripts/autotrader-health.py. Outputs JSON to data/trading/autotrader-health.json with: process status, last trade info, 24h win rate, log activity, recent errors. Exit codes: 0=healthy, 1=warning, 2=critical. Can be pushed to gist for external monitoring.

### [T489] Shareable reading list URL
- **Status**: TODO
- **Owner**: 
- **Depends**: [T380]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "Share List" button to /my-books page. Generates URL with bookmarked book IDs encoded (e.g., /my-books?books=meditations,shepherds-promise). Recipients can view shared list without it being added to their localStorage. Social sharing friendly.

### [T490] Recently viewed books tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T380]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created useRecentlyViewed hook (tracks last 5 books in localStorage). Integrated into BookReaderClient to track views. Added "Recently Viewed" horizontal scroll section on /libri page with compact book cards. Shows only if user has viewed books.

### [T491] Unified book data source for /libri and /my-books
- **Status**: TODO
- **Owner**: 
- **Depends**: [T380]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Currently both pages have duplicate book arrays. Create shared books.ts data file with all book info. Import in both pages. Single source of truth. Easier to add new books and maintain consistency.

### [T492] Portfolio value history chart
- **Status**: TODO
- **Owner**: 
- **Depends**: [T277]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show historical portfolio value over time (7d/30d/all). Use trading snapshots data to calculate cumulative value at each point. Line chart with area fill. Includes cash + open positions value.

### [T493] Position risk indicator (exposure % of portfolio)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T317]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added risk indicator badge to position cards! Shows exposure as % of portfolio (cash + positions). Color coded: emerald (<10%), yellow (10-25%), red (>25%). Tooltip shows exact %. Helps visualize concentration risk at a glance.

### [T494] Trade alert sound effects
- **Status**: TODO
- **Owner**: 
- **Depends**: [T051]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Play subtle sound when new trade placed or position settled. Use existing useSoundManager pattern. Coin sound for wins, error sound for losses. Toggle in settings. Works in browser tab even when not focused.

### [T495] Alert when execution success rate drops below 95%
- **Status**: TODO
- **Owner**: 
- **Depends**: [T329]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze last 20 execution attempts. If success rate <95%, write kalshi-execution-fail.alert for heartbeat pickup. 4h cooldown. Helps detect API issues or account problems early.

### [T496] Execution performance by time of day analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T329]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend analyze-execution-rate.py to show success rate and latency by hour (UTC). Identify if certain times have worse execution. May reveal API congestion patterns or optimal trading windows.

### [T497] Execution latency correlation with market volatility
- **Status**: TODO
- **Owner**: 
- **Depends**: [T329], [T285]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze if high volatility periods have worse execution latency. Correlate execution_log latency_ms with cached OHLC volatility at trade time. Could inform position sizing during volatile periods.

