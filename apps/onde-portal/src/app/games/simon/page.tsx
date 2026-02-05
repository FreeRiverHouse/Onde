'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type ColorButton = 'red' | 'green' | 'blue' | 'yellow'
type GameState = 'idle' | 'playing' | 'showing' | 'waiting' | 'gameover'

interface HighScoreEntry {
  score: number
  date: string
}

// Color configurations
const COLORS: Record<ColorButton, { bg: string; active: string; glow: string; frequency: number }> = {
  red: {
    bg: 'bg-red-600',
    active: 'bg-red-400',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.9)]',
    frequency: 329.63, // E4
  },
  green: {
    bg: 'bg-green-600',
    active: 'bg-green-400',
    glow: 'shadow-[0_0_60px_rgba(34,197,94,0.9)]',
    frequency: 261.63, // C4
  },
  blue: {
    bg: 'bg-blue-600',
    active: 'bg-blue-400',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.9)]',
    frequency: 392.0, // G4
  },
  yellow: {
    bg: 'bg-yellow-500',
    active: 'bg-yellow-300',
    glow: 'shadow-[0_0_60px_rgba(234,179,8,0.9)]',
    frequency: 523.25, // C5
  },
}

const COLOR_ORDER: ColorButton[] = ['green', 'red', 'yellow', 'blue']

// Sound effects using Web Audio API
const playTone = (frequency: number, duration: number = 300) => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.value = 0.3

    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + duration / 1000)
    osc.stop(audio.currentTime + duration / 1000)
  } catch {
    // Audio not supported
  }
}

const playErrorSound = () => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    osc.type = 'sawtooth'
    osc.frequency.value = 150
    gain.gain.value = 0.2

    osc.start()
    osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
    osc.stop(audio.currentTime + 0.5)
  } catch {
    // Audio not supported
  }
}

const playVictorySound = () => {
  try {
    const audio = new AudioContext()
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.connect(gain)
        gain.connect(audio.destination)
        osc.frequency.value = freq
        gain.gain.value = 0.25
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
      }, i * 120)
    })
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7', '#ec4899', '#06b6d4']
  const confetti = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
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

