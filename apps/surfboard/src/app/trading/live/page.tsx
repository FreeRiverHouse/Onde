'use client'

export const runtime = 'edge'

import { KalshiTraderDashboard } from '@/components/KalshiTraderDashboard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ArrowLeft, ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function KalshiDashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/betting"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white/60" />
                            </Link>

                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                                    Kalshi AutoTrader
                                    <span className="text-sm font-normal text-white/40">Live Dashboard</span>
                                </h1>
                                <p className="text-white/50 text-sm mt-1">
                                    Real-time paper trading with improved safety guards
                                </p>
                            </div>
                        </div>

                        <a
                            href="https://kalshi.com/portfolio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                        >
                            Kalshi Portfolio
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </header>

                {/* Main Dashboard */}
                <main className="space-y-6">
                    <ErrorBoundary name="Kalshi Trader Dashboard">
                      <KalshiTraderDashboard />
                    </ErrorBoundary>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                📊 Strategy v2.1
                            </h3>
                            <p className="text-white/50 text-xs">
                                Improved weather trading with backtest-validated safety guards.
                                Minimum 2°F forecast-strike gap, 12% minimum edge, 3% Kelly fraction.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                🌤️ Weather vs Crypto
                            </h3>
                            <p className="text-white/50 text-xs">
                                NWS forecasts provide reliable edge for weather markets.
                                Backtesting shows 75%+ win rate with safety guards vs 17.9% without.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                🛡️ Risk Management
                            </h3>
                            <p className="text-white/50 text-xs">
                                Circuit breaker after 10 losses. Max 2% per position.
                                Automatic position sizing based on Kelly criterion.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-8 pt-4 border-t border-white/10 text-center text-white/30 text-xs">
                    <p>Paper trading simulation • Not financial advice • Data refreshes every 30s</p>
                </footer>
            </div>
        </div>
    )
}
