'use client'

import Link from 'next/link'
import { useState } from 'react'

const games = [
  { 
    id: 'moonlight', 
    href: '/games/moonlight-magic-house', 
    title: 'Moonlight', 
    desc: 'Magic Pet House',
    emoji: '🐱',
    color: 'from-purple-500 to-purple-700',
    textColor: 'text-purple-600'
  },
  { 
    id: 'skin', 
    href: '/games/skin-creator', 
    title: 'Skin Studio', 
    desc: 'Minecraft Skin Maker',
    emoji: '🎨',
    color: 'from-orange-500 to-orange-700',
    textColor: 'text-orange-600'
  },
  { 
    id: 'chef', 
    href: '/games/kids-chef-studio', 
    title: 'Kids Chef', 
    desc: 'Cooking Studio',
    emoji: '👨‍🍳',
    color: 'from-amber-500 to-amber-700',
    textColor: 'text-amber-600'
  },
  { 
    id: 'fortune', 
    href: '/games/fortune-cookie', 
    title: 'Fortune Cookie', 
    desc: 'Positive Messages',
    emoji: '🥠',
    color: 'from-yellow-500 to-yellow-700',
    textColor: 'text-yellow-600'
  },
]

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Arcade atmosphere - neon glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
      }} />

      {/* Back link */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          href="/games"
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 border border-white/20"
        >
          ← Island
        </Link>
      </div>

      {/* Header - Neon sign style */}
      <div className="text-center pt-8 pb-6 relative">
        <div className="inline-block relative">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg animate-pulse">
            🕹️ ONDE ARCADE
          </h1>
          {/* Neon glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-pink-500/20 blur-2xl -z-10" />
        </div>
        <p className="text-xl text-gray-300 mt-4 font-mono">
          INSERT COIN TO PLAY • SELECT YOUR GAME
        </p>
      </div>

      {/* Games Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              onMouseEnter={() => setSelectedGame(game.id)}
              onMouseLeave={() => setSelectedGame(null)}
              className="group"
            >
              <div className={`
                relative bg-gradient-to-b ${game.color} 
                rounded-xl p-4 shadow-2xl
                transform transition-all duration-300
                ${selectedGame === game.id ? 'scale-110 -rotate-2' : 'hover:scale-105'}
                border-4 border-white/20
              `}>
                {/* Glow effect on hover */}
                {selectedGame === game.id && (
                  <div className="absolute -inset-2 bg-white/20 rounded-xl blur-xl -z-10 animate-pulse" />
                )}
                
                {/* Game icon */}
                <div className="text-6xl md:text-7xl text-center mb-3 transform group-hover:scale-110 transition-transform">
                  {game.emoji}
                </div>
                
                {/* Game info */}
                <div className="bg-black/50 rounded-lg p-2 backdrop-blur">
                  <h2 className="text-lg font-black text-white text-center">
                    {game.title}
                  </h2>
                  <p className="text-xs text-gray-300 text-center">
                    {game.desc}
                  </p>
                </div>

                {/* Play button */}
                <div className="mt-3 bg-green-500 hover:bg-green-400 text-white font-bold py-2 rounded-lg text-center text-sm transition-colors">
                  ▶ PLAY
                </div>

                {/* Pixel corners */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-white/50" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-white/50" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/50" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur">
          <h3 className="text-2xl font-black text-yellow-400 mb-2">🚀 COMING SOON</h3>
          <p className="text-gray-400 mb-4">More games are on the way!</p>
          <div className="flex justify-center gap-4 text-4xl opacity-50">
            <span title="Flying Car LA">🚗✈️</span>
            <span title="Word Games">📝</span>
            <span title="Music">🎵</span>
            <span title="Puzzles">🧩</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center pb-8">
        <p className="text-gray-500 text-sm font-mono">
          🎮 {games.length} GAMES AVAILABLE • NO COINS NEEDED • FREE TO PLAY
        </p>
      </div>

      {/* Decorative arcade elements */}
      <div className="absolute bottom-10 left-10 text-4xl opacity-30 animate-bounce">🎰</div>
      <div className="absolute bottom-20 right-10 text-3xl opacity-30 animate-bounce delay-500">🎯</div>
      <div className="absolute top-1/3 left-5 text-2xl opacity-20 animate-pulse">⭐</div>
      <div className="absolute top-1/2 right-5 text-2xl opacity-20 animate-pulse delay-700">⭐</div>

      <style jsx>{`
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  )
}
