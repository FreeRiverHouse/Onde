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
import { GlowCard } from '@/components/ui/GlowCard'

export const runtime = 'edge'

export default async function Dashboard() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="mb-12 relative">
        {/* Background glow for header */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-purple-500/20 blur-[100px] pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <h1 className="relative text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white tracking-tight">
                  FreeRiverHouse
                </h1>
              </div>
              <span className="text-4xl md:text-5xl font-light text-white/20">HQ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs text-emerald-300 font-medium">All systems operational</span>
            </div>
            <span className="text-white/30 text-sm">Central Operations Dashboard</span>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-white/20 text-sm">
            <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 font-mono text-xs">⌘K</kbd>
            <span>Quick actions</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats with Sparklines */}
      <div className="mb-8">
        <EnhancedStats stats={stats} />
      </div>

      {/* Main Grid - 3 columns on large screens */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Left column: Post Approval */}
        <div className="lg:col-span-2">
          <GlowCard variant="cyan" noPadding noTilt>
            <PostApproval />
          </GlowCard>
        </div>

        {/* Right column: Activity Feed */}
        <div className="lg:col-span-1">
          <GlowCard variant="purple" noPadding noTilt>
            <ActivityFeed maxItems={6} />
          </GlowCard>
        </div>
      </div>

      {/* Second Row - PolyRoborto & Weekly Comparison */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <GlowCard variant="gold" noPadding noTilt>
            <PolyRobortoPanel />
          </GlowCard>
        </div>
        <div className="lg:col-span-1">
          <GlowCard variant="cyan" noPadding noTilt>
            <WeeklyComparison stats={stats} />
          </GlowCard>
        </div>
      </div>

      {/* Third Row - Free River House Map */}
      <div className="mb-6">
        <GlowCard variant="emerald" noPadding noTilt>
          <FreeRiverHouse />
        </GlowCard>
      </div>

      {/* Fourth Row - Agent Tasks & CORDE */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <GlowCard variant="purple" noPadding noTilt>
          <AgentTasksPanel />
        </GlowCard>
        <GlowCard variant="cyan" noPadding noTilt>
          <CordePanel />
        </GlowCard>
      </div>

      {/* Fifth Row - Tech Support */}
      <div className="mb-8">
        <GlowCard variant="gold" noPadding noTilt>
          <TechSupportPanel />
        </GlowCard>
      </div>

      {/* Quick Links - Bento Grid Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <QuickLink 
          href="/house" 
          icon="🏠" 
          title="House" 
          subtitle="Dashboard"
          gradient="from-amber-500/20 to-orange-500/20"
          borderColor="border-amber-500/20 hover:border-amber-400/40"
          glowColor="hover:shadow-amber-500/20"
        />
        <QuickLink 
          href="/pr" 
          icon="📢" 
          title="OndePR" 
          subtitle="Approve Posts"
          gradient="from-cyan-500/20 to-blue-500/20"
          borderColor="border-cyan-500/20 hover:border-cyan-400/40"
          glowColor="hover:shadow-cyan-500/20"
        />
        <QuickLink 
          href="/frh" 
          icon="🤖" 
          title="Agents" 
          subtitle="7 Active"
          gradient="from-purple-500/20 to-indigo-500/20"
          borderColor="border-purple-500/20 hover:border-purple-400/40"
          glowColor="hover:shadow-purple-500/20"
        />
        <QuickLink 
          href="/betting" 
          icon="🎰" 
          title="Betting" 
          subtitle="Kalshi Live"
          gradient="from-emerald-500/20 to-teal-500/20"
          borderColor="border-emerald-500/20 hover:border-emerald-400/40"
          glowColor="hover:shadow-emerald-500/20"
        />
        <QuickLink 
          href="https://onde.la" 
          icon="🌊" 
          title="onde.la" 
          subtitle="Main Site"
          external
        />
        <QuickLink 
          href="https://x.com/Onde_FRH" 
          icon="𝕏" 
          title="@Onde_FRH" 
          subtitle="Twitter/X"
          external
        />
        <QuickLink 
          href="https://github.com/FreeRiverHouse/Onde" 
          icon={<GitHubIcon />}
          title="GitHub" 
          subtitle="Source Code"
          external
        />
        <QuickLink 
          href="https://youtube.com/@OndeLounge" 
          icon={<YouTubeIcon />}
          title="YouTube" 
          subtitle="Onde Lounge"
          external
        />
      </div>
    </div>
  )
}

function QuickLink({ 
  href, 
  icon, 
  title, 
  subtitle, 
  gradient = 'from-white/5 to-white/[0.02]',
  borderColor = 'border-white/10 hover:border-white/20',
  glowColor = 'hover:shadow-white/10',
  external = false 
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
  gradient?: string
  borderColor?: string
  glowColor?: string
  external?: boolean
}) {
  return (
    <a 
      href={href} 
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`
        group relative overflow-hidden
        bg-gradient-to-br ${gradient}
        rounded-2xl p-4 
        border ${borderColor}
        transition-all duration-500 ease-out
        hover:shadow-2xl ${glowColor}
        hover:-translate-y-1
        text-center
      `}
    >
      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </div>
      
      <div className="relative z-10">
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="text-white text-sm font-medium">{title}</div>
        <div className="text-white/30 text-xs mt-0.5">{subtitle}</div>
      </div>
    </a>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg className="w-6 h-6 mx-auto text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}
