'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type MoleType = 'normal' | 'golden' | 'angry' | null
type GameState = 'idle' | 'countdown' | 'playing' | 'gameover'

interface Hole {
  id: number
  mole: MoleType
  isWhacked: boolean
  popUpTime: number
}

interface LeaderboardEntry {
  score: number
  combo: number
  date: string
}

// Sound effects using Web Audio API
const playSound = (type: 'whack' | 'miss' | 'golden' | 'combo' | 'gameOver' | 'angry' | 'pop') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'whack':
        osc.frequency.value = 200
        osc.type = 'square'
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'miss':
        osc.frequency.value = 150
        osc.type = 'sawtooth'
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'golden':
        // Sparkly ascending sound
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
      case 'combo':
        osc.frequency.value = 440
        osc.type = 'sine'
        gain.gain.value = 0.15
        osc.start()
        setTimeout(() => { osc.frequency.value = 554.37 }, 50)
        setTimeout(() => { osc.frequency.value = 659.25 }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'angry':
        osc.frequency.value = 300
        osc.type = 'sawtooth'
        gain.gain.value = 0.12
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'pop':
        osc.frequency.value = 300
        osc.type = 'sine'
        gain.gain.value = 0.08
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(500, audio.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.08)
        osc.stop(audio.currentTime + 0.08)
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

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#22c55e', '#4ade80', '#f472b6', '#c084fc']
  const confetti = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
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

// Flying score animation
const FlyingScore = ({ score, x, y, type }: { score: number; x: number; y: number; type: MoleType }) => {
  const color = type === 'golden' ? 'text-yellow-400' : type === 'angry' ? 'text-red-400' : 'text-green-400'
  return (
    <div
      className={`absolute ${color} font-black text-2xl animate-flyUp pointer-events-none z-30`}
      style={{ left: x, top: y }}
    >
      +{score}
    </div>
  )
}

// Mole component
const Mole = ({
  hole,
  onWhack,
  disabled,
}: {
  hole: Hole
  onWhack: (id: number) => void
  disabled: boolean
}) => {
  const getMoleEmoji = (type: MoleType) => {
    switch (type) {
      case 'golden':
        return '🌟'
      case 'angry':
        return '😈'
      default:
        return '🐹'
    }
  }

  const getMoleGlow = (type: MoleType) => {
    switch (type) {
      case 'golden':
        return 'shadow-[0_0_30px_rgba(250,204,21,0.8)]'
      case 'angry':
        return 'shadow-[0_0_20px_rgba(239,68,68,0.6)]'
      default:
        return ''
    }
  }

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
      {/* Hole */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 sm:w-20 sm:h-10 md:w-24 md:h-12 bg-gradient-to-b from-amber-900 to-amber-950 rounded-[100%] shadow-inner" />
      
      {/* Grass around hole */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-around">
        <span className="text-lg">🌿</span>
        <span className="text-lg">🌱</span>
      </div>

      {/* Mole container with overflow hidden */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 overflow-hidden">
        {/* Mole */}
        <button
          onClick={() => !disabled && hole.mole && !hole.isWhacked && onWhack(hole.id)}
          disabled={disabled || !hole.mole || hole.isWhacked}
          className={`
            absolute bottom-0 left-1/2 -translate-x-1/2
            w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
            flex items-center justify-center
            text-3xl sm:text-4xl md:text-5xl
            transition-all duration-150
            ${hole.mole && !hole.isWhacked ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
            ${hole.isWhacked ? 'animate-whacked' : ''}
            ${hole.mole ? 'animate-popUp' : 'translate-y-full'}
            ${hole.mole ? getMoleGlow(hole.mole) : ''}
            rounded-full
          `}
        >
          {hole.mole && (
            <span className={hole.isWhacked ? 'animate-spin' : hole.mole === 'golden' ? 'animate-pulse' : ''}>
              {hole.isWhacked ? '💫' : getMoleEmoji(hole.mole)}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// Game duration
const GAME_DURATION = 60

export default function WhackAMole() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [holes, setHoles] = useState<Hole[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      mole: null,
      isWhacked: false,
      popUpTime: 0,
    }))
  )
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flyingScores, setFlyingScores] = useState<{ id: number; score: number; x: number; y: number; type: MoleType }[]>([])
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal')

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const moleTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map())
  const flyingScoreIdRef = useRef(0)

  // Difficulty settings
  const difficultySettings = {
    easy: { spawnRate: 1200, moleStayTime: 1500, goldenChance: 0.15, angryChance: 0 },
    normal: { spawnRate: 900, moleStayTime: 1200, goldenChance: 0.1, angryChance: 0.1 },
    hard: { spawnRate: 600, moleStayTime: 800, goldenChance: 0.08, angryChance: 0.15 },
  }

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('whack-a-mole-leaderboard')
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
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      moleTimersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // Spawn a mole
  const spawnMole = useCallback(() => {
    const settings = difficultySettings[difficulty]
    
    setHoles((prevHoles) => {
      const emptyHoles = prevHoles.filter((h) => !h.mole)
      if (emptyHoles.length === 0) return prevHoles

      const randomHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)]
      const random = Math.random()
      
      let moleType: MoleType = 'normal'
      if (random < settings.goldenChance) {
        moleType = 'golden'
      } else if (random < settings.goldenChance + settings.angryChance) {
        moleType = 'angry'
      }

      if (soundEnabled) playSound('pop')

      // Schedule mole to hide
      const hideTimer = setTimeout(() => {
        setHoles((h) =>
          h.map((hole) =>
            hole.id === randomHole.id ? { ...hole, mole: null, isWhacked: false } : hole
          )
        )
        // Reset combo if mole escapes (unless it's an angry mole)
        if (moleType !== 'angry') {
          setCombo(0)
        }
      }, settings.moleStayTime)

      moleTimersRef.current.set(randomHole.id, hideTimer)

      return prevHoles.map((hole) =>
        hole.id === randomHole.id
          ? { ...hole, mole: moleType, isWhacked: false, popUpTime: Date.now() }
          : hole
      )
    })
  }, [difficulty, soundEnabled])

  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeLeft(GAME_DURATION)
    setShowConfetti(false)
    setHoles(
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        mole: null,
        isWhacked: false,
        popUpTime: 0,
      }))
    )

    // Clear any existing timers
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    moleTimersRef.current.forEach((timer) => clearTimeout(timer))
    moleTimersRef.current.clear()

    // Countdown
    setGameState('countdown')
    setCountdown(3)

    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        setCountdown(null)
        clearInterval(countdownInterval)
        startActualGame()
      }
    }, 800)
  }, [])

  const startActualGame = useCallback(() => {
    setGameState('playing')
    const settings = difficultySettings[difficulty]

    // Start spawning moles
    gameLoopRef.current = setInterval(() => {
      spawnMole()
    }, settings.spawnRate)

    // Spawn first mole immediately
    setTimeout(spawnMole, 300)

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [difficulty, spawnMole])

  // End game
  const endGame = useCallback(() => {
    setGameState('gameover')
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    moleTimersRef.current.forEach((timer) => clearTimeout(timer))
    moleTimersRef.current.clear()

    // Clear all moles
    setHoles((h) => h.map((hole) => ({ ...hole, mole: null, isWhacked: false })))

    if (soundEnabled) playSound('gameOver')
    setShowConfetti(true)

    // Save to leaderboard
    setScore((currentScore) => {
      setMaxCombo((currentMaxCombo) => {
        const newEntry: LeaderboardEntry = {
          score: currentScore,
          combo: currentMaxCombo,
          date: new Date().toISOString(),
        }

        const newLeaderboard = [...leaderboard, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        setLeaderboard(newLeaderboard)
        localStorage.setItem('whack-a-mole-leaderboard', JSON.stringify(newLeaderboard))
        return currentMaxCombo
      })
      return currentScore
    })
  }, [leaderboard, soundEnabled])

  // Handle whacking a mole
  const handleWhack = useCallback((id: number) => {
    const hole = holes.find((h) => h.id === id)
    if (!hole || !hole.mole || hole.isWhacked) return

    const moleType = hole.mole

    // Clear the hide timer
    const hideTimer = moleTimersRef.current.get(id)
    if (hideTimer) {
      clearTimeout(hideTimer)
      moleTimersRef.current.delete(id)
    }

    // Mark as whacked
    setHoles((h) =>
      h.map((hole) => (hole.id === id ? { ...hole, isWhacked: true } : hole))
    )

    // Calculate score
    let points = 10
    let newCombo = combo

    if (moleType === 'golden') {
      points = 50
      newCombo = combo + 1
      if (soundEnabled) playSound('golden')
    } else if (moleType === 'angry') {
      points = -20
      newCombo = 0
      if (soundEnabled) playSound('angry')
    } else {
      newCombo = combo + 1
      if (soundEnabled) playSound('whack')
    }

    // Combo bonus
    if (newCombo >= 3 && moleType !== 'angry') {
      const comboBonus = Math.floor(newCombo / 3) * 5
      points += comboBonus
      if (newCombo % 3 === 0 && soundEnabled) {
        playSound('combo')
      }
    }

    setCombo(newCombo)
    setMaxCombo((prev) => Math.max(prev, newCombo))
    setScore((prev) => Math.max(0, prev + points))

    // Add flying score
    const rect = document.getElementById(`hole-${id}`)?.getBoundingClientRect()
    if (rect) {
      const newFlyingScore = {
        id: flyingScoreIdRef.current++,
        score: points,
        x: rect.left + rect.width / 2 - 20,
        y: rect.top,
        type: moleType,
      }
      setFlyingScores((prev) => [...prev, newFlyingScore])
      setTimeout(() => {
        setFlyingScores((prev) => prev.filter((fs) => fs.id !== newFlyingScore.id))
      }, 800)
    }

    // Hide mole after a short delay
    setTimeout(() => {
      setHoles((h) =>
        h.map((hole) => (hole.id === id ? { ...hole, mole: null, isWhacked: false } : hole))
      )
    }, 200)
  }, [holes, combo, soundEnabled])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-green-400 to-green-600 flex flex-col items-center p-4 relative overflow-hidden">
      <Confetti active={showConfetti} />

      {/* Flying scores */}
      {flyingScores.map((fs) => (
        <FlyingScore key={fs.id} score={fs.score} x={fs.x} y={fs.y} type={fs.type} />
      ))}

      {/* Background decorations */}
      <div className="absolute top-4 left-8 text-4xl animate-cloud">☁️</div>
      <div className="absolute top-12 right-12 text-3xl animate-cloud" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute top-8 left-1/3 text-2xl animate-cloud" style={{ animationDelay: '2s' }}>☁️</div>
      <div className="absolute bottom-4 left-4 text-3xl">🌻</div>
      <div className="absolute bottom-4 right-4 text-3xl">🌸</div>
      <div className="absolute bottom-8 left-1/4 text-2xl">🌷</div>
      <div className="absolute bottom-12 right-1/4 text-2xl">🌺</div>

      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-lg mb-4 z-10">
        <Link
          href="/games"
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-green-700 shadow-lg hover:scale-105 transition-all"
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

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 text-center drop-shadow-lg z-10">
        🔨 Whack-a-Mole!
      </h1>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center z-10">
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-green-700 shadow-lg">
          🎯 Score: {score}
        </div>
        <div className={`px-4 py-2 rounded-full font-bold shadow-lg ${
          timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 text-orange-600'
        }`}>
          ⏱️ {timeLeft}s
        </div>
        {combo >= 3 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full font-bold text-white shadow-lg animate-bounce">
            🔥 x{combo}
          </div>
        )}
      </div>

      {/* Game area */}
      <div className="relative bg-gradient-to-b from-amber-600 to-amber-800 p-6 rounded-3xl shadow-2xl border-4 border-amber-900 z-10">
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-20">
            <div className="text-9xl font-black text-white animate-bounce drop-shadow-lg">
              {countdown}
            </div>
          </div>
        )}

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/40 rounded-3xl flex flex-col items-center justify-center z-20">
            <div className="text-6xl mb-4">🐹</div>
            <h2 className="text-2xl font-bold text-white mb-4 text-center px-4">
              Whack the moles!
            </h2>
            <p className="text-white/80 text-center mb-2 px-4 text-sm">
              🐹 Normal = 10pts | 🌟 Golden = 50pts | 😈 Angry = -20pts
            </p>
            <p className="text-yellow-300 text-center mb-4 px-4 text-sm">
              🔥 Build combos for bonus points!
            </p>
            
            {/* Difficulty selector */}
            <div className="flex gap-2 mb-4">
              {(['easy', 'normal', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-full font-bold text-sm transition-all ${
                    difficulty === d
                      ? d === 'easy' ? 'bg-green-500 text-white' 
                        : d === 'normal' ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white/30 text-white hover:bg-white/50'
                  }`}
                >
                  {d === 'easy' ? '😊 Easy' : d === 'normal' ? '😐 Normal' : '😤 Hard'}
                </button>
              ))}
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            >
              🎮 START
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center z-20">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-black text-white mb-2">Time&apos;s Up!</h2>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-4">
              <div className="text-4xl font-black text-yellow-300 text-center">{score}</div>
              <div className="text-white/80 text-center text-sm">points</div>
              {maxCombo >= 3 && (
                <div className="text-orange-300 text-center text-sm mt-1">
                  🔥 Best Combo: x{maxCombo}
                </div>
              )}
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {/* 3x3 Grid of holes */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {holes.map((hole) => (
            <div key={hole.id} id={`hole-${hole.id}`}>
              <Mole
                hole={hole}
                onWhack={handleWhack}
                disabled={gameState !== 'playing'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-white/80 mt-4 text-center text-sm z-10">
        Tap the moles before they hide! 🐹
      </p>

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
              <h2 className="text-2xl font-black text-green-700">🏆 High Scores</h2>
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
                        <div className="font-bold text-green-700">{entry.score} pts</div>
                        {entry.combo >= 3 && (
                          <div className="text-xs text-orange-500">🔥 x{entry.combo} combo</div>
                        )}
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
                localStorage.removeItem('whack-a-mole-leaderboard')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-all"
            >
              🗑️ Clear Records
            </button>
          </div>
        </div>
      )}

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
        @keyframes popUp {
          0% {
            transform: translateX(-50%) translateY(100%);
          }
          50% {
            transform: translateX(-50%) translateY(-10%);
          }
          100% {
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-popUp {
          animation: popUp 0.15s ease-out forwards;
        }
        @keyframes whacked {
          0% {
            transform: translateX(-50%) translateY(0) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-10px) scale(1.2);
          }
          100% {
            transform: translateX(-50%) translateY(100%) scale(0.5);
          }
        }
        .animate-whacked {
          animation: whacked 0.2s ease-in forwards;
        }
        @keyframes flyUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(1.5);
            opacity: 0;
          }
        }
        .animate-flyUp {
          animation: flyUp 0.8s ease-out forwards;
        }
        @keyframes cloud {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
        .animate-cloud {
          animation: cloud 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
