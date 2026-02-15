'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'

// Polymarket data embedded in the main trading stats gist
interface PolymarketPosition {
  id: string
  market: string
  side: string
  cost: number
  odds: number
  to_win: number
  status: string
  opened_at: string
  note: string
}

interface PolymarketData {
  generated_at: string
  data_updated_at: string
  bankroll: number
  available: number
  total_pnl: number
  daily_pnl: number
  positions: PolymarketPosition[]
  summary: {
    total_positions: number
    open_positions: number
    total_invested: number
    total_potential_win: number
    exposure_pct: number
  }
  notes: string
}

export function PolyRobortoPanel({ data, loading }: { data?: PolymarketData | null; loading?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <section aria-label="Polymarket Trading" className="space-y-3">
        <div className="animate-pulse h-8 bg-white/5 rounded-lg w-48" />
        <div className="grid grid-cols-2 gap-3">
          <div className="animate-pulse h-20 bg-white/5 rounded-xl" />
          <div className="animate-pulse h-20 bg-white/5 rounded-xl" />
          <div className="animate-pulse h-20 bg-white/5 rounded-xl" />
          <div className="animate-pulse h-20 bg-white/5 rounded-xl" />
        </div>
      </section>
    )
  }

  if (!data) {
    return (
      <section aria-label="Polymarket Trading" className="flex flex-col items-center justify-center py-8 text-gray-400">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30" />
        </div>
        <p className="text-sm">No Polymarket data available</p>
        <p className="text-[10px] text-gray-600 mt-1">Run push-stats-to-gist.py --polymarket</p>
      </section>
    )
  }

  const openPositions = data.positions.filter(p => p.status === 'open')

  return (
    <section aria-label="Polymarket Trading" className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 transition-all hover:bg-white/10 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Bankroll</span>
          </div>
          <div className="text-lg font-semibold font-mono text-white">
            ${data.bankroll.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-600">
            ${data.available.toFixed(2)} available
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 transition-all hover:bg-white/10 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Positions</span>
          </div>
          <div className="text-lg font-semibold font-mono text-white">
            {data.summary.open_positions}
          </div>
          <div className="text-[10px] text-gray-600">
            {data.summary.exposure_pct}% exposed
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 transition-all hover:bg-white/10 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-1">
            {data.total_pnl >= 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total PnL</span>
          </div>
          <div className={`text-lg font-semibold font-mono ${
            data.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {data.total_pnl >= 0 ? '+' : ''}${data.total_pnl.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 transition-all hover:bg-white/10 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Invested</span>
          </div>
          <div className="text-lg font-semibold font-mono text-white">
            ${data.summary.total_invested.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-600">
            to win ${data.summary.total_potential_win.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      {openPositions.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors mb-2"
          >
            <span className="uppercase tracking-wider font-medium">Open Positions ({openPositions.length})</span>
            <span>{expanded ? '▲' : '▼'}</span>
          </button>

          {expanded && (
            <div className="space-y-2">
              {openPositions.map((pos) => (
                <div
                  key={pos.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        pos.side === pos.side.toUpperCase() 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {pos.side}
                      </span>
                      <p className="text-sm text-gray-300 truncate">
                        {pos.market}
                      </p>
                    </div>
                    {pos.note && (
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">{pos.note}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(pos.opened_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-mono text-gray-300">
                      ${pos.cost.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      odds: {(pos.odds * 100).toFixed(0)}¢
                    </p>
                    <p className="text-[10px] text-emerald-500/70">
                      → ${pos.to_win.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
          <p className="text-[10px] text-gray-500 italic">{data.notes}</p>
        </div>
      )}

      {/* Last updated */}
      <div className="flex items-center justify-between text-[10px] text-gray-600">
        <span>
          Data from: {data.data_updated_at ? new Date(data.data_updated_at).toLocaleDateString() : 'unknown'}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500/70 border border-yellow-500/20">
          📱 iPhone Mirror
        </span>
      </div>
    </section>
  )
}
