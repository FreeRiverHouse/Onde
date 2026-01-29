'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { GradientText } from '@/components/ui/AnimatedText'

interface MetricPoint {
  date: string
  value: number
}

interface MetricWithHistory {
  key: string
  displayName: string
  currentValue: number | null
  previousValue: number | null
  change: number | null
  changePercent: number | null
  history: MetricPoint[]
  unit: string | null
}

interface MetricsData {
  publishing: {
    booksPublished: number | null
    audiobooks: number | null
    podcasts: number | null
    videos: number | null
    history: MetricPoint[]
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
    users: number | null
    sessions: number | null
    bounceRate: number | null
    history: MetricPoint[]
  }
  search: {
    clicks: number | null
    impressions: number | null
    ctr: number | null
    avgPosition: number | null
    history: MetricPoint[]
  }
  hasData: boolean
  lastUpdated: string | null
}

type TimeRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [selectedMetric, setSelectedMetric] = useState<string>('ga_pageviews')
  const [metricHistory, setMetricHistory] = useState<MetricWithHistory | null>(null)

  // Fetch main metrics
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/metrics')
        if (!response.ok) throw new Error('Failed to fetch metrics')
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  // Fetch specific metric history
  useEffect(() => {
    async function fetchHistory() {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      try {
        const response = await fetch(`/api/metrics/history?key=${selectedMetric}&days=${days}`)
        if (response.ok) {
          const data = await response.json()
          setMetricHistory(data)
        }
      } catch (err) {
        console.error('Failed to fetch metric history:', err)
      }
    }
    fetchHistory()
  }, [selectedMetric, timeRange])

  const hasData = metrics?.hasData ?? false

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <ScrollReveal animation="fade-up" duration={800}>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a 
              href="/" 
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              ← Back
            </a>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <GradientText 
              colors={['#ffffff', '#06b6d4', '#8b5cf6', '#06b6d4', '#ffffff']}
              speed={4}
            >
              Analytics & Trends
            </GradientText>
          </h1>
          <p className="text-white/40 max-w-xl">
            Historical metrics and performance trends across all platforms.
          </p>
        </div>
      </ScrollReveal>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-24 mb-4" />
              <div className="h-8 bg-white/10 rounded w-16 mb-4" />
              <div className="h-24 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <GlowCard variant="purple" className="p-8 text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Metrics</h3>
          <p className="text-white/60">{error}</p>
        </GlowCard>
      ) : !hasData ? (
        <GlowCard variant="cyan" className="p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
          <p className="text-white/60 max-w-md mx-auto mb-6">
            Historical metrics will appear here once data collection begins.
            Set up Google Analytics and configure your data sources to start tracking.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Google Analytics integration pending</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Search Console integration pending</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Social metrics collection pending</span>
            </div>
          </div>
        </GlowCard>
      ) : (
        <div className="space-y-8">
          {/* Main Chart */}
          <GlowCard variant="cyan" noPadding noTilt>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">{metricHistory?.displayName || 'Select a Metric'}</h3>
                  {metricHistory?.currentValue !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-cyan-400">
                        {metricHistory?.currentValue?.toLocaleString()}
                      </span>
                      {metricHistory?.changePercent !== null && (
                        <span className={`text-sm ${
                          (metricHistory?.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {(metricHistory?.changePercent ?? 0) >= 0 ? '+' : ''}
                          {metricHistory?.changePercent?.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white appearance-none cursor-pointer"
                >
                  <optgroup label="Analytics">
                    <option value="ga_pageviews">Page Views</option>
                    <option value="ga_users">Unique Users</option>
                    <option value="ga_sessions">Sessions</option>
                    <option value="ga_bounce_rate">Bounce Rate</option>
                  </optgroup>
                  <optgroup label="Search">
                    <option value="gsc_clicks">Search Clicks</option>
                    <option value="gsc_impressions">Search Impressions</option>
                    <option value="gsc_ctr">Search CTR</option>
                  </optgroup>
                  <optgroup label="Publishing">
                    <option value="books_published">Books Published</option>
                    <option value="videos_published">Videos Published</option>
                  </optgroup>
                  <optgroup label="Social">
                    <option value="x_followers">X Followers</option>
                    <option value="ig_followers">Instagram Followers</option>
                    <option value="youtube_subscribers">YouTube Subscribers</option>
                  </optgroup>
                </select>
              </div>
              
              {/* Chart Area */}
              <div className="h-64 flex items-center justify-center border border-white/5 rounded-lg bg-white/[0.02]">
                {metricHistory?.history && metricHistory.history.length > 0 ? (
                  <SimpleLineChart data={metricHistory.history} />
                ) : (
                  <div className="text-center text-white/40">
                    <div className="text-3xl mb-2">📈</div>
                    <p>No historical data for this metric yet</p>
                  </div>
                )}
              </div>
            </div>
          </GlowCard>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Page Views"
              value={metrics?.analytics?.pageviews}
              subtitle="Today"
              icon="👁️"
              color="cyan"
            />
            <MetricCard
              title="Unique Users"
              value={metrics?.analytics?.users}
              subtitle="Today"
              icon="👤"
              color="emerald"
            />
            <MetricCard
              title="Search Clicks"
              value={metrics?.search?.clicks}
              subtitle="This week"
              icon="🔍"
              color="purple"
            />
            <MetricCard
              title="Search Impressions"
              value={metrics?.search?.impressions}
              subtitle="This week"
              icon="📊"
              color="amber"
            />
          </div>

          {/* Category Breakdowns */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Publishing */}
            <GlowCard variant="cyan" noPadding noTilt>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📚</span>
                  Publishing
                </h3>
                <div className="space-y-3">
                  <MetricRow label="Books" value={metrics?.publishing?.booksPublished} />
                  <MetricRow label="Audiobooks" value={metrics?.publishing?.audiobooks} />
                  <MetricRow label="Podcasts" value={metrics?.publishing?.podcasts} />
                  <MetricRow label="Videos" value={metrics?.publishing?.videos} />
                </div>
              </div>
            </GlowCard>

            {/* Social */}
            <GlowCard variant="purple" noPadding noTilt>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📱</span>
                  Social Media
                </h3>
                <div className="space-y-3">
                  <MetricRow label="X (Twitter)" value={metrics?.social?.xFollowers} suffix="followers" />
                  <MetricRow label="Instagram" value={metrics?.social?.igFollowers} suffix="followers" />
                  <MetricRow label="TikTok" value={metrics?.social?.tiktokFollowers} suffix="followers" />
                  <MetricRow label="YouTube" value={metrics?.social?.youtubeSubscribers} suffix="subscribers" />
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Last Updated */}
          {metrics?.lastUpdated && (
            <div className="text-center text-white/30 text-sm">
              Data last updated: {new Date(metrics.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Simple Line Chart Component (SVG-based)
function SimpleLineChart({ data }: { data: MetricPoint[] }) {
  if (data.length === 0) return null

  const values = data.map(d => d.value)
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range = maxVal - minVal || 1

  const width = 100
  const height = 100
  const padding = 5

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill="url(#areaGradient)"
        opacity="0.3"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'cyan'
}: {
  title: string
  value: number | null | undefined
  subtitle?: string
  icon: string
  color?: 'cyan' | 'emerald' | 'purple' | 'amber'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400'
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-white/50 uppercase tracking-wider">{title}</span>
      </div>
      {value !== null && value !== undefined ? (
        <div className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value.toLocaleString()}
        </div>
      ) : (
        <div className="text-2xl text-white/20">—</div>
      )}
      {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
    </div>
  )
}

// Metric Row Component
function MetricRow({
  label,
  value,
  suffix
}: {
  label: string
  value: number | null | undefined
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      {value !== null && value !== undefined ? (
        <span className="text-sm font-medium text-white">
          {value.toLocaleString()}
          {suffix && <span className="text-white/40 ml-1">{suffix}</span>}
        </span>
      ) : (
        <span className="text-sm text-white/30">—</span>
      )}
    </div>
  )
}
