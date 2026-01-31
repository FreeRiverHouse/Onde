'use client'

import { useEffect, useState } from 'react'

export default function MoonlightMagicHouse() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small delay to ensure smooth loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🌙</div>
            <p className="text-white text-xl font-semibold">Loading Moonlight Magic House...</p>
          </div>
        </div>
      )}

      {/* Game iframe - loads the static game build */}
      <iframe
        src="/static-games/moonlight-magic-house/index.html"
        className="w-full h-screen border-0"
        title="Moonlight Magic House"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />

      {/* 🐾 Bouncing Pet Mascots */}
      <div className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-end pointer-events-none overflow-hidden z-40">
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🐱</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.15s' }}>🐕</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐰</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.45s' }}>🐹</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🦊</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.75s' }}>🐸</span>
      </div>
    </div>
  )
}
