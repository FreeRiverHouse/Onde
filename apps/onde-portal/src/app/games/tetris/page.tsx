'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'playing' | 'paused' | 'gameover'
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
type Cell = TetrominoType | null

interface Position {
  x: number
  y: number
}

interface Tetromino {
  type: TetrominoType
  shape: number[][]
  position: Position
}

interface HighScoreEntry {
  score: number
  level: number
  lines: number
  date: string
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

// Game constants
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_DROP_INTERVAL = 1000
const MIN_DROP_INTERVAL = 50
const LEVEL_SPEED_DECREASE = 80
const LINES_PER_LEVEL = 10
const LOCK_DELAY = 500

// Scoring (NES Tetris style)
const SCORE_SINGLE = 100
const SCORE_DOUBLE = 300
const SCORE_TRIPLE = 500
const SCORE_TETRIS = 800
const SCORE_SOFT_DROP = 1
const SCORE_HARD_DROP = 2

// Colors for each tetromino type
const TETROMINO_COLORS: Record<TetrominoType, { main: string; glow: string }> = {
  I: { main: '#00f5ff', glow: '#00d4e0' },
  O: { main: '#ffd700', glow: '#e6c200' },
  T: { main: '#bf00ff', glow: '#a000d4' },
  S: { main: '#00ff88', glow: '#00d970' },
  Z: { main: '#ff4757', glow: '#e0404e' },
  J: { main: '#3742fa', glow: '#2f39d4' },
  L: { main: '#ff8c00', glow: '#e07a00' },
}

// Tetromino shapes (rotation states)
const TETROMINOES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  O: [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
}

// Wall kick data (SRS - Super Rotation System)
const WALL_KICKS: Record<string, Position[][]> = {
  'JLSTZ': [
    // 0->R
    [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
    // R->2
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
    // 2->L
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    // L->0
    [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  ],
  'I': [
    // 0->R
    [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
    // R->2
    [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
    // 2->L
    [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
    // L->0
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  ],
}

// Sound effects
const playSound = (type: 'move' | 'rotate' | 'drop' | 'clear' | 'tetris' | 'levelup' | 'hold' | 'gameover') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'move':
        osc.type = 'square'
        osc.frequency.value = 200
        gain.gain.value = 0.08
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'rotate':
        osc.type = 'sine'
        osc.frequency.value = 400
        gain.gain.value = 0.12
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(600, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'drop':
        osc.type = 'triangle'
        osc.frequency.value = 150
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'clear':
        osc.type = 'square'
        osc.frequency.value = 523
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(784, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'tetris':
        osc.type = 'square'
        osc.frequency.value = 523
        gain.gain.value = 0.18
        osc.start()
        setTimeout(() => {
          const osc2 = audio.createOscillator()
          const gain2 = audio.createGain()
          osc2.connect(gain2)
          gain2.connect(audio.destination)
          osc2.type = 'square'
          osc2.frequency.value = 659
          gain2.gain.value = 0.18
          osc2.start()
          setTimeout(() => {
            const osc3 = audio.createOscillator()
            const gain3 = audio.createGain()
            osc3.connect(gain3)
            gain3.connect(audio.destination)
            osc3.type = 'square'
            osc3.frequency.value = 784
            gain3.gain.value = 0.18
            osc3.start()
            setTimeout(() => {
              const osc4 = audio.createOscillator()
              const gain4 = audio.createGain()
              osc4.connect(gain4)
              gain4.connect(audio.destination)
              osc4.type = 'square'
              osc4.frequency.value = 1047
              gain4.gain.value = 0.2
              osc4.start()
              gain4.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
              osc4.stop(audio.currentTime + 0.4)
            }, 80)
            gain3.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc3.stop(audio.currentTime + 0.2)
          }, 80)
          gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
          osc2.stop(audio.currentTime + 0.15)
        }, 80)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'levelup':
        osc.type = 'sine'
        osc.frequency.value = 440
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.15)
        osc.frequency.exponentialRampToValueAtTime(1320, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.35)
        osc.stop(audio.currentTime + 0.35)
        break
      case 'hold':
        osc.type = 'triangle'
        osc.frequency.value = 300
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(450, audio.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'gameover':
        osc.type = 'sawtooth'
        osc.frequency.value = 300
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(80, audio.currentTime + 0.8)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 1)
        osc.stop(audio.currentTime + 1)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Generate random bag of tetrominoes (7-bag randomizer)
const generateBag = (): TetrominoType[] => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[types[i], types[j]] = [types[j], types[i]]
  }
  return types
}

// Create a new tetromino
const createTetromino = (type: TetrominoType): Tetromino => ({
  type,
  shape: TETROMINOES[type][0],
  position: {
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOES[type][0][0].length / 2),
    y: 0,
  },
})

// Create empty board
const createBoard = (): Cell[][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))

// Check if position is valid
const isValidPosition = (
  board: Cell[][],
  shape: number[][],
  position: Position
): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = position.x + x
        const newY = position.y + y
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX] !== null)
        ) {
          return false
        }
      }
    }
  }
  return true
}

