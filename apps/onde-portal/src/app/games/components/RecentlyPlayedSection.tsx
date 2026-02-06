'use client'

import Link from 'next/link'
import { useRecentlyPlayed } from '@/hooks/useRecentlyPlayed'

/**
 * Format a timestamp into a human-readable "X ago" string.
 */
function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

/**
 * "Recently Played" floating-bottle row for the /games page.
 * Only renders when there is at least one recent game.
 */
export default function RecentlyPlayedSection() {
  const { recentGames, clearHistory, mounted } = useRecentlyPlayed()

  // Don't render anything during SSR or when there's no history
  if (!mounted || recentGames.length === 0) return null

  return (
    <section className="w-full max-w-4xl mx-auto px-4 pt-2 pb-4 relative z-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] flex items-center gap-2">
          <span className="animate-sway inline-block">🍾</span>
          <span>Recently Played</span>
        </h2>
        <button
          onClick={clearHistory}
          className="text-xs text-white/60 hover:text-white/90 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full transition-all border border-white/10 hover:border-white/30"
          title="Clear history"
        >
          ✕ Clear
        </button>
      </div>

      {/* Games row — scrollable on small screens */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recentGames.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className="group flex-shrink-0"
          >
            {/* Message-in-a-bottle card */}
            <div className="relative w-24 md:w-28 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-lg hover:bg-white/25 hover:border-white/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Bottle cork top */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-amber-600/70 rounded-t-full border border-amber-500/50" />

              {/* Emoji */}
              <div className="text-3xl md:text-4xl text-center mb-1 group-hover:scale-110 transition-transform">
                {game.emoji}
              </div>

              {/* Title */}
              <div className="text-[11px] md:text-xs font-bold text-white text-center truncate drop-shadow-sm">
                {game.title}
              </div>

              {/* Time ago */}
              <div className="text-[9px] md:text-[10px] text-cyan-200/80 text-center mt-0.5">
                {timeAgo(game.lastPlayed)}
              </div>

              {/* Subtle wave decoration at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0 rounded-b-2xl" />
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-sway { animation: sway 2s ease-in-out infinite; }
      `}</style>
    </section>
  )
}
