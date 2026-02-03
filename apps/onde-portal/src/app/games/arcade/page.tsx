'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// =============================================================================
// RETRO ARCADE SOUND EFFECTS
// =============================================================================

function useArcadeSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playCoinBeep = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.05)
      
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.08)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  const playSelectSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [600, 800, 1000]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08)
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.1)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.1)
      })
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  const playNavigateSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.05)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  return { playCoinBeep, playSelectSound, playNavigateSound }
}

// =============================================================================
// GAME DATA - ALL 24 GAMES!
// =============================================================================

type Category = 'Action' | 'Puzzle' | 'Educational' | 'Creative'

interface Game {
  id: string
  href: string
  title: string
  desc: string
  emoji: string
  color: string
  glowColor: string
  category: Category
  isNew?: boolean
  isFeatured?: boolean
}

const allGames: Game[] = [
  // 🎮 ACTION GAMES
  { id: 'catch', href: '/games/catch', title: 'Catch!', desc: 'Catch falling objects', emoji: '🧺', color: 'from-red-500 to-red-800', glowColor: 'red', category: 'Action' },
  { id: 'reaction', href: '/games/reaction', title: 'Reaction', desc: 'Test your reflexes', emoji: '⚡', color: 'from-yellow-400 to-orange-600', glowColor: 'yellow', category: 'Action' },
  { id: 'whack', href: '/games/whack', title: 'Whack-a-Mole', desc: 'Whack the moles!', emoji: '🔨', color: 'from-amber-500 to-amber-800', glowColor: 'amber', category: 'Action' },
  { id: 'snake', href: '/games/snake', title: 'Snake', desc: 'Classic snake game', emoji: '🐍', color: 'from-green-500 to-green-800', glowColor: 'green', category: 'Action', isNew: true },
  { id: 'bubbles', href: '/games/bubbles', title: 'Bubbles', desc: 'Pop the bubbles!', emoji: '🫧', color: 'from-blue-400 to-cyan-600', glowColor: 'cyan', category: 'Action' },
  
  // 🧩 PUZZLE GAMES
  { id: 'puzzle', href: '/games/puzzle', title: 'Puzzle', desc: 'Solve the puzzle', emoji: '🧩', color: 'from-purple-500 to-purple-800', glowColor: 'purple', category: 'Puzzle' },
  { id: 'memory', href: '/games/memory', title: 'Memory', desc: 'Match the pairs', emoji: '🧠', color: 'from-pink-500 to-pink-800', glowColor: 'pink', category: 'Puzzle' },
  { id: 'matching', href: '/games/matching', title: 'Matching', desc: 'Find the matches', emoji: '🎴', color: 'from-indigo-500 to-indigo-800', glowColor: 'indigo', category: 'Puzzle' },
  { id: 'simon', href: '/games/simon', title: 'Simon Says', desc: 'Remember the pattern', emoji: '🔴', color: 'from-red-400 to-red-700', glowColor: 'red', category: 'Puzzle' },
  { id: 'spot', href: '/games/spot-difference', title: 'Spot It!', desc: 'Find the difference', emoji: '🔍', color: 'from-teal-500 to-teal-800', glowColor: 'teal', category: 'Puzzle' },
  { id: 'word', href: '/games/word-puzzle', title: 'Word Puzzle', desc: 'Solve word games', emoji: '📝', color: 'from-sky-500 to-sky-800', glowColor: 'sky', category: 'Puzzle' },
  { id: 'tictactoe', href: '/games/tictactoe', title: 'Tic Tac Toe', desc: 'Classic X and O', emoji: '⭕', color: 'from-slate-500 to-slate-800', glowColor: 'slate', category: 'Puzzle' },
  
  // 📚 EDUCATIONAL GAMES
  { id: 'alphabet', href: '/games/alphabet', title: 'ABC Fun', desc: 'Learn the alphabet', emoji: '🔤', color: 'from-green-400 to-emerald-700', glowColor: 'emerald', category: 'Educational' },
  { id: 'counting', href: '/games/counting', title: 'Counting', desc: 'Learn to count', emoji: '🔢', color: 'from-blue-500 to-blue-800', glowColor: 'blue', category: 'Educational' },
  { id: 'math', href: '/games/math', title: 'Math Quest', desc: 'Math adventures', emoji: '➕', color: 'from-orange-400 to-orange-700', glowColor: 'orange', category: 'Educational' },
  { id: 'typing', href: '/games/typing', title: 'Typing', desc: 'Learn to type', emoji: '⌨️', color: 'from-gray-500 to-gray-800', glowColor: 'gray', category: 'Educational' },
  { id: 'quiz', href: '/games/quiz', title: 'Quiz Time', desc: 'Test your knowledge', emoji: '❓', color: 'from-violet-500 to-violet-800', glowColor: 'violet', category: 'Educational' },
  { id: 'fortune', href: '/games/fortune-cookie', title: 'Fortune Cookie', desc: 'Get your fortune', emoji: '🥠', color: 'from-yellow-500 to-yellow-800', glowColor: 'yellow', category: 'Educational', isFeatured: true },
  
  // 🎨 CREATIVE GAMES
  { id: 'draw', href: '/games/draw', title: 'Draw', desc: 'Free drawing', emoji: '✏️', color: 'from-rose-500 to-rose-800', glowColor: 'rose', category: 'Creative' },
  { id: 'coloring', href: '/games/coloring', title: 'Coloring', desc: 'Color the pictures', emoji: '🖍️', color: 'from-fuchsia-500 to-fuchsia-800', glowColor: 'fuchsia', category: 'Creative' },
  { id: 'music', href: '/games/music', title: 'Music', desc: 'Make music', emoji: '🎵', color: 'from-cyan-500 to-cyan-800', glowColor: 'cyan', category: 'Creative' },
  { id: 'skin', href: '/games/skin-creator', title: 'Skin Creator', desc: 'Minecraft skins', emoji: '🎨', color: 'from-orange-500 to-orange-800', glowColor: 'orange', category: 'Creative' },
  { id: 'chef', href: '/games/kids-chef-studio', title: 'Chef Studio', desc: 'Cook recipes', emoji: '👨‍🍳', color: 'from-amber-500 to-amber-800', glowColor: 'amber', category: 'Creative' },
  { id: 'moonlight', href: '/games/moonlight-magic-house', title: 'Moonlight', desc: 'Magic pet house', emoji: '🐱', color: 'from-purple-600 to-purple-900', glowColor: 'purple', category: 'Creative' },
]

