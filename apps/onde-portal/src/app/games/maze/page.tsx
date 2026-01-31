'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }
type GameState = 'idle' | 'playing' | 'paused' | 'won' | 'lost'
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
type CellType = 'wall' | 'path' | 'start' | 'end' | 'collectible' | 'visited'

interface Cell {
  type: CellType
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  visited: boolean
  revealed: boolean
}

interface Collectible {
  x: number
  y: number
  type: 'star' | 'gem' | 'coin'
  points: number
  collected: boolean
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
  time: number
  date: string
  difficulty: Difficulty
  collectibles: number
}

// Difficulty settings
const DIFFICULTY_CONFIG: Record<Difficulty, { 
  size: number
  timeLimit: number
  collectibles: number
  fogRadius: number
  name: string
  emoji: string
}> = {
  easy: { size: 11, timeLimit: 120, collectibles: 3, fogRadius: 4, name: 'Easy', emoji: '🌱' },
  medium: { size: 15, timeLimit: 90, collectibles: 5, fogRadius: 3, name: 'Medium', emoji: '🌿' },
  hard: { size: 21, timeLimit: 75, collectibles: 7, fogRadius: 2, name: 'Hard', emoji: '🔥' },
  expert: { size: 27, timeLimit: 60, collectibles: 10, fogRadius: 1, name: 'Expert', emoji: '💀' },
}

// Neon colors
const COLORS = {
  background: '#0a0a0f',
  wall: '#1a1a2e',
  wallBorder: '#2a2a4e',
  path: '#0d0d15',
  player: '#00ff88',
  playerGlow: '#00ffcc',
  start: '#00aaff',
  end: '#ff00aa',
  collectible: '#ffd700',
  visited: '#00ff8815',
  fog: '#050508',
  text: '#00ff88',
  star: '#ffd700',
  gem: '#ff00ff',
  coin: '#ffaa00',
}

// Collectible definitions
const COLLECTIBLE_DEFS = {
  star: { emoji: '⭐', points: 50, color: COLORS.star },
  gem: { emoji: '💎', points: 100, color: COLORS.gem },
  coin: { emoji: '🪙', points: 25, color: COLORS.coin },
}

// Sound effects
const playSound = (type: 'move' | 'collect' | 'win' | 'lose' | 'start') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'move':
        osc.type = 'sine'
        osc.frequency.value = 200
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'collect':
        osc.type = 'square'
        osc.frequency.value = 440
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'win':
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const o = audio.createOscillator()
            const g = audio.createGain()
            o.connect(g)
            g.connect(audio.destination)
            o.type = 'square'
            o.frequency.value = freq
            g.gain.value = 0.15
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
      case 'start':
        osc.type = 'triangle'
        osc.frequency.value = 300
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(600, audio.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.25)
        osc.stop(audio.currentTime + 0.25)
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

// Maze generation using recursive backtracking
function generateMaze(size: number): Cell[][] {
  // Initialize grid with all walls
  const maze: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      type: 'path' as CellType,
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false,
      revealed: false,
    }))
  )

  const stack: Position[] = []
  const start: Position = { x: 1, y: 1 }
  
  // Mark start as visited
  maze[start.y][start.x].visited = true
  stack.push(start)

  // Helper to get unvisited neighbors
  const getUnvisitedNeighbors = (x: number, y: number): Position[] => {
    const neighbors: Position[] = []
    const directions = [
      { dx: 0, dy: -2 }, // up
      { dx: 2, dy: 0 },  // right
      { dx: 0, dy: 2 },  // down
      { dx: -2, dy: 0 }, // left
    ]

    for (const { dx, dy } of directions) {
      const nx = x + dx
      const ny = y + dy
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && !maze[ny][nx].visited) {
        neighbors.push({ x: nx, y: ny })
      }
    }

    return neighbors
  }

  // Generate maze using recursive backtracking
  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const neighbors = getUnvisitedNeighbors(current.x, current.y)

    if (neighbors.length === 0) {
      stack.pop()
    } else {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]
      
      // Remove wall between current and next
      const wallX = current.x + (next.x - current.x) / 2
      const wallY = current.y + (next.y - current.y) / 2
      
      maze[wallY][wallX].type = 'path'
      maze[next.y][next.x].visited = true
      
      // Update wall flags
      if (next.x > current.x) {
        maze[current.y][current.x].walls.right = false
        maze[next.y][next.x].walls.left = false
      } else if (next.x < current.x) {
        maze[current.y][current.x].walls.left = false
        maze[next.y][next.x].walls.right = false
      } else if (next.y > current.y) {
        maze[current.y][current.x].walls.bottom = false
        maze[next.y][next.x].walls.top = false
      } else {
        maze[current.y][current.x].walls.top = false
        maze[next.y][next.x].walls.bottom = false
      }
      
      stack.push(next)
    }
  }

  // Mark cells as walls or paths based on grid pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
        maze[y][x].type = 'wall'
      } else if (x % 2 === 0 || y % 2 === 0) {
        if (!maze[y][x].visited && maze[y][x].type !== 'path') {
          maze[y][x].type = 'wall'
        }
      }
      maze[y][x].visited = false // Reset for game
    }
  }

  // Set start and end
  maze[1][1].type = 'start'
  maze[size - 2][size - 2].type = 'end'

  return maze
}

