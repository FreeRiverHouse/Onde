# 📊 Cloudflare Web Analytics Tools

## Setup

onde.la uses **Cloudflare Web Analytics** (privacy-friendly, no cookies, GDPR-compliant).

- **Site tag:** `55503cb624cd432ab85d4d7f8cef5261`
- **Beacon token:** `35cd27ca219f44dfa20ff97debd2a8a0`
- **Auto-install:** enabled via CF (edge injection)
- **Next.js backup:** via `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` env var

## Fetching Analytics

```bash
# Default: last 30 days
./tools/analytics/fetch-cf-analytics.sh

# Custom period
./tools/analytics/fetch-cf-analytics.sh --days 7
./tools/analytics/fetch-cf-analytics.sh --days 90
```

Output goes to:
- `data/analytics/cf-analytics-latest.json` — always the latest run
- `data/analytics/cf-analytics-YYYY-MM-DD.json` — dated snapshot

## What's Tracked

| Metric | Source |
|--------|--------|
| Total page views | 7d + 30d totals |
| Daily breakdown | Per-day view counts |
| Top pages | By request path |
| Top referrers | By referrer host |
| Device type | mobile / desktop / tablet |
| Browser | Chrome, Safari, Firefox, etc. |
| Country | Geographic breakdown |
| OS | iOS, Android, macOS, Windows |

## API Details

Uses CF GraphQL API at `https://api.cloudflare.com/client/v4/graphql`.
Dataset: `rumPageloadEventsAdaptiveGroups` (Web Analytics / RUM).

## Notes

- CF Web Analytics only tracks page loads (not SPAs/client-side nav by default)
- The beacon script handles SPA routing via history API listener
- Data retention: ~6 months on CF free plan
- No PII is collected — fully privacy-friendly
