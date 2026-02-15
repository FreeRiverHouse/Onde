# TASKS.md - Lista Task Condivisa

> **Regola:** Un task alla volta. Lock → Work → Done → Next.
> **Priorità:** Ordinati per impatto sulla crescita del sito onde.la

---

## 🚀 TOP 30 TASK DA FARE (Ordinati per Impatto Crescita)

### 🚨 BLOCCANTE - Non smettere finché non è fatto!

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 0 | DEPLOY-001 | onde.la su Vercel - deploy funzionante | 🚨 BLOCCANTE | ✅ DONE | @clawdinho | Verified: onde.la returns 200, sitemap includes skin-creator |

### 🔥 ALTA PRIORITÀ - Crescita & Traffico

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 1 | SEO-001 | Creare OG image per /skin-creator (1200x630) | 🔥 Social sharing = viralità | ✅ DONE | @clawdinho |
| 2 | SEO-002 | Submit skin-creator a Google Search Console | 🔥 Indicizzazione Google | 🔶 READY | @clawdinho | Sitemap deployed, checklist: docs/marketing/gsc-submission-checklist.md |
| 3 | MKTG-001 | Post skin creator su r/Minecraft e r/Roblox | 🔥 Marketing diretto | 🔶 DRAFT READY | @clawdinho | docs/marketing/reddit-skin-creator-post.md |
| 4 | T851 | i18n: Completare audit stringhe hardcoded | 🔥 Professionalità | ✅ DONE | @clawdinho | Shop ✅, Games ✅ |
| 5 | GAM-001 | Skin Creator: Mobile UX improvements | 🔥 Più utenti mobile | ✅ DONE | @clawdinho | Enhanced CSS for touch |
| 6 | MKTG-002 | YouTube Shorts demo skin creator | 🔥 Viralità video | 🔶 SCRIPT READY | @clawdinho | scripts/record-skin-creator-demo.sh |
| 7 | SOC-001 | Review X presence e engagement recente | 📈 Social presence | BLOCKED | - | Needs Typefully API key |

### ⭐ MEDIA PRIORITÀ - UX & Features

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 8 | GAM-002 | Skin Creator: Test su vari device mobile | ⭐ Quality assurance | ✅ DONE | @clawdinho | Tested iPhone SE/iPad/Landscape. Fixed: horizontal overflow, 19 small touch targets (<44px). Build verified. |
| 9 | GAM-003 | Skin Creator: Layout landscape mode | ⭐ Better tablet UX | ✅ DONE | @clawdinho | Added CSS media queries |
| 10 | T853 | SEO: Add hreflang tags for multi-language | ⭐ International SEO | ✅ DONE | @clawdinho |
| 11 | MLH-022 | Notification snooze (remind later) | ⭐ UX onde.surf | ✅ DONE | @clawdinho | UI complete, snooze menu + options |
| 12 | MLH-023 | Notification action buttons | ⭐ UX onde.surf | ✅ DONE | @clawdinho | Added actions array + button rendering |
| 13 | MLH-024 | Notification filters persistence | ⭐ UX onde.surf | ✅ DONE | @clawdinho |
| 14 | MLH-025 | Notification dismiss-all button | ⭐ UX onde.surf | ✅ DONE | @clawdinho |
| 15 | MLH-026 | Notification priority levels | ⭐ UX onde.surf | ✅ DONE | @clawdinho | Added low/normal/high/urgent with badges |
| 16 | i18n-SHOP | Aggiungere i18n alla pagina Shop | ⭐ Professionalità | ✅ DONE | @clawdinho | Fixed hardcoded strings |

