'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'

// Retro arcade sound effects using Web Audio API
function useArcadeSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Coin beep - short high-pitched blip
  const playCoinBeep = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
      oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.05) // E6
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.08)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  // Select sound - descending "insert coin" style
  const playSelectSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      
      // First tone
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.type = 'square'
      osc1.frequency.setValueAtTime(600, ctx.currentTime)
      gain1.gain.setValueAtTime(0.15, ctx.currentTime)
      gain1.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.1)
      
      // Second tone (higher)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'square'
      osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.08)
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.08)
      gain2.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc2.start(ctx.currentTime + 0.08)
      osc2.stop(ctx.currentTime + 0.2)
      
      // Third tone (highest) 
      const osc3 = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.connect(gain3)
      gain3.connect(ctx.destination)
      osc3.type = 'square'
      osc3.frequency.setValueAtTime(1000, ctx.currentTime + 0.16)
      gain3.gain.setValueAtTime(0.15, ctx.currentTime + 0.16)
      gain3.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc3.start(ctx.currentTime + 0.16)
      osc3.stop(ctx.currentTime + 0.3)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  return { playCoinBeep, playSelectSound }
}

const games = [
  { 
    id: 'moonlight', 
    href: '/games/moonlight-magic-house', 
    title: 'Moonlight', 
    desc: 'Magic Pet House',
    emoji: '🐱',
    color: 'from-purple-600 to-purple-900',
    glowColor: 'purple',
    screenTint: 'bg-purple-500/20'
  },
  { 
    id: 'skin', 
    href: '/games/skin-creator', 
    title: 'Skin Studio', 
    desc: 'Minecraft Skin Maker',
    emoji: '🎨',
    color: 'from-orange-500 to-orange-800',
    glowColor: 'orange',
    screenTint: 'bg-orange-500/20'
  },
  { 
    id: 'chef', 
    href: '/games/kids-chef-studio', 
    title: 'Kids Chef', 
    desc: 'Cooking Studio',
    emoji: '👨‍🍳',
    color: 'from-amber-500 to-amber-800',
    glowColor: 'amber',
    screenTint: 'bg-amber-500/20'
  },
  { 
    id: 'fortune', 
    href: '/games/fortune-cookie', 
    title: 'Fortune Cookie', 
    desc: 'Positive Messages',
    emoji: '🥠',
    color: 'from-yellow-500 to-yellow-800',
    glowColor: 'yellow',
    screenTint: 'bg-yellow-500/20'
  },
]

// Floating pixel particles
function FloatingPixels() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        >
          <div 
            className={`w-1 h-1 md:w-2 md:h-2 ${
              ['bg-pink-500', 'bg-cyan-400', 'bg-yellow-400', 'bg-purple-400', 'bg-green-400'][i % 5]
            } opacity-60`}
            style={{ boxShadow: '0 0 6px currentColor' }}
          />
        </div>
      ))}
    </div>
  )
}

// Arcade cabinet silhouettes in background
function ArcadeCabinets() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {/* Left cabinet */}
      <div className="absolute -left-20 bottom-0 w-48 h-96">
        <div className="w-full h-full bg-gradient-to-t from-gray-800 to-gray-900 rounded-t-xl" />
        <div className="absolute top-8 left-6 right-6 h-32 bg-cyan-500/30 rounded" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-500/40" />
      </div>
      {/* Right cabinet */}
      <div className="absolute -right-20 bottom-0 w-48 h-80">
        <div className="w-full h-full bg-gradient-to-t from-gray-800 to-gray-900 rounded-t-xl" />
        <div className="absolute top-8 left-6 right-6 h-28 bg-pink-500/30 rounded" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-500/40" />
      </div>
      {/* Far left small cabinet */}
      <div className="hidden md:block absolute left-10 bottom-0 w-32 h-64 opacity-50">
        <div className="w-full h-full bg-gradient-to-t from-gray-800 to-gray-900 rounded-t-lg" />
        <div className="absolute top-6 left-4 right-4 h-20 bg-green-500/20 rounded" />
      </div>
      {/* Far right small cabinet */}
      <div className="hidden md:block absolute right-10 bottom-0 w-32 h-72 opacity-50">
        <div className="w-full h-full bg-gradient-to-t from-gray-800 to-gray-900 rounded-t-lg" />
        <div className="absolute top-6 left-4 right-4 h-24 bg-purple-500/20 rounded" />
      </div>
    </div>
  )
}

