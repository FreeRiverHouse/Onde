'use client'

import Link from 'next/link'
import { useState } from 'react'

const games = [
  { id: 'moonlight', href: '/games/moonlight-magic-house', title: 'Moonlight', desc: 'Pet House', emoji: '🐱' },
  { id: 'skin', href: '/games/skin-creator', title: 'Skin Studio', desc: 'Minecraft Skins', emoji: '🎨' },
  { id: 'chef', href: '/games/kids-chef-studio', title: 'Kids Chef', desc: 'Cooking', emoji: '👨‍🍳' },
  { id: 'fortune', href: '/games/fortune-cookie', title: 'Fortune', desc: 'Cookie', emoji: '🥠' },
]

export default function GamingIsland() {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-green-400 relative overflow-hidden">
      {/* Sky */}
      <div className="absolute top-8 left-12 text-5xl animate-bounce-slow opacity-70">☁️</div>
      <div className="absolute top-16 right-24 text-4xl animate-bounce-slow delay-500 opacity-60">☁️</div>
      <div className="absolute top-6 left-1/3 text-3xl animate-bounce-slow delay-1000 opacity-50">☁️</div>
      <div className="absolute top-6 right-10 text-6xl animate-pulse">☀️</div>

      {/* Flying Birds */}
      <div className="absolute top-20 left-1/4 text-xl animate-fly opacity-70">🐦</div>
      <div className="absolute top-24 right-1/3 text-lg animate-fly delay-700 opacity-60">🐦</div>

      {/* Header */}
      <div className="text-center pt-6 pb-2 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
          🏝️ Gaming Island
        </h1>
        <p className="text-lg text-white/90 mt-1 drop-shadow">
          Welcome to Onde World! 🌈
        </p>
      </div>

      {/* Main Scene */}
      <div className="relative w-full max-w-6xl mx-auto h-[70vh] px-4">
        
        {/* Ground/Grass */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-600 via-green-500 to-green-400 rounded-t-[50%_30%] shadow-inner" />

        {/* === MOONLIGHT HOUSE (Left) === */}
        <Link
          href="/games/moonlight-magic-house"
          className="absolute bottom-[28%] left-[5%] md:left-[10%] cursor-pointer group"
          onMouseEnter={() => setHoveredArea('moonlight')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className={`transition-all duration-300 ${hoveredArea === 'moonlight' ? 'scale-110' : 'hover:scale-105'}`}>
            {/* House */}
            <div className="relative">
              <div className="text-7xl md:text-8xl drop-shadow-lg">🏠</div>
              {/* Chimney smoke */}
              <div className="absolute -top-4 right-2 text-2xl animate-float opacity-50">💨</div>
              {/* Pet in window */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">🐱</div>
            </div>
            {/* Sign */}
            <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-center shadow-lg mt-2 text-sm font-bold">
              🐾 Moonlight
            </div>
          </div>
          {/* Hover tooltip */}
          {hoveredArea === 'moonlight' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg whitespace-nowrap z-20">
              <p className="text-sm font-bold text-purple-600">🏠 Pet simulation game!</p>
            </div>
          )}
        </Link>

        {/* === ARCADE CABINET (Center) === */}
        <Link
          href="/games/arcade"
          className="absolute bottom-[25%] left-1/2 -translate-x-1/2 cursor-pointer group"
          onMouseEnter={() => setHoveredArea('arcade')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className={`transition-all duration-300 ${hoveredArea === 'arcade' ? 'scale-110' : 'hover:scale-105'}`}>
            {/* Cabinet */}
            <div className="relative">
              {/* Cabinet body */}
              <div className="bg-gradient-to-b from-red-600 via-red-700 to-red-900 w-28 md:w-36 h-48 md:h-60 rounded-t-xl shadow-2xl border-4 border-red-800 flex flex-col items-center pt-2">
                {/* Marquee */}
                <div className="bg-yellow-400 w-[90%] h-6 rounded flex items-center justify-center text-xs font-black text-red-800 animate-pulse">
                  🕹️ ONDE ARCADE
                </div>
                {/* Screen */}
                <div className="bg-black w-[85%] h-24 md:h-32 mt-2 rounded border-2 border-gray-600 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {games.map(g => (
                      <div key={g.id} className="text-lg hover:scale-125 transition-transform">
                        {g.emoji}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Controls */}
                <div className="mt-2 flex gap-2 items-center">
                  <div className="w-6 h-6 bg-black rounded-full shadow-inner" />
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                  </div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-yellow-400/20 rounded-xl blur-xl -z-10 animate-pulse" />
            </div>
            {/* Sign */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-lg text-center shadow-lg mt-2 font-black text-sm">
              🕹️ ARCADE
            </div>
          </div>
          {/* Hover tooltip */}
          {hoveredArea === 'arcade' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg whitespace-nowrap z-20">
              <p className="text-sm font-bold text-red-600">🎮 All games here!</p>
            </div>
          )}
        </Link>

        {/* === LIBRARY (Right) === */}
        <Link
          href="/libri"
          className="absolute bottom-[28%] right-[5%] md:right-[10%] cursor-pointer group"
          onMouseEnter={() => setHoveredArea('library')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className={`transition-all duration-300 ${hoveredArea === 'library' ? 'scale-110' : 'hover:scale-105'}`}>
            {/* Bookshelf building */}
            <div className="relative">
              <div className="bg-gradient-to-b from-amber-700 to-amber-900 w-24 md:w-32 h-36 md:h-44 rounded-t-lg shadow-2xl flex flex-col items-center pt-2 border-4 border-amber-800">
                {/* Roof */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[120%] h-8 bg-red-700 rounded-t-lg" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
                {/* Shelves with books */}
                <div className="w-[85%] flex flex-col gap-1 mt-4">
                  <div className="flex gap-0.5 justify-center">
                    <div className="w-2 h-6 bg-red-500 rounded-sm" />
                    <div className="w-2 h-6 bg-blue-500 rounded-sm" />
                    <div className="w-2 h-6 bg-green-500 rounded-sm" />
                    <div className="w-2 h-6 bg-yellow-500 rounded-sm" />
                    <div className="w-2 h-6 bg-purple-500 rounded-sm" />
                  </div>
                  <div className="flex gap-0.5 justify-center">
                    <div className="w-2 h-5 bg-pink-500 rounded-sm" />
                    <div className="w-2 h-5 bg-cyan-500 rounded-sm" />
                    <div className="w-2 h-5 bg-orange-500 rounded-sm" />
                    <div className="w-2 h-5 bg-lime-500 rounded-sm" />
                  </div>
                  <div className="flex gap-0.5 justify-center">
                    <div className="w-2 h-4 bg-indigo-500 rounded-sm" />
                    <div className="w-2 h-4 bg-rose-500 rounded-sm" />
                    <div className="w-2 h-4 bg-teal-500 rounded-sm" />
                  </div>
                </div>
                {/* Door */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-amber-950 rounded-t-lg border-2 border-amber-800">
                  <div className="absolute top-4 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                </div>
              </div>
            </div>
            {/* Sign */}
            <div className="bg-amber-700 text-white px-3 py-1 rounded-lg text-center shadow-lg mt-2 text-sm font-bold">
              📚 Library
            </div>
          </div>
          {/* Hover tooltip */}
          {hoveredArea === 'library' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg whitespace-nowrap z-20">
              <p className="text-sm font-bold text-amber-700">📖 Stories for kids!</p>
            </div>
          )}
        </Link>

        {/* Decorative elements */}
        <div className="absolute bottom-[32%] left-[30%] text-3xl">🌳</div>
        <div className="absolute bottom-[30%] right-[28%] text-4xl">🌴</div>
        <div className="absolute bottom-[35%] left-[45%] text-2xl animate-float delay-500">🦋</div>
        
        {/* Path/Road */}
        <div className="absolute bottom-[15%] left-[20%] right-[20%] h-8 bg-amber-200/50 rounded-full blur-sm" />

        {/* Hidden treasure */}
        <div 
          className="absolute bottom-[20%] right-[25%] text-xl opacity-20 hover:opacity-100 hover:scale-150 transition-all duration-500 cursor-pointer animate-sparkle z-10"
          title="You found the treasure! 🎉"
        >
          💎
        </div>

        {/* Characters walking */}
        <div className="absolute bottom-[18%] left-[35%] text-2xl animate-walk">🚶</div>
        <div className="absolute bottom-[16%] right-[40%] text-xl animate-walk delay-1000">🧒</div>
      </div>

      {/* Back link */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          href="/"
          className="bg-white/90 hover:bg-white px-4 py-2 rounded-full font-bold text-sky-600 shadow-lg transition-all hover:scale-105"
        >
          ← Home
        </Link>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes sparkle {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px gold); }
          50% { filter: brightness(1.5) drop-shadow(0 0 10px gold); }
        }
        @keyframes fly {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-10px); }
        }
        @keyframes walk {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-fly { animation: fly 4s ease-in-out infinite; }
        .animate-walk { animation: walk 3s ease-in-out infinite; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}