// Place collectibles in the maze
function placeCollectibles(maze: Cell[][], count: number): Collectible[] {
  const size = maze.length
  const collectibles: Collectible[] = []
  const types: Array<'star' | 'gem' | 'coin'> = ['star', 'gem', 'coin']
  
  // Find all valid path positions (not start or end)
  const validPositions: Position[] = []
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (maze[y][x].type === 'path') {
        validPositions.push({ x, y })
      }
    }
  }

  // Shuffle and pick positions
  for (let i = validPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validPositions[i], validPositions[j]] = [validPositions[j], validPositions[i]]
  }

  const selectedPositions = validPositions.slice(0, Math.min(count, validPositions.length))

  for (const pos of selectedPositions) {
    const type = types[Math.floor(Math.random() * types.length)]
    const def = COLLECTIBLE_DEFS[type]
    collectibles.push({
      x: pos.x,
      y: pos.y,
      type,
      points: def.points,
      collected: false,
    })
  }

  return collectibles
}

// Difficulty selector
const DifficultySelector = ({
  selected,
  onSelect,
}: {
  selected: Difficulty
  onSelect: (d: Difficulty) => void
}) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {difficulties.map((d) => {
        const config = DIFFICULTY_CONFIG[d]
        return (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className={`p-3 rounded-xl font-bold text-sm transition-all ${
              selected === d ? 'scale-105' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: selected === d ? COLORS.player + '30' : '#222',
              border: `2px solid ${selected === d ? COLORS.player : '#333'}`,
              color: selected === d ? COLORS.player : '#888',
              boxShadow: selected === d ? `0 0 20px ${COLORS.player}40` : 'none',
            }}
          >
            <div className="text-2xl mb-1">{config.emoji}</div>
            <div>{config.name}</div>
            <div className="text-xs opacity-70">{config.size}×{config.size} • {config.timeLimit}s</div>
          </button>
        )
      })}
    </div>
  )
}

// Main component
export default function MazeGame() {
  const [maze, setMaze] = useState<Cell[][]>([])
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 })
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [fogOfWar, setFogOfWar] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [moves, setMoves] = useState(0)
  const [cellSize, setCellSize] = useState(20)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set())

  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const particleLoopRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const maxWidth = Math.min(containerRef.current.offsetWidth - 32, 500)
        const newSize = Math.floor(maxWidth / config.size)
        setCellSize(Math.max(12, Math.min(newSize, 25)))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [config.size])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('maze-high-scores')
    if (saved) {
      try {
        setHighScores(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('lost')
            if (soundEnabled) playSound('lose')
            return 0
          }
          return prev - 1
        })
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, soundEnabled])

  // Particle animation
  useEffect(() => {
    particleLoopRef.current = setInterval(() => {
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
    }, 30)
    return () => {
      if (particleLoopRef.current) clearInterval(particleLoopRef.current)
    }
  }, [])

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 15) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: x * cellSize + cellSize / 2,
      y: y * cellSize + cellSize / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color,
      life: 1,
      size: 3 + Math.random() * 5,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [cellSize])

  // Reveal cells around player (fog of war)
  const revealCells = useCallback((pos: Position, maze: Cell[][]) => {
    const radius = config.fogRadius
    const newMaze = [...maze.map(row => [...row])]
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const ny = pos.y + dy
        const nx = pos.x + dx
        if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= radius) {
            newMaze[ny][nx].revealed = true
          }
        }
      }
    }
    
    return newMaze
  }, [config.fogRadius])

  // Start game
  const startGame = useCallback(() => {
    const newMaze = generateMaze(config.size)
    const revealedMaze = revealCells({ x: 1, y: 1 }, newMaze)
    const newCollectibles = placeCollectibles(newMaze, config.collectibles)
    
    setMaze(revealedMaze)
    setCollectibles(newCollectibles)
    setPlayerPos({ x: 1, y: 1 })
    setScore(0)
    setTimeLeft(config.timeLimit)
    setElapsedTime(0)
    setMoves(0)
    setGameState('playing')
    setShowConfetti(false)
    setIsNewHighScore(false)
    setParticles([])
    setVisitedCells(new Set(['1,1']))
    
    if (soundEnabled) playSound('start')
  }, [config, revealCells, soundEnabled])

  // Save high score
  const saveHighScore = useCallback((finalScore: number, time: number, collected: number) => {
    const newEntry: HighScoreEntry = {
      score: finalScore,
      time,
      date: new Date().toISOString(),
      difficulty,
      collectibles: collected,
    }

    const newScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setHighScores(newScores)
    localStorage.setItem('maze-high-scores', JSON.stringify(newScores))

    if (newScores[0]?.score === finalScore && finalScore > 0) {
      setIsNewHighScore(true)
    }
  }, [highScores, difficulty])

  // Move player
  const movePlayer = useCallback((direction: Direction) => {
    if (gameState !== 'playing') return

    setPlayerPos((prev) => {
      let newX = prev.x
      let newY = prev.y

      switch (direction) {
        case 'UP': newY -= 1; break
        case 'DOWN': newY += 1; break
        case 'LEFT': newX -= 1; break
        case 'RIGHT': newX += 1; break
      }

      // Check bounds and walls
      if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) {
        return prev
      }

      if (maze[newY][newX].type === 'wall') {
        return prev
      }

      // Valid move
      if (soundEnabled) playSound('move')
      setMoves((m) => m + 1)

      // Track visited cells
      const cellKey = `${newX},${newY}`
      setVisitedCells((visited) => new Set([...visited, cellKey]))

      // Reveal fog
      if (fogOfWar) {
        setMaze((m) => revealCells({ x: newX, y: newY }, m))
      }

      // Check collectibles
      setCollectibles((cols) => {
        const collected = cols.find((c) => c.x === newX && c.y === newY && !c.collected)
        if (collected) {
          const def = COLLECTIBLE_DEFS[collected.type]
          spawnParticles(newX, newY, def.color, 25)
          if (soundEnabled) playSound('collect')
          setScore((s) => s + collected.points)
          return cols.map((c) =>
            c.x === newX && c.y === newY ? { ...c, collected: true } : c
          )
        }
        return cols
      })

      // Check win condition
      if (maze[newY][newX].type === 'end') {
        const collectedCount = collectibles.filter((c) => c.collected).length + 
          (collectibles.find((c) => c.x === newX && c.y === newY && !c.collected) ? 1 : 0)
        const timeBonus = timeLeft * 10
        const moveBonus = Math.max(0, 500 - moves * 2)
        const finalScore = score + timeBonus + moveBonus + 
          (collectibles.find((c) => c.x === newX && c.y === newY && !c.collected)?.points || 0)
        
        setScore(finalScore)
        setGameState('won')
        setShowConfetti(true)
        saveHighScore(finalScore, elapsedTime, collectedCount)
        if (soundEnabled) playSound('win')
        setTimeout(() => setShowConfetti(false), 4000)
      }

      return { x: newX, y: newY }
    })
  }, [gameState, maze, collectibles, fogOfWar, soundEnabled, revealCells, spawnParticles, score, timeLeft, moves, elapsedTime, saveHighScore])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' || gameState === 'won' || gameState === 'lost') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame()
        }
        return
      }

      if (gameState !== 'playing') return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          movePlayer('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          movePlayer('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePlayer('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePlayer('RIGHT')
          break
        case ' ':
          e.preventDefault()
          setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, movePlayer, startGame])

  // Touch controls
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

    if (gameState === 'idle' || gameState === 'won' || gameState === 'lost') {
      startGame()
      touchStartRef.current = null
      return
    }

    if (gameState !== 'playing') return

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > minSwipe) movePlayer('RIGHT')
      else if (dx < -minSwipe) movePlayer('LEFT')
    } else {
      if (dy > minSwipe) movePlayer('DOWN')
      else if (dy < -minSwipe) movePlayer('UP')
    }

    touchStartRef.current = null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const collectedCount = collectibles.filter((c) => c.collected).length
  const boardSize = cellSize * config.size

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
          textShadow: `0 0 20px ${COLORS.player}, 0 0 40px ${COLORS.player}60`,
        }}
      >
        🌀 MAZE
      </h1>
      <p className="text-gray-500 mb-2 text-center font-mono text-xs">
        FIND YOUR WAY OUT
      </p>

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
          ⏱️ {formatTime(timeLeft)}
        </div>
        <div
          className="px-3 py-1 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.collectible,
            borderColor: COLORS.collectible + '40',
            textShadow: `0 0 10px ${COLORS.collectible}`,
          }}
        >
          ⭐ {collectedCount}/{collectibles.length}
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
          👣 {moves}
        </div>
      </div>

      {/* Fog toggle */}
      {gameState === 'idle' && (
        <button
          onClick={() => setFogOfWar(!fogOfWar)}
          className="mb-2 px-4 py-1 rounded-full text-sm font-mono transition-all"
          style={{
            backgroundColor: fogOfWar ? '#333' : '#222',
            color: fogOfWar ? '#00ccff' : '#666',
            border: `1px solid ${fogOfWar ? '#00ccff40' : '#333'}`,
          }}
        >
          {fogOfWar ? '🌫️ Fog ON' : '☀️ Fog OFF'}
        </button>
      )}

      {/* Game Board */}
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: boardSize,
          height: boardSize,
          backgroundColor: COLORS.fog,
          border: `4px solid ${COLORS.wallBorder}`,
          boxShadow: `0 0 40px ${COLORS.player}20, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Particles */}
        <ParticleSystem particles={particles} />

        {/* Maze cells */}
        {maze.map((row, y) =>
          row.map((cell, x) => {
            const isVisible = !fogOfWar || cell.revealed
            const isPlayer = playerPos.x === x && playerPos.y === y
            const collectible = collectibles.find((c) => c.x === x && c.y === y && !c.collected)
            const isVisited = visitedCells.has(`${x},${y}`)

            return (
              <div
                key={`${x}-${y}`}
                className="absolute transition-all duration-200"
                style={{
                  left: x * cellSize,
                  top: y * cellSize,
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: !isVisible
                    ? COLORS.fog
                    : cell.type === 'wall'
                      ? COLORS.wall
                      : cell.type === 'start'
                        ? COLORS.start + '30'
                        : cell.type === 'end'
                          ? COLORS.end + '30'
                          : isVisited
                            ? COLORS.visited
                            : COLORS.path,
                  borderRadius: cell.type === 'wall' ? '2px' : '0',
                  boxShadow: cell.type === 'wall' && isVisible
                    ? `inset 0 0 ${cellSize / 2}px ${COLORS.wallBorder}`
                    : cell.type === 'end' && isVisible
                      ? `0 0 ${cellSize}px ${COLORS.end}`
                      : undefined,
                  opacity: isVisible ? 1 : 1,
                }}
              >
                {/* Start marker */}
                {cell.type === 'start' && isVisible && !isPlayer && (
                  <div
                    className="absolute inset-1 rounded-full animate-pulse"
                    style={{
                      backgroundColor: COLORS.start + '50',
                      boxShadow: `0 0 ${cellSize}px ${COLORS.start}`,
                    }}
                  />
                )}

                {/* End marker */}
                {cell.type === 'end' && isVisible && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="animate-pulse"
                      style={{ fontSize: cellSize * 0.7 }}
                    >
                      🚪
                    </span>
                  </div>
                )}

                {/* Collectible */}
                {collectible && isVisible && (
                  <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                    <span style={{ fontSize: cellSize * 0.6 }}>
                      {COLLECTIBLE_DEFS[collectible.type].emoji}
                    </span>
                  </div>
                )}

                {/* Player */}
                {isPlayer && (
                  <div
                    className="absolute inset-1 rounded-full animate-pulse"
                    style={{
                      backgroundColor: COLORS.player,
                      boxShadow: `0 0 ${cellSize}px ${COLORS.playerGlow}, 0 0 ${cellSize * 2}px ${COLORS.player}60`,
                    }}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ fontSize: cellSize * 0.5 }}
                    >
                      😊
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-20 p-4">
            <div className="text-5xl mb-2 animate-bounce">🌀</div>
            <h2
              className="text-xl font-black mb-3 font-mono"
              style={{ color: COLORS.text, textShadow: `0 0 15px ${COLORS.player}` }}
            >
              MAZE RUNNER
            </h2>

            <DifficultySelector selected={difficulty} onSelect={setDifficulty} />

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.player,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.player}, 0 0 60px ${COLORS.player}60`,
              }}
            >
              START MAZE
            </button>
            <p className="text-gray-400 mt-3 text-xs font-mono">Arrow keys / Swipe to move</p>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>⭐ Stars +50</span>
              <span>💎 Gems +100</span>
              <span>🪙 Coins +25</span>
              <span>🚪 Exit!</span>
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
            if (gameState === 'idle' || gameState === 'won' || gameState === 'lost') {
              startGame()
            } else {
              movePlayer('UP')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}40`,
          }}
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => movePlayer('LEFT')}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}40`,
          }}
        >
          ◀
        </button>
        <button
          onClick={() => movePlayer('DOWN')}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}40`,
          }}
        >
          ▼
        </button>
        <button
          onClick={() => movePlayer('RIGHT')}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.player}40`,
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

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{
              backgroundColor: '#111',
              borderColor: isNewHighScore ? '#ffd700' : COLORS.player,
            }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '🏆'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: isNewHighScore ? '#ffd700' : COLORS.player,
                textShadow: `0 0 20px ${isNewHighScore ? '#ffd700' : COLORS.player}`,
              }}
            >
              {isNewHighScore ? 'NEW HIGH SCORE!' : 'MAZE COMPLETE!'}
            </h2>
            <div className="text-gray-400 text-sm mb-3">{config.name.toUpperCase()} MODE</div>
            
            <div className="flex justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.text }}>
                  {score}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-blue-400">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-xs text-gray-400">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-yellow-400">
                  {collectedCount}/{collectibles.length}
                </div>
                <div className="text-xs text-gray-400">Collected</div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Time bonus: +{timeLeft * 10} • Move bonus: +{Math.max(0, 500 - moves * 2)}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{ backgroundColor: COLORS.player, color: '#000' }}
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => setShowHighScores(true)}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{ backgroundColor: '#333', color: '#ffd700' }}
              >
                🏆 Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'lost' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{ backgroundColor: '#111', borderColor: '#ff4444' }}
          >
            <div className="text-6xl mb-4">⏰</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{ color: '#ff4444', textShadow: '0 0 20px #ff4444' }}
            >
              TIME&apos;S UP!
            </h2>
            <div className="text-gray-400 text-sm mb-3">{config.name.toUpperCase()} MODE</div>

            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.text }}>
                  {score}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-yellow-400">
                  {collectedCount}/{collectibles.length}
                </div>
                <div className="text-xs text-gray-400">Collected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: '#ff6b6b' }}>
                  {moves}
                </div>
                <div className="text-xs text-gray-400">Moves</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{ backgroundColor: COLORS.player, color: '#000' }}
              >
                🎮 Try Again
              </button>
              <button
                onClick={() => {
                  setGameState('idle')
                }}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{ backgroundColor: '#333', color: '#888' }}
              >
                🔧 Settings
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
            style={{ backgroundColor: '#111', borderColor: '#ffd70060' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-2xl font-black font-mono"
                style={{ color: '#ffd700', textShadow: '0 0 15px #ffd700' }}
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
                No scores yet! Complete a maze to set a record.
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
                          {formatTime(entry.time)} • {DIFFICULTY_CONFIG[entry.difficulty].emoji} {entry.difficulty}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                      ⭐{entry.collectibles}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setHighScores([])
                localStorage.removeItem('maze-high-scores')
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