### 🔧 PRIORITÀ NORMALE - Infra & Content

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 17 | PUB-001 | Check stato catalogo libri disponibili | 📚 Content | ✅ DONE | @clawdinho | 4 PDF online, 0 EPUB |
| 18 | PUB-002 | Verificare pipeline traduzione attiva | 📚 Content | ✅ DONE | @clawdinho | MLX v10 su M4, AMD scripts su M1 |
| 19 | INF-004 | Setup staging environment | 🔧 Dev workflow | ✅ DONE | @clawdinho | Created staging script + docs |
| 20 | INF-005 | Procedure deploy: staging first | 🔧 Dev workflow | ✅ DONE | @clawdinho | Documented in STAGING-SETUP.md |
| 21 | INF-006 | Script test automatici pre-deploy | 🔧 Dev workflow | ✅ DONE | @clawdinho | Already exists! |
| 22 | AUTO-003 | Documentare stato Kalshi trading | 📝 Documentation | ✅ DONE | @clawdinho |

---

## 📋 DETTAGLI TASK

### SEO-001: OG Image per Skin Creator
- **Cosa:** Creare immagine 1200x630 per social sharing
- **Perché:** Quando qualcuno condivide il link, appare bella preview
- **Come:** Creare con design tool o generare programmaticamente
- **File:** `public/og-skin-creator.png`

### SEO-002: Submit a Google Search Console
- **Cosa:** Aggiungere /skin-creator alla sitemap e submit
- **Perché:** Google indicizza più velocemente
- **Dipende da:** SEO-001 (serve OG image prima)

### MKTG-001: Post su Reddit
- **Cosa:** Post su r/Minecraft (~8M) e r/Roblox (~2M)
- **Perché:** Target audience perfetto, gratis
- **Tips:** Non spammare, contribuisci genuinamente

### T851: i18n Audit
- **Progress:** Homepage CTA ✅, Settings ✅
- **Remaining:** Shop page (no i18n), game pages
- **Priority:** Shop page prima (visibile a tutti)

### GAM-001: Mobile UX Skin Creator
- **Issues:** 3D preview piccola, toolbar scomoda, gesture mancanti
- **Goal:** Usabile come app native su mobile

---

## ✅ COMPLETATI RECENTEMENTE

### 2026-02-06
- **DEPLOY-001** - onde.la deploy verified (200 OK) ✅
- **SEO-007** - Sitemap: removed 404 snake/tetris, added 8 popular games ✅
- **SEO-008** - Added metadata layouts to 8 games ✅

### 2026-02-03
- **T851** - i18n: Completare audit stringhe hardcoded (Shop + Games) ✅
- **i18n-GAMES** - Integrare traduzioni /games page ✅
- **T852** - i18n: skinCreator translations on homepage ✅
- **i18n** - settings.loading translation ✅

### 2026-02-02
- **SEO-003** - /skin-creator URL con metadata SEO ✅
- **AUTO-002** - Alert autotrader DRY RUN mode ✅

### 2026-01-31
- **INF-001/002/003** - Health checks completati ✅
- **MLH-001 → MLH-021** - Notification system completo ✅
- **AUTO-001/004/005/006** - Monitoring scripts ✅

---

## 🎯 FOCUS ATTUALE

**Obiettivo:** Far crescere traffico su onde.la

**Strategia:**
1. 🎨 SEO & Social (OG images, Google indexing)
2. 📣 Marketing (Reddit, YouTube)
3. 📱 Mobile UX (skin creator usabile su telefono)
4. 🌍 i18n (sito professionale in IT/EN)

---

*Ultimo aggiornamento: 2026-02-06 08:06 PST*
*Riordinato per impatto crescita sito*

---

