'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

type GameState = 'idle' | 'countdown' | 'playing' | 'gameover'
type Theme = 'day' | 'sunset' | 'night'
type Character = 'bird' | 'butterfly' | 'bee' | 'fairy'

interface Pipe {
  id: number
  x: number
  gapY: number
  gapHeight: number
  passed: boolean
}

interface Cloud {
  id: number
  x: number
  y: number
  size: number
  speed: number
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  twinkle: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  size: number
}

interface HighScoreEntry {
  score: number
  date: string
  character: Character
  theme: Theme
}

// Game constants
const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const GRAVITY = 0.5
const FLAP_VELOCITY = -9
const PIPE_WIDTH = 60
const PIPE_GAP_MIN = 140
const PIPE_GAP_MAX = 180
const PIPE_SPEED = 3
const PIPE_SPAWN_DISTANCE = 250
const BIRD_SIZE = 40
const BIRD_X = 80

// Theme colors
const THEMES: Record<Theme, { sky: string; ground: string; pipe: string; pipeHighlight: string; clouds: boolean; stars: boolean }> = {
  day: {
    sky: 'from-sky-400 via-sky-300 to-sky-200',
    ground: 'from-green-500 to-green-600',
    pipe: '#4ade80',
    pipeHighlight: '#86efac',
    clouds: true,
    stars: false,
  },
  sunset: {
    sky: 'from-orange-400 via-pink-400 to-purple-500',
    ground: 'from-orange-700 to-orange-800',
    pipe: '#f97316',
    pipeHighlight: '#fdba74',
    clouds: true,
    stars: false,
  },
  night: {
    sky: 'from-indigo-900 via-purple-900 to-slate-900',
    ground: 'from-slate-700 to-slate-800',
    pipe: '#6366f1',
    pipeHighlight: '#a5b4fc',
    clouds: false,
    stars: true,
  },
}

// Character emojis and colors
const CHARACTERS: Record<Character, { emoji: string; name: string; color: string; trail: string }> = {
  bird: { emoji: '🐦', name: 'Birdie', color: '#fbbf24', trail: '#fef3c7' },
  butterfly: { emoji: '🦋', name: 'Flutter', color: '#ec4899', trail: '#fbcfe8' },
  bee: { emoji: '🐝', name: 'Buzzy', color: '#facc15', trail: '#fef9c3' },
  fairy: { emoji: '🧚', name: 'Sparkle', color: '#a78bfa', trail: '#e9d5ff' },
}

// Sound effects
const playSound = (type: 'flap' | 'score' | 'hit' | 'highscore') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'flap':
        osc.type = 'sine'
        osc.frequency.value = 400
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(600, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'score':
        osc.type = 'triangle'
        osc.frequency.value = 523.25
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(783.99, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'hit':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.25)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.25)
        osc.stop(audio.currentTime + 0.25)
        break
      case 'highscore':
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.type = 'sine'
            osc2.frequency.value = freq
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc2.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Pipe component
const PipeObstacle = ({ pipe, theme, gameHeight }: { pipe: Pipe; theme: Theme; gameHeight: number }) => {
  const themeColors = THEMES[theme]
  const topPipeHeight = pipe.gapY
  const bottomPipeY = pipe.gapY + pipe.gapHeight
  const bottomPipeHeight = gameHeight - bottomPipeY - 60 // 60 is ground height

  return (
    <>
      {/* Top pipe */}
      <div
        className="absolute rounded-b-lg shadow-lg"
        style={{
          left: pipe.x,
          top: 0,
          width: PIPE_WIDTH,
          height: topPipeHeight,
          background: `linear-gradient(90deg, ${themeColors.pipe} 0%, ${themeColors.pipeHighlight} 50%, ${themeColors.pipe} 100%)`,
          borderBottom: `4px solid ${themeColors.pipe}`,
        }}
      >
        {/* Pipe cap */}
        <div
          className="absolute -left-1 -bottom-3 rounded-lg shadow-md"
          style={{
            width: PIPE_WIDTH + 8,
            height: 20,
            background: `linear-gradient(90deg, ${themeColors.pipe} 0%, ${themeColors.pipeHighlight} 50%, ${themeColors.pipe} 100%)`,
          }}
        />
      </div>

      {/* Bottom pipe */}
      <div
        className="absolute rounded-t-lg shadow-lg"
        style={{
          left: pipe.x,
          top: bottomPipeY,
          width: PIPE_WIDTH,
          height: bottomPipeHeight,
          background: `linear-gradient(90deg, ${themeColors.pipe} 0%, ${themeColors.pipeHighlight} 50%, ${themeColors.pipe} 100%)`,
          borderTop: `4px solid ${themeColors.pipe}`,
        }}
      >
        {/* Pipe cap */}
        <div
          className="absolute -left-1 -top-3 rounded-lg shadow-md"
          style={{
            width: PIPE_WIDTH + 8,
            height: 20,
            background: `linear-gradient(90deg, ${themeColors.pipe} 0%, ${themeColors.pipeHighlight} 50%, ${themeColors.pipe} 100%)`,
          }}
        />
      </div>
    </>
  )
}