const categories: { name: Category; emoji: string; color: string }[] = [
  { name: 'Action', emoji: '🎮', color: 'from-red-500 to-orange-500' },
  { name: 'Puzzle', emoji: '🧩', color: 'from-purple-500 to-pink-500' },
  { name: 'Educational', emoji: '📚', color: 'from-green-500 to-emerald-500' },
  { name: 'Creative', emoji: '🎨', color: 'from-blue-500 to-cyan-500' },
]

// =============================================================================
// VISUAL COMPONENTS
// =============================================================================

// Floating coins and stars animation
function FloatingCoinsAndStars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={`coin-${i}`}
          className="absolute animate-float-coin"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        >
          <span className="text-xl md:text-2xl opacity-60" style={{ 
            filter: 'drop-shadow(0 0 8px gold)',
            transform: `rotate(${Math.random() * 360}deg)`
          }}>
            {i % 3 === 0 ? '🪙' : i % 3 === 1 ? '⭐' : '✨'}
          </span>
        </div>
      ))}
    </div>
  )
}

// Rainbow gradient border component
function RainbowBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-75 blur animate-rainbow-shift" />
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// Scanlines overlay
function ScanlinesOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.04]" 
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)'
      }} 
    />
  )
}

// CRT Screen flicker effect
function CRTFlicker() {
  return (
    <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-[0.02] bg-white" />
  )
}

// Neon tube decorations
function NeonTubes() {
  return (
    <>
      {/* Top neon bar */}
      <div className="absolute top-0 left-[10%] right-[10%] h-1">
        <div className="h-full bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-neon-pulse" />
        <div className="absolute inset-0 blur-lg bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
      </div>
      {/* Left neon bar */}
      <div className="absolute left-0 top-[20%] bottom-[20%] w-1">
        <div className="h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-neon-pulse" />
        <div className="absolute inset-0 blur-lg bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
      </div>
      {/* Right neon bar */}
      <div className="absolute right-0 top-[20%] bottom-[20%] w-1">
        <div className="h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-neon-pulse" />
        <div className="absolute inset-0 blur-lg bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
      </div>
    </>
  )
}

