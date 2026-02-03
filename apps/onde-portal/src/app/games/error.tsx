'use client'

import { useEffect } from 'react'

export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Games error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Oops! Game Crashed
        </h2>
        <p className="text-white/60 mb-6">
          Something went wrong while loading the game. Don&apos;t worry, your progress might be saved!
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-3 bg-red-500/20 rounded-lg text-left">
            <p className="text-red-300 text-xs font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            Try Again
          </button>
          
          <a
            href="/games"
            className="w-full px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Back to Games
          </a>
        </div>

        <p className="mt-6 text-white/40 text-xs">
          If this keeps happening, try refreshing the page or clearing your browser cache.
        </p>
      </div>
    </div>
  )
}
