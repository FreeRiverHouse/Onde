'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'

interface RateLimitStatus {
  fiveH: string
  sevenD: string
  sevenDUtilization: number
  sevenDSonnetStatus: string
}

interface BotStatus {
  macId: string
  hostname: string
  botName: string
  primaryModel: string
  fallbacks: string[]
  account: string
  tokenEnd: string
  tier: string
  cooldown: number | null
  errorCount: number
  gatewayStatus: 'running' | 'stopped' | 'unknown'
  rateLimitStatus: RateLimitStatus
  lastHeartbeat: string
}

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bot-configs/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        onAuth()
      } else {
        setError('Password errata')
      }
    } catch {
      setError('Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-2xl">🤖</span>
            </div>
            <h1 className="text-lg font-semibold text-white">BOT-CONFIGS</h1>
            <p className="mt-1 text-sm text-white/40">Accesso riservato</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-cyan-500/20 border border-cyan-500/30 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-all disabled:opacity-40"
            >
              {loading ? 'Verifica...' : 'Entra'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function modelShort(model: string) {
  if (model.includes('sonnet-4-6')) return 'Sonnet 4.6'
  if (model.includes('opus-4-6')) return 'Opus 4.6'
  if (model.includes('kimi')) return 'Kimi K2.5'
  if (model.includes('qwen')) return 'Qwen'
  return model.split('/').pop() || model
}

function providerShort(model: string) {
  if (model.startsWith('anthropic')) return 'Anthropic'
  if (model.startsWith('nvidia')) return 'NVIDIA'
  if (model.startsWith('google')) return 'Google'
  if (model.startsWith('tinygrad')) return 'Ollama'
  return model.split('/')[0]
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s fa`
  if (diff < 3600) return `${Math.floor(diff / 60)}m fa`
  return `${Math.floor(diff / 3600)}h fa`
}

function accountLabel(account: string, tokenEnd: string) {
  if (account.includes('freeriverhouse') || tokenEnd === 'hRg-PCbGEAAA') return 'freeriverhouse ✓'
  if (account.includes('magmaticxr') || tokenEnd === 'DWw-pWTs5AAA') return 'magmaticxr ⚠'
  return account || `...${tokenEnd}`
}

function accountOk(account: string, tokenEnd: string) {
  return account.includes('freeriverhouse') || tokenEnd === 'hRg-PCbGEAAA'
}

// ─── Bot Card ─────────────────────────────────────────────────────────────────

function BotCard({ bot, onSwitch }: { bot: BotStatus; onSwitch: (macId: string, model: string) => void }) {
  const [switching, setSwitching] = useState<string | null>(null)
  const isOnline = bot.gatewayStatus === 'running'
  const stale = (Date.now() - new Date(bot.lastHeartbeat).getTime()) > 5 * 60 * 1000
  const hasCooldown = !!bot.cooldown && bot.cooldown > Date.now()
  const accountGood = accountOk(bot.account, bot.tokenEnd)
  const rl7d = bot.rateLimitStatus?.sevenDUtilization ?? 0
  const rl7dOk = bot.rateLimitStatus?.sevenD === 'allowed'

  const handleSwitch = async (model: string) => {
    setSwitching(model)
    await onSwitch(bot.macId, model)
    setSwitching(null)
  }

  const statusColor = stale ? 'text-yellow-400' : isOnline ? 'text-emerald-400' : 'text-red-400'
  const statusDot = stale ? 'bg-yellow-400' : isOnline ? 'bg-emerald-400' : 'bg-red-400'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-cyan-500/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`h-2 w-2 rounded-full ${statusDot} ${isOnline && !stale ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-semibold text-white">{bot.hostname}</span>
            {stale && <span className="text-xs text-yellow-400/70 bg-yellow-400/10 px-2 py-0.5 rounded-full">stale</span>}
          </div>
          <span className="text-xs text-white/40 font-mono">{bot.botName}</span>
        </div>
        <span className={`text-xs font-mono ${statusColor}`}>{timeAgo(bot.lastHeartbeat)}</span>
      </div>

      {/* Primary Model */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Primary</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-cyan-300">{modelShort(bot.primaryModel)}</span>
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{providerShort(bot.primaryModel)}</span>
        </div>
        {bot.fallbacks?.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] text-white/25">↪</span>
            {bot.fallbacks.map((f) => (
              <span key={f} className="text-[10px] text-white/35">{modelShort(f)}</span>
            ))}
          </div>
        )}
      </div>

      {/* Account + Token */}
      <div className="mb-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">Account</span>
          <span className={`text-xs font-mono ${accountGood ? 'text-emerald-400' : 'text-red-400'}`}>
            {accountLabel(bot.account, bot.tokenEnd)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">Token</span>
          <span className="text-[10px] font-mono text-white/50">...{bot.tokenEnd}</span>
        </div>
        {hasCooldown && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30">Cooldown</span>
            <span className="text-xs text-orange-400">⏳ attivo</span>
          </div>
        )}
        {bot.errorCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30">Errori</span>
            <span className="text-xs text-red-400">{bot.errorCount}</span>
          </div>
        )}
      </div>

      {/* Rate Limit */}
      <div className="mb-5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">Rate 5h</span>
          <span className={`text-[10px] font-semibold ${bot.rateLimitStatus?.fiveH === 'allowed' ? 'text-emerald-400' : 'text-red-400'}`}>
            {bot.rateLimitStatus?.fiveH ?? '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">Rate 7d</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-white/10">
              <div
                className={`h-1.5 rounded-full transition-all ${rl7d > 0.8 ? 'bg-red-500' : rl7d > 0.5 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(rl7d * 100, 100)}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono ${rl7dOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {(rl7d * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Switch Buttons */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Switch Primary</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSwitch('anthropic/claude-sonnet-4-6')}
            disabled={!!switching || bot.primaryModel === 'anthropic/claude-sonnet-4-6'}
            className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 py-2 px-3 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {switching === 'anthropic/claude-sonnet-4-6' ? '⏳' : ''}  Sonnet 4.6
          </button>
          <button
            onClick={() => handleSwitch('anthropic/claude-opus-4-6')}
            disabled={!!switching || bot.primaryModel === 'anthropic/claude-opus-4-6'}
            className="rounded-lg bg-purple-500/10 border border-purple-500/20 py-2 px-3 text-xs text-purple-300 hover:bg-purple-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {switching === 'anthropic/claude-opus-4-6' ? '⏳' : ''} Opus 4.6
          </button>
          <button
            onClick={() => handleSwitch('nvidia/moonshotai/kimi-k2.5')}
            disabled={!!switching || bot.primaryModel === 'nvidia/moonshotai/kimi-k2.5'}
            className="rounded-lg bg-orange-500/10 border border-orange-500/20 py-2 px-3 text-xs text-orange-300 hover:bg-orange-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {switching === 'nvidia/moonshotai/kimi-k2.5' ? '⏳' : ''} Kimi K2.5
          </button>
          <button
            onClick={() => handleSwitch('refresh-token')}
            disabled={!!switching}
            className="rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-xs text-white/50 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {switching === 'refresh-token' ? '⏳' : '🔑'} Refresh Token
          </button>
        </div>
        <p className="text-[10px] text-white/20 text-center mt-1">Il Mac applica al prossimo heartbeat (~1 min)</p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard() {
  const [bots, setBots] = useState<BotStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/bot-configs/status')
      if (res.ok) {
        const data = await res.json()
        setBots(data.bots || [])
        setLastUpdate(new Date())
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSwitch = async (macId: string, model: string) => {
    try {
      const res = await fetch('/api/bot-configs/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ macId, action: 'switch', model }),
      })
      if (res.ok) {
        showToast(`✅ Comando inviato a ${macId} — applicato al prossimo heartbeat`)
      } else {
        showToast('❌ Errore invio comando')
      }
    } catch {
      showToast('❌ Errore di rete')
    }
  }

  // Summary stats
  const onlineCount = bots.filter(b => b.gatewayStatus === 'running' && (Date.now() - new Date(b.lastHeartbeat).getTime()) < 5 * 60 * 1000).length
  const accountIssues = bots.filter(b => !accountOk(b.account, b.tokenEnd)).length
  const rlIssues = bots.filter(b => b.rateLimitStatus?.sevenD !== 'allowed').length

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              BOT-CONFIGS
            </h1>
            <p className="mt-1 text-sm text-white/40">ClawdBot fleet — modelli, account, rate limit</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-white/25 font-mono">
                aggiornato {lastUpdate.toLocaleTimeString('it-IT')}
              </span>
            )}
            <button
              onClick={fetchStatus}
              className="rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2 text-xs text-white/60 hover:bg-white/[0.08] transition-all"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${onlineCount === bots.length && bots.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
            <div>
              <div className="text-lg font-bold text-white">{onlineCount}/{bots.length}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Online</div>
            </div>
          </div>
          <div className={`rounded-xl border p-4 flex items-center gap-3 ${accountIssues > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.03] border-white/[0.06]'}`}>
            <div className={`h-3 w-3 rounded-full ${accountIssues > 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <div>
              <div className="text-lg font-bold text-white">{accountIssues > 0 ? accountIssues + ' ⚠' : 'OK'}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Account</div>
            </div>
          </div>
          <div className={`rounded-xl border p-4 flex items-center gap-3 ${rlIssues > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.03] border-white/[0.06]'}`}>
            <div className={`h-3 w-3 rounded-full ${rlIssues > 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <div>
              <div className="text-lg font-bold text-white">{rlIssues > 0 ? rlIssues + ' ⚠' : 'OK'}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Rate Limit 7d</div>
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-pulse h-80" />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl mb-4">📡</div>
            <p className="text-white/40 text-sm">Nessun Mac ha ancora inviato heartbeat.</p>
            <p className="text-white/25 text-xs mt-2">Avvia <code className="font-mono bg-white/5 px-1 rounded">send-heartbeat.py</code> su ogni Mac.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map(bot => (
              <BotCard key={bot.macId} bot={bot} onSwitch={handleSwitch} />
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-white/10 border border-white/20 px-5 py-3 text-sm text-white backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BotConfigsPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if we already have the auth cookie by trying the status endpoint
    fetch('/api/bot-configs/status').then(res => {
      if (res.ok || res.status === 200) {
        setAuthed(true)
      } else if (res.status === 401) {
        setAuthed(false)
      }
    }).catch(() => setAuthed(false))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
        <div className="h-6 w-6 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
      </div>
    )
  }

  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />
  }

  return <Dashboard />
}
