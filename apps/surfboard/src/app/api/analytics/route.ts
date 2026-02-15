import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Cloudflare Web Analytics config (same as tools/analytics/fetch-cf-analytics.sh)
const CF_ACCOUNT_ID = '91ddd4ffd23fb9da94bb8c2a99225a3f'
const CF_API_TOKEN = 'RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw'
const CF_SITE_TAG = '55503cb624cd432ab85d4d7f8cef5261'
const CF_GQL = 'https://api.cloudflare.com/client/v4/graphql'

// Cache analytics for 10 minutes to avoid hammering CF API
let cachedData: AnalyticsResponse | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 min

interface AnalyticsResponse {
  summary: {
    pageViews7d: number
    pageViews30d: number
  }
  daily: { date: string; views: number }[]
  topPages: { path: string; views: number }[]
  topReferrers: { referrer: string; views: number }[]
  devices: { type: string; views: number }[]
  browsers: { browser: string; views: number }[]
  countries: { country: string; views: number }[]
  operatingSystems: { os: string; views: number }[]
  meta: {
    generated: string
    period: { start: string; end: string; days: number }
  }
}

async function gql(query: string): Promise<unknown> {
  const res = await fetch(CF_GQL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    throw new Error(`CF GraphQL error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function dateStr(daysAgo: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function acct(obj: any) {
  return obj?.data?.viewer?.accounts?.[0] || {}
}

async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const today = dateStr(0)
  const start30d = dateStr(30)
  const start7d = dateStr(7)

  const filter30d = `AND: [{datetime_geq: "${start30d}T00:00:00Z", datetime_leq: "${today}T23:59:59Z"}, {siteTag: "${CF_SITE_TAG}"}]`
  const filter7d = `AND: [{datetime_geq: "${start7d}T00:00:00Z", datetime_leq: "${today}T23:59:59Z"}, {siteTag: "${CF_SITE_TAG}"}]`

  // Run all queries in parallel for speed
  const [totalsRaw, dailyRaw, topPagesRaw, referrersRaw, devicesRaw, browsersRaw, countriesRaw, osRaw] = await Promise.all([
    // 1. Total page views (7d + 30d)
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { total30d: rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 1) { count } total7d: rumPageloadEventsAdaptiveGroups(filter: {${filter7d}}, limit: 1) { count } } } }`),
    // 2. Daily breakdown (30d)
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 60, orderBy: [date_ASC]) { count dimensions { date } } } } }`),
    // 3. Top pages
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 25, orderBy: [count_DESC]) { count dimensions { requestPath } } } } }`),
    // 4. Referrers
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 25, orderBy: [count_DESC]) { count dimensions { refererHost } } } } }`),
    // 5. Devices
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 10, orderBy: [count_DESC]) { count dimensions { deviceType } } } } }`),
    // 6. Browsers
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 10, orderBy: [count_DESC]) { count dimensions { userAgentBrowser } } } } }`),
    // 7. Countries
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 30, orderBy: [count_DESC]) { count dimensions { countryName } } } } }`),
    // 8. OS
    gql(`query { viewer { accounts(filter: {accountTag: "${CF_ACCOUNT_ID}"}) { rumPageloadEventsAdaptiveGroups(filter: {${filter30d}}, limit: 10, orderBy: [count_DESC]) { count dimensions { userAgentOS } } } } }`),
  ])

  const totals = acct(totalsRaw)
  const daily = acct(dailyRaw)
  const pages = acct(topPagesRaw)
  const refs = acct(referrersRaw)
  const devs = acct(devicesRaw)
  const browsers = acct(browsersRaw)
  const countries = acct(countriesRaw)
  const os = acct(osRaw)

  return {
    summary: {
      pageViews30d: totals.total30d?.[0]?.count || 0,
      pageViews7d: totals.total7d?.[0]?.count || 0,
    },
    daily: (daily.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.date)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ date: r.dimensions.date, views: r.count })),
    topPages: (pages.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.requestPath)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ path: r.dimensions.requestPath, views: r.count })),
    topReferrers: (refs.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.refererHost)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ referrer: r.dimensions.refererHost, views: r.count })),
    devices: (devs.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.deviceType)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ type: r.dimensions.deviceType, views: r.count })),
    browsers: (browsers.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.userAgentBrowser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ browser: r.dimensions.userAgentBrowser, views: r.count })),
    countries: (countries.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.countryName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ country: r.dimensions.countryName, views: r.count })),
    operatingSystems: (os.rumPageloadEventsAdaptiveGroups || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.dimensions?.userAgentOS)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({ os: r.dimensions.userAgentOS, views: r.count })),
    meta: {
      generated: new Date().toISOString(),
      period: { start: start30d, end: today, days: 30 },
    },
  }
}

export async function GET() {
  try {
    // Check cache
    const now = Date.now()
    if (cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=600' },
      })
    }

    const data = await fetchAnalytics()

    // Update cache
    cachedData = data
    cacheTimestamp = now

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=600' },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: String(error) },
      { status: 500 }
    )
  }
}
