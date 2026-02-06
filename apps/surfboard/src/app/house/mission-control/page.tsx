'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import { ActivityFeed } from '@/components/ActivityFeed'

interface AgentStatus {
  name: string
  emoji: string
  status: 'active' | 'idle' | 'offline'
  lastAction?: string
  lastActionTime?: string
  tasksCompleted: number
  currentTask?: string
}

interface Stats {
  totalActivities: number
  todayActivities: number
  activeAgents: number
  tasksCompletedToday: number
}

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

function AgentCard({ agent }: { agent: AgentStatus }) {
  const statusColors = {
    active: 'bg-emerald-400',
    idle: 'bg-amber-400',
    offline: 'bg-red-400',
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{agent.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{agent.name}</span>
            <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
          </div>
          <span className="text-xs text-white/40 capitalize">{agent.status}</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{agent.tasksCompleted}</div>
          <div className="text-xs text-white/40">tasks</div>
        </div>
      </div>
      {agent.currentTask && (
        <div className="text-xs text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/10 rounded-lg px-3 py-1.5 truncate">
          🔨 {agent.currentTask}
        </div>
      )}
      {agent.lastAction && (
        <div className="text-xs text-white/30 mt-2 truncate">
          Last: {agent.lastAction} {agent.lastActionTime && `• ${agent.lastActionTime}`}
        </div>
      )}
    </div>
  )
}

type FilterType = 'all' | 'agent' | 'content' | 'infra'

const filterCategories: Record<FilterType, string[]> = {
  all: [],
  agent: ['agent_action', 'task_completed', 'task_started', 'heartbeat', 'memory_update', 'cron_job'],
  content: ['post_approved', 'post_rejected', 'post_created', 'post_posted', 'image_generated', 'book_updated', 'translation'],
  infra: ['deploy', 'git_commit', 'monitor', 'error', 'alert', 'game_tested'],
}

export default function MissionControlPage() {
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    todayActivities: 0,
    activeAgents: 0,
    tasksCompletedToday: 0,
  })
  const [agents] = useState<AgentStatus[]>([
    { name: 'Clawdinho', emoji: '🐾', status: 'active', tasksCompleted: 94, currentTask: 'Mission Control Dashboard', lastAction: 'Game testing complete', lastActionTime: '5m ago' },
    { name: 'Ondinho', emoji: '🌊', status: 'idle', tasksCompleted: 12, lastAction: 'Translation pipeline', lastActionTime: '2h ago' },
  ])
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/activity?limit=100')
      if (res.ok) {
        const data = await res.json()
        const activities = data.activities || []
        const today = new Date().toISOString().split('T')[0]
        const todayActivities = activities.filter((a: { created_at: string }) => a.created_at?.startsWith(today))
        const tasksToday = todayActivities.filter((a: { type: string }) => a.type === 'task_completed')
        
        setStats({
          totalActivities: activities.length,
          todayActivities: todayActivities.length,
          activeAgents: agents.filter(a => a.status === 'active').length,
          tasksCompletedToday: tasksToday.length,
        })
      }
    } catch {
      // stats fetch failed silently
    }
  }, [agents])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">🎛️</span>
              Mission Control
            </h1>
            <p className="text-white/40 text-sm mt-1">Free River House Agent Operations Center</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/house"
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              ← Dashboard
            </a>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Systems Online</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard emoji="⚡" label="Total Activities" value={stats.totalActivities} />
          <StatCard emoji="📅" label="Today" value={stats.todayActivities} />
          <StatCard emoji="🤖" label="Active Agents" value={stats.activeAgents} />
          <StatCard emoji="✅" label="Tasks Today" value={stats.tasksCompletedToday} />
        </div>

        {/* Agents */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🤖</span> Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.name} agent={agent} />
            ))}
          </div>
        </div>

        {/* Activity Feed - Full Width */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>⚡</span> Activity Timeline
            </h2>
            <div className="flex gap-2">
              {(Object.keys(filterCategories) as FilterType[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    activeFilter === filter
                      ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                      : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'
                  }`}
                >
                  {filter === 'all' && '🌐 All'}
                  {filter === 'agent' && '🤖 Agents'}
                  {filter === 'content' && '📝 Content'}
                  {filter === 'infra' && '🔧 Infra'}
                </button>
              ))}
            </div>
          </div>
          <ActivityFeed
            maxItems={20}
            showHeader={false}
            className="bg-white/[0.02]"
          />
        </div>

        {/* Footer */}
        <div className="text-center text-white/20 text-xs py-4">
          Mission Control v1.0 • Free River House • {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
