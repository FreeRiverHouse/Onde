# Full SEO Audit — onde.la
**Date:** 2026-02-15  
**Auditor:** @clawdinho (automated)  
**Task:** SEO-015

---

## Executive Summary

Overall SEO health is **GOOD** for a site this age. Strong structured data, complete OG/Twitter tags on all key pages, and good sitemap coverage. The main issues found are:

1. **🔴 CRITICAL: Cloudflare AI Audit overrides robots.txt** — blocking ClaudeBot, GPTBot, CCBot, Google-Extended
2. **🔴 CRITICAL: 4 book URLs in sitemap return 404** (wrong slugs)
3. **🟡 MEDIUM: Sitemap URLs lack trailing slashes** → cause 301/308 redirect chains
4. **🟡 MEDIUM: Duplicate viewport meta tag** on every page
5. **🟢 LOW: Sub-pages missing hreflang tags** (only root has them)

---

## 1. Meta Tags Audit

### Homepage (`/`)
| Tag | Status | Value |
|-----|--------|-------|
| `<title>` | ✅ | "Onde - AI-Native Publishing House" |
| `meta description` | ✅ | "AI-native publishing house based in Los Angeles..." |
| `meta keywords` | ✅ | illustrated books, classic literature, etc. |
| `meta robots` | ✅ (default) | Not explicitly set — defaults to index,follow |
| `meta viewport` | ⚠️ DUPLICATE | Two viewport tags: custom (max-scale=5) + Next.js auto |

### Games Page (`/games/`)
| Tag | Status | Value |
|-----|--------|-------|
| `<title>` | ✅ | "Onde Arcade - Educational Games for Kids \| Onde" |
| `meta description` | ✅ | "Fun educational games for kids!..." |
| `meta keywords` | ✅ | educational games for kids, learning games, etc. |
| `meta robots` | ✅ | "index, follow" |

### Skin Creator (`/games/skin-creator/`)
| Tag | Status | Value |
|-----|--------|-------|
| `<title>` | ✅ ⭐ | "Free Minecraft Skin Creator Online - Make Custom Skins \| Skin Creator" |
| `meta description` | ✅ ⭐ | Keyword-rich, mentions Java & Bedrock, "no download" |
| `meta keywords` | ✅ ⭐ | 13 long-tail keywords including "minecraft skin creator free" |
| `meta robots` | ✅ | "index, follow" |

### Books Page (`/libri/`)
| Tag | Status | Value |
|-----|--------|-------|
| `<title>` | ✅ | "Libri \| Onde - Free Illustrated Books" |
| `meta description` | ✅ | "Download free illustrated editions of classic literature..." |
| `meta keywords` | ✅ | free ebooks, illustrated books, etc. |

### About (`/about/`)
| Tag | Status | Value |
|-----|--------|-------|
| All tags | ✅ | Present, uses root layout defaults |

---

## 2. Open Graph & Twitter Cards

### All key pages audited:

| Page | OG Title | OG Image | OG URL | Twitter Card | Twitter Image |
|------|----------|----------|--------|-------------|---------------|
| `/` | ✅ | ✅ `/images/og-onde.png` (200 OK) | ✅ `https://onde.la/` | ✅ summary_large_image | ✅ |
| `/libri/` | ✅ | ✅ `/images/og-libri.png` (200 OK) | ✅ | ✅ | ✅ |
| `/games/` | ✅ | ✅ `/images/og-games.png` (200 OK) | ✅ | ✅ | ✅ |
| `/games/skin-creator/` | ✅ | ✅ `/images/og-skin-creator.png` (200 OK) | ✅ | ✅ | ✅ |

**OG Image dimensions:** All 1200×630 ✅  
**Twitter creator:** @Onde_FRH on all pages ✅  
**og:site_name:** "Onde" on all pages ✅  
**og:locale:** en_US on all pages ✅  
**og:type:** website on all pages ✅  

---

## 3. Structured Data (JSON-LD)

### Root Layout (all pages)
- ✅ **Organization** (`@id: https://onde.la/#organization`)
  - name, url, logo, description, sameAs (Twitter, YouTube)
