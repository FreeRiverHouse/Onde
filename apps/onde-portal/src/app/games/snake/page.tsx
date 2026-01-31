'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }
type GameState = 'idle' | 'playing' | 'paused' | 'gameover'
type GameMode = 'classic' | 'chaos' | 'timeattack' | 'zen'
type PowerUpType = 'speed' | 'shield' | 'magnet' | 'reverse' | 'cut' | 'ghost'
type FoodType = 'normal' | 'golden' | 'bomb' | 'portal'

interface PowerUp {
  type: PowerUpType
  position: Position
  emoji: string
  duration: number
}

interface Food {
  position: Position
  type: FoodType
  emoji: string
  points: number
}

interface ActivePowerUp {
  type: PowerUpType
  expiresAt: number
  emoji: string
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

interface TrailPoint {
  x: number
  y: number
  opacity: number
  color: string
}

interface HighScoreEntry {
  score: number
  date: string
  length: number
  mode: GameMode
}

// Game constants
const GRID_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREASE = 5
const MIN_SPEED = 60
const FAST_SPEED = 70
const TIME_ATTACK_DURATION = 60

// Neon colors for modern feel
const COLORS = {
  background: '#0a0a0f',
  grid: '#12121a',
  snake: '#00ff88',
  snakeHead: '#00ffcc',
  snakeGhost: '#00ff8840',
  food: '#ff0066',
  foodGlow: '#ff4488',
  golden: '#ffd700',
  bomb: '#ff4444',
  portal: '#aa55ff',
  text: '#00ff88',
  border: '#1a1a2e',
  neonPink: '#ff00aa',
  neonBlue: '#00ccff',
  neonPurple: '#aa00ff',
  neonYellow: '#ffff00',
}

// Power-up definitions
const POWER_UP_DEFS: Record<PowerUpType, { emoji: string; duration: number; color: string; name: string }> = {
  speed: { emoji: '⚡', duration: 5000, color: '#ffff00', name: 'Speed Boost' },
  shield: { emoji: '🛡️', duration: 10000, color: '#00aaff', name: 'Shield' },
  magnet: { emoji: '🧲', duration: 8000, color: '#ff00aa', name: 'Magnet' },
  reverse: { emoji: '🔄', duration: 6000, color: '#aa00ff', name: 'Reverse!' },
  cut: { emoji: '✂️', duration: 0, color: '#ff6600', name: 'Tail Cut' },
  ghost: { emoji: '👻', duration: 7000, color: '#88ffff', name: 'Ghost Mode' },
}

// Food definitions
const FOOD_DEFS: Record<FoodType, { emoji: string; points: number; color: string; rarity: number }> = {
  normal: { emoji: '🍎', points: 10, color: '#ff0066', rarity: 70 },
  golden: { emoji: '🌟', points: 50, color: '#ffd700', rarity: 10 },
  bomb: { emoji: '💣', points: -20, color: '#ff4444', rarity: 12 },
  portal: { emoji: '🌀', points: 15, color: '#aa55ff', rarity: 8 },
}

// Sound effects
const playSound = (type: 'eat' | 'die' | 'move' | 'powerup' | 'bomb' | 'portal' | 'golden') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'eat':
        osc.type = 'square'
        osc.frequency.value = 440
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'golden':
        osc.type = 'sine'
        osc.frequency.value = 880
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1760, audio.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'bomb':
        osc.type = 'sawtooth'
        osc.frequency.value = 150
        gain.gain.value = 0.3
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(30, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'portal':
        osc.type = 'sine'
        osc.frequency.value = 300
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.15)
        osc.frequency.exponentialRampToValueAtTime(300, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.35)
        osc.stop(audio.currentTime + 0.35)
        break
      case 'powerup':
        osc.type = 'triangle'
        osc.frequency.value = 600
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'die':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
        break
      case 'move':
        osc.type = 'sine'
        osc.frequency.value = 100
        gain.gain.value = 0.03
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
    }
  } catch {
    // Audio not supported
  }
}

const playVictorySound = () => {
  try {
    const audio = new AudioContext()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.connect(gain)
        gain.connect(audio.destination)
        osc.type = 'square'
        osc.frequency.value = freq
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
      }, i * 100)
    })
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#00ff88', '#ff0066', '#00ccff', '#ffff00', '#ff6600', '#aa00ff']
  const confetti = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
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
            boxShadow: `0 0 ${piece.size}px ${piece.color}`,
          }}
        />
      ))}
    </div>
  )
}