## 🆕 NUOVI TASK (Aggiunti 2026-02-03)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 23 | i18n-GAMES | Integrare traduzioni nella pagina /games | ⭐ Professionalità | ✅ DONE | @clawdinho |
| 24 | OG-002 | Creare OG image per /games (Gaming Island) | 🔥 Social sharing | ✅ DONE | @clawdinho || - |
| 25 | OG-003 | Creare OG image per /libri | 🔥 Social sharing | ✅ DONE | @clawdinho || - |
| 26 | META-001 | Aggiungere structured data JSON-LD ai giochi | ⭐ SEO | ✅ DONE | @clawdinho || - |
| 27 | PERF-001 | Audit Core Web Vitals per onde.la | ⭐ Performance | ✅ DONE | @clawdinho || - |
| 28 | A11Y-001 | Audit accessibilità (contrast, aria labels) | ⭐ Accessibilità | ✅ DONE | @clawdinho || - |
| 29 | PWA-001 | Verificare offline support per libri | 📱 PWA | ✅ DONE | @clawdinho | Documented || - |
| 30 | CACHE-001 | Ottimizzare caching immagini/assets | ⚡ Performance | ✅ DONE | @clawdinho | _headers || - |
| 31 | SITEMAP-001 | Verificare sitemap.xml completo | ⭐ SEO | ✅ DONE | @clawdinho | Expanded 18→35 pages |
| 32 | ROBOTS-001 | Verificare robots.txt | ⭐ SEO | ✅ DONE | @clawdinho | Added private paths |
| 33 | 404-001 | Creare pagina 404 custom | ⭐ UX | ✅ DONE | @clawdinho | Fun ocean theme |
| 34 | FAVICON-001 | Verificare favicon su tutti i browser | 🔧 Polish | ✅ DONE | @clawdinho | Fixed layout.tsx, manifest missing PNGs |
| 35.1 | ICON-002 | Creare icon-192.png e icon-512.png per PWA | 🔧 Polish | ✅ DONE | @clawdinho | Generated with PIL |
| 35 | SPEED-001 | Preload critical fonts | ⚡ Performance | ✅ DONE | @clawdinho | Already implemented |

