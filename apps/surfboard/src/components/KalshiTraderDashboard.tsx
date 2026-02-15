"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    TrendingDown,
    Activity,
    Target,
    Zap,
    RefreshCw,
    Cloud,
    Bitcoin,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3
} from 'lucide-react'

// ============== TYPES ==============
interface PaperTradeState {
    session_id: string
    started_at: string
    starting_balance_cents: number
    current_balance_cents: number
    mode: 'paper' | 'live'
    strategy_version: string
    safety_guards: {
        min_forecast_strike_gap: number
        max_market_conviction: number
        min_our_prob: number
        uncertainty_override: number
        kelly_fraction: number
        min_edge: number
    }
    stats: {
        total_trades: number
        wins: number
        losses: number
        pending: number
        win_rate: number
        pnl_cents: number
        gross_profit_cents: number
        gross_loss_cents: number
        current_streak: number
        streak_type: 'win' | 'loss' | 'none'
        max_drawdown_cents: number
        peak_balance_cents: number
    }
    recent_trades: Array<{
        timestamp: string
        ticker: string
        asset: string
        side: string
        contracts: number
        price_cents: number
        result_status?: string
        pnl_cents: number
        edge: number
        our_prob: number
    }>
    weather_stats: {
        trades: number
        wins: number
        losses: number
        win_rate: number
        pnl_cents: number
        filtered_count: number
    }
    crypto_stats: {
        trades: number
        wins: number
        losses: number
        win_rate: number
        pnl_cents: number
    }
    cycle_count: number
    last_updated: string
    derived?: {
        return_pct: number
        profit_factor: number
        max_drawdown_pct: number
        hours_elapsed: number
        trades_per_hour: number
    }
    error?: string
}

