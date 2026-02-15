'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  FlaskConical,
  Settings2,
  ArrowUpDown,
  Layers,
  Timer,
  GitBranch,
} from 'lucide-react'

// ============ TYPES ============
interface PaperStats {
  total_trades: number
  wins: number
  losses: number
  pending: number
  win_rate: number
  pnl_cents: number
  pnl_dollars: number
  by_asset: Record<string, AssetStats>
  by_regime: Record<string, RegimeStats>
  by_side: Record<string, SideStats>
  by_edge_bucket: Record<string, BucketStats>
  by_hour: Record<string, HourStats>
  daily_breakdown: DailyBreakdown[]
  edge_stats: EdgeStats
  timeline: TradeEntry[]
  date_range: { first_trade: string | null; last_trade: string | null }
}

interface AssetStats {
  trades: number; wins: number; losses: number; pending: number
  pnl_cents: number; win_rate: number; avg_edge: number
}

interface RegimeStats {
  trades: number; wins: number; losses: number; pending: number
  win_rate: number; avg_edge: number
}

interface SideStats {
  trades: number; wins: number; losses: number; pending: number; win_rate: number
}

interface BucketStats {
  trades: number; wins: number; losses: number; pending: number; win_rate: number
}

interface HourStats {
  trades: number; wins: number; losses: number; pending: number; win_rate: number
}

interface DailyBreakdown {
  date: string; trades: number; wins: number; losses: number; pending: number
  pnl_cents: number; cumulative_pnl_cents: number; win_rate: number
  cumulative_win_rate: number; avg_edge: number
}

interface EdgeStats {
  mean: number; median: number; min: number; max: number; count: number
}

interface TradeEntry {
  timestamp: string; ticker: string; asset: string; side: string
  contracts: number; price_cents: number; edge: number; regime: string
  result_status: string; our_prob: number; market_prob: number
}

interface AutoTune {
  status: string
  next_run_estimate: string | null
  run_interval_minutes?: number
  latest_report: {
    timestamp: string
    total_trades_analyzed: number
    auto_tune_active: boolean
    recommendations: Recommendation[]
    changes_applied: Change[]
    edge_stats: { mean: number; median: number; min: number; max: number }
    prob_calibration: ProbCalibration[]
  } | null
  history: TuneHistoryEntry[]
}

interface Recommendation {
  type: string; message: string; action?: string; param?: string
  regime?: string; win_rate?: number; avg_edge?: number
  current_edge?: number; suggested_edge?: number
}

interface Change {
  param: string; old_value: number; new_value: number; reason: string
}

interface ProbCalibration {
  predicted_prob: number; actual_win_rate: number
  expected_win_rate: number; sample_size: number; calibration_error: number
}

interface TuneHistoryEntry {
  timestamp: string; total_trades: number; edge_mean: number
  recommendations: number; changes: number
}

interface RealStats {
  total_trades: number; win_rate: number; pnl_cents: number
  pnl_dollars: number; profit_factor: number; max_drawdown_pct: number
}

interface PaperDashboardData {
  generated_at: string
  paper_trading: PaperStats
  auto_tune: AutoTune
  real_stats_comparison: RealStats | null
}

// ============ COMPONENTS ============

function GlassCard({ children, className = '', glow = 'cyan' }: {
  children: React.ReactNode; className?: string
  glow?: 'cyan' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
}) {
  const glowMap = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.12)] hover:border-cyan-500/20',
    green: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.12)] hover:border-emerald-500/20',
    purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] hover:border-purple-500/20',
    orange: 'hover:shadow-[0_0_30px_rgba(251,146,60,0.12)] hover:border-orange-500/20',
    red: 'hover:shadow-[0_0_30px_rgba(255,68,68,0.12)] hover:border-red-500/20',
    yellow: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.12)] hover:border-yellow-500/20',
  }
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] transition-all duration-300 ${glowMap[glow]} ${className}`}>
      {children}
    </div>
  )
}

function StatBox({ label, value, sub, icon: Icon, color = 'cyan', trend }: {
  label: string; value: string | number; sub?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'cyan' | 'green' | 'purple' | 'orange' | 'red'
  trend?: 'up' | 'down' | 'neutral'
}) {
  const colors = {
    cyan: 'text-cyan-400', green: 'text-emerald-400', purple: 'text-purple-400',
    orange: 'text-orange-400', red: 'text-red-400',
  }
  const iconBg = {
    cyan: 'from-cyan-500/20 to-blue-500/20',
    green: 'from-emerald-500/20 to-green-500/20',
    purple: 'from-purple-500/20 to-pink-500/20',
    orange: 'from-orange-500/20 to-amber-500/20',
    red: 'from-red-500/20 to-rose-500/20',
  }
  return (
    <GlassCard glow={color} className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{label}</p>
          <p className={`text-2xl md:text-3xl font-bold font-mono mt-1 ${colors[color]} drop-shadow-[0_0_15px_currentColor]`}>
            {value}
          </p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconBg[color]}`}>
          <Icon className={`w-5 h-5 ${colors[color]}`} />
        </div>
      </div>
    </GlassCard>
  )
}

