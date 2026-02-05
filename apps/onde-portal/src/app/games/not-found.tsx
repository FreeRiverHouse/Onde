import Link from 'next/link'

export default function GamesNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated game over text */}
        <div className="relative mb-8">
          <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
            404
          </span>
          <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🎮</div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Game Not Found!
        </h1>
        
        <p className="text-white/60 mb-8 text-lg">
          Looks like this game hasn&apos;t been unlocked yet... 
          <br />
          <span className="text-2xl">🔒</span>
        </p>

        {/* Pixel art style divider */}
        <div className="flex justify-center gap-1 mb-8">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-3 bg-purple-500 rounded-sm"
              style={{ 
                opacity: 0.3 + (i % 2) * 0.4,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/games/arcade/"
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>🕹️</span>
            Browse All Games
          </Link>
          
          <Link
            href="/"
            className="w-full px-6 py-3 text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Back to Home
          </Link>
        </div>

        {/* Fun hint */}
        <p className="mt-8 text-white/30 text-sm">
          Hint: Try our fun educational games! 🎮
        </p>
      </div>
    </div>
  )
}
