'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'playing' | 'paused' | 'gameover'

interface Vector {
  x: number
  y: number
}

interface Ship {
  position: Vector
  velocity: Vector
  rotation: number // degrees
  thrusting: boolean
}

interface Bullet {
  id: number
  position: Vector
  velocity: Vector
  life: number
}

interface Asteroid {
  id: number
  position: Vector
  velocity: Vector
  size: 'large' | 'medium' | 'small'
  rotation: number
  rotationSpeed: number
  vertices: number[] // angles for irregular shape
}

interface Particle {
  id: number
  position: Vector
  velocity: Vector
  life: number
  color: string
  size: number
}

interface HighScoreEntry {
  score: number
  date: string
  level: number
}

// Game constants
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 600
const SHIP_SIZE = 20
const SHIP_THRUST = 0.15
const SHIP_FRICTION = 0.99
const SHIP_ROTATION_SPEED = 5
const BULLET_SPEED = 8
const BULLET_LIFE = 60
const MAX_BULLETS = 8
const ASTEROID_SPEEDS = { large: 1, medium: 1.5, small: 2.5 }
const ASTEROID_SIZES = { large: 40, medium: 25, small: 12 }
const ASTEROID_POINTS = { large: 20, medium: 50, small: 100 }
const INITIAL_ASTEROIDS = 4
const INVINCIBILITY_TIME = 180 // frames

// Neon colors
const COLORS = {
  background: '#0a0a0f',
  ship: '#00ffcc',
  shipThrust: '#ff6600',
  bullet: '#ffff00',
  asteroid: '#ff0066',
  asteroidGlow: '#ff4488',
  text: '#00ff88',
  neonBlue: '#00ccff',
  neonPink: '#ff00aa',
  neonPurple: '#aa00ff',
}

// Sound effects
const playSound = (type: 'shoot' | 'thrust' | 'explosion' | 'die' | 'levelup') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'shoot':
        osc.type = 'square'
        osc.frequency.value = 600
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(200, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'thrust':
        osc.type = 'sawtooth'
        osc.frequency.value = 60
        gain.gain.value = 0.05
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(40, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'explosion':
        osc.type = 'sawtooth'
        osc.frequency.value = 100
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(20, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'die':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.25
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(30, audio.currentTime + 0.6)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.6)
        osc.stop(audio.currentTime + 0.6)
        break
      case 'levelup':
        osc.type = 'sine'
        osc.frequency.value = 440
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.15)
        osc.frequency.exponentialRampToValueAtTime(1320, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
    }
  } catch {
    // Audio not supported
  }
}

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

// Helper functions
const degToRad = (deg: number) => (deg * Math.PI) / 180
const radToDeg = (rad: number) => (rad * 180) / Math.PI

const wrapPosition = (pos: Vector, width: number, height: number): Vector => {
  let x = pos.x
  let y = pos.y
  if (x < 0) x = width
  if (x > width) x = 0
  if (y < 0) y = height
  if (y > height) y = 0
  return { x, y }
}

const distance = (a: Vector, b: Vector): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

const generateAsteroidVertices = (): number[] => {
  const vertices: number[] = []
  const numVertices = 8 + Math.floor(Math.random() * 5)
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * 360
    const variance = 0.6 + Math.random() * 0.4
    vertices.push(angle, variance)
  }
  return vertices
}

const createAsteroid = (
  id: number,
  position: Vector,
  size: 'large' | 'medium' | 'small',
  excludeCenter: boolean = false
): Asteroid => {
  let pos = position
  
  // If excluding center, make sure asteroid spawns away from center
  if (excludeCenter) {
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    const minDist = 150
    
    let attempts = 0
    while (distance(pos, { x: centerX, y: centerY }) < minDist && attempts < 20) {
      pos = {
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
      }
      attempts++
    }
  }
  
  const angle = Math.random() * Math.PI * 2
  const speed = ASTEROID_SPEEDS[size] * (0.5 + Math.random() * 0.5)
  
  return {
    id,
    position: pos,
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    size,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 3,
    vertices: generateAsteroidVertices(),
  }
}

