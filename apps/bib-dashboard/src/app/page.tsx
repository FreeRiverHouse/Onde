import { getDashboardStats } from '@/lib/data'
import StatsCard from '@/components/StatsCard'
import ProgressChart from '@/components/ProgressChart'
import Timeline from '@/components/Timeline'
import SocialMetrics from '@/components/SocialMetrics'
import PublishingStats from '@/components/PublishingStats'
import RevenueCard from '@/components/RevenueCard'
import WorkerStatus from '@/components/WorkerStatus'

// Icons as SVG components
const TaskIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const SpinnerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const WorkerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

// For static export, we use the mock data at build time
// In production, this will be replaced with API calls from the client

export default async function Dashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-onde-gold/10 border border-onde-gold/20 mb-4">
          <div className="w-2 h-2 rounded-full bg-onde-green animate-pulse"></div>
          <span className="text-sm text-onde-gold">Building in Public</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-onde-gold">Onde</span> Progress Dashboard
        </h1>
        <p className="text-lg opacity-60 max-w-2xl mx-auto">
          Traccia in tempo reale tutto quello che stiamo costruendo.
          Libri, app, video, musica. Tutto trasparente.
        </p>
        <p className="text-sm opacity-40 mt-4">
          Last updated: {new Date(stats.lastUpdated).toLocaleString('it-IT')}
        </p>
      </section>

      {/* Main Stats Grid */}
      <section className="mb-12">
        <h2 className="section-title">
          <span className="text-2xl">📊</span>
          Factory Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Tasks"
            value={stats.tasks.total}
            icon={<TaskIcon />}
            color="gold"
          />
          <StatsCard
            title="Completed"
            value={stats.tasks.completed}
            subtitle={`${stats.tasks.completionRate}% done`}
            icon={<CheckIcon />}
            color="green"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="In Progress"
            value={stats.tasks.inProgress}
            icon={<SpinnerIcon />}
            color="blue"
          />
          <StatsCard
            title="Available"
            value={stats.tasks.available}
            icon={<TaskIcon />}
            color="purple"
          />
          <StatsCard
            title="Active Workers"
            value={stats.activeWorkers}
            subtitle="AI agents working"
            icon={<WorkerIcon />}
            color="gold"
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="mb-12">
        <h2 className="section-title">
          <span className="text-2xl">📈</span>
          Progress Overview
        </h2>
        <ProgressChart
          data={stats.categories}
          completionRate={stats.tasks.completionRate}
        />
      </section>

      {/* Publishing & Social Grid */}
      <section className="mb-12">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="section-title">
              <span className="text-2xl">📚</span>
              Publishing
            </h2>
            <PublishingStats
              booksPublished={stats.publishing.booksPublished}
              audiobooks={stats.publishing.audiobooks}
              podcasts={stats.publishing.podcasts}
              videos={stats.publishing.videos}
            />
          </div>
          <div>
            <h2 className="section-title">
              <span className="text-2xl">📱</span>
              Social Media
            </h2>
            <SocialMetrics
              xFollowers={stats.social.xFollowers}
              igFollowers={stats.social.igFollowers}
              tiktokFollowers={stats.social.tiktokFollowers}
              postsThisWeek={stats.social.postsThisWeek}
            />
          </div>
        </div>
      </section>

      {/* Revenue & Workers */}
      <section className="mb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="section-title">
              <span className="text-2xl">💰</span>
              Revenue Streams
            </h2>
            <RevenueCard
              kdpEarnings={stats.revenue.kdpEarnings}
              spotifyPlays={stats.revenue.spotifyPlays}
              youtubeViews={stats.revenue.youtubeViews}
            />
          </div>
          <div>
            <h2 className="section-title">
              <span className="text-2xl">🤖</span>
              Workers
            </h2>
            <WorkerStatus activeWorkers={stats.activeWorkers} />
          </div>
        </div>
      </section>

      {/* Activity Timeline */}
      <section className="mb-12">
        <h2 className="section-title">
          <span className="text-2xl">⏰</span>
          Recent Activity
        </h2>
        <Timeline items={stats.recentActivity} />
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <h2 className="section-title">
          <span className="text-2xl">🔗</span>
          Quick Links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="https://x.com/Onde_FRH"
            target="_blank"
            rel="noopener noreferrer"
            className="stat-card hover:border-onde-gold/50 group text-center"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">𝕏</div>
            <span className="text-sm opacity-60">@Onde_FRH</span>
          </a>
          <a
            href="https://x.com/FreeRiverHouse"
            target="_blank"
            rel="noopener noreferrer"
            className="stat-card hover:border-onde-gold/50 group text-center"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏠</div>
            <span className="text-sm opacity-60">@FreeRiverHouse</span>
          </a>
          <a
            href="https://youtube.com/@OndeLounge"
            target="_blank"
            rel="noopener noreferrer"
            className="stat-card hover:border-red-500/50 group text-center"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📺</div>
            <span className="text-sm opacity-60">YouTube</span>
          </a>
          <a
            href="https://github.com/FreeRiverHouse/Onde"
            target="_blank"
            rel="noopener noreferrer"
            className="stat-card hover:border-purple-500/50 group text-center"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💻</div>
            <span className="text-sm opacity-60">GitHub</span>
          </a>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="text-center py-12 border-t border-white/10">
        <blockquote className="text-2xl font-light italic opacity-80 max-w-3xl mx-auto">
          "Facciamo fiorire il mondo. Portiamo il DNA umano nelle AI."
        </blockquote>
        <p className="mt-4 text-sm opacity-40">La missione di Onde</p>
      </section>
    </div>
  )
}
