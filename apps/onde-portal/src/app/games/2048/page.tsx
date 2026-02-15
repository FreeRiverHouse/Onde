'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type GameState = 'playing' | 'won' | 'gameover'
type Cell = number | null
type Grid = Cell[][]

interface GameSnapshot {
  grid: Grid
  score: number
}

interface HighScoreEntry {
  score: number
  maxTile: number
  date: string
}

interface TileAnimation {
  id: string
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
  value: number
  isNew: boolean
  isMerged: boolean
}

// Constants
const GRID_SIZE = 4
const WINNING_TILE = 2048
const MAX_UNDO_HISTORY = 20

// Colors for tiles
const TILE_COLORS: Record<number, { bg: string; text: string; glow: string }> = {
  2: { bg: '#eee4da', text: '#776e65', glow: '#eee4da40' },
  4: { bg: '#ede0c8', text: '#776e65', glow: '#ede0c840' },
  8: { bg: '#f2b179', text: '#f9f6f2', glow: '#f2b17960' },
  16: { bg: '#f59563', text: '#f9f6f2', glow: '#f5956360' },
  32: { bg: '#f67c5f', text: '#f9f6f2', glow: '#f67c5f60' },
  64: { bg: '#f65e3b', text: '#f9f6f2', glow: '#f65e3b80' },
  128: { bg: '#edcf72', text: '#f9f6f2', glow: '#edcf7280' },
  256: { bg: '#edcc61', text: '#f9f6f2', glow: '#edcc6180' },
  512: { bg: '#edc850', text: '#f9f6f2', glow: '#edc85090' },
  1024: { bg: '#edc53f', text: '#f9f6f2', glow: '#edc53fa0' },
  2048: { bg: '#edc22e', text: '#f9f6f2', glow: '#edc22eb0' },
  4096: { bg: '#3c3a32', text: '#f9f6f2', glow: '#ff6b6b80' },
  8192: { bg: '#3c3a32', text: '#f9f6f2', glow: '#4ecdc480' },
}