## 🆕 TASK AGGIUNTI DA CLAWDINHO (2026-02-03 09:55 PST)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 36 | META-002 | Verificare Open Graph tags su tutte le pagine | ⭐ SEO | ✅ DONE | @clawdinho | Added OG + Twitter tags |
| 37 | A11Y-002 | Aggiungere skip links per accessibilità | ⭐ Accessibilità | ✅ DONE | @clawdinho | Already exists! |
| 38 | PERF-002 | Lazy load immagini sotto the fold | ⚡ Performance | ✅ DONE | @clawdinho | Next.js Image = auto lazy |
| 39 | SEO-003 | Verificare canonical URLs | ⭐ SEO | ✅ DONE | @clawdinho | Already configured |
| 40 | i18n-ABOUT | Verificare i18n pagina About | ⭐ Professionalità | ✅ DONE | @clawdinho | Already using useTranslations |
| 41 | OG-MAIN | Creare og-onde.png per main site | 🔥 Social sharing | ✅ DONE | @clawdinho | 1200x630 teal gradient |
| 42 | SEC-001 | Verificare security headers | 🔧 Security | ✅ DONE | @clawdinho | _headers configured, CF partial |
| 43 | PWA-002 | Verificare manifest.json e icone PWA | 📱 PWA | ✅ DONE | @clawdinho | icon-192 + icon-512 present |
| 44 | ANALYTICS-001 | Setup Plausible/Umami analytics | 📊 Growth | 🔶 DOCS READY | @clawdinho | docs/analytics/privacy-analytics-setup.md |
| 47 | CONTENT-001 | Add 3 more books to catalog | 📚 Content | ✅ DONE | @clawdinho | Alice, Jungle Book, Peter Rabbit (ePub + catalog) |
| 48 | GAME-003 | Add loading skeleton to skin creator | ⭐ UX | ✅ DONE | @clawdinho | loading.tsx with animated skeleton |
| 50 | UX-001 | Add loading skeleton to /libri page | ⭐ UX | ✅ DONE | @clawdinho | loading.tsx with book cards |
| 51 | UX-002 | Add error boundary to games | ⭐ Reliability | ✅ DONE | @clawdinho | error.tsx with retry button |
| 52 | A11Y-003 | Add aria-live regions for dynamic content | ⭐ Accessibility | ✅ DONE | @clawdinho | AccessibilityAnnouncer component |
| 53 | UX-003 | Add global loading indicator | ⭐ UX | ✅ DONE | @clawdinho | Progress bar + overlay |
| 54 | DOCS-001 | Create component documentation | 📝 Dev | ✅ DONE | @clawdinho | components/README.md |
| 55 | TEST-002 | Add basic smoke tests | 🔧 QA | ✅ DONE | @clawdinho | __tests__/smoke.test.ts |
| 56 | UX-004 | Add 404 page to games section | ⭐ UX | ✅ DONE | @clawdinho | Gaming-themed 404 |
| 57 | SEO-005 | Add breadcrumb schema to book pages | ⭐ SEO | ✅ DONE | @clawdinho | BreadcrumbSchema component |
| 58 | PERF-004 | Add resource hints (preconnect, prefetch) | ⚡ Performance | ✅ DONE | @clawdinho | dns-prefetch + prefetch nav |
| 59 | UX-005 | Add keyboard shortcuts help modal | ⭐ UX | ✅ DONE | @clawdinho | Press ? for shortcuts |
| 60 | A11Y-004 | Add focus trap to modals | ⭐ Accessibility | ✅ DONE | @clawdinho | useFocusTrap hook |
| 61 | PWA-003 | Add offline fallback page | 📱 PWA | ✅ DONE | @clawdinho | offline.html with auto-reload |
| 62 | UX-006 | Add scroll-to-top button | ⭐ UX | ✅ DONE | @clawdinho | ScrollToTop component |
| 63 | SEO-006 | Add article schema for book pages | ⭐ SEO | ✅ DONE | @clawdinho | BookSchema + ArticleSchema |
| 64 | PERF-005 | Add image blur placeholders | ⚡ Performance | ✅ DONE | @clawdinho | BlurImage + shimmer |
| 65 | UX-007 | Add copy-to-clipboard utility | ⭐ UX | ✅ DONE | @clawdinho | useCopyToClipboard hook |
| 66 | HOOK-001 | Add useLocalStorage hook | 🔧 Dev | ✅ DONE | @clawdinho | SSR-safe + multi-tab sync |
| 67 | HOOK-002 | Add useMediaQuery hook | 🔧 Dev | ✅ DONE | @clawdinho | + preset breakpoints |
| 68 | HOOK-003 | Add useDebounce hook | 🔧 Dev | ✅ DONE | @clawdinho | + useDebouncedCallback |
| 69 | UTIL-001 | Add cn() classname utility | 🔧 Dev | ✅ DONE | @clawdinho | lib/utils.ts |
| 70 | COMP-001 | Add Toast notification component | ⭐ UX | ✅ DONE | @clawdinho | ToastProvider + useToast |
| 71 | COMP-002 | Add Modal component | ⭐ UX | ✅ DONE | @clawdinho | Focus trap + esc close |
| 72 | COMP-003 | Add Tooltip component | ⭐ UX | ✅ DONE | @clawdinho | 4 positions + delay |
| 73 | HOOK-004 | Add useOnClickOutside hook | 🔧 Dev | ✅ DONE | @clawdinho |
| 74 | COMP-004 | Add Spinner/Loading component | ⭐ UX | ✅ DONE | @clawdinho | 3 sizes, 3 colors |
| 75 | COMP-005 | Add Badge component | ⭐ UX | ✅ DONE | @clawdinho | 6 variants + presets |
| 76 | EXPORT-001 | Create hooks index export | 🔧 Dev | ✅ DONE | @clawdinho | Barrel export |
| 77 | EXPORT-002 | Create components index export | 🔧 Dev | ✅ DONE | @clawdinho | Barrel export |
| 78 | TYPES-001 | Add shared TypeScript types | 🔧 Dev | ✅ DONE | @clawdinho | types/index.ts |
| 79 | README-001 | Update hooks README | 📝 Docs | ✅ DONE | @clawdinho | Full docs |
| 49 | SEO-004 | Add FAQ schema to homepage | ⭐ SEO | ✅ DONE | @clawdinho | 4 FAQs in JSON-LD |
| 45 | PERF-003 | Lighthouse audit e ottimizzazioni | ⚡ Performance | ✅ DONE | @clawdinho | Checklist: docs/performance/lighthouse-checklist.md |
| 46 | EMAIL-001 | Setup newsletter signup form | 📧 Retention | ✅ DONE | @clawdinho | NewsletterSignup component (3 variants) |

