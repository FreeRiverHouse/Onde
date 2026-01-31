'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GamingIsland() {
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-cyan-300 to-blue-500 relative overflow-hidden">
      {/* Animated Clouds */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce-slow opacity-80">☁️</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce-slow delay-1000 opacity-70">☁️</div>
      <div className="absolute top-5 left-1/3 text-4xl animate-bounce-slow delay-500 opacity-60">☁️</div>

      {/* Sun */}
      <div className="absolute top-8 right-8 text-7xl animate-pulse">☀️</div>

      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">
          🏝️ Gaming Island
        </h1>
        <p className="text-xl text-white/90 mt-2 drop-shadow">
          Explore our fun games! Click an island to play! 🎮
        </p>
      </div>

      {/* Island Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-4 py-8">
        
        {/* Moonlight Island */}
        <Link 
          href="/games/moonlight-magic-house"
          className="relative group"
          onMouseEnter={() => setHoveredIsland('moonlight')}
          onMouseLeave={() => setHoveredIsland(null)}
        >
          <div className={`
            w-64 h-64 md:w-80 md:h-80 
            bg-gradient-to-b from-green-400 to-green-600 
            rounded-[50%_50%_45%_55%/60%_60%_40%_40%]
            shadow-2xl
            transition-all duration-300
            ${hoveredIsland === 'moonlight' ? 'scale-110 rotate-2' : 'hover:scale-105'}
          `}>
            {/* Palm Trees */}
            <div className="absolute -top-8 left-4 text-5xl">🌴</div>
            <div className="absolute -top-6 right-8 text-4xl">🌴</div>
            
            {/* House/Stand */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl mb-2 animate-bounce-soft">🏠</div>
              <div className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg">
                <h2 className="text-xl font-black text-purple-600">Moonlight</h2>
                <p className="text-xs text-gray-500">Magic Pet House 🐱</p>
              </div>
            </div>

            {/* Water splash */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-2xl opacity-60">💧</div>
          </div>
          
          {/* Hover info */}
          {hoveredIsland === 'moonlight' && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg whitespace-nowrap">
              <p className="text-sm font-bold text-purple-600">🐾 Pet simulation game!</p>
            </div>
          )}
        </Link>

        {/* Skin Creator Island */}
        <Link 
          href="/games/skin-creator"
          className="relative group"
          onMouseEnter={() => setHoveredIsland('skin')}
          onMouseLeave={() => setHoveredIsland(null)}
        >
          <div className={`
            w-64 h-64 md:w-80 md:h-80 
            bg-gradient-to-b from-amber-400 to-orange-500 
            rounded-[45%_55%_50%_50%/55%_65%_35%_45%]
            shadow-2xl
            transition-all duration-300
            ${hoveredIsland === 'skin' ? 'scale-110 -rotate-2' : 'hover:scale-105'}
          `}>
            {/* Palm Trees */}
            <div className="absolute -top-6 left-8 text-4xl">🌴</div>
            <div className="absolute -top-8 right-4 text-5xl">🌴</div>
            
            {/* Stand */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl mb-2 animate-bounce-soft">🎨</div>
              <div className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg">
                <h2 className="text-xl font-black text-orange-600">Skin Studio</h2>
                <p className="text-xs text-gray-500">Minecraft Skin Maker ⛏️</p>
              </div>
            </div>

            {/* Water splash */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-2xl opacity-60">💧</div>
          </div>
          
          {/* Hover info */}
          {hoveredIsland === 'skin' && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg whitespace-nowrap">
              <p className="text-sm font-bold text-orange-600">🖌️ Create custom skins!</p>
            </div>
          )}
        </Link>
      </div>

      {/* Ocean Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600 to-transparent">
        <div className="absolute bottom-4 left-0 right-0 flex justify-around text-4xl opacity-50">
          <span className="animate-wave">🌊</span>
          <span className="animate-wave delay-200">🌊</span>
          <span className="animate-wave delay-400">🌊</span>
          <span className="animate-wave delay-600">🌊</span>
          <span className="animate-wave delay-800">🌊</span>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute bottom-20 left-10 text-3xl animate-float">🐠</div>
      <div className="absolute bottom-24 right-16 text-2xl animate-float delay-1000">🐟</div>
      <div className="absolute bottom-16 left-1/3 text-2xl animate-float delay-500">🦀</div>

      {/* Back link */}
      <div className="absolute top-4 left-4">
        <Link 
          href="/"
          className="bg-white/80 hover:bg-white px-4 py-2 rounded-full font-bold text-blue-600 shadow-lg transition-all hover:scale-105"
        >
          ← Home
        </Link>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-bounce-soft { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-wave { animation: wave 2s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}
