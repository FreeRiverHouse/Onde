'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type BubbleColor = 'pink' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange'
type BubbleType = 'normal' | 'rainbow' | 'bomb'
type GameState = 'idle' | 'countdown' | 'playing' | 'gameover'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speed: number
  color: BubbleColor
  type: BubbleType
  popped: boolean
  wobble: number
}

interface LeaderboardEntry {
  score: number
  combo: number
  popped: number
  date: string
}

// Pastel colors for bubbles
const BUBBLE_COLORS: Record<BubbleColor, { bg: string; border: string; glow: string }> = {
  pink: { bg: 'from-pink-200 to-pink-400', border: 'border-pink-300', glow: 'rgba(244,114,182,0.5)' },
  blue: { bg: 'from-sky-200 to-sky-400', border: 'border-sky-300', glow: 'rgba(56,189,248,0.5)' },
  yellow: { bg: 'from-yellow-200 to-yellow-400', border: 'border-yellow-300', glow: 'rgba(250,204,21,0.5)' },
  green: { bg: 'from-emerald-200 to-emerald-400', border: 'border-emerald-300', glow: 'rgba(52,211,153,0.5)' },
  purple: { bg: 'from-violet-200 to-violet-400', border: 'border-violet-300', glow: 'rgba(167,139,250,0.5)' },
  orange: { bg: 'from-orange-200 to-orange-400', border: 'border-orange-300', glow: 'rgba(251,146,60,0.5)' },
}

const COLOR_KEYS = Object.keys(BUBBLE_COLORS) as BubbleColor[]

