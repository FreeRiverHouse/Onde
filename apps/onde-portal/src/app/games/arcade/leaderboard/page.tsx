'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

type LeaderboardEntry = {
  id: string
  rank: number
  name: string
  score: number
  game: string
  gameEmoji: string
  date: string // ISO date string
}

const GAMES = [
  { id: 'all', name: 'All Games', emoji: '🎮' },
  { id: 'moonlight', name: 'Moonlight', emoji: '🐱' },
  { id: 'skin', name: 'Skin Creator', emoji: '🎨' },
  { id: 'chef', name: 'Kids Chef', emoji: '👨‍🍳' },
  { id: 'fortune', name: 'Fortune Cookie', emoji: '🥠' },
]

// Generate mock data
function generateMockData(): LeaderboardEntry[] {
  const names = ['AAA', 'ZZZ', 'CAT', 'OMG', 'LOL', 'WOW', 'PRO', 'ACE', 'MVP', 'GGG', 
                 'MAX', 'NEO', 'BOB', 'SAM', 'EVE', 'DAN', 'JOE', 'KAT', 'LEO', 'MIA']
  const games = GAMES.slice(1) // Exclude 'all'
  
  const entries: LeaderboardEntry[] = []
  const now = new Date()
  
  for (let i = 0; i < 50; i++) {
    const game = games[Math.floor(Math.random() * games.length)]
    // Some entries from this week, some older
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    
    entries.push({
      id: `entry-${i}`,
      rank: 0, // Will be calculated
      name: names[Math.floor(Math.random() * names.length)],
      score: Math.floor(Math.random() * 900000) + 100000,
      game: game.id,
      gameEmoji: game.emoji,
      date: date.toISOString(),
    })
  }
  
  // Sort by score descending and assign ranks
  entries.sort((a, b) => b.score - a.score)
  entries.forEach((entry, i) => entry.rank = i + 1)
  
  return entries
}

function getLeaderboardData(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem('arcade-leaderboard')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Invalid data, regenerate
    }
  }
  
  const mockData = generateMockData()
  localStorage.setItem('arcade-leaderboard', JSON.stringify(mockData))
  return mockData
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  return date >= weekAgo
}

// Floating pixel particles (matching arcade page)
function FloatingPixels() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
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

