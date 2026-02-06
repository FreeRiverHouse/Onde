'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useCoins } from '@/hooks/useCoins'

// =============================================================================
// CUTE PLAYFUL SOUND EFFECTS
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
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.06)
      
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  const playSelectSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1)
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.15)
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
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.06)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  const playUnlockSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      // Magical ascending arpeggio
      const notes = [523, 659, 784, 1047, 1319]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08)
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + i * 0.08 + 0.2)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.25)
      })
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  const playLockedSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      // Short "nope" sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio not available
    }
  }, [getAudioContext])

  return { playCoinBeep, playSelectSound, playNavigateSound, playUnlockSound, playLockedSound }
}

// =============================================================================
// GAME DATA - EDUCATIONAL GAMES ONLY (No brain rot!)
// =============================================================================

type Category = 'Math & Logic' | 'Words & Language' | 'Memory & Puzzles' | 'Creative'
type ReadingLevel = 'no-reading' | 'can-read'

interface Game {
  id: string
  href: string
  title: string
  desc: string
  emoji: string
  color: string
  glowColor: string
  category: Category
  readingLevel: ReadingLevel
  localStorageKey?: string
  isNew?: boolean
  isFeatured?: boolean
  locked?: boolean
  unlockCost?: number
}

const FREE_GAME_IDS = ['counting', 'math', 'alphabet', 'memory', 'draw', 'coloring', 'music', 'quiz']

const UNLOCK_COSTS: Record<string, number> = {
  '2048': 200,
  'sudoku': 300,
  'typing': 150,
  'typing-race': 250,
  'word': 200,
  'wordle': 300,
  'crossword': 350,
  'matching': 150,
  'puzzle': 200,
  'jigsaw': 250,
  'spot': 200,
}

const allGames: Game[] = [
  // 🔢 MATH & LOGIC
  { id: 'counting', href: '/games/counting', title: 'Counting', desc: 'Learn to count', emoji: '🔢', color: 'from-sky-300 to-sky-500', glowColor: 'sky', category: 'Math & Logic', readingLevel: 'no-reading' },
  { id: 'math', href: '/games/math', title: 'Math Quest', desc: 'Math adventures', emoji: '➕', color: 'from-orange-300 to-orange-500', glowColor: 'orange', category: 'Math & Logic', readingLevel: 'no-reading' },
  { id: '2048', href: '/games/2048', title: '2048', desc: 'Merge the numbers', emoji: '🔢', color: 'from-amber-300 to-amber-500', glowColor: 'amber', category: 'Math & Logic', readingLevel: 'no-reading', localStorageKey: '2048-best-score', isNew: true },
  { id: 'sudoku', href: '/games/sudoku', title: 'Sudoku', desc: 'Number logic puzzle', emoji: '🧮', color: 'from-indigo-300 to-indigo-500', glowColor: 'indigo', category: 'Math & Logic', readingLevel: 'no-reading', isNew: true },

  // 📝 WORDS & LANGUAGE
  { id: 'alphabet', href: '/games/alphabet', title: 'ABC Fun', desc: 'Learn the alphabet', emoji: '🔤', color: 'from-emerald-300 to-emerald-500', glowColor: 'emerald', category: 'Words & Language', readingLevel: 'no-reading' },
  { id: 'typing', href: '/games/typing', title: 'Typing', desc: 'Learn to type', emoji: '⌨️', color: 'from-slate-300 to-slate-500', glowColor: 'slate', category: 'Words & Language', readingLevel: 'can-read' },
  { id: 'typing-race', href: '/games/typing-race', title: 'Typing Race', desc: 'Speed typing', emoji: '🏎️', color: 'from-rose-300 to-rose-500', glowColor: 'rose', category: 'Words & Language', readingLevel: 'can-read', isNew: true },
  { id: 'word', href: '/games/word-puzzle', title: 'Word Puzzle', desc: 'Solve word games', emoji: '📝', color: 'from-blue-300 to-blue-500', glowColor: 'blue', category: 'Words & Language', readingLevel: 'can-read' },
  { id: 'wordle', href: '/games/wordle', title: 'Wordle', desc: 'Guess the word', emoji: '🟩', color: 'from-green-300 to-green-500', glowColor: 'green', category: 'Words & Language', readingLevel: 'can-read', isNew: true },
  { id: 'crossword', href: '/games/crossword', title: 'Crossword', desc: 'Word puzzle grid', emoji: '📰', color: 'from-violet-300 to-violet-500', glowColor: 'violet', category: 'Words & Language', readingLevel: 'can-read', isNew: true },
  { id: 'quiz', href: '/games/quiz', title: 'Quiz Time', desc: 'Test your knowledge', emoji: '❓', color: 'from-purple-300 to-purple-500', glowColor: 'purple', category: 'Words & Language', readingLevel: 'can-read' },

  // 🧩 MEMORY & PUZZLES
  { id: 'memory', href: '/games/memory', title: 'Memory', desc: 'Match the pairs', emoji: '🧠', color: 'from-pink-300 to-pink-500', glowColor: 'pink', category: 'Memory & Puzzles', readingLevel: 'no-reading' },
  { id: 'matching', href: '/games/matching', title: 'Matching', desc: 'Find the matches', emoji: '🎴', color: 'from-cyan-300 to-cyan-500', glowColor: 'cyan', category: 'Memory & Puzzles', readingLevel: 'no-reading' },
  { id: 'puzzle', href: '/games/puzzle', title: 'Puzzle', desc: 'Solve the puzzle', emoji: '🧩', color: 'from-fuchsia-300 to-fuchsia-500', glowColor: 'fuchsia', category: 'Memory & Puzzles', readingLevel: 'no-reading' },
  { id: 'jigsaw', href: '/games/jigsaw', title: 'Jigsaw', desc: 'Piece it together', emoji: '🖼️', color: 'from-teal-300 to-teal-500', glowColor: 'teal', category: 'Memory & Puzzles', readingLevel: 'no-reading', isNew: true },
  { id: 'spot', href: '/games/spot-difference', title: 'Spot It!', desc: 'Find the difference', emoji: '🔍', color: 'from-lime-300 to-lime-500', glowColor: 'lime', category: 'Memory & Puzzles', readingLevel: 'no-reading' },

  // 🎨 CREATIVE
  { id: 'draw', href: '/games/draw', title: 'Draw', desc: 'Creative drawing', emoji: '✏️', color: 'from-red-300 to-red-500', glowColor: 'red', category: 'Creative', readingLevel: 'no-reading' },
  { id: 'coloring', href: '/games/coloring', title: 'Coloring', desc: 'Color the pictures', emoji: '🖍️', color: 'from-yellow-300 to-yellow-500', glowColor: 'yellow', category: 'Creative', readingLevel: 'no-reading' },
  { id: 'music', href: '/games/music', title: 'Music', desc: 'Make music', emoji: '🎵', color: 'from-sky-300 to-indigo-400', glowColor: 'indigo', category: 'Creative', readingLevel: 'no-reading' },
]

