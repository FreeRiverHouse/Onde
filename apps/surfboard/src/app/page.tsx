import { getDashboardStats } from '@/lib/data'

// SVG Icons
const WaveIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4v2c-2.6 0-4.8-1.3-6.5-3.3C11.8 12.5 9.6 11 7 11c-1.5 0-3 .7-4.2 2L2 12z"/>
  </svg>
)

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

export default async function SurfBoard() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="mb-20 text-center relative">
        {/* Surfboard Hero Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-64 bg-gradient-to-b from-surf-cyan/20 to-transparent rounded-full blur-3xl"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surf-teal/10 border border-surf-teal/20 mb-6 animate-fade-in">
          <WaveIcon />
          <span className="text-sm text-surf-aqua font-medium">Onde Command Center</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          <span className="glow-text text-surf-aqua">Surf</span>
          <span className="text-surf-foam">Board</span>
        </h1>

        <p className="text-xl text-surf-foam/60 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Cavalca la corrente. Monitora il flusso. <br />
          <span className="text-surf-gold">Tutto in tempo reale.</span>
        </p>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <BookIcon />
            <span className="stat-number text-2xl">{stats.publishing.booksPublished}</span>
            <span className="text-surf-foam/40 text-sm">libri</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <ChartIcon />
            <span className="stat-number-gold text-2xl">{stats.tasks.completionRate}%</span>
            <span className="text-surf-foam/40 text-sm">completato</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <UsersIcon />
            <span className="stat-number text-2xl">{stats.activeWorkers}</span>
            <span className="text-surf-foam/40 text-sm">agenti attivi</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {/* Factory Status Card */}
        <div className="surf-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-surf-foam flex items-center gap-2">
              <RocketIcon />
              Factory Status
            </h2>
            <span className="badge badge-live">Operativa</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-2xl bg-white/5">
              <div className="stat-number mb-1">{stats.tasks.total}</div>
              <div className="text-sm text-surf-foam/50">Task Totali</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-surf-teal/10">
              <div className="stat-number mb-1">{stats.tasks.completed}</div>
              <div className="text-sm text-surf-foam/50">Completati</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-surf-gold/10">
              <div className="stat-number-gold mb-1">{stats.tasks.inProgress}</div>
              <div className="text-sm text-surf-foam/50">In Corso</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5">
              <div className="stat-number mb-1">{stats.tasks.available}</div>
              <div className="text-sm text-surf-foam/50">Disponibili</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surf-foam/50">Progresso Globale</span>
              <span className="text-surf-aqua font-medium">{stats.tasks.completionRate}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.tasks.completionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="surf-card-gold">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-surf-foam flex items-center gap-2">
              <SparklesIcon />
              Revenue
            </h2>
            <span className="badge badge-gold">Live</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <span className="text-surf-foam/60">KDP Earnings</span>
              <span className="stat-number-gold text-xl">${stats.revenue.kdpEarnings}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <span className="text-surf-foam/60">Spotify Plays</span>
              <span className="stat-number text-xl">{stats.revenue.spotifyPlays}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <span className="text-surf-foam/60">YouTube Views</span>
              <span className="stat-number text-xl">{stats.revenue.youtubeViews}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Publishing Section */}
      <section className="mb-16">
        <h2 className="section-title">
          <BookIcon />
          Publishing Hub
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="surf-card text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-surf-teal to-surf-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookIcon />
            </div>
            <div className="stat-number text-3xl mb-1">{stats.publishing.booksPublished}</div>
            <div className="text-surf-foam/50">Libri Pubblicati</div>
          </div>

          <div className="surf-card text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div className="stat-number text-3xl mb-1">{stats.publishing.audiobooks}</div>
            <div className="text-surf-foam/50">Audiobooks</div>
          </div>

          <div className="surf-card text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            </div>
            <div className="stat-number text-3xl mb-1">{stats.publishing.podcasts}</div>
            <div className="text-surf-foam/50">Podcast Episodes</div>
          </div>

          <div className="surf-card text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayIcon />
            </div>
            <div className="stat-number text-3xl mb-1">{stats.publishing.videos}</div>
            <div className="text-surf-foam/50">Videos</div>
          </div>
        </div>
      </section>

      {/* Social & Activity */}
      <section className="grid lg:grid-cols-2 gap-6 mb-16">
        {/* Social Metrics */}
        <div className="surf-card">
          <h2 className="section-title">
            <UsersIcon />
            Social Media
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-xl">𝕏</div>
                <span className="text-surf-foam">X / Twitter</span>
              </div>
              <div className="text-right">
                <div className="stat-number text-xl">{stats.social.xFollowers}</div>
                <div className="text-xs text-surf-foam/40">followers</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </div>
                <span className="text-surf-foam">Instagram</span>
              </div>
              <div className="text-right">
                <div className="stat-number text-xl">{stats.social.igFollowers}</div>
                <div className="text-xs text-surf-foam/40">followers</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </div>
                <span className="text-surf-foam">TikTok</span>
              </div>
              <div className="text-right">
                <div className="stat-number text-xl">{stats.social.tiktokFollowers}</div>
                <div className="text-xs text-surf-foam/40">followers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="surf-card">
          <h2 className="section-title">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Attività Recente
          </h2>

          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-surf-cyan"></div>
                <div className="flex-1">
                  <div className="text-surf-foam text-sm">{activity.title}</div>
                  <div className="text-surf-foam/40 text-xs mt-1">{activity.timestamp}</div>
                </div>
                <span className={`badge ${activity.status === 'completed' ? 'badge-live' : 'badge-gold'}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-16">
        <h2 className="section-title">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Quick Links
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="https://onde.la"
            className="surf-card text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌊</div>
            <span className="text-surf-foam font-medium">onde.la</span>
            <div className="text-surf-foam/40 text-xs mt-1">Main Site</div>
          </a>

          <a
            href="https://x.com/Onde_FRH"
            target="_blank"
            rel="noopener noreferrer"
            className="surf-card text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">𝕏</div>
            <span className="text-surf-foam font-medium">@Onde_FRH</span>
            <div className="text-surf-foam/40 text-xs mt-1">Twitter/X</div>
          </a>

          <a
            href="https://github.com/FreeRiverHouse/Onde"
            target="_blank"
            rel="noopener noreferrer"
            className="surf-card text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💻</div>
            <span className="text-surf-foam font-medium">GitHub</span>
            <div className="text-surf-foam/40 text-xs mt-1">Open Source</div>
          </a>

          <a
            href="https://youtube.com/@OndeLounge"
            target="_blank"
            rel="noopener noreferrer"
            className="surf-card text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📺</div>
            <span className="text-surf-foam font-medium">YouTube</span>
            <div className="text-surf-foam/40 text-xs mt-1">Onde Lounge</div>
          </a>
        </div>
      </section>

      {/* Mission */}
      <section className="text-center py-16 border-t border-white/5">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-surf-cyan/20 blur-3xl"></div>
          <blockquote className="relative text-3xl font-light italic text-surf-foam/80 max-w-3xl mx-auto">
            "Orientarsi nella corrente."
          </blockquote>
        </div>
        <p className="mt-6 text-surf-cyan/60">La missione di Onde</p>
      </section>
    </div>
  )
}
