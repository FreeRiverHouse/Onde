"use client"

import { useEffect, useState } from 'react'
import { StatsCard } from './StatsCard'
import type { DashboardStats } from '@/lib/data'

interface EnhancedStatsProps {
  stats?: DashboardStats
}

interface CFAnalytics {
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

interface MetricsData {
  publishing: {
    booksPublished: number | null
    audiobooks: number | null
    podcasts: number | null
    videos: number | null
    history: { date: string; value: number }[]
  }
  social: {
    xFollowers: number | null
    igFollowers: number | null
    tiktokFollowers: number | null
    youtubeSubscribers: number | null
    postsThisWeek: number | null
  }
  analytics: {
    pageviews: number | null
    visitors7d: number | null
    users: number | null
    sessions: number | null
    bounceRate: number | null
    history: { date: string; value: number }[]
  }
  hasData: boolean
  lastUpdated: string | null
}

export function EnhancedStats({ stats: _stats }: EnhancedStatsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [cfAnalytics, setCfAnalytics] = useState<CFAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      // Fetch CF analytics directly (primary source for analytics data)
      const cfPromise = fetch('/api/analytics')
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)

      // Fetch other metrics from /api/metrics (publishing, social)
      const metricsPromise = fetch('/api/metrics')
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)

      const [cfData, metricsData] = await Promise.all([cfPromise, metricsPromise])

      if (cfData && cfData.summary) {
        setCfAnalytics(cfData as CFAnalytics)
      }

      // Build metrics - merge CF analytics into metrics format
      const base: MetricsData = metricsData?.hasData ? metricsData : {
        publishing: {
          booksPublished: 2,
          audiobooks: 0,
          podcasts: 0,
          videos: 2,
          history: []
        },
        social: {
          xFollowers: null,
          igFollowers: null,
          tiktokFollowers: null,
          youtubeSubscribers: null,
          postsThisWeek: null
        },
        analytics: {
          pageviews: null,
          visitors7d: null,
          users: null,
          sessions: null,
          bounceRate: null,
          history: []
        },
        lastUpdated: new Date().toISOString(),
        hasData: true
      }

      // Overlay real CF analytics data
      if (cfData?.summary) {
        base.analytics = {
          ...base.analytics,
          pageviews: cfData.summary.pageViews30d,
          visitors7d: cfData.summary.pageViews7d,
          users: cfData.summary.pageViews7d, // visitors ≈ pageviews for CF Web Analytics
          sessions: cfData.summary.pageViews30d,
          history: (cfData.daily || []).map((d: { date: string; views: number }) => ({
            date: d.date,
            value: d.views
          }))
        }
        base.lastUpdated = cfData.meta?.generated || new Date().toISOString()
        base.hasData = true
      }

      setMetrics(base)
    }

    fetchAll().finally(() => setLoading(false))
  }, [])

  const noData = !metrics?.hasData

  // Daily views history for sparklines
  const dailyViews = cfAnalytics?.daily?.map(d => d.views) || metrics?.analytics?.history?.map(h => h.value) || []
  // Use last 14 days for sparkline
  const sparklineData = dailyViews.slice(-14)
  const booksHistory = metrics?.publishing?.history?.map(h => h.value) || []

  // Calculate avg daily visitors from last 7 days
  const last7dViews = cfAnalytics?.daily?.slice(-7) || []
  const avgDailyVisitors = last7dViews.length > 0
    ? Math.round(last7dViews.reduce((s, d) => s + d.views, 0) / last7dViews.length)
    : null

  // Total 30d pageviews
  const totalPageviews = cfAnalytics?.summary?.pageViews30d ?? metrics?.analytics?.pageviews ?? null

  // Device breakdown for subtitle
  const deviceBreakdown = cfAnalytics?.devices
    ?.map(d => `${d.type}: ${Math.round(d.views / (cfAnalytics?.summary?.pageViews30d || 1) * 100)}%`)
    .join(' · ') || undefined

  // Top country
  const topCountry = cfAnalytics?.countries?.[0]
  const topCountryStr = topCountry
    ? `Top: ${topCountry.country} (${Math.round(topCountry.views / (cfAnalytics?.summary?.pageViews30d || 1) * 100)}%)`
    : undefined

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <StatsCard
        title="Books Published"
        value={metrics?.publishing?.booksPublished ?? null}
        sparklineData={booksHistory.length > 0 ? booksHistory : undefined}
        chartType="bars"
        color="cyan"
        trend={booksHistory.length > 1 ? "up" : undefined}
        loading={loading}
        noData={noData || metrics?.publishing?.booksPublished === null}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      />

      <StatsCard
        title="Daily Visitors"
        value={avgDailyVisitors}
        sparklineData={sparklineData.length > 0 ? sparklineData : undefined}
        chartType="sparkline"
        color="emerald"
        loading={loading}
        noData={noData || avgDailyVisitors === null}
        subtitle="avg/day (last 7d)"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />

      <StatsCard
        title="Top Traffic"
        value={cfAnalytics?.summary?.pageViews7d ?? null}
        chartType="none"
        color="amber"
        loading={loading}
        noData={noData || !cfAnalytics}
        subtitle={topCountryStr || deviceBreakdown || "last 7 days"}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <StatsCard
        title="Page Views"
        value={totalPageviews}
        sparklineData={sparklineData.length > 0 ? sparklineData : undefined}
        chartType="bars"
        color="purple"
        loading={loading}
        noData={noData || totalPageviews === null}
        subtitle={deviceBreakdown || "last 30 days"}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  )
}

