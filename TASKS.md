# TASKS.md - Lista Task Condivisa

> **Regola:** Un task alla volta. Lock → Work → Done → Next.
> **Priorità:** Ordinati per impatto sulla crescita del sito onde.la

---

## 🚀 TOP 30 TASK DA FARE (Ordinati per Impatto Crescita)

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
| 8 | GAM-002 | Skin Creator: Test su vari device mobile | ⭐ Quality assurance | 🔶 CHECKLIST READY | @clawdinho | docs/testing/skin-creator-mobile-test.md |
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

*Ultimo aggiornamento: 2026-02-03 01:30 PST*
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
| 47 | CONTENT-001 | Add 3 more books to catalog | 📚 Content | TODO | - |
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
| 49 | SEO-004 | Add FAQ schema to homepage | ⭐ SEO | ✅ DONE | @clawdinho | 4 FAQs in JSON-LD |
| 45 | PERF-003 | Lighthouse audit e ottimizzazioni | ⚡ Performance | ✅ DONE | @clawdinho | Checklist: docs/performance/lighthouse-checklist.md |
| 46 | EMAIL-001 | Setup newsletter signup form | 📧 Retention | ✅ DONE | @clawdinho | NewsletterSignup component (3 variants) |
