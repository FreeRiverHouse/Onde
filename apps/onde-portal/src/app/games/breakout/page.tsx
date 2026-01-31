'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'playing' | 'paused' | 'gameover' | 'levelComplete' | 'victory'
type PowerUpType = 'expand' | 'shrink' | 'multiball' | 'slow' | 'fast' | 'laser' | 'sticky' | 'life'

interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  stuck: boolean
}

interface Brick {
  id: number
  x: number
  y: number
  width: number
  height: number
  color: string
  points: number
  hits: number
  maxHits: number
  type: 'normal' | 'strong' | 'indestructible' | 'explosive'
}

interface PowerUp {
  id: number
  x: number
  y: number
  type: PowerUpType
  emoji: string
  color: string
  vy: number
}

interface Laser {
  id: number
  x: number
  y: number
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
  level: number
}

// Game constants
const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 640
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
const BALL_SPEED = 6
const BRICK_ROWS = 6
const BRICK_COLS = 10
const BRICK_WIDTH = 44
const BRICK_HEIGHT = 20
const BRICK_GAP = 2
const BRICK_TOP_OFFSET = 60
const BRICK_LEFT_OFFSET = 8
const INITIAL_LIVES = 3
const MAX_LEVEL = 10

// Neon colors
const COLORS = {
  background: '#0a0a0f',
  paddle: '#00ff88',
  paddleGlow: '#00ffcc',
  ball: '#ffffff',
  ballGlow: '#00ccff',
  text: '#00ff88',
  neonPink: '#ff00aa',
  neonBlue: '#00ccff',
  neonPurple: '#aa00ff',
  neonYellow: '#ffff00',
  neonOrange: '#ff6600',
  neonRed: '#ff4444',
}

// Brick colors by row (rainbow effect with points)
const BRICK_COLORS: { color: string; points: number; glow: string }[] = [
  { color: '#ff0066', points: 100, glow: '#ff4488' },  // Pink
  { color: '#ff6600', points: 80, glow: '#ff8844' },   // Orange
  { color: '#ffcc00', points: 60, glow: '#ffdd44' },   // Yellow
  { color: '#00ff66', points: 40, glow: '#44ff88' },   // Green
  { color: '#00ccff', points: 20, glow: '#44ddff' },   // Cyan
  { color: '#aa00ff', points: 10, glow: '#bb44ff' },   // Purple
]

// Power-up definitions
const POWER_UP_DEFS: Record<PowerUpType, { emoji: string; color: string; name: string; duration?: number }> = {
  expand: { emoji: '↔️', color: '#00ff88', name: 'Expand Paddle', duration: 15000 },
  shrink: { emoji: '↕️', color: '#ff4444', name: 'Shrink Paddle', duration: 10000 },
  multiball: { emoji: '⚪', color: '#00ccff', name: 'Multi-Ball' },
  slow: { emoji: '🐌', color: '#aa00ff', name: 'Slow Ball', duration: 10000 },
  fast: { emoji: '⚡', color: '#ffff00', name: 'Fast Ball', duration: 8000 },
  laser: { emoji: '🔫', color: '#ff6600', name: 'Laser', duration: 12000 },
  sticky: { emoji: '🧲', color: '#ff00aa', name: 'Sticky Paddle', duration: 10000 },
  life: { emoji: '❤️', color: '#ff0066', name: 'Extra Life' },
}

// Sound effects
const playSound = (type: 'paddle' | 'brick' | 'wall' | 'die' | 'powerup' | 'laser' | 'explosion' | 'levelup') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'paddle':
        osc.type = 'square'
        osc.frequency.value = 440
        gain.gain.value = 0.12
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'brick':
        osc.type = 'square'
        osc.frequency.value = 523
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1047, audio.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'wall':
        osc.type = 'sine'
        osc.frequency.value = 300
        gain.gain.value = 0.08
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
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
      case 'powerup':
        osc.type = 'triangle'
        osc.frequency.value = 600
        gain.gain.value = 0.18
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.12)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'laser':
        osc.type = 'sawtooth'
        osc.frequency.value = 800
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1600, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'explosion':
        osc.type = 'sawtooth'
        osc.frequency.value = 120
        gain.gain.value = 0.25
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(40, audio.currentTime + 0.25)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'levelup':
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const o = audio.createOscillator()
            const g = audio.createGain()
            o.connect(g)
            g.connect(audio.destination)
            o.type = 'square'
            o.frequency.value = freq
            g.gain.value = 0.12
            o.start()
            g.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
            o.stop(audio.currentTime + 0.15)
          }, i * 80)
        })
        break
    }
  } catch {
    // Audio not supported
  }
}

