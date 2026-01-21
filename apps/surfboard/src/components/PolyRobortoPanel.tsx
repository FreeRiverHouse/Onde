'use client'

import { useState, useEffect } from 'react'

interface TradingStatus {
  isRunning: boolean
  balance: number
  openPositions: number
  todayPnL: number
  weeklyPnL: number
}

export function PolyRobortoPanel() {
  const [status, setStatus] = useState<TradingStatus | null>(null)
  const [feedback, setFeedback] = useState('')
  const [sending, setSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/polyroborto/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      // Demo data
      setStatus({
        isRunning: true,
        balance: 1250.00,
        openPositions: 3,
        todayPnL: 45.20,
        weeklyPnL: 180.50
      })
    }
  }

  async function sendFeedback() {
    if (!feedback.trim()) return

    setSending(true)
    try {
      await fetch('/api/polyroborto/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      })
      setFeedback('')
      setFeedbackSent(true)
      setTimeout(() => setFeedbackSent(false), 3000)
    } catch {
      // Silent fail
    }
    setSending(false)
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-white">PolyRoborto</h2>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            Open Dashboard
          </a>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status?.isRunning
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {status?.isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-lg font-semibold text-white">
            ${status?.balance?.toFixed(2) || '—'}
          </div>
          <div className="text-xs text-white/40">Balance</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-lg font-semibold text-white">
            {status?.openPositions ?? '—'}
          </div>
          <div className="text-xs text-white/40">Positions</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className={`text-lg font-semibold ${
            (status?.todayPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {status?.todayPnL !== undefined
              ? `${status.todayPnL >= 0 ? '+' : ''}$${status.todayPnL.toFixed(2)}`
              : '—'
            }
          </div>
          <div className="text-xs text-white/40">Today</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className={`text-lg font-semibold ${
            (status?.weeklyPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {status?.weeklyPnL !== undefined
              ? `${status.weeklyPnL >= 0 ? '+' : ''}$${status.weeklyPnL.toFixed(2)}`
              : '—'
            }
          </div>
          <div className="text-xs text-white/40">Week</div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="border-t border-white/10 pt-4">
        <div className="text-sm text-white/60 mb-2">Tech Support Feedback</div>
        <textarea
          placeholder="Send feedback to tech agent for optimization..."
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none h-20"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${feedbackSent ? 'text-emerald-400' : 'text-transparent'}`}>
            Feedback sent to agent
          </span>
          <button
            onClick={sendFeedback}
            disabled={sending || !feedback.trim()}
            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
