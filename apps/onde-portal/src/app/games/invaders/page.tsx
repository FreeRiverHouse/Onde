'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'playing' | 'paused' | 'gameover' | 'victory'
type PowerUpType = 'rapid' | 'spread' | 'shield' | 'laser' | 'bomb' | 'slow'

interface Position {
  x: number
  y: number
}

interface Bullet {
  id: number
  x: number
  y: number
  isEnemy: boolean
  speed: number
  isLaser?: boolean
}

interface Alien {
  id: number
  x: number
  y: number
  type: 'basic' | 'medium' | 'strong' | 'boss'
  health: number
  maxHealth: number
  points: number
  emoji: string
}

interface Shield {
  id: number
  x: number
  segments: boolean[][]
}

interface PowerUp {
  id: number
  x: number
  y: number
  type: PowerUpType
  emoji: string
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

interface Explosion {
  id: number
  x: number
  y: number
  radius: number
  maxRadius: number
  color: string
}

// Constants
const GAME_WIDTH = 400
const GAME_HEIGHT = 500
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 30
const ALIEN_SIZE = 32
const BULLET_SIZE = 6
const SHIELD_WIDTH = 60
const SHIELD_HEIGHT = 40
const INITIAL_ALIEN_SPEED = 0.8
const BULLET_SPEED = 8
const ENEMY_BULLET_SPEED = 4

// Colors
const COLORS = {
  background: '#0a0a0f',
  player: '#00ff88',
  playerGlow: '#00ffcc',
  alien1: '#ff4466',
  alien2: '#ffaa00',
  alien3: '#aa55ff',
  boss: '#ff0066',
  bullet: '#00ffff',
  enemyBullet: '#ff6600',
  shield: '#44ff44',
  text: '#00ff88',
  neonPink: '#ff00aa',
  neonBlue: '#00ccff',
  neonPurple: '#aa00ff',
}

// Alien formations by wave
const ALIEN_TYPES: Record<Alien['type'], { emoji: string; health: number; points: number; color: string }> = {
  basic: { emoji: '👾', health: 1, points: 10, color: COLORS.alien1 },
  medium: { emoji: '👽', health: 2, points: 20, color: COLORS.alien2 },
  strong: { emoji: '🛸', health: 3, points: 30, color: COLORS.alien3 },
  boss: { emoji: '👹', health: 20, points: 500, color: COLORS.boss },
}

// Power-up definitions
const POWER_UP_DEFS: Record<PowerUpType, { emoji: string; duration: number; color: string; name: string }> = {
  rapid: { emoji: '⚡', duration: 8000, color: '#ffff00', name: 'Rapid Fire' },
  spread: { emoji: '🔱', duration: 10000, color: '#00aaff', name: 'Spread Shot' },
  shield: { emoji: '🛡️', duration: 15000, color: '#44ff44', name: 'Shield' },
  laser: { emoji: '⚔️', duration: 6000, color: '#ff00ff', name: 'Laser Beam' },
  bomb: { emoji: '💣', duration: 0, color: '#ff6600', name: 'Smart Bomb' },
  slow: { emoji: '🕐', duration: 8000, color: '#88ffff', name: 'Slow Motion' },
}

// Sound effects
const playSound = (type: 'shoot' | 'hit' | 'explosion' | 'powerup' | 'playerHit' | 'boss' | 'victory' | 'bomb') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'shoot':
        osc.type = 'square'
        osc.frequency.value = 880
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(440, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'hit':
        osc.type = 'square'
        osc.frequency.value = 200
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'explosion':
        osc.type = 'sawtooth'
        osc.frequency.value = 150
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(30, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'powerup':
        osc.type = 'sine'
        osc.frequency.value = 600
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.25)
        osc.stop(audio.currentTime + 0.25)
        break
      case 'playerHit':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.25
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.4)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
      case 'boss':
        osc.type = 'square'
        osc.frequency.value = 100
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
        break
      case 'victory':
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.type = 'square'
            osc2.frequency.value = freq
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc2.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        break
      case 'bomb':
        osc.type = 'sawtooth'
        osc.frequency.value = 80
        gain.gain.value = 0.3
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(20, audio.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
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
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    ))}
  </>
)

