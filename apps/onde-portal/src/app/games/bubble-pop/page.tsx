'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'playing' | 'aiming' | 'shooting' | 'gameover' | 'levelComplete' | 'victory'

interface Bubble {
  id: number
  row: number
  col: number
  color: string
  x: number
  y: number
  popping?: boolean
  falling?: boolean
}

interface ShootingBubble {
  x: number
  y: number
  vx: number
  vy: number
  color: string
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
  emoji?: string
}

interface HighScoreEntry {
  score: number
  date: string
  level: number
}

// Game constants
const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600
const BUBBLE_RADIUS = 18
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2
const COLS = 10
const ROWS = 12
const TOP_OFFSET = 50
const SHOOTER_Y = CANVAS_HEIGHT - 60
const MAX_LEVEL = 10
const BUBBLE_SPEED = 14

// Bubble colors with emojis for visual flair
const BUBBLE_COLORS = [
  { color: '#ff4757', name: 'red', emoji: '🔴' },
  { color: '#2ed573', name: 'green', emoji: '🟢' },
  { color: '#1e90ff', name: 'blue', emoji: '🔵' },
  { color: '#ffa502', name: 'orange', emoji: '🟠' },
  { color: '#a55eea', name: 'purple', emoji: '🟣' },
  { color: '#ffdd59', name: 'yellow', emoji: '🟡' },
]

// Sound effects using Web Audio API
const playSound = (type: 'shoot' | 'pop' | 'fall' | 'match' | 'bounce' | 'win' | 'lose' | 'levelup') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'shoot':
        osc.type = 'sine'
        osc.frequency.value = 400
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(600, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'pop':
        osc.type = 'sine'
        osc.frequency.value = 600
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.08)
        osc.stop(audio.currentTime + 0.08)
        break
      case 'fall':
        osc.type = 'sawtooth'
        osc.frequency.value = 300
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'match':
        const notes = [523, 659, 784]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const o = audio.createOscillator()
            const g = audio.createGain()
            o.connect(g)
            g.connect(audio.destination)
            o.type = 'sine'
            o.frequency.value = freq
            g.gain.value = 0.12
            o.start()
            g.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.12)
            o.stop(audio.currentTime + 0.12)
          }, i * 50)
        })
        break
      case 'bounce':
        osc.type = 'sine'
        osc.frequency.value = 250
        gain.gain.value = 0.08
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'win':
        const winNotes = [523, 659, 784, 1047]
        winNotes.forEach((freq, i) => {
          setTimeout(() => {
            const o = audio.createOscillator()
            const g = audio.createGain()
            o.connect(g)
            g.connect(audio.destination)
            o.type = 'square'
            o.frequency.value = freq
            g.gain.value = 0.12
            o.start()
            g.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            o.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        break
      case 'lose':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
        break
      case 'levelup':
        const levelNotes = [523.25, 659.25, 783.99, 1046.5]
        levelNotes.forEach((freq, i) => {
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

// Calculate bubble position
const getBubblePosition = (row: number, col: number): { x: number; y: number } => {
  const offset = row % 2 === 1 ? BUBBLE_RADIUS : 0
  const x = col * BUBBLE_DIAMETER + BUBBLE_RADIUS + offset + 10
  const y = row * (BUBBLE_DIAMETER - 4) + BUBBLE_RADIUS + TOP_OFFSET
  return { x, y }
}

// Generate level bubbles
const generateLevelBubbles = (level: number): Bubble[] => {
  const bubbles: Bubble[] = []
  let id = 0
  const numRows = Math.min(4 + Math.floor(level / 2), 8)
  const numColors = Math.min(3 + Math.floor(level / 3), BUBBLE_COLORS.length)

  for (let row = 0; row < numRows; row++) {
    const colsInRow = row % 2 === 0 ? COLS : COLS - 1
    for (let col = 0; col < colsInRow; col++) {
      // Different patterns based on level
      const pattern = level % 5
      let skip = false

      switch (pattern) {
        case 1: // Checkerboard
          skip = (row + col) % 2 === 0 && row > 1
          break
        case 2: // V-shape
          skip = row > 2 && (col < row - 2 || col > colsInRow - row + 1)
          break
        case 3: // Diamond holes
          skip = (row === 2 || row === 3) && (col === 3 || col === 4 || col === 5)
          break
        case 4: // Stripes
          skip = col % 3 === 0 && row > 1
          break
      }

      if (skip) continue

      const colorIndex = Math.floor(Math.random() * numColors)
      const { x, y } = getBubblePosition(row, col)

      bubbles.push({
        id: id++,
        row,
        col,
        color: BUBBLE_COLORS[colorIndex].color,
        x,
        y,
      })
    }
  }

  return bubbles
}

// Get shots allowed for level
const getShotsForLevel = (level: number): number => {
  return Math.max(50 - level * 3, 20)
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  const confetti = useMemo(() => {
    if (!active) return []
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)].color,
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 6,
    }))
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti rounded-full"
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
        className="absolute pointer-events-none text-center"
        style={{
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          backgroundColor: p.emoji ? 'transparent' : p.color,
          borderRadius: '50%',
          opacity: p.life,
          boxShadow: p.emoji ? 'none' : `0 0 ${p.size * 2}px ${p.color}`,
          transform: 'translate(-50%, -50%)',
          fontSize: p.size * 0.8,
        }}
      >
        {p.emoji}
      </div>
    ))}
  </>
)