function MiniBarChart({ data, maxVal, color = 'cyan' }: {
  data: { label: string; value: number; sub?: string }[]
  maxVal?: number; color?: string
}) {
  const max = maxVal || Math.max(...data.map(d => d.value), 1)
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500', green: 'bg-emerald-500', purple: 'bg-purple-500',
    orange: 'bg-orange-500', red: 'bg-red-500',
  }
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-16 truncate">{d.label}</span>
          <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${colorMap[color] || 'bg-cyan-500'} transition-all duration-700`}
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-300 w-10 text-right">{d.value}</span>
          {d.sub && <span className="text-xs text-gray-500 w-14 text-right">{d.sub}</span>}
        </div>
      ))}
    </div>
  )
}

function SparklineChart({ points, width = 200, height = 40, color = '#06b6d4' }: {
  points: number[]; width?: number; height?: number; color?: string
}) {
  if (!points.length) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const pathData = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p - min) / range) * (height - 4) - 2
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathData + ` L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#spark-grad-${color.replace('#', '')})`} />
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Latest dot */}
      <circle
        cx={width}
        cy={height - ((points[points.length - 1] - min) / range) * (height - 4) - 2}
        r="3" fill={color}
      />
    </svg>
  )
}

function ComparisonTable({ paper, real }: { paper: PaperStats; real: RealStats | null }) {
  if (!real) return null
  const rows = [
    { label: 'Total Trades', paper: paper.total_trades, real: real.total_trades },
    { label: 'Win Rate', paper: `${paper.win_rate}%`, real: `${real.win_rate}%`,
      better: paper.win_rate > real.win_rate ? 'paper' : 'real' },
    { label: 'PnL', paper: `$${paper.pnl_dollars.toFixed(2)}`, real: `$${real.pnl_dollars.toFixed(2)}`,
      better: paper.pnl_dollars > real.pnl_dollars ? 'paper' : 'real' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-2 text-gray-400 font-medium">Metric</th>
            <th className="text-right py-2 text-cyan-400 font-medium">📋 Paper</th>
            <th className="text-right py-2 text-emerald-400 font-medium">💰 Real</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-2 text-gray-300">{r.label}</td>
              <td className={`text-right py-2 font-mono ${r.better === 'paper' ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}>
                {r.paper}
              </td>
              <td className={`text-right py-2 font-mono ${r.better === 'real' ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
                {r.real}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const isWarning = rec.type.includes('miscalibrated') || rec.type.includes('underperform')
  return (
    <div className={`p-3 rounded-xl border ${isWarning
      ? 'bg-yellow-500/5 border-yellow-500/20'
      : 'bg-blue-500/5 border-blue-500/20'
    }`}>
      <div className="flex items-start gap-2">
        {isWarning
          ? <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          : <Settings2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        }
        <div>
          <p className="text-sm text-gray-200">{rec.message}</p>
          {rec.action && (
            <p className="text-xs text-gray-500 mt-1">
              Action: <code className="bg-white/5 px-1.5 py-0.5 rounded">{rec.action}</code>
              {rec.param && <> → <code className="bg-white/5 px-1.5 py-0.5 rounded">{rec.param}</code></>}
            </p>
          )}
          {rec.suggested_edge !== undefined && rec.current_edge !== undefined && (
            <p className="text-xs mt-1">
              <span className="text-gray-500">Edge: </span>
              <span className="text-red-400 font-mono">{(rec.current_edge * 100).toFixed(1)}%</span>
              <span className="text-gray-500"> → </span>
              <span className="text-emerald-400 font-mono">{(rec.suggested_edge * 100).toFixed(1)}%</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function timeAgo(ts: string | null): string {
  if (!ts) return 'never'
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ============ MAIN PAGE ============

export default function PaperDashboardPage() {
  const [data, setData] = useState<PaperDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Try API first (works when authenticated)
      let json = null
      try {
        const res = await fetch('/api/trading/paper', { cache: 'no-store' })
        if (res.ok) {
          json = await res.json()
          if (json?.paper_trading?.total_trades > 0) {
            setData(json)
            return
          }
        }
      } catch { /* fall through to gist */ }

      // Fallback: fetch from gist directly
      const gistRes = await fetch(
        'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-paper-stats.json',
        { cache: 'no-store' }
      )
      if (!gistRes.ok) throw new Error(`Gist HTTP ${gistRes.status}`)
      const gistData = await gistRes.json()
      // Map gist format to expected format
      setData({
        generated_at: gistData.generated_at,
        paper_trading: gistData.paper_trading,
        auto_tune: gistData.auto_tune,
        real_stats_comparison: gistData.real_stats_comparison ?? null,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading paper trading data...</span>
        </div>
      </div>
    )
  }

  const paper = data?.paper_trading
  const tune = data?.auto_tune
  const realStats = data?.real_stats_comparison

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/betting" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FlaskConical className="w-6 h-6 text-cyan-400" />
                Paper Trading
                <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  DRY RUN
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Simulated trades + Auto-Tune monitoring
                {data?.generated_at && (
                  <span className="ml-2 text-gray-600">• Updated {timeAgo(data.generated_at)}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 hover:border-cyan-500/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {error} — showing cached data
          </div>
        )}

        {paper && (
          <>
            {/* ===== TOP STATS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatBox
                label="Total Trades" value={paper.total_trades}
                sub={`${paper.pending} pending`} icon={BarChart3} color="cyan"
              />
              <StatBox
                label="Win Rate" value={paper.win_rate > 0 ? `${paper.win_rate}%` : '—'}
                sub={`${paper.wins}W / ${paper.losses}L`} icon={Target}
                color={paper.win_rate >= 55 ? 'green' : paper.win_rate >= 45 ? 'orange' : 'red'}
              />
              <StatBox
                label="PnL" value={paper.pnl_cents !== 0 ? `$${paper.pnl_dollars.toFixed(2)}` : '—'}
                sub={paper.pending > 0 ? `${paper.pending} trades pending settlement` : undefined}
                icon={paper.pnl_cents >= 0 ? TrendingUp : TrendingDown}
                color={paper.pnl_cents >= 0 ? 'green' : 'red'}
              />
              <StatBox
                label="Avg Edge" value={`${paper?.edge_stats?.mean ?? 0}%`}
                sub={`Median: ${paper?.edge_stats?.median ?? 0}%`} icon={Zap} color="purple"
              />
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* --- LEFT: By Asset --- */}
              <GlassCard glow="orange" className="p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" /> By Asset
                </h3>
                <MiniBarChart
                  data={Object.entries(paper.by_asset).map(([k, v]) => ({
                    label: k.toUpperCase(),
                    value: v.trades,
                    sub: v.win_rate > 0 ? `${v.win_rate}%` : '—',
                  }))}
                  color="orange"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(paper.by_asset).map(([asset, stats]) => (
                    <div key={asset} className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="text-xs text-gray-400 uppercase">{asset}</div>
                      <div className="text-sm font-mono text-gray-200">{stats.trades} trades</div>
                      <div className="text-xs text-gray-500">Edge: {stats.avg_edge}%</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* --- RIGHT: By Regime --- */}
              <GlassCard glow="purple" className="p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> By Market Regime
                </h3>
                <MiniBarChart
                  data={Object.entries(paper.by_regime).map(([k, v]) => ({
                    label: k,
                    value: v.trades,
                    sub: v.win_rate > 0 ? `${v.win_rate}%` : '—',
                  }))}
                  color="purple"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(paper.by_regime).map(([regime, stats]) => (
                    <div key={regime} className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="text-xs text-gray-400 capitalize">{regime}</div>
                      <div className="text-sm font-mono text-gray-200">{stats.trades} trades</div>
                      <div className="text-xs text-gray-500">Edge: {stats.avg_edge}%</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* --- Edge Distribution --- */}
              <GlassCard glow="cyan" className="p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-cyan-400" /> Edge Buckets
                </h3>
                <MiniBarChart
                  data={Object.entries(paper.by_edge_bucket)
                    .sort(([a], [b]) => {
                      const order = ['<5%', '5-10%', '10-15%', '15-20%', '20%+']
                      return order.indexOf(a) - order.indexOf(b)
                    })
                    .map(([k, v]) => ({
                      label: k,
                      value: v.trades,
                      sub: v.win_rate > 0 ? `${v.win_rate}%` : '—',
                    }))}
                  color="cyan"
                />
              </GlassCard>

              {/* --- Side Split --- */}
              <GlassCard glow="green" className="p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-400" /> Yes / No Split
                </h3>
                {paper.by_side && (
                  <div className="space-y-3">
                    {Object.entries(paper.by_side).map(([side, stats]) => (
                      <div key={side} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div>
                          <span className={`text-sm font-bold uppercase ${side === 'yes' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {side}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{stats.trades} trades</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono text-gray-300">
                            {stats.win_rate > 0 ? `${stats.win_rate}% WR` : '—'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {stats.wins}W / {stats.losses}L
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* ===== TREND CHART ===== */}
            {paper.daily_breakdown.length > 0 && (
              <GlassCard glow="cyan" className="p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> Daily Trend
                </h3>
                <div className="flex flex-col gap-4">
                  {/* Trades per day */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Trades per Day</p>
                    <SparklineChart
                      points={paper.daily_breakdown.map(d => d.trades)}
                      width={600} height={50} color="#06b6d4"
                    />
                  </div>
                  {/* Cumulative PnL */}
                  {paper.daily_breakdown.some(d => d.cumulative_pnl_cents !== 0) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Cumulative PnL (¢)</p>
                      <SparklineChart
                        points={paper.daily_breakdown.map(d => d.cumulative_pnl_cents)}
                        width={600} height={50}
                        color={paper.pnl_cents >= 0 ? '#10b981' : '#ef4444'}
                      />
                    </div>
                  )}
                  {/* Edge mean per day */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Avg Edge per Day (%)</p>
                    <SparklineChart
                      points={paper.daily_breakdown.map(d => d.avg_edge)}
                      width={600} height={50} color="#a855f7"
                    />
                  </div>
                  {/* Daily labels */}
                  <div className="flex justify-between text-[10px] text-gray-600 px-1">
                    {paper.daily_breakdown.map((d, i) => (
                      <span key={i}>{d.date.slice(5)}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* ===== REAL VS PAPER COMPARISON ===== */}
            {realStats && (
              <GlassCard glow="green" className="p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-emerald-400" /> Paper vs Real Comparison
                </h3>
                <ComparisonTable paper={paper} real={realStats} />
              </GlassCard>
            )}

            {/* ===== RECENT TRADES ===== */}
            {paper.timeline.length > 0 && (
              <GlassCard glow="cyan" className="p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" /> Recent Paper Trades
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500">
                        <th className="text-left py-2 font-medium">Time</th>
                        <th className="text-left py-2 font-medium">Asset</th>
                        <th className="text-center py-2 font-medium">Side</th>
                        <th className="text-right py-2 font-medium">Price</th>
                        <th className="text-right py-2 font-medium">Edge</th>
                        <th className="text-center py-2 font-medium">Regime</th>
                        <th className="text-center py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paper.timeline.map((t, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-2 text-gray-400 font-mono">{timeAgo(t.timestamp)}</td>
                          <td className="py-2">
                            <span className={`font-bold ${t.asset === 'btc' ? 'text-orange-400' : t.asset === 'eth' ? 'text-purple-400' : 'text-cyan-400'}`}>
                              {t.asset.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${t.side === 'yes' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {t.side}
                            </span>
                          </td>
                          <td className="py-2 text-right font-mono text-gray-300">{t.price_cents}¢</td>
                          <td className="py-2 text-right font-mono text-cyan-400">{t.edge}%</td>
                          <td className="py-2 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 capitalize">
                              {t.regime}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            {t.result_status === 'won' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : t.result_status === 'lost' ? (
                              <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                            ) : (
                              <Timer className="w-3.5 h-3.5 text-gray-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </>
        )}

        {/* ===== AUTO-TUNE SECTION ===== */}
        {tune && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-yellow-400" />
              Auto-Tune Engine
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                tune.status === 'active'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              }`}>
                {tune.status === 'active' ? '● Active' : tune.status}
              </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Report */}
              {tune.latest_report && (
                <GlassCard glow="yellow" className="p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" /> Latest Report
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Run</span>
                      <span className="text-gray-300 font-mono">{timeAgo(tune.latest_report.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trades Analyzed</span>
                      <span className="text-gray-300 font-mono">{tune.latest_report.total_trades_analyzed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recommendations</span>
                      <span className="text-yellow-400 font-mono">{tune.latest_report.recommendations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Changes Applied</span>
                      <span className={`font-mono ${tune.latest_report.changes_applied.length > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {tune.latest_report.changes_applied.length}
                      </span>
                    </div>
                    {tune.next_run_estimate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Next Run</span>
                        <span className="text-gray-300 font-mono text-xs">
                          {tune.run_interval_minutes ? `~every ${tune.run_interval_minutes}m` : timeAgo(tune.next_run_estimate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Edge stats from analysis */}
                  {tune.latest_report.edge_stats && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <p className="text-xs text-gray-500 mb-2">Edge Distribution (from analysis)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Mean', val: tune?.latest_report?.edge_stats?.mean ?? 0 },
                          { label: 'Median', val: tune.latest_report.edge_stats.median },
                          { label: 'Min', val: tune.latest_report.edge_stats.min },
                          { label: 'Max', val: tune.latest_report.edge_stats.max },
                        ].map((s, i) => (
                          <div key={i} className="text-center p-1.5 rounded bg-white/[0.03]">
                            <div className="text-[10px] text-gray-500">{s.label}</div>
                            <div className="text-xs font-mono text-gray-300">
                              {typeof s.val === 'number' ? `${(s.val * 100).toFixed(1)}%` : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Recommendations */}
              <GlassCard glow="yellow" className="p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" /> Recommendations
                </h3>
                {tune.latest_report?.recommendations.length ? (
                  <div className="space-y-2">
                    {tune.latest_report.recommendations.map((rec, i) => (
                      <RecommendationCard key={i} rec={rec} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recommendations at this time ✓</p>
                )}

                {/* Prob calibration */}
                {tune.latest_report?.prob_calibration && tune.latest_report.prob_calibration.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Probability Calibration</p>
                    <div className="space-y-1">
                      {tune.latest_report.prob_calibration.map((cal, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            Predicted: {(cal.predicted_prob * 100).toFixed(0)}%
                          </span>
                          <span className={`font-mono ${Math.abs(cal.calibration_error) > 0.1 ? 'text-yellow-400' : 'text-gray-400'}`}>
                            Actual: {(cal.actual_win_rate * 100).toFixed(0)}%
                            <span className="text-gray-600 ml-1">(n={cal.sample_size})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Tune History Timeline */}
            {tune.history.length > 0 && (
              <GlassCard glow="yellow" className="p-5 mt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Tune History
                </h3>

                {/* Edge Mean over time */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Edge Mean Over Time (%)</p>
                  <SparklineChart
                    points={tune.history.map(h => h.edge_mean)}
                    width={600} height={50} color="#eab308"
                  />
                </div>

                {/* Total Trades over time */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Total Trades Analyzed</p>
                  <SparklineChart
                    points={tune.history.map(h => h.total_trades)}
                    width={600} height={50} color="#06b6d4"
                  />
                </div>

                {/* History table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500">
                        <th className="text-left py-2 font-medium">Time</th>
                        <th className="text-right py-2 font-medium">Trades</th>
                        <th className="text-right py-2 font-medium">Edge Mean</th>
                        <th className="text-right py-2 font-medium">Recs</th>
                        <th className="text-right py-2 font-medium">Changes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tune.history.slice().reverse().map((h, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 text-gray-400 font-mono">{timeAgo(h.timestamp)}</td>
                          <td className="py-2 text-right font-mono text-gray-300">{h.total_trades}</td>
                          <td className="py-2 text-right font-mono text-yellow-400">{h.edge_mean}%</td>
                          <td className="py-2 text-right font-mono text-gray-300">{h.recommendations}</td>
                          <td className="py-2 text-right">
                            <span className={`font-mono ${h.changes > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {h.changes}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-gray-600 text-xs">
          <p>Paper Trading Dashboard • onde.surf</p>
          <p className="mt-1">
            <Link href="/betting" className="text-cyan-500/50 hover:text-cyan-400 transition-colors">
              ← Back to Trading Terminal
            </Link>
            {' • '}
            <Link href="/trading/live" className="text-cyan-500/50 hover:text-cyan-400 transition-colors">
              Live Dashboard →
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