// Explosion component
const ExplosionEffect = ({ explosions }: { explosions: Explosion[] }) => (
  <>
    {explosions.map((e) => (
      <div
        key={e.id}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: e.x - e.radius,
          top: e.y - e.radius,
          width: e.radius * 2,
          height: e.radius * 2,
          backgroundColor: 'transparent',
          border: `3px solid ${e.color}`,
          boxShadow: `0 0 ${e.radius}px ${e.color}, inset 0 0 ${e.radius / 2}px ${e.color}`,
          opacity: 1 - e.radius / e.maxRadius,
        }}
      />
    ))}
  </>
)

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

// Player ship component
const PlayerShip = ({ x, hasShield }: { x: number; hasShield: boolean }) => (
  <div
    className="absolute transition-all duration-50"
    style={{
      left: x - PLAYER_WIDTH / 2,
      bottom: 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    }}
  >
    {hasShield && (
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          left: -10,
          top: -10,
          width: PLAYER_WIDTH + 20,
          height: PLAYER_HEIGHT + 20,
          border: `2px solid ${COLORS.shield}`,
          boxShadow: `0 0 15px ${COLORS.shield}, inset 0 0 10px ${COLORS.shield}40`,
        }}
      />
    )}
    <div
      className="absolute"
      style={{
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: `${PLAYER_WIDTH / 2}px solid transparent`,
        borderRight: `${PLAYER_WIDTH / 2}px solid transparent`,
        borderBottom: `${PLAYER_HEIGHT}px solid ${COLORS.player}`,
        filter: `drop-shadow(0 0 10px ${COLORS.playerGlow})`,
      }}
    />
    <div
      className="absolute"
      style={{
        left: '50%',
        bottom: 5,
        transform: 'translateX(-50%)',
        width: 8,
        height: 10,
        backgroundColor: COLORS.playerGlow,
        borderRadius: '50% 50% 0 0',
        boxShadow: `0 0 10px ${COLORS.playerGlow}`,
      }}
    />
  </div>
)

// Alien component
const AlienSprite = ({ alien, isHit }: { alien: Alien; isHit: boolean }) => {
  const type = ALIEN_TYPES[alien.type]
  const healthPercent = alien.health / alien.maxHealth

  return (
    <div
      className={`absolute flex items-center justify-center transition-all duration-100 ${isHit ? 'scale-125' : ''}`}
      style={{
        left: alien.x - ALIEN_SIZE / 2,
        top: alien.y - ALIEN_SIZE / 2,
        width: alien.type === 'boss' ? ALIEN_SIZE * 2 : ALIEN_SIZE,
        height: alien.type === 'boss' ? ALIEN_SIZE * 2 : ALIEN_SIZE,
        fontSize: alien.type === 'boss' ? '40px' : '24px',
        filter: isHit ? `brightness(2) drop-shadow(0 0 10px ${type.color})` : `drop-shadow(0 0 5px ${type.color})`,
      }}
    >
      {alien.emoji}
      {alien.type === 'boss' && (
        <div
          className="absolute bottom-0 left-0 h-1 rounded-full"
          style={{
            width: `${healthPercent * 100}%`,
            backgroundColor: healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444',
            boxShadow: `0 0 5px ${healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444'}`,
          }}
        />
      )}
    </div>
  )
}

// Bullet component
const BulletSprite = ({ bullet }: { bullet: Bullet }) => (
  <div
    className={`absolute ${bullet.isLaser ? '' : 'rounded-full'}`}
    style={{
      left: bullet.x - (bullet.isLaser ? 2 : BULLET_SIZE / 2),
      top: bullet.y - (bullet.isLaser ? 20 : BULLET_SIZE / 2),
      width: bullet.isLaser ? 4 : BULLET_SIZE,
      height: bullet.isLaser ? 40 : BULLET_SIZE,
      backgroundColor: bullet.isEnemy ? COLORS.enemyBullet : bullet.isLaser ? '#ff00ff' : COLORS.bullet,
      boxShadow: `0 0 ${bullet.isLaser ? 15 : 10}px ${bullet.isEnemy ? COLORS.enemyBullet : bullet.isLaser ? '#ff00ff' : COLORS.bullet}`,
    }}
  />
)