- ✅ **WebSite** (`@id: https://onde.la/#website`)
  - SearchAction with `urlTemplate`
  - `inLanguage: ['en', 'it']`
- ✅ **FAQPage** (`@id: https://onde.la/#faq`)
  - 4 questions/answers about books, formats, skin creator, accounts

### Games Layout (`/games/*`)
- ✅ **BreadcrumbList** — Home → Games
- ✅ **CollectionPage** with 44 **VideoGame** entries
  - Each game has: name, description, url, genre, audience (suggestedMinAge)

### Skin Creator (`/games/skin-creator/`)
- ✅ **VideoGame** — name, description, url, genre, gamePlatform, offers (free), publisher

### Books Page (`/libri/`)
- ✅ **BreadcrumbList** — Home → Libri
- ✅ **CollectionPage** with **ItemList** of **Book** entries
  - Each book: name, author, genre, image, bookFormat, offers (free)

### Assessment
Structured data is **excellent**. All major schema types are present. Google Rich Results should work for FAQ, Breadcrumbs, Games, and Books.

---

## 4. Sitemap Analysis

### File: `sitemap.xml` (generated from `src/app/sitemap.ts`)
- **Total URLs:** ~85+
- **Format:** Valid XML sitemap ✅

### Issues Found

#### 🔴 Broken URLs (404):
| Sitemap URL | HTTP Status | Correct URL |
|-------------|-------------|-------------|
| `/libro/meditations` | 404 | `/libro/meditations-en` |
| `/libro/grimm-fairy-tales-en` | 404 | ❌ Not built (dynamic route, no static page) |
| `/libro/wizard-of-oz-en` | 404 | ❌ Not built |
| `/libro/andersen-fairy-tales-en` | 404 | ❌ Not built |

**FIX APPLIED:** Removed non-existent book slugs, corrected `meditations` → `meditations-en`, added `meditations-it`.

#### 🟡 Missing Trailing Slashes:
All sitemap URLs are listed **without** trailing slashes (e.g., `https://onde.la/libri`) but the Cloudflare/Vercel server redirects them with 301/308 to `/libri/`. This wastes a crawl and adds latency.

**Recommendation:** Add trailing slashes to all sitemap URLs, or configure `trailingSlash: true` in `next.config.mjs`.

#### Missing from Sitemap:
- `/libro/meditations-it` (Italian edition)
- `/libro/meditations-btc` (BTC purchase page)
- `/games/skin-creator/gallery` (gallery sub-page)

**FIX APPLIED:** Added `meditations-it` to sitemap.

---

## 5. Canonical URLs

| Page | Canonical | Status |
|------|-----------|--------|
| `/` | `https://onde.la/` | ✅ |
| `/libri/` | `https://onde.la/libri/` | ✅ |
| `/games/` | `https://onde.la/games/arcade/` | ⚠️ Points to `/arcade/` not `/games/` — intentional? (games page renders as arcade) |
| `/games/skin-creator/` | `https://onde.la/games/skin-creator/` | ✅ |

Canonical URLs are properly set with trailing slashes, matching the server's preferred URL format. ✅

---

## 6. Hreflang Tags

| Page | en | it | x-default | Status |
|------|----|----|-----------|--------|
| `/` | ✅ `https://onde.la/` | ✅ `https://onde.la/` | ✅ `https://onde.la/` | Complete |
| `/libri/` | ❌ | ❌ | ❌ | Missing |
| `/games/` | ❌ | ❌ | ❌ | Missing |
| `/games/skin-creator/` | ❌ | ❌ | ❌ | Missing |

**Issue:** Only the root layout defines hreflang via `alternates.languages`. Sub-page layouts override the alternates without including languages.

**Impact:** Low — since the site doesn't have separate language URLs (both en and it resolve to the same URL), hreflang signals are less critical. But for consistency, sub-pages should inherit or define their own.

---

## 7. Robots.txt

### 🔴 CRITICAL: Cloudflare AI Audit Override

The live `robots.txt` at `https://onde.la/robots.txt` contains **TWO conflicting sections**:

1. **Cloudflare Managed (injected by CF AI Audit feature):**
   ```
   User-agent: ClaudeBot
   Disallow: /
   User-agent: GPTBot
   Disallow: /
   User-agent: CCBot
   Disallow: /
   User-agent: Google-Extended
   Disallow: /
   ```

2. **Onde's own rules (from `src/app/robots.ts`):**
   ```
   User-Agent: ClaudeBot
   Allow: /
   User-Agent: GPTBot
   Allow: /
   ```

**Problem:** Most well-behaved bots take the **first matching rule**. Cloudflare's `Disallow: /` comes FIRST, so AI crawlers are effectively blocked.

**Fix Required (Manual — needs Mattia):**
- Go to Cloudflare Dashboard → onde.la → AI → AI Audit → Toggle OFF "Block AI Crawlers"
- Or individually unblock desired crawlers in the CF AI Audit settings

**This is documented in `src/app/robots.ts` comments but has not been actioned yet.**

---

## 8. Additional Checks

### Security Headers ✅
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Access-Control-Allow-Origin: *`

### Performance Resources ✅
- Self-hosted Playfair Display font via `next/font`
- Font preload via `<link rel="preload">`
- `<link rel="prefetch">` for `/libri/` and `/games/`

### PWA ✅
- `manifest.json` → 200 OK
- `apple-mobile-web-app-capable: yes`

### RSS/Atom Feeds ✅
- `feed.xml` → 200 OK
- `feed.atom` → 200 OK

### AI Discoverability ✅
- `llms.txt` → 200 OK

### Duplicate Viewport ⚠️
Every page has TWO `<meta name="viewport">` tags:
1. Custom: `width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes`
2. Next.js auto: `width=device-width, initial-scale=1`

The second one (from Next.js) overrides the first, losing `maximum-scale=5.0` and `user-scalable=yes`. Should use Next.js `viewport` export instead.

---

## 9. Fixes Applied

| Fix | File | Description |
|-----|------|-------------|
| ✅ Sitemap 404 fix | `src/app/sitemap.ts` | Removed 3 non-existent book slugs (`grimm-fairy-tales-en`, `wizard-of-oz-en`, `andersen-fairy-tales-en`), corrected `meditations` → `meditations-en`, added `meditations-it` |

---

## 10. Action Items (Priority Order)

### 🔴 Must Do
1. **Disable Cloudflare AI Audit** — Mattia needs to toggle off in CF dashboard (AI > AI Audit)
2. **Deploy with fixed sitemap** — removes 404 entries that waste crawl budget
3. **Add trailing slashes to sitemap URLs** — or set `trailingSlash: true` in next.config.mjs to avoid redirect chains

### 🟡 Should Do
4. **Fix duplicate viewport** — use Next.js `viewport` export in layout.ts instead of manual `<meta>` tag
5. **Add hreflang to sub-page layouts** — or remove from root if site is truly single-language
6. **Re-submit sitemap to Google Search Console** — after fixing 404s

### 🟢 Nice to Have
7. **Add `lastModified` with real dates** — currently all pages show today's date
8. **Add priority differentiation** — skin-creator should be 0.9 (high-traffic target), individual games 0.5
9. **Add `meditations-btc` and `skin-creator/gallery` to sitemap**
10. **Consider adding individual OG images per game** — currently all games share `og-games.png`

---

## Summary Score

| Category | Score | Notes |
|----------|-------|-------|
| Meta Tags | 9/10 | Duplicate viewport is the only issue |
| OG/Twitter | 10/10 | Excellent — all key pages have custom OG images |
| Structured Data | 10/10 | FAQPage, VideoGame, Book, BreadcrumbList, Organization |
| Sitemap | 6/10 | 4 broken URLs, no trailing slashes, generic timestamps |
| Canonical URLs | 9/10 | Properly set on all pages |
| Hreflang | 6/10 | Only on root, missing on sub-pages |
| Robots.txt | 3/10 | CF overrides block AI crawlers (contradicts site's policy) |
| **Overall** | **7.5/10** | Good foundation, CF robots issue is the blocker |