// Neon tube lights
function NeonLights() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top horizontal neon */}
      <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-80">
        <div className="absolute inset-0 blur-md bg-pink-500" />
      </div>
      {/* Left vertical neon */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60">
        <div className="absolute inset-0 blur-lg bg-cyan-400" />
      </div>
      {/* Right vertical neon */}
      <div className="absolute right-0 top-1/3 bottom-1/3 w-1 bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-60">
        <div className="absolute inset-0 blur-lg bg-purple-500" />
      </div>
    </div>
  )
}

// Game card with CRT effect
function GameCard({ game, isSelected, onHover, onLeave, onSelect, playCoinBeep }: { 
  game: typeof games[0], 
  isSelected: boolean,
  onHover: () => void,
  onLeave: () => void,
  onSelect: () => void,
  playCoinBeep: () => void
}) {
  const [showInsertCoin, setShowInsertCoin] = useState(false)

  useEffect(() => {
    if (isSelected) {
      setShowInsertCoin(true)
      const interval = setInterval(() => setShowInsertCoin(prev => !prev), 500)
      return () => clearInterval(interval)
    }
    setShowInsertCoin(false)
  }, [isSelected])

  const handleHover = () => {
    onHover()
    playCoinBeep()
  }

  const handleClick = () => {
    onSelect()
  }

  return (
    <Link
      href={game.href}
      onMouseEnter={handleHover}
      onMouseLeave={onLeave}
      onClick={handleClick}
      className="group block"
    >
      {/* Arcade cabinet shape */}
      <div className={`
        relative transform transition-all duration-500 ease-out
        ${isSelected ? 'scale-110 -translate-y-4 z-20' : 'hover:scale-105 hover:-translate-y-2'}
      `}>
        {/* Cabinet body */}
        <div className={`
          relative bg-gradient-to-b from-gray-800 to-gray-900
          rounded-t-2xl rounded-b-lg overflow-hidden
          border-2 border-gray-700
          shadow-2xl
        `}>
          {/* Screen bezel */}
          <div className="p-3 pb-2">
            {/* CRT Screen */}
            <div className={`
              relative bg-gradient-to-br ${game.color}
              rounded-lg overflow-hidden
              aspect-square
            `}>
              {/* CRT curvature effect */}
              <div className="absolute inset-0 rounded-lg" style={{
                background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)'
              }} />
              
              {/* Scanlines */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)'
              }} />

              {/* Screen flicker on hover */}
              {isSelected && (
                <div className="absolute inset-0 bg-white/5 animate-flicker" />
              )}

              {/* Screen tint/glow */}
              <div className={`absolute inset-0 ${game.screenTint}`} />

              {/* Game emoji */}
              <div className="relative flex items-center justify-center h-full">
                <span className={`
                  text-7xl md:text-8xl transform transition-all duration-300
                  ${isSelected ? 'scale-110 animate-bounce-subtle' : 'group-hover:scale-105'}
                `} style={{
                  filter: isSelected ? 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'none'
                }}>
                  {game.emoji}
                </span>
              </div>

              {/* INSERT COIN overlay */}
              {isSelected && showInsertCoin && (
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-black/80 text-yellow-400 px-3 py-1 rounded font-mono text-xs font-bold tracking-wider">
                    INSERT COIN
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Game title marquee */}
          <div className={`
            bg-gradient-to-r ${game.color} 
            px-3 py-2 text-center
            border-t-2 border-white/20
          `}>
            <h2 className="text-lg md:text-xl font-black text-white tracking-wide drop-shadow-lg">
              {game.title}
            </h2>
            <p className="text-xs text-white/80 font-medium">
              {game.desc}
            </p>
          </div>

          {/* Control panel */}
          <div className="bg-gray-900 p-3 flex items-center justify-center gap-3">
            {/* Joystick */}
            <div className="relative">
              <div className="w-4 h-4 bg-gray-700 rounded-full" />
              <div className={`
                absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-5 
                bg-gradient-to-b from-red-500 to-red-700 rounded-full
                transition-transform duration-100
                ${isSelected ? 'rotate-12' : ''}
              `} />
            </div>
            {/* Buttons */}
            <div className="flex gap-1.5">
              <div className={`w-4 h-4 rounded-full bg-red-500 shadow-lg transition-all ${isSelected ? 'scale-90 brightness-150' : ''}`} />
              <div className={`w-4 h-4 rounded-full bg-blue-500 shadow-lg transition-all ${isSelected ? 'scale-110' : ''}`} />
              <div className={`w-4 h-4 rounded-full bg-yellow-500 shadow-lg`} />
            </div>
          </div>

          {/* Coin slot */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-full border border-gray-600" />
        </div>

        {/* Cabinet glow effect */}
        {isSelected && (
          <>
            <div className={`
              absolute -inset-4 rounded-2xl blur-xl -z-10 opacity-60
              bg-gradient-to-b ${game.color}
            `} />
            <div className="absolute -inset-1 rounded-2xl border-2 border-white/20 pointer-events-none" />
          </>
        )}
      </div>
    </Link>
  )
}

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [pressAnyKey, setPressAnyKey] = useState(true)
  const { playCoinBeep, playSelectSound } = useArcadeSounds()

  // Pulsing "press any button" effect
  useEffect(() => {
    const interval = setInterval(() => setPressAnyKey(prev => !prev), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Deep space background with arcade floor reflection feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-purple-950/50 to-gray-950" />
      
      {/* Arcade carpet pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, cyan 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, magenta 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, yellow 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px, 60px 60px, 60px 60px',
        backgroundPosition: '0 0, 30px 30px, 15px 15px'
      }} />

      {/* Ambient ceiling glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-transparent" />

      {/* Floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-cyan-900/10 via-purple-900/5 to-transparent" />

      {/* Components */}
      <FloatingPixels />
      <ArcadeCabinets />
      <NeonLights />

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)'
      }} />

      {/* Content */}
      <div className="relative z-10">
        {/* Back link */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href="/games"
            className="group flex items-center gap-2 bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm"
          >
            <span className="text-cyan-400">◀</span>
            <span>Island</span>
          </Link>
        </div>

        {/* Neon Sign Header */}
        <div className="text-center pt-8 pb-4 relative">
          <div className="inline-block relative">
            {/* Main title with neon effect */}
            <h1 className="text-5xl md:text-8xl font-black tracking-tight">
              <span className="relative inline-block">
                <span className="text-cyan-400" style={{
                  textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 80px #22d3ee'
                }}>ONDE</span>
              </span>
              <span className="mx-2 md:mx-4" />
              <span className="relative inline-block">
                <span className="text-pink-500" style={{
                  textShadow: '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 80px #ec4899'
                }}>ARCADE</span>
              </span>
            </h1>
            
            {/* Decorative joystick */}
            <div className="absolute -left-12 md:-left-20 top-1/2 -translate-y-1/2 text-4xl md:text-6xl opacity-80">
              🕹️
            </div>
            <div className="absolute -right-12 md:-right-20 top-1/2 -translate-y-1/2 text-4xl md:text-6xl opacity-80 transform scale-x-[-1]">
              🕹️
            </div>
          </div>
          
          {/* Subtitle with blinking effect */}
          <div className="mt-4 md:mt-6">
            <p className={`
              text-lg md:text-2xl font-mono tracking-widest transition-opacity duration-500
              ${pressAnyKey ? 'text-yellow-400 opacity-100' : 'text-yellow-400/50 opacity-70'}
            `} style={{
              textShadow: pressAnyKey ? '0 0 10px #facc15' : 'none'
            }}>
              ★ PRESS ANY BUTTON TO START ★
            </p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={selectedGame === game.id}
                onHover={() => setSelectedGame(game.id)}
                onLeave={() => setSelectedGame(null)}
                onSelect={playSelectSound}
                playCoinBeep={playCoinBeep}
              />
            ))}
          </div>
        </div>

        {/* HIGH SCORES Section */}
        <div className="max-w-md mx-auto px-4 py-6 md:py-10">
          <div className="relative bg-black rounded-2xl p-6 md:p-8 border-4 border-yellow-500/80 overflow-hidden shadow-2xl" style={{
            boxShadow: '0 0 30px rgba(234, 179, 8, 0.3), inset 0 0 60px rgba(0,0,0,0.8)'
          }}>
            {/* CRT scanlines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)'
            }} />
            
            {/* CRT curvature overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)'
            }} />

            {/* Screen phosphor glow */}
            <div className="absolute inset-0 bg-green-900/10 pointer-events-none" />
            
            <div className="relative">
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-black text-center mb-6 font-mono tracking-widest">
                <span className="text-red-500 animate-pulse" style={{ 
                  textShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444'
                }}>
                  ★ HIGH SCORES ★
                </span>
              </h3>
              
              {/* Score table */}
              <div className="space-y-2 font-mono">
                {[
                  { rank: 1, name: 'AAA', score: 999999, color: 'text-yellow-400' },
                  { rank: 2, name: 'ZZZ', score: 847320, color: 'text-cyan-400' },
                  { rank: 3, name: 'CAT', score: 654210, color: 'text-pink-400' },
                  { rank: 4, name: 'OMG', score: 420069, color: 'text-green-400' },
                  { rank: 5, name: 'LOL', score: 123456, color: 'text-purple-400' },
                ].map((entry, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between text-lg md:text-xl ${entry.color} tracking-wider`}
                    style={{
                      textShadow: `0 0 8px currentColor`
                    }}
                  >
                    <span className="w-8">{entry.rank}.</span>
                    <span className="flex-1 text-center tracking-[0.3em] font-bold">{entry.name}</span>
                    <span className="text-right tabular-nums">{entry.score.toLocaleString().padStart(10, ' ')}</span>
                  </div>
                ))}
              </div>

              {/* Decorative line */}
              <div className="my-6 border-t-2 border-dashed border-yellow-500/40" />

              {/* Insert Coin blinking */}
              <div className="text-center">
                <span className={`
                  inline-block font-mono text-lg md:text-xl tracking-[0.2em] font-bold
                  text-yellow-400 animate-blink
                `} style={{
                  textShadow: '0 0 10px #facc15, 0 0 20px #facc15'
                }}>
                  INSERT COIN
                </span>
              </div>

              {/* Credit counter */}
              <div className="mt-4 text-center font-mono text-sm text-gray-500">
                CREDIT(S): 00
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
          <div className="relative bg-black/60 rounded-2xl p-6 md:p-8 border border-purple-500/30 backdrop-blur overflow-hidden">
            {/* CRT effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
            }} />
            
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-black text-center mb-4">
                <span className="text-yellow-400" style={{ textShadow: '0 0 10px #facc15' }}>
                  🚀 COMING SOON
                </span>
              </h3>
              
              <p className="text-gray-400 text-center mb-6 font-mono">
                NEW GAMES LOADING...
              </p>
              
              <div className="flex justify-center gap-6 md:gap-10">
                {[
                  { emoji: '🚗✈️', label: 'Flying Cars' },
                  { emoji: '📝', label: 'Word Games' },
                  { emoji: '🎵', label: 'Music' },
                  { emoji: '🧩', label: 'Puzzles' },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-4xl md:text-5xl mb-2 opacity-40 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0">
                      {item.emoji}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with coin counter style */}
        <div className="text-center pb-8 md:pb-12">
          <div className="inline-flex items-center gap-3 bg-black/50 px-6 py-3 rounded-full border border-yellow-500/30">
            <span className="text-2xl">🪙</span>
            <span className="text-yellow-400 font-mono font-bold tracking-wider">
              {games.length} GAMES • FREE PLAY • NO COINS NEEDED
            </span>
            <span className="text-2xl">🪙</span>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.9; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.1; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1.1) translateY(0); }
          50% { transform: scale(1.1) translateY(-5px); }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-flicker {
          animation: flicker 0.1s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  )
}