// Character component
const CharacterSprite = ({
  y,
  velocity,
  character,
  isPlaying,
}: {
  y: number
  velocity: number
  character: Character
  isPlaying: boolean
}) => {
  const charData = CHARACTERS[character]
  const rotation = Math.min(Math.max(velocity * 3, -30), 60)

  return (
    <div
      className={`absolute transition-transform ${isPlaying ? '' : 'animate-bounce'}`}
      style={{
        left: BIRD_X,
        top: y,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        transform: `rotate(${rotation}deg)`,
        fontSize: BIRD_SIZE - 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: `drop-shadow(0 0 10px ${charData.color})`,
      }}
    >
      {charData.emoji}
    </div>
  )
}

// Cloud component
const CloudElement = ({ cloud }: { cloud: Cloud }) => (
  <div
    className="absolute text-white/60 pointer-events-none"
    style={{
      left: cloud.x,
      top: cloud.y,
      fontSize: cloud.size,
    }}
  >
    ☁️
  </div>
)

// Star component
const StarElement = ({ star }: { star: Star }) => (
  <div
    className="absolute text-yellow-200 pointer-events-none animate-pulse"
    style={{
      left: star.x,
      top: star.y,
      fontSize: star.size,
      animationDelay: `${star.twinkle}s`,
    }}
  >
    ⭐
  </div>
)

// Particle system
const ParticleSystem = ({ particles }: { particles: Particle[] }) => (
  <>
    {particles.map((p) => (
      <div
        key={p.id}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          opacity: p.life,
        }}
      />
    ))}
  </>
)

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#fbbf24', '#ec4899', '#4ade80', '#3b82f6', '#f97316', '#a78bfa']
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  )
}

// Character selector
const CharacterSelector = ({
  selected,
  onSelect,
}: {
  selected: Character
  onSelect: (c: Character) => void
}) => (
  <div className="flex gap-2 justify-center mb-4">
    {(Object.keys(CHARACTERS) as Character[]).map((char) => (
      <button
        key={char}
        onClick={() => onSelect(char)}
        className={`w-14 h-14 rounded-xl text-2xl transition-all ${
          selected === char
            ? 'scale-110 ring-4 ring-yellow-400 bg-white/30'
            : 'bg-white/10 hover:bg-white/20'
        }`}
        style={{
          boxShadow: selected === char ? `0 0 20px ${CHARACTERS[char].color}` : 'none',
        }}
      >
        {CHARACTERS[char].emoji}
        <div className="text-[8px] text-white">{CHARACTERS[char].name}</div>
      </button>
    ))}
  </div>
)