const categories: { name: Category; emoji: string; color: string }[] = [
  { name: 'Math & Logic', emoji: '🔢', color: 'from-sky-400 to-indigo-400' },
  { name: 'Words & Language', emoji: '📝', color: 'from-emerald-400 to-green-400' },
  { name: 'Memory & Puzzles', emoji: '🧩', color: 'from-purple-400 to-pink-400' },
  { name: 'Creative', emoji: '🎨', color: 'from-orange-400 to-rose-400' },
]

const readingLevels: { name: ReadingLevel; label: string; emoji: string; desc: string }[] = [
  { name: 'no-reading', label: 'No Reading', emoji: '👶', desc: 'Great for young kids' },
  { name: 'can-read', label: 'Can Read', emoji: '📖', desc: 'Needs reading skills' },
]

// Pastel color palette for game cards
const pastelColors = [
  'bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100',
  'bg-purple-100', 'bg-orange-100', 'bg-teal-100', 'bg-rose-100',
  'bg-indigo-100', 'bg-lime-100', 'bg-cyan-100', 'bg-fuchsia-100',
]

const pastelBorderColors = [
  'border-pink-300', 'border-blue-300', 'border-green-300', 'border-yellow-300',
  'border-purple-300', 'border-orange-300', 'border-teal-300', 'border-rose-300',
  'border-indigo-300', 'border-lime-300', 'border-cyan-300', 'border-fuchsia-300',
]

function getPastelColor(index: number) {
  return pastelColors[index % pastelColors.length]
}

function getPastelBorder(index: number) {
  return pastelBorderColors[index % pastelBorderColors.length]
}

// =============================================================================
// LOCALSTORAGE SCORE KEYS — maps game IDs to their localStorage keys
// =============================================================================

const SCORE_KEYS: Record<string, { key: string; type: 'leaderboard' | 'score' | 'best' }> = {
  'memory': { key: 'memory-leaderboard', type: 'leaderboard' },
  'matching': { key: 'matching-leaderboard', type: 'leaderboard' },
  'typing': { key: 'typing-leaderboard', type: 'leaderboard' },
  'quiz': { key: 'quiz-leaderboard', type: 'leaderboard' },
  'math': { key: 'math-quest-leaderboard', type: 'leaderboard' },
  'counting': { key: 'counting-leaderboard', type: 'leaderboard' },
  'spot': { key: 'spot-difference-leaderboard', type: 'leaderboard' },
  'word': { key: 'word-puzzle-leaderboard', type: 'leaderboard' },
  '2048': { key: '2048-best-score', type: 'best' },
  'sudoku': { key: 'sudoku-high-scores', type: 'leaderboard' },
  'crossword': { key: 'crossword-leaderboard', type: 'leaderboard' },
  'wordle': { key: 'wordle-stats', type: 'score' },
}

// =============================================================================
// HOOKS
// =============================================================================

const UNLOCKED_STORAGE_KEY = 'onde-unlocked-games'

