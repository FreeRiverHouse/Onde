'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Difficulty = 'easy' | 'medium' | 'hard'
type GameState = 'playing' | 'won' | 'paused'

interface Cell {
  value: number // 0 = empty, 1-9 = filled
  solution: number // The correct answer
  isGiven: boolean // Pre-filled by puzzle
  notes: Set<number> // Candidate numbers
  isError: boolean // Highlighted as error
}

interface DifficultyConfig {
  name: string
  emoji: string
  cellsToRemove: number // How many cells to blank out
  hints: number // Starting hints
}

interface HighScoreEntry {
  time: number
  date: string
  difficulty: Difficulty
}

// Difficulty configurations
const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { name: 'Easy', emoji: '😊', cellsToRemove: 35, hints: 5 },
  medium: { name: 'Medium', emoji: '😐', cellsToRemove: 45, hints: 3 },
  hard: { name: 'Hard', emoji: '😰', cellsToRemove: 55, hints: 1 },
}

// Colors
const COLORS = {
  background: '#0f172a',
  grid: '#1e293b',
  cellBg: '#1e293b',
  cellSelected: '#3b82f6',
  cellSameNum: '#1e40af',
  cellHighlight: '#334155',
  cellError: '#ef444440',
  cellGiven: '#94a3b8',
  cellUser: '#60a5fa',
  border: '#475569',
  thickBorder: '#64748b',
  text: '#e2e8f0',
  notes: '#94a3b8',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
}

// Sound effects
const playSound = (type: 'place' | 'note' | 'error' | 'win' | 'hint' | 'clear') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'place':
        osc.type = 'sine'
        osc.frequency.value = 500
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(700, audio.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'note':
        osc.type = 'sine'
        osc.frequency.value = 800
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'error':
        osc.type = 'sawtooth'
        osc.frequency.value = 150
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'win':
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const winOsc = audio.createOscillator()
            const winGain = audio.createGain()
            winOsc.connect(winGain)
            winGain.connect(audio.destination)
            winOsc.type = 'square'
            winOsc.frequency.value = freq
            winGain.gain.value = 0.12
            winOsc.start()
            winGain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            winOsc.stop(audio.currentTime + 0.2)
          }, i * 120)
        })
        break
      case 'hint':
        osc.type = 'triangle'
        osc.frequency.value = 600
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(900, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'clear':
        osc.type = 'sine'
        osc.frequency.value = 400
        gain.gain.value = 0.08
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(200, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
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

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Generate a valid Sudoku solution using backtracking
const generateSolution = (): number[][] => {
  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0))
  
  const isValid = (row: number, col: number, num: number): boolean => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false
    }
    // Check column
    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false
      }
    }
    return true
  }

  const solve = (row: number, col: number): boolean => {
    if (row === 9) return true
    if (col === 9) return solve(row + 1, 0)
    if (grid[row][col] !== 0) return solve(row, col + 1)

    // Shuffle numbers 1-9 for randomness
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
    
    for (const num of nums) {
      if (isValid(row, col, num)) {
        grid[row][col] = num
        if (solve(row, col + 1)) return true
        grid[row][col] = 0
      }
    }
    return false
  }

  solve(0, 0)
  return grid
}

// Create puzzle by removing cells from solution
const createPuzzle = (solution: number[][], cellsToRemove: number): number[][] => {
  const puzzle = solution.map(row => [...row])
  const positions: [number, number][] = []
  
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }
  
  // Shuffle positions and remove cells
  positions.sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [r, c] = positions[i]
    puzzle[r][c] = 0
  }
  
  return puzzle
}

// Create board from puzzle and solution
const createBoard = (puzzle: number[][], solution: number[][]): Cell[][] => {
  return puzzle.map((row, r) =>
    row.map((value, c) => ({
      value,
      solution: solution[r][c],
      isGiven: value !== 0,
      notes: new Set<number>(),
      isError: false,
    }))
  )
}