// Shield component
const ShieldBlock = ({ shield, cellSize }: { shield: Shield; cellSize: number }) => (
  <div
    className="absolute"
    style={{
      left: shield.x,
      bottom: 80,
      width: SHIELD_WIDTH,
      height: SHIELD_HEIGHT,
    }}
  >
    {shield.segments.map((row, y) =>
      row.map((active, x) =>
        active ? (
          <div
            key={`${y}-${x}`}
            className="absolute"
            style={{
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize,
              backgroundColor: COLORS.shield,
              boxShadow: `0 0 3px ${COLORS.shield}`,
            }}
          />
        ) : null
      )
    )}
  </div>
)

// Power-up sprite
const PowerUpSprite = ({ powerUp }: { powerUp: PowerUp }) => {
  const def = POWER_UP_DEFS[powerUp.type]
  return (
    <div
      className="absolute flex items-center justify-center animate-bounce"
      style={{
        left: powerUp.x - 15,
        top: powerUp.y - 15,
        width: 30,
        height: 30,
        fontSize: '20px',
        backgroundColor: def.color + '30',
        borderRadius: '50%',
        border: `2px solid ${def.color}`,
        boxShadow: `0 0 15px ${def.color}`,
      }}
    >
      {powerUp.emoji}
    </div>
  )
}