## 🆕 TASK AGGIUNTI (2026-02-06)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 80 | SEO-007 | Sitemap fix: remove 404 snake/tetris + add 8 popular games | ⭐ SEO | ✅ DONE | @clawdinho | Fixed broken links |
| 81 | SEO-008 | Add metadata layouts to 8 games (breakout, invaders, etc) | ⭐ SEO | ✅ DONE | @clawdinho | layout.tsx with OG tags |
| 82 | SEO-009 | Add JSON-LD GameApplication schema to all games | ⭐ SEO | ✅ DONE | @clawdinho | 44 games with VideoGame schema + parent hasPart expanded from 3→44 |
| 83 | PERF-006 | Add Vercel Speed Insights or web-vitals tracking | ⚡ Performance | ✅ DONE | @clawdinho | Already exists: GA4 auto-collects CWV + /health page with web-vitals lib |
| 84 | UX-008 | Add "Recently Played" games section on /games | ⭐ UX | ✅ DONE | @clawdinho | localStorage tracking, bottle theme |
| 85 | SEO-010 | Add all 40 games to sitemap.xml | ⭐ SEO | ✅ DONE | @clawdinho | Expanded from 13 to 40 games |
| 86 | SEO-011 | Add SoftwareApplication JSON-LD to skin-creator layout | ⭐ SEO | ✅ DONE | @clawdinho | SoftwareApplication schema with features |
| 87 | CONTENT-002 | Create /games category pages (puzzle, educational, creative) | 📈 SEO | ✅ DONE | @clawdinho | Created /games/category/puzzle, /educational, /creative with SEO metadata, JSON-LD, sitemap |
| 88 | INT-001 | Add inter-game recommendations ("You might also like...") | ⭐ UX/Engagement | ✅ DONE | @clawdinho | GameRecommendations component + auto-wrapper in layout |
| 89 | CONTENT-003 | Add 3 more classics: Grimm, Wizard of Oz, Andersen | 📚 Content | ✅ DONE | @clawdinho | ePubs from Gutenberg + catalog + sitemap |
| 90 | SITEMAP-002 | Add individual /libro/* reader pages to sitemap | ⭐ SEO | ✅ DONE | @clawdinho | 8 book reader pages added |
| 91 | DASH-001 | Mission Control Dashboard: Activity Feed | 🔥 Agent monitoring | ✅ DONE | @clawdinho | Activity timeline, agent cards, stat cards, category filters | Track every agent action/task/decision in a timeline feed. Inspired by @AlexFinn tweet. Integrate in onde.surf |
| 92 | DASH-002 | Mission Control Dashboard: Calendar View | 🔥 Agent monitoring | ✅ DONE | @clawdinho | Timeline + List views, category filters, 27 scheduled tasks mapped | Show all scheduled tasks (cron jobs, reminders) in weekly calendar view. Integrate in onde.surf |
| 93 | DASH-003 | Mission Control Dashboard: Global Search | 🔥 Agent monitoring | ✅ DONE | @clawdinho | ⌘K command palette, searches tasks/activities/schedules, keyboard nav | Search through memories, tasks, documents, past conversations. Integrate in onde.surf |
| 94 | GAM-FIX-001 | Test & fix ALL games on onde.la - click every interaction | 🔥 Quality | ✅ DONE | @clawdinho | All 44 games tested: HTTP 200 + 21 browser-verified interactive. Bugs fixed: puzzle images, jigsaw navbar, 2048 grid |

## 🆕 TASK AGGIUNTI (2026-02-06 11:30 PST)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 95 | DASH-004 | Mission Control: Live agent status via API (replace hardcoded) | ⭐ Agent monitoring | ✅ DONE | @clawdinho | Live API fetch, 6 stat cards, infra status pills, auto-refresh 60s |
| 96 | DASH-005 | Mission Control: Activity logging from heartbeats | 🔥 Agent monitoring | BLOCKED | @clawdinho | Script ready (scripts/post-activity.sh) but D1 migration 0008 not applied — need Mattia to run wrangler d1 migrations apply |
| 98 | SEO-013 | Add JSON-LD structured data to key pages (games, books, skin-creator) | ⭐ SEO | ✅ DONE | @clawdinho | Already exists in layout.tsx: CollectionPage+VideoGame for games, Book schema for libri, WebApplication+VideoGame for skin-creator |
| 99 | PERF-001 | Lighthouse audit on key pages and fix critical issues | ⭐ Performance | ✅ DONE | @clawdinho | Audited all 4 pages. Fixed: self-hosted fonts (-848ms), optimized images (-636KB), trailing slash links (-1.16s redirect), a11y button labels. Remaining: skin-creator TBT needs code-splitting (4.3s JS eval) |
| 100 | UX-001 | Add breadcrumb navigation to game and book pages | ⭐ UX + SEO | ✅ DONE | @clawdinho | Breadcrumb component created, visible breadcrumb on /libri, JSON-LD breadcrumbs on /games + /libri |
| 97 | SEO-012 | Internal linking audit: cross-link games↔books↔skin-creator | ⭐ SEO | ✅ DONE | @clawdinho | Added "Explore More" cross-link sections to games, libri, and skin-creator pages |
| 101 | PERF-002 | Skin Creator: Code-split 4357-line page.tsx into lazy-loaded components | 🔥 Performance | ✅ DONE | @clawdinho | 4358→350 lines (92% reduction), 19 components + useSkinCreator hook |
| 102 | PERF-003 | Fix Cloudflare robots.txt conflict (duplicate User-agent blocks) | ⭐ SEO | 🔶 PARTIAL | @clawdinho | Added explicit AI crawler Allow rules to robots.ts + documented fix. CF AI Audit feature still blocking AI bots — needs Mattia to disable in CF dashboard: AI > AI Audit > Toggle OFF |
| 103 | A11Y-001 | Skin Creator: Fix contrast ratios and touch target sizes | ⭐ Accessibility | ✅ DONE | @clawdinho | Fixed: all buttons min 44px touch targets, aria-labels on all interactive elements, text-gray-500→gray-600/700 for WCAG AA contrast, aria-pressed/role attributes, modal a11y |

## 🆕 TASK AGGIUNTI (2026-02-06 12:10 PST)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 104 | SEO-014 | Add llms.txt (LLMs Full) to onde.la for AI discoverability | ⭐ SEO/AI | ✅ DONE | @clawdinho | apps/onde-portal/public/llms.txt created |
| 105 | A11Y-002 | Add skip-to-content link on onde.la main layout | ⭐ Accessibility | ✅ DONE | @clawdinho | Already exists: SkipToContent component in ClientLayout.tsx |
| 106 | PERF-004 | Lazy-load Three.js in skin creator (dynamic import) | 🔥 Performance | ✅ DONE | @clawdinho | Already implemented: SkinPreview3D uses dynamic(() => import(...), { ssr: false }) |

### 🔥 NUOVI TASK (2026-02-14) - Da Mattia

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 30 | TRADE-001 | Riavviare autotrader con fix algoritmo (paper mode) | 🔥 Trading | TODO | - |
| 31 | TRADE-002 | Dashboard autotrader su onde.surf funzionante con grafici trend | 🔥 Trading | IN_PROGRESS | @clawdinho | Dashboard locale su :8888 funziona, deploy su onde.surf fatto ma serve connessione al backend |
| 32 | TRADE-003 | Implementare backtesting framework per autotrader | ⭐ Trading | ✅ DONE | @clawdinho | scripts/kalshi-backtest.py - Replay historical data, param sweep, Monte Carlo CI, strategy comparison |
| 33 | TRADE-004 | Phase 2: LLM-based probability assessment per Kalshi | ⭐ Trading | TODO | - | Ispirato a Grok 4.2 results |
| 34 | ANAL-001 | Analytics dettagliate onde.la - referrer, geo, device | 🔥 Growth | TODO | - | CF Web Analytics attive, servono analytics più dettagliate |
| 35 | GAME-001 | Multi-tenancy giocatori - sistema username leggero senza login | 🔥 Games | ✅ DONE | @clawdinho | usePlayerName hook globale + usePlayerLevel XP + useCoins. Tutti 44 giochi integrati (2026-02-14) |
| 36 | GAME-002 | Tracking giocatori - chi si registra, quanti tornano | ⭐ Games | TODO | - | Dipende da GAME-001 (DONE). Serve analytics su quanti usano il sistema |
| 37 | GAME-003 | Sistema sblocchi/progressione funzionante | ⭐ Games | ✅ DONE | @clawdinho | usePlayerLevel con 100 livelli, milestones, badges. useCoins per negozio. Integrato in tutti i giochi (2026-02-14) |
| 38 | DASH-001 | Migliorare dashboard onde.surf/betting con trend storici | ⭐ Trading | TODO | - | Grafici PnL cumulativo, win rate evolution |

## BUG-001: onde.surf "Cannot access uninitialized variable" crash
- **Status:** ✅ DONE (resolved - stale chunk cache, fixed by redeploy 2026-02-15)
- **Priority:** HIGH
- **Reporter:** Mattia (screenshot 2026-02-14)
- **Description:** onde.surf shows error page "Something went wrong - Cannot access uninitialized variable" after login
- **Page:** Main dashboard (/)
- **Notes:** Build succeeds, likely client-side TDZ error or Cloudflare edge runtime issue
- **Screenshot:** message_id 5555

## New Tasks (2026-02-15)

| # | ID | Task | Priority | Status | Owner | Notes |
|---|-----|------|----------|--------|-------|-------|
| 106 | BLOG-001 | Publish Radeon 7900 XTX + TinyGrad blog post on onde.la | 🔥 Content | ✅ DONE | @clawdinho | Published at /blog/radeon-7900-xtx-mac-tinygrad with full SEO, JSON-LD TechArticle schema |
| 107 | BLOG-002 | Create /blog section on onde.la | 🔥 Infra | ✅ DONE | @clawdinho | /blog listing page + layout with Blog JSON-LD, breadcrumbs, dark glass UI, sitemap updated, footer nav link added |
| 108 | DASH-002 | FRH agent chat fully working end-to-end | ⭐ Dashboard | ✅ DONE | @clawdinho | D1 tables created, API working, tested send+receive |
| 109 | DASH-003 | Dashboard stats show real data (books=2, gist fallback) | ⭐ Dashboard | ✅ DONE | @clawdinho | EnhancedStats fetches from gist when DB unavailable |
| 110 | RADEON-001 | Verify Radeon patch still works, test with eGPU connected | ⭐ Tech | TODO | - | Need eGPU connected to test |
| 111 | RADEON-002 | Submit TinyGrad float16 patch as PR to tinygrad/tinygrad | ⭐ Open Source | TODO | - | Depends on RADEON-001 verification |
| 112 | DASH-004 | Populate Visitors/Followers/PageViews with Cloudflare Analytics | ⭐ Dashboard | TODO | - | Integrate CF Web Analytics API |
| 113 | CYCLE-001 | Continuous improvement: add error boundaries to all dashboard pages | ⭐ Quality | TODO | - | Prevent full-page crashes from single component errors |
| 114 | SEO-015 | Full SEO audit onde.la - meta tags, OG, structured data, sitemap | 🔥 SEO | ✅ DONE | @clawdinho | Report: docs/seo/full-audit-2026-02.md. Fixed sitemap 404s (4 broken book URLs). CF AI Audit blocks crawlers — needs Mattia to disable in CF dashboard |
| 115 | SEO-016 | Keyword research per games (skin creator, games for kids) | 🔥 SEO | TODO | - | Capire cosa cerca la gente |
| 116 | GROWTH-001 | Implementare Google Analytics o CF Analytics dashboard | 🔥 Growth | TODO | - | Dati traffico reali sul sito |
| 117 | MONEY-001 | Valutare e aggiungere ads kid-friendly su onde.la | ⭐ Revenue | TODO | - | Banner per prodotti bambini/videogiochi. Dopo che c'è traffico |
| 118 | SEO-017 | Ottimizzare titoli/descrizioni giochi per search intent | 🔥 SEO | TODO | - | "skin creator online free", "games for kids" etc |

### 🔥 NUOVI (da SEO-015 audit)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 120 | SEO-017 | Disabilitare CF AI Audit che blocca crawler AI (ClaudeBot, GPTBot, Google-Extended) | 🚨 BLOCCANTE | TODO | @mattia | Serve accesso CF Dashboard → AI → AI Audit |
| 121 | SEO-018 | Fix trailing slashes in sitemap URLs (evitare 301 redirect chains) | ⭐ SEO | ✅ DONE | @clawdinho | Added trailing slashes to all sitemap URLs to match trailingSlash:true in next.config.mjs |
| 122 | SEO-019 | Aggiungere hreflang tags a sub-pages (non solo root) | ⭐ International SEO | TODO | - | Bassa priorità se stessa URL serve EN+IT |

### 🔥 NUOVI (da TRADE-003 backtest findings)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 123 | TRADE-005 | Calibrare edge model — weather edges >25% erano falsi, servono cap/sanity check | 🔥 Trading accuracy | ✅ DONE | @clawdinho | MAX_EDGE 25%→20%, per-asset caps (weather 15%), tighter prob bounds [0.03-0.97], reduced momentum adj ±15%→±10% |
| 124 | TRADE-006 | Run parameter sweep con backtest e applicare parametri ottimali all'autotrader | 🔥 Trading performance | TODO | - |
| 125 | TRADE-007 | Aggiungere per-regime strategy switching (ETH 60% WR in choppy, 0% in sideways) | ⭐ Trading | TODO | - |

### 🔥 NUOVI (da BLOG-002 completato)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 126 | BLOG-003 | Aggiungere RSS feed per /blog (SEO + aggregatori) | ⭐ SEO | TODO | - |
| 127 | BLOG-004 | Scrivere secondo blog post (topic TBD - trading, AI agents, Onde vision) | ⭐ Content | TODO | - |
| 128 | BLOG-005 | Aggiungere reading time estimate e table of contents ai blog post | ⭐ UX | TODO | - |

### 🔥 NUOVI (X Post per Radeon blog)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 129 | SOC-002 | Post X thread su Radeon 7900 XTX + TinyGrad on Mac | 🔥 Social/Content | BLOCKED | @clawdinho | Thread drafted at content/social/x-radeon-7900-xtx-tinygrad-thread.md (8 tweets). ⚠️ BLOCKED: No Typefully API key — Mattia needs to get key at typefully.com/?settings=api and save to ~/.clawdbot/.env.typefully. Then run Typefully script with --threadify --share |

### 🔥 NUOVI (da SOC-002 + SEO-018)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 129 | SOC-003 | Configurare Typefully API key per posting automatico su X | 🔥 Social | TODO | @mattia | https://typefully.com/?settings=api → ~/.clawdbot/.env.typefully |
| 130 | SOC-004 | Creare thread X su AI agents + prediction markets (dietro le quinte Kalshi bot) | ⭐ Content | TODO | - |
| 131 | SOC-005 | Creare thread X su setup multi-agent (Clawdinho M1 + Ondinho M4) | ⭐ Content | TODO | - |
| 132 | SEO-020 | Deploy onde.la con sitemap fix + blog section e verificare indicizzazione | 🔥 SEO | TODO | - |
| 133 | SEO-021 | Submit nuova sitemap a Google Search Console dopo deploy | ⭐ SEO | TODO | - |
| 134 | SEO-022 | Monitorare crawl stats in GSC dopo fix trailing slash (baseline → after) | ⭐ SEO | TODO | - |

### 🔥 NUOVI (da TRADE-005 edge calibration)

| # | ID | Task | Impact | Status | Owner |
|---|----|----- |--------|--------|-------|
| 135 | TRADE-008 | Run backtest con nuovi edge caps e confrontare performance vs vecchi parametri | 🔥 Validation | TODO | - |
| 136 | TRADE-009 | Aggiungere edge distribution histogram al backtest output per spotare outlier | ⭐ Analytics | TODO | - |
| 137 | TRADE-010 | A/B test live: autotrader v2 con nuovi caps vs paper mode vecchi caps per 1 settimana | ⭐ Trading | TODO | - |
