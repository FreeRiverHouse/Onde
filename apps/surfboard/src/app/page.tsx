import { getDashboardStats } from '@/lib/data'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PostApproval } from '@/components/PostApproval'
import { PolyRobortoPanel } from '@/components/PolyRobortoPanel'
import { CordePanel } from '@/components/CordePanel'
import { TechSupportPanel } from '@/components/TechSupportPanel'
import { EnhancedStats, WeeklyComparison } from '@/components/EnhancedStats'
import { ActivityFeed } from '@/components/ActivityFeed'
import { AgentTasksPanel } from '@/components/AgentTasksPanel'
import { FreeRiverHouse } from '@/components/FreeRiverHouse'

export const runtime = 'edge'

export default async function Dashboard() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-white">FreeRiverHouse HQ</h1>
          <div className="flex items-center gap-2">
            <div className="status-dot status-dot-online" />
            <span className="text-xs text-white/40">All systems operational</span>
          </div>
        </div>
        <p className="text-white/40 text-sm">Central Operations Dashboard</p>
        <p className="text-white/20 text-xs mt-1">Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/40">Cmd+K</kbd> for quick actions</p>
      </div>

      {/* Enhanced Stats with Sparklines */}
      <EnhancedStats stats={stats} />

      {/* Main Grid - 3 columns on large screens */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Left column: Post Approval */}
        <div className="lg:col-span-2">
          <PostApproval />
        </div>

        {/* Right column: Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed maxItems={6} />
        </div>
      </div>

      {/* Second Row - PolyRoborto & Weekly Comparison */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PolyRobortoPanel />
        </div>
        <div className="lg:col-span-1">
          <WeeklyComparison stats={stats} />
        </div>
      </div>

      {/* Third Row - Free River House Map */}
      <div className="mb-6">
        <FreeRiverHouse />
      </div>

      {/* Fourth Row - Agent Tasks & CORDE */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <AgentTasksPanel />
        <CordePanel />
      </div>

      {/* Fourth Row - Tech Support */}
      <div className="grid lg:grid-cols-1 gap-6">
        <TechSupportPanel />
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <a href="/frh" className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/50 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all text-center group">
          <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🤖</div>
          <div className="text-white text-sm font-medium">FRH Agents</div>
          <div className="text-purple-300/50 text-xs mt-0.5">7 Active</div>
        </a>
        <a href="https://onde.la" target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center group">
          <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🌊</div>
          <div className="text-white text-sm font-medium">onde.la</div>
          <div className="text-white/30 text-xs mt-0.5">Main Site</div>
        </a>
        <a href="https://x.com/Onde_FRH" target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center group">
          <div className="text-xl mb-1 group-hover:scale-110 transition-transform">&#120143;</div>
          <div className="text-white text-sm font-medium">@Onde_FRH</div>
          <div className="text-white/30 text-xs mt-0.5">Twitter/X</div>
        </a>
        <a href="https://github.com/FreeRiverHouse/Onde" target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center group">
          <div className="text-xl mb-1 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <div className="text-white text-sm font-medium">GitHub</div>
          <div className="text-white/30 text-xs mt-0.5">Source Code</div>
        </a>
        <a href="https://youtube.com/@OndeLounge" target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center group">
          <div className="text-xl mb-1 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 mx-auto text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div className="text-white text-sm font-medium">YouTube</div>
          <div className="text-white/30 text-xs mt-0.5">Onde Lounge</div>
        </a>
      </div>
    </div>
  )
}