// Main game component
export default function AsteroidsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [scale, setScale] = useState(1)
  
  // Game state refs
  const shipRef = useRef<Ship>({
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    rotation: -90,
    thrusting: false,
  })
  const bulletsRef = useRef<Bullet[]>([])
  const asteroidsRef = useRef<Asteroid[]>([])
  const particlesRef = useRef<Particle[]>([])
  const keysRef = useRef<Set<string>>(new Set())
  const bulletIdRef = useRef(0)
  const asteroidIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const invincibilityRef = useRef(0)
  const gameLoopRef = useRef<number | null>(null)
  const thrustSoundRef = useRef(0)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const livesRef = useRef(3)

  // Scale canvas based on container
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
    const saved = localStorage.getItem('asteroids-high-scores')
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
  const saveHighScore = useCallback(
    (newScore: number, currentLevel: number) => {
      const newEntry: HighScoreEntry = {
        score: newScore,
        date: new Date().toISOString(),
        level: currentLevel,
      }

      const newScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
      setHighScores(newScores)
      setHighScore(Math.max(newScore, highScore))
      localStorage.setItem('asteroids-high-scores', JSON.stringify(newScores))

      if (newScore > highScore) {
        setIsNewHighScore(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    },
    [highScores, highScore]
  )

  // Spawn particles
  const spawnParticles = useCallback((position: Vector, color: string, count: number = 10, spread: number = 3) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        position: { ...position },
        velocity: {
          x: (Math.random() - 0.5) * spread * 2,
          y: (Math.random() - 0.5) * spread * 2,
        },
        life: 30 + Math.random() * 30,
        color,
        size: 2 + Math.random() * 3,
      })
    }
    particlesRef.current = [...particlesRef.current, ...newParticles]
  }, [])

  // Shoot bullet
  const shoot = useCallback(() => {
    if (bulletsRef.current.length >= MAX_BULLETS) return
    
    const ship = shipRef.current
    const angle = degToRad(ship.rotation)
    const bullet: Bullet = {
      id: bulletIdRef.current++,
      position: {
        x: ship.position.x + Math.cos(angle) * SHIP_SIZE,
        y: ship.position.y + Math.sin(angle) * SHIP_SIZE,
      },
      velocity: {
        x: Math.cos(angle) * BULLET_SPEED + ship.velocity.x * 0.5,
        y: Math.sin(angle) * BULLET_SPEED + ship.velocity.y * 0.5,
      },
      life: BULLET_LIFE,
    }
    bulletsRef.current = [...bulletsRef.current, bullet]
    if (soundEnabled) playSound('shoot')
  }, [soundEnabled])

  // Split asteroid
  const splitAsteroid = useCallback((asteroid: Asteroid) => {
    const newAsteroids: Asteroid[] = []
    
    if (asteroid.size === 'large') {
      for (let i = 0; i < 2; i++) {
        newAsteroids.push(createAsteroid(asteroidIdRef.current++, { ...asteroid.position }, 'medium'))
      }
    } else if (asteroid.size === 'medium') {
      for (let i = 0; i < 2; i++) {
        newAsteroids.push(createAsteroid(asteroidIdRef.current++, { ...asteroid.position }, 'small'))
      }
    }
    
    return newAsteroids
  }, [])

  // Initialize level
  const initLevel = useCallback((lvl: number) => {
    asteroidsRef.current = []
    const numAsteroids = INITIAL_ASTEROIDS + Math.floor(lvl / 2)
    
    for (let i = 0; i < numAsteroids; i++) {
      const asteroid = createAsteroid(
        asteroidIdRef.current++,
        { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT },
        'large',
        true
      )
      asteroidsRef.current.push(asteroid)
    }
  }, [])

  // Reset ship
  const resetShip = useCallback(() => {
    shipRef.current = {
      position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      velocity: { x: 0, y: 0 },
      rotation: -90,
      thrusting: false,
    }
    invincibilityRef.current = INVINCIBILITY_TIME
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setLives(3)
    livesRef.current = 3
    setLevel(1)
    levelRef.current = 1
    setIsNewHighScore(false)
    bulletsRef.current = []
    particlesRef.current = []
    resetShip()
    initLevel(1)
    setGameState('playing')
  }, [initLevel, resetShip])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = () => {
      const ship = shipRef.current
      const keys = keysRef.current

      // Handle input
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        ship.rotation -= SHIP_ROTATION_SPEED
      }
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        ship.rotation += SHIP_ROTATION_SPEED
      }
      if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
        const angle = degToRad(ship.rotation)
        ship.velocity.x += Math.cos(angle) * SHIP_THRUST
        ship.velocity.y += Math.sin(angle) * SHIP_THRUST
        ship.thrusting = true
        
        // Thrust sound
        thrustSoundRef.current++
        if (soundEnabled && thrustSoundRef.current % 10 === 0) {
          playSound('thrust')
        }
        
        // Thrust particles
        if (Math.random() > 0.5) {
          const backAngle = angle + Math.PI
          spawnParticles(
            {
              x: ship.position.x + Math.cos(backAngle) * SHIP_SIZE * 0.6,
              y: ship.position.y + Math.sin(backAngle) * SHIP_SIZE * 0.6,
            },
            COLORS.shipThrust,
            2,
            1
          )
        }
      } else {
        ship.thrusting = false
      }

      // Update ship
      ship.velocity.x *= SHIP_FRICTION
      ship.velocity.y *= SHIP_FRICTION
      ship.position.x += ship.velocity.x
      ship.position.y += ship.velocity.y
      ship.position = wrapPosition(ship.position, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Update invincibility
      if (invincibilityRef.current > 0) {
        invincibilityRef.current--
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current
        .map((bullet) => ({
          ...bullet,
          position: wrapPosition(
            {
              x: bullet.position.x + bullet.velocity.x,
              y: bullet.position.y + bullet.velocity.y,
            },
            CANVAS_WIDTH,
            CANVAS_HEIGHT
          ),
          life: bullet.life - 1,
        }))
        .filter((bullet) => bullet.life > 0)

      // Update asteroids
      asteroidsRef.current = asteroidsRef.current.map((asteroid) => ({
        ...asteroid,
        position: wrapPosition(
          {
            x: asteroid.position.x + asteroid.velocity.x,
            y: asteroid.position.y + asteroid.velocity.y,
          },
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        ),
        rotation: asteroid.rotation + asteroid.rotationSpeed,
      }))

      // Update particles
      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          position: {
            x: particle.position.x + particle.velocity.x,
            y: particle.position.y + particle.velocity.y,
          },
          life: particle.life - 1,
          velocity: {
            x: particle.velocity.x * 0.98,
            y: particle.velocity.y * 0.98,
          },
        }))
        .filter((particle) => particle.life > 0)

      // Check bullet-asteroid collisions
      const bulletsToRemove = new Set<number>()
      const asteroidsToRemove = new Set<number>()
      const newAsteroids: Asteroid[] = []

      for (const bullet of bulletsRef.current) {
        for (const asteroid of asteroidsRef.current) {
          const asteroidRadius = ASTEROID_SIZES[asteroid.size]
          if (distance(bullet.position, asteroid.position) < asteroidRadius) {
            bulletsToRemove.add(bullet.id)
            asteroidsToRemove.add(asteroid.id)
            
            // Score
            const points = ASTEROID_POINTS[asteroid.size]
            scoreRef.current += points
            setScore(scoreRef.current)
            
            // Split asteroid
            newAsteroids.push(...splitAsteroid(asteroid))
            
            // Particles
            spawnParticles(asteroid.position, COLORS.asteroid, 15, 4)
            if (soundEnabled) playSound('explosion')
          }
        }
      }

      bulletsRef.current = bulletsRef.current.filter((b) => !bulletsToRemove.has(b.id))
      asteroidsRef.current = asteroidsRef.current.filter((a) => !asteroidsToRemove.has(a.id))
      asteroidsRef.current = [...asteroidsRef.current, ...newAsteroids]

      // Check ship-asteroid collision
      if (invincibilityRef.current <= 0) {
        for (const asteroid of asteroidsRef.current) {
          const asteroidRadius = ASTEROID_SIZES[asteroid.size]
          if (distance(ship.position, asteroid.position) < asteroidRadius + SHIP_SIZE * 0.5) {
            livesRef.current--
            setLives(livesRef.current)
            
            // Explosion
            spawnParticles(ship.position, COLORS.ship, 30, 5)
            if (soundEnabled) playSound('die')
            
            if (livesRef.current <= 0) {
              setGameState('gameover')
              saveHighScore(scoreRef.current, levelRef.current)
              return
            }
            
            resetShip()
            break
          }
        }
      }

      // Check level complete
      if (asteroidsRef.current.length === 0) {
        levelRef.current++
        setLevel(levelRef.current)
        initLevel(levelRef.current)
        invincibilityRef.current = INVINCIBILITY_TIME
        if (soundEnabled) playSound('levelup')
      }

      // Draw
      // Clear
      ctx.fillStyle = COLORS.background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Grid
      ctx.strokeStyle = '#ffffff08'
      ctx.lineWidth = 1
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
      }

      // Draw particles
      for (const particle of particlesRef.current) {
        ctx.beginPath()
        ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.life / 60
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Draw bullets
      for (const bullet of bulletsRef.current) {
        ctx.beginPath()
        ctx.arc(bullet.position.x, bullet.position.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = COLORS.bullet
        ctx.shadowColor = COLORS.bullet
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Draw asteroids
      for (const asteroid of asteroidsRef.current) {
        const radius = ASTEROID_SIZES[asteroid.size]
        ctx.save()
        ctx.translate(asteroid.position.x, asteroid.position.y)
        ctx.rotate(degToRad(asteroid.rotation))
        
        ctx.beginPath()
        for (let i = 0; i < asteroid.vertices.length; i += 2) {
          const angle = degToRad(asteroid.vertices[i])
          const r = radius * asteroid.vertices[i + 1]
          if (i === 0) {
            ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
          } else {
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
          }
        }
        ctx.closePath()
        
        ctx.strokeStyle = COLORS.asteroid
        ctx.lineWidth = 2
        ctx.shadowColor = COLORS.asteroid
        ctx.shadowBlur = 15
        ctx.stroke()
        ctx.shadowBlur = 0
        
        ctx.restore()
      }

      // Draw ship
      const shipAlpha = invincibilityRef.current > 0 ? (Math.floor(invincibilityRef.current / 5) % 2 === 0 ? 0.3 : 1) : 1
      ctx.save()
      ctx.translate(ship.position.x, ship.position.y)
      ctx.rotate(degToRad(ship.rotation))
      ctx.globalAlpha = shipAlpha
      
      // Ship body
      ctx.beginPath()
      ctx.moveTo(SHIP_SIZE, 0)
      ctx.lineTo(-SHIP_SIZE * 0.7, -SHIP_SIZE * 0.6)
      ctx.lineTo(-SHIP_SIZE * 0.4, 0)
      ctx.lineTo(-SHIP_SIZE * 0.7, SHIP_SIZE * 0.6)
      ctx.closePath()
      
      ctx.strokeStyle = COLORS.ship
      ctx.lineWidth = 2
      ctx.shadowColor = COLORS.ship
      ctx.shadowBlur = 15
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Thrust flame
      if (ship.thrusting) {
        ctx.beginPath()
        ctx.moveTo(-SHIP_SIZE * 0.4, -SHIP_SIZE * 0.3)
        ctx.lineTo(-SHIP_SIZE * (0.8 + Math.random() * 0.4), 0)
        ctx.lineTo(-SHIP_SIZE * 0.4, SHIP_SIZE * 0.3)
        ctx.strokeStyle = COLORS.shipThrust
        ctx.shadowColor = COLORS.shipThrust
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      
      ctx.globalAlpha = 1
      ctx.restore()

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, soundEnabled, spawnParticles, splitAsteroid, initLevel, resetShip, saveHighScore])

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' || gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame()
        }
        return
      }

      if (gameState === 'playing') {
        keysRef.current.add(e.key)
        
        if (e.key === ' ') {
          e.preventDefault()
          shoot()
        }
        
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          setGameState('paused')
        }
      }

      if (gameState === 'paused' && (e.key === 'Escape' || e.key === 'p' || e.key === 'P' || e.key === ' ')) {
        setGameState('playing')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, startGame, shoot])

  // Touch controls
  const handleTouchControl = useCallback((action: 'left' | 'right' | 'thrust' | 'shoot', pressed: boolean) => {
    if (gameState !== 'playing') return
    
    const keyMap = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      thrust: 'ArrowUp',
    }
    
    if (action === 'shoot' && pressed) {
      shoot()
    } else if (action !== 'shoot') {
      if (pressed) {
        keysRef.current.add(keyMap[action])
      } else {
        keysRef.current.delete(keyMap[action])
      }
    }
  }, [gameState, shoot])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

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
        className="absolute top-4 left-4 bg-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-cyan-500/30"
        style={{ color: COLORS.text }}
      >
        ← Arcade
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-cyan-500/30"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1
        className="text-4xl md:text-6xl font-black mb-1 mt-16 text-center font-mono tracking-wider"
        style={{
          color: COLORS.neonBlue,
          textShadow: `0 0 20px ${COLORS.neonBlue}, 0 0 40px ${COLORS.neonBlue}60`,
        }}
      >
        🚀 ASTEROIDS
      </h1>
      <p className="text-gray-500 mb-4 text-center font-mono text-xs">
        CLASSIC ARCADE
      </p>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center text-sm">
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.text,
            borderColor: COLORS.text + '40',
            textShadow: `0 0 10px ${COLORS.text}`,
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
            color: COLORS.neonPink,
            borderColor: COLORS.neonPink + '40',
            textShadow: `0 0 10px ${COLORS.neonPink}`,
          }}
        >
          ❤️ {lives}
        </div>
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.neonBlue,
            borderColor: COLORS.neonBlue + '40',
            textShadow: `0 0 10px ${COLORS.neonBlue}`,
          }}
        >
          📊 Level {level}
        </div>
      </div>

      {/* Game Canvas */}
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          border: `4px solid ${COLORS.neonBlue}40`,
          boxShadow: `0 0 40px ${COLORS.neonBlue}20, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            width: CANVAS_WIDTH * scale,
            height: CANVAS_HEIGHT * scale,
          }}
        />

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h2
              className="text-2xl font-black mb-4 font-mono text-center"
              style={{ color: COLORS.neonBlue, textShadow: `0 0 15px ${COLORS.neonBlue}` }}
            >
              ASTEROIDS
            </h2>
            
            <div className="text-gray-400 text-sm font-mono mb-4 text-center space-y-1">
              <p>⬆️ or W - Thrust</p>
              <p>⬅️ ➡️ or A/D - Rotate</p>
              <p>SPACE - Shoot</p>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.neonBlue,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.neonBlue}, 0 0 60px ${COLORS.neonBlue}60`,
              }}
            >
              START GAME
            </button>
            <p className="text-gray-500 mt-3 text-xs font-mono">Press SPACE or ENTER</p>
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
            <p className="text-gray-400 mt-2 text-sm font-mono">Press ESC or P to continue</p>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 flex gap-6 md:hidden">
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchControl('left', true)}
            onTouchEnd={() => handleTouchControl('left', false)}
            onMouseDown={() => handleTouchControl('left', true)}
            onMouseUp={() => handleTouchControl('left', false)}
            onMouseLeave={() => handleTouchControl('left', false)}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95 select-none"
            style={{
              backgroundColor: '#222',
              color: COLORS.neonBlue,
              border: `2px solid ${COLORS.neonBlue}40`,
            }}
          >
            ↶
          </button>
          <button
            onTouchStart={() => handleTouchControl('right', true)}
            onTouchEnd={() => handleTouchControl('right', false)}
            onMouseDown={() => handleTouchControl('right', true)}
            onMouseUp={() => handleTouchControl('right', false)}
            onMouseLeave={() => handleTouchControl('right', false)}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95 select-none"
            style={{
              backgroundColor: '#222',
              color: COLORS.neonBlue,
              border: `2px solid ${COLORS.neonBlue}40`,
            }}
          >
            ↷
          </button>
        </div>
        <button
          onTouchStart={() => handleTouchControl('thrust', true)}
          onTouchEnd={() => handleTouchControl('thrust', false)}
          onMouseDown={() => handleTouchControl('thrust', true)}
          onMouseUp={() => handleTouchControl('thrust', false)}
          onMouseLeave={() => handleTouchControl('thrust', false)}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95 select-none"
          style={{
            backgroundColor: '#222',
            color: COLORS.shipThrust,
            border: `2px solid ${COLORS.shipThrust}40`,
          }}
        >
          🔥
        </button>
        <button
          onTouchStart={() => handleTouchControl('shoot', true)}
          onTouchEnd={() => handleTouchControl('shoot', false)}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95 select-none"
          style={{
            backgroundColor: '#222',
            color: COLORS.bullet,
            border: `2px solid ${COLORS.bullet}40`,
          }}
        >
          💥
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
              borderColor: isNewHighScore ? '#ffd700' : COLORS.asteroid,
            }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💥'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: isNewHighScore ? '#ffd700' : COLORS.asteroid,
                textShadow: `0 0 20px ${isNewHighScore ? '#ffd700' : COLORS.asteroid}`,
              }}
            >
              {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER!'}
            </h2>
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
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.neonBlue }}>
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
                  backgroundColor: COLORS.neonBlue,
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
                        <div className="text-xs text-gray-500">Level {entry.level}</div>
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
                localStorage.removeItem('asteroids-high-scores')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all font-mono"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
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
          animation: confetti linear forwards;
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
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
