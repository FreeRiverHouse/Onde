import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const CF_ACCOUNT_ID = '91ddd4ffd23fb9da94bb8c2a99225a3f'
const CF_SITE_TAG = '55503cb624cd432ab85d4d7f8cef5261'
const CF_GQL = 'https://api.cloudflare.com/client/v4/graphql'

function getToken(request: NextRequest): string {
  // @ts-expect-error - Cloudflare context
  const env = (request as any).env || (globalThis as any).env || {}
  return env.CF_API_TOKEN || process.env.CF_API_TOKEN || ''
}

async function gql(token: string, query: string) {
  const res = await fetch(CF_GQL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return res.json()
}

// Metric key to display name mapping
const metricNames: Record<string, string> = {
  ga_pageviews: 'Page Views',
  ga_users: 'Unique Users',
  ga_sessions: 'Sessions',
  ga_bounce_rate: 'Bounce Rate',
  gsc_clicks: 'Search Clicks',
  gsc_impressions: 'Search Impressions',
  gsc_ctr: 'Search CTR',
  books_published: 'Books Published',
  videos_published: 'Videos Published',
  x_followers: 'X Followers',
  ig_followers: 'Instagram Followers',
  youtube_subscribers: 'YouTube Subscribers',
}

// GET /api/metrics/history?key=ga_pageviews&days=30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricKey = searchParams.get('key') || 'ga_pageviews'
    const days = parseInt(searchParams.get('days') || '30', 10)

    const token = getToken(request)
    if (!token) {
      return NextResponse.json({ error: 'CF_API_TOKEN not configured' }, { status: 500 })
    }

    // Only pageviews-related metrics have CF Web Analytics data
    const cfMetrics = ['ga_pageviews', 'ga_users', 'ga_sessions', 'ga_bounce_rate']
    
    if (!cfMetrics.includes(metricKey)) {
      // Return empty history for non-CF metrics
      return NextResponse.json({
        key: metricKey,
        displayName: metricNames[metricKey] || metricKey,
        currentValue: null,
        previousValue: null,
        change: null,
        changePercent: null,
        history: [],
        unit: null,
      })
    }

    const today = new Date().toISOString().slice(0, 10)
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    const filter = `AND: [{datetime_geq: "${startDate}T00:00:00Z", datetime_leq: "${today}T23:59:59Z"}, {siteTag: "${CF_SITE_TAG}"}]`

    const result = await gql(token, `query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter}}, limit: ${days + 5}, orderBy: [date_ASC]) { count dimensions { date } } } } }`)

    const acct = result?.data?.viewer?.accounts?.[0] || {}
    const daily = (acct.rumPageloadEventsAdaptiveGroups || []).map((r: any) => ({
      date: r.dimensions.date,
      value: r.count,
    }))

    const currentValue = daily.length > 0 ? daily.reduce((sum: number, d: any) => sum + d.value, 0) : null
    const midpoint = Math.floor(daily.length / 2)
    const recentHalf = daily.slice(midpoint).reduce((sum: number, d: any) => sum + d.value, 0)
    const olderHalf = daily.slice(0, midpoint).reduce((sum: number, d: any) => sum + d.value, 0)
    const change = olderHalf > 0 ? recentHalf - olderHalf : null
    const changePercent = olderHalf > 0 ? ((recentHalf - olderHalf) / olderHalf) * 100 : null

    return NextResponse.json({
      key: metricKey,
      displayName: metricNames[metricKey] || metricKey,
      currentValue,
      previousValue: olderHalf || null,
      change,
      changePercent,
      history: daily,
      unit: null,
    }, {
      headers: { 'Cache-Control': 'public, max-age=300' }
    })
  } catch (error) {
    console.error('Error fetching metric history:', error)
    return NextResponse.json({ error: 'Failed to fetch metric history' }, { status: 500 })
  }
}
