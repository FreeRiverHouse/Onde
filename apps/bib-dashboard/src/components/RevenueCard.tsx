'use client'

interface RevenueCardProps {
  kdpEarnings: string
  spotifyPlays: string
  youtubeViews: string
}

export default function RevenueCard({
  kdpEarnings,
  spotifyPlays,
  youtubeViews
}: RevenueCardProps) {
  const streams = [
    {
      name: 'Amazon KDP',
      value: kdpEarnings,
      icon: '📖',
      description: 'Book royalties',
      color: 'from-orange-500 to-amber-600',
      status: kdpEarnings === 'Coming Soon' ? 'pending' : 'active'
    },
    {
      name: 'Spotify',
      value: spotifyPlays,
      icon: '🎧',
      description: 'Podcast plays',
      color: 'from-green-500 to-emerald-600',
      status: spotifyPlays === 'Coming Soon' ? 'pending' : 'active'
    },
    {
      name: 'YouTube',
      value: youtubeViews,
      icon: '📺',
      description: 'Ad revenue',
      color: 'from-red-500 to-red-700',
      status: youtubeViews === 'Coming Soon' ? 'pending' : 'active'
    },
    {
      name: 'Onde Books',
      value: 'Coming Soon',
      icon: '🌊',
      description: 'Direct sales',
      color: 'from-blue-500 to-cyan-600',
      status: 'pending'
    },
    {
      name: 'App Store',
      value: 'Coming Soon',
      icon: '📱',
      description: 'App purchases',
      color: 'from-purple-500 to-violet-600',
      status: 'pending'
    },
    {
      name: 'Merchandise',
      value: 'Q2 2026',
      icon: '🧸',
      description: 'EMILIO toys & more',
      color: 'from-pink-500 to-rose-600',
      status: 'future'
    }
  ]

  const activeStreams = streams.filter(s => s.status === 'active').length

  return (
    <div className="chart-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
        <div>
          <p className="text-sm opacity-60 mb-1">Revenue Streams</p>
          <p className="text-4xl font-bold">
            <span className="text-onde-gold glow-text">{activeStreams}</span>
            <span className="text-xl opacity-40 ml-2">/ 6 active</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-60 mb-1">Q1 Target</p>
          <p className="text-2xl font-semibold text-onde-green">$1,000/mo</p>
        </div>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {streams.map((stream, index) => (
          <div
            key={stream.name}
            className={`p-4 rounded-xl transition-all group ${
              stream.status === 'active'
                ? 'bg-white/10 hover:bg-white/15'
                : 'bg-white/5 opacity-60 hover:opacity-80'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stream.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform ${stream.status !== 'active' ? 'grayscale' : ''}`}>
              {stream.icon}
            </div>
            <h4 className="font-semibold text-sm mb-1">{stream.name}</h4>
            <p className="text-xs opacity-40 mb-2">{stream.description}</p>
            <p className={`text-lg font-bold ${
              stream.status === 'active' ? 'text-onde-gold' : 'opacity-40'
            }`}>
              {stream.value}
            </p>

            {/* Status Badge */}
            <div className="mt-2">
              {stream.status === 'active' && (
                <span className="badge badge-green text-xs">Active</span>
              )}
              {stream.status === 'pending' && (
                <span className="badge badge-yellow text-xs">Setting up</span>
              )}
              {stream.status === 'future' && (
                <span className="badge badge-purple text-xs">Planned</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Philosophy */}
      <div className="mt-6 p-4 rounded-xl bg-onde-gold/10 border border-onde-gold/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-onde-gold mb-1">Revenue Strategy</p>
            <p className="text-sm opacity-80">
              Piccoli margini x Alto volume = Profitto sostenibile.
              Un libro in 6 lingue, 4 formati = 24 prodotti. Automazione totale.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar to Target */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="opacity-60">Progress to Q1 Target</span>
          <span className="text-onde-gold">$0 / $1,000</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-onde-gold to-amber-500 transition-all duration-1000"
            style={{ width: '0%' }}
          />
        </div>
        <p className="text-xs opacity-40 mt-2 text-center">
          Building the machine first, revenue will follow
        </p>
      </div>
    </div>
  )
}
