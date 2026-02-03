# Performance Audit - onde.la

**Data:** 2026-02-03

## 📊 Raccomandazioni Core Web Vitals

### Ottimizzazioni Implementate
- ✅ OG images ottimizzate (1200x630 PNG)
- ✅ Lazy loading immagini libri
- ✅ Manifest.json per PWA
- ✅ RSS/Atom feeds

### TODO Ottimizzazioni
- [ ] Preload font critici (Helvetica/system fonts)
- [ ] Ottimizzare LCP con priority images
- [ ] Minimizzare CLS con aspect ratios espliciti
- [ ] Service Worker per caching assets
- [ ] Comprimere immagini con WebP/AVIF

### Strumenti per Test
```bash
# PageSpeed Insights (web)
https://pagespeed.web.dev/?url=https://onde.la

# Lighthouse CLI (se installato)
npx lighthouse https://onde.la --output html

# WebPageTest
https://www.webpagetest.org/
```

### Best Practices Implementate
- Server rendering (Next.js)
- Static generation per pagine libri
- CDN via Cloudflare
- HTTPS everywhere
- Responsive images

## Note
L'API PageSpeed ha quota limitata. Usare pagespeed.web.dev per test manuali.