function useUnlockedGames() {
  const [unlockedGames, setUnlockedGames] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(UNLOCKED_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setUnlockedGames(parsed)
        }
      }
    } catch {
      // skip
    }
    setMounted(true)
  }, [])

  const unlockGame = useCallback((gameId: string) => {
    setUnlockedGames(prev => {
      if (prev.includes(gameId)) return prev
      const next = [...prev, gameId]
      try {
        localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // skip
      }
      return next
    })
  }, [])

  const isUnlocked = useCallback((game: Game): boolean => {
    // Free games are always unlocked
    if (!game.locked) return true
    if (FREE_GAME_IDS.includes(game.id)) return true
    // Check localStorage
    return unlockedGames.includes(game.id)
  }, [unlockedGames])

  return { unlockedGames, unlockGame, isUnlocked, mounted }
}

function useRealScores() {
  const [scores, setScores] = useState<{ name: string; game: string; score: number; emoji: string }[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])

  useEffect(() => {
    const allScores: { name: string; game: string; score: number; emoji: string }[] = []
    const played: string[] = []

    for (const game of allGames) {
      const scoreInfo = SCORE_KEYS[game.id]
      if (!scoreInfo) continue

      try {
        const raw = localStorage.getItem(scoreInfo.key)
        if (!raw) continue

        played.push(game.id)

        if (scoreInfo.type === 'best') {
          const val = parseInt(raw)
          if (!isNaN(val) && val > 0) {
            allScores.push({ name: 'YOU', game: game.title, score: val, emoji: game.emoji })
          }
        } else if (scoreInfo.type === 'leaderboard') {
          const entries = JSON.parse(raw)
          if (Array.isArray(entries) && entries.length > 0) {
            const best = entries.reduce((a: { score?: number }, b: { score?: number }) =>
              (a.score || 0) > (b.score || 0) ? a : b
            )
            if (best.score && best.score > 0) {
              allScores.push({
                name: best.name || 'YOU',
                game: game.title,
                score: best.score,
                emoji: game.emoji
              })
            }
          }
        } else if (scoreInfo.type === 'score') {
          const data = JSON.parse(raw)
          const val = data.bestScore || data.wins || data.score || 0
          if (val > 0) {
            allScores.push({ name: 'YOU', game: game.title, score: val, emoji: game.emoji })
          }
        }
      } catch {
        // skip corrupt data
      }
    }

    // Also check the global leaderboard
    try {
      const globalRaw = localStorage.getItem('onde-global-leaderboard')
      if (globalRaw) {
        const entries = JSON.parse(globalRaw)
        if (Array.isArray(entries)) {
          for (const entry of entries.slice(0, 10)) {
            if (entry.score > 0 && entry.name && entry.game) {
              allScores.push({
                name: entry.name,
                game: entry.game,
                score: entry.score,
                emoji: entry.gameEmoji || '🎮'
              })
            }
          }
        }
      }
    } catch {
      // skip
    }

    // Sort by score descending, deduplicate by game
    const seen = new Set<string>()
    const unique = allScores
      .sort((a, b) => b.score - a.score)
      .filter(s => {
        const key = `${s.game}-${s.name}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 8)

    setScores(unique)
    setRecentlyPlayed(played)
  }, [])

  return { scores, recentlyPlayed }
}

// =============================================================================
// VISUAL COMPONENTS — CUTE & KID-FRIENDLY
// =============================================================================

function FloatingDecorations() {
  const items = ['⭐', '🌈', '☁️', '✨', '🦋', '🌸', '💫', '🎈', '🌟', '🎀', '🍭', '🎪']
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
        <div
          key={`deco-${i}`}
          className="absolute animate-float-gentle"
          style={{
            left: `${5 + (i * 5.5) % 90}%`,
            top: `${3 + (i * 7.3) % 90}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${6 + (i % 4) * 2}s`,
          }}
        >
          <span className="text-xl md:text-2xl opacity-40" style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}>
            {items[i % items.length]}
          </span>
        </div>
      ))}
    </div>
  )
}

function PlayroomFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Soft pastel top bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-yellow-200 via-green-200 via-blue-300 to-purple-300 z-50" />
      {/* Soft pastel bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-300 via-blue-300 via-green-200 via-yellow-200 to-pink-300 z-50" />
      {children}
    </div>
  )
}

function CheerfulBanner() {
  return (
    <div className="text-center py-2">
      <span className="text-xl md:text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-green-500 animate-rainbow-text">
        ✨ Learn & Play! ✨
      </span>
    </div>
  )
}

// Coin balance display
function CoinBalanceDisplay({ balance }: { balance: number }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-yellow-300 shadow-md">
      <span className="text-lg animate-bounce-gentle">🪙</span>
      <span className="font-extrabold text-yellow-700 text-base tabular-nums">
        {balance.toLocaleString()}
      </span>
    </div>
  )
}

// Sparkle/confetti burst animation overlay
function UnlockCelebration({ show, onDone }: { show: boolean; onDone: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDone, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onDone])

  if (!show) return null

  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * 360
    const distance = 60 + Math.random() * 120
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance
    const emojis = ['⭐', '✨', '🌟', '💫', '🎉', '🎊', '🪙', '💎', '🌈', '🎀']
    const emoji = emojis[i % emojis.length]
    const delay = Math.random() * 0.3
    const size = 14 + Math.random() * 16

    return (
      <span
        key={i}
        className="absolute animate-celebration-particle"
        style={{
          '--tx': `${x}px`,
          '--ty': `${y}px`,
          animationDelay: `${delay}s`,
          fontSize: `${size}px`,
          left: '50%',
          top: '50%',
        } as React.CSSProperties}
      >
        {emoji}
      </span>
    )
  })

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <div className="relative">
        {particles}
        <div className="animate-unlock-badge text-center">
          <span className="text-5xl md:text-7xl block mb-2">🔓</span>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-extrabold text-xl md:text-2xl px-6 py-2 rounded-full shadow-lg">
            Unlocked! 🎉
          </span>
        </div>
      </div>
    </div>
  )
}

// Unlock confirmation modal
function UnlockModal({
  game,
  balance,
  onConfirm,
  onCancel,
}: {
  game: Game
  balance: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const cost = game.unlockCost || UNLOCK_COSTS[game.id] || 0
  const canAfford = balance >= cost
  const deficit = cost - balance

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border-3 border-yellow-200 animate-modal-pop"
        onClick={e => e.stopPropagation()}
      >
        {/* Game emoji */}
        <div className="text-center mb-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center border-2 border-yellow-200 shadow-md mb-3">
            <span className="text-4xl">{game.emoji}</span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-800">{game.title}</h3>
          <p className="text-sm text-gray-500">{game.desc}</p>
        </div>

        {canAfford ? (
          <>
            <div className="bg-yellow-50 rounded-2xl p-4 mb-5 text-center border border-yellow-200">
              <p className="text-gray-700 font-bold mb-1">Unlock this game?</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🪙</span>
                <span className="text-2xl font-extrabold text-yellow-700">{cost}</span>
                <span className="text-gray-500 text-sm">coins</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Balance after: {(balance - cost).toLocaleString()} coins
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors text-sm"
              >
                Not Yet
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-extrabold shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                🔓 Unlock!
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-pink-50 rounded-2xl p-4 mb-5 text-center border border-pink-200">
              <p className="text-pink-700 font-bold mb-1">Need more coins! 😊</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl">🪙</span>
                <span className="text-xl font-extrabold text-gray-400 line-through">{cost}</span>
              </div>
              <p className="text-sm text-pink-600 font-medium">
                You need <span className="font-extrabold">{deficit}</span> more coins
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Play free games to earn coins! 🎮
              </p>
            </div>

            <button
              onClick={onCancel}
              className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-extrabold shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm"
            >
              Got it! 💪
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Real scores ticker from localStorage — bright & cheerful
function HighScoresTicker({ scores }: { scores: { name: string; game: string; score: number; emoji: string }[] }) {
  const displayScores = scores.length > 0 ? scores : [
    { name: '???', game: 'Play a game!', score: 0, emoji: '🎮' },
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm border-y-2 border-yellow-200 py-2 overflow-hidden">
      <div className="animate-ticker whitespace-nowrap">
        <span className="inline-flex items-center gap-8 font-bold tracking-wide">
          {[...displayScores, ...displayScores].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-purple-600">{s.name}</span>
              <span className="text-gray-500">{s.emoji} {s.game}</span>
              <span className="text-pink-600 font-extrabold">{s.score > 0 ? s.score.toLocaleString() : '---'}</span>
              <span className="text-yellow-500">⭐</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

// Game of the Day — cute star-game style
function GameOfTheDay({ game, onClick, isLocked }: { game: Game; onClick: () => void; isLocked: boolean }) {
  return (
    <div className="mb-8 mx-4 md:mx-8">
      {isLocked ? (
        <div
          onClick={onClick}
          className="block bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-6 relative overflow-hidden group border-3 border-yellow-300 shadow-lg shadow-yellow-100 hover:shadow-xl hover:shadow-yellow-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
          {/* Cute star badge */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-300 to-orange-300 px-5 py-1.5 rounded-b-2xl shadow-md">
            <span className="font-extrabold text-orange-800 text-xs md:text-sm tracking-wider">
              ⭐ Star Game of the Day! ⭐
            </span>
          </div>

          <div className="flex items-center gap-6 pt-4 opacity-70">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center shadow-md border-2 border-white relative">
              <span className="text-5xl md:text-7xl grayscale opacity-50" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15)) grayscale(100%)' }}>
                {game.emoji}
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🔒</span>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-1">
                {game.title}
              </h2>
              <p className="text-gray-500 text-sm md:text-lg">{game.desc}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-1.5 rounded-full shadow-md">
                <span className="text-white font-extrabold text-xs md:text-sm">
                  🔒 Unlock for 🪙 {game.unlockCost || UNLOCK_COSTS[game.id]}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href={game.href}
          onClick={onClick}
          className="block bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-6 relative overflow-hidden group border-3 border-yellow-300 shadow-lg shadow-yellow-100 hover:shadow-xl hover:shadow-yellow-200 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Cute star badge */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-300 to-orange-300 px-5 py-1.5 rounded-b-2xl shadow-md">
            <span className="font-extrabold text-orange-800 text-xs md:text-sm tracking-wider">
              ⭐ Star Game of the Day! ⭐
            </span>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-yellow-200 via-pink-100 to-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md border-2 border-white">
              <span className="text-5xl md:text-7xl animate-bounce-gentle" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                {game.emoji}
              </span>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-1">
                {game.title}
              </h2>
              <p className="text-gray-500 text-sm md:text-lg">{game.desc}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${game.readingLevel === 'no-reading' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                  {game.readingLevel === 'no-reading' ? '👶 No Reading' : '📖 Can Read'}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                  {game.category}
                </span>
              </div>
              <div className="mt-3 inline-block bg-gradient-to-r from-pink-400 to-orange-400 px-5 py-1.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-xs md:text-sm">
                  🎮 Tap to Play!
                </span>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center gap-2 text-yellow-400 text-2xl animate-sparkle">
              <span>🌟</span>
              <span>⭐</span>
              <span>🌟</span>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}

// Reading level filter — colorful pills
function ReadingLevelFilter({
  selectedLevel,
  setSelectedLevel,
  onNavigate
}: {
  selectedLevel: ReadingLevel | null
  setSelectedLevel: (l: ReadingLevel | null) => void
  onNavigate: () => void
}) {
  return (
    <div className="px-4 md:px-8 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-gray-500">🌈 Age Filter:</span>
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3">
        <button
          onClick={() => { setSelectedLevel(null); onNavigate(); }}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
            selectedLevel === null
              ? 'bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-800 shadow-md shadow-yellow-200 scale-105'
              : 'bg-white/70 text-gray-500 border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
          }`}
        >
          🌟 All Ages
        </button>
        {readingLevels.map(level => (
          <button
            key={level.name}
            onClick={() => { setSelectedLevel(level.name); onNavigate(); }}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
              selectedLevel === level.name
                ? `bg-gradient-to-r ${level.name === 'no-reading' ? 'from-green-300 to-emerald-300 text-green-800 shadow-green-200' : 'from-blue-300 to-cyan-300 text-blue-800 shadow-blue-200'} shadow-md scale-105`
                : 'bg-white/70 text-gray-500 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <span>{level.emoji}</span>
            <span>{level.label}</span>
            <span className="text-[10px] opacity-70">({level.desc})</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Search and category filter — rounded, colorful
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
    <div className="px-4 md:px-8 mb-4">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="🔍 Find a fun game..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); onNavigate(); }}
          className="w-full bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl px-5 py-3.5 text-gray-700 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-100 transition-all text-base"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors text-lg"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        <button
          onClick={() => { setSelectedCategory(null); onNavigate(); }}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md shadow-pink-200 scale-105'
              : 'bg-white/70 text-gray-500 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
          }`}
        >
          🎮 All Subjects
        </button>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => { setSelectedCategory(cat.name); onNavigate(); }}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === cat.name
                ? `bg-gradient-to-r ${cat.color} text-white shadow-md scale-105`
                : 'bg-white/70 text-gray-500 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
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

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-4 md:px-8">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl md:text-2xl font-extrabold text-gray-700 tracking-wide">
        {title}
      </h2>
      <div className="flex-1 h-1 bg-gradient-to-r from-pink-200 via-yellow-200 to-transparent rounded-full" />
    </div>
  )
}

// Game card — cute, rounded, colorful — with lock support
function GameCard({
  game,
  isSelected,
  onHover,
  onLeave,
  onSelect,
  playCoinBeep,
  size = 'normal',
  colorIndex = 0,
  isLocked = false,
  onLockedClick,
}: {
  game: Game
  isSelected: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
  playCoinBeep: () => void
  size?: 'small' | 'normal'
  colorIndex?: number
  isLocked?: boolean
  onLockedClick?: () => void
}) {
  const handleHover = () => {
    onHover()
    playCoinBeep()
  }

  const isSmall = size === 'small'
  const bgColor = getPastelColor(colorIndex)
  const borderColor = getPastelBorder(colorIndex)

  // Locked game — no Link, just a clickable div
  if (isLocked) {
    const cost = game.unlockCost || UNLOCK_COSTS[game.id] || 0
    return (
      <div
        onMouseEnter={handleHover}
        onMouseLeave={onLeave}
        onClick={(e) => {
          e.preventDefault()
          onLockedClick?.()
        }}
        className="group block cursor-pointer"
      >
        <div className={`
          relative transform transition-all duration-300 ease-out
          ${isSelected ? 'scale-105 -translate-y-2 z-20' : 'hover:scale-105 hover:-translate-y-1'}
        `}>
          {/* Lock cost badge */}
          <div className="absolute -top-2 -right-2 z-30 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <span>🪙</span>
            <span>{cost}</span>
          </div>

          <div className={`relative bg-gray-100 rounded-3xl overflow-hidden border-2 border-gray-300 shadow-md transition-shadow duration-300 ${isSelected ? 'shadow-lg shadow-gray-200' : 'hover:shadow-lg'}`}>
            {/* Emoji display area — dimmed */}
            <div className={`p-3 ${isSmall ? 'pb-2' : 'pb-3'}`}>
              <div className="relative bg-white/40 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
                <span className={`
                  ${isSmall ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'} transform transition-all duration-300 opacity-30 grayscale
                `} style={{
                  filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.08)) grayscale(80%)'
                }}>
                  {game.emoji}
                </span>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-gray-200">
                    <span className="text-2xl">🔒</span>
                  </div>
                </div>

                {/* Reading level badge */}
                <div className={`absolute top-1.5 left-1.5 text-xs px-2 py-0.5 rounded-full font-bold opacity-50 ${
                  game.readingLevel === 'no-reading' ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'
                }`}>
                  {game.readingLevel === 'no-reading' ? '👶' : '📖'}
                </div>

                {isSelected && (
                  <div className="absolute bottom-1.5 left-0 right-0 text-center">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold shadow-md">
                      🔓 Unlock?
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Title area */}
            <div className={`bg-white/40 px-3 ${isSmall ? 'py-2' : 'py-2.5'} text-center`}>
              <h3 className={`${isSmall ? 'text-sm' : 'text-base md:text-lg'} font-extrabold text-gray-500 tracking-wide truncate`}>
                {game.title}
              </h3>
              {!isSmall && (
                <p className="text-[11px] text-gray-400 truncate">{game.desc}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Unlocked game — normal Link
  return (
    <Link
      href={game.href}
      onMouseEnter={handleHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      className="group block"
    >
      <div className={`
        relative transform transition-all duration-300 ease-out
        ${isSelected ? 'scale-105 -translate-y-2 z-20' : 'hover:scale-105 hover:-translate-y-1'}
      `}>
        {game.isNew && (
          <div className="absolute -top-2 -right-2 z-30 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md animate-bounce-gentle">
            ✨ NEW!
          </div>
        )}

        <div className={`relative ${bgColor} rounded-3xl overflow-hidden border-2 ${borderColor} shadow-md ${isSelected ? 'shadow-xl shadow-pink-200' : 'hover:shadow-lg'} transition-shadow duration-300`}>
          {/* Emoji display area */}
          <div className={`p-3 ${isSmall ? 'pb-2' : 'pb-3'}`}>
            <div className="relative bg-white/60 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              <span className={`
                ${isSmall ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'} transform transition-all duration-300
                ${isSelected ? 'scale-110 animate-bounce-gentle' : 'group-hover:scale-110'}
              `} style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))'
              }}>
                {game.emoji}
              </span>

              {/* Reading level badge */}
              <div className={`absolute top-1.5 left-1.5 text-xs px-2 py-0.5 rounded-full font-bold ${
                game.readingLevel === 'no-reading' ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'
              }`}>
                {game.readingLevel === 'no-reading' ? '👶' : '📖'}
              </div>

              {isSelected && (
                <div className="absolute bottom-1.5 left-0 right-0 text-center">
                  <span className="bg-gradient-to-r from-pink-400 to-orange-400 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold shadow-md">
                    🎮 Play!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Title area */}
          <div className={`bg-white/50 px-3 ${isSmall ? 'py-2' : 'py-2.5'} text-center`}>
            <h3 className={`${isSmall ? 'text-sm' : 'text-base md:text-lg'} font-extrabold text-gray-700 tracking-wide truncate`}>
              {game.title}
            </h3>
            {!isSmall && (
              <p className="text-[11px] text-gray-500 truncate">{game.desc}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Horizontal scrollable row
function GameRow({
  games,
  selectedGame,
  setSelectedGame,
  playSelectSound,
  playCoinBeep,
  colorOffset = 0,
  isGameLocked,
  onLockedGameClick,
}: {
  games: Game[]
  selectedGame: string | null
  setSelectedGame: (id: string | null) => void
  playSelectSound: () => void
  playCoinBeep: () => void
  colorOffset?: number
  isGameLocked: (game: Game) => boolean
  onLockedGameClick: (game: Game) => void
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-8 scrollbar-hide">
      {games.map((game, i) => (
        <div key={game.id} className="flex-shrink-0 w-28 md:w-36">
          <GameCard
            game={game}
            isSelected={selectedGame === game.id}
            onHover={() => setSelectedGame(game.id)}
            onLeave={() => setSelectedGame(null)}
            onSelect={playSelectSound}
            playCoinBeep={playCoinBeep}
            size="small"
            colorIndex={i + colorOffset}
            isLocked={isGameLocked(game)}
            onLockedClick={() => onLockedGameClick(game)}
          />
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MAIN ARCADE PAGE — KID-FRIENDLY & CUTE
// =============================================================================

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedReadingLevel, setSelectedReadingLevel] = useState<ReadingLevel | null>(null)
  const { playCoinBeep, playSelectSound, playNavigateSound, playUnlockSound, playLockedSound } = useArcadeSounds()
  const { scores, recentlyPlayed } = useRealScores()
  const { balance, spendCoins } = useCoins()
  const { isUnlocked, unlockGame, mounted: unlockMounted } = useUnlockedGames()

  // Modal state
  const [modalGame, setModalGame] = useState<Game | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleLockedGameClick = useCallback((game: Game) => {
    playLockedSound()
    setModalGame(game)
  }, [playLockedSound])

  const handleUnlockConfirm = useCallback(() => {
    if (!modalGame) return
    const cost = modalGame.unlockCost || UNLOCK_COSTS[modalGame.id] || 0
    const success = spendCoins(cost, `Unlocked game: ${modalGame.title}`)
    if (success) {
      unlockGame(modalGame.id)
      setModalGame(null)
      playUnlockSound()
      setShowCelebration(true)
    }
  }, [modalGame, spendCoins, unlockGame, playUnlockSound])

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false)
  }, [])

  const isGameLocked = useCallback((game: Game): boolean => {
    if (!unlockMounted) return false // Don't show locks during SSR/hydration
    return !isUnlocked(game)
  }, [isUnlocked, unlockMounted])

  // Game of the day (rotate daily)
  const gameOfTheDay = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return allGames[dayOfYear % allGames.length]
  }, [])

  // Recently played (from real localStorage data)
  const recentGames = useMemo(() =>
    allGames.filter(g => recentlyPlayed.includes(g.id)).slice(0, 6),
    [recentlyPlayed]
  )

  // Filtered games
  const filteredGames = useMemo(() => {
    let result = allGames
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(g =>
        g.title.toLowerCase().includes(searchLower) ||
        g.desc.toLowerCase().includes(searchLower) ||
        g.category.toLowerCase().includes(searchLower)
      )
    }
    if (selectedCategory) {
      result = result.filter(g => g.category === selectedCategory)
    }
    if (selectedReadingLevel) {
      result = result.filter(g => g.readingLevel === selectedReadingLevel)
    }
    return result
  }, [search, selectedCategory, selectedReadingLevel])

  // Games by category for browsing
  const gamesByCategory = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      games: allGames.filter(g => g.category === cat.name)
    }))
  }, [])

  // Count unlocked/total
  const unlockedCount = allGames.filter(g => !isGameLocked(g)).length
  const totalCount = allGames.length

  return (
    <PlayroomFrame>
      <div className="min-h-screen relative overflow-hidden pt-4" style={{
        background: 'linear-gradient(180deg, #E0F2FE 0%, #FCE7F3 25%, #FEF9C3 50%, #DCFCE7 75%, #E0E7FF 100%)'
      }}>
        {/* Soft cloud-like shapes in background */}
        <div className="absolute top-10 left-[5%] w-40 h-20 bg-white/40 rounded-full blur-2xl" />
        <div className="absolute top-32 right-[10%] w-60 h-24 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute top-[60%] left-[15%] w-48 h-20 bg-white/30 rounded-full blur-2xl" />
        <div className="absolute bottom-32 right-[20%] w-52 h-24 bg-white/25 rounded-full blur-3xl" />

        <FloatingDecorations />

        {/* Unlock celebration overlay */}
        <UnlockCelebration show={showCelebration} onDone={handleCelebrationDone} />

        {/* Unlock modal */}
        {modalGame && (
          <UnlockModal
            game={modalGame}
            balance={balance}
            onConfirm={handleUnlockConfirm}
            onCancel={() => setModalGame(null)}
          />
        )}

        <div className="relative z-10">
          {/* Top bar: back button + coin balance */}
          <div className="flex items-center justify-between px-4 pt-2 pb-0 z-20 relative">
            <Link
              href="/games/arcade/"
              className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full font-bold text-gray-600 shadow-md transition-all hover:scale-105 border-2 border-pink-200 hover:border-pink-300"
            >
              <span className="text-pink-500 text-lg">←</span>
              <span className="text-sm">Home</span>
            </Link>

            <CoinBalanceDisplay balance={balance} />
          </div>

          {/* Header — Cute & Bouncy */}
          <div className="text-center pt-4 pb-2 relative">
            <div className="inline-block relative px-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl md:text-3xl animate-bounce-gentle" style={{ animationDelay: '0s' }}>🌈</span>
                <span className="text-2xl md:text-3xl animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>⭐</span>
                <span className="text-2xl md:text-3xl animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>🎮</span>
                <span className="text-2xl md:text-3xl animate-bounce-gentle" style={{ animationDelay: '0.6s' }}>⭐</span>
                <span className="text-2xl md:text-3xl animate-bounce-gentle" style={{ animationDelay: '0.8s' }}>🌈</span>
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  Onde
                </span>
                <span className="mx-2 md:mx-3" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-500 to-green-500">
                  Arcade
                </span>
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-2">📚 Fun Educational Games — Learn While You Play! 🧠</p>
              <p className="text-gray-400 font-medium text-xs mt-1">
                🔓 {unlockedCount}/{totalCount} games unlocked
              </p>
            </div>
          </div>

          <CheerfulBanner />
          <HighScoresTicker scores={scores} />

          {/* Game of the Day */}
          <div className="py-6">
            <GameOfTheDay
              game={gameOfTheDay}
              onClick={() => {
                if (isGameLocked(gameOfTheDay)) {
                  handleLockedGameClick(gameOfTheDay)
                } else {
                  playSelectSound()
                }
              }}
              isLocked={isGameLocked(gameOfTheDay)}
            />
          </div>

          {/* Reading Level Filter */}
          <ReadingLevelFilter
            selectedLevel={selectedReadingLevel}
            setSelectedLevel={setSelectedReadingLevel}
            onNavigate={playNavigateSound}
          />

          {/* Search and Category Filter */}
          <SearchAndFilter
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onNavigate={playNavigateSound}
          />

          {/* Recently Played (only if they have real data) */}
          {!search && !selectedCategory && !selectedReadingLevel && recentGames.length > 0 && (
            <div className="py-4">
              <SectionHeader icon="🕐" title="Recently Played" />
              <GameRow
                games={recentGames}
                selectedGame={selectedGame}
                setSelectedGame={setSelectedGame}
                playSelectSound={playSelectSound}
                playCoinBeep={playCoinBeep}
                colorOffset={0}
                isGameLocked={isGameLocked}
                onLockedGameClick={handleLockedGameClick}
              />
            </div>
          )}

          {/* Browse by category when no filters active */}
          {!search && !selectedCategory && !selectedReadingLevel && (
            <>
              {gamesByCategory.map((cat, catIdx) => (
                <div key={cat.name} className="py-4">
                  <SectionHeader icon={cat.emoji} title={cat.name} />
                  <GameRow
                    games={cat.games}
                    selectedGame={selectedGame}
                    setSelectedGame={setSelectedGame}
                    playSelectSound={playSelectSound}
                    playCoinBeep={playCoinBeep}
                    colorOffset={catIdx * 3}
                    isGameLocked={isGameLocked}
                    onLockedGameClick={handleLockedGameClick}
                  />
                </div>
              ))}
            </>
          )}

          {/* All Games Grid (when filtering) */}
          {(search || selectedCategory || selectedReadingLevel) && (
            <div className="py-6">
              <SectionHeader
                icon={selectedCategory ? categories.find(c => c.name === selectedCategory)?.emoji || '🎮' : '🎮'}
                title={
                  selectedCategory
                    ? selectedCategory
                    : selectedReadingLevel
                    ? `${selectedReadingLevel === 'no-reading' ? '👶 No Reading Required' : '📖 Can Read'}`
                    : 'All Games'
                }
              />

              {filteredGames.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <p className="text-gray-500 font-medium">No games found — try a different search! 🌈</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 px-4 md:px-8">
                  {filteredGames.map((game, i) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isSelected={selectedGame === game.id}
                      onHover={() => setSelectedGame(game.id)}
                      onLeave={() => setSelectedGame(null)}
                      onSelect={playSelectSound}
                      playCoinBeep={playCoinBeep}
                      size="small"
                      colorIndex={i}
                      isLocked={isGameLocked(game)}
                      onLockedClick={() => handleLockedGameClick(game)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Games Grid (when no filter, at the bottom) */}
          {!search && !selectedCategory && !selectedReadingLevel && (
            <div className="py-6">
              <SectionHeader icon="🎮" title="All Educational Games" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 px-4 md:px-8">
                {allGames.map((game, i) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGame === game.id}
                    onHover={() => setSelectedGame(game.id)}
                    onLeave={() => setSelectedGame(null)}
                    onSelect={playSelectSound}
                    playCoinBeep={playCoinBeep}
                    size="small"
                    colorIndex={i}
                    isLocked={isGameLocked(game)}
                    onLockedClick={() => handleLockedGameClick(game)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer — Cheerful */}
          <div className="text-center py-8 pb-16">
            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-pink-200 shadow-md">
              <span className="text-2xl">🌈</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-extrabold tracking-wide text-sm md:text-base">
                {allGames.length} Fun Games • Learn & Play!
              </span>
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        {/* Custom animations — soft & cute */}
        <style jsx>{`
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-12px) rotate(3deg); }
            75% { transform: translateY(-6px) rotate(-2deg); }
          }
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.9); }
          }
          @keyframes rainbow-text {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes celebration-particle {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            50% {
              transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.2);
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + var(--tx) * 1.5), calc(-50% + var(--ty) * 1.5 + 40px)) scale(0.3);
              opacity: 0;
            }
          }
          @keyframes unlock-badge {
            0% {
              transform: scale(0) rotate(-20deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) rotate(5deg);
              opacity: 1;
            }
            70% {
              transform: scale(0.95) rotate(-2deg);
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
          @keyframes modal-pop {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-float-gentle {
            animation: float-gentle 6s ease-in-out infinite;
          }
          .animate-bounce-gentle {
            animation: bounce-gentle 2s ease-in-out infinite;
          }
          .animate-sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }
          .animate-rainbow-text {
            animation: rainbow-text 4s linear infinite;
          }
          .animate-ticker {
            animation: ticker 20s linear infinite;
          }
          .animate-celebration-particle {
            animation: celebration-particle 1.5s ease-out forwards;
          }
          .animate-unlock-badge {
            animation: unlock-badge 0.6s ease-out forwards;
          }
          .animate-modal-pop {
            animation: modal-pop 0.3s ease-out forwards;
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
    </PlayroomFrame>
  )
}