// Particle component
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

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#00ff88', '#ff0066', '#00ccff', '#ffff00', '#ff6600', '#aa00ff']
  const confetti = Array.from({ length: 60 }, (_, i) => ({
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

// Generate level bricks
const generateBricks = (level: number): Brick[] => {
  const bricks: Brick[] = []
  let id = 0

  // Different patterns per level
  const pattern = level % 5

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const x = BRICK_LEFT_OFFSET + col * (BRICK_WIDTH + BRICK_GAP)
      const y = BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_GAP)
      
      // Skip some bricks based on pattern
      let skip = false
      switch (pattern) {
        case 1: // Checkerboard
          skip = (row + col) % 2 === 0
          break
        case 2: // Diamond
          skip = Math.abs(col - 4.5) + Math.abs(row - 2.5) > 4
          break
        case 3: // Stripes
          skip = col % 3 === 0
          break
        case 4: // Pyramid
          skip = col < row || col >= BRICK_COLS - row
          break
      }
      
      if (skip) continue

      // Determine brick type
      let type: Brick['type'] = 'normal'
      let maxHits = 1
      
      // Add strong bricks at higher levels
      if (level >= 3 && row <= 1 && Math.random() < 0.3 + level * 0.05) {
        type = 'strong'
        maxHits = 2
      }
      
      // Add indestructible bricks at higher levels
      if (level >= 5 && row === 0 && col === 4 || col === 5) {
        type = 'indestructible'
        maxHits = 999
      }
      
      // Add explosive bricks at higher levels
      if (level >= 4 && Math.random() < 0.1) {
        type = 'explosive'
        maxHits = 1
      }

      const colorIndex = Math.min(row, BRICK_COLORS.length - 1)
      const baseColor = BRICK_COLORS[colorIndex]
      
      bricks.push({
        id: id++,
        x,
        y,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: type === 'strong' ? '#888888' : type === 'indestructible' ? '#444444' : type === 'explosive' ? '#ff4444' : baseColor.color,
        points: type === 'strong' ? baseColor.points * 2 : type === 'explosive' ? baseColor.points * 3 : baseColor.points,
        hits: 0,
        maxHits,
        type,
      })
    }
  }

  return bricks
}