// Main game component
export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameState, setGameState] = useState<GameState>('playing')
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [noteMode, setNoteMode] = useState(false)
  const [timer, setTimer] = useState(0)
  const [hints, setHints] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [showHighScores, setShowHighScores] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [errors, setErrors] = useState(0)
  const [cellSize, setCellSize] = useState(40)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const config = DIFFICULTIES[difficulty]

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const maxWidth = Math.min(containerRef.current.offsetWidth - 48, 450)
        const newSize = Math.floor(maxWidth / 9)
        setCellSize(Math.max(Math.min(newSize, 50), 32))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('sudoku-high-scores')
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
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState])

  // Start new game
  const startGame = useCallback(() => {
    const solution = generateSolution()
    const puzzle = createPuzzle(solution, DIFFICULTIES[difficulty].cellsToRemove)
    setBoard(createBoard(puzzle, solution))
    setGameState('playing')
    setTimer(0)
    setHints(DIFFICULTIES[difficulty].hints)
    setSelectedCell(null)
    setNoteMode(false)
    setShowConfetti(false)
    setIsNewHighScore(false)
    setErrors(0)
  }, [difficulty])

  // Initialize on mount and difficulty change
  useEffect(() => {
    startGame()
  }, [startGame])

  // Save high score
  const saveHighScore = useCallback(
    (time: number) => {
      const newEntry: HighScoreEntry = {
        time,
        date: new Date().toISOString(),
        difficulty,
      }

      const difficultyScores = highScores.filter((s) => s.difficulty === difficulty)
      const isNewBest = difficultyScores.length === 0 || time < difficultyScores[0].time

      const newScores = [...highScores, newEntry]
        .sort((a, b) => {
          if (a.difficulty !== b.difficulty) return 0
          return a.time - b.time
        })
        .slice(0, 30)

      setHighScores(newScores)
      localStorage.setItem('sudoku-high-scores', JSON.stringify(newScores))

      if (isNewBest) {
        setIsNewHighScore(true)
        setShowConfetti(true)
        if (soundEnabled) playSound('win')
        setTimeout(() => setShowConfetti(false), 3000)
      } else if (soundEnabled) {
        playSound('win')
      }
    },
    [highScores, difficulty, soundEnabled]
  )

  // Check if puzzle is complete
  const checkWin = useCallback((currentBoard: Cell[][]): boolean => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c].value !== currentBoard[r][c].solution) {
          return false
        }
      }
    }
    return true
  }, [])

  // Place a number
  const placeNumber = useCallback(
    (num: number) => {
      if (!selectedCell || gameState !== 'playing') return

      const [row, col] = selectedCell
      const cell = board[row][col]
      if (cell.isGiven) return

      const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))

      if (noteMode) {
        // Toggle note
        if (newBoard[row][col].notes.has(num)) {
          newBoard[row][col].notes.delete(num)
        } else {
          newBoard[row][col].notes.add(num)
          newBoard[row][col].value = 0 // Clear value when adding notes
        }
        if (soundEnabled) playSound('note')
      } else {
        // Place number
        newBoard[row][col].value = num
        newBoard[row][col].notes.clear()
        newBoard[row][col].isError = false

        // Check if correct
        if (num !== newBoard[row][col].solution) {
          newBoard[row][col].isError = true
          setErrors((prev) => prev + 1)
          if (soundEnabled) playSound('error')
        } else {
          if (soundEnabled) playSound('place')
          
          // Remove this number from notes in same row, column, and box
          for (let i = 0; i < 9; i++) {
            newBoard[row][i].notes.delete(num)
            newBoard[i][col].notes.delete(num)
          }
          const boxRow = Math.floor(row / 3) * 3
          const boxCol = Math.floor(col / 3) * 3
          for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
              newBoard[r][c].notes.delete(num)
            }
          }
        }
      }

      setBoard(newBoard)

      // Check win
      if (!noteMode && checkWin(newBoard)) {
        setGameState('won')
        if (timerRef.current) clearInterval(timerRef.current)
        saveHighScore(timer)
      }
    },
    [board, selectedCell, noteMode, gameState, soundEnabled, checkWin, timer, saveHighScore]
  )

  // Clear cell
  const clearCell = useCallback(() => {
    if (!selectedCell || gameState !== 'playing') return

    const [row, col] = selectedCell
    const cell = board[row][col]
    if (cell.isGiven) return

    const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))
    newBoard[row][col].value = 0
    newBoard[row][col].notes.clear()
    newBoard[row][col].isError = false

    setBoard(newBoard)
    if (soundEnabled) playSound('clear')
  }, [board, selectedCell, gameState, soundEnabled])

  // Use hint
  const useHint = useCallback(() => {
    if (hints <= 0 || gameState !== 'playing') return

    // Find an empty or wrong cell
    const emptyCells: [number, number][] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].value !== board[r][c].solution) {
          emptyCells.push([r, c])
        }
      }
    }

    if (emptyCells.length === 0) return

    // Prioritize selected cell if it's empty/wrong
    let targetCell: [number, number]
    if (selectedCell && board[selectedCell[0]][selectedCell[1]].value !== board[selectedCell[0]][selectedCell[1]].solution) {
      targetCell = selectedCell
    } else {
      targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    }

    const [row, col] = targetCell
    const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))
    newBoard[row][col].value = newBoard[row][col].solution
    newBoard[row][col].notes.clear()
    newBoard[row][col].isError = false

    setBoard(newBoard)
    setHints((prev) => prev - 1)
    setSelectedCell(targetCell)
    if (soundEnabled) playSound('hint')

    // Check win
    if (checkWin(newBoard)) {
      setGameState('won')
      if (timerRef.current) clearInterval(timerRef.current)
      saveHighScore(timer)
    }
  }, [board, hints, selectedCell, gameState, soundEnabled, checkWin, timer, saveHighScore])

  // Validate board (show all errors)
  const validateBoard = useCallback(() => {
    if (gameState !== 'playing') return

    const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))
    let hasErrors = false

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c].value !== 0 && newBoard[r][c].value !== newBoard[r][c].solution) {
          newBoard[r][c].isError = true
          hasErrors = true
        } else {
          newBoard[r][c].isError = false
        }
      }
    }

    setBoard(newBoard)
    if (hasErrors && soundEnabled) {
      playSound('error')
    } else if (!hasErrors && soundEnabled) {
      playSound('place')
    }
  }, [board, gameState, soundEnabled])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return

      if (e.key >= '1' && e.key <= '9') {
        placeNumber(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        clearCell()
      } else if (e.key === 'n' || e.key === 'N') {
        setNoteMode((prev) => !prev)
      } else if (e.key === 'h' || e.key === 'H') {
        useHint()
      } else if (selectedCell) {
        const [row, col] = selectedCell
        if (e.key === 'ArrowUp' && row > 0) setSelectedCell([row - 1, col])
        if (e.key === 'ArrowDown' && row < 8) setSelectedCell([row + 1, col])
        if (e.key === 'ArrowLeft' && col > 0) setSelectedCell([row, col - 1])
        if (e.key === 'ArrowRight' && col < 8) setSelectedCell([row, col + 1])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, placeNumber, clearCell, useHint, gameState])

  // Get cell background color
  const getCellBg = (row: number, col: number): string => {
    const cell = board[row]?.[col]
    if (!cell) return COLORS.cellBg

    if (cell.isError) return COLORS.cellError

    if (selectedCell) {
      const [selRow, selCol] = selectedCell
      // Selected cell
      if (row === selRow && col === selCol) return COLORS.cellSelected
      // Same number highlight
      const selectedValue = board[selRow][selCol].value
      if (selectedValue !== 0 && cell.value === selectedValue) return COLORS.cellSameNum
      // Same row, column, or box
      if (row === selRow || col === selCol) return COLORS.cellHighlight
      const boxRow = Math.floor(row / 3)
      const boxCol = Math.floor(col / 3)
      const selBoxRow = Math.floor(selRow / 3)
      const selBoxCol = Math.floor(selCol / 3)
      if (boxRow === selBoxRow && boxCol === selBoxCol) return COLORS.cellHighlight
    }

    return COLORS.cellBg
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getBestTime = (diff: Difficulty): number | null => {
    const scores = highScores.filter((s) => s.difficulty === diff)
    if (scores.length === 0) return null
    return Math.min(...scores.map((s) => s.time))
  }

  const boardSize = cellSize * 9 + 8 // cells + gaps

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 overflow-x-hidden"
      style={{ backgroundColor: COLORS.background }}
      ref={containerRef}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade"
        className="absolute top-4 left-4 bg-slate-800 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-blue-500/30"
        style={{ color: COLORS.accent }}
      >
        ← Arcade
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-slate-800 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10 border border-blue-500/30"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1
        className="text-3xl md:text-4xl font-black mb-2 mt-14 text-center"
        style={{
          color: COLORS.text,
          textShadow: `0 0 20px ${COLORS.accent}80`,
        }}
      >
        🔢 SUDOKU
      </h1>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-3 flex-wrap justify-center">
        {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultyConfig][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setDifficulty(key)}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
              difficulty === key ? 'scale-105' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: difficulty === key ? COLORS.accent + '30' : COLORS.grid,
              border: `2px solid ${difficulty === key ? COLORS.accent : COLORS.border}`,
              color: difficulty === key ? COLORS.accent : COLORS.notes,
            }}
          >
            {cfg.emoji} {cfg.name}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-3 items-center flex-wrap justify-center text-sm">
        <div
          className="px-3 py-1.5 rounded-xl font-bold font-mono shadow-lg border flex items-center gap-2"
          style={{
            backgroundColor: COLORS.grid,
            color: COLORS.accent,
            borderColor: COLORS.accent + '40',
          }}
        >
          ⏱️ {formatTime(timer)}
        </div>

        <button
          onClick={startGame}
          className="px-3 py-1.5 rounded-xl font-bold text-xl shadow-lg border hover:scale-110 transition-all"
          style={{
            backgroundColor: COLORS.grid,
            borderColor: COLORS.border,
          }}
          title="New Game"
        >
          🔄
        </button>

        <div
          className="px-3 py-1.5 rounded-xl font-bold font-mono shadow-lg border flex items-center gap-2"
          style={{
            backgroundColor: COLORS.grid,
            color: errors > 0 ? COLORS.error : COLORS.success,
            borderColor: (errors > 0 ? COLORS.error : COLORS.success) + '40',
          }}
        >
          ❌ {errors}
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl"
        style={{
          border: `3px solid ${COLORS.thickBorder}`,
          boxShadow: `0 0 40px ${COLORS.accent}20`,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(9, ${cellSize}px)`,
            gridTemplateRows: `repeat(9, ${cellSize}px)`,
            gap: '1px',
            backgroundColor: COLORS.border,
            padding: '1px',
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isRightEdge = (colIndex + 1) % 3 === 0 && colIndex < 8
              const isBottomEdge = (rowIndex + 1) % 3 === 0 && rowIndex < 8

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => setSelectedCell([rowIndex, colIndex])}
                  className="flex items-center justify-center font-bold transition-all relative"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getCellBg(rowIndex, colIndex),
                    borderRight: isRightEdge ? `2px solid ${COLORS.thickBorder}` : 'none',
                    borderBottom: isBottomEdge ? `2px solid ${COLORS.thickBorder}` : 'none',
                    fontSize: cell.value ? cellSize * 0.5 : cellSize * 0.2,
                    color: cell.isGiven ? COLORS.cellGiven : COLORS.cellUser,
                    fontWeight: cell.isGiven ? 700 : 500,
                  }}
                >
                  {cell.value !== 0 ? (
                    cell.value
                  ) : cell.notes.size > 0 ? (
                    <div
                      className="grid grid-cols-3 gap-0 w-full h-full p-0.5"
                      style={{ fontSize: cellSize * 0.22 }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span
                          key={n}
                          className="flex items-center justify-center"
                          style={{ color: cell.notes.has(n) ? COLORS.notes : 'transparent' }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col items-center gap-3">
        {/* Number pad */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => placeNumber(num)}
              className="font-bold rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95"
              style={{
                width: cellSize * 1.1,
                height: cellSize * 1.1,
                backgroundColor: COLORS.grid,
                color: COLORS.text,
                border: `2px solid ${COLORS.border}`,
                fontSize: cellSize * 0.45,
              }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => setNoteMode(!noteMode)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${noteMode ? 'scale-105' : ''}`}
            style={{
              backgroundColor: noteMode ? COLORS.warning + '30' : COLORS.grid,
              border: `2px solid ${noteMode ? COLORS.warning : COLORS.border}`,
              color: noteMode ? COLORS.warning : COLORS.notes,
            }}
          >
            ✏️ {noteMode ? 'Notes ON' : 'Notes'}
          </button>

          <button
            onClick={clearCell}
            className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: COLORS.grid,
              border: `2px solid ${COLORS.border}`,
              color: COLORS.notes,
            }}
          >
            ⌫ Clear
          </button>

          <button
            onClick={useHint}
            disabled={hints <= 0}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${hints > 0 ? 'hover:scale-105' : 'opacity-50'}`}
            style={{
              backgroundColor: COLORS.grid,
              border: `2px solid ${COLORS.success}40`,
              color: COLORS.success,
            }}
          >
            💡 Hint ({hints})
          </button>

          <button
            onClick={validateBoard}
            className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: COLORS.grid,
              border: `2px solid ${COLORS.accent}40`,
              color: COLORS.accent,
            }}
          >
            ✓ Validate
          </button>
        </div>
      </div>

      {/* Best time display */}
      {getBestTime(difficulty) !== null && (
        <div className="mt-3 text-center">
          <span className="text-slate-500 font-mono text-sm">
            Best time: <span style={{ color: COLORS.warning }}>{formatTime(getBestTime(difficulty)!)}</span>
          </span>
        </div>
      )}

      {/* High scores button */}
      <button
        onClick={() => setShowHighScores(true)}
        className="mt-3 px-5 py-2 rounded-full font-bold font-mono transition-all hover:scale-105"
        style={{
          backgroundColor: COLORS.grid,
          color: COLORS.warning,
          border: `2px solid ${COLORS.warning}40`,
        }}
      >
        🏆 High Scores
      </button>

      {/* Instructions */}
      <div className="mt-3 max-w-md text-center text-slate-500 text-xs px-4">
        <p>Tap a cell, then tap a number • Use Notes mode for candidates</p>
        <p>Keyboard: 1-9 to place, N for notes, H for hint, arrows to move</p>
      </div>

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{
              backgroundColor: COLORS.grid,
              borderColor: COLORS.success,
            }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2
              className="text-3xl font-black mb-2"
              style={{
                color: COLORS.success,
                textShadow: `0 0 20px ${COLORS.success}`,
              }}
            >
              {isNewHighScore ? 'NEW RECORD!' : 'PUZZLE SOLVED!'}
            </h2>
            <div className="text-slate-400 text-sm mb-3">{config.name.toUpperCase()} MODE</div>
            {isNewHighScore && (
              <div className="text-yellow-400 text-xl mb-2 animate-pulse">⭐ Best Time! ⭐</div>
            )}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.accent }}>
                  {formatTime(timer)}
                </div>
                <div className="text-xs text-slate-400">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: errors > 0 ? COLORS.error : COLORS.success }}>
                  {errors}
                </div>
                <div className="text-xs text-slate-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.warning }}>
                  {DIFFICULTIES[difficulty].hints - hints}
                </div>
                <div className="text-xs text-slate-400">Hints Used</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
                style={{
                  backgroundColor: COLORS.accent,
                  color: '#000',
                }}
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => setShowHighScores(true)}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
                style={{
                  backgroundColor: COLORS.grid,
                  color: COLORS.warning,
                  border: `2px solid ${COLORS.warning}40`,
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
              backgroundColor: COLORS.grid,
              borderColor: COLORS.warning + '60',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-2xl font-black"
                style={{
                  color: COLORS.warning,
                  textShadow: `0 0 15px ${COLORS.warning}`,
                }}
              >
                🏆 HIGH SCORES
              </h2>
              <button onClick={() => setShowHighScores(false)} className="text-slate-400 hover:text-white text-2xl">
                ×
              </button>
            </div>

            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
              const scores = highScores.filter((s) => s.difficulty === diff).sort((a, b) => a.time - b.time)
              const cfg = DIFFICULTIES[diff]

              return (
                <div key={diff} className="mb-4">
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: COLORS.accent }}
                  >
                    {cfg.emoji} {cfg.name}
                  </h3>
                  {scores.length === 0 ? (
                    <p className="text-slate-500 text-sm font-mono">No scores yet</p>
                  ) : (
                    <div className="space-y-1">
                      {scores.slice(0, 5).map((entry, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            index === 0
                              ? 'border-yellow-500/50 bg-yellow-500/10'
                              : 'border-slate-600 bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                            <span className="font-bold font-mono" style={{ color: COLORS.accent }}>
                              {formatTime(entry.time)}
                            </span>
                          </div>
                          <span className="text-sm text-slate-400 font-mono">{formatDate(entry.date)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <button
              onClick={() => {
                setHighScores([])
                localStorage.removeItem('sudoku-high-scores')
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
          animation: confetti 3s ease-out forwards;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          60% {
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