// Arcade cabinet frame (wood/metal look)
function ArcadeCabinetFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Cabinet side panels (wood grain) */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-r-4 border-amber-950 z-40">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }} />
        {/* Metal bolts */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border border-gray-700" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border border-gray-700" />
      </div>
      <div className="hidden md:block fixed right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-900 via-amber-800 to-amber-900 border-l-4 border-amber-950 z-40">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }} />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border border-gray-700" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border border-gray-700" />
      </div>
      
      {/* Top marquee panel */}
      <div className="fixed top-0 left-0 right-0 h-4 md:h-6 bg-gradient-to-b from-gray-800 to-gray-900 border-b-2 border-gray-700 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-cyan-900/50" />
      </div>
      
      {/* Bottom control panel look */}
      <div className="fixed bottom-0 left-0 right-0 h-3 md:h-4 bg-gradient-to-t from-gray-900 to-gray-800 border-t-2 border-gray-700 z-50" />
      
      {/* Content area - the "screen" */}
      <div className="md:mx-8">
        {children}
      </div>
    </div>
  )
}

// Decorative joystick and buttons
function ControlPanelDecoration() {
  return (
    <div className="hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 items-center gap-8 z-30">
      {/* Joystick */}
      <div className="relative">
        <div className="w-16 h-16 bg-gray-800 rounded-full border-4 border-gray-600 shadow-inner" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-gradient-to-b from-red-400 to-red-700 rounded-full shadow-lg" style={{
          transform: 'translate(-50%, -70%) rotateX(15deg)'
        }} />
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3">
        {['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'].map((color, i) => (
          <div 
            key={i}
            className={`w-10 h-10 ${color} rounded-full shadow-lg border-4 border-white/20 animate-button-glow`}
            style={{
              animationDelay: `${i * 0.2}s`,
              boxShadow: `0 0 20px ${color.replace('bg-', '').replace('-500', '')}, inset 0 2px 4px rgba(255,255,255,0.3)`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Insert Coin blinking
function InsertCoinBanner() {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 500)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className={`text-center py-2 transition-opacity duration-100 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <span 
        className="font-mono text-2xl md:text-4xl font-black tracking-[0.3em] text-yellow-400"
        style={{ textShadow: '0 0 10px #facc15, 0 0 20px #facc15, 0 0 40px #facc15' }}
      >
        ★ INSERT COIN ★
      </span>
    </div>
  )
}

// High scores ticker (scrolling)
function HighScoresTicker() {
  const scores = [
    { name: 'AAA', game: 'Snake', score: 999999 },
    { name: 'ZZZ', game: 'Whack', score: 847320 },
    { name: 'CAT', game: 'Memory', score: 654210 },
    { name: 'WOW', game: 'Math', score: 543210 },
    { name: 'PRO', game: 'Catch', score: 432100 },
    { name: 'ACE', game: 'Simon', score: 321000 },
  ]
  
  return (
    <div className="bg-black/80 border-y-2 border-yellow-500/50 py-2 overflow-hidden">
      <div className="animate-ticker whitespace-nowrap">
        <span className="inline-flex items-center gap-8 text-yellow-400 font-mono font-bold tracking-wider">
          {[...scores, ...scores].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="text-red-400">★</span>
              <span className="text-cyan-400">{s.name}</span>
              <span className="text-gray-400">{s.game}</span>
              <span className="text-yellow-400">{s.score.toLocaleString()}</span>
              <span className="text-red-400">★</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

// Game of the Day featured spot
function GameOfTheDay({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <RainbowBorder className="mb-8 mx-4 md:mx-8">
      <Link 
        href={game.href}
        onClick={onClick}
        className="block bg-black rounded-xl p-4 md:p-6 relative overflow-hidden group"
      >
        <ScanlinesOverlay />
        <CRTFlicker />
        
        {/* Crown and label */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-1 rounded-b-lg">
          <span className="font-mono font-black text-black text-xs md:text-sm tracking-wider">
            👑 GAME OF THE DAY 👑
          </span>
        </div>
        
        <div className="flex items-center gap-6 pt-4">
          {/* Game icon */}
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-5xl md:text-7xl" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}>
              {game.emoji}
            </span>
          </div>
          
          {/* Game info */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1" style={{
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}>
              {game.title}
            </h2>
            <p className="text-gray-400 text-sm md:text-lg">{game.desc}</p>
            <div className="mt-3 inline-block bg-yellow-500/20 px-3 py-1 rounded-full">
              <span className="text-yellow-400 font-mono font-bold text-xs md:text-sm animate-pulse">
                CLICK TO PLAY →
              </span>
            </div>
          </div>
          
          {/* Decorative stars */}
          <div className="hidden md:flex flex-col items-center gap-2 text-yellow-400 text-2xl animate-pulse">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
        </div>
      </Link>
    </RainbowBorder>
  )
}

// Search/filter bar
function SearchAndFilter({ 
  search, 
  setSearch, 
  selectedCategory, 
  setSelectedCategory,
  onNavigate 
}: {
  search: string
  setSearch: (s: string) => void
  selectedCategory: Category | null
  setSelectedCategory: (c: Category | null) => void
  onNavigate: () => void
}) {
  return (
    <div className="px-4 md:px-8 mb-6">
      {/* Search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="🔍 SEARCH GAMES..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); onNavigate(); }}
          className="w-full bg-black/80 border-2 border-cyan-500/50 rounded-xl px-4 py-3 text-cyan-400 font-mono placeholder-cyan-700 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-300"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        <button
          onClick={() => { setSelectedCategory(null); onNavigate(); }}
          className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]'
              : 'bg-black/50 text-gray-400 border border-gray-700 hover:border-gray-500'
          }`}
        >
          ALL GAMES
        </button>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => { setSelectedCategory(cat.name); onNavigate(); }}
            className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all flex items-center gap-2 ${
              selectedCategory === cat.name
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                : 'bg-black/50 text-gray-400 border border-gray-700 hover:border-gray-500'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Section header
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-4 md:px-8">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl md:text-2xl font-black text-white tracking-wider" style={{
        textShadow: '0 0 10px rgba(255,255,255,0.3)'
      }}>
        {title}
      </h2>
      <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 to-transparent rounded" />
    </div>
  )
}

// Game card component
function GameCard({ 
  game, 
  isSelected, 
  onHover, 
  onLeave, 
  onSelect, 
  playCoinBeep,
  size = 'normal'
}: { 
  game: Game
  isSelected: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
  playCoinBeep: () => void
  size?: 'small' | 'normal'
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

  const isSmall = size === 'small'

  return (
    <Link
      href={game.href}
      onMouseEnter={handleHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      className="group block"
    >
      <div className={`
        relative transform transition-all duration-500 ease-out
        ${isSelected ? 'scale-105 -translate-y-2 z-20' : 'hover:scale-105 hover:-translate-y-1'}
      `}>
        {/* NEW badge */}
        {game.isNew && (
          <div className="absolute -top-2 -right-2 z-30 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            NEW!
          </div>
        )}
        
        {/* Cabinet body */}
        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl">
          {/* Screen */}
          <div className={`p-2 ${isSmall ? 'pb-1' : 'pb-2'}`}>
            <div className={`
              relative bg-gradient-to-br ${game.color}
              rounded-lg overflow-hidden
              ${isSmall ? 'aspect-square' : 'aspect-square'}
            `}>
              {/* CRT curvature */}
              <div className="absolute inset-0 rounded-lg" style={{
                background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)'
              }} />
              
              {/* Scanlines */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)'
              }} />

              {/* Screen flicker */}
              {isSelected && <div className="absolute inset-0 bg-white/5 animate-flicker" />}

              {/* Game emoji */}
              <div className="relative flex items-center justify-center h-full">
                <span className={`
                  ${isSmall ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'} transform transition-all duration-300
                  ${isSelected ? 'scale-110 animate-bounce-subtle' : 'group-hover:scale-105'}
                `} style={{
                  filter: isSelected ? 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'none'
                }}>
                  {game.emoji}
                </span>
              </div>

              {/* INSERT COIN overlay */}
              {isSelected && showInsertCoin && (
                <div className="absolute bottom-1 left-0 right-0 text-center">
                  <span className="bg-black/80 text-yellow-400 px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider">
                    INSERT COIN
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Title marquee */}
          <div className={`bg-gradient-to-r ${game.color} px-2 ${isSmall ? 'py-1' : 'py-2'} text-center border-t-2 border-white/20`}>
            <h3 className={`${isSmall ? 'text-sm' : 'text-base md:text-lg'} font-black text-white tracking-wide drop-shadow-lg truncate`}>
              {game.title}
            </h3>
            {!isSmall && (
              <p className="text-[10px] text-white/80 truncate">{game.desc}</p>
            )}
          </div>

          {/* Control panel */}
          <div className={`bg-gray-900 ${isSmall ? 'p-1.5' : 'p-2'} flex items-center justify-center gap-2`}>
            <div className="relative">
              <div className={`${isSmall ? 'w-2 h-2' : 'w-3 h-3'} bg-gray-700 rounded-full`} />
              <div className={`absolute -top-1 left-1/2 -translate-x-1/2 ${isSmall ? 'w-1 h-2' : 'w-1.5 h-3'} bg-gradient-to-b from-red-500 to-red-700 rounded-full transition-transform ${isSelected ? 'rotate-12' : ''}`} />
            </div>
            <div className="flex gap-1">
              <div className={`${isSmall ? 'w-2 h-2' : 'w-3 h-3'} rounded-full bg-red-500 ${isSelected ? 'brightness-150' : ''}`} />
              <div className={`${isSmall ? 'w-2 h-2' : 'w-3 h-3'} rounded-full bg-blue-500 ${isSelected ? 'brightness-150' : ''}`} />
            </div>
          </div>
        </div>

        {/* Glow effect */}
        {isSelected && (
          <div className={`absolute -inset-2 rounded-2xl blur-xl -z-10 opacity-60 bg-gradient-to-b ${game.color}`} />
        )}
      </div>
    </Link>
  )
}

// Horizontal scrollable game row
function GameRow({ 
  games, 
  selectedGame, 
  setSelectedGame, 
  playSelectSound, 
  playCoinBeep 
}: {
  games: Game[]
  selectedGame: string | null
  setSelectedGame: (id: string | null) => void
  playSelectSound: () => void
  playCoinBeep: () => void
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-8 scrollbar-hide">
      {games.map(game => (
        <div key={game.id} className="flex-shrink-0 w-28 md:w-36">
          <GameCard
            game={game}
            isSelected={selectedGame === game.id}
            onHover={() => setSelectedGame(game.id)}
            onLeave={() => setSelectedGame(null)}
            onSelect={playSelectSound}
            playCoinBeep={playCoinBeep}
            size="small"
          />
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MAIN ARCADE PAGE
// =============================================================================

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const { playCoinBeep, playSelectSound, playNavigateSound } = useArcadeSounds()
  
  // Game of the day (rotate daily based on date)
  const gameOfTheDay = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return allGames[dayOfYear % allGames.length]
  }, [])
  
  // Recently played (mock - in real app would come from localStorage)
  const recentlyPlayed = useMemo(() => allGames.slice(0, 4), [])
  
  // Favorites (mock - in real app would come from localStorage)
  const favorites = useMemo(() => allGames.filter(g => g.isFeatured || g.isNew).slice(0, 4), [])
  
  // Filtered games
  const filteredGames = useMemo(() => {
    let result = allGames
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(g => 
        g.title.toLowerCase().includes(searchLower) || 
        g.desc.toLowerCase().includes(searchLower)
      )
    }
    if (selectedCategory) {
      result = result.filter(g => g.category === selectedCategory)
    }
    return result
  }, [search, selectedCategory])

  return (
    <ArcadeCabinetFrame>
      <div className="min-h-screen bg-gray-950 relative overflow-hidden pt-6">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-purple-950/30 to-gray-950" />
        
        {/* Arcade carpet pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, cyan 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, magenta 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, yellow 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 50px 50px, 50px 50px'
        }} />
        
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-transparent" />
        
        {/* Visual effects */}
        <FloatingCoinsAndStars />
        <NeonTubes />
        <ScanlinesOverlay />
        <CRTFlicker />

        {/* Content */}
        <div className="relative z-10">
          {/* Back button */}
          <div className="absolute top-2 left-4 z-20">
            <Link 
              href="/games"
              className="group flex items-center gap-2 bg-black/70 hover:bg-black/90 px-3 py-1.5 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 border border-cyan-500/30 backdrop-blur-sm"
            >
              <span className="text-cyan-400">◀</span>
              <span className="text-sm">Island</span>
            </Link>
          </div>

          {/* Neon Sign Header */}
          <div className="text-center pt-4 pb-2 relative">
            <div className="inline-block relative px-4">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="text-cyan-400" style={{
                  textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 80px #22d3ee'
                }}>ONDE</span>
                <span className="mx-2 md:mx-4" />
                <span className="text-pink-500" style={{
                  textShadow: '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 80px #ec4899'
                }}>ARCADE</span>
              </h1>
              
              {/* Decorative joysticks */}
              <div className="hidden md:block absolute -left-16 top-1/2 -translate-y-1/2 text-5xl opacity-80">🕹️</div>
              <div className="hidden md:block absolute -right-16 top-1/2 -translate-y-1/2 text-5xl opacity-80 scale-x-[-1]">🕹️</div>
            </div>
          </div>

          {/* Insert Coin Banner */}
          <InsertCoinBanner />
          
          {/* High Scores Ticker */}
          <HighScoresTicker />

          {/* Game of the Day */}
          <div className="py-6">
            <GameOfTheDay game={gameOfTheDay} onClick={playSelectSound} />
          </div>

          {/* Search and Filter */}
          <SearchAndFilter
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onNavigate={playNavigateSound}
          />

          {/* Recently Played */}
          {!search && !selectedCategory && (
            <div className="py-4">
              <SectionHeader icon="🕐" title="RECENTLY PLAYED" />
              <GameRow
                games={recentlyPlayed}
                selectedGame={selectedGame}
                setSelectedGame={setSelectedGame}
                playSelectSound={playSelectSound}
                playCoinBeep={playCoinBeep}
              />
            </div>
          )}

          {/* Favorites */}
          {!search && !selectedCategory && (
            <div className="py-4">
              <SectionHeader icon="⭐" title="FAVORITES" />
              <GameRow
                games={favorites}
                selectedGame={selectedGame}
                setSelectedGame={setSelectedGame}
                playSelectSound={playSelectSound}
                playCoinBeep={playCoinBeep}
              />
            </div>
          )}

          {/* All Games Grid */}
          <div className="py-6">
            <SectionHeader 
              icon={selectedCategory ? categories.find(c => c.name === selectedCategory)?.emoji || '🎮' : '🎮'} 
              title={selectedCategory ? `${selectedCategory.toUpperCase()} GAMES` : 'ALL GAMES'} 
            />
            
            {filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🕹️</span>
                <p className="text-gray-400 font-mono">No games found. Try a different search!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 px-4 md:px-8">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGame === game.id}
                    onHover={() => setSelectedGame(game.id)}
                    onLeave={() => setSelectedGame(null)}
                    onSelect={playSelectSound}
                    playCoinBeep={playCoinBeep}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-8 pb-16">
            <div className="inline-flex items-center gap-3 bg-black/70 px-6 py-3 rounded-full border border-yellow-500/30 backdrop-blur">
              <span className="text-2xl">🪙</span>
              <span className="text-yellow-400 font-mono font-bold tracking-wider text-sm md:text-base">
                {allGames.length} GAMES • FREE PLAY • NO COINS NEEDED
              </span>
              <span className="text-2xl">🪙</span>
            </div>
          </div>
        </div>

        {/* Decorative control panel */}
        <ControlPanelDecoration />

        {/* Custom animations */}
        <style jsx>{`
          @keyframes float-coin {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-30px) rotate(15deg); opacity: 0.9; }
          }
          @keyframes flicker {
            0%, 100% { opacity: 0; }
            50% { opacity: 0.1; }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: scale(1.1) translateY(0); }
            50% { transform: scale(1.1) translateY(-5px); }
          }
          @keyframes rainbow-shift {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
          @keyframes neon-pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes button-glow {
            0%, 100% { box-shadow: 0 0 10px currentColor; }
            50% { box-shadow: 0 0 25px currentColor, 0 0 35px currentColor; }
          }
          @keyframes crt-flicker {
            0% { opacity: 0.02; }
            5% { opacity: 0.04; }
            10% { opacity: 0.02; }
            100% { opacity: 0.02; }
          }
          .animate-float-coin {
            animation: float-coin 5s ease-in-out infinite;
          }
          .animate-flicker {
            animation: flicker 0.1s ease-in-out infinite;
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 0.6s ease-in-out infinite;
          }
          .animate-rainbow-shift {
            animation: rainbow-shift 3s linear infinite;
          }
          .animate-neon-pulse {
            animation: neon-pulse 2s ease-in-out infinite;
          }
          .animate-ticker {
            animation: ticker 20s linear infinite;
          }
          .animate-button-glow {
            animation: button-glow 1.5s ease-in-out infinite;
          }
          .animate-crt-flicker {
            animation: crt-flicker 4s ease-in-out infinite;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </ArcadeCabinetFrame>
  )
}