// Relaxing pop sounds using Web Audio API
const playSound = (type: 'pop' | 'combo' | 'rainbow' | 'bomb' | 'miss' | 'gameOver' | 'start') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'pop':
        // Soft, satisfying pop
        osc.frequency.value = 400 + Math.random() * 200
        osc.type = 'sine'
        gain.gain.value = 0.12
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(200, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'combo':
        // Rising chime for combos
        const comboNotes = [523.25, 659.25, 783.99]
        comboNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'sine'
            gain2.gain.value = 0.1
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.12)
            osc2.stop(audio.currentTime + 0.12)
          }, i * 60)
        })
        osc.stop(0)
        break
      case 'rainbow':
        // Magical sparkle sound
        const rainbowNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
        rainbowNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'triangle'
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
            osc2.stop(audio.currentTime + 0.15)
          }, i * 40)
        })
        osc.stop(0)
        break
      case 'bomb':
        // Deep rumble explosion
        osc.frequency.value = 80
        osc.type = 'sawtooth'
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(30, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'miss':
        // Soft whoosh for escaped bubbles
        osc.frequency.value = 200
        osc.type = 'sine'
        gain.gain.value = 0.05
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(400, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'start':
        // Cheerful start jingle
        const startNotes = [392, 440, 523.25, 659.25]
        startNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'sine'
            gain2.gain.value = 0.12
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc2.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        osc.stop(0)
        break
      case 'gameOver':
        // Gentle ending melody
        const endNotes = [523.25, 440, 392, 329.63]
        endNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'sine'
            gain2.gain.value = 0.1
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 200)
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

  const colors = ['#f9a8d4', '#7dd3fc', '#fcd34d', '#6ee7b7', '#c4b5fd', '#fdba74']
  const confetti = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 10,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// Pop particles effect
const PopParticles = ({ x, y, color }: { x: number; y: number; color: string }) => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i / 8) * Math.PI * 2,
  }))

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full animate-particle"
          style={{
            backgroundColor: color,
            '--angle': `${p.angle}rad`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Flying score animation
const FlyingScore = ({ score, x, y, isCombo }: { score: number; x: number; y: number; isCombo: boolean }) => {
  return (
    <div
      className={`absolute font-black text-2xl animate-flyUp pointer-events-none z-30 ${
        isCombo ? 'text-yellow-400 text-3xl' : 'text-white'
      }`}
      style={{ left: x, top: y, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
    >
      +{score}
      {isCombo && <span className="text-sm ml-1">COMBO!</span>}
    </div>
  )
}

// Single Bubble component
const BubbleComponent = ({
  bubble,
  onPop,
  disabled,
}: {
  bubble: Bubble
  onPop: (id: number, x: number, y: number) => void
  disabled: boolean
}) => {
  const colorStyle = BUBBLE_COLORS[bubble.color]
  
  const getBubbleContent = () => {
    if (bubble.type === 'rainbow') return '🌈'
    if (bubble.type === 'bomb') return '💣'
    return '✨'
  }

  const getExtraStyles = () => {
    if (bubble.type === 'rainbow') {
      return 'animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]'
    }
    if (bubble.type === 'bomb') {
      return 'shadow-[0_0_15px_rgba(0,0,0,0.4)]'
    }
    return ''
  }

  if (bubble.popped) return null

  return (
    <button
      onClick={(e) => {
        if (!disabled) {
          const rect = e.currentTarget.getBoundingClientRect()
          onPop(bubble.id, rect.left + rect.width / 2, rect.top + rect.height / 2)
        }
      }}
      disabled={disabled}
      className={`
        absolute rounded-full
        bg-gradient-to-br ${colorStyle.bg}
        border-2 ${colorStyle.border}
        flex items-center justify-center
        cursor-pointer
        hover:scale-110 active:scale-95
        transition-transform duration-100
        ${getExtraStyles()}
      `}
      style={{
        width: bubble.size,
        height: bubble.size,
        left: bubble.x,
        top: bubble.y,
        boxShadow: `inset -4px -4px 10px rgba(255,255,255,0.6), inset 4px 4px 10px rgba(0,0,0,0.1), 0 0 15px ${colorStyle.glow}`,
        animation: `wobble ${0.8 + bubble.wobble * 0.4}s ease-in-out infinite`,
      }}
    >
      <span className="text-xl opacity-60">{getBubbleContent()}</span>
      {/* Shine effect */}
      <div 
        className="absolute top-2 left-2 w-1/4 h-1/4 bg-white/60 rounded-full blur-[2px]"
      />
    </button>
  )
}

// Game duration
const GAME_DURATION = 60

function BubblePopInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('idle')
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [lastColor, setLastColor] = useState<BubbleColor | null>(null)
  const [totalPopped, setTotalPopped] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flyingScores, setFlyingScores] = useState<{ id: number; score: number; x: number; y: number; isCombo: boolean }[]>([])
  const [popParticles, setPopParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([])
  const [escaped, setEscaped] = useState(0)

  const gameLoopRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const spawnRef = useRef<NodeJS.Timeout | null>(null)
  const bubbleIdRef = useRef(0)
  const flyingScoreIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('bubble-pop-leaderboard')
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
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      if (spawnRef.current) clearInterval(spawnRef.current)
    }
  }, [])

  // Spawn a bubble
  const spawnBubble = useCallback(() => {
    if (!gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const size = 50 + Math.random() * 30
    const x = Math.random() * (rect.width - size)
    
    // Determine bubble type
    const random = Math.random()
    let type: BubbleType = 'normal'
    if (random < 0.05) {
      type = 'rainbow' // 5% chance
    } else if (random < 0.1) {
      type = 'bomb' // 5% chance
    }

    const newBubble: Bubble = {
      id: bubbleIdRef.current++,
      x,
      y: rect.height + 10,
      size,
      speed: 1 + Math.random() * 1.5,
      color: COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)],
      type,
      popped: false,
      wobble: Math.random(),
    }

    setBubbles((prev) => [...prev, newBubble])
  }, [])

  // Game loop for bubble movement
  const updateBubbles = useCallback(() => {
    setBubbles((prev) => {
      const updated = prev
        .map((b) => ({
          ...b,
          y: b.y - b.speed,
          x: b.x + Math.sin(Date.now() / 500 + b.wobble * 10) * 0.5,
        }))
        .filter((b) => {
          if (b.y < -b.size && !b.popped) {
            // Bubble escaped
            setEscaped((e) => e + 1)
            setCombo(0)
            setLastColor(null)
            return false
          }
          return b.y > -b.size
        })
      return updated
    })
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setLastColor(null)
    setTotalPopped(0)
    setEscaped(0)
    setTimeLeft(GAME_DURATION)
    setShowConfetti(false)
    setBubbles([])
    setFlyingScores([])
    setPopParticles([])

    // Clear any existing timers
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (spawnRef.current) clearInterval(spawnRef.current)

    if (soundEnabled) playSound('start')

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
  }, [soundEnabled])

  const startActualGame = useCallback(() => {
    setGameState('playing')

    // Start spawning bubbles
    spawnRef.current = setInterval(() => {
      spawnBubble()
    }, 600)

    // Spawn first few bubbles immediately
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnBubble, i * 200)
    }

    // Start game loop
    const loop = () => {
      updateBubbles()
      gameLoopRef.current = requestAnimationFrame(loop)
    }
    gameLoopRef.current = requestAnimationFrame(loop)

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
  }, [spawnBubble, updateBubbles])

  // End game
  const endGame = useCallback(() => {
    setGameState('gameover')
    rewards.trackWin()
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (spawnRef.current) clearInterval(spawnRef.current)

    setBubbles([])

    if (soundEnabled) playSound('gameOver')
    setShowConfetti(true)

    // Save to leaderboard
    setScore((currentScore) => {
      setMaxCombo((currentMaxCombo) => {
        setTotalPopped((currentPopped) => {
          const newEntry: LeaderboardEntry = {
            score: currentScore,
            combo: currentMaxCombo,
            popped: currentPopped,
            date: new Date().toISOString(),
          }

          const newLeaderboard = [...leaderboard, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)

          setLeaderboard(newLeaderboard)
          localStorage.setItem('bubble-pop-leaderboard', JSON.stringify(newLeaderboard))
          return currentPopped
        })
        return currentMaxCombo
      })
      return currentScore
    })
  }, [leaderboard, soundEnabled])

  // Handle popping a bubble
  const handlePop = useCallback((id: number, x: number, y: number) => {
    const bubble = bubbles.find((b) => b.id === id)
    if (!bubble || bubble.popped) return

    // Mark as popped
    setBubbles((prev) => prev.filter((b) => b.id !== id))
    setTotalPopped((prev) => prev + 1)

    // Calculate score
    let points = 10
    let newCombo = 1
    let isComboBonus = false

    if (bubble.type === 'rainbow') {
      // Rainbow bubble: big bonus!
      points = 50
      newCombo = combo + 3
      if (soundEnabled) playSound('rainbow')
    } else if (bubble.type === 'bomb') {
      // Bomb: pops all bubbles on screen!
      const currentBubbles = bubbles.filter((b) => b.id !== id && !b.popped)
      points = 5 + currentBubbles.length * 15
      setBubbles([])
      setTotalPopped((prev) => prev + currentBubbles.length)
      if (soundEnabled) playSound('bomb')
      // Add particles for all popped bubbles
      currentBubbles.forEach((b) => {
        const particleId = particleIdRef.current++
        setPopParticles((prev) => [...prev, { id: particleId, x: b.x + b.size / 2, y: b.y + b.size / 2, color: BUBBLE_COLORS[b.color].glow }])
        setTimeout(() => {
          setPopParticles((prev) => prev.filter((p) => p.id !== particleId))
        }, 500)
      })
    } else {
      // Normal bubble: check for same-color combo
      if (lastColor === bubble.color) {
        newCombo = combo + 1
        if (newCombo >= 3) {
          isComboBonus = true
          points = 10 + (newCombo - 2) * 10 // 10, 20, 30, etc. for combos
          if (soundEnabled) playSound('combo')
        } else {
          if (soundEnabled) playSound('pop')
        }
      } else {
        newCombo = 1
        if (soundEnabled) playSound('pop')
      }
      setLastColor(bubble.color)
    }

    setCombo(newCombo)
    setMaxCombo((prev) => Math.max(prev, newCombo))
    setScore((prev) => prev + points)

    // Add flying score
    const newFlyingScore = {
      id: flyingScoreIdRef.current++,
      score: points,
      x: x - 20,
      y: y - 30,
      isCombo: isComboBonus,
    }
    setFlyingScores((prev) => [...prev, newFlyingScore])
    setTimeout(() => {
      setFlyingScores((prev) => prev.filter((fs) => fs.id !== newFlyingScore.id))
    }, 800)

    // Add pop particles
    const particleId = particleIdRef.current++
    setPopParticles((prev) => [...prev, { id: particleId, x, y, color: BUBBLE_COLORS[bubble.color].glow }])
    setTimeout(() => {
      setPopParticles((prev) => prev.filter((p) => p.id !== particleId))
    }, 500)
  }, [bubbles, combo, lastColor, soundEnabled])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-pink-100 to-purple-200 flex flex-col items-center p-4 relative overflow-hidden">
      <Confetti active={showConfetti} />

      {/* Flying scores */}
      {flyingScores.map((fs) => (
        <FlyingScore key={fs.id} score={fs.score} x={fs.x} y={fs.y} isCombo={fs.isCombo} />
      ))}

      {/* Pop particles */}
      {popParticles.map((p) => (
        <PopParticles key={p.id} x={p.x} y={p.y} color={p.color} />
      ))}

      {/* Background decorations */}
      <div className="absolute top-8 left-8 text-4xl animate-float">☁️</div>
      <div className="absolute top-16 right-12 text-3xl animate-float" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute top-24 left-1/3 text-2xl animate-float" style={{ animationDelay: '2s' }}>🌸</div>
      <div className="absolute bottom-20 left-8 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🦋</div>
      <div className="absolute bottom-32 right-8 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>🌺</div>

      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-lg mb-4 z-10">
        <Link
          href="/games/"
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

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-2 text-center drop-shadow-lg z-10">
        🫧 Bubble Pop! 🫧
      </h1>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center z-10">
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          ✨ Score: {score}
        </div>
        <div className={`px-4 py-2 rounded-full font-bold shadow-lg ${
          timeLeft <= 10 ? 'bg-red-400 text-white animate-pulse' : 'bg-white/90 text-orange-600'
        }`}>
          ⏱️ {timeLeft}s
        </div>
        {combo >= 3 && (
          <div className="bg-gradient-to-r from-yellow-300 to-orange-400 px-4 py-2 rounded-full font-bold text-white shadow-lg animate-bounce">
            🔥 x{combo}
          </div>
        )}
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-lg h-[60vh] min-h-[400px] bg-gradient-to-b from-white/40 to-white/20 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white/50 overflow-hidden z-10"
      >
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-20">
            <div className="text-9xl font-black text-purple-500 animate-bounce drop-shadow-lg">
              {countdown}
            </div>
          </div>
        )}

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20 p-4">
            <div className="text-6xl mb-4 animate-bounce">🫧</div>
            <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
              Pop the bubbles!
            </h2>
            <div className="text-purple-600/80 text-center mb-4 text-sm space-y-1">
              <p>🫧 Normal = 10pts</p>
              <p>🌈 Rainbow = 50pts + combo boost</p>
              <p>💣 Bomb = Pops ALL bubbles!</p>
              <p className="text-yellow-600 font-semibold">🔥 Same-color combos = Bonus!</p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white font-black text-xl rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            >
              🎮 START
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20 p-4">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-3xl font-black text-purple-700 mb-2">Time&apos;s Up!</h2>
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 mb-4 shadow-inner">
              <div className="text-4xl font-black text-purple-600 text-center">{score}</div>
              <div className="text-purple-500 text-center text-sm">points</div>
              <div className="flex gap-4 mt-2 text-sm text-purple-600">
                <span>🫧 {totalPopped} popped</span>
                {maxCombo >= 3 && <span>🔥 x{maxCombo} best</span>}
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white font-black text-xl rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {/* Bubbles */}
        {bubbles.map((bubble) => (
          <BubbleComponent
            key={bubble.id}
            bubble={bubble}
            onPop={handlePop}
            disabled={gameState !== 'playing'}
          />
        ))}

        {/* Bottom gradient for emergence effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      </div>

      {/* Instructions */}
      <p className="text-purple-600/80 mt-4 text-center text-sm z-10">
        Pop same-color bubbles for combos! 🌈
      </p>

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4"
          onClick={() => setShowLeaderboard(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-purple-700">🏆 High Scores</h2>
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
                        <div className="font-bold text-purple-700">{entry.score} pts</div>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>🫧 {entry.popped}</span>
                          {entry.combo >= 3 && <span>🔥 x{entry.combo}</span>}
                        </div>
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
                localStorage.removeItem('bubble-pop-leaderboard')
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
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes wobble {
          0%, 100% {
            transform: translateX(-2px);
          }
          50% {
            transform: translateX(2px);
          }
        }
        @keyframes flyUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) scale(1.3);
            opacity: 0;
          }
        }
        .animate-flyUp {
          animation: flyUp 0.8s ease-out forwards;
        }
        @keyframes particle {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + cos(var(--angle)) * 40px),
              calc(-50% + sin(var(--angle)) * 40px)
            ) scale(0);
            opacity: 0;
          }
        }
        .animate-particle {
          animation: particle 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function BubblePop() {
  return (
    <GameWrapper gameName="Bubbles" gameId="bubbles" emoji={"🫧"}>
      <BubblePopInner />
    </GameWrapper>
  )
}