// Get ghost piece position
const getGhostPosition = (
  board: Cell[][],
  tetromino: Tetromino
): Position => {
  let ghostY = tetromino.position.y
  while (
    isValidPosition(board, tetromino.shape, {
      x: tetromino.position.x,
      y: ghostY + 1,
    })
  ) {
    ghostY++
  }
  return { x: tetromino.position.x, y: ghostY }
}

// Rotate shape
const rotateShape = (shape: number[][], clockwise: boolean): number[][] => {
  const rows = shape.length
  const cols = shape[0].length
  const rotated: number[][] = Array.from({ length: cols }, () =>
    Array(rows).fill(0)
  )

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (clockwise) {
        rotated[x][rows - 1 - y] = shape[y][x]
      } else {
        rotated[cols - 1 - x][y] = shape[y][x]
      }
    }
  }
  return rotated
}

// Get rotation state index
const getRotationIndex = (type: TetrominoType, shape: number[][]): number => {
  const shapes = TETROMINOES[type]
  for (let i = 0; i < shapes.length; i++) {
    if (JSON.stringify(shapes[i]) === JSON.stringify(shape)) {
      return i
    }
  }
  return 0
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#00f5ff', '#ffd700', '#bf00ff', '#00ff88', '#ff4757', '#3742fa', '#ff8c00']
  const confetti = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
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

// Particle System component
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

// Mini tetromino preview component
const TetrominoPreview = ({
  type,
  cellSize = 20,
  dimmed = false,
}: {
  type: TetrominoType | null
  cellSize?: number
  dimmed?: boolean
}) => {
  if (!type) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: cellSize * 4, height: cellSize * 2 }}
      >
        <span className="text-gray-600">-</span>
      </div>
    )
  }

  const shape = TETROMINOES[type][0]
  const color = TETROMINO_COLORS[type]

  // Find bounding box
  let minX = shape[0].length
  let maxX = 0
  let minY = shape.length
  let maxY = 0

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  const width = maxX - minX + 1
  const height = maxY - minY + 1

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: cellSize * 4,
        height: cellSize * 2,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize - 2}px)`,
        }}
      >
        {Array.from({ length: height }, (_, y) =>
          Array.from({ length: width }, (_, x) => {
            const filled = shape[y + minY]?.[x + minX]
            return (
              <div
                key={`${x}-${y}`}
                className="rounded-sm"
                style={{
                  width: cellSize - 2,
                  height: cellSize - 2,
                  backgroundColor: filled ? color.main : 'transparent',
                  boxShadow: filled
                    ? `0 0 ${cellSize / 2}px ${color.glow}80`
                    : 'none',
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

// Main game component
export default function TetrisGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle')
  const [board, setBoard] = useState<Cell[][]>(createBoard)
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null)
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null)
  const [canHold, setCanHold] = useState(true)
  const [nextPieces, setNextPieces] = useState<TetrominoType[]>([])
  const [bag, setBag] = useState<TetrominoType[]>([])

  // Stats
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])

  // UI state
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHighScores, setShowHighScores] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [cellSize, setCellSize] = useState(24)
  const [particles, setParticles] = useState<Particle[]>([])
  const [clearingLines, setClearingLines] = useState<number[]>([])
  const [screenShake, setScreenShake] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef(board)
  const currentPieceRef = useRef(currentPiece)
  const bagRef = useRef(bag)
  const gameStateRef = useRef(gameState)
  const scoreRef = useRef(score)
  const levelRef = useRef(level)
  const linesRef = useRef(lines)
  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastMoveRef = useRef<number>(0)

  // Keep refs in sync
  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { currentPieceRef.current = currentPiece }, [currentPiece])
  useEffect(() => { bagRef.current = bag }, [bag])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { levelRef.current = level }, [level])
  useEffect(() => { linesRef.current = lines }, [lines])

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = Math.min(containerRef.current.offsetWidth - 200, 500)
        const containerHeight = window.innerHeight - 200
        const maxCellWidth = Math.floor(containerWidth / BOARD_WIDTH)
        const maxCellHeight = Math.floor(containerHeight / BOARD_HEIGHT)
        setCellSize(Math.min(Math.max(16, Math.min(maxCellWidth, maxCellHeight)), 32))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('tetris-high-scores-v1')
    if (saved) {
      try {
        setHighScores(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      color,
      life: 1,
      size: 4 + Math.random() * 6,
    }))
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 150)
  }, [])

  // Particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5,
            life: p.life - 0.04,
          }))
          .filter((p) => p.life > 0)
      )
    }, 30)
    return () => clearInterval(interval)
  }, [])

  // Get next piece from bag
  const getNextPiece = useCallback((): TetrominoType => {
    let currentBag = bagRef.current
    if (currentBag.length === 0) {
      currentBag = generateBag()
      setBag(currentBag.slice(1))
      bagRef.current = currentBag.slice(1)
    } else {
      setBag(currentBag.slice(1))
      bagRef.current = currentBag.slice(1)
    }
    return currentBag[0]
  }, [])

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    // Ensure we have enough next pieces
    let currentNextPieces = [...nextPieces]
    while (currentNextPieces.length < 4) {
      currentNextPieces.push(getNextPiece())
    }

    const nextType = currentNextPieces[0]
    const newNextPieces = currentNextPieces.slice(1)
    newNextPieces.push(getNextPiece())
    setNextPieces(newNextPieces)

    const newPiece = createTetromino(nextType)

    // Check if game over
    if (!isValidPosition(boardRef.current, newPiece.shape, newPiece.position)) {
      setGameState('gameover')
      if (soundEnabled) playSound('gameover')
      saveHighScore(scoreRef.current, levelRef.current, linesRef.current)
      return
    }

    setCurrentPiece(newPiece)
    setCanHold(true)
  }, [nextPieces, getNextPiece, soundEnabled])

  // Save high score
  const saveHighScore = useCallback((finalScore: number, finalLevel: number, finalLines: number) => {
    const newEntry: HighScoreEntry = {
      score: finalScore,
      level: finalLevel,
      lines: finalLines,
      date: new Date().toISOString(),
    }

    const newScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setHighScores(newScores)
    localStorage.setItem('tetris-high-scores-v1', JSON.stringify(newScores))

    if (newScores[0]?.score === finalScore && finalScore > 0) {
      setIsNewHighScore(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }
  }, [highScores])

  // Lock piece to board
  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece) return

    const newBoard = boardRef.current.map((row) => [...row])

    // Add piece to board
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y
          const boardX = piece.position.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type
          }
        }
      }
    }

    // Check for completed lines
    const completedLines: number[] = []
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== null)) {
        completedLines.push(y)
      }
    }

    if (completedLines.length > 0) {
      setClearingLines(completedLines)

      // Spawn particles for cleared lines
      completedLines.forEach((lineY) => {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          const cellType = newBoard[lineY][x]
          if (cellType) {
            const color = TETROMINO_COLORS[cellType].main
            spawnParticles(
              x * cellSize + cellSize / 2,
              lineY * cellSize + cellSize / 2,
              color,
              5
            )
          }
        }
      })

      // Play sound
      if (soundEnabled) {
        if (completedLines.length === 4) {
          playSound('tetris')
          triggerShake()
        } else {
          playSound('clear')
        }
      }

      // Delay line removal for animation
      setTimeout(() => {
        // Remove completed lines
        const clearedBoard = newBoard.filter((_, y) => !completedLines.includes(y))
        while (clearedBoard.length < BOARD_HEIGHT) {
          clearedBoard.unshift(Array(BOARD_WIDTH).fill(null))
        }
        setBoard(clearedBoard)
        boardRef.current = clearedBoard
        setClearingLines([])

        // Update score and lines
        const linesCleared = completedLines.length
        const lineScore = [0, SCORE_SINGLE, SCORE_DOUBLE, SCORE_TRIPLE, SCORE_TETRIS][linesCleared] || 0
        setScore((prev) => prev + lineScore * levelRef.current)
        setLines((prev) => {
          const newLines = prev + linesCleared
          const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1
          if (newLevel > levelRef.current) {
            setLevel(newLevel)
            if (soundEnabled) playSound('levelup')
          }
          return newLines
        })

        // Spawn next piece
        spawnPiece()
      }, 200)
    } else {
      setBoard(newBoard)
      boardRef.current = newBoard
      if (soundEnabled) playSound('drop')
      spawnPiece()
    }

    setCurrentPiece(null)
    currentPieceRef.current = null
  }, [spawnPiece, cellSize, soundEnabled, spawnParticles, triggerShake])

  // Move piece
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    const piece = currentPieceRef.current
    if (!piece || gameStateRef.current !== 'playing') return false

    const newPosition = {
      x: piece.position.x + dx,
      y: piece.position.y + dy,
    }

    if (isValidPosition(boardRef.current, piece.shape, newPosition)) {
      setCurrentPiece({ ...piece, position: newPosition })
      if (dx !== 0 && soundEnabled) playSound('move')
      return true
    }
    return false
  }, [soundEnabled])

  // Rotate piece
  const rotatePiece = useCallback((clockwise: boolean = true) => {
    const piece = currentPieceRef.current
    if (!piece || gameStateRef.current !== 'playing') return

    const rotatedShape = rotateShape(piece.shape, clockwise)
    const currentRotation = getRotationIndex(piece.type, piece.shape)
    const nextRotation = clockwise
      ? (currentRotation + 1) % 4
      : (currentRotation + 3) % 4

    // Get wall kicks for this piece type
    const kickKey = piece.type === 'I' ? 'I' : 'JLSTZ'
    const kicks = WALL_KICKS[kickKey][currentRotation] || [{ x: 0, y: 0 }]

    // Try each wall kick
    for (const kick of kicks) {
      const newPosition = {
        x: piece.position.x + kick.x,
        y: piece.position.y + kick.y,
      }

      if (isValidPosition(boardRef.current, rotatedShape, newPosition)) {
        setCurrentPiece({
          ...piece,
          shape: TETROMINOES[piece.type][nextRotation],
          position: newPosition,
        })
        if (soundEnabled) playSound('rotate')
        return
      }
    }
  }, [soundEnabled])

  // Hard drop
  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece || gameStateRef.current !== 'playing') return

    const ghostPos = getGhostPosition(boardRef.current, piece)
    const dropDistance = ghostPos.y - piece.position.y

    setScore((prev) => prev + dropDistance * SCORE_HARD_DROP)
    setCurrentPiece({ ...piece, position: ghostPos })
    currentPieceRef.current = { ...piece, position: ghostPos }

    // Immediately lock
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current)
    }
    lockPiece()
  }, [lockPiece])

  // Hold piece
  const holdCurrentPiece = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece || !canHold || gameStateRef.current !== 'playing') return

    if (soundEnabled) playSound('hold')

    if (holdPiece) {
      // Swap with hold piece
      const newPiece = createTetromino(holdPiece)
      setHoldPiece(piece.type)
      setCurrentPiece(newPiece)
      currentPieceRef.current = newPiece
    } else {
      // First hold
      setHoldPiece(piece.type)
      setCurrentPiece(null)
      currentPieceRef.current = null
      spawnPiece()
    }
    setCanHold(false)
  }, [holdPiece, canHold, spawnPiece, soundEnabled])

  // Soft drop
  const softDrop = useCallback(() => {
    if (movePiece(0, 1)) {
      setScore((prev) => prev + SCORE_SOFT_DROP)
    }
  }, [movePiece])

  // Drop interval effect
  useEffect(() => {
    if (gameState !== 'playing' || !currentPiece) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current)
      }
      return
    }

    const dropSpeed = Math.max(
      MIN_DROP_INTERVAL,
      INITIAL_DROP_INTERVAL - (level - 1) * LEVEL_SPEED_DECREASE
    )

    dropIntervalRef.current = setInterval(() => {
      if (!movePiece(0, 1)) {
        // Piece can't move down, start lock delay
        if (!lockTimeoutRef.current) {
          lockTimeoutRef.current = setTimeout(() => {
            lockPiece()
            lockTimeoutRef.current = null
          }, LOCK_DELAY)
        }
      } else {
        // Piece moved, cancel lock delay
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current)
          lockTimeoutRef.current = null
        }
      }
    }, dropSpeed)

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current)
      }
    }
  }, [gameState, currentPiece, level, movePiece, lockPiece])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' || gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame()
        }
        return
      }

      if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          setGameState('playing')
        }
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          softDrop()
          break
        case 'ArrowUp':
        case 'x':
        case 'X':
          e.preventDefault()
          rotatePiece(true)
          break
        case 'z':
        case 'Z':
          e.preventDefault()
          rotatePiece(false)
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault()
          holdCurrentPiece()
          break
        case 'Escape':
        case 'p':
        case 'P':
          e.preventDefault()
          setGameState('paused')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, movePiece, rotatePiece, hardDrop, holdCurrentPiece, softDrop])

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return

    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    const now = Date.now()

    // Horizontal swipe for movement
    if (Math.abs(dx) > cellSize && now - lastMoveRef.current > 100) {
      if (dx > 0) {
        movePiece(1, 0)
      } else {
        movePiece(-1, 0)
      }
      touchStartRef.current.x = touch.clientX
      lastMoveRef.current = now
    }

    // Vertical swipe down for soft drop
    if (dy > cellSize * 1.5 && now - lastMoveRef.current > 50) {
      softDrop()
      touchStartRef.current.y = touch.clientY
      lastMoveRef.current = now
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    const dt = Date.now() - touchStartRef.current.time

    // Quick tap for rotation
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30 && dt < 200) {
      rotatePiece(true)
    }

    // Swipe up for hard drop
    if (dy < -cellSize * 3 && Math.abs(dx) < cellSize * 2) {
      hardDrop()
    }

    touchStartRef.current = null
  }

  // Start new game
  const startGame = () => {
    const initialBag = generateBag()
    setBag(initialBag)
    bagRef.current = initialBag

    const nextTypes: TetrominoType[] = []
    let tempBag = [...initialBag]
    for (let i = 0; i < 4; i++) {
      if (tempBag.length === 0) {
        tempBag = generateBag()
      }
      nextTypes.push(tempBag.shift()!)
    }
    setNextPieces(nextTypes.slice(1))
    setBag(tempBag)
    bagRef.current = tempBag

    const firstPiece = createTetromino(nextTypes[0])
    setCurrentPiece(firstPiece)
    currentPieceRef.current = firstPiece

    setBoard(createBoard())
    boardRef.current = createBoard()
    setHoldPiece(null)
    setCanHold(true)
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameState('playing')
    setShowConfetti(false)
    setIsNewHighScore(false)
    setParticles([])
    setClearingLines([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const boardWidth = cellSize * BOARD_WIDTH
  const boardHeight = cellSize * BOARD_HEIGHT

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: '#0a0a12' }}
      ref={containerRef}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games"
        className="absolute top-4 left-4 bg-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-cyan-500/30 text-cyan-400"
      >
        ← Games
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
        className="text-4xl md:text-5xl font-black mb-4 text-center font-mono tracking-widest"
        style={{
          color: '#00f5ff',
          textShadow: '0 0 20px #00f5ff, 0 0 40px #00f5ff60',
        }}
      >
        TETRIS
      </h1>

      {/* Game container */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
        {/* Left panel - Hold */}
        <div
          className="p-3 rounded-lg hidden md:block"
          style={{
            backgroundColor: '#12121a',
            border: '2px solid #1a2a3a',
            minWidth: 100,
          }}
        >
          <div className="text-gray-400 text-sm font-mono mb-2 text-center">HOLD</div>
          <TetrominoPreview type={holdPiece} cellSize={18} dimmed={!canHold} />
          <div className="text-gray-600 text-xs font-mono mt-2 text-center">C/Shift</div>
        </div>

        {/* Game Board */}
        <div
          className={`relative rounded-lg overflow-hidden shadow-2xl transition-transform ${
            screenShake ? 'animate-shake' : ''
          }`}
          style={{
            width: boardWidth + 4,
            height: boardHeight + 4,
            backgroundColor: '#0f0f1a',
            border: '2px solid #1a2a3a',
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.2), inset 0 0 60px rgba(0,0,0,0.8)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(#00f5ff20 1px, transparent 1px),
                linear-gradient(90deg, #00f5ff20 1px, transparent 1px)
              `,
              backgroundSize: `${cellSize}px ${cellSize}px`,
            }}
          />

          {/* Board cells */}
          {board.map((row, y) =>
            row.map((cell, x) => {
              const isClearing = clearingLines.includes(y)
              return (
                <div
                  key={`${x}-${y}`}
                  className={`absolute rounded-sm transition-all ${isClearing ? 'animate-pulse' : ''}`}
                  style={{
                    left: x * cellSize + 2,
                    top: y * cellSize + 2,
                    width: cellSize - 2,
                    height: cellSize - 2,
                    backgroundColor: cell
                      ? TETROMINO_COLORS[cell].main
                      : 'transparent',
                    boxShadow: cell
                      ? `inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.3), 0 0 ${cellSize / 2}px ${TETROMINO_COLORS[cell].glow}40`
                      : 'none',
                    opacity: isClearing ? 0 : 1,
                    transform: isClearing ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              )
            })
          )}

          {/* Ghost piece */}
          {currentPiece && gameState === 'playing' && (
            (() => {
              const ghostPos = getGhostPosition(board, currentPiece)
              return currentPiece.shape.map((row, y) =>
                row.map((cell, x) =>
                  cell ? (
                    <div
                      key={`ghost-${x}-${y}`}
                      className="absolute rounded-sm"
                      style={{
                        left: (ghostPos.x + x) * cellSize + 2,
                        top: (ghostPos.y + y) * cellSize + 2,
                        width: cellSize - 2,
                        height: cellSize - 2,
                        backgroundColor: TETROMINO_COLORS[currentPiece.type].main + '30',
                        border: `1px solid ${TETROMINO_COLORS[currentPiece.type].main}40`,
                      }}
                    />
                  ) : null
                )
              )
            })()
          )}

          {/* Current piece */}
          {currentPiece && gameState === 'playing' &&
            currentPiece.shape.map((row, y) =>
              row.map((cell, x) =>
                cell ? (
                  <div
                    key={`piece-${x}-${y}`}
                    className="absolute rounded-sm transition-all duration-50"
                    style={{
                      left: (currentPiece.position.x + x) * cellSize + 2,
                      top: (currentPiece.position.y + y) * cellSize + 2,
                      width: cellSize - 2,
                      height: cellSize - 2,
                      backgroundColor: TETROMINO_COLORS[currentPiece.type].main,
                      boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.3), 0 0 ${cellSize}px ${TETROMINO_COLORS[currentPiece.type].glow}60`,
                    }}
                  />
                ) : null
              )
            )}

          {/* Particles */}
          <ParticleSystem particles={particles} />

          {/* Idle overlay */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 p-4">
              <div className="text-5xl mb-4 animate-bounce">🎮</div>
              <h2
                className="text-2xl font-black mb-4 font-mono"
                style={{ color: '#00f5ff', textShadow: '0 0 15px #00f5ff' }}
              >
                CLASSIC TETRIS
              </h2>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl font-black text-lg font-mono transition-all hover:scale-110"
                style={{
                  backgroundColor: '#00f5ff',
                  color: '#000',
                  boxShadow: '0 0 30px #00f5ff, 0 0 60px #00f5ff60',
                }}
              >
                START GAME
              </button>
              <div className="mt-6 text-gray-400 text-xs font-mono text-center space-y-1">
                <p>← → Move • ↓ Soft Drop • ↑/X Rotate</p>
                <p>Z Counter-rotate • Space Hard Drop</p>
                <p>C/Shift Hold • P Pause</p>
              </div>
            </div>
          )}

          {/* Paused overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
              <div className="text-4xl mb-4">⏸️</div>
              <p
                className="text-2xl font-bold font-mono animate-pulse"
                style={{ color: '#00f5ff' }}
              >
                PAUSED
              </p>
              <p className="text-gray-400 mt-2 text-sm font-mono">Press P or ESC to continue</p>
            </div>
          )}
        </div>

        {/* Right panel - Stats & Next */}
        <div className="flex flex-col gap-3" style={{ minWidth: 110 }}>
          {/* Stats */}
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: '#12121a',
              border: '2px solid #1a2a3a',
            }}
          >
            <div className="space-y-2">
              <div>
                <div className="text-gray-400 text-xs font-mono">SCORE</div>
                <div
                  className="text-xl font-bold font-mono"
                  style={{ color: '#00f5ff', textShadow: '0 0 10px #00f5ff' }}
                >
                  {score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs font-mono">LEVEL</div>
                <div
                  className="text-xl font-bold font-mono"
                  style={{ color: '#ffd700', textShadow: '0 0 10px #ffd700' }}
                >
                  {level}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs font-mono">LINES</div>
                <div
                  className="text-xl font-bold font-mono"
                  style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88' }}
                >
                  {lines}
                </div>
              </div>
            </div>
          </div>

          {/* Next pieces */}
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: '#12121a',
              border: '2px solid #1a2a3a',
            }}
          >
            <div className="text-gray-400 text-sm font-mono mb-2 text-center">NEXT</div>
            <div className="space-y-2">
              {nextPieces.slice(0, 3).map((type, i) => (
                <div key={i} className={i > 0 ? 'opacity-50' : ''}>
                  <TetrominoPreview type={type} cellSize={i === 0 ? 18 : 14} />
                </div>
              ))}
            </div>
          </div>

          {/* Hold (mobile) */}
          <div
            className="p-3 rounded-lg md:hidden"
            style={{
              backgroundColor: '#12121a',
              border: '2px solid #1a2a3a',
            }}
          >
            <div className="text-gray-400 text-sm font-mono mb-2 text-center">HOLD</div>
            <TetrominoPreview type={holdPiece} cellSize={16} dimmed={!canHold} />
          </div>

          {/* High scores button */}
          <button
            onClick={() => setShowHighScores(true)}
            className="px-4 py-2 rounded-lg font-bold font-mono transition-all hover:scale-105 text-sm"
            style={{
              backgroundColor: '#1a1a2e',
              color: '#ffd700',
              border: '2px solid #ffd70040',
              textShadow: '0 0 10px #ffd700',
            }}
          >
            🏆 Scores
          </button>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-5 gap-2 md:hidden">
        <button
          onClick={() => rotatePiece(false)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: '#bf00ff',
            border: '2px solid #bf00ff40',
          }}
        >
          ↶
        </button>
        <button
          onClick={() => movePiece(-1, 0)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: '#00f5ff',
            border: '2px solid #00f5ff40',
          }}
        >
          ◀
        </button>
        <button
          onClick={hardDrop}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: '#ff4757',
            border: '2px solid #ff475740',
          }}
        >
          ⬇
        </button>
        <button
          onClick={() => movePiece(1, 0)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: '#00f5ff',
            border: '2px solid #00f5ff40',
          }}
        >
          ▶
        </button>
        <button
          onClick={() => rotatePiece(true)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: '#bf00ff',
            border: '2px solid #bf00ff40',
          }}
        >
          ↷
        </button>
        <button
          onClick={holdCurrentPiece}
          className="col-span-2 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: canHold ? '#ffd700' : '#666',
            border: '2px solid #ffd70040',
          }}
        >
          HOLD
        </button>
        <div />
        <button
          onClick={softDrop}
          className="col-span-2 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a2e',
            color: '#00ff88',
            border: '2px solid #00ff8840',
          }}
        >
          SOFT ▼
        </button>
      </div>

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{
              backgroundColor: '#12121a',
              borderColor: isNewHighScore ? '#ffd700' : '#ff4757',
            }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💥'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: isNewHighScore ? '#ffd700' : '#ff4757',
                textShadow: `0 0 20px ${isNewHighScore ? '#ffd700' : '#ff4757'}`,
              }}
            >
              {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER!'}
            </h2>
            {isNewHighScore && (
              <div className="text-yellow-400 text-xl mb-2 animate-pulse">⭐ Amazing! ⭐</div>
            )}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: '#00f5ff' }}>
                  {score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-yellow-400">{level}</div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: '#00ff88' }}>
                  {lines}
                </div>
                <div className="text-xs text-gray-400">Lines</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: '#00f5ff',
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
              backgroundColor: '#12121a',
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
                        <div className="text-xl font-bold font-mono" style={{ color: '#00f5ff' }}>
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Level {entry.level} • {entry.lines} lines
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
                localStorage.removeItem('tetris-high-scores-v1')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all font-mono"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

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
          animation: shake 0.15s ease-in-out;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
