import { getDashboardStats } from '@/lib/data'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PostApproval } from '@/components/PostApproval'
import { PolyRobortoPanel } from '@/components/PolyRobortoPanel'

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
        <h1 className="text-2xl font-semibold text-white mb-1">FreeRiverHouse HQ</h1>
        <p className="text-white/40 text-sm">Central Operations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-semibold text-white">{stats.publishing.booksPublished}</div>
          <div className="text-xs text-white/40">Books</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-semibold text-emerald-400">{stats.tasks.completionRate}%</div>
          <div className="text-xs text-white/40">Tasks Done</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-semibold text-amber-400">{stats.tasks.inProgress}</div>
          <div className="text-xs text-white/40">In Progress</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-semibold text-white">{stats.activeWorkers}</div>
          <div className="text-xs text-white/40">Agents</div>
        </div>
      </div>

      {/* Main Grid - 2 columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Post Approval */}
        <PostApproval />

        {/* Right: PolyRoborto */}
        <PolyRobortoPanel />
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-4 gap-3">
        <a href="https://onde.la" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center">
          <div className="text-xl mb-1">🌊</div>
          <div className="text-white text-sm">onde.la</div>
        </a>
        <a href="https://x.com/Onde_FRH" target="_blank" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center">
          <div className="text-xl mb-1">𝕏</div>
          <div className="text-white text-sm">@Onde_FRH</div>
        </a>
        <a href="https://github.com/FreeRiverHouse/Onde" target="_blank" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center">
          <div className="text-xl mb-1">⚡</div>
          <div className="text-white text-sm">GitHub</div>
        </a>
        <a href="https://youtube.com/@OndeLounge" target="_blank" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center">
          <div className="text-xl mb-1">▶️</div>
          <div className="text-white text-sm">YouTube</div>
        </a>
      </div>
    </div>
  )
}