// Neon tube lights (matching arcade page)
function NeonLights() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-80">
        <div className="absolute inset-0 blur-md bg-pink-500" />
      </div>
      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60">
        <div className="absolute inset-0 blur-lg bg-cyan-400" />
      </div>
      <div className="absolute right-0 top-1/3 bottom-1/3 w-1 bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-60">
        <div className="absolute inset-0 blur-lg bg-purple-500" />
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [selectedGame, setSelectedGame] = useState('all')
  const [timeFilter, setTimeFilter] = useState<'week' | 'all'>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEntries(getLeaderboardData())
  }, [])

  // Filter entries
  const filteredEntries = entries
    .filter(entry => selectedGame === 'all' || entry.game === selectedGame)
    .filter(entry => timeFilter === 'all' || isThisWeek(entry.date))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-cyan-400'
    if (rank === 3) return 'text-pink-400'
    if (rank <= 5) return 'text-green-400'
    return 'text-purple-400'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}.`
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background effects */}
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

      {/* Ambient glows */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-cyan-900/10 via-purple-900/5 to-transparent" />

      <FloatingPixels />
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
            href="/games/arcade"
            className="group flex items-center gap-2 bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm"
          >
            <span className="text-cyan-400">◀</span>
            <span>Arcade</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center pt-16 pb-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="text-yellow-400" style={{
              textShadow: '0 0 10px #facc15, 0 0 20px #facc15, 0 0 40px #facc15'
            }}>🏆 HIGH SCORES 🏆</span>
          </h1>
          <p className="mt-4 text-gray-400 font-mono tracking-wider">
            GLOBAL LEADERBOARD
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Game Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {GAMES.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`
                    px-3 py-2 rounded-lg font-mono text-sm font-bold transition-all
                    border-2
                    ${selectedGame === game.id 
                      ? 'bg-purple-600 border-purple-400 text-white scale-105 shadow-lg' 
                      : 'bg-black/50 border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white'}
                  `}
                  style={{
                    boxShadow: selectedGame === game.id ? '0 0 15px rgba(147, 51, 234, 0.5)' : 'none'
                  }}
                >
                  <span className="mr-1">{game.emoji}</span>
                  <span className="hidden sm:inline">{game.name}</span>
                </button>
              ))}
            </div>

            {/* Time Toggle */}
            <div className="flex bg-black/50 rounded-lg border-2 border-gray-700 overflow-hidden">
              <button
                onClick={() => setTimeFilter('week')}
                className={`
                  px-4 py-2 font-mono text-sm font-bold transition-all
                  ${timeFilter === 'week' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-400 hover:text-white'}
                `}
              >
                THIS WEEK
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`
                  px-4 py-2 font-mono text-sm font-bold transition-all
                  ${timeFilter === 'all' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-400 hover:text-white'}
                `}
              >
                ALL TIME
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <div className="relative bg-black rounded-2xl p-4 md:p-6 border-4 border-yellow-500/80 overflow-hidden shadow-2xl" style={{
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
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-gray-500 font-mono text-xs md:text-sm mb-4 pb-2 border-b border-yellow-500/30">
                <div className="col-span-2 text-center">RANK</div>
                <div className="col-span-3">NAME</div>
                <div className="col-span-4 text-right">SCORE</div>
                <div className="col-span-3 text-center">GAME</div>
              </div>

              {/* Table Body */}
              {mounted && filteredEntries.length > 0 ? (
                <div className="space-y-2">
                  {filteredEntries.map((entry, i) => (
                    <div 
                      key={entry.id}
                      className={`
                        grid grid-cols-12 gap-2 items-center py-2 px-1 rounded-lg
                        font-mono text-sm md:text-base
                        ${i < 3 ? 'bg-white/5' : ''}
                        ${getRankColor(entry.rank)}
                        transition-all hover:bg-white/10 hover:scale-[1.02]
                      `}
                      style={{
                        textShadow: i < 5 ? '0 0 8px currentColor' : 'none',
                        animationDelay: `${i * 50}ms`
                      }}
                    >
                      <div className="col-span-2 text-center font-bold text-lg">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="col-span-3 font-bold tracking-[0.2em]">
                        {entry.name}
                      </div>
                      <div className="col-span-4 text-right tabular-nums font-bold">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="col-span-3 text-center text-xl">
                        {entry.gameEmoji}
                      </div>
                    </div>
                  ))}
                </div>
              ) : mounted ? (
                <div className="text-center py-12">
                  <span className="text-gray-500 font-mono text-lg">NO SCORES YET</span>
                  <p className="text-gray-600 font-mono text-sm mt-2">Play some games to set records!</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-yellow-400 font-mono text-lg animate-pulse">LOADING...</span>
                </div>
              )}

              {/* Decorative line */}
              <div className="mt-6 border-t-2 border-dashed border-yellow-500/40" />

              {/* Footer */}
              <div className="mt-4 text-center">
                <span className="text-gray-500 font-mono text-sm">
                  {filteredEntries.length} PLAYER{filteredEntries.length !== 1 ? 'S' : ''} • 
                  {timeFilter === 'week' ? ' THIS WEEK' : ' ALL TIME'} • 
                  {selectedGame === 'all' ? ' ALL GAMES' : ` ${GAMES.find(g => g.id === selectedGame)?.name.toUpperCase()}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Arcade button */}
        <div className="text-center pb-12">
          <Link
            href="/games/arcade"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:scale-105 border-2 border-white/20"
            style={{
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
            }}
          >
            <span className="text-2xl">🕹️</span>
            <span>PLAY NOW</span>
          </Link>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.9; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