// Particle explosion component
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
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    ))}
  </>
)

// Neon trail component
const NeonTrail = ({ trail, cellSize }: { trail: TrailPoint[]; cellSize: number }) => (
  <>
    {trail.map((point, i) => (
      <div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: point.x * cellSize + cellSize / 2,
          top: point.y * cellSize + cellSize / 2,
          width: cellSize * 0.6,
          height: cellSize * 0.6,
          backgroundColor: point.color,
          opacity: point.opacity * 0.5,
          boxShadow: `0 0 ${cellSize}px ${point.color}`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    ))}
  </>
)

// Food component with animation
const FoodItem = ({ food, cellSize }: { food: Food; cellSize: number }) => {
  const def = FOOD_DEFS[food.type]
  return (
    <div
      className={`absolute ${food.type === 'portal' ? 'animate-spin-slow' : 'animate-pulse-food'}`}
      style={{
        left: food.position.x * cellSize,
        top: food.position.y * cellSize,
        width: cellSize - 2,
        height: cellSize - 2,
        backgroundColor: def.color + '40',
        borderRadius: food.type === 'portal' ? '50%' : '30%',
        boxShadow: `0 0 ${cellSize}px ${def.color}, 0 0 ${cellSize * 2}px ${def.color}60`,
        border: `2px solid ${def.color}`,
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: cellSize * 0.7 }}
      >
        {food.emoji}
      </span>
    </div>
  )
}

// Power-up component
const PowerUpItem = ({ powerUp, cellSize }: { powerUp: PowerUp; cellSize: number }) => {
  const def = POWER_UP_DEFS[powerUp.type]
  return (
    <div
      className="absolute animate-float"
      style={{
        left: powerUp.position.x * cellSize,
        top: powerUp.position.y * cellSize,
        width: cellSize - 2,
        height: cellSize - 2,
        backgroundColor: def.color + '30',
        borderRadius: '50%',
        boxShadow: `0 0 ${cellSize * 1.5}px ${def.color}, 0 0 ${cellSize * 3}px ${def.color}40`,
        border: `2px solid ${def.color}`,
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: cellSize * 0.7 }}
      >
        {powerUp.emoji}
      </span>
    </div>
  )
}

// Active power-ups display
const ActivePowerUpsDisplay = ({ powerUps, now }: { powerUps: ActivePowerUp[]; now: number }) => (
  <div className="flex flex-wrap gap-2 justify-center mb-2">
    {powerUps.map((p, i) => {
      const remaining = Math.max(0, Math.ceil((p.expiresAt - now) / 1000))
      const def = POWER_UP_DEFS[p.type]
      return (
        <div
          key={i}
          className="px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse"
          style={{
            backgroundColor: def.color + '30',
            color: def.color,
            border: `1px solid ${def.color}`,
            boxShadow: `0 0 10px ${def.color}40`,
          }}
        >
          {p.emoji} {remaining > 0 ? `${remaining}s` : '∞'}
        </div>
      )
    })}
  </div>
)

// Snake segment component with ghost mode support
const SnakeSegment = ({
  position,
  isHead,
  cellSize,
  direction,
  index,
  isGhost,
  trailColor,
}: {
  position: Position
  isHead: boolean
  cellSize: number
  direction: Direction
  index: number
  isGhost: boolean
  trailColor: string
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'UP': return 0
      case 'RIGHT': return 90
      case 'DOWN': return 180
      case 'LEFT': return 270
    }
  }

  const baseColor = isGhost ? COLORS.snakeGhost : trailColor
  const headColor = isGhost ? COLORS.snakeGhost : COLORS.snakeHead

  return (
    <div
      className="absolute transition-all duration-75"
      style={{
        left: position.x * cellSize + 1,
        top: position.y * cellSize + 1,
        width: cellSize - 2,
        height: cellSize - 2,
        backgroundColor: isHead ? headColor : baseColor,
        borderRadius: isHead ? '30%' : '20%',
        boxShadow: isHead
          ? `0 0 ${cellSize}px ${headColor}, 0 0 ${cellSize * 2}px ${trailColor}60`
          : `0 0 ${cellSize / 2}px ${baseColor}80`,
        transform: isHead ? `rotate(${getRotation()}deg)` : undefined,
        opacity: isGhost ? 0.4 : 1 - index * 0.008,
      }}
    >
      {isHead && !isGhost && (
        <>
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: cellSize * 0.2,
              height: cellSize * 0.2,
              top: '20%',
              left: '20%',
              boxShadow: '0 0 3px #fff',
            }}
          >
            <div
              className="absolute bg-black rounded-full"
              style={{ width: '50%', height: '50%', top: '25%', left: '25%' }}
            />
          </div>
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: cellSize * 0.2,
              height: cellSize * 0.2,
              top: '20%',
              right: '20%',
              boxShadow: '0 0 3px #fff',
            }}
          >
            <div
              className="absolute bg-black rounded-full"
              style={{ width: '50%', height: '50%', top: '25%', left: '25%' }}
            />
          </div>
        </>
      )}
      {isHead && isGhost && (
        <span className="absolute inset-0 flex items-center justify-center text-lg">👻</span>
      )}
    </div>
  )
}

