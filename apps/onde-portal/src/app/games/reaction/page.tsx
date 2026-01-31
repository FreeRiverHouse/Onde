'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'waiting' | 'ready' | 'clicked' | 'tooEarly' | 'roundComplete' | 'gameOver'

interface LeaderboardEntry {
  averageTime: number
  bestTime: number
  date: string
  rounds: number[]
}

// Sound effects using Web Audio API
const playSound = (type: 'click' | 'go' | 'tooEarly' | 'success' | 'gameOver') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'click':
        osc.frequency.value = 400
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'go':
        osc.frequency.value = 880
        gain.gain.value = 0.2
        osc.start()
        setTimeout(() => {
          osc.frequency.value = 1100
        }, 50)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'tooEarly':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.linearRampToValueAtTime(100, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'success':
        osc.frequency.value = 523.25
        gain.gain.value = 0.15
        osc.start()
        setTimeout(() => { osc.frequency.value = 659.25 }, 80)
        setTimeout(() => { osc.frequency.value = 783.99 }, 160)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'gameOver':
        const notes = [783.99, 659.25, 523.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc2.stop(audio.currentTime + 0.2)
          }, i * 120)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported, ignore
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#22c55e', '#4ade80', '#86efac', '#10b981', '#34d399', '#fcd34d', '#fb923c']
  const confetti = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : ''}`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Pulse ring animation component
const PulseRings = ({ active, color }: { active: boolean, color: string }) => {
  if (!active) return null
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full border-4 ${color} animate-ping`}
          style={{
            width: `${60 + i * 40}%`,
            height: `${60 + i * 40}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
            opacity: 0.6 - i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

// Speed rating
const getSpeedRating = (ms: number): { label: string, emoji: string, color: string } => {
  if (ms < 150) return { label: 'SUPERHUMAN!', emoji: '⚡', color: 'text-purple-500' }
  if (ms < 200) return { label: 'LIGHTNING!', emoji: '🚀', color: 'text-yellow-500' }
  if (ms < 250) return { label: 'FAST!', emoji: '🔥', color: 'text-orange-500' }
  if (ms < 300) return { label: 'QUICK!', emoji: '💨', color: 'text-green-500' }
  if (ms < 400) return { label: 'GOOD', emoji: '👍', color: 'text-blue-500' }
  if (ms < 500) return { label: 'OKAY', emoji: '🙂', color: 'text-cyan-500' }
  return { label: 'SLOW', emoji: '🐢', color: 'text-gray-500' }
}

const TOTAL_ROUNDS = 5

export default function ReactionGame() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentRound, setCurrentRound] = useState(0)
  const [roundTimes, setRoundTimes] = useState<number[]>([])
  const [currentTime, setCurrentTime] = useState<number | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const startTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('reaction-game-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current)
    }
  }, [])

  // Start new game
  const startGame = useCallback(() => {
    setRoundTimes([])
    setCurrentRound(0)
    setCurrentTime(null)
    setShowConfetti(false)
    setCountdown(3)
    
    if (soundEnabled) playSound('click')

    // Countdown
    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        setCountdown(null)
        clearInterval(countdownInterval)
        startRound()
      }
    }, 800)
  }, [soundEnabled])

  // Start a round
  const startRound = useCallback(() => {
    setGameState('waiting')
    setCurrentTime(null)

    // Random delay between 1.5 and 5 seconds
    const delay = 1500 + Math.random() * 3500
    
    waitingTimeoutRef.current = setTimeout(() => {
      setGameState('ready')
      startTimeRef.current = performance.now()
      if (soundEnabled) playSound('go')
    }, delay)
  }, [soundEnabled])

  // Handle click/tap on the target
  const handleTargetClick = useCallback(() => {
    if (gameState === 'waiting') {
      // Too early!
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current)
      }
      setGameState('tooEarly')
      if (soundEnabled) playSound('tooEarly')
      
      // Auto-retry after delay
      timeoutRef.current = setTimeout(() => {
        startRound()
      }, 1500)
      
    } else if (gameState === 'ready') {
      // Calculate reaction time
      const reactionTime = Math.round(performance.now() - startTimeRef.current)
      setCurrentTime(reactionTime)
      setGameState('roundComplete')
      
      if (soundEnabled) playSound('success')

      const newRoundTimes = [...roundTimes, reactionTime]
      setRoundTimes(newRoundTimes)
      
      const nextRound = currentRound + 1
      setCurrentRound(nextRound)

      if (nextRound >= TOTAL_ROUNDS) {
        // Game complete
        timeoutRef.current = setTimeout(() => {
          finishGame(newRoundTimes)
        }, 1500)
      } else {
        // Next round after delay
        timeoutRef.current = setTimeout(() => {
          startRound()
        }, 1500)
      }
    }
  }, [gameState, roundTimes, currentRound, soundEnabled, startRound])

  // Finish game and save to leaderboard
  const finishGame = useCallback((times: number[]) => {
    setGameState('gameOver')
    setShowConfetti(true)
    if (soundEnabled) playSound('gameOver')

    const averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    const bestTime = Math.min(...times)

    const newEntry: LeaderboardEntry = {
      averageTime,
      bestTime,
      date: new Date().toISOString(),
      rounds: times,
    }

    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => a.averageTime - b.averageTime)
      .slice(0, 10)

    setLeaderboard(newLeaderboard)
    localStorage.setItem('reaction-game-leaderboard', JSON.stringify(newLeaderboard))
  }, [leaderboard, soundEnabled])

  // Calculate stats
  const averageTime = roundTimes.length > 0 
    ? Math.round(roundTimes.reduce((a, b) => a + b, 0) / roundTimes.length) 
    : null
  const bestTime = roundTimes.length > 0 ? Math.min(...roundTimes) : null

  // Get background color based on state
  const getBackgroundClass = () => {
    switch (gameState) {
      case 'waiting':
        return 'from-red-500 via-red-600 to-red-700'
      case 'ready':
        return 'from-green-400 via-green-500 to-green-600'
      case 'tooEarly':
        return 'from-orange-500 via-orange-600 to-orange-700'
      case 'roundComplete':
      case 'gameOver':
        return 'from-blue-500 via-purple-500 to-pink-500'
      default:
        return 'from-indigo-500 via-purple-500 to-pink-500'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} transition-all duration-300 flex flex-col`}>
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Link
          href="/games"
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Games
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
          >
            🏆
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Round indicator */}
      {gameState !== 'idle' && gameState !== 'gameOver' && countdown === null && (
        <div className="flex justify-center gap-2 px-4 py-2">
          {[...Array(TOTAL_ROUNDS)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < roundTimes.length
                  ? 'bg-white scale-100'
                  : i === currentRound
                  ? 'bg-white/60 scale-110 animate-pulse'
                  : 'bg-white/30 scale-90'
              }`}
            />
          ))}
        </div>
      )}

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="text-center">
            <div className="text-9xl font-black text-white animate-bounce drop-shadow-lg">
              {countdown}
            </div>
            <p className="text-2xl text-white/80 mt-4 font-bold">Get Ready!</p>
          </div>
        )}

        {/* Idle state */}
        {gameState === 'idle' && countdown === null && (
          <div className="text-center">
            <div className="text-6xl mb-6">⚡</div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
              Reaction Time
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-md">
              Test your reflexes! Wait for green, then tap as fast as you can.
            </p>
            <button
              onClick={startGame}
              className="px-10 py-5 bg-white text-purple-700 font-black text-2xl rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            >
              🎮 START
            </button>
          </div>
        )}

        {/* Waiting state - red */}
        {gameState === 'waiting' && (
          <button
            onClick={handleTargetClick}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-red-600 shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 0 60px rgba(239, 68, 68, 0.5)' }}
          >
            <div className="text-center">
              <div className="text-6xl md:text-7xl mb-2">🔴</div>
              <p className="text-xl md:text-2xl font-bold text-white/90">
                Wait for green...
              </p>
            </div>
          </button>
        )}

        {/* Ready state - green */}
        {gameState === 'ready' && (
          <button
            onClick={handleTargetClick}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-green-500 shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 animate-pulse"
            style={{ boxShadow: '0 0 80px rgba(34, 197, 94, 0.7)' }}
          >
            <PulseRings active={true} color="border-green-300" />
            <div className="text-center relative z-10">
              <div className="text-6xl md:text-7xl mb-2 animate-bounce">🟢</div>
              <p className="text-2xl md:text-3xl font-black text-white">
                TAP NOW!
              </p>
            </div>
          </button>
        )}

        {/* Too early state */}
        {gameState === 'tooEarly' && (
          <div className="text-center">
            <div className="text-6xl md:text-7xl mb-4 animate-shake">❌</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
              Too Early!
            </h2>
            <p className="text-lg text-white/80">
              Wait for the green light...
            </p>
            <p className="text-sm text-white/60 mt-4 animate-pulse">
              Retrying in a moment...
            </p>
          </div>
        )}

        {/* Round complete state */}
        {gameState === 'roundComplete' && currentTime !== null && (
          <div className="text-center">
            {(() => {
              const rating = getSpeedRating(currentTime)
              return (
                <>
                  <div className="text-5xl md:text-6xl mb-2 animate-bounce">
                    {rating.emoji}
                  </div>
                  <div className={`text-xl md:text-2xl font-bold mb-2 ${rating.color}`}>
                    {rating.label}
                  </div>
                </>
              )
            })()}
            <div className="text-6xl md:text-8xl font-black text-white mb-2 animate-pop">
              {currentTime}
              <span className="text-3xl md:text-4xl">ms</span>
            </div>
            <p className="text-lg text-white/80">
              Round {currentRound} of {TOTAL_ROUNDS}
            </p>
            {averageTime !== null && (
              <p className="text-sm text-white/60 mt-2">
                Average: {averageTime}ms
              </p>
            )}
          </div>
        )}

        {/* Game over state */}
        {gameState === 'gameOver' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              Game Complete!
            </h2>
            
            {/* Results */}
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6 max-w-sm">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white">
                    {averageTime}ms
                  </div>
                  <div className="text-sm text-white/70">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-yellow-300">
                    {bestTime}ms
                  </div>
                  <div className="text-sm text-white/70">Best</div>
                </div>
              </div>
              
              {/* Round breakdown */}
              <div className="border-t border-white/20 pt-4">
                <div className="text-sm text-white/70 mb-2">All Rounds:</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {roundTimes.map((time, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        time === bestTime
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-white/30 text-white'
                      }`}
                    >
                      {time}ms
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-4 bg-white text-purple-700 font-black text-xl rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            >
              🔄 Play Again
            </button>
          </div>
        )}
      </div>

      {/* Stats bar (during game) */}
      {gameState !== 'idle' && gameState !== 'gameOver' && countdown === null && (
        <div className="flex justify-center gap-4 p-4">
          {averageTime !== null && (
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              <span className="text-white/70 text-sm">Avg: </span>
              <span className="text-white font-bold">{averageTime}ms</span>
            </div>
          )}
          {bestTime !== null && (
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              <span className="text-white/70 text-sm">Best: </span>
              <span className="text-yellow-300 font-bold">{bestTime}ms</span>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
          onClick={() => setShowLeaderboard(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-purple-700">🏆 Best Times</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No records yet! Play a game to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <div className="font-bold text-purple-700">{entry.averageTime}ms avg</div>
                        <div className="text-xs text-gray-500">Best: {entry.bestTime}ms</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(entry.date)}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setLeaderboard([])
                localStorage.removeItem('reaction-game-leaderboard')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-all"
            >
              🗑️ Clear Records
            </button>
          </div>
        </div>
      )}

      {/* Decorations */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-50">⚡</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-50" style={{ animationDelay: '0.3s' }}>🎯</div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-30" style={{ animationDelay: '0.6s' }}>✨</div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.6s ease-out;
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
