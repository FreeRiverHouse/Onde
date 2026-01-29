# Metrics System for onde.surf

## Overview

The metrics system tracks historical data points for trend monitoring across all Onde platforms.

## Features

1. **Real Data Only** - No hardcoded fake data. Shows "No data yet" when no data is available.
2. **Historical Trends** - Stores metrics with timestamps for trend visualization.
3. **Google Analytics Ready** - Integration points for GA4 and Search Console.
4. **Flexible Metric Types** - Publishing, social, analytics, search, revenue metrics.

## Database Schema

Run migration `0006_metrics_history.sql` to create:

- `metrics` - Individual data points with date and value
- `metric_definitions` - Describes each metric type
- `analytics_config` - Stores GA/GSC configuration

## API Endpoints

### GET /api/metrics
Returns current dashboard metrics from all categories.

### POST /api/metrics
Records new metrics. Body format:
```json
{
  "metrics": [
    { "key": "books_published", "value": 10, "source": "manual" }
  ]
}
```

### GET /api/metrics/history?key=ga_pageviews&days=30
Returns historical data for a specific metric.

## Setting Up Google Analytics

1. Create a GA4 property at https://analytics.google.com
2. Get your Measurement ID (G-XXXXXXX)
3. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable
4. (Optional) Set up Google Analytics Data API for fetching metrics server-side

### Environment Variables

```bash
# GA4 Measurement ID for tracking
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: API key for metrics recording
METRICS_API_KEY=your-secret-key

# Google credentials for fetching GA data (future)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GA4_PROPERTY_ID=123456789
```

## Collecting Metrics

Use the `scripts/collect-metrics.ts` script to collect and push metrics:

```bash
npx ts-node scripts/collect-metrics.ts
```

Set up as a cron job for automatic collection:
```cron
0 */6 * * * cd /path/to/Onde && npx ts-node scripts/collect-metrics.ts
```

## Pre-defined Metrics

### Publishing
- `books_published` - Total books on KDP
- `audiobooks_published` - Total audiobooks
- `podcasts_published` - Total podcast episodes
- `videos_published` - Total YouTube videos

### Social
- `x_followers` - Twitter/X followers
- `ig_followers` - Instagram followers
- `tiktok_followers` - TikTok followers
- `youtube_subscribers` - YouTube subscribers
- `posts_published` - Posts this week

### Analytics (from GA4)
- `ga_pageviews` - Daily pageviews
- `ga_users` - Daily unique users
- `ga_sessions` - Daily sessions
- `ga_bounce_rate` - Bounce rate %

### Search (from Google Search Console)
- `gsc_clicks` - Search clicks
- `gsc_impressions` - Search impressions
- `gsc_ctr` - Click-through rate
- `gsc_avg_position` - Average position

## UI Components

- **EnhancedStats** - Main stats cards with sparklines
- **WeeklyComparison** - Week-over-week comparisons
- **Analytics Page** - `/analytics` - Full historical view with charts

## Database Migration

To apply the migration manually:

```bash
cd apps/surfboard
npx wrangler d1 execute onde-surf-db --file=migrations/0006_metrics_history.sql --remote
```

Or through Cloudflare Dashboard:
1. Go to Workers & Pages > D1 > onde-surf-db
2. Click "Console"
3. Paste and run the SQL from the migration file