// Simon button component
const SimonButton = ({
  color,
  isActive,
  onClick,
  disabled,
  position,
}: {
  color: ColorButton
  isActive: boolean
  onClick: () => void
  disabled: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) => {
  const colorConfig = COLORS[color]
  
  const positionClasses = {
    'top-left': 'rounded-tl-full',
    'top-right': 'rounded-tr-full',
    'bottom-left': 'rounded-bl-full',
    'bottom-right': 'rounded-br-full',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44
        ${positionClasses[position]}
        ${isActive ? colorConfig.active : colorConfig.bg}
        ${isActive ? colorConfig.glow : ''}
        transition-all duration-100
        ${!disabled && !isActive ? 'hover:brightness-110 active:brightness-125' : ''}
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        border-4 border-gray-800/30
      `}
      style={{
        transform: isActive ? 'scale(0.98)' : 'scale(1)',
      }}
    />
  )
}

// Level indicator with stars
const LevelIndicator = ({ level }: { level: number }) => {
  const stars = Math.min(Math.floor(level / 5), 5)
  
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-white text-lg">Level {level}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`text-xl ${i < stars ? 'animate-pulse' : 'opacity-30'}`}>
            {i < stars ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    </div>
  )
}

// Main game component
export default function SimonSays() {
  const [pattern, setPattern] = useState<ColorButton[]>([])
  const [playerPattern, setPlayerPattern] = useState<ColorButton[]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [activeColor, setActiveColor] = useState<ColorButton | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [strictMode, setStrictMode] = useState(false)

  const showingPatternRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate speed based on level (gets faster as you progress)
  const getSpeed = useCallback((level: number) => {
    const baseSpeed = 600
    const minSpeed = 200
    const speedDecrease = Math.min(level * 30, baseSpeed - minSpeed)
    return baseSpeed - speedDecrease
  }, [])

  // Load high scores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('simon-high-scores')
    if (saved) {
      try {
        const scores = JSON.parse(saved)
        setHighScores(scores)
        if (scores.length > 0) {
          setHighScore(scores[0].score)
        }
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Save high score
  const saveHighScore = useCallback((newScore: number) => {
    const newEntry: HighScoreEntry = {
      score: newScore,
      date: new Date().toISOString(),
    }

    const newScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setHighScores(newScores)
    setHighScore(Math.max(newScore, highScore))
    localStorage.setItem('simon-high-scores', JSON.stringify(newScores))

    if (newScore > highScore) {
      setIsNewHighScore(true)
    }
  }, [highScores, highScore])

  // Add random color to pattern
  const addToPattern = useCallback(() => {
    const colors: ColorButton[] = ['red', 'green', 'blue', 'yellow']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setPattern((prev) => [...prev, randomColor])
  }, [])

  // Show the pattern to the player
  const showPattern = useCallback(async () => {
    if (showingPatternRef.current) return
    showingPatternRef.current = true
    setGameState('showing')

    const speed = getSpeed(pattern.length)

    for (let i = 0; i < pattern.length; i++) {
      await new Promise<void>((resolve) => {
        timeoutRef.current = setTimeout(() => {
          const color = pattern[i]
          setActiveColor(color)
          if (soundEnabled) {
            playTone(COLORS[color].frequency, speed * 0.8)
          }

          timeoutRef.current = setTimeout(() => {
            setActiveColor(null)
            resolve()
          }, speed * 0.8)
        }, speed * 0.3)
      })
    }

    showingPatternRef.current = false
    setGameState('waiting')
    setPlayerPattern([])
  }, [pattern, soundEnabled, getSpeed])

  // Start new game
  const startGame = useCallback(() => {
    setPattern([])
    setPlayerPattern([])
    setScore(0)
    setGameState('playing')
    setShowConfetti(false)
    setIsNewHighScore(false)

    // Add first color after a short delay
    setTimeout(() => {
      const colors: ColorButton[] = ['red', 'green', 'blue', 'yellow']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      setPattern([randomColor])
    }, 500)
  }, [])

  // Show pattern when it changes
  useEffect(() => {
    if (pattern.length > 0 && gameState === 'playing') {
      const timer = setTimeout(() => {
        showPattern()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [pattern, gameState, showPattern])

  // Handle player button press
  const handleButtonPress = useCallback((color: ColorButton) => {
    if (gameState !== 'waiting') return

    // Visual and audio feedback
    setActiveColor(color)
    if (soundEnabled) {
      playTone(COLORS[color].frequency, 200)
    }

    setTimeout(() => {
      setActiveColor(null)
    }, 200)

    const newPlayerPattern = [...playerPattern, color]
    setPlayerPattern(newPlayerPattern)

    const currentIndex = newPlayerPattern.length - 1

    // Check if correct
    if (color !== pattern[currentIndex]) {
      // Wrong!
      setGameState('gameover')
      if (soundEnabled) {
        playErrorSound()
      }
      saveHighScore(score)
      return
    }

    // Check if pattern complete
    if (newPlayerPattern.length === pattern.length) {
      // Success! Add to score and continue
      const newScore = score + 1
      setScore(newScore)
      
      // Celebration for milestones
      if (newScore % 5 === 0) {
        setShowConfetti(true)
        if (soundEnabled) {
          playVictorySound()
        }
        setTimeout(() => setShowConfetti(false), 3000)
      }

      setGameState('playing')
      
      // Add next color to pattern
      setTimeout(() => {
        addToPattern()
      }, 1000)
    }
  }, [gameState, playerPattern, pattern, score, soundEnabled, addToPattern, saveHighScore])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade/"
        className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all z-10"
      >
        ← Games
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 mt-16 text-center drop-shadow-lg">
        🎮 Simon Says
      </h1>
      <p className="text-white/80 mb-4 text-center">
        Watch the pattern, then repeat it!
      </p>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          🎯 Score: {score}
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 rounded-full font-bold text-white shadow-lg">
          🏆 Best: {highScore}
        </div>
        {pattern.length > 0 && <LevelIndicator level={pattern.length} />}
      </div>

      {/* Game board */}
      <div className="relative">
        {/* Simon buttons in a 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-800 rounded-full shadow-2xl">
          <SimonButton
            color="green"
            isActive={activeColor === 'green'}
            onClick={() => handleButtonPress('green')}
            disabled={gameState !== 'waiting'}
            position="top-left"
          />
          <SimonButton
            color="red"
            isActive={activeColor === 'red'}
            onClick={() => handleButtonPress('red')}
            disabled={gameState !== 'waiting'}
            position="top-right"
          />
          <SimonButton
            color="yellow"
            isActive={activeColor === 'yellow'}
            onClick={() => handleButtonPress('yellow')}
            disabled={gameState !== 'waiting'}
            position="bottom-left"
          />
          <SimonButton
            color="blue"
            isActive={activeColor === 'blue'}
            onClick={() => handleButtonPress('blue')}
            disabled={gameState !== 'waiting'}
            position="bottom-right"
          />

          {/* Center button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-900 rounded-full border-4 border-gray-700 flex items-center justify-center shadow-inner">
              {gameState === 'idle' && (
                <button
                  onClick={startGame}
                  className="text-white font-bold text-sm sm:text-base hover:text-green-400 transition-colors"
                >
                  START
                </button>
              )}
              {gameState === 'showing' && (
                <span className="text-yellow-400 font-bold text-xs sm:text-sm animate-pulse text-center">
                  WATCH
                </span>
              )}
              {gameState === 'waiting' && (
                <span className="text-green-400 font-bold text-xs sm:text-sm text-center">
                  YOUR
                  <br />
                  TURN
                </span>
              )}
              {gameState === 'playing' && (
                <span className="text-blue-400 font-bold text-sm animate-pulse">...</span>
              )}
              {gameState === 'gameover' && (
                <button
                  onClick={startGame}
                  className="text-red-400 font-bold text-xs sm:text-sm hover:text-green-400 transition-colors text-center"
                >
                  TRY
                  <br />
                  AGAIN
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {gameState === 'waiting' && (
        <div className="mt-4 flex gap-1">
          {pattern.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < playerPattern.length ? 'bg-green-400 scale-110' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Mode toggle */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setStrictMode(!strictMode)}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            strictMode
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white/20 text-white/70 hover:bg-white/30'
          }`}
        >
          {strictMode ? '🔥 Strict Mode' : '😊 Normal Mode'}
        </button>
        <button
          onClick={() => setShowHighScores(true)}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🏆 High Scores
        </button>
      </div>

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-purple-500/50 animate-bounceIn">
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '😵'}</div>
            <h2 className="text-3xl font-black text-white mb-2">
              {isNewHighScore ? 'New High Score!' : 'Game Over!'}
            </h2>
            {isNewHighScore && (
              <div className="text-yellow-400 text-xl mb-2 animate-pulse">⭐ Amazing! ⭐</div>
            )}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">{score}</div>
                <div className="text-sm text-gray-400">Your Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">{highScore}</div>
                <div className="text-sm text-gray-400">Best Score</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => setShowHighScores(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🏆 Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High Scores Modal */}
      {showHighScores && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHighScores(false)}
        >
          <div
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-yellow-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-white">🏆 High Scores</h2>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {highScores.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No scores yet! Play a game to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {highScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-600/30 to-amber-600/30 border border-yellow-500/50'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-500/30 to-slate-500/30 border border-gray-400/50'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-600/30 to-amber-700/30 border border-orange-500/50'
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div className="text-2xl font-bold text-white">{entry.score}</div>
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(entry.date)}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setHighScores([])
                setHighScore(0)
                localStorage.removeItem('simon-high-scores')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 max-w-md text-center text-white/60 text-sm">
        <p className="mb-2">
          <strong className="text-white">How to play:</strong> Watch Simon light up the buttons,
          then repeat the pattern by pressing them in the same order.
        </p>
        <p>The pattern gets longer and faster with each round!</p>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-30">🎵</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-30" style={{ animationDelay: '0.3s' }}>
        🎶
      </div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-20" style={{ animationDelay: '0.6s' }}>
        ✨
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
          animation: confetti ease-out forwards;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
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
        .animate-bounceIn {
          animation: bounceIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
