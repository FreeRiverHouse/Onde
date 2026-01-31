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
    <div className="min-h-screen bg-gradient-to-b from-amber-200 via-orange-200 to-green-300 relative overflow-hidden">
      {/* Warm sunset sky overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-300/30 via-transparent to-transparent pointer-events-none" />
      
      {/* Sun with glow */}
      <div className="absolute top-4 right-8">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-60 animate-pulse" />
          <div className="text-7xl filter drop-shadow-[0_0_30px_rgba(255,200,0,0.8)]">☀️</div>
        </div>
      </div>

      {/* Fluffy clouds */}
      <div className="absolute top-12 left-8">
        <div className="relative">
          <div className="text-5xl opacity-90 animate-cloud">☁️</div>
          <div className="absolute -top-2 left-6 text-3xl opacity-80">☁️</div>
        </div>
      </div>
      <div className="absolute top-20 right-32 text-4xl opacity-80 animate-cloud-slow">☁️</div>
      <div className="absolute top-8 left-1/3 text-3xl opacity-70 animate-cloud" style={{ animationDelay: '2s' }}>☁️</div>

      {/* Flying Birds */}
      <div className="absolute top-16 left-1/4 text-xl animate-bird">🐦</div>
      <div className="absolute top-28 right-1/4 text-lg animate-bird" style={{ animationDelay: '1s' }}>🐦</div>
      <div className="absolute top-20 left-1/2 text-sm animate-bird" style={{ animationDelay: '0.5s' }}>🐦</div>

      {/* Header */}
      <div className="text-center pt-6 pb-2 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          🏝️ Gaming Island
        </h1>
        <p className="text-lg text-white/95 mt-1 drop-shadow-md font-medium">
          Welcome to Onde World! 🌈
        </p>
      </div>

      {/* Main Scene */}
      <div className="relative w-full max-w-6xl mx-auto h-[70vh] px-4">
        
        {/* Layered Ground with grass texture */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%]">
          {/* Base ground */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-700 via-green-500 to-green-400 rounded-t-[50%_40%]" />
          {/* Grass texture overlay */}
          <div className="absolute inset-0 rounded-t-[50%_40%] overflow-hidden">
            {/* Grass blades */}
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 w-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-full animate-grass"
                style={{
                  left: `${2 + i * 2.5}%`,
                  height: `${12 + Math.random() * 8}px`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          {/* Darker edge */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-800 to-transparent rounded-t-[50%_100%]" />
        </div>

        {/* Stone Path connecting buildings */}
        <svg className="absolute bottom-[12%] left-0 right-0 h-24 w-full" preserveAspectRatio="none">
          <path
            d="M 10% 80% Q 25% 30%, 50% 50% Q 75% 70%, 90% 40%"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="30"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4a574" />
              <stop offset="50%" stopColor="#c9a066" />
              <stop offset="100%" stopColor="#d4a574" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative stepping stones */}
        <div className="absolute bottom-[18%] left-[22%] w-5 h-3 bg-stone-400 rounded-full opacity-60 shadow-sm" />
        <div className="absolute bottom-[17%] left-[28%] w-6 h-4 bg-stone-400 rounded-full opacity-50 shadow-sm" />
        <div className="absolute bottom-[19%] left-[35%] w-4 h-3 bg-stone-500 rounded-full opacity-60 shadow-sm" />
        <div className="absolute bottom-[16%] right-[35%] w-5 h-3 bg-stone-400 rounded-full opacity-55 shadow-sm" />
        <div className="absolute bottom-[18%] right-[28%] w-6 h-4 bg-stone-500 rounded-full opacity-50 shadow-sm" />

        {/* === MOONLIGHT COTTAGE (Left) === */}
        <Link
          href="/games/moonlight-magic-house"
          className="absolute bottom-[26%] left-[3%] md:left-[8%] cursor-pointer group z-10"
          onMouseEnter={() => setHoveredArea('moonlight')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className={`transition-all duration-300 ${hoveredArea === 'moonlight' ? 'scale-110 -translate-y-2' : 'hover:scale-105'}`}>
            <div className="relative">
              {/* Warm glow behind house */}
              <div className="absolute inset-0 bg-amber-300/40 rounded-full blur-3xl scale-150 -z-10" />
              
              {/* Cottage structure */}
              <div className="relative w-32 md:w-40 h-36 md:h-44">
                {/* Main house body */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 md:w-36 h-24 md:h-28 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg shadow-xl border-2 border-amber-300">
                  {/* Stone texture overlay */}
                  <div className="absolute inset-0 opacity-20 rounded-lg" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #8b7355 1px, transparent 1px), radial-gradient(circle at 60% 60%, #8b7355 1px, transparent 1px), radial-gradient(circle at 80% 20%, #8b7355 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                  
                  {/* Window with cat */}
                  <div className="absolute top-3 left-3 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-lg border-2 border-amber-600 shadow-inner overflow-hidden">
                    {/* Window glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-300/50 to-transparent" />
                    {/* Cute cat */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg md:text-xl animate-cat-peek">🐱</div>
                  </div>
                  
                  {/* Second window */}
                  <div className="absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-lg border-2 border-amber-600 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-300/50 to-transparent" />
                    {/* Curtains */}
                    <div className="absolute top-0 left-0 w-1/3 h-full bg-red-400/40 rounded-l-lg" />
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-red-400/40 rounded-r-lg" />
                  </div>
                  
                  {/* Door */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-10 h-14 md:h-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-lg border-2 border-amber-800">
                    {/* Door details */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-amber-600 rounded-sm" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-4 bg-amber-600 rounded-sm" />
                    {/* Door knob */}
                    <div className="absolute top-1/2 right-1.5 w-2 h-2 bg-yellow-400 rounded-full shadow-md" />
                  </div>
                </div>
                
                {/* Roof */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 md:w-44">
                  {/* Main roof */}
                  <div className="w-full h-16 md:h-20 bg-gradient-to-b from-red-700 to-red-800 rounded-t-lg shadow-lg" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}>
                    {/* Roof tiles pattern */}
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.2) 8px, rgba(0,0,0,0.2) 10px)' }} />
                  </div>
                </div>
                
                {/* Chimney with animated smoke */}
                <div className="absolute top-2 right-4 md:right-6">
                  <div className="w-5 h-10 bg-gradient-to-b from-red-600 to-red-800 rounded-t border-2 border-red-900" />
                  {/* Smoke puffs */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="text-2xl opacity-60 animate-smoke-1">💨</div>
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <div className="text-xl opacity-40 animate-smoke-2">💨</div>
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="text-lg opacity-20 animate-smoke-3">💨</div>
                  </div>
                </div>
              </div>
              
              {/* Flower garden */}
              <div className="absolute -bottom-2 left-0 right-0 flex justify-around">
                <span className="text-lg animate-sway">🌷</span>
                <span className="text-xl animate-sway" style={{ animationDelay: '0.3s' }}>🌸</span>
                <span className="text-lg animate-sway" style={{ animationDelay: '0.6s' }}>🌺</span>
                <span className="text-xl animate-sway" style={{ animationDelay: '0.2s' }}>🌻</span>
                <span className="text-lg animate-sway" style={{ animationDelay: '0.5s' }}>🌼</span>
              </div>
              
              {/* Fence */}
              <div className="absolute -bottom-4 -left-4 -right-4 flex justify-between">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-2 h-4 bg-amber-600 rounded-t shadow-sm" />
                ))}
              </div>
            </div>
            
            {/* Sign */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl text-center shadow-xl mt-4 font-bold border-2 border-purple-400">
              <span className="drop-shadow-md">🐾 Moonlight House</span>
            </div>
          </div>
          
          {/* Hover tooltip */}
          {hoveredArea === 'moonlight' && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-2xl whitespace-nowrap z-20 border-2 border-purple-200 animate-bounce-in">
              <p className="text-sm font-bold text-purple-600">🏠✨ Pet simulation adventure!</p>
            </div>
          )}
        </Link>

        {/* === ARCADE CABINET (Center) === */}
        <Link
          href="/games/arcade"
          className="absolute bottom-[22%] left-1/2 -translate-x-1/2 cursor-pointer group z-10"
          onMouseEnter={() => setHoveredArea('arcade')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className={`transition-all duration-300 ${hoveredArea === 'arcade' ? 'scale-110 -translate-y-2' : 'hover:scale-105'}`}>
            <div className="relative">
              {/* Neon glow effects */}
              <div className="absolute -inset-4 bg-gradient-to-t from-purple-500/30 via-pink-500/20 to-blue-500/30 rounded-xl blur-2xl -z-10 animate-neon-glow" />
              
              {/* Cabinet body */}
              <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black w-32 md:w-40 h-56 md:h-68 rounded-t-3xl shadow-2xl border-4 border-gray-700 flex flex-col items-center relative overflow-hidden">
                {/* Neon trim */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-neon-slide" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-neon-slide-reverse" />
                
                {/* Marquee with neon effect */}
                <div className="relative w-[95%] h-10 mt-2 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 animate-gradient-shift" />
                  <div className="absolute inset-0.5 bg-black rounded-md flex items-center justify-center">
                    <span className="text-xs md:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 animate-text-shimmer">
                      🕹️ ONDE ARCADE 🎮
                    </span>
                  </div>
                  {/* Flickering effect */}
                  <div className="absolute inset-0 bg-white/10 animate-flicker" />
                </div>
                
                {/* Screen with glow */}
                <div className="relative w-[90%] h-28 md:h-36 mt-3">
                  {/* Screen glow */}
                  <div className="absolute -inset-2 bg-cyan-400/30 rounded-lg blur-md animate-screen-glow" />
                  {/* Screen border */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg p-1">
                    {/* Actual screen */}
                    <div className="w-full h-full bg-gradient-to-b from-blue-950 to-black rounded-md overflow-hidden relative">
                      {/* Scanlines */}
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }} />
                      {/* Game icons */}
                      <div className="grid grid-cols-2 gap-2 p-3 relative z-10">
                        {games.map(g => (
                          <div key={g.id} className="text-2xl hover:scale-125 transition-transform animate-pixel-pop" style={{ animationDelay: `${Math.random()}s` }}>
                            {g.emoji}
                          </div>
                        ))}
                      </div>
                      {/* CRT flicker */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent animate-crt" />
                    </div>
                  </div>
                </div>
                
                {/* Control panel */}
                <div className="w-[95%] h-16 mt-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg p-2 flex items-center justify-between border-t-2 border-gray-600">
                  {/* Joystick */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-b from-gray-600 to-gray-900 rounded-full shadow-inner flex items-center justify-center">
                      <div className="w-4 h-8 bg-gradient-to-b from-red-400 to-red-700 rounded-full shadow-lg animate-joystick" />
                    </div>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-lg border-2 border-blue-300 animate-button-glow" />
                    <div className="w-7 h-7 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-lg border-2 border-red-300 animate-button-glow" style={{ animationDelay: '0.5s' }} />
                    <div className="w-7 h-7 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-lg border-2 border-yellow-300 animate-button-glow" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
                
                {/* Coin slot */}
                <div className="absolute bottom-4 left-3 flex flex-col items-center gap-1">
                  <div className="w-6 h-3 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-sm border border-yellow-600 shadow-inner" />
                  <span className="text-[8px] text-yellow-400 font-bold">INSERT COIN</span>
                </div>
                
                {/* Speaker grille */}
                <div className="absolute bottom-4 right-3 w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-600">
                  <div className="absolute inset-1 rounded-full" style={{ backgroundImage: 'radial-gradient(circle, gray 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
                </div>
              </div>
              
              {/* Cabinet legs */}
              <div className="flex justify-between px-2">
                <div className="w-4 h-4 bg-gray-800 rounded-b" />
                <div className="w-4 h-4 bg-gray-800 rounded-b" />
              </div>
            </div>
            
            {/* Neon sign */}
            <div className="relative mt-3">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-orange-500 blur-lg opacity-60 animate-neon-pulse" />
              <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white px-5 py-2 rounded-xl text-center shadow-xl font-black text-sm border-2 border-white/30">
                🕹️ ARCADE
              </div>
            </div>
          </div>
          
          {/* Hover tooltip */}
          {hoveredArea === 'arcade' && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-2xl whitespace-nowrap z-20 border-2 border-red-200 animate-bounce-in">
              <p className="text-sm font-bold text-red-600">🎮✨ All games here!</p>
            </div>
          )}
        </Link>

        {/* === LIBRARY BOOKSHOP (Right) === */}
        <Link
          href="/libri"
          className="absolute bottom-[26%] right-[3%] md:right-[8%] cursor-pointer group z-10"
          onMouseEnter={() => setHoveredArea('library')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className={`transition-all duration-300 ${hoveredArea === 'library' ? 'scale-110 -translate-y-2' : 'hover:scale-105'}`}>
            <div className="relative">
              {/* Warm interior glow */}
              <div className="absolute inset-0 bg-amber-400/30 rounded-xl blur-2xl scale-125 -z-10" />
              
              {/* Building structure */}
              <div className="relative w-30 md:w-38 h-44 md:h-52">
                {/* Main building */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 md:w-36 h-32 md:h-40 bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-lg shadow-xl border-2 border-amber-400 overflow-hidden">
                  {/* Brick texture */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 12px, #8b4513 12px, #8b4513 14px), repeating-linear-gradient(0deg, transparent, transparent 8px, #8b4513 8px, #8b4513 10px)', backgroundSize: '28px 18px' }} />
                  
                  {/* Large window with books */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 md:w-24 h-16 md:h-20 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg border-4 border-amber-900 overflow-hidden shadow-inner">
                    {/* Window glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-400/60 to-amber-200/30" />
                    {/* Bookshelves visible through window */}
                    <div className="absolute inset-1 flex flex-col gap-1">
                      <div className="flex gap-0.5 justify-center">
                        <div className="w-2 h-5 bg-red-600 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-5 bg-blue-700 rounded-t-sm shadow-sm" />
                        <div className="w-2 h-5 bg-green-700 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-5 bg-purple-700 rounded-t-sm shadow-sm" />
                        <div className="w-2 h-5 bg-amber-700 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-5 bg-pink-600 rounded-t-sm shadow-sm" />
                      </div>
                      <div className="flex gap-0.5 justify-center">
                        <div className="w-1.5 h-4 bg-cyan-700 rounded-t-sm shadow-sm" />
                        <div className="w-2 h-4 bg-orange-600 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-4 bg-indigo-700 rounded-t-sm shadow-sm" />
                        <div className="w-2 h-4 bg-rose-600 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-4 bg-teal-700 rounded-t-sm shadow-sm" />
                      </div>
                      <div className="flex gap-0.5 justify-center">
                        <div className="w-2 h-3 bg-lime-700 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-3 bg-yellow-700 rounded-t-sm shadow-sm" />
                        <div className="w-2 h-3 bg-fuchsia-700 rounded-t-sm shadow-sm" />
                        <div className="w-1.5 h-3 bg-sky-700 rounded-t-sm shadow-sm" />
                      </div>
                    </div>
                    {/* Window frame cross */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-900" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-900" />
                  </div>
                  
                  {/* Door */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-16 md:h-18 bg-gradient-to-b from-amber-800 to-amber-950 rounded-t-lg border-2 border-amber-900 shadow-lg">
                    {/* Door window */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-500 rounded-md border border-amber-700">
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-400/50 to-transparent" />
                    </div>
                    {/* Door handle */}
                    <div className="absolute top-1/2 right-1.5 w-2 h-3 bg-yellow-500 rounded-full shadow-md" />
                  </div>
                  
                  {/* "OPEN" sign */}
                  <div className="absolute top-2 right-1 rotate-12">
                    <div className="bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg animate-open-sign">
                      OPEN
                    </div>
                  </div>
                </div>
                
                {/* Roof */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 md:w-44">
                  <div className="w-full h-14 md:h-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-xl shadow-lg" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}>
                    {/* Roof shingle texture */}
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.3) 6px, rgba(0,0,0,0.3) 8px)' }} />
                  </div>
                </div>
                
                {/* Awning */}
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-28 md:w-34 h-4 bg-gradient-to-b from-red-700 to-red-800 rounded-b-sm shadow-md">
                  <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)' }} />
                </div>
              </div>
              
              {/* Book display outside */}
              <div className="absolute -bottom-2 -left-2 text-lg">📚</div>
              <div className="absolute -bottom-3 -right-1 flex gap-1">
                <span className="text-sm">📖</span>
                <span className="text-xs">📕</span>
              </div>
              
              {/* Potted plant */}
              <div className="absolute bottom-0 -left-6 text-2xl">🪴</div>
              
              {/* Cat by door */}
              <div className="absolute bottom-0 right-0 text-lg animate-cat-sit">🐈</div>
            </div>
            
            {/* Sign */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white px-4 py-2 rounded-xl text-center shadow-xl mt-3 font-bold border-2 border-amber-500">
              <span className="drop-shadow-md">📚 Cozy Library</span>
            </div>
          </div>
          
          {/* Hover tooltip */}
          {hoveredArea === 'library' && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-2xl whitespace-nowrap z-20 border-2 border-amber-200 animate-bounce-in">
              <p className="text-sm font-bold text-amber-700">📖✨ Stories for everyone!</p>
            </div>
          )}
        </Link>

        {/* === DECORATIVE ELEMENTS === */}
        
        {/* Trees */}
        <div className="absolute bottom-[34%] left-[26%]">
          <div className="text-4xl drop-shadow-lg">🌳</div>
        </div>
        <div className="absolute bottom-[32%] right-[26%]">
          <div className="text-5xl drop-shadow-lg">🌲</div>
        </div>
        <div className="absolute bottom-[38%] left-[48%]">
          <div className="text-3xl drop-shadow-md">🌳</div>
        </div>
        
        {/* Flower patches */}
        <div className="absolute bottom-[28%] left-[32%] flex gap-1">
          <span className="text-lg animate-sway">🌸</span>
          <span className="text-sm animate-sway" style={{ animationDelay: '0.2s' }}>🌺</span>
        </div>
        <div className="absolute bottom-[30%] right-[32%] flex gap-1">
          <span className="text-sm animate-sway">🌷</span>
          <span className="text-lg animate-sway" style={{ animationDelay: '0.3s' }}>🌻</span>
        </div>
        
        {/* Rocks and nature */}
        <div className="absolute bottom-[22%] left-[40%] text-xl opacity-70">🪨</div>
        <div className="absolute bottom-[24%] right-[38%] text-lg opacity-60">🪨</div>
        
        {/* Butterflies */}
        <div className="absolute bottom-[40%] left-[35%] text-xl animate-butterfly">🦋</div>
        <div className="absolute bottom-[35%] right-[35%] text-lg animate-butterfly" style={{ animationDelay: '1.5s' }}>🦋</div>
        
        {/* Bench */}
        <div className="absolute bottom-[20%] left-[45%] text-2xl opacity-80">🪑</div>
        
        {/* Lamp post */}
        <div className="absolute bottom-[25%] right-[45%]">
          <div className="text-3xl">🏮</div>
          <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md -z-10 animate-lamp-glow" />
        </div>

        {/* === ANIMALS & CHARACTERS === */}
        
        {/* Walking kid */}
        <div className="absolute bottom-[16%] left-[30%] text-2xl animate-walk-slow">
          <span className="inline-block">🧒</span>
        </div>
        
        {/* Running dog */}
        <div className="absolute bottom-[14%] right-[30%] text-xl animate-run">
          <span className="inline-block transform -scale-x-100">🐕</span>
        </div>
        
        {/* Squirrel */}
        <div className="absolute bottom-[35%] left-[28%] text-lg animate-squirrel">🐿️</div>
        
        {/* Bird on ground */}
        <div className="absolute bottom-[15%] left-[50%] text-lg animate-hop">🐦</div>
        
        {/* Bunny */}
        <div className="absolute bottom-[20%] right-[25%] text-xl animate-hop" style={{ animationDelay: '0.5s' }}>🐰</div>

        {/* Hidden treasure */}
        <div 
          className="absolute bottom-[22%] right-[20%] text-xl opacity-20 hover:opacity-100 hover:scale-150 transition-all duration-500 cursor-pointer z-10"
          title="You found the treasure! 🎉"
        >
          <span className="animate-treasure">💎</span>
        </div>
        
        {/* Star sparkles */}
        <div className="absolute top-32 left-1/4 text-sm animate-twinkle">✨</div>
        <div className="absolute top-28 right-1/3 text-xs animate-twinkle" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-36 left-2/3 text-sm animate-twinkle" style={{ animationDelay: '1s' }}>✨</div>
      </div>

      {/* Back link */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          href="/"
          className="bg-white/95 hover:bg-white px-5 py-2.5 rounded-full font-bold text-sky-600 shadow-xl transition-all hover:scale-105 border-2 border-sky-200"
        >
          ← Home
        </Link>
      </div>

      <style jsx>{`
        @keyframes cloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        @keyframes cloud-slow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
        @keyframes bird {
          0% { transform: translateX(0) translateY(0) scaleX(1); }
          25% { transform: translateX(40px) translateY(-15px) scaleX(1); }
          50% { transform: translateX(80px) translateY(0) scaleX(-1); }
          75% { transform: translateX(40px) translateY(-10px) scaleX(-1); }
          100% { transform: translateX(0) translateY(0) scaleX(1); }
        }
        @keyframes grass {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes smoke-1 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-8px) translateX(4px) scale(1.2); opacity: 0.4; }
          100% { transform: translateY(-16px) translateX(8px) scale(0.8); opacity: 0; }
        }
        @keyframes smoke-2 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-10px) translateX(-3px) scale(1.1); opacity: 0.3; }
          100% { transform: translateY(-20px) translateX(6px) scale(0.6); opacity: 0; }
        }
        @keyframes smoke-3 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-12px) translateX(5px) scale(0.9); opacity: 0.15; }
          100% { transform: translateY(-24px) translateX(-4px) scale(0.5); opacity: 0; }
        }
        @keyframes cat-peek {
          0%, 70%, 100% { transform: translateX(-50%) translateY(0); }
          80% { transform: translateX(-50%) translateY(-3px); }
          90% { transform: translateX(-50%) translateY(0); }
        }
        @keyframes neon-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes neon-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes neon-slide-reverse {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes text-shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 0; }
          20%, 24%, 55% { opacity: 0.15; }
        }
        @keyframes screen-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes crt {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pixel-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes joystick {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes button-glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 15px currentColor, 0 0 25px currentColor; }
        }
        @keyframes neon-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes open-sign {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes cat-sit {
          0%, 90%, 100% { transform: translateY(0); }
          95% { transform: translateY(-2px); }
        }
        @keyframes butterfly {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -10px) rotate(10deg); }
          50% { transform: translate(30px, 0) rotate(-5deg); }
          75% { transform: translate(15px, 10px) rotate(5deg); }
        }
        @keyframes walk-slow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(50px); }
        }
        @keyframes run {
          0%, 100% { transform: translateX(0) scaleX(-1); }
          50% { transform: translateX(-60px) scaleX(-1); }
        }
        @keyframes squirrel {
          0%, 100% { transform: translateY(0); }
          10% { transform: translateY(-8px); }
          20% { transform: translateY(0); }
        }
        @keyframes hop {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes lamp-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes treasure {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px gold); }
          50% { filter: brightness(1.5) drop-shadow(0 0 20px gold); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bounce-in {
          0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .animate-cloud { animation: cloud 8s ease-in-out infinite; }
        .animate-cloud-slow { animation: cloud-slow 12s ease-in-out infinite; }
        .animate-bird { animation: bird 6s ease-in-out infinite; }
        .animate-grass { animation: grass 3s ease-in-out infinite; }
        .animate-sway { animation: sway 2s ease-in-out infinite; }
        .animate-smoke-1 { animation: smoke-1 3s ease-out infinite; }
        .animate-smoke-2 { animation: smoke-2 3.5s ease-out infinite; animation-delay: 0.5s; }
        .animate-smoke-3 { animation: smoke-3 4s ease-out infinite; animation-delay: 1s; }
        .animate-cat-peek { animation: cat-peek 4s ease-in-out infinite; }
        .animate-neon-glow { animation: neon-glow 2s ease-in-out infinite; }
        .animate-neon-slide { animation: neon-slide 3s linear infinite; }
        .animate-neon-slide-reverse { animation: neon-slide-reverse 3s linear infinite; }
        .animate-gradient-shift { animation: gradient-shift 3s ease infinite; background-size: 200% 200%; }
        .animate-text-shimmer { animation: text-shimmer 2s ease-in-out infinite; }
        .animate-flicker { animation: flicker 4s linear infinite; }
        .animate-screen-glow { animation: screen-glow 3s ease-in-out infinite; }
        .animate-crt { animation: crt 8s linear infinite; }
        .animate-pixel-pop { animation: pixel-pop 2s ease-in-out infinite; }
        .animate-joystick { animation: joystick 1s ease-in-out infinite; }
        .animate-button-glow { animation: button-glow 1.5s ease-in-out infinite; }
        .animate-neon-pulse { animation: neon-pulse 2s ease-in-out infinite; }
        .animate-open-sign { animation: open-sign 2s ease-in-out infinite; }
        .animate-cat-sit { animation: cat-sit 5s ease-in-out infinite; }
        .animate-butterfly { animation: butterfly 4s ease-in-out infinite; }
        .animate-walk-slow { animation: walk-slow 8s ease-in-out infinite; }
        .animate-run { animation: run 4s ease-in-out infinite; }
        .animate-squirrel { animation: squirrel 3s ease-in-out infinite; }
        .animate-hop { animation: hop 1.5s ease-in-out infinite; }
        .animate-lamp-glow { animation: lamp-glow 3s ease-in-out infinite; }
        .animate-treasure { animation: treasure 2s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}
