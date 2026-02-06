'use client'

import Link from 'next/link'

export interface CategoryGame {
  id: string
  href: string
  emoji: string
  title: string
  description: string
}

interface CategoryPageProps {
  title: string
  subtitle: string
  emoji: string
  headerGradient: string
  cardAccent: string
  games: CategoryGame[]
  relatedCategories: { href: string; emoji: string; name: string }[]
}

export default function CategoryPage({
  title,
  subtitle,
  emoji,
  headerGradient,
  cardAccent,
  games,
  relatedCategories,
}: CategoryPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-green-100">
      {/* Header */}
      <div className={`bg-gradient-to-r ${headerGradient} pt-6 pb-8 px-4 text-center shadow-lg relative overflow-hidden`}>
        {/* Decorative bubbles */}
        <div className="absolute top-2 left-4 text-4xl opacity-20 animate-pulse">✨</div>
        <div className="absolute top-6 right-8 text-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-2 left-1/4 text-2xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>

        <Link href="/games" className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full text-sm font-bold text-green-600 shadow hover:bg-white transition-colors">
          ← Games
        </Link>

        <div className="mt-6">
          <span className="text-5xl mb-2 block">{emoji}</span>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{title}</h1>
          <p className="text-white/90 text-sm md:text-base mt-2 max-w-md mx-auto">{subtitle}</p>
          <p className="text-white/70 text-xs mt-2">{games.length} games available</p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className={`group bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:${cardAccent} active:scale-95`}
            >
              <div className="text-center">
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">
                  {game.emoji}
                </span>
                <h2 className="font-bold text-gray-800 text-sm md:text-base">{game.title}</h2>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{game.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">🔗 Explore More Categories</h2>
          <div className="flex flex-wrap gap-3">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm font-medium text-gray-700 border border-gray-100"
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
            <Link
              href="/games/arcade"
              className="bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm font-medium text-gray-700 border border-gray-100"
            >
              🕹️ All Games
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6 text-gray-400 text-sm">
        🌈 More games coming soon! • <Link href="/games" className="text-green-500 hover:underline">Back to Gaming Island</Link>
      </div>
    </div>
  )
}