// Sound effects
const playSound = (type: 'move' | 'merge' | 'win' | 'lose' | 'undo') => {
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
        osc.frequency.exponentialRampToValueAtTime(300, audio.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.08)
        osc.stop(audio.currentTime + 0.08)
        break
      case 'merge':
        osc.type = 'square'
        osc.frequency.value = 400
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(800, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'win':
        osc.type = 'sine'
        osc.frequency.value = 523.25
        gain.gain.value = 0.05
        osc.start()
        setTimeout(() => {
          osc.frequency.value = 659.25
          setTimeout(() => {
            osc.frequency.value = 783.99
            setTimeout(() => {
              osc.frequency.value = 1046.5
            }, 100)
          }, 100)
        }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
        break
      case 'lose':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.05
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.4)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
      case 'undo':
        osc.type = 'triangle'
        osc.frequency.value = 500
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(300, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.12)
        osc.stop(audio.currentTime + 0.12)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#edc22e', '#f67c5f', '#f2b179', '#edcf72', '#f59563', '#f65e3b']
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

// Tile component with animations
const Tile = ({
  value,
  cellSize,
  isNew,
  isMerged,
}: {
  value: number
  cellSize: number
  isNew: boolean
  isMerged: boolean
}) => {
  const colors = TILE_COLORS[value] || TILE_COLORS[8192]
  const fontSize = value >= 1024 ? cellSize * 0.28 : value >= 128 ? cellSize * 0.35 : cellSize * 0.45

  return (
    <div
      className={`absolute inset-1 rounded-lg flex items-center justify-center font-black transition-all duration-100 ${
        isNew ? 'animate-popIn' : ''
      } ${isMerged ? 'animate-pulse-once' : ''}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: `${fontSize}px`,
        boxShadow: value >= 128 ? `0 0 ${cellSize / 2}px ${colors.glow}` : 'none',
      }}
    >
      {value}
    </div>
  )
}

// Helper functions
const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null))
}

const cloneGrid = (grid: Grid): Grid => {
  return grid.map((row) => [...row])
}

const getEmptyCells = (grid: Grid): { row: number; col: number }[] => {
  const empty: { row: number; col: number }[] = []
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        empty.push({ row, col })
      }
    }
  }
  return empty
}

const addRandomTile = (grid: Grid): { grid: Grid; position: { row: number; col: number } | null } => {
  const emptyCells = getEmptyCells(grid)
  if (emptyCells.length === 0) return { grid, position: null }

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const newGrid = cloneGrid(grid)
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4
  return { grid: newGrid, position: { row, col } }
}

const getMaxTile = (grid: Grid): number => {
  let max = 0
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] !== null && grid[row][col]! > max) {
        max = grid[row][col]!
      }
    }
  }
  return max
}

const canMove = (grid: Grid): boolean => {
  // Check for empty cells
  if (getEmptyCells(grid).length > 0) return true

  // Check for possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = grid[row][col]
      // Check right neighbor
      if (col < GRID_SIZE - 1 && grid[row][col + 1] === value) return true
      // Check bottom neighbor
      if (row < GRID_SIZE - 1 && grid[row + 1][col] === value) return true
    }
  }
  return false
}

const moveAndMerge = (
  line: Cell[]
): { newLine: Cell[]; score: number; merged: boolean[] } => {
  // Filter out nulls
  const tiles = line.filter((cell) => cell !== null) as number[]
  const merged: boolean[] = Array(GRID_SIZE).fill(false)
  let score = 0

  // Merge adjacent equal tiles
  const result: number[] = []
  let i = 0
  while (i < tiles.length) {
    if (i < tiles.length - 1 && tiles[i] === tiles[i + 1]) {
      const mergedValue = tiles[i] * 2
      result.push(mergedValue)
      merged[result.length - 1] = true
      score += mergedValue
      i += 2
    } else {
      result.push(tiles[i])
      i++
    }
  }

  // Pad with nulls
  const newLine: Cell[] = [...result, ...Array(GRID_SIZE - result.length).fill(null)]
  return { newLine, score, merged }
}

const move = (
  grid: Grid,
  direction: Direction
): { newGrid: Grid; score: number; moved: boolean; mergedPositions: Set<string> } => {
  let newGrid = cloneGrid(grid)
  let totalScore = 0
  let moved = false
  const mergedPositions = new Set<string>()

  const processLine = (line: Cell[], lineIndex: number, isRow: boolean, reversed: boolean) => {
    const { newLine, score, merged } = moveAndMerge(reversed ? [...line].reverse() : line)
    const finalLine = reversed ? [...newLine].reverse() : newLine
    const finalMerged = reversed ? [...merged].reverse() : merged

    totalScore += score

    for (let i = 0; i < GRID_SIZE; i++) {
      const row = isRow ? lineIndex : i
      const col = isRow ? i : lineIndex
      if (newGrid[row][col] !== finalLine[i]) {
        moved = true
      }
      newGrid[row][col] = finalLine[i]
      if (finalMerged[i]) {
        mergedPositions.add(`${row}-${col}`)
      }
    }
  }

  switch (direction) {
    case 'LEFT':
      for (let row = 0; row < GRID_SIZE; row++) {
        processLine(newGrid[row], row, true, false)
      }
      break
    case 'RIGHT':
      for (let row = 0; row < GRID_SIZE; row++) {
        processLine(newGrid[row], row, true, true)
      }
      break
    case 'UP':
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = newGrid.map((row) => row[col])
        processLine(column, col, false, false)
      }
      break
    case 'DOWN':
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = newGrid.map((row) => row[col])
        processLine(column, col, false, true)
      }
      break
  }

  return { newGrid, score: totalScore, moved, mergedPositions }
}

// Main game component
function Game2048Inner() {
  const rewards = useGameContext()
  const [grid, setGrid] = useState<Grid>(createEmptyGrid())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [history, setHistory] = useState<GameSnapshot[]>([])
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [showHighScores, setShowHighScores] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [newTilePosition, setNewTilePosition] = useState<{ row: number; col: number } | null>(null)
  const [mergedPositions, setMergedPositions] = useState<Set<string>>(new Set())
  const [cellSize, setCellSize] = useState(80)
  const [continueAfterWin, setContinueAfterWin] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = Math.min(containerRef.current.offsetWidth - 32, 400)
        setCellSize(Math.floor((containerWidth - 40) / GRID_SIZE))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [])

  // Initialize game
  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid()
    const first = addRandomTile(newGrid)
    newGrid = first.grid
    const second = addRandomTile(newGrid)
    newGrid = second.grid
    setGrid(newGrid)
    setScore(0)
    setHistory([])
    setGameState('playing')
    setShowConfetti(false)
    setContinueAfterWin(false)
    setNewTilePosition(second.position)
    setMergedPositions(new Set())
  }, [])

  // Load saved data on mount
  useEffect(() => {
    const savedBest = localStorage.getItem('2048-best-score')
    if (savedBest) {
      setBestScore(parseInt(savedBest, 10))
    }

    const savedHighScores = localStorage.getItem('2048-high-scores')
    if (savedHighScores) {
      try {
        setHighScores(JSON.parse(savedHighScores))
      } catch {
        // Invalid data
      }
    }

    const savedGame = localStorage.getItem('2048-game-state')
    if (savedGame) {
      try {
        const { grid: savedGrid, score: savedScore, history: savedHistory } = JSON.parse(savedGame)
        // Validate that the saved grid actually has tiles
        const hasTiles = savedGrid && savedGrid.some((row: Cell[]) => row.some((cell: Cell) => cell !== null))
        if (hasTiles) {
          setGrid(savedGrid)
          setScore(savedScore)
          setHistory(savedHistory || [])
        } else {
          // Saved state was empty/corrupted, start fresh
          localStorage.removeItem('2048-game-state')
          initGame()
        }
      } catch {
        localStorage.removeItem('2048-game-state')
        initGame()
      }
    } else {
      initGame()
    }
  }, [initGame])

  // Save game state (only when grid has tiles - avoid saving empty initial state)
  useEffect(() => {
    if (gameState === 'playing' && grid.some(row => row.some(cell => cell !== null))) {
      localStorage.setItem('2048-game-state', JSON.stringify({ grid, score, history }))
    }
  }, [grid, score, history, gameState])

  // Save best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score)
      localStorage.setItem('2048-best-score', score.toString())
    }
  }, [score, bestScore])

  // Save high score on game over
  const saveHighScore = useCallback(() => {
    const maxTile = getMaxTile(grid)
    const newEntry: HighScoreEntry = {
      score,
      maxTile,
      date: new Date().toISOString(),
    }

    const newScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    setHighScores(newScores)
    localStorage.setItem('2048-high-scores', JSON.stringify(newScores))
  }, [grid, score, highScores])

  // Handle move
  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState === 'gameover') return
      if (gameState === 'won' && !continueAfterWin) return

      const { newGrid, score: moveScore, moved, mergedPositions: newMerged } = move(grid, direction)

      if (!moved) return

      // Save to history for undo
      setHistory((prev) => {
        const newHistory = [...prev, { grid: cloneGrid(grid), score }]
        return newHistory.slice(-MAX_UNDO_HISTORY)
      })

      // Add new tile
      const { grid: gridWithNewTile, position } = addRandomTile(newGrid)

      setGrid(gridWithNewTile)
      setScore((prev) => prev + moveScore)
      setNewTilePosition(position)
      setMergedPositions(newMerged)

      if (soundEnabled) {
        if (newMerged.size > 0) {
          playSound('merge')
        } else {
          playSound('move')
        }
      }

      // Check win condition
      const maxTile = getMaxTile(gridWithNewTile)
      if (maxTile >= WINNING_TILE && gameState !== 'won' && !continueAfterWin) {
        setGameState('won')
        rewards.trackWin()
        setShowConfetti(true)
        if (soundEnabled) playSound('win')
        setTimeout(() => setShowConfetti(false), 3000)
        return
      }

      // Check game over
      if (!canMove(gridWithNewTile)) {
        setGameState('gameover')
        if (soundEnabled) playSound('lose')
        saveHighScore()
        localStorage.removeItem('2048-game-state')
      }
    },
    [grid, score, gameState, continueAfterWin, soundEnabled, saveHighScore]
  )

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return

    const lastState = history[history.length - 1]
    setGrid(lastState.grid)
    setScore(lastState.score)
    setHistory((prev) => prev.slice(0, -1))
    setNewTilePosition(null)
    setMergedPositions(new Set())

    if (gameState === 'gameover') {
      setGameState('playing')
    }

    if (soundEnabled) playSound('undo')
  }, [history, gameState, soundEnabled])

  // Continue after win
  const handleContinue = useCallback(() => {
    setContinueAfterWin(true)
    setGameState('playing')
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          handleMove('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          handleMove('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          handleMove('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          handleMove('RIGHT')
          break
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleUndo()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMove, handleUndo])

  // Touch/swipe controls
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
    const minSwipe = 50

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) < minSwipe) {
      touchStartRef.current = null
      return
    }

    if (absDx > absDy) {
      handleMove(dx > 0 ? 'RIGHT' : 'LEFT')
    } else {
      handleMove(dy > 0 ? 'DOWN' : 'UP')
    }

    touchStartRef.current = null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const boardSize = cellSize * GRID_SIZE + 32

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 overflow-hidden"
      style={{ backgroundColor: '#faf8ef' }}
      ref={containerRef}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade/"
        className="absolute top-4 left-4 bg-[#8f7a66] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-all z-10"
      >
        ← Arcade
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-[#8f7a66] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-all z-10"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1 className="text-5xl md:text-7xl font-black mt-16 mb-2 text-[#776e65]">2048</h1>
      <p className="text-[#8f7a66] mb-4 text-sm">Join the tiles, get to 2048!</p>

      {/* Score display */}
      <div className="flex gap-4 mb-4">
        <div className="bg-[#bbada0] px-6 py-3 rounded-lg text-center min-w-[100px]">
          <div className="text-[#eee4da] text-xs font-bold uppercase">Score</div>
          <div className="text-white text-2xl font-black">{score}</div>
        </div>
        <div className="bg-[#bbada0] px-6 py-3 rounded-lg text-center min-w-[100px]">
          <div className="text-[#eee4da] text-xs font-bold uppercase">Best</div>
          <div className="text-white text-2xl font-black">{bestScore}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={initGame}
          className="bg-[#8f7a66] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#9f8b77] transition-all active:scale-95"
        >
          🔄 New Game
        </button>
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className={`px-4 py-2 rounded-lg font-bold transition-all active:scale-95 ${
            history.length > 0
              ? 'bg-[#8f7a66] text-white hover:bg-[#9f8b77]'
              : 'bg-[#cdc1b4] text-[#a89d91] cursor-not-allowed'
          }`}
        >
          ↩️ Undo ({history.length})
        </button>
        <button
          onClick={() => setShowHighScores(true)}
          className="bg-[#8f7a66] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#9f8b77] transition-all active:scale-95"
        >
          🏆
        </button>
      </div>

      {/* Game Board */}
      <div
        className="relative rounded-lg p-4"
        style={{
          width: boardSize,
          height: boardSize,
          backgroundColor: '#bbada0',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid background */}
        <div className="absolute inset-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg"
              style={{
                backgroundColor: '#cdc1b4',
                width: cellSize - 8,
                height: cellSize - 8,
              }}
            />
          ))}
        </div>

        {/* Tiles */}
        <div className="absolute inset-4">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (cell === null) return null
              const isNew =
                newTilePosition?.row === rowIndex && newTilePosition?.col === colIndex
              const isMerged = mergedPositions.has(`${rowIndex}-${colIndex}`)

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="absolute transition-all duration-100 ease-out"
                  style={{
                    width: cellSize - 8,
                    height: cellSize - 8,
                    top: rowIndex * cellSize,
                    left: colIndex * cellSize,
                  }}
                >
                  <Tile
                    value={cell}
                    cellSize={cellSize - 8}
                    isNew={isNew}
                    isMerged={isMerged}
                  />
                </div>
              )
            })
          )}
        </div>

        {/* Win overlay */}
        {gameState === 'won' && !continueAfterWin && (
          <div className="absolute inset-0 bg-[#edc22e]/80 flex flex-col items-center justify-center z-20 rounded-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-black text-white mb-2">You Win!</h2>
            <p className="text-white mb-4">You reached 2048!</p>
            <div className="flex gap-2">
              <button
                onClick={handleContinue}
                className="bg-[#8f7a66] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#9f8b77] transition-all"
              >
                Keep Playing
              </button>
              <button
                onClick={initGame}
                className="bg-white text-[#776e65] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-[#eee4da]/80 flex flex-col items-center justify-center z-20 rounded-lg">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-4xl font-black text-[#776e65] mb-2">Game Over!</h2>
            <p className="text-[#8f7a66] mb-2">Max tile: {getMaxTile(grid)}</p>
            <p className="text-[#8f7a66] mb-4">Score: {score}</p>
            <div className="flex gap-2">
              <button
                onClick={initGame}
                className="bg-[#8f7a66] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#9f8b77] transition-all"
              >
                Try Again
              </button>
              {history.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="bg-white text-[#776e65] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
                >
                  Undo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile swipe hint */}
      <p className="text-[#8f7a66] mt-4 text-sm text-center md:hidden">
        Swipe to move tiles
      </p>

      {/* Desktop controls hint */}
      <p className="text-[#8f7a66] mt-4 text-sm text-center hidden md:block">
        Use arrow keys or WASD to move • Ctrl+Z to undo
      </p>

      {/* High Scores Modal */}
      {showHighScores && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHighScores(false)}
        >
          <div
            className="bg-[#faf8ef] rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-[#776e65]">🏆 High Scores</h2>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-[#8f7a66] hover:text-[#776e65] text-2xl"
              >
                ×
              </button>
            </div>

            {highScores.length === 0 ? (
              <p className="text-[#8f7a66] text-center py-8">
                No scores yet! Play a game to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {highScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      index === 0
                        ? 'bg-[#edc22e]/20 border border-[#edc22e]'
                        : index === 1
                          ? 'bg-gray-200 border border-gray-300'
                          : index === 2
                            ? 'bg-[#f2b179]/20 border border-[#f2b179]'
                            : 'bg-[#cdc1b4]/30 border border-[#cdc1b4]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <div className="text-xl font-bold text-[#776e65]">{entry.score}</div>
                        <div className="text-xs text-[#8f7a66]">Max tile: {entry.maxTile}</div>
                      </div>
                    </div>
                    <div className="text-sm text-[#8f7a66]">{formatDate(entry.date)}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setHighScores([])
                localStorage.removeItem('2048-high-scores')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-500 font-bold rounded-lg hover:bg-red-500/30 transition-all"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulseOnce {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

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

        .animate-popIn {
          animation: popIn 0.15s ease-out forwards;
        }

        .animate-pulse-once {
          animation: pulseOnce 0.15s ease-out forwards;
        }

        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function Game2048() {
  return (
    <GameWrapper gameName="2048" gameId="2048" emoji={"🔢"}>
      <Game2048Inner />
    </GameWrapper>
  )
}