// Game mode selector
const GameModeSelector = ({
  selectedMode,
  onSelect,
}: {
  selectedMode: GameMode
  onSelect: (mode: GameMode) => void
}) => {
  const modes: { mode: GameMode; emoji: string; name: string; desc: string }[] = [
    { mode: 'classic', emoji: '🎮', name: 'Classic', desc: 'Standard snake' },
    { mode: 'chaos', emoji: '🌪️', name: 'Chaos', desc: 'Constant power-ups!' },
    { mode: 'timeattack', emoji: '⏱️', name: 'Time Attack', desc: '60 seconds frenzy' },
    { mode: 'zen', emoji: '🧘', name: 'Zen', desc: 'No walls, relax' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {modes.map((m) => (
        <button
          key={m.mode}
          onClick={() => onSelect(m.mode)}
          className={`p-3 rounded-xl font-bold text-sm transition-all ${
            selectedMode === m.mode ? 'scale-105' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: selectedMode === m.mode ? COLORS.snake + '30' : '#222',
            border: `2px solid ${selectedMode === m.mode ? COLORS.snake : '#333'}`,
            color: selectedMode === m.mode ? COLORS.snake : '#888',
            boxShadow: selectedMode === m.mode ? `0 0 20px ${COLORS.snake}40` : 'none',
          }}
        >
          <div className="text-2xl mb-1">{m.emoji}</div>
          <div>{m.name}</div>
          <div className="text-xs opacity-70">{m.desc}</div>
        </button>
      ))}
    </div>
  )
}

// Main game component
export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Food>({ position: { x: 15, y: 10 }, type: 'normal', emoji: '🍎', points: 10 })
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([])
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [gameState, setGameState] = useState<GameState>('idle')
  const [gameMode, setGameMode] = useState<GameMode>('classic')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [cellSize, setCellSize] = useState(20)
  const [particles, setParticles] = useState<Particle[]>([])
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [screenShake, setScreenShake] = useState(false)
  const [slowMo, setSlowMo] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_DURATION)
  const [now, setNow] = useState(Date.now())
  const [shieldHits, setShieldHits] = useState(0)

  const directionRef = useRef(direction)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const powerUpLoopRef = useRef<NodeJS.Timeout | null>(null)
  const particleLoopRef = useRef<NodeJS.Timeout | null>(null)
  const timeLoopRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const snakeRef = useRef(snake)
  const activePowerUpsRef = useRef(activePowerUps)
  const foodRef = useRef(food)

  // Keep refs in sync
  useEffect(() => { snakeRef.current = snake }, [snake])
  useEffect(() => { activePowerUpsRef.current = activePowerUps }, [activePowerUps])
  useEffect(() => { foodRef.current = food }, [food])

  // Update now for power-up timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(interval)
  }, [])

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = Math.min(containerRef.current.offsetWidth - 32, 400)
        setCellSize(Math.floor(containerWidth / GRID_SIZE))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('snake-high-scores-v2')
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

  // Check if has power-up
  const hasPowerUp = useCallback((type: PowerUpType) => {
    return activePowerUpsRef.current.some((p) => p.type === type && p.expiresAt > Date.now())
  }, [])

  // Generate random position not on snake
  const generateRandomPosition = useCallback((currentSnake: Position[], excludePositions: Position[] = []): Position => {
    let pos: Position
    const allExcluded = [...currentSnake, ...excludePositions]
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (allExcluded.some((p) => p.x === pos.x && p.y === pos.y))
    return pos
  }, [])

  // Generate food based on rarity
  const generateFood = useCallback((currentSnake: Position[], excludePositions: Position[] = []): Food => {
    const position = generateRandomPosition(currentSnake, excludePositions)
    const roll = Math.random() * 100
    let cumulative = 0
    
    for (const [type, def] of Object.entries(FOOD_DEFS) as [FoodType, typeof FOOD_DEFS[FoodType]][]) {
      cumulative += def.rarity
      if (roll < cumulative) {
        return { position, type, emoji: def.emoji, points: def.points }
      }
    }
    return { position, type: 'normal', emoji: '🍎', points: 10 }
  }, [generateRandomPosition])

  // Generate power-up
  const generatePowerUp = useCallback((currentSnake: Position[], currentFood: Position): PowerUp => {
    const position = generateRandomPosition(currentSnake, [currentFood])
    const types: PowerUpType[] = ['speed', 'shield', 'magnet', 'reverse', 'cut', 'ghost']
    const type = types[Math.floor(Math.random() * types.length)]
    const def = POWER_UP_DEFS[type]
    return { type, position, emoji: def.emoji, duration: def.duration }
  }, [generateRandomPosition])

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 15) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: x * cellSize + cellSize / 2,
      y: y * cellSize + cellSize / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color,
      life: 1,
      size: 4 + Math.random() * 6,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [cellSize])

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 200)
  }, [])

  // Trigger slow-mo
  const triggerSlowMo = useCallback(() => {
    setSlowMo(true)
    setTimeout(() => setSlowMo(false), 500)
  }, [])

  // Save high score
  const saveHighScore = useCallback(
    (newScore: number, length: number) => {
      const newEntry: HighScoreEntry = {
        score: newScore,
        date: new Date().toISOString(),
        length,
        mode: gameMode,
      }

      const newScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)

      setHighScores(newScores)
      setHighScore(Math.max(newScore, highScore))
      localStorage.setItem('snake-high-scores-v2', JSON.stringify(newScores))

      if (newScore > highScore) {
        setIsNewHighScore(true)
        setShowConfetti(true)
        if (soundEnabled) playVictorySound()
        setTimeout(() => setShowConfetti(false), 3000)
      }
    },
    [highScores, highScore, soundEnabled, gameMode]
  )

  // Apply power-up effect
  const applyPowerUp = useCallback((powerUp: PowerUp) => {
    const def = POWER_UP_DEFS[powerUp.type]
    
    if (powerUp.type === 'cut') {
      // Instant effect: cut tail in half
      setSnake((prev) => {
        if (prev.length <= 2) return prev
        return prev.slice(0, Math.ceil(prev.length / 2))
      })
      spawnParticles(powerUp.position.x, powerUp.position.y, def.color, 20)
    } else {
      // Timed power-up
      setActivePowerUps((prev) => {
        const filtered = prev.filter((p) => p.type !== powerUp.type)
        return [...filtered, { type: powerUp.type, expiresAt: Date.now() + powerUp.duration, emoji: powerUp.emoji }]
      })
    }

    if (soundEnabled) playSound('powerup')
    spawnParticles(powerUp.position.x, powerUp.position.y, def.color)
  }, [soundEnabled, spawnParticles])

  // Game loop
  const moveSnake = useCallback(() => {
    const currentNow = Date.now()
    
    // Clean expired power-ups
    setActivePowerUps((prev) => prev.filter((p) => p.expiresAt > currentNow))

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] }
      let currentDirection = directionRef.current

      // Reverse controls if active
      if (hasPowerUp('reverse')) {
        const reverseMap: Record<Direction, Direction> = {
          UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT'
        }
        currentDirection = reverseMap[currentDirection]
      }

      // Move head
      switch (currentDirection) {
        case 'UP': head.y -= 1; break
        case 'DOWN': head.y += 1; break
        case 'LEFT': head.x -= 1; break
        case 'RIGHT': head.x += 1; break
      }

      // Zen mode: wrap around
      if (gameMode === 'zen') {
        if (head.x < 0) head.x = GRID_SIZE - 1
        if (head.x >= GRID_SIZE) head.x = 0
        if (head.y < 0) head.y = GRID_SIZE - 1
        if (head.y >= GRID_SIZE) head.y = 0
      } else {
        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          if (hasPowerUp('shield')) {
            // Shield absorbs hit
            setShieldHits((prev) => prev + 1)
            setActivePowerUps((prev) => prev.filter((p) => p.type !== 'shield'))
            triggerShake()
            spawnParticles(prevSnake[0].x, prevSnake[0].y, POWER_UP_DEFS.shield.color, 25)
            if (soundEnabled) playSound('powerup')
            return prevSnake
          }
          triggerSlowMo()
          if (soundEnabled) playSound('die')
          setGameState('gameover')
          saveHighScore(score, prevSnake.length)
          return prevSnake
        }
      }

      // Check self collision (unless ghost mode)
      if (!hasPowerUp('ghost')) {
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          if (hasPowerUp('shield')) {
            setShieldHits((prev) => prev + 1)
            setActivePowerUps((prev) => prev.filter((p) => p.type !== 'shield'))
            triggerShake()
            spawnParticles(head.x, head.y, POWER_UP_DEFS.shield.color, 25)
            if (soundEnabled) playSound('powerup')
            return prevSnake
          }
          triggerSlowMo()
          if (soundEnabled) playSound('die')
          setGameState('gameover')
          saveHighScore(score, prevSnake.length)
          return prevSnake
        }
      }

      // Add trail point
      setTrail((prev) => {
        const newTrail = [{ x: prevSnake[0].x, y: prevSnake[0].y, opacity: 1, color: COLORS.snake }, ...prev]
        return newTrail.slice(0, 30).map((p, i) => ({ ...p, opacity: 1 - i * 0.033 }))
      })

      const newSnake = [head, ...prevSnake]
      const currentFood = foodRef.current

      // Check food collision
      if (head.x === currentFood.position.x && head.y === currentFood.position.y) {
        const foodDef = FOOD_DEFS[currentFood.type]
        
        if (currentFood.type === 'bomb') {
          // Bomb: shrink snake
          triggerShake()
          spawnParticles(head.x, head.y, foodDef.color, 30)
          if (soundEnabled) playSound('bomb')
          setScore((prev) => Math.max(0, prev + currentFood.points))
          setFood(generateFood(newSnake))
          // Shrink but keep at least 1
          const shrunkSnake = newSnake.slice(0, Math.max(1, Math.ceil(newSnake.length / 2)))
          shrunkSnake.pop()
          return shrunkSnake.length > 0 ? shrunkSnake : [head]
        }

        if (currentFood.type === 'portal') {
          // Portal: teleport to random position
          spawnParticles(head.x, head.y, foodDef.color, 20)
          if (soundEnabled) playSound('portal')
          const teleportPos = generateRandomPosition(prevSnake.slice(1))
          const teleportedSnake = [teleportPos, ...prevSnake]
          spawnParticles(teleportPos.x, teleportPos.y, foodDef.color, 20)
          setScore((prev) => prev + currentFood.points)
          setFood(generateFood(teleportedSnake))
          return teleportedSnake
        }

        if (currentFood.type === 'golden') {
          spawnParticles(head.x, head.y, foodDef.color, 40)
          if (soundEnabled) playSound('golden')
        } else {
          spawnParticles(head.x, head.y, foodDef.color, 15)
          if (soundEnabled) playSound('eat')
        }

        setScore((prev) => prev + currentFood.points)
        setFood(generateFood(newSnake))
        // Increase speed in classic mode
        if (gameMode === 'classic') {
          setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_INCREASE))
        }
        return newSnake
      }

      // Check power-up collision
      setPowerUps((currentPowerUps) => {
        const collected = currentPowerUps.find(
          (p) => p.position.x === head.x && p.position.y === head.y
        )
        if (collected) {
          applyPowerUp(collected)
          return currentPowerUps.filter((p) => p !== collected)
        }
        return currentPowerUps
      })

      // Magnet effect: move food towards snake
      if (hasPowerUp('magnet')) {
        setFood((prev) => {
          const dx = head.x - prev.position.x
          const dy = head.y - prev.position.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 1 && dist < 8) {
            return {
              ...prev,
              position: {
                x: prev.position.x + Math.sign(dx),
                y: prev.position.y + Math.sign(dy),
              },
            }
          }
          return prev
        })
      }

      newSnake.pop()
      return newSnake
    })
  }, [generateFood, generateRandomPosition, saveHighScore, score, soundEnabled, gameMode, hasPowerUp, applyPowerUp, spawnParticles, triggerShake, triggerSlowMo])

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const currentSpeed = hasPowerUp('speed') ? FAST_SPEED : (slowMo ? speed * 3 : speed)
      gameLoopRef.current = setInterval(moveSnake, currentSpeed)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameState, speed, moveSnake, slowMo, hasPowerUp])

  // Power-up spawning
  useEffect(() => {
    if (gameState === 'playing') {
      const spawnInterval = gameMode === 'chaos' ? 3000 : 8000
      powerUpLoopRef.current = setInterval(() => {
        setPowerUps((prev) => {
          if (prev.length >= (gameMode === 'chaos' ? 5 : 2)) return prev
          const newPowerUp = generatePowerUp(snakeRef.current, foodRef.current.position)
          return [...prev, newPowerUp]
        })
      }, spawnInterval)
    }
    return () => {
      if (powerUpLoopRef.current) clearInterval(powerUpLoopRef.current)
    }
  }, [gameState, gameMode, generatePowerUp])

  // Particle animation
  useEffect(() => {
    particleLoopRef.current = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3,
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
      )
    }, 30)
    return () => {
      if (particleLoopRef.current) clearInterval(particleLoopRef.current)
    }
  }, [])

  // Time attack timer
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'timeattack') {
      timeLoopRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('gameover')
            saveHighScore(score, snake.length)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timeLoopRef.current) clearInterval(timeLoopRef.current)
    }
  }, [gameState, gameMode, score, snake.length, saveHighScore])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle') {
        startGame()
        return
      }

      if (gameState !== 'playing') return

      const currentDirection = directionRef.current

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection !== 'DOWN') {
            directionRef.current = 'UP'
            setDirection('UP')
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection !== 'UP') {
            directionRef.current = 'DOWN'
            setDirection('DOWN')
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection !== 'RIGHT') {
            directionRef.current = 'LEFT'
            setDirection('LEFT')
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection !== 'LEFT') {
            directionRef.current = 'RIGHT'
            setDirection('RIGHT')
          }
          break
        case ' ':
          e.preventDefault()
          setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState])

  // Handle touch input for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const dx = touchEnd.x - touchStartRef.current.x
    const dy = touchEnd.y - touchStartRef.current.y
    const minSwipe = 30

    if (gameState === 'idle') {
      startGame()
      return
    }

    if (gameState !== 'playing') return

    const currentDirection = directionRef.current

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > minSwipe && currentDirection !== 'LEFT') {
        directionRef.current = 'RIGHT'
        setDirection('RIGHT')
      } else if (dx < -minSwipe && currentDirection !== 'RIGHT') {
        directionRef.current = 'LEFT'
        setDirection('LEFT')
      }
    } else {
      if (dy > minSwipe && currentDirection !== 'UP') {
        directionRef.current = 'DOWN'
        setDirection('DOWN')
      } else if (dy < -minSwipe && currentDirection !== 'DOWN') {
        directionRef.current = 'UP'
        setDirection('UP')
      }
    }

    touchStartRef.current = null
  }

  // Start new game
  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setPowerUps([])
    setActivePowerUps([])
    setDirection('RIGHT')
    directionRef.current = 'RIGHT'
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameState('playing')
    setShowConfetti(false)
    setIsNewHighScore(false)
    setParticles([])
    setTrail([])
    setTimeLeft(TIME_ATTACK_DURATION)
    setShieldHits(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const boardSize = cellSize * GRID_SIZE
  const isGhost = hasPowerUp('ghost')
  const isReversed = hasPowerUp('reverse')
  const hasSpeed = hasPowerUp('speed')

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
      ref={containerRef}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade"
        className="absolute top-4 left-4 bg-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-green-500/30"
        style={{ color: COLORS.text }}
      >
        ← Arcade
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-green-500/30"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1
        className="text-4xl md:text-6xl font-black mb-1 mt-16 text-center font-mono tracking-wider"
        style={{
          color: COLORS.text,
          textShadow: `0 0 20px ${COLORS.snake}, 0 0 40px ${COLORS.snake}60`,
        }}
      >
        🐍 SNAKE
      </h1>
      <p className="text-gray-500 mb-2 text-center font-mono text-xs">
        MODERN TWIST EDITION
      </p>

      {/* Active Power-ups Display */}
      {activePowerUps.length > 0 && (
        <ActivePowerUpsDisplay powerUps={activePowerUps} now={now} />
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-2 justify-center text-sm">
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.text,
            borderColor: COLORS.snake + '40',
            textShadow: `0 0 10px ${COLORS.snake}`,
          }}
        >
          🎯 {score}
        </div>
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: '#ffd700',
            borderColor: '#ffd70040',
            textShadow: '0 0 10px #ffd700',
          }}
        >
          🏆 {highScore}
        </div>
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: '#ff6b6b',
            borderColor: '#ff6b6b40',
            textShadow: '0 0 10px #ff6b6b',
          }}
        >
          📏 {snake.length}
        </div>
        {gameMode === 'timeattack' && gameState === 'playing' && (
          <div
            className={`px-3 py-1 rounded-full font-bold font-mono shadow-lg border ${
              timeLeft <= 10 ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: '#111',
              color: timeLeft <= 10 ? '#ff4444' : '#00ccff',
              borderColor: timeLeft <= 10 ? '#ff444440' : '#00ccff40',
              textShadow: `0 0 10px ${timeLeft <= 10 ? '#ff4444' : '#00ccff'}`,
            }}
          >
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      {/* Mode indicator */}
      {gameState === 'playing' && (
        <div className="text-xs text-gray-500 font-mono mb-2 flex gap-2 items-center">
          <span>Mode: {gameMode.toUpperCase()}</span>
          {isReversed && <span className="text-purple-400 animate-pulse">🔄 REVERSED!</span>}
          {hasSpeed && <span className="text-yellow-400 animate-pulse">⚡ FAST!</span>}
          {isGhost && <span className="text-cyan-400 animate-pulse">👻 GHOST!</span>}
        </div>
      )}

      {/* Game Board */}
      <div
        className={`relative rounded-lg overflow-hidden shadow-2xl transition-transform ${
          screenShake ? 'animate-shake' : ''
        }`}
        style={{
          width: boardSize,
          height: boardSize,
          backgroundColor: COLORS.grid,
          border: `4px solid ${isReversed ? COLORS.neonPurple : isGhost ? COLORS.neonBlue : COLORS.border}`,
          boxShadow: `0 0 40px ${COLORS.snake}20, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(${COLORS.snake}20 1px, transparent 1px),
              linear-gradient(90deg, ${COLORS.snake}20 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />

        {/* Scanlines effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />

        {/* Neon Trail */}
        <NeonTrail trail={trail} cellSize={cellSize} />

        {/* Particles */}
        <ParticleSystem particles={particles} />

        {/* Power-ups */}
        {powerUps.map((p, i) => (
          <PowerUpItem key={i} powerUp={p} cellSize={cellSize} />
        ))}

        {/* Food */}
        <FoodItem food={food} cellSize={cellSize} />

        {/* Snake */}
        {snake.map((segment, index) => (
          <SnakeSegment
            key={index}
            position={segment}
            isHead={index === 0}
            cellSize={cellSize}
            direction={direction}
            index={index}
            isGhost={isGhost}
            trailColor={COLORS.snake}
          />
        ))}

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-5xl mb-2 animate-bounce">🐍</div>
            <h2
              className="text-xl font-black mb-3 font-mono"
              style={{ color: COLORS.text, textShadow: `0 0 15px ${COLORS.snake}` }}
            >
              MODERN TWIST
            </h2>
            
            <GameModeSelector selectedMode={gameMode} onSelect={setGameMode} />

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.snake,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.snake}, 0 0 60px ${COLORS.snake}60`,
              }}
            >
              START GAME
            </button>
            <p className="text-gray-400 mt-3 text-xs font-mono">Press any key to start</p>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>🍎 +10</span>
              <span>🌟 +50</span>
              <span>💣 Shrink!</span>
              <span>🌀 Teleport</span>
            </div>
          </div>
        )}

        {/* Paused overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
            <div className="text-4xl mb-4">⏸️</div>
            <p
              className="text-2xl font-bold font-mono animate-pulse"
              style={{ color: COLORS.text }}
            >
              PAUSED
            </p>
            <p className="text-gray-400 mt-2 text-sm font-mono">Press SPACE to continue</p>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
        <div />
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'DOWN') {
              directionRef.current = 'UP'
              setDirection('UP')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'RIGHT') {
              directionRef.current = 'LEFT'
              setDirection('LEFT')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ◀
        </button>
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'UP') {
              directionRef.current = 'DOWN'
              setDirection('DOWN')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ▼
        </button>
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'LEFT') {
              directionRef.current = 'RIGHT'
              setDirection('RIGHT')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ▶
        </button>
      </div>

      {/* High scores button */}
      <button
        onClick={() => setShowHighScores(true)}
        className="mt-4 px-6 py-2 rounded-full font-bold font-mono transition-all hover:scale-105"
        style={{
          backgroundColor: '#222',
          color: '#ffd700',
          border: '2px solid #ffd70040',
          textShadow: '0 0 10px #ffd700',
        }}
      >
        🏆 High Scores
      </button>

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{
              backgroundColor: '#111',
              borderColor: isNewHighScore ? '#ffd700' : COLORS.food,
            }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💀'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: isNewHighScore ? '#ffd700' : COLORS.food,
                textShadow: `0 0 20px ${isNewHighScore ? '#ffd700' : COLORS.food}`,
              }}
            >
              {isNewHighScore ? 'NEW HIGH SCORE!' : gameMode === 'timeattack' ? 'TIME\'S UP!' : 'GAME OVER!'}
            </h2>
            <div className="text-gray-400 text-sm mb-3">{gameMode.toUpperCase()} MODE</div>
            {isNewHighScore && (
              <div className="text-yellow-400 text-xl mb-2 animate-pulse">⭐ Amazing! ⭐</div>
            )}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.text }}>
                  {score}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-yellow-400">{highScore}</div>
                <div className="text-xs text-gray-400">Best</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.food }}>
                  {snake.length}
                </div>
                <div className="text-xs text-gray-400">Length</div>
              </div>
            </div>
            {shieldHits > 0 && (
              <div className="text-blue-400 text-sm mb-4">
                🛡️ Shield saved you {shieldHits} time{shieldHits > 1 ? 's' : ''}!
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: COLORS.snake,
                  color: '#000',
                }}
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => setShowHighScores(true)}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: '#333',
                  color: '#ffd700',
                }}
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
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHighScores(false)}
        >
          <div
            className="rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: '#111',
              borderColor: '#ffd70060',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-2xl font-black font-mono"
                style={{
                  color: '#ffd700',
                  textShadow: '0 0 15px #ffd700',
                }}
              >
                🏆 HIGH SCORES
              </h2>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {highScores.length === 0 ? (
              <p className="text-gray-400 text-center py-8 font-mono">
                No scores yet! Play a game to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {highScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      index === 0
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : index === 1
                          ? 'border-gray-400/50 bg-gray-500/10'
                          : index === 2
                            ? 'border-orange-500/50 bg-orange-500/10'
                            : 'border-gray-700 bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <div className="text-xl font-bold font-mono" style={{ color: COLORS.text }}>
                          {entry.score}
                        </div>
                        <div className="text-xs text-gray-500">
                          Length: {entry.length} • {entry.mode?.toUpperCase() || 'CLASSIC'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">{formatDate(entry.date)}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setHighScores([])
                setHighScore(0)
                localStorage.removeItem('snake-high-scores-v2')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all font-mono"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 max-w-md text-center text-gray-500 text-xs font-mono">
        <p className="mb-1">
          <strong className="text-gray-400">Controls:</strong> Arrow keys / WASD / Swipe
        </p>
        <p className="mb-2">
          <strong className="text-gray-400">Pause:</strong> Spacebar
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span>⚡Speed</span>
          <span>🛡️Shield</span>
          <span>🧲Magnet</span>
          <span>🔄Reverse</span>
          <span>✂️Cut</span>
          <span>👻Ghost</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-4 left-4 text-2xl opacity-20 animate-pulse">🐍</div>
      <div
        className="fixed bottom-8 right-4 text-xl opacity-20 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      >
        🌟
      </div>
      <div
        className="fixed top-24 right-8 text-lg opacity-10 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        ⚡
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
        @keyframes pulse-food {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .animate-pulse-food {
          animation: pulse-food 0.6s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-float {
          animation: float 1.5s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          50% { transform: translateX(5px) rotate(1deg); }
          75% { transform: translateX(-3px) rotate(-0.5deg); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
