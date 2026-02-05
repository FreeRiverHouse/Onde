'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useGlobalLeaderboard, formatScore, formatTimestamp } from '@/hooks/useGlobalLeaderboard'

const GAMES = [
  { id: 'all', name: 'All Games', emoji: '🎮' },
  { id: 'simon', name: 'Simon Says', emoji: '🔴' },
  { id: 'memory', name: 'Memory', emoji: '🧠' },
  { id: 'typing', name: 'Typing', emoji: '⌨️' },
  { id: 'reaction', name: 'Reaction', emoji: '⚡' },
  { id: 'puzzle', name: 'Puzzle', emoji: '🧩' },
  { id: 'quiz', name: 'Quiz', emoji: '❓' },
  { id: 'matching', name: 'Matching', emoji: '🃏' },
  { id: 'counting', name: 'Counting', emoji: '🔢' },
  { id: 'spot-difference', name: 'Spot Diff', emoji: '👀' },
  { id: 'word-puzzle', name: 'Word Puzzle', emoji: '📝' },
]

type TimeFilter = 'all' | 'week'

export default function LeaderboardPage() {
  const { entries, topPlayers, thisWeekEntries, getGameLeaderboard } = useGlobalLeaderboard()
  const [selectedGame, setSelectedGame] = useState('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  // Get filtered entries
  const getFilteredEntries = () => {
    let filtered = timeFilter === 'week' ? thisWeekEntries : entries
    
    if (selectedGame !== 'all') {
      filtered = filtered.filter(e => e.game.toLowerCase() === selectedGame.toLowerCase())
    }
    
    // Get unique players with their best scores
    const playerBest = new Map<string, typeof filtered[0]>()
    for (const entry of filtered) {
      const existing = playerBest.get(entry.name)
      if (!existing || entry.score > existing.score) {
        playerBest.set(entry.name, entry)
      }
    }
    
    return Array.from(playerBest.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
  }

  const displayEntries = getFilteredEntries()

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-amber-500'
    if (index === 1) return 'from-gray-300 to-gray-400'
    if (index === 2) return 'from-amber-600 to-orange-700'
    return 'from-slate-200 to-slate-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-200 animate-twinkle"
            style={{
              left: `${(i * 3.3) % 100}%`,
              top: `${(i * 7.7) % 80}%`,
              fontSize: `${8 + (i % 4) * 2}px`,
              animationDelay: `${(i * 0.2) % 3}s`,
              opacity: 0.4 + (i % 4) * 0.15,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Floating trophies */}
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-30">🏆</div>
      <div className="absolute top-40 right-20 text-5xl animate-float-delayed opacity-25">🏆</div>
      <div className="absolute bottom-40 left-20 text-4xl animate-float opacity-20">🏆</div>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          href="/games/arcade/"
          className="bg-white/90 hover:bg-white px-5 py-2.5 rounded-full font-bold text-purple-600 shadow-xl transition-all hover:scale-105 border-2 border-purple-200"
        >
          ← Back to Arcade
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with Trophy */}
        <div className="text-center mb-8 pt-12">
          <div className="relative inline-block">
            {/* Trophy glow effect */}
            <div className="absolute -inset-8 bg-yellow-400/30 blur-3xl rounded-full animate-pulse" />
            <div className="text-8xl md:text-9xl mb-4 relative animate-trophy-bounce drop-shadow-2xl">
              🏆
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-lg">
            Hall of Champions
          </h1>
          <p className="text-purple-200 text-lg mt-2">The greatest players of Onde World!</p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Time filter */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                timeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🌟 All Time
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                timeFilter === 'week'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📅 This Week
            </button>
          </div>

          {/* Game filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${
                  selectedGame === game.id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {game.emoji} {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-2xl mx-auto">
          {displayEntries.length === 0 ? (
            <div className="text-center py-16 bg-white/10 backdrop-blur rounded-3xl border border-white/20">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-2">No scores yet!</h2>
              <p className="text-purple-200 mb-6">Be the first champion on the leaderboard!</p>
              <Link
                href="/games/arcade/"
                className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                🎮 Play Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`relative overflow-hidden rounded-2xl transition-all hover:scale-[1.02] ${
                    index < 3 ? 'animate-glow-pulse' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Background gradient based on rank */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(index)} opacity-90`} />
                  
                  {/* Shine effect for top 3 */}
                  {index < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                  )}

                  <div className="relative flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className={`w-14 h-14 flex items-center justify-center rounded-xl font-black ${
                      index < 3 ? 'text-3xl' : 'text-lg bg-white/30 text-gray-800'
                    }`}>
                      {getRankDisplay(index)}
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-gray-900 truncate">
                          {entry.name}
                        </span>
                        {index === 0 && <span className="text-sm animate-bounce">👑</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>{entry.gameEmoji}</span>
                        <span className="capitalize">{entry.game}</span>
                        <span className="opacity-50">•</span>
                        <span className="opacity-75">{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`font-black ${index < 3 ? 'text-2xl' : 'text-xl'} text-gray-900`}>
                        {formatScore(entry.score)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fun stats */}
        {entries.length > 0 && (
          <div className="max-w-2xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
              <div className="text-3xl mb-1">🎮</div>
              <div className="text-2xl font-black text-white">{entries.length}</div>
              <div className="text-sm text-purple-200">Games Played</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
              <div className="text-3xl mb-1">👥</div>
              <div className="text-2xl font-black text-white">{topPlayers.length}</div>
              <div className="text-sm text-purple-200">Players</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
              <div className="text-3xl mb-1">⚡</div>
              <div className="text-2xl font-black text-white">
                {entries.length > 0 ? formatScore(Math.max(...entries.map(e => e.score))) : 0}
              </div>
              <div className="text-sm text-purple-200">High Score</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
              <div className="text-3xl mb-1">📅</div>
              <div className="text-2xl font-black text-white">{thisWeekEntries.length}</div>
              <div className="text-sm text-purple-200">This Week</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-trophy-bounce { animation: trophy-bounce 3s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-shine { animation: shine 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
