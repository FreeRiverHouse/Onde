'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

type ItemType = 'apple' | 'orange' | 'star' | 'bomb'
type GameState = 'idle' | 'countdown' | 'playing' | 'gameover'

interface FallingItem {
  id: number
  type: ItemType
  x: number
  y: number
  speed: number
}

interface LeaderboardEntry {
  score: number
  date: string
}

// Sound effects using Web Audio API
const playSound = (type: 'catch' | 'miss' | 'star' | 'bomb' | 'gameOver') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'catch':
        osc.frequency.value = 523.25
        osc.type = 'sine'
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(659.25, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'miss':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'star':
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.2
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
            osc2.stop(audio.currentTime + 0.15)
          }, i * 50)
        })
        osc.stop(0)
        break
      case 'bomb':
        osc.frequency.value = 150
        osc.type = 'square'
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'gameOver':
        const goNotes = [392, 349.23, 329.63, 293.66, 261.63]
        goNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 150)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

const itemEmojis: Record<ItemType, string> = {
  apple: '🍎',
  orange: '🍊',
  star: '⭐',
  bomb: '💣',
}

const itemPoints: Record<ItemType, number> = {
  apple: 10,
  orange: 15,
  star: 50,
  bomb: -100,
}

function CatchGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [basketX, setBasketX] = useState(50)
  const [items, setItems] = useState<FallingItem[]>([])
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const itemIdRef = useRef(0)

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('catch-leaderboard')
    if (saved) {
      setLeaderboard(JSON.parse(saved))
    }
  }, [])

  // Save to leaderboard
  const saveScore = useCallback((finalScore: number) => {
    const entry: LeaderboardEntry = {
      score: finalScore,
      date: new Date().toLocaleDateString(),
    }
    const updated = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    setLeaderboard(updated)
    localStorage.setItem('catch-leaderboard', JSON.stringify(updated))

    if (updated[0]?.score === finalScore) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [leaderboard])

  // Countdown
  useEffect(() => {
    if (gameState !== 'countdown') return
    if (countdown === 0) {
      setGameState('playing')
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [gameState, countdown])

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return
    if (timeLeft === 0 || lives === 0) {
      setGameState('gameover')
      rewards.trackWin()
      playSound('gameOver')
      saveScore(score)
      return
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [gameState, timeLeft, lives, score, saveScore])

  // Spawn items
  useEffect(() => {
    if (gameState !== 'playing') return
    const spawnInterval = setInterval(() => {
      const rand = Math.random()
      let type: ItemType
      if (rand < 0.4) type = 'apple'
      else if (rand < 0.7) type = 'orange'
      else if (rand < 0.85) type = 'star'
      else type = 'bomb'

      const newItem: FallingItem = {
        id: itemIdRef.current++,
        type,
        x: 10 + Math.random() * 80,
        y: 0,
        speed: 1 + Math.random() * 2 + (60 - timeLeft) * 0.02,
      }
      setItems(prev => [...prev, newItem])
    }, 800 - (60 - timeLeft) * 5)

    return () => clearInterval(spawnInterval)
  }, [gameState, timeLeft])

  // Move items
  useEffect(() => {
    if (gameState !== 'playing') return
    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updated: FallingItem[] = []
        prev.forEach(item => {
          const newY = item.y + item.speed
          
          // Check if caught by basket
          if (newY >= 85 && newY <= 95 && Math.abs(item.x - basketX) < 12) {
            const points = itemPoints[item.type]
            setScore(s => Math.max(0, s + points))
            if (item.type === 'bomb') {
              playSound('bomb')
              setLives(l => l - 1)
            } else if (item.type === 'star') {
              playSound('star')
            } else {
              playSound('catch')
            }
            return
          }
          
          // Check if missed (good items only)
          if (newY > 100) {
            if (item.type !== 'bomb') {
              playSound('miss')
              setLives(l => l - 1)
            }
            return
          }
          
          updated.push({ ...item, y: newY })
        })
        return updated
      })
    }, 50)

    return () => clearInterval(moveInterval)
  }, [gameState, basketX])

  // Mouse/touch controls
  const handleMove = useCallback((clientX: number) => {
    if (!gameAreaRef.current || gameState !== 'playing') return
    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    setBasketX(Math.max(10, Math.min(90, x)))
  }, [gameState])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX)
  }, [handleMove])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX)
    }
  }, [handleMove])

  const startGame = () => {
    setScore(0)
    setLives(3)
    setTimeLeft(60)
    setItems([])
    setCountdown(3)
    setGameState('countdown')
    itemIdRef.current = 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white/20 backdrop-blur-sm">
        <Link 
          href="/games/" 
          className="text-2xl hover:scale-110 transition-transform"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">🧺 Catch!</h1>
        <div className="text-xl">
          {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
        </div>
      </header>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="flex-1 relative overflow-hidden cursor-none select-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Stats bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 z-10">
          <div className="text-xl font-bold text-white drop-shadow">
            ⏱️ {timeLeft}s
          </div>
          <div className="text-xl font-bold text-yellow-300 drop-shadow">
            🪙 {score}
          </div>
        </div>

        {/* Falling Items */}
        {items.map(item => (
          <div
            key={item.id}
            className="absolute text-4xl transition-all"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {itemEmojis[item.type]}
          </div>
        ))}

        {/* Basket */}
        <div
          className="absolute bottom-[5%] text-6xl transition-all duration-75"
          style={{
            left: `${basketX}%`,
            transform: 'translateX(-50%)',
          }}
        >
          🧺
        </div>

        {/* Idle Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              🧺 Fruit Catch!
            </h2>
            <p className="text-white/80 mb-2">Catch fruits, avoid bombs!</p>
            <p className="text-white/60 text-sm mb-6">
              🍎 = 10 pts | 🍊 = 15 pts | ⭐ = 50 pts | 💣 = -100 pts
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Play!
            </button>
            
            {leaderboard.length > 0 && (
              <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white font-bold mb-2 text-center">🏆 High Scores</h3>
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <div key={i} className="flex justify-between text-white/80 text-sm gap-4">
                    <span>{i + 1}. {entry.score} pts</span>
                    <span>{entry.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Countdown */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-9xl font-bold text-white animate-bounce">
              {countdown || 'GO!'}
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4">
              {lives === 0 ? '💔 Game Over!' : '⏰ Time\'s Up!'}
            </h2>
            <p className="text-6xl font-bold text-yellow-300 mb-6">
              {score} pts
            </p>
            {leaderboard[0]?.score === score && (
              <p className="text-2xl text-green-400 mb-4 animate-pulse">
                🎉 New High Score! 🎉
              </p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Play Again!
            </button>
          </div>
        )}

        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: ['#fcd34d', '#22c55e', '#f472b6', '#3b82f6'][i % 4],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

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
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function CatchGame() {
  return (
    <GameWrapper gameName="Catch" gameId="catch" emoji={"🧺"}>
      <CatchGameInner />
    </GameWrapper>
  )
}
