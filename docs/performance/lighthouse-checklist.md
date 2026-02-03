# Lighthouse Performance Checklist

## 🔗 Run Audit
https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fonde.la

## ✅ Already Optimized

### Performance
- [x] Next.js Image component (automatic optimization)
- [x] Static generation (SSG)
- [x] Font preloading (Playfair Display)
- [x] Code splitting (automatic)
- [x] Asset caching headers in `_headers`

### Accessibility
- [x] Skip links for keyboard navigation
- [x] Semantic HTML structure
- [x] Alt text on images
- [x] Color contrast (teal theme)
- [x] Focus indicators

### SEO
- [x] Meta title/description
- [x] Open Graph tags
- [x] Twitter cards
- [x] Canonical URLs
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Structured data (JSON-LD)

### Best Practices
- [x] HTTPS
- [x] Security headers (X-Content-Type-Options, etc.)
- [x] No console errors

## 🔧 Potential Improvements

### Performance
- [ ] Reduce JavaScript bundle size
- [ ] Lazy load below-fold components
- [ ] Optimize LCP (Largest Contentful Paint)
- [ ] Reduce CLS (Cumulative Layout Shift)

### Accessibility
- [ ] Test with screen reader
- [ ] Verify all interactive elements are focusable
- [ ] Check heading hierarchy

### PWA
- [ ] Service worker for offline support
- [ ] Add to homescreen prompt

## 📊 Target Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## 🛠️ Tools
- Chrome DevTools Lighthouse
- PageSpeed Insights
- WebPageTest.org
- GTmetrix

---

*Run audit monthly to track improvements*