// Stars background
const StarsBackground = () => {
  const stars = useRef(
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.current.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Main game component
export default function SpaceInvaders() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2)
  const [aliens, setAliens] = useState<Alien[]>([])
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [shields, setShields] = useState<Shield[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [alienDirection, setAlienDirection] = useState(1)
  const [alienSpeed, setAlienSpeed] = useState(INITIAL_ALIEN_SPEED)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [hitAliens, setHitAliens] = useState<Set<number>>(new Set())
  const [now, setNow] = useState(Date.now())

  const gameLoopRef = useRef<number | null>(null)
  const lastShootRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const bulletIdRef = useRef(0)
  const touchStartRef = useRef<number | null>(null)

  // Refs for game loop
  const aliensRef = useRef(aliens)
  const bulletsRef = useRef(bullets)
  const playerXRef = useRef(playerX)
  const activePowerUpsRef = useRef(activePowerUps)
  const shieldsRef = useRef(shields)
  const powerUpsRef = useRef(powerUps)
  const scoreRef = useRef(score)
  const livesRef = useRef(lives)
  const alienDirectionRef = useRef(alienDirection)
  const alienSpeedRef = useRef(alienSpeed)
  const waveRef = useRef(wave)

  // Keep refs in sync
  useEffect(() => { aliensRef.current = aliens }, [aliens])
  useEffect(() => { bulletsRef.current = bullets }, [bullets])
  useEffect(() => { playerXRef.current = playerX }, [playerX])
  useEffect(() => { activePowerUpsRef.current = activePowerUps }, [activePowerUps])
  useEffect(() => { shieldsRef.current = shields }, [shields])
  useEffect(() => { powerUpsRef.current = powerUps }, [powerUps])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { livesRef.current = lives }, [lives])
  useEffect(() => { alienDirectionRef.current = alienDirection }, [alienDirection])
  useEffect(() => { alienSpeedRef.current = alienSpeed }, [alienSpeed])
  useEffect(() => { waveRef.current = wave }, [wave])

  // Update now for power-up timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(interval)
  }, [])

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('invaders-high-score')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Save high score
  const saveHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore)
      localStorage.setItem('invaders-high-score', newScore.toString())
    }
  }, [highScore])

  // Check power-up
  const hasPowerUp = useCallback((type: PowerUpType) => {
    return activePowerUpsRef.current.some((p) => p.type === type && p.expiresAt > Date.now())
  }, [])

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color,
      life: 1,
      size: 3 + Math.random() * 4,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Create explosion
  const createExplosion = useCallback((x: number, y: number, color: string, maxRadius: number = 40) => {
    setExplosions((prev) => [...prev, {
      id: Date.now() + Math.random(),
      x,
      y,
      radius: 5,
      maxRadius,
      color,
    }])
  }, [])

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 200)
  }, [])

  // Create shields
  const createShields = useCallback(() => {
    const shieldCount = 4
    const spacing = GAME_WIDTH / (shieldCount + 1)
    const cellSize = 6
    const cols = Math.floor(SHIELD_WIDTH / cellSize)
    const rows = Math.floor(SHIELD_HEIGHT / cellSize)

    return Array.from({ length: shieldCount }, (_, i) => ({
      id: i,
      x: spacing * (i + 1) - SHIELD_WIDTH / 2,
      segments: Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => {
          // Create arch shape
          const centerX = cols / 2
          const distFromCenter = Math.abs(x - centerX)
          if (y > rows * 0.6 && distFromCenter < cols * 0.3) return false // arch cutout
          return true
        })
      ),
    }))
  }, [])

  // Create alien wave
  const createAlienWave = useCallback((waveNum: number) => {
    const aliens: Alien[] = []
    let id = 0

    // Boss wave every 5 waves
    if (waveNum % 5 === 0) {
      const bossType = ALIEN_TYPES.boss
      aliens.push({
        id: id++,
        x: GAME_WIDTH / 2,
        y: 60,
        type: 'boss',
        health: bossType.health + (waveNum / 5) * 10,
        maxHealth: bossType.health + (waveNum / 5) * 10,
        points: bossType.points,
        emoji: bossType.emoji,
      })
      return aliens
    }

    // Regular wave
    const rows = Math.min(5, 3 + Math.floor(waveNum / 3))
    const cols = Math.min(11, 7 + Math.floor(waveNum / 4))
    const startX = (GAME_WIDTH - cols * (ALIEN_SIZE + 8)) / 2 + ALIEN_SIZE / 2
    const startY = 50

    for (let row = 0; row < rows; row++) {
      const rowType: Alien['type'] = row === 0 ? 'strong' : row <= 1 ? 'medium' : 'basic'
      const typeDef = ALIEN_TYPES[rowType]

      for (let col = 0; col < cols; col++) {
        aliens.push({
          id: id++,
          x: startX + col * (ALIEN_SIZE + 8),
          y: startY + row * (ALIEN_SIZE + 4),
          type: rowType,
          health: typeDef.health,
          maxHealth: typeDef.health,
          points: typeDef.points,
          emoji: typeDef.emoji,
        })
      }
    }

    return aliens
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    setLives(3)
    setWave(1)
    setPlayerX(GAME_WIDTH / 2)
    setAliens(createAlienWave(1))
    setBullets([])
    setShields(createShields())
    setPowerUps([])
    setActivePowerUps([])
    setParticles([])
    setExplosions([])
    setAlienDirection(1)
    setAlienSpeed(INITIAL_ALIEN_SPEED)
    setGameState('playing')
    setShowConfetti(false)
    setHitAliens(new Set())
  }, [createAlienWave, createShields])

  // Next wave
  const nextWave = useCallback(() => {
    const newWave = waveRef.current + 1
    setWave(newWave)
    setAliens(createAlienWave(newWave))
    setBullets([])
    setAlienDirection(1)
    setAlienSpeed(INITIAL_ALIEN_SPEED + newWave * 0.2)
    setHitAliens(new Set())

    // Restore some shields
    setShields(createShields())

    if (soundEnabled && newWave % 5 === 0) playSound('boss')
  }, [createAlienWave, createShields, soundEnabled])

  // Shoot bullet
  const shoot = useCallback(() => {
    const currentTime = Date.now()
    const shootDelay = hasPowerUp('rapid') ? 100 : 250

    if (currentTime - lastShootRef.current < shootDelay) return

    lastShootRef.current = currentTime
    bulletIdRef.current++

    if (soundEnabled) playSound('shoot')

    const isLaser = hasPowerUp('laser')
    const isSpread = hasPowerUp('spread')

    const newBullets: Bullet[] = []

    if (isSpread) {
      // Three bullets
      [-20, 0, 20].forEach((offset) => {
        newBullets.push({
          id: bulletIdRef.current++,
          x: playerXRef.current + offset,
          y: GAME_HEIGHT - 60,
          isEnemy: false,
          speed: BULLET_SPEED,
          isLaser,
        })
      })
    } else {
      newBullets.push({
        id: bulletIdRef.current++,
        x: playerXRef.current,
        y: GAME_HEIGHT - 60,
        isEnemy: false,
        speed: BULLET_SPEED,
        isLaser,
      })
    }

    setBullets((prev) => [...prev, ...newBullets])
  }, [hasPowerUp, soundEnabled])

  // Apply power-up
  const applyPowerUp = useCallback((powerUp: PowerUp) => {
    const def = POWER_UP_DEFS[powerUp.type]

    if (soundEnabled) playSound('powerup')
    spawnParticles(powerUp.x, powerUp.y, def.color, 15)

    if (powerUp.type === 'bomb') {
      // Smart bomb - kill all visible aliens
      if (soundEnabled) playSound('bomb')
      triggerShake()

      setAliens((prev) => {
        prev.forEach((alien) => {
          createExplosion(alien.x, alien.y, ALIEN_TYPES[alien.type].color, 30)
          spawnParticles(alien.x, alien.y, ALIEN_TYPES[alien.type].color, 8)
          setScore((s) => s + alien.points)
        })
        return []
      })
    } else {
      setActivePowerUps((prev) => {
        const filtered = prev.filter((p) => p.type !== powerUp.type)
        return [...filtered, { type: powerUp.type, expiresAt: Date.now() + def.duration, emoji: powerUp.emoji }]
      })
    }
  }, [soundEnabled, spawnParticles, createExplosion, triggerShake])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      const currentTime = Date.now()
      const slowMo = activePowerUpsRef.current.some((p) => p.type === 'slow' && p.expiresAt > currentTime)
      const speedMultiplier = slowMo ? 0.4 : 1

      // Clean expired power-ups
      setActivePowerUps((prev) => prev.filter((p) => p.expiresAt > currentTime))

      // Handle input
      const moveSpeed = 6
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
        setPlayerX((prev) => Math.max(PLAYER_WIDTH / 2, prev - moveSpeed))
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
        setPlayerX((prev) => Math.min(GAME_WIDTH - PLAYER_WIDTH / 2, prev + moveSpeed))
      }
      if (keysRef.current.has(' ') || keysRef.current.has('ArrowUp')) {
        shoot()
      }

      // Move bullets
      setBullets((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.y + (b.isEnemy ? b.speed : -b.speed) * speedMultiplier,
          }))
          .filter((b) => b.y > -20 && b.y < GAME_HEIGHT + 20)
      )

      // Move aliens
      setAliens((prev) => {
        if (prev.length === 0) return prev

        let moveDown = false
        let newDirection = alienDirectionRef.current

        // Check bounds
        const leftMost = Math.min(...prev.map((a) => a.x))
        const rightMost = Math.max(...prev.map((a) => a.x))

        if (rightMost >= GAME_WIDTH - 20 && alienDirectionRef.current === 1) {
          moveDown = true
          newDirection = -1
        } else if (leftMost <= 20 && alienDirectionRef.current === -1) {
          moveDown = true
          newDirection = 1
        }

        if (newDirection !== alienDirectionRef.current) {
          setAlienDirection(newDirection)
        }

        return prev.map((alien) => ({
          ...alien,
          x: alien.x + alienSpeedRef.current * newDirection * speedMultiplier,
          y: moveDown ? alien.y + 15 : alien.y,
        }))
      })

      // Enemy shooting
      if (Math.random() < 0.02 * speedMultiplier && aliensRef.current.length > 0) {
        const shooter = aliensRef.current[Math.floor(Math.random() * aliensRef.current.length)]
        setBullets((prev) => [
          ...prev,
          {
            id: bulletIdRef.current++,
            x: shooter.x,
            y: shooter.y + ALIEN_SIZE / 2,
            isEnemy: true,
            speed: ENEMY_BULLET_SPEED * (1 + waveRef.current * 0.1),
          },
        ])
      }

      // Move power-ups
      setPowerUps((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + 2 * speedMultiplier }))
          .filter((p) => p.y < GAME_HEIGHT + 20)
      )

      // Collision detection - bullets vs aliens
      const currentBullets = bulletsRef.current
      const currentAliens = aliensRef.current
      const playerBullets = currentBullets.filter((b) => !b.isEnemy)

      playerBullets.forEach((bullet) => {
        currentAliens.forEach((alien) => {
          const size = alien.type === 'boss' ? ALIEN_SIZE * 2 : ALIEN_SIZE
          if (
            bullet.x > alien.x - size / 2 &&
            bullet.x < alien.x + size / 2 &&
            bullet.y > alien.y - size / 2 &&
            bullet.y < alien.y + size / 2
          ) {
            // Hit!
            const damage = bullet.isLaser ? 3 : 1

            setAliens((prev) =>
              prev
                .map((a) => {
                  if (a.id === alien.id) {
                    const newHealth = a.health - damage
                    if (newHealth <= 0) {
                      // Killed
                      if (soundEnabled) playSound('explosion')
                      createExplosion(a.x, a.y, ALIEN_TYPES[a.type].color)
                      spawnParticles(a.x, a.y, ALIEN_TYPES[a.type].color, 15)
                      setScore((s) => s + a.points)

                      // Maybe spawn power-up
                      if (Math.random() < 0.15) {
                        const types: PowerUpType[] = ['rapid', 'spread', 'shield', 'laser', 'bomb', 'slow']
                        const type = types[Math.floor(Math.random() * types.length)]
                        const def = POWER_UP_DEFS[type]
                        setPowerUps((p) => [
                          ...p,
                          { id: Date.now(), x: a.x, y: a.y, type, emoji: def.emoji },
                        ])
                      }

                      return null
                    }
                    // Damaged but alive
                    if (soundEnabled) playSound('hit')
                    setHitAliens((s) => new Set(s).add(a.id))
                    setTimeout(() => setHitAliens((s) => {
                      const next = new Set(s)
                      next.delete(a.id)
                      return next
                    }), 100)
                    return { ...a, health: newHealth }
                  }
                  return a
                })
                .filter((a): a is Alien => a !== null)
            )

            // Remove bullet (unless laser which passes through)
            if (!bullet.isLaser) {
              setBullets((prev) => prev.filter((b) => b.id !== bullet.id))
            }
          }
        })
      })

      // Collision - bullets vs shields
      currentBullets.forEach((bullet) => {
        shieldsRef.current.forEach((shield) => {
          const cellSize = 6
          const cols = shield.segments[0].length
          const rows = shield.segments.length

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              if (!shield.segments[y][x]) continue

              const cellX = shield.x + x * cellSize
              const cellY = GAME_HEIGHT - 80 - SHIELD_HEIGHT + y * cellSize

              if (
                bullet.x > cellX &&
                bullet.x < cellX + cellSize &&
                bullet.y > cellY &&
                bullet.y < cellY + cellSize
              ) {
                // Destroy shield cell
                setShields((prev) =>
                  prev.map((s) => {
                    if (s.id !== shield.id) return s
                    const newSegments = s.segments.map((row, ry) =>
                      row.map((cell, rx) => (ry === y && rx === x ? false : cell))
                    )
                    return { ...s, segments: newSegments }
                  })
                )

                // Remove bullet
                setBullets((prev) => prev.filter((b) => b.id !== bullet.id))

                spawnParticles(cellX + cellSize / 2, cellY + cellSize / 2, COLORS.shield, 5)
              }
            }
          }
        })
      })

      // Collision - enemy bullets vs player
      const hasShield = activePowerUpsRef.current.some((p) => p.type === 'shield' && p.expiresAt > currentTime)
      const enemyBullets = currentBullets.filter((b) => b.isEnemy)

      enemyBullets.forEach((bullet) => {
        const playerY = GAME_HEIGHT - 35
        if (
          bullet.x > playerXRef.current - PLAYER_WIDTH / 2 &&
          bullet.x < playerXRef.current + PLAYER_WIDTH / 2 &&
          bullet.y > playerY - PLAYER_HEIGHT / 2 &&
          bullet.y < playerY + PLAYER_HEIGHT / 2
        ) {
          if (hasShield) {
            // Shield absorbs
            spawnParticles(bullet.x, bullet.y, COLORS.shield, 10)
            setBullets((prev) => prev.filter((b) => b.id !== bullet.id))
            return
          }

          // Player hit
          if (soundEnabled) playSound('playerHit')
          triggerShake()
          createExplosion(playerXRef.current, playerY, COLORS.player, 50)
          spawnParticles(playerXRef.current, playerY, COLORS.player, 20)

          setBullets((prev) => prev.filter((b) => b.id !== bullet.id))

          setLives((prev) => {
            const newLives = prev - 1
            if (newLives <= 0) {
              setGameState('gameover')
              saveHighScore(scoreRef.current)
            }
            return newLives
          })

          // Reset player position
          setPlayerX(GAME_WIDTH / 2)
        }
      })

      // Collision - power-ups vs player
      powerUpsRef.current.forEach((powerUp) => {
        const playerY = GAME_HEIGHT - 35
        if (
          powerUp.x > playerXRef.current - PLAYER_WIDTH / 2 - 15 &&
          powerUp.x < playerXRef.current + PLAYER_WIDTH / 2 + 15 &&
          powerUp.y > playerY - PLAYER_HEIGHT / 2 - 15 &&
          powerUp.y < playerY + PLAYER_HEIGHT / 2 + 15
        ) {
          applyPowerUp(powerUp)
          setPowerUps((prev) => prev.filter((p) => p.id !== powerUp.id))
        }
      })

      // Check aliens reaching bottom
      const lowestAlien = Math.max(...aliensRef.current.map((a) => a.y + ALIEN_SIZE / 2), 0)
      if (lowestAlien > GAME_HEIGHT - 100) {
        setGameState('gameover')
        saveHighScore(scoreRef.current)
      }

      // Check wave complete
      if (aliensRef.current.length === 0 && gameState === 'playing') {
        if (soundEnabled) playSound('victory')
        nextWave()
      }

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

      // Update explosions
      setExplosions((prev) =>
        prev
          .map((e) => ({ ...e, radius: e.radius + 3 }))
          .filter((e) => e.radius < e.maxRadius)
      )

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, shoot, nextWave, soundEnabled, spawnParticles, createExplosion, triggerShake, applyPowerUp, saveHighScore])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' || gameState === 'gameover' || gameState === 'victory') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          startGame()
          return
        }
      }

      if (gameState === 'playing') {
        keysRef.current.add(e.key)

        if (e.key === 'p' || e.key === 'Escape') {
          setGameState('paused')
        }
        if (e.key === ' ') {
          e.preventDefault()
        }
      }

      if (gameState === 'paused' && (e.key === 'p' || e.key === 'Escape' || e.key === ' ')) {
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
  }, [gameState, startGame])

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touchX = e.touches[0].clientX - rect.left
    const gameX = (touchX / rect.width) * GAME_WIDTH

    setPlayerX(Math.max(PLAYER_WIDTH / 2, Math.min(GAME_WIDTH - PLAYER_WIDTH / 2, gameX)))
  }

  const handleTouchEnd = () => {
    if (gameState === 'playing') {
      shoot()
    } else if (gameState === 'idle' || gameState === 'gameover') {
      startGame()
    }
    touchStartRef.current = null
  }

  const shieldCellSize = 6

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
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
        className="text-4xl md:text-5xl font-black mb-1 mt-16 text-center font-mono tracking-wider"
        style={{
          color: COLORS.text,
          textShadow: `0 0 20px ${COLORS.player}, 0 0 40px ${COLORS.player}60`,
        }}
      >
        👾 INVADERS
      </h1>
      <p className="text-gray-500 mb-2 text-center font-mono text-xs">
        DEFEND EARTH
      </p>

      {/* Active Power-ups */}
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
            borderColor: COLORS.player + '40',
            textShadow: `0 0 10px ${COLORS.player}`,
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
          ❤️ {lives}
        </div>
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.neonPurple,
            borderColor: COLORS.neonPurple + '40',
            textShadow: `0 0 10px ${COLORS.neonPurple}`,
          }}
        >
          🌊 Wave {wave}
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={containerRef}
        className={`relative rounded-lg overflow-hidden shadow-2xl transition-transform ${
          screenShake ? 'animate-shake' : ''
        }`}
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: '#050510',
          border: `4px solid ${COLORS.neonBlue}30`,
          boxShadow: `0 0 40px ${COLORS.player}20, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <StarsBackground />

        {/* Particles */}
        <ParticleSystem particles={particles} />

        {/* Explosions */}
        <ExplosionEffect explosions={explosions} />

        {/* Shields */}
        {shields.map((shield) => (
          <ShieldBlock key={shield.id} shield={shield} cellSize={shieldCellSize} />
        ))}

        {/* Aliens */}
        {aliens.map((alien) => (
          <AlienSprite key={alien.id} alien={alien} isHit={hitAliens.has(alien.id)} />
        ))}

        {/* Power-ups */}
        {powerUps.map((powerUp) => (
          <PowerUpSprite key={powerUp.id} powerUp={powerUp} />
        ))}

        {/* Bullets */}
        {bullets.map((bullet) => (
          <BulletSprite key={bullet.id} bullet={bullet} />
        ))}

        {/* Player */}
        {gameState !== 'gameover' && (
          <PlayerShip x={playerX} hasShield={hasPowerUp('shield')} />
        )}

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-6xl mb-4 animate-bounce">👾</div>
            <h2
              className="text-2xl font-black mb-4 font-mono text-center"
              style={{ color: COLORS.text, textShadow: `0 0 15px ${COLORS.player}` }}
            >
              SPACE INVADERS
            </h2>

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110 mb-4"
              style={{
                backgroundColor: COLORS.player,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.player}, 0 0 60px ${COLORS.player}60`,
              }}
            >
              START GAME
            </button>

            <div className="text-gray-400 text-xs font-mono text-center space-y-1">
              <p>← → or A D to move</p>
              <p>SPACE or ↑ to shoot</p>
              <p>P to pause</p>
            </div>

            {/* Power-up legend */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-500">
              {Object.entries(POWER_UP_DEFS).map(([, def]) => (
                <span key={def.name}>{def.emoji} {def.name}</span>
              ))}
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
            <p className="text-gray-400 mt-2 text-sm font-mono">Press P or ESC to continue</p>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-6xl mb-4">💀</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{ color: '#ff4444', textShadow: '0 0 15px #ff4444' }}
            >
              GAME OVER
            </h2>

            <div className="flex gap-6 mb-4">
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
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.neonPurple }}>
                  {wave}
                </div>
                <div className="text-xs text-gray-400">Wave</div>
              </div>
            </div>

            {score >= highScore && score > 0 && (
              <div className="text-yellow-400 text-xl mb-4 animate-pulse">⭐ New High Score! ⭐</div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.player,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.player}`,
              }}
            >
              🎮 Play Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 flex gap-4 md:hidden">
        <button
          onTouchStart={() => keysRef.current.add('ArrowLeft')}
          onTouchEnd={() => keysRef.current.delete('ArrowLeft')}
          className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}40`,
          }}
        >
          ◀
        </button>
        <button
          onTouchStart={shoot}
          className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: COLORS.player + '40',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}`,
          }}
        >
          🔫
        </button>
        <button
          onTouchStart={() => keysRef.current.add('ArrowRight')}
          onTouchEnd={() => keysRef.current.delete('ArrowRight')}
          className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}40`,
          }}
        >
          ▶
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 max-w-md text-center text-gray-500 text-xs font-mono hidden md:block">
        <p>Arrow keys or WASD to move • Space to shoot • P to pause</p>
        <p className="mt-1">Collect power-ups • Destroy all aliens • Survive!</p>
      </div>

      {/* CSS for animations */}
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.1s linear 2;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