// Main game component
function BubblePopGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [level, setLevel] = useState(1)
  const [shotsLeft, setShotsLeft] = useState(50)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [shootingBubble, setShootingBubble] = useState<ShootingBubble | null>(null)
  const [nextBubbleColor, setNextBubbleColor] = useState(BUBBLE_COLORS[0].color)
  const [currentBubbleColor, setCurrentBubbleColor] = useState(BUBBLE_COLORS[0].color)
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2)
  const [particles, setParticles] = useState<Particle[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHighScores, setShowHighScores] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [scale, setScale] = useState(1)
  const [combo, setCombo] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const bubblesRef = useRef(bubbles)
  const shootingBubbleRef = useRef(shootingBubble)
  const gameStateRef = useRef(gameState)
  const soundEnabledRef = useRef(soundEnabled)

  // Keep refs in sync
  useEffect(() => { bubblesRef.current = bubbles }, [bubbles])
  useEffect(() => { shootingBubbleRef.current = shootingBubble }, [shootingBubble])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  // Calculate scale
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
    const saved = localStorage.getItem('bubble-pop-high-scores')
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
  const saveHighScore = useCallback((newScore: number, reachedLevel: number) => {
    const newEntry: HighScoreEntry = {
      score: newScore,
      date: new Date().toISOString(),
      level: reachedLevel,
    }

    const newScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    setHighScores(newScores)
    setHighScore(Math.max(newScore, highScore))
    localStorage.setItem('bubble-pop-high-scores', JSON.stringify(newScores))

    if (newScore > highScore && highScore > 0) {
      setIsNewHighScore(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [highScores, highScore])

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 8, useEmoji = false) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random() * 1000,
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 2,
      color,
      life: 1,
      size: 6 + Math.random() * 8,
      emoji: useEmoji ? '✨' : undefined,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Get random bubble color for current level
  const getRandomColor = useCallback((lvl: number) => {
    const numColors = Math.min(3 + Math.floor(lvl / 3), BUBBLE_COLORS.length)
    return BUBBLE_COLORS[Math.floor(Math.random() * numColors)].color
  }, [])

  // Find connected bubbles of the same color
  const findConnectedBubbles = useCallback((bubbleList: Bubble[], startBubble: Bubble): Bubble[] => {
    const connected: Set<number> = new Set()
    const toCheck: Bubble[] = [startBubble]
    const targetColor = startBubble.color

    while (toCheck.length > 0) {
      const current = toCheck.pop()!
      if (connected.has(current.id)) continue
      if (current.color !== targetColor) continue

      connected.add(current.id)

      // Find neighbors
      bubbleList.forEach((b) => {
        if (connected.has(b.id)) return
        if (b.color !== targetColor) return

        const dx = b.x - current.x
        const dy = b.y - current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < BUBBLE_DIAMETER + 5) {
          toCheck.push(b)
        }
      })
    }

    return bubbleList.filter((b) => connected.has(b.id))
  }, [])

  // Find floating bubbles (not connected to top)
  const findFloatingBubbles = useCallback((bubbleList: Bubble[]): Bubble[] => {
    const connected: Set<number> = new Set()
    const toCheck: Bubble[] = bubbleList.filter((b) => b.row === 0)

    while (toCheck.length > 0) {
      const current = toCheck.pop()!
      if (connected.has(current.id)) continue

      connected.add(current.id)

      // Find neighbors
      bubbleList.forEach((b) => {
        if (connected.has(b.id)) return

        const dx = b.x - current.x
        const dy = b.y - current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < BUBBLE_DIAMETER + 5) {
          toCheck.push(b)
        }
      })
    }

    return bubbleList.filter((b) => !connected.has(b.id))
  }, [])

  // Handle bubble collision and matching
  const handleBubbleCollision = useCallback((shootBubble: ShootingBubble, hitBubble: Bubble | null) => {
    // Find the grid position for the new bubble
    let newRow = 0
    let newCol = 0
    let minDist = Infinity

    // Check all possible positions
    for (let row = 0; row < ROWS; row++) {
      const colsInRow = row % 2 === 0 ? COLS : COLS - 1
      for (let col = 0; col < colsInRow; col++) {
        const { x, y } = getBubblePosition(row, col)
        const dx = shootBubble.x - x
        const dy = shootBubble.y - y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Check if position is empty
        const occupied = bubblesRef.current.some((b) => b.row === row && b.col === col)
        if (!occupied && dist < minDist) {
          minDist = dist
          newRow = row
          newCol = col
        }
      }
    }

    const { x, y } = getBubblePosition(newRow, newCol)
    const newBubble: Bubble = {
      id: Date.now(),
      row: newRow,
      col: newCol,
      color: shootBubble.color,
      x,
      y,
    }

    // Add new bubble
    let updatedBubbles = [...bubblesRef.current, newBubble]

    // Find matches
    const matches = findConnectedBubbles(updatedBubbles, newBubble)

    if (matches.length >= 3) {
      // Pop matching bubbles
      const matchIds = new Set(matches.map((b) => b.id))
      
      // Spawn particles for each popped bubble
      matches.forEach((b) => {
        spawnParticles(b.x, b.y, b.color, 12, true)
      })

      if (soundEnabledRef.current) playSound('match')

      // Remove matched bubbles
      updatedBubbles = updatedBubbles.filter((b) => !matchIds.has(b.id))

      // Find and drop floating bubbles
      const floaters = findFloatingBubbles(updatedBubbles)
      if (floaters.length > 0) {
        floaters.forEach((b) => {
          spawnParticles(b.x, b.y, b.color, 8)
        })
        if (soundEnabledRef.current) playSound('fall')
      }

      const floaterIds = new Set(floaters.map((b) => b.id))
      updatedBubbles = updatedBubbles.filter((b) => !floaterIds.has(b.id))

      // Calculate score
      const basePoints = matches.length * 10
      const floaterPoints = floaters.length * 20
      const comboMultiplier = 1 + combo * 0.5
      const levelMultiplier = level
      const totalPoints = Math.floor((basePoints + floaterPoints) * comboMultiplier * levelMultiplier)

      setScore((prev) => prev + totalPoints)
      setCombo((prev) => prev + 1)

      // Check for level complete
      if (updatedBubbles.length === 0) {
        setGameState('levelComplete')
        rewards.trackWin()
        setShowConfetti(true)
        if (soundEnabledRef.current) playSound('levelup')
        setTimeout(() => setShowConfetti(false), 2000)
      }
    } else {
      // No match - bubble sticks
      if (soundEnabledRef.current) playSound('pop')
      setCombo(0)

      // Check if game over (bubbles reached bottom)
      const lowestBubble = updatedBubbles.reduce((max, b) => b.y > max ? b.y : max, 0)
      if (lowestBubble >= SHOOTER_Y - BUBBLE_RADIUS * 2) {
        setGameState('gameover')
        saveHighScore(score, level)
        if (soundEnabledRef.current) playSound('lose')
      }
    }

    setBubbles(updatedBubbles)
    setShootingBubble(null)
    setGameState('aiming')
  }, [findConnectedBubbles, findFloatingBubbles, spawnParticles, combo, level, score, saveHighScore])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== 'shooting' || !shootingBubbleRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return
    }

    setShootingBubble((prev) => {
      if (!prev) return null

      let { x, y, vx, vy } = prev

      // Move bubble
      x += vx
      y += vy

      // Wall bounces
      if (x - BUBBLE_RADIUS <= 0) {
        x = BUBBLE_RADIUS
        vx = Math.abs(vx)
        if (soundEnabledRef.current) playSound('bounce')
      }
      if (x + BUBBLE_RADIUS >= CANVAS_WIDTH) {
        x = CANVAS_WIDTH - BUBBLE_RADIUS
        vx = -Math.abs(vx)
        if (soundEnabledRef.current) playSound('bounce')
      }

      // Top collision
      if (y - BUBBLE_RADIUS <= TOP_OFFSET) {
        handleBubbleCollision({ ...prev, x, y }, null)
        return null
      }

      // Check collision with existing bubbles
      for (const bubble of bubblesRef.current) {
        const dx = x - bubble.x
        const dy = y - bubble.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < BUBBLE_DIAMETER - 2) {
          handleBubbleCollision({ ...prev, x, y }, bubble)
          return null
        }
      }

      return { ...prev, x, y, vx, vy }
    })

    // Update particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3,
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0)
    )

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [handleBubbleCollision])

  // Start game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameLoop])

  // Handle aiming
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (gameState !== 'aiming' && gameState !== 'playing') return
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (clientX - rect.left) / scale
    const y = (clientY - rect.top) / scale

    const shooterX = CANVAS_WIDTH / 2
    const dx = x - shooterX
    const dy = y - SHOOTER_Y

    // Limit angle to reasonable range
    let angle = Math.atan2(dy, dx)
    angle = Math.max(-Math.PI + 0.2, Math.min(-0.2, angle))
    setAimAngle(angle)
  }, [gameState, scale])

  // Shoot bubble
  const shoot = useCallback(() => {
    if (gameState !== 'aiming' || shotsLeft <= 0) return

    const shooterX = CANVAS_WIDTH / 2
    const vx = Math.cos(aimAngle) * BUBBLE_SPEED
    const vy = Math.sin(aimAngle) * BUBBLE_SPEED

    setShootingBubble({
      x: shooterX,
      y: SHOOTER_Y,
      vx,
      vy,
      color: currentBubbleColor,
    })

    setShotsLeft((prev) => prev - 1)
    setCurrentBubbleColor(nextBubbleColor)
    setNextBubbleColor(getRandomColor(level))
    setGameState('shooting')

    if (soundEnabled) playSound('shoot')

    // Check if out of shots
    if (shotsLeft <= 1) {
      setTimeout(() => {
        if (gameStateRef.current !== 'levelComplete' && gameStateRef.current !== 'gameover') {
          setGameState('gameover')
          saveHighScore(score, level)
          if (soundEnabledRef.current) playSound('lose')
        }
      }, 1000)
    }
  }, [gameState, aimAngle, currentBubbleColor, nextBubbleColor, level, shotsLeft, soundEnabled, getRandomColor, score, saveHighScore])

  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    setLevel(1)
    setShotsLeft(getShotsForLevel(1))
    setBubbles(generateLevelBubbles(1))
    setCurrentBubbleColor(getRandomColor(1))
    setNextBubbleColor(getRandomColor(1))
    setShootingBubble(null)
    setParticles([])
    setCombo(0)
    setGameState('aiming')
    setShowConfetti(false)
    setIsNewHighScore(false)
  }, [getRandomColor])

  // Next level
  const nextLevel = useCallback(() => {
    const newLevel = level + 1
    if (newLevel > MAX_LEVEL) {
      setGameState('victory')
      saveHighScore(score, level)
      setShowConfetti(true)
      if (soundEnabled) playSound('win')
      return
    }

    setLevel(newLevel)
    setShotsLeft(getShotsForLevel(newLevel))
    setBubbles(generateLevelBubbles(newLevel))
    setCurrentBubbleColor(getRandomColor(newLevel))
    setNextBubbleColor(getRandomColor(newLevel))
    setShootingBubble(null)
    setParticles([])
    setCombo(0)
    setGameState('aiming')
    setShowConfetti(false)
  }, [level, score, soundEnabled, getRandomColor, saveHighScore])

  // Handle click/tap
  const handleClick = useCallback(() => {
    if (gameState === 'idle') {
      startGame()
    } else if (gameState === 'aiming') {
      shoot()
    } else if (gameState === 'levelComplete') {
      nextLevel()
    } else if (gameState === 'gameover' || gameState === 'victory') {
      startGame()
    }
  }, [gameState, startGame, shoot, nextLevel])

  // Calculate aim line points
  const aimLinePoints = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const shooterX = CANVAS_WIDTH / 2
    let x = shooterX
    let y = SHOOTER_Y
    let vx = Math.cos(aimAngle)
    let vy = Math.sin(aimAngle)

    for (let i = 0; i < 15; i++) {
      points.push({ x, y })
      x += vx * 25
      y += vy * 25

      // Bounce off walls
      if (x <= BUBBLE_RADIUS || x >= CANVAS_WIDTH - BUBBLE_RADIUS) {
        vx = -vx
      }

      if (y <= TOP_OFFSET + BUBBLE_RADIUS) break
    }

    return points
  }, [aimAngle])

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900"
      ref={containerRef}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade"
        className="absolute top-4 left-4 bg-white/10 backdrop-blur px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 text-white border border-white/20"
      >
        ← Arcade
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-white/10 backdrop-blur px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-white/20"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-black mb-2 mt-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
        🫧 Bubble Pop
      </h1>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-3 justify-center text-sm">
        <div className="px-4 py-1 rounded-full font-bold shadow-lg bg-white/10 backdrop-blur text-white border border-white/20">
          🎯 {score.toLocaleString()}
        </div>
        <div className="px-4 py-1 rounded-full font-bold shadow-lg bg-white/10 backdrop-blur text-yellow-300 border border-yellow-300/30">
          🏆 {highScore.toLocaleString()}
        </div>
        <div className="px-4 py-1 rounded-full font-bold shadow-lg bg-white/10 backdrop-blur text-cyan-300 border border-cyan-300/30">
          📊 Level {level}
        </div>
        <div className="px-4 py-1 rounded-full font-bold shadow-lg bg-white/10 backdrop-blur text-pink-300 border border-pink-300/30">
          🎱 {shotsLeft} shots
        </div>
        {combo > 0 && (
          <div className="px-4 py-1 rounded-full font-bold shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
            🔥 x{combo + 1} Combo!
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20"
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          background: 'linear-gradient(180deg, rgba(30,20,50,0.95) 0%, rgba(20,10,40,0.98) 100%)',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
        onClick={handleClick}
      >
        {/* Star pattern background */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute text-white animate-twinkle"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${i * 0.2}s`,
                fontSize: 4 + (i % 4) * 2,
              }}
            >
              ✦
            </div>
          ))}
        </div>

        {/* Particles */}
        <ParticleSystem particles={particles} />

        {/* Top boundary line */}
        <div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          style={{ top: TOP_OFFSET - 5 }}
        />

        {/* Bubbles */}
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute rounded-full transition-transform ${bubble.popping ? 'scale-150 opacity-0' : ''} ${bubble.falling ? 'animate-fall' : ''}`}
            style={{
              left: bubble.x - BUBBLE_RADIUS,
              top: bubble.y - BUBBLE_RADIUS,
              width: BUBBLE_DIAMETER,
              height: BUBBLE_DIAMETER,
              backgroundColor: bubble.color,
              boxShadow: `0 0 15px ${bubble.color}80, inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 10px rgba(255,255,255,0.3)`,
            }}
          >
            {/* Bubble shine */}
            <div
              className="absolute rounded-full bg-white/40"
              style={{
                left: 4,
                top: 4,
                width: 8,
                height: 8,
              }}
            />
          </div>
        ))}

        {/* Aim line */}
        {(gameState === 'aiming' || gameState === 'playing') && (
          <svg className="absolute inset-0 pointer-events-none" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            {aimLinePoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={3}
                fill="white"
                opacity={0.6 - i * 0.04}
              />
            ))}
          </svg>
        )}

        {/* Shooting bubble */}
        {shootingBubble && (
          <div
            className="absolute rounded-full"
            style={{
              left: shootingBubble.x - BUBBLE_RADIUS,
              top: shootingBubble.y - BUBBLE_RADIUS,
              width: BUBBLE_DIAMETER,
              height: BUBBLE_DIAMETER,
              backgroundColor: shootingBubble.color,
              boxShadow: `0 0 20px ${shootingBubble.color}, inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 10px rgba(255,255,255,0.3)`,
            }}
          >
            <div
              className="absolute rounded-full bg-white/40"
              style={{
                left: 4,
                top: 4,
                width: 8,
                height: 8,
              }}
            />
          </div>
        )}

        {/* Shooter area */}
        <div
          className="absolute left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent"
          style={{ bottom: 0, height: 80 }}
        >
          {/* Current bubble */}
          <div
            className="absolute rounded-full cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: CANVAS_WIDTH / 2 - BUBBLE_RADIUS,
              top: 20,
              width: BUBBLE_DIAMETER,
              height: BUBBLE_DIAMETER,
              backgroundColor: currentBubbleColor,
              boxShadow: `0 0 20px ${currentBubbleColor}, inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 10px rgba(255,255,255,0.3)`,
            }}
          >
            <div
              className="absolute rounded-full bg-white/40"
              style={{
                left: 4,
                top: 4,
                width: 8,
                height: 8,
              }}
            />
          </div>

          {/* Next bubble indicator */}
          <div className="absolute text-white/60 text-xs font-bold" style={{ left: CANVAS_WIDTH / 2 + 35, top: 30 }}>
            NEXT
          </div>
          <div
            className="absolute rounded-full"
            style={{
              left: CANVAS_WIDTH / 2 + 50,
              top: 25,
              width: BUBBLE_RADIUS,
              height: BUBBLE_RADIUS,
              backgroundColor: nextBubbleColor,
              boxShadow: `0 0 10px ${nextBubbleColor}60`,
            }}
          />

          {/* Shooter base */}
          <div
            className="absolute bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-full"
            style={{
              left: CANVAS_WIDTH / 2 - 30,
              top: 50,
              width: 60,
              height: 25,
              boxShadow: '0 -5px 15px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Danger zone indicator */}
        {bubbles.some((b) => b.y > SHOOTER_Y - BUBBLE_RADIUS * 4) && (
          <div
            className="absolute left-0 right-0 h-1 animate-pulse"
            style={{
              bottom: 80,
              background: 'linear-gradient(90deg, transparent, #ff4444, transparent)',
            }}
          />
        )}

        {/* Idle Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-7xl mb-4 animate-bounce">🫧</div>
            <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              BUBBLE POP
            </h2>
            <p className="text-gray-300 mb-6 text-center text-sm max-w-xs">
              Aim and shoot to match 3+ bubbles of the same color. Clear all bubbles to win!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg transition-all hover:scale-110 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
            >
              START GAME
            </button>
            <p className="text-gray-500 mt-4 text-xs">Tap or click to shoot</p>

            {/* Tips */}
            <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
              <p>🎯 Match 3+ same-colored bubbles</p>
              <p>💫 Drop disconnected bubbles for bonus points</p>
              <p>🔥 Build combos for higher scores!</p>
            </div>
          </div>
        )}

        {/* Level Complete */}
        {gameState === 'levelComplete' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              LEVEL {level} COMPLETE!
            </h2>
            <p className="text-gray-300 mb-4">Score: {score.toLocaleString()}</p>
            <button
              onClick={nextLevel}
              className="px-8 py-3 rounded-xl font-black text-lg transition-all hover:scale-110 bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg"
            >
              NEXT LEVEL →
            </button>
          </div>
        )}
      </div>

      {/* Mobile hint */}
      <p className="text-gray-400 text-xs mt-2 md:hidden">
        Slide to aim • Tap to shoot
      </p>

      {/* High scores button */}
      <button
        onClick={() => setShowHighScores(true)}
        className="mt-4 px-6 py-2 rounded-full font-bold transition-all hover:scale-105 bg-white/10 backdrop-blur text-yellow-300 border border-yellow-300/30"
      >
        🏆 High Scores
      </button>

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 bg-slate-900"
            style={{ borderColor: isNewHighScore ? '#ffd700' : '#ff4444' }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💔'}</div>
            <h2 className="text-3xl font-black mb-2" style={{ color: isNewHighScore ? '#ffd700' : '#ff4444' }}>
              {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}
            </h2>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{score.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{highScore.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Best</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{level}</div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => setShowHighScores(true)}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all bg-gray-700 text-yellow-300"
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
          <div className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-yellow-400 bg-slate-900">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black mb-2 text-yellow-400">
              VICTORY!
            </h2>
            <p className="text-gray-300 mb-4">You completed all {MAX_LEVEL} levels!</p>
            <div className="text-4xl font-bold text-white mb-6">
              {score.toLocaleString()} pts
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              🎮 Play Again
            </button>
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
            className="rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-yellow-400/30 max-h-[80vh] overflow-y-auto bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-yellow-400">
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
              <p className="text-gray-400 text-center py-8">
                No scores yet! Play a game to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {highScores.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      backgroundColor: index === 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <div className="font-bold text-white">{entry.score.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Level {entry.level}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes fall {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(200px); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-fall {
          animation: fall 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function BubblePopGame() {
  return (
    <GameWrapper gameName="Bubble Pop" gameId="bubble-pop" emoji={"🫧"}>
      <BubblePopGameInner />
    </GameWrapper>
  )
}