// Main game component
export default function BreakoutGame() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2)
  const [paddleWidth, setPaddleWidth] = useState(PADDLE_WIDTH)
  const [balls, setBalls] = useState<Ball[]>([])
  const [bricks, setBricks] = useState<Brick[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [activePowerUps, setActivePowerUps] = useState<Map<PowerUpType, number>>(new Map())
  const [lasers, setLasers] = useState<Laser[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHighScores, setShowHighScores] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [scale, setScale] = useState(1)

  const containerRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const paddleRef = useRef(paddleX)
  const paddleWidthRef = useRef(paddleWidth)
  const ballsRef = useRef(balls)
  const bricksRef = useRef(bricks)
  const powerUpsRef = useRef(powerUps)
  const lasersRef = useRef(lasers)
  const activePowerUpsRef = useRef(activePowerUps)
  const scoreRef = useRef(score)
  const livesRef = useRef(lives)
  const levelRef = useRef(level)
  const gameStateRef = useRef(gameState)

  // Keep refs in sync
  useEffect(() => { paddleRef.current = paddleX }, [paddleX])
  useEffect(() => { paddleWidthRef.current = paddleWidth }, [paddleWidth])
  useEffect(() => { ballsRef.current = balls }, [balls])
  useEffect(() => { bricksRef.current = bricks }, [bricks])
  useEffect(() => { powerUpsRef.current = powerUps }, [powerUps])
  useEffect(() => { lasersRef.current = lasers }, [lasers])
  useEffect(() => { activePowerUpsRef.current = activePowerUps }, [activePowerUps])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { livesRef.current = lives }, [lives])
  useEffect(() => { levelRef.current = level }, [level])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  // Calculate scale based on container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32
        const newScale = Math.min(1, containerWidth / CANVAS_WIDTH)
        setScale(newScale)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('breakout-high-scores')
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

  // Check for active power-ups
  const hasPowerUp = useCallback((type: PowerUpType): boolean => {
    const expiry = activePowerUpsRef.current.get(type)
    return expiry !== undefined && expiry > Date.now()
  }, [])

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 12) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random() * 1000,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color,
      life: 1,
      size: 3 + Math.random() * 5,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 150)
  }, [])

  // Save high score
  const saveHighScore = useCallback((newScore: number, reachedLevel: number) => {
    const newEntry: HighScoreEntry = {
      score: newScore,
      date: new Date().toISOString(),
      level: reachedLevel,
    }

    const newScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    setHighScores(newScores)
    setHighScore(Math.max(newScore, highScore))
    localStorage.setItem('breakout-high-scores', JSON.stringify(newScores))

    if (newScore > highScore) {
      setIsNewHighScore(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [highScores, highScore])

  // Create initial ball
  const createInitialBall = useCallback((paddle: number, pWidth: number): Ball => ({
    id: Date.now(),
    x: paddle + pWidth / 2,
    y: CANVAS_HEIGHT - 50,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    stuck: true,
  }), [])

  // Launch ball
  const launchBall = useCallback(() => {
    setBalls((prev) => 
      prev.map((ball) => {
        if (ball.stuck) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4
          const speed = BALL_SPEED + levelRef.current * 0.3
          return {
            ...ball,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            stuck: false,
          }
        }
        return ball
      })
    )
  }, [])

  // Apply power-up
  const applyPowerUp = useCallback((type: PowerUpType) => {
    const def = POWER_UP_DEFS[type]
    
    switch (type) {
      case 'expand':
        setPaddleWidth(PADDLE_WIDTH * 1.5)
        if (def.duration) {
          setActivePowerUps((prev) => new Map(prev).set(type, Date.now() + def.duration))
        }
        break
      case 'shrink':
        setPaddleWidth(PADDLE_WIDTH * 0.6)
        if (def.duration) {
          setActivePowerUps((prev) => new Map(prev).set(type, Date.now() + def.duration))
        }
        break
      case 'multiball':
        setBalls((prev) => {
          if (prev.length >= 8) return prev
          const newBalls: Ball[] = []
          prev.forEach((ball) => {
            if (!ball.stuck) {
              // Create 2 additional balls
              for (let i = 0; i < 2; i++) {
                const angle = Math.atan2(ball.vy, ball.vx) + (i === 0 ? Math.PI / 6 : -Math.PI / 6)
                const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
                newBalls.push({
                  id: Date.now() + i + Math.random() * 1000,
                  x: ball.x,
                  y: ball.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  radius: BALL_RADIUS,
                  stuck: false,
                })
              }
            }
          })
          return [...prev, ...newBalls]
        })
        break
      case 'slow':
        setBalls((prev) => prev.map((ball) => ({
          ...ball,
          vx: ball.vx * 0.6,
          vy: ball.vy * 0.6,
        })))
        if (def.duration) {
          setActivePowerUps((prev) => new Map(prev).set(type, Date.now() + def.duration))
        }
        break
      case 'fast':
        setBalls((prev) => prev.map((ball) => ({
          ...ball,
          vx: ball.vx * 1.4,
          vy: ball.vy * 1.4,
        })))
        if (def.duration) {
          setActivePowerUps((prev) => new Map(prev).set(type, Date.now() + def.duration))
        }
        break
      case 'laser':
        if (def.duration) {
          setActivePowerUps((prev) => new Map(prev).set(type, Date.now() + def.duration))
        }
        break
      case 'sticky':
        if (def.duration) {
          setActivePowerUps((prev) => new Map(prev).set(type, Date.now() + def.duration))
        }
        break
      case 'life':
        setLives((prev) => prev + 1)
        break
    }

    if (soundEnabled) playSound('powerup')
  }, [soundEnabled])

  // Spawn power-up from brick
  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > 0.25) return // 25% chance to spawn

    const types: PowerUpType[] = ['expand', 'multiball', 'slow', 'laser', 'sticky', 'life']
    // Add some bad power-ups
    if (Math.random() < 0.2) {
      types.push('shrink', 'fast')
    }
    
    const type = types[Math.floor(Math.random() * types.length)]
    const def = POWER_UP_DEFS[type]

    setPowerUps((prev) => [...prev, {
      id: Date.now() + Math.random() * 1000,
      x,
      y,
      type,
      emoji: def.emoji,
      color: def.color,
      vy: 2,
    }])
  }, [])

  // Fire laser
  const fireLaser = useCallback(() => {
    if (!hasPowerUp('laser')) return

    const paddle = paddleRef.current
    const pWidth = paddleWidthRef.current

    setLasers((prev) => [
      ...prev,
      { id: Date.now(), x: paddle + 10, y: CANVAS_HEIGHT - 35 },
      { id: Date.now() + 1, x: paddle + pWidth - 10, y: CANVAS_HEIGHT - 35 },
    ])

    if (soundEnabled) playSound('laser')
  }, [hasPowerUp, soundEnabled])

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return
    }

    const deltaTime = timestamp - lastTimeRef.current
    if (deltaTime < 16) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return
    }
    lastTimeRef.current = timestamp

    const now = Date.now()

    // Clean expired power-ups
    setActivePowerUps((prev) => {
      const newMap = new Map(prev)
      let changed = false
      prev.forEach((expiry, type) => {
        if (expiry <= now) {
          newMap.delete(type)
          changed = true
          // Reset paddle width if expand/shrink expired
          if (type === 'expand' || type === 'shrink') {
            setPaddleWidth(PADDLE_WIDTH)
          }
        }
      })
      return changed ? newMap : prev
    })

    // Update balls
    setBalls((prevBalls) => {
      const paddle = paddleRef.current
      const pWidth = paddleWidthRef.current
      const currentBricks = bricksRef.current
      let bricksToRemove: number[] = []
      let explosionBricks: Brick[] = []
      let pointsEarned = 0

      const newBalls = prevBalls.map((ball) => {
        if (ball.stuck) {
          return { ...ball, x: paddle + pWidth / 2 }
        }

        let { x, y, vx, vy } = ball

        // Move ball
        x += vx
        y += vy

        // Wall collisions
        if (x - ball.radius <= 0) {
          x = ball.radius
          vx = Math.abs(vx)
          if (soundEnabled) playSound('wall')
        }
        if (x + ball.radius >= CANVAS_WIDTH) {
          x = CANVAS_WIDTH - ball.radius
          vx = -Math.abs(vx)
          if (soundEnabled) playSound('wall')
        }
        if (y - ball.radius <= 0) {
          y = ball.radius
          vy = Math.abs(vy)
          if (soundEnabled) playSound('wall')
        }

        // Paddle collision
        const paddleY = CANVAS_HEIGHT - 30
        if (
          y + ball.radius >= paddleY &&
          y + ball.radius <= paddleY + PADDLE_HEIGHT &&
          x >= paddle &&
          x <= paddle + pWidth &&
          vy > 0
        ) {
          // Calculate bounce angle based on hit position
          const hitPos = (x - paddle) / pWidth // 0 to 1
          const angle = -Math.PI / 2 + (hitPos - 0.5) * Math.PI * 0.8 // -90° ± 72°
          const speed = Math.sqrt(vx * vx + vy * vy)
          vx = Math.cos(angle) * speed
          vy = Math.sin(angle) * speed

          // Ensure ball goes up
          if (vy > 0) vy = -vy

          y = paddleY - ball.radius

          if (soundEnabled) playSound('paddle')
          spawnParticles(x, y, COLORS.paddle, 5)

          // Sticky paddle
          if (hasPowerUp('sticky')) {
            return { ...ball, x, y, vx: 0, vy: 0, stuck: true }
          }
        }

        // Brick collisions
        currentBricks.forEach((brick) => {
          if (brick.type === 'indestructible' && brick.hits >= 1) return
          if (bricksToRemove.includes(brick.id)) return

          // Check collision
          const closestX = Math.max(brick.x, Math.min(x, brick.x + brick.width))
          const closestY = Math.max(brick.y, Math.min(y, brick.y + brick.height))
          const distX = x - closestX
          const distY = y - closestY
          const distance = Math.sqrt(distX * distX + distY * distY)

          if (distance < ball.radius) {
            // Determine collision side
            const overlapX = ball.radius - Math.abs(distX)
            const overlapY = ball.radius - Math.abs(distY)

            if (overlapX < overlapY) {
              vx = -vx
              x += distX > 0 ? overlapX : -overlapX
            } else {
              vy = -vy
              y += distY > 0 ? overlapY : -overlapY
            }

            // Handle brick hit
            if (brick.type !== 'indestructible') {
              brick.hits++
              if (brick.hits >= brick.maxHits) {
                bricksToRemove.push(brick.id)
                pointsEarned += brick.points * levelRef.current
                spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2)
                spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 15)

                if (brick.type === 'explosive') {
                  explosionBricks.push(brick)
                  triggerShake()
                  if (soundEnabled) playSound('explosion')
                } else {
                  if (soundEnabled) playSound('brick')
                }
              } else {
                if (soundEnabled) playSound('brick')
              }
            } else {
              brick.hits = 1
              if (soundEnabled) playSound('wall')
            }
          }
        })

        return { ...ball, x, y, vx, vy }
      })

      // Handle explosive bricks (destroy adjacent)
      explosionBricks.forEach((expBrick) => {
        currentBricks.forEach((brick) => {
          if (bricksToRemove.includes(brick.id)) return
          if (brick.type === 'indestructible') return
          
          const dx = Math.abs((brick.x + brick.width / 2) - (expBrick.x + expBrick.width / 2))
          const dy = Math.abs((brick.y + brick.height / 2) - (expBrick.y + expBrick.height / 2))
          
          if (dx <= BRICK_WIDTH + BRICK_GAP && dy <= BRICK_HEIGHT + BRICK_GAP) {
            bricksToRemove.push(brick.id)
            pointsEarned += brick.points * levelRef.current
            spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 10)
          }
        })
      })

      // Update bricks
      if (bricksToRemove.length > 0) {
        setBricks((prev) => prev.filter((b) => !bricksToRemove.includes(b.id)))
      }

      // Update score
      if (pointsEarned > 0) {
        setScore((prev) => prev + pointsEarned)
      }

      // Check for ball lost
      const survivingBalls = newBalls.filter((ball) => ball.y - ball.radius < CANVAS_HEIGHT)
      
      if (survivingBalls.length === 0 && newBalls.length > 0 && !newBalls.some((b) => b.stuck)) {
        // Lost all balls
        const newLives = livesRef.current - 1
        setLives(newLives)
        
        if (newLives <= 0) {
          setGameState('gameover')
          saveHighScore(scoreRef.current, levelRef.current)
          if (soundEnabled) playSound('die')
          return []
        } else {
          if (soundEnabled) playSound('die')
          // Reset with new ball
          return [createInitialBall(paddle, pWidth)]
        }
      }

      return survivingBalls.length > 0 ? survivingBalls : newBalls
    })

    // Update power-ups
    setPowerUps((prev) => {
      const paddle = paddleRef.current
      const pWidth = paddleWidthRef.current
      const paddleY = CANVAS_HEIGHT - 30

      return prev.filter((powerUp) => {
        // Move power-up
        powerUp.y += powerUp.vy

        // Check paddle collision
        if (
          powerUp.y >= paddleY &&
          powerUp.y <= paddleY + PADDLE_HEIGHT + 20 &&
          powerUp.x >= paddle - 10 &&
          powerUp.x <= paddle + pWidth + 10
        ) {
          applyPowerUp(powerUp.type)
          spawnParticles(powerUp.x, powerUp.y, powerUp.color, 10)
          return false
        }

        // Remove if off screen
        return powerUp.y < CANVAS_HEIGHT + 30
      })
    })

    // Update lasers
    setLasers((prev) => {
      const currentBricks = bricksRef.current
      let bricksToRemove: number[] = []
      let pointsEarned = 0

      const newLasers = prev.filter((laser) => {
        laser.y -= 8

        // Check brick collision
        for (const brick of currentBricks) {
          if (bricksToRemove.includes(brick.id)) continue
          if (brick.type === 'indestructible') continue

          if (
            laser.x >= brick.x &&
            laser.x <= brick.x + brick.width &&
            laser.y >= brick.y &&
            laser.y <= brick.y + brick.height
          ) {
            brick.hits++
            if (brick.hits >= brick.maxHits) {
              bricksToRemove.push(brick.id)
              pointsEarned += brick.points * levelRef.current
              spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 10)
              if (soundEnabled) playSound('brick')
            }
            return false
          }
        }

        return laser.y > 0
      })

      if (bricksToRemove.length > 0) {
        setBricks((prev) => prev.filter((b) => !bricksToRemove.includes(b.id)))
      }
      if (pointsEarned > 0) {
        setScore((prev) => prev + pointsEarned)
      }

      return newLasers
    })

    // Update particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 0.025,
        }))
        .filter((p) => p.life > 0)
    )

    // Check level complete
    const remainingBricks = bricksRef.current.filter((b) => b.type !== 'indestructible')
    if (remainingBricks.length === 0) {
      if (levelRef.current >= MAX_LEVEL) {
        setGameState('victory')
        saveHighScore(scoreRef.current, levelRef.current)
        setShowConfetti(true)
        if (soundEnabled) playSound('levelup')
      } else {
        setGameState('levelComplete')
        if (soundEnabled) playSound('levelup')
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [soundEnabled, spawnParticles, spawnPowerUp, applyPowerUp, hasPowerUp, createInitialBall, saveHighScore, triggerShake])

  // Start/stop game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameLoop])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle') {
        startGame()
        return
      }

      if (gameState === 'gameover' || gameState === 'victory') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame()
        }
        return
      }

      if (gameState === 'levelComplete') {
        if (e.key === ' ' || e.key === 'Enter') {
          nextLevel()
        }
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        if (balls.some((b) => b.stuck)) {
          launchBall()
        } else if (hasPowerUp('laser')) {
          fireLaser()
        }
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev))
      }

      // Paddle movement
      const speed = 25
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPaddleX((prev) => Math.max(0, prev - speed))
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPaddleX((prev) => Math.min(CANVAS_WIDTH - paddleWidth, prev + speed))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, balls, paddleWidth, launchBall, fireLaser, hasPowerUp])

  // Handle mouse/touch movement
  const handlePointerMove = useCallback((clientX: number) => {
    if (containerRef.current && gameState === 'playing') {
      const rect = containerRef.current.getBoundingClientRect()
      const x = (clientX - rect.left) / scale - paddleWidth / 2
      setPaddleX(Math.max(0, Math.min(CANVAS_WIDTH - paddleWidth, x)))
    }
  }, [gameState, paddleWidth, scale])

  const handleClick = useCallback(() => {
    if (gameState === 'idle') {
      startGame()
    } else if (gameState === 'playing') {
      if (balls.some((b) => b.stuck)) {
        launchBall()
      } else if (hasPowerUp('laser')) {
        fireLaser()
      }
    } else if (gameState === 'levelComplete') {
      nextLevel()
    } else if (gameState === 'gameover' || gameState === 'victory') {
      startGame()
    }
  }, [gameState, balls, launchBall, fireLaser, hasPowerUp])

  // Start new game
  const startGame = useCallback(() => {
    const newPaddle = (CANVAS_WIDTH - PADDLE_WIDTH) / 2
    setPaddleX(newPaddle)
    setPaddleWidth(PADDLE_WIDTH)
    setScore(0)
    setLevel(1)
    setLives(INITIAL_LIVES)
    setBricks(generateBricks(1))
    setBalls([createInitialBall(newPaddle, PADDLE_WIDTH)])
    setPowerUps([])
    setActivePowerUps(new Map())
    setLasers([])
    setParticles([])
    setGameState('playing')
    setShowConfetti(false)
    setIsNewHighScore(false)
  }, [createInitialBall])

  // Next level
  const nextLevel = useCallback(() => {
    const newLevel = level + 1
    setLevel(newLevel)
    const newPaddle = (CANVAS_WIDTH - PADDLE_WIDTH) / 2
    setPaddleX(newPaddle)
    setPaddleWidth(PADDLE_WIDTH)
    setBricks(generateBricks(newLevel))
    setBalls([createInitialBall(newPaddle, PADDLE_WIDTH)])
    setPowerUps([])
    setActivePowerUps(new Map())
    setLasers([])
    setGameState('playing')
  }, [level, createInitialBall])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get active power-up display
  const activePowerUpsList = Array.from(activePowerUps.entries())
    .filter(([, expiry]) => expiry > Date.now())
    .map(([type]) => ({ type, ...POWER_UP_DEFS[type] }))

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
        className="text-4xl md:text-5xl font-black mb-2 mt-16 text-center font-mono tracking-wider"
        style={{
          color: COLORS.text,
          textShadow: `0 0 20px ${COLORS.paddle}, 0 0 40px ${COLORS.paddle}60`,
        }}
      >
        🧱 BREAKOUT
      </h1>

      {/* Active Power-ups */}
      {activePowerUpsList.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {activePowerUpsList.map((p) => {
            const expiry = activePowerUps.get(p.type)
            const remaining = expiry ? Math.ceil((expiry - Date.now()) / 1000) : 0
            return (
              <div
                key={p.type}
                className="px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse"
                style={{
                  backgroundColor: p.color + '30',
                  color: p.color,
                  border: `1px solid ${p.color}`,
                }}
              >
                {p.emoji} {remaining > 0 ? `${remaining}s` : '∞'}
              </div>
            )
          })}
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-3 justify-center text-sm">
        <div
          className="px-4 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.text,
            borderColor: COLORS.paddle + '40',
          }}
        >
          🎯 {score.toLocaleString()}
        </div>
        <div
          className="px-4 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: '#ffd700',
            borderColor: '#ffd70040',
          }}
        >
          🏆 {highScore.toLocaleString()}
        </div>
        <div
          className="px-4 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.neonOrange,
            borderColor: COLORS.neonOrange + '40',
          }}
        >
          📊 Level {level}
        </div>
        <div
          className="px-4 py-1 rounded-full font-bold font-mono shadow-lg border flex items-center gap-1"
          style={{
            backgroundColor: '#111',
            color: COLORS.neonRed,
            borderColor: COLORS.neonRed + '40',
          }}
        >
          {Array.from({ length: lives }, (_, i) => (
            <span key={i}>❤️</span>
          ))}
        </div>
      </div>

      {/* Game Canvas */}
      <div
        className={`relative rounded-lg overflow-hidden shadow-2xl ${screenShake ? 'animate-shake' : ''}`}
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          backgroundColor: '#0d0d15',
          border: `3px solid ${COLORS.paddle}40`,
          boxShadow: `0 0 40px ${COLORS.paddle}20, inset 0 0 60px rgba(0,0,0,0.8)`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onClick={handleClick}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(${COLORS.paddle}20 1px, transparent 1px),
              linear-gradient(90deg, ${COLORS.paddle}20 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Particles */}
        <ParticleSystem particles={particles} />

        {/* Bricks */}
        {bricks.map((brick) => {
          const colorDef = BRICK_COLORS.find((c) => c.color === brick.color)
          const damaged = brick.hits > 0 && brick.type === 'strong'
          
          return (
            <div
              key={brick.id}
              className="absolute transition-all duration-75"
              style={{
                left: brick.x,
                top: brick.y,
                width: brick.width,
                height: brick.height,
                backgroundColor: damaged ? brick.color + '80' : brick.color,
                borderRadius: 3,
                boxShadow: brick.type === 'indestructible'
                  ? 'inset 0 0 10px rgba(255,255,255,0.1)'
                  : brick.type === 'explosive'
                    ? `0 0 10px ${brick.color}, 0 0 20px ${brick.color}60`
                    : `0 0 8px ${colorDef?.glow || brick.color}60`,
                border: brick.type === 'indestructible' ? '2px solid #666' : 'none',
                opacity: damaged ? 0.7 : 1,
              }}
            >
              {brick.type === 'explosive' && (
                <span className="absolute inset-0 flex items-center justify-center text-xs">💥</span>
              )}
              {brick.type === 'strong' && !damaged && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              )}
            </div>
          )
        })}

        {/* Power-ups */}
        {powerUps.map((powerUp) => (
          <div
            key={powerUp.id}
            className="absolute animate-bounce"
            style={{
              left: powerUp.x - 12,
              top: powerUp.y - 12,
              width: 24,
              height: 24,
              backgroundColor: powerUp.color + '30',
              borderRadius: '50%',
              boxShadow: `0 0 15px ${powerUp.color}, 0 0 30px ${powerUp.color}40`,
              border: `2px solid ${powerUp.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            {powerUp.emoji}
          </div>
        ))}

        {/* Lasers */}
        {lasers.map((laser) => (
          <div
            key={laser.id}
            className="absolute"
            style={{
              left: laser.x - 2,
              top: laser.y,
              width: 4,
              height: 15,
              backgroundColor: COLORS.neonOrange,
              borderRadius: 2,
              boxShadow: `0 0 10px ${COLORS.neonOrange}, 0 0 20px ${COLORS.neonOrange}`,
            }}
          />
        ))}

        {/* Balls */}
        {balls.map((ball) => (
          <div
            key={ball.id}
            className="absolute rounded-full"
            style={{
              left: ball.x - ball.radius,
              top: ball.y - ball.radius,
              width: ball.radius * 2,
              height: ball.radius * 2,
              backgroundColor: COLORS.ball,
              boxShadow: `0 0 10px ${COLORS.ballGlow}, 0 0 20px ${COLORS.ballGlow}60, inset 0 -2px 4px rgba(0,0,0,0.3)`,
            }}
          />
        ))}

        {/* Paddle */}
        <div
          className="absolute rounded-full"
          style={{
            left: paddleX,
            top: CANVAS_HEIGHT - 30,
            width: paddleWidth,
            height: PADDLE_HEIGHT,
            backgroundColor: COLORS.paddle,
            boxShadow: `0 0 15px ${COLORS.paddleGlow}, 0 0 30px ${COLORS.paddle}60`,
            transition: 'width 0.2s ease-out',
          }}
        >
          {/* Laser cannons */}
          {hasPowerUp('laser') && (
            <>
              <div
                className="absolute bg-orange-500 rounded-full animate-pulse"
                style={{
                  left: 5,
                  top: -6,
                  width: 8,
                  height: 8,
                  boxShadow: `0 0 8px ${COLORS.neonOrange}`,
                }}
              />
              <div
                className="absolute bg-orange-500 rounded-full animate-pulse"
                style={{
                  right: 5,
                  top: -6,
                  width: 8,
                  height: 8,
                  boxShadow: `0 0 8px ${COLORS.neonOrange}`,
                }}
              />
            </>
          )}
          {/* Sticky indicator */}
          {hasPowerUp('sticky') && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: COLORS.neonPink + '40',
                boxShadow: `0 0 20px ${COLORS.neonPink}`,
              }}
            />
          )}
        </div>

        {/* Idle Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-6xl mb-4 animate-bounce">🧱</div>
            <h2
              className="text-2xl font-black mb-4 font-mono"
              style={{ color: COLORS.text, textShadow: `0 0 15px ${COLORS.paddle}` }}
            >
              BREAKOUT
            </h2>
            <p className="text-gray-400 mb-6 text-center text-sm max-w-xs">
              Break all the bricks! Catch power-ups to gain abilities.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.paddle,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.paddle}, 0 0 60px ${COLORS.paddle}60`,
              }}
            >
              START GAME
            </button>
            <p className="text-gray-500 mt-4 text-xs font-mono">Click or press SPACE</p>

            {/* Power-up legend */}
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>↔️ Expand</span>
              <span>⚪ Multi-Ball</span>
              <span>🔫 Laser</span>
              <span>🧲 Sticky</span>
              <span>❤️ Extra Life</span>
              <span>🐌 Slow</span>
            </div>
          </div>
        )}

        {/* Paused */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-2xl font-bold font-mono animate-pulse" style={{ color: COLORS.text }}>
              PAUSED
            </p>
            <p className="text-gray-400 mt-2 text-sm font-mono">Press P to continue</p>
          </div>
        )}

        {/* Level Complete */}
        {gameState === 'levelComplete' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{ color: COLORS.neonYellow, textShadow: `0 0 20px ${COLORS.neonYellow}` }}
            >
              LEVEL {level} COMPLETE!
            </h2>
            <p className="text-gray-400 mb-4">Score: {score.toLocaleString()}</p>
            <button
              onClick={nextLevel}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.paddle,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.paddle}`,
              }}
            >
              NEXT LEVEL →
            </button>
          </div>
        )}
      </div>

      {/* Mobile touch area indicator */}
      <p className="text-gray-600 text-xs mt-2 font-mono md:hidden">
        Slide finger to move • Tap to launch/shoot
      </p>

      {/* High scores button */}
      <button
        onClick={() => setShowHighScores(true)}
        className="mt-4 px-6 py-2 rounded-full font-bold font-mono transition-all hover:scale-105"
        style={{
          backgroundColor: '#222',
          color: '#ffd700',
          border: '2px solid #ffd70040',
        }}
      >
        🏆 High Scores
      </button>

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2"
            style={{
              backgroundColor: '#111',
              borderColor: isNewHighScore ? '#ffd700' : COLORS.neonRed,
            }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💔'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: isNewHighScore ? '#ffd700' : COLORS.neonRed,
                textShadow: `0 0 20px ${isNewHighScore ? '#ffd700' : COLORS.neonRed}`,
              }}
            >
              {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}
            </h2>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.text }}>
                  {score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-yellow-400">
                  {highScore.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Best</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.neonOrange }}>
                  {level}
                </div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: COLORS.paddle,
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

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2"
            style={{
              backgroundColor: '#111',
              borderColor: '#ffd700',
            }}
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: '#ffd700',
                textShadow: '0 0 20px #ffd700',
              }}
            >
              VICTORY!
            </h2>
            <p className="text-gray-400 mb-4">You completed all {MAX_LEVEL} levels!</p>
            <div className="text-4xl font-bold font-mono mb-6" style={{ color: COLORS.text }}>
              {score.toLocaleString()} pts
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: COLORS.paddle,
                  color: '#000',
                }}
              >
                🎮 Play Again
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
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Level {entry.level}
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
                localStorage.removeItem('breakout-high-scores')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all font-mono"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

      {/* Controls info */}
      <div className="mt-4 max-w-md text-center text-gray-600 text-xs font-mono">
        <p>← → or mouse to move • SPACE to launch/shoot • P to pause</p>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out;
        }
      `}</style>
    </div>
  )
}