// ============== ANIMATED NUMBER ==============
function AnimatedValue({
    value,
    prefix = '',
    suffix = '',
    decimals = 2,
    className = ''
}: {
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    className?: string
}) {
    const [displayed, setDisplayed] = useState(value)

    useEffect(() => {
        const duration = 500
        const start = displayed
        const diff = value - start
        const startTime = Date.now()

        function animate() {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayed(start + diff * eased)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [value])

    return (
        <span className={className}>
            {prefix}
            {displayed.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}
            {suffix}
        </span>
    )
}

// ============== STAT CARD ==============
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'cyan',
    prefix = '',
    suffix = '',
    decimals = 2
}: {
    title: string
    value: number
    subtitle?: string
    icon: React.ComponentType<{ className?: string }>
    trend?: 'up' | 'down' | 'neutral'
    color?: 'cyan' | 'green' | 'red' | 'orange' | 'purple' | 'yellow'
    prefix?: string
    suffix?: string
    decimals?: number
}) {
    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
        green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
        red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
        orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
        yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400'
    }

    const iconColors = {
        cyan: 'text-cyan-400',
        green: 'text-emerald-400',
        red: 'text-red-400',
        orange: 'text-orange-400',
        purple: 'text-purple-400',
        yellow: 'text-yellow-400'
    }

    return (
        <div className={`
      relative overflow-hidden rounded-xl p-4
      bg-gradient-to-br ${colorClasses[color]}
      border backdrop-blur-sm
      transition-all duration-300 hover:scale-[1.02]
    `}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{title}</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <AnimatedValue
                            value={value}
                            prefix={prefix}
                            suffix={suffix}
                            decimals={decimals}
                            className={`text-2xl font-bold ${iconColors[color]} drop-shadow-lg`}
                        />
                        {trend && (
                            <span className={`text-sm ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'}`}>
                                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-white/40 text-xs mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-2 rounded-lg bg-white/10 ${iconColors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    )
}

// ============== TRADE ROW ==============
function TradeRow({ trade }: { trade: PaperTradeState['recent_trades'][0] }) {
    const won = trade.result_status === 'won'
    const lost = trade.result_status === 'lost'
    const pending = !trade.result_status || trade.result_status === 'pending'

    const Icon = won ? CheckCircle : lost ? XCircle : Clock
    const iconColor = won ? 'text-emerald-400' : lost ? 'text-red-400' : 'text-yellow-400'

    const isWeather = trade.asset === 'weather'

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <Icon className={`w-5 h-5 ${iconColor}`} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/90 truncate">
                        {trade.ticker}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${isWeather ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                        {isWeather ? '🌤️' : '₿'}
                    </span>
                </div>
                <div className="text-xs text-white/40">
                    {trade.side.toUpperCase()} x{trade.contracts} @ {trade.price_cents}¢ • {(trade.edge * 100).toFixed(1)}% edge
                </div>
            </div>

            <div className="text-right">
                <div className={`text-sm font-bold ${won ? 'text-emerald-400' : lost ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                    {pending ? 'PENDING' : `${trade.pnl_cents >= 0 ? '+' : ''}$${(trade.pnl_cents / 100).toFixed(2)}`}
                </div>
                <div className="text-xs text-white/30">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    )
}

// ============== MAIN DASHBOARD WIDGET ==============
export function KalshiTraderDashboard() {
    const [state, setState] = useState<PaperTradeState | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/trading/paper')
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            const data = await res.json()
            setState(data)
            setError(data.error || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch')
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [fetchData])

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/10 rounded w-1/3" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-white/10 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!state) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10">
                <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Trading Session</h3>
                    <p className="text-white/50 text-sm">Paper trading session not found. Start one to see live data.</p>
                </div>
            </div>
        )
    }

    const isProfitable = state.stats.pnl_cents >= 0
    const returnPct = state.derived?.return_pct ?? 0

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                        <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            Kalshi Trader
                            <span className={`text-xs px-2 py-0.5 rounded-full ${state.mode === 'paper'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                {state.mode.toUpperCase()}
                            </span>
                        </h2>
                        <p className="text-xs text-white/40">
                            {state.strategy_version} • Session {state.session_id}
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchData}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4 text-white/60" />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">{error}</span>
                </div>
            )}

            {/* Main Stats */}
            <div className="p-6 space-y-6">
                {/* Balance & PnL Hero */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1 p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                        <p className="text-white/60 text-sm font-medium">Current Balance</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <AnimatedValue
                                value={state.current_balance_cents / 100}
                                prefix="$"
                                decimals={2}
                                className="text-4xl font-bold text-white"
                            />
                            <span className={`text-sm font-medium ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                                {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-white/40 text-xs mt-1">
                            Started with ${(state.starting_balance_cents / 100).toFixed(2)}
                        </p>
                    </div>

                    <div className="col-span-2 md:col-span-1 p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                        <p className="text-white/60 text-sm font-medium">Total PnL</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <AnimatedValue
                                value={state.stats.pnl_cents / 100}
                                prefix={state.stats.pnl_cents >= 0 ? '+$' : '-$'}
                                decimals={2}
                                className={`text-4xl font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}
                            />
                        </div>
                        <p className="text-white/40 text-xs mt-1">
                            {state.stats.wins}W / {state.stats.losses}L • {state.stats.pending} pending
                        </p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Win Rate"
                        value={state.stats.win_rate}
                        suffix="%"
                        decimals={1}
                        icon={Target}
                        color={state.stats.win_rate >= 50 ? 'green' : state.stats.win_rate >= 40 ? 'yellow' : 'red'}
                        subtitle={`${state.stats.total_trades} trades`}
                    />
                    <StatCard
                        title="Streak"
                        value={Math.abs(state.stats.current_streak)}
                        suffix={state.stats.streak_type === 'win' ? 'W' : state.stats.streak_type === 'loss' ? 'L' : ''}
                        decimals={0}
                        icon={Zap}
                        color={state.stats.streak_type === 'win' ? 'green' : state.stats.streak_type === 'loss' ? 'red' : 'cyan'}
                    />
                    <StatCard
                        title="Max Drawdown"
                        value={state.derived?.max_drawdown_pct ?? 0}
                        suffix="%"
                        decimals={1}
                        icon={TrendingDown}
                        color="orange"
                    />
                    <StatCard
                        title="Profit Factor"
                        value={state.derived?.profit_factor ?? 0}
                        decimals={2}
                        icon={BarChart3}
                        color={state.derived?.profit_factor && state.derived.profit_factor > 1 ? 'green' : 'red'}
                    />
                </div>

                {/* Weather vs Crypto */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Cloud className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">Weather Markets</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Trades</span>
                                <span className="text-white font-medium">{state.weather_stats.trades}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Win Rate</span>
                                <span className={`font-medium ${state.weather_stats.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {state.weather_stats.win_rate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60 text-sm">PnL</span>
                                <span className={`font-medium ${state.weather_stats.pnl_cents >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${(state.weather_stats.pnl_cents / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Bitcoin className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium text-orange-400">Crypto Markets</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Trades</span>
                                <span className="text-white font-medium">{state.crypto_stats.trades}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60 text-sm">Win Rate</span>
                                <span className={`font-medium ${state.crypto_stats.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {state.crypto_stats.win_rate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60 text-sm">PnL</span>
                                <span className={`font-medium ${state.crypto_stats.pnl_cents >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${(state.crypto_stats.pnl_cents / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Trades */}
                {state.recent_trades.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Recent Trades
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {state.recent_trades.slice(0, 10).map((trade, i) => (
                                <TradeRow key={`${trade.timestamp}-${i}`} trade={trade} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Safety Guards */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-medium text-white/60 mb-3">Safety Guards Active</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-white/60">Min Gap: {state.safety_guards.min_forecast_strike_gap}°F</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-white/60">Max Conviction: {(state.safety_guards.max_market_conviction * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-white/60">Min Prob: {(state.safety_guards.min_our_prob * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-white/60">Min Edge: {(state.safety_guards.min_edge * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-white/60">Kelly: {(state.safety_guards.kelly_fraction * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-white/60">Uncertainty: ±{state.safety_guards.uncertainty_override}°F</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <span>Cycle #{state.cycle_count}</span>
                <span>Updated: {new Date(state.last_updated).toLocaleString()}</span>
            </div>
        </div >
    )
}

export default KalshiTraderDashboard
