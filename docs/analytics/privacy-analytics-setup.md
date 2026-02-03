# Privacy-Friendly Analytics Setup

## 🎯 Recommended: Plausible Analytics

### Why Plausible?
- ✅ Privacy-focused (no cookies, GDPR compliant)
- ✅ Lightweight (<1KB script)
- ✅ Simple dashboard
- ✅ Self-hosted option available
- ✅ No personal data collection

### Setup Steps

#### Option 1: Plausible Cloud ($9/mo)
1. Sign up at https://plausible.io
2. Add site: `onde.la`
3. Get script tag
4. Add to `apps/onde-portal/src/app/layout.tsx`:

```tsx
// In <head>
<script 
  defer 
  data-domain="onde.la" 
  src="https://plausible.io/js/script.js"
/>
```

#### Option 2: Self-hosted (Free)
1. Deploy Plausible via Docker
2. Configure domain
3. Use same script with custom domain

### Alternative: Umami

If Plausible doesn't fit:
- https://umami.is
- Similar privacy focus
- Open source
- Self-hosted

## 📊 Key Metrics to Track

### Traffic
- Page views
- Unique visitors
- Bounce rate
- Session duration

### Sources
- Referrers (Reddit, Twitter, etc.)
- Search queries
- Direct traffic

### Content
- Top pages
- Entry pages
- Exit pages

### Goals (optional)
- Book downloads
- Skin creator usage
- Newsletter signups

## 🚀 Quick Start (No account needed)

For basic analytics without third-party:

```tsx
// Simple page view counter using localStorage
// Add to layout.tsx or a component

useEffect(() => {
  const views = JSON.parse(localStorage.getItem('page-views') || '{}')
  const path = window.location.pathname
  views[path] = (views[path] || 0) + 1
  localStorage.setItem('page-views', JSON.stringify(views))
}, [])
```

## 📋 Implementation Checklist

- [ ] Choose analytics provider
- [ ] Create account / setup self-hosted
- [ ] Add tracking script to layout
- [ ] Verify data collection
- [ ] Setup goals/events (optional)
- [ ] Share dashboard access

---

*Recommended: Start with Plausible Cloud free trial, then decide*
