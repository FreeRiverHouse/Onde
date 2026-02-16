'use client'

export const runtime = 'edge'

import Link from 'next/link'
import { TrendingUp, History, FileText, ArrowLeft } from 'lucide-react'

export default function TradingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Terminal</h1>
            <p className="text-white/50 mt-1">AutoTrader v3 — Claude-as-Forecaster Pipeline</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/trading/live"
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Live Dashboard</h2>
            <p className="text-sm text-white/50">
              Real-time Kalshi positions, P&L, and market analysis.
            </p>
          </Link>

          <Link
            href="/trading/paper"
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Paper Trading</h2>
            <p className="text-sm text-white/50">
              Test strategies without risking real capital.
            </p>
          </Link>

          <Link
            href="/trading/history"
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <History className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Trade History</h2>
            <p className="text-sm text-white/50">
              Full history with filters and export options.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