// Theme selector
const ThemeSelector = ({
  selected,
  onSelect,
}: {
  selected: Theme
  onSelect: (t: Theme) => void
}) => (
  <div className="flex gap-2 justify-center mb-4">
    {(['day', 'sunset', 'night'] as Theme[]).map((theme) => (
      <button
        key={theme}
        onClick={() => onSelect(theme)}
        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
          selected === theme
            ? 'scale-105 ring-2 ring-white bg-white/30'
            : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        {theme === 'day' && '☀️ Day'}
        {theme === 'sunset' && '🌅 Sunset'}
        {theme === 'night' && '🌙 Night'}
      </button>
    ))}
  </div>
)

export default function FlappyGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Character and theme
  const [character, setCharacter] = useState<Character>('bird')
  const [theme, setTheme] = useState<Theme>('day')

  // Bird physics
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2 - BIRD_SIZE / 2)
  const [velocity, setVelocity] = useState(0)

  // Game elements
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [clouds, setClouds] = useState<Cloud[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Refs
  const gameLoopRef = useRef<number | null>(null)
  const pipeIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastPipeXRef = useRef(GAME_WIDTH + 100)

  // Responsive scaling
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const maxWidth = Math.min(window.innerWidth - 32, GAME_WIDTH)
      const maxHeight = Math.min(window.innerHeight - 200, GAME_HEIGHT)
      const widthScale = maxWidth / GAME_WIDTH
      const heightScale = maxHeight / GAME_HEIGHT
      setScale(Math.min(widthScale, heightScale, 1))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('flappy-high-scores')
    if (saved) {
      try {
        setHighScores(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Initialize background elements
  useEffect(() => {
    // Generate clouds
    const initialClouds: Cloud[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * (GAME_HEIGHT * 0.4),
      size: 30 + Math.random() * 40,
      speed: 0.3 + Math.random() * 0.5,
    }))
    setClouds(initialClouds)

    // Generate stars for night theme
    const initialStars: Star[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * (GAME_HEIGHT * 0.5),
      size: 8 + Math.random() * 12,
      twinkle: Math.random() * 2,
    }))
    setStars(initialStars)
  }, [])

  // Save high score
  const saveHighScore = useCallback(
    (newScore: number) => {
      const entry: HighScoreEntry = {
        score: newScore,
        date: new Date().toISOString(),
        character,
        theme,
      }

      const updated = [...highScores, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      setHighScores(updated)
      localStorage.setItem('flappy-high-scores', JSON.stringify(updated))

      if (updated[0]?.score === newScore && newScore > 0) {
        setIsNewHighScore(true)
        setShowConfetti(true)
        if (soundEnabled) playSound('highscore')
        setTimeout(() => setShowConfetti(false), 3000)
      }
    },
    [highScores, character, theme, soundEnabled]
  )

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count = 10) => {
    const newParticles: Particle[] = Array.from({ length: count }, () => ({
      id: particleIdRef.current++,
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      color,
      life: 1,
      size: 4 + Math.random() * 4,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Flap action
  const flap = useCallback(() => {
    if (gameState === 'playing') {
      setVelocity(FLAP_VELOCITY)
      if (soundEnabled) playSound('flap')
      spawnParticles(BIRD_X + BIRD_SIZE / 2, birdY + BIRD_SIZE, CHARACTERS[character].trail, 5)
    }
  }, [gameState, soundEnabled, birdY, character, spawnParticles])

  // Handle click/tap
  const handleInteraction = useCallback(() => {
    if (gameState === 'idle') {
      setCountdown(3)
      setGameState('countdown')
    } else if (gameState === 'playing') {
      flap()
    } else if (gameState === 'gameover') {
      // Restart game
      setGameState('idle')
    }
  }, [gameState, flap])

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'countdown') return

    if (countdown === 0) {
      // Start game
      setBirdY(GAME_HEIGHT / 2 - BIRD_SIZE / 2)
      setVelocity(0)
      setPipes([])
      setScore(0)
      setIsNewHighScore(false)
      lastPipeXRef.current = GAME_WIDTH + 100
      pipeIdRef.current = 0
      setGameState('playing')
      return
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [gameState, countdown])

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      // Update bird position
      setBirdY((prevY) => {
        const newVelocity = velocity + GRAVITY
        setVelocity(newVelocity)
        const newY = prevY + newVelocity

        // Check ground/ceiling collision
        if (newY < 0 || newY > GAME_HEIGHT - 60 - BIRD_SIZE) {
          if (soundEnabled) playSound('hit')
          setGameState('gameover')
          saveHighScore(score)
          return prevY
        }

        return newY
      })

      // Update pipes
      setPipes((prevPipes) => {
        // Move existing pipes
        let updatedPipes = prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED,
        }))

        // Remove off-screen pipes
        updatedPipes = updatedPipes.filter((pipe) => pipe.x > -PIPE_WIDTH)

        // Spawn new pipes
        const lastPipeX = updatedPipes.length > 0 
          ? Math.max(...updatedPipes.map((p) => p.x)) 
          : -PIPE_SPAWN_DISTANCE

        if (lastPipeX < GAME_WIDTH - PIPE_SPAWN_DISTANCE + 100) {
          const gapHeight = PIPE_GAP_MIN + Math.random() * (PIPE_GAP_MAX - PIPE_GAP_MIN)
          const minGapY = 60
          const maxGapY = GAME_HEIGHT - 60 - gapHeight - 60
          const gapY = minGapY + Math.random() * (maxGapY - minGapY)

          updatedPipes.push({
            id: pipeIdRef.current++,
            x: GAME_WIDTH + 50,
            gapY,
            gapHeight,
            passed: false,
          })
        }

        return updatedPipes
      })

      // Update clouds
      setClouds((prev) =>
        prev.map((cloud) => ({
          ...cloud,
          x: cloud.x - cloud.speed,
          ...(cloud.x < -cloud.size
            ? { x: GAME_WIDTH + cloud.size, y: Math.random() * (GAME_HEIGHT * 0.4) }
            : {}),
        }))
      )

      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
      )

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, velocity, soundEnabled, saveHighScore, score])

  // Collision detection and scoring
  useEffect(() => {
    if (gameState !== 'playing') return

    // Check pipe collisions and scoring
    pipes.forEach((pipe) => {
      const birdLeft = BIRD_X
      const birdRight = BIRD_X + BIRD_SIZE
      const birdTop = birdY
      const birdBottom = birdY + BIRD_SIZE

      const pipeLeft = pipe.x
      const pipeRight = pipe.x + PIPE_WIDTH
      const gapTop = pipe.gapY
      const gapBottom = pipe.gapY + pipe.gapHeight

      // Check if bird is in pipe x range
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Check if bird hits pipe (not in gap)
        if (birdTop < gapTop || birdBottom > gapBottom) {
          if (soundEnabled) playSound('hit')
          setGameState('gameover')
          saveHighScore(score)
          spawnParticles(birdRight, birdY + BIRD_SIZE / 2, '#ff4444', 15)
          return
        }
      }

      // Check if passed pipe
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true
        setScore((s) => s + 1)
        if (soundEnabled) playSound('score')
        spawnParticles(BIRD_X + BIRD_SIZE, birdY + BIRD_SIZE / 2, '#fbbf24', 8)
      }
    })
  }, [pipes, birdY, gameState, soundEnabled, saveHighScore, score, spawnParticles])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        handleInteraction()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleInteraction])

  const themeColors = THEMES[theme]
  const highScore = highScores.length > 0 ? highScores[0].score : 0

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeColors.sky} flex flex-col items-center justify-center p-4`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm z-20">
        <Link
          href="/games"
          className="text-2xl hover:scale-110 transition-transform bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          {CHARACTERS[character].emoji} Flappy {CHARACTERS[character].name}!
        </h1>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-2xl bg-white/20 rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </header>

      {/* Score display */}
      {gameState === 'playing' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
            {score}
          </div>
        </div>
      )}

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer select-none"
        style={{
          width: GAME_WIDTH * scale,
          height: GAME_HEIGHT * scale,
          marginTop: '60px',
        }}
        onClick={handleInteraction}
        onTouchStart={(e) => {
          e.preventDefault()
          handleInteraction()
        }}
      >
        <div
          className="relative"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Sky background */}
          <div className={`absolute inset-0 bg-gradient-to-b ${themeColors.sky}`} />

          {/* Stars (night theme) */}
          {themeColors.stars && stars.map((star) => <StarElement key={star.id} star={star} />)}

          {/* Clouds */}
          {themeColors.clouds && clouds.map((cloud) => <CloudElement key={cloud.id} cloud={cloud} />)}

          {/* Pipes */}
          {pipes.map((pipe) => (
            <PipeObstacle key={pipe.id} pipe={pipe} theme={theme} gameHeight={GAME_HEIGHT} />
          ))}

          {/* Particles */}
          <ParticleSystem particles={particles} />

          {/* Character */}
          <CharacterSprite
            y={birdY}
            velocity={velocity}
            character={character}
            isPlaying={gameState === 'playing'}
          />

          {/* Ground */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t ${themeColors.ground}`}
          >
            {/* Grass/details */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-green-400/30" />
            <div className="flex justify-around mt-4 opacity-50">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="text-lg">
                  {theme === 'night' ? '🌸' : '🌻'}
                </span>
              ))}
            </div>
          </div>

          {/* Confetti */}
          <Confetti active={showConfetti} />

          {/* Idle Screen */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-6xl mb-4 animate-bounce">{CHARACTERS[character].emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                Flappy {CHARACTERS[character].name}!
              </h2>
              <p className="text-white/80 mb-4">Tap to fly!</p>

              {/* Character selector */}
              <CharacterSelector selected={character} onSelect={setCharacter} />

              {/* Theme selector */}
              <ThemeSelector selected={theme} onSelect={setTheme} />

              <button
                onClick={handleInteraction}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black text-2xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
              >
                🎮 Play!
              </button>

              {/* High score display */}
              {highScore > 0 && (
                <div className="mt-4 text-white/80">
                  <span className="text-xl">🏆 Best: {highScore}</span>
                </div>
              )}

              {/* Top scores */}
              {highScores.length > 0 && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 max-h-40 overflow-y-auto">
                  <h3 className="text-white font-bold mb-2 text-center">Top Scores</h3>
                  {highScores.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex justify-between text-white/80 text-sm gap-4">
                      <span>
                        {i + 1}. {CHARACTERS[entry.character]?.emoji || '🐦'} {entry.score}
                      </span>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Countdown */}
          {gameState === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-9xl font-bold text-white animate-bounce drop-shadow-lg">
                {countdown || 'GO!'}
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💔'}</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                {isNewHighScore ? 'New Record!' : 'Game Over!'}
              </h2>
              <p className="text-6xl font-bold text-yellow-300 mb-2">{score}</p>
              <p className="text-white/80 mb-6">
                {score === 0
                  ? 'Tap to flap! Try again!'
                  : score < 5
                    ? 'Good start! Keep practicing!'
                    : score < 10
                      ? 'Nice flying!'
                      : score < 20
                        ? 'Amazing! You\'re getting good!'
                        : 'Incredible! You\'re a pro!'}
              </p>
              {isNewHighScore && (
                <p className="text-2xl text-green-400 mb-4 animate-pulse">🌟 High Score! 🌟</p>
              )}
              <button
                onClick={handleInteraction}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
              >
                Play Again!
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-white/70 text-sm max-w-md">
        <p>Tap, click, or press Space/↑ to flap!</p>
        <p className="text-xs mt-1">Fly through the gaps and don&apos;t hit anything!</p>
      </div>

      {/* Custom animations */}
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