// Weekly comparison stats
interface WeeklyComparisonProps {
  stats?: DashboardStats
}

export function WeeklyComparison({ stats: _stats }: WeeklyComparisonProps) {
  const [cfAnalytics, setCfAnalytics] = useState<CFAnalytics | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [cfRes, metricsRes] = await Promise.all([
        fetch('/api/analytics').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/metrics').then(r => r.ok ? r.json() : null).catch(() => null),
      ])
      if (cfRes?.summary) setCfAnalytics(cfRes)
      if (metricsRes) setMetrics(metricsRes)
    }
    fetchData().finally(() => setLoading(false))
  }, [])

  const hasData = !!cfAnalytics || metrics?.hasData

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Weekly Progress</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-white/10 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Weekly Progress</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-white/40 text-sm">No historical data yet</p>
          <p className="text-white/30 text-xs mt-1">Metrics will appear once data is collected</p>
        </div>
      </div>
    )
  }

  // Compute weekly change from daily data
  const daily = cfAnalytics?.daily || []
  const thisWeek = daily.slice(-7)
  const lastWeek = daily.slice(-14, -7)
  const thisWeekTotal = thisWeek.reduce((s, d) => s + d.views, 0)
  const lastWeekTotal = lastWeek.reduce((s, d) => s + d.views, 0)
  const weeklyChange = lastWeekTotal > 0 ? thisWeekTotal - lastWeekTotal : null

  // Top pages this period
  const topPages = cfAnalytics?.topPages?.slice(0, 3) || []

  // Device split
  const devices = cfAnalytics?.devices || []
  const totalDeviceViews = devices.reduce((s, d) => s + d.views, 0)

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Weekly Progress</h3>
        <span className="text-xs text-white/40">vs last week</span>
      </div>

      <div className="space-y-3">
        <MetricRow 
          label="Page Views (7d)" 
          value={cfAnalytics?.summary?.pageViews7d ?? null}
          change={weeklyChange}
        />
        <MetricRow 
          label="Page Views (30d)" 
          value={cfAnalytics?.summary?.pageViews30d ?? metrics?.analytics?.pageviews ?? null}
        />
        <MetricRow 
          label="Books Published" 
          value={metrics?.publishing?.booksPublished ?? 2} 
        />
      </div>

      {/* Top Pages */}
      {topPages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-white/40 mb-2">Top Pages (30d)</div>
          <div className="space-y-1.5">
            {topPages.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-white/60 truncate max-w-[180px]" title={p.path}>{p.path}</span>
                <span className="text-xs font-medium text-white/80">{p.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device breakdown */}
      {devices.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-white/40 mb-2">Devices</div>
          <div className="flex gap-2">
            {devices.map((d, i) => {
              const pct = totalDeviceViews > 0 ? Math.round(d.views / totalDeviceViews * 100) : 0
              const emoji = d.type === 'mobile' ? '📱' : d.type === 'desktop' ? '🖥️' : '📟'
              return (
                <div key={i} className="flex items-center gap-1 text-xs text-white/50">
                  <span>{emoji}</span>
                  <span>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Last updated */}
      {cfAnalytics?.meta?.generated && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-white/30">
            Last updated: {new Date(cfAnalytics.meta.generated).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricRow({ 
  label, 
  value, 
  change 
}: { 
  label: string
  value: number | null | undefined
  change?: number | null
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        {value !== null && value !== undefined ? (
          <>
            <span className="text-sm font-medium text-white">{value.toLocaleString()}</span>
            {change !== null && change !== undefined && (
              <span className={`text-xs ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-white/30">—</span>
        )}
      </div>
    </div>
  )
}
