'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type CellState = 'hidden' | 'revealed' | 'flagged'
type GameState = 'idle' | 'playing' | 'won' | 'lost'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Cell {
  isMine: boolean
  state: CellState
  adjacentMines: number
}

interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
  name: string
  emoji: string
}

interface HighScoreEntry {
  time: number
  date: string
  difficulty: Difficulty
}

// Difficulty configurations
const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, name: 'Easy', emoji: '😊' },
  medium: { rows: 16, cols: 16, mines: 40, name: 'Medium', emoji: '😐' },
  hard: { rows: 16, cols: 30, mines: 99, name: 'Hard', emoji: '😰' },
}

// Colors
const COLORS = {
  background: '#0a0a0f',
  grid: '#12121a',
  hidden: '#1a1a2e',
  hiddenHover: '#252540',
  revealed: '#0d0d12',
  mine: '#ff4444',
  flag: '#ff6600',
  border: '#333344',
  text: '#00ccff',
  textGold: '#ffd700',
  numbers: ['#00ccff', '#00ff88', '#ff6600', '#ff0066', '#aa00ff', '#00ffcc', '#ffffff', '#888888'],
}

// Sound effects
const playSound = (type: 'reveal' | 'flag' | 'mine' | 'win' | 'click') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'reveal':
        osc.type = 'sine'
        osc.frequency.value = 600
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(800, audio.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.08)
        osc.stop(audio.currentTime + 0.08)
        break
      case 'flag':
        osc.type = 'square'
        osc.frequency.value = 400
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(600, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'mine':
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = 0.3
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.4)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
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
            winGain.gain.value = 0.15
            winOsc.start()
            winGain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            winOsc.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        break
      case 'click':
        osc.type = 'sine'
        osc.frequency.value = 300
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.03)
        osc.stop(audio.currentTime + 0.03)
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

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Main game component
export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [flagMode, setFlagMode] = useState(false)
  const [timer, setTimer] = useState(0)
  const [flagsPlaced, setFlagsPlaced] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [showHighScores, setShowHighScores] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [cellSize, setCellSize] = useState(32)
  const [revealedCount, setRevealedCount] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const firstClickRef = useRef(true)

  const config = DIFFICULTIES[difficulty]

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const maxWidth = Math.min(containerRef.current.offsetWidth - 32, 600)
        const maxHeight = window.innerHeight - 350
        const cellByWidth = Math.floor(maxWidth / config.cols)
        const cellByHeight = Math.floor(maxHeight / config.rows)
        const newSize = Math.min(cellByWidth, cellByHeight, 40)
        setCellSize(Math.max(newSize, 20))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [config.cols, config.rows])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('minesweeper-high-scores')
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

  // Initialize empty board
  const initializeBoard = useCallback((): Cell[][] => {
    const newBoard: Cell[][] = []
    for (let r = 0; r < config.rows; r++) {
      newBoard[r] = []
      for (let c = 0; c < config.cols; c++) {
        newBoard[r][c] = {
          isMine: false,
          state: 'hidden',
          adjacentMines: 0,
        }
      }
    }
    return newBoard
  }, [config.rows, config.cols])

  // Place mines (avoiding first click position)
  const placeMines = useCallback(
    (board: Cell[][], safeRow: number, safeCol: number): Cell[][] => {
      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
      let minesPlaced = 0

      // Create safe zone around first click
      const isSafe = (r: number, c: number) => {
        return Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1
      }

      while (minesPlaced < config.mines) {
        const r = Math.floor(Math.random() * config.rows)
        const c = Math.floor(Math.random() * config.cols)
        if (!newBoard[r][c].isMine && !isSafe(r, c)) {
          newBoard[r][c].isMine = true
          minesPlaced++
        }
      }

      // Calculate adjacent mines
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (!newBoard[r][c].isMine) {
            let count = 0
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr
                const nc = c + dc
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                  if (newBoard[nr][nc].isMine) count++
                }
              }
            }
            newBoard[r][c].adjacentMines = count
          }
        }
      }

      return newBoard
    },
    [config.mines, config.rows, config.cols]
  )

  // Start new game
  const startGame = useCallback(() => {
    setBoard(initializeBoard())
    setGameState('idle')
    setTimer(0)
    setFlagsPlaced(0)
    setShowConfetti(false)
    setIsNewHighScore(false)
    setRevealedCount(0)
    firstClickRef.current = true
  }, [initializeBoard])

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
        .slice(0, 30) // Keep top scores across all difficulties

      setHighScores(newScores)
      localStorage.setItem('minesweeper-high-scores', JSON.stringify(newScores))

      if (isNewBest) {
        setIsNewHighScore(true)
        setShowConfetti(true)
        if (soundEnabled) playSound('win')
        setTimeout(() => setShowConfetti(false), 3000)
      }
    },
    [highScores, difficulty, soundEnabled]
  )

  // Reveal cell (flood fill for empty cells)
  const revealCell = useCallback(
    (row: number, col: number, currentBoard: Cell[][]): { board: Cell[][]; hitMine: boolean; revealed: number } => {
      const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })))
      let hitMine = false
      let revealed = 0

      const reveal = (r: number, c: number) => {
        if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) return
        if (newBoard[r][c].state !== 'hidden') return

        newBoard[r][c].state = 'revealed'
        revealed++

        if (newBoard[r][c].isMine) {
          hitMine = true
          return
        }

        // If no adjacent mines, reveal neighbors
        if (newBoard[r][c].adjacentMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr !== 0 || dc !== 0) {
                reveal(r + dr, c + dc)
              }
            }
          }
        }
      }

      reveal(row, col)
      return { board: newBoard, hitMine, revealed }
    },
    [config.rows, config.cols]
  )

  // Reveal all mines (on game over)
  const revealAllMines = useCallback((currentBoard: Cell[][]): Cell[][] => {
    return currentBoard.map((row) =>
      row.map((cell) => ({
        ...cell,
        state: cell.isMine ? 'revealed' : cell.state,
      }))
    )
  }, [])

  // Check win condition
  const checkWin = useCallback(
    (currentBoard: Cell[][], currentRevealed: number): boolean => {
      const totalSafe = config.rows * config.cols - config.mines
      return currentRevealed >= totalSafe
    },
    [config.rows, config.cols, config.mines]
  )

  // Handle cell click
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState === 'won' || gameState === 'lost') return

      let currentBoard = board

      // First click - place mines
      if (firstClickRef.current) {
        currentBoard = placeMines(currentBoard, row, col)
        setGameState('playing')
        firstClickRef.current = false
      }

      const cell = currentBoard[row][col]
      if (cell.state === 'revealed') return

      if (flagMode || cell.state === 'flagged') {
        // Toggle flag
        if (cell.state === 'flagged') {
          const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })))
          newBoard[row][col].state = 'hidden'
          setBoard(newBoard)
          setFlagsPlaced((prev) => prev - 1)
          if (soundEnabled) playSound('flag')
        } else if (cell.state === 'hidden') {
          const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })))
          newBoard[row][col].state = 'flagged'
          setBoard(newBoard)
          setFlagsPlaced((prev) => prev + 1)
          if (soundEnabled) playSound('flag')
        }
        return
      }

      // Reveal cell
      const { board: newBoard, hitMine, revealed } = revealCell(row, col, currentBoard)
      const newRevealed = revealedCount + revealed
      setRevealedCount(newRevealed)

      if (hitMine) {
        setBoard(revealAllMines(newBoard))
        setGameState('lost')
        if (timerRef.current) clearInterval(timerRef.current)
        if (soundEnabled) playSound('mine')
      } else {
        setBoard(newBoard)
        if (soundEnabled) playSound('reveal')

        if (checkWin(newBoard, newRevealed)) {
          setGameState('won')
          if (timerRef.current) clearInterval(timerRef.current)
          saveHighScore(timer)
        }
      }
    },
    [
      board,
      gameState,
      flagMode,
      placeMines,
      revealCell,
      revealAllMines,
      checkWin,
      soundEnabled,
      timer,
      saveHighScore,
      revealedCount,
    ]
  )

  // Handle right click (flag)
  const handleRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault()
      if (gameState === 'won' || gameState === 'lost') return
      if (firstClickRef.current) return // Can't flag before first click

      const cell = board[row][col]
      if (cell.state === 'revealed') return

      if (cell.state === 'flagged') {
        const newBoard = board.map((r) => r.map((c) => ({ ...c })))
        newBoard[row][col].state = 'hidden'
        setBoard(newBoard)
        setFlagsPlaced((prev) => prev - 1)
        if (soundEnabled) playSound('flag')
      } else {
        const newBoard = board.map((r) => r.map((c) => ({ ...c })))
        newBoard[row][col].state = 'flagged'
        setBoard(newBoard)
        setFlagsPlaced((prev) => prev + 1)
        if (soundEnabled) playSound('flag')
      }
    },
    [board, gameState, soundEnabled]
  )

  // Get cell display
  const getCellDisplay = (cell: Cell): { content: string; color: string } => {
    if (cell.state === 'flagged') {
      return { content: '🚩', color: COLORS.flag }
    }
    if (cell.state === 'hidden') {
      return { content: '', color: '' }
    }
    if (cell.isMine) {
      return { content: '💣', color: COLORS.mine }
    }
    if (cell.adjacentMines === 0) {
      return { content: '', color: '' }
    }
    return {
      content: cell.adjacentMines.toString(),
      color: COLORS.numbers[cell.adjacentMines - 1] || COLORS.text,
    }
  }

  // Get face emoji based on game state
  const getFaceEmoji = (): string => {
    if (gameState === 'won') return '😎'
    if (gameState === 'lost') return '💀'
    return '🙂'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getBestTime = (diff: Difficulty): number | null => {
    const scores = highScores.filter((s) => s.difficulty === diff)
    if (scores.length === 0) return null
    return Math.min(...scores.map((s) => s.time))
  }

  const boardWidth = cellSize * config.cols
  const boardHeight = cellSize * config.rows

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 overflow-x-hidden"
      style={{ backgroundColor: COLORS.background }}
      ref={containerRef}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade/"
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
        className="text-4xl md:text-5xl font-black mb-2 mt-16 text-center font-mono tracking-wider"
        style={{
          color: COLORS.text,
          textShadow: `0 0 20px ${COLORS.text}, 0 0 40px ${COLORS.text}60`,
        }}
      >
        💣 MINESWEEPER
      </h1>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultyConfig][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => {
              setDifficulty(key)
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              difficulty === key ? 'scale-105' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: difficulty === key ? COLORS.text + '30' : '#222',
              border: `2px solid ${difficulty === key ? COLORS.text : '#333'}`,
              color: difficulty === key ? COLORS.text : '#888',
              boxShadow: difficulty === key ? `0 0 20px ${COLORS.text}40` : 'none',
            }}
          >
            {cfg.emoji} {cfg.name}
            <div className="text-xs opacity-70">
              {cfg.cols}×{cfg.rows} • {cfg.mines}💣
            </div>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-4 items-center flex-wrap justify-center">
        <div
          className="px-4 py-2 rounded-xl font-bold font-mono shadow-lg border flex items-center gap-2"
          style={{
            backgroundColor: '#111',
            color: COLORS.flag,
            borderColor: COLORS.flag + '40',
            textShadow: `0 0 10px ${COLORS.flag}`,
          }}
        >
          🚩 {flagsPlaced}/{config.mines}
        </div>

        {/* Face button (restart) */}
        <button
          onClick={startGame}
          className="px-4 py-2 rounded-xl font-bold text-2xl shadow-lg border hover:scale-110 transition-all"
          style={{
            backgroundColor: '#111',
            borderColor: '#444',
          }}
        >
          {getFaceEmoji()}
        </button>

        <div
          className="px-4 py-2 rounded-xl font-bold font-mono shadow-lg border flex items-center gap-2"
          style={{
            backgroundColor: '#111',
            color: COLORS.text,
            borderColor: COLORS.text + '40',
            textShadow: `0 0 10px ${COLORS.text}`,
          }}
        >
          ⏱️ {formatTime(timer)}
        </div>
      </div>

      {/* Flag mode toggle */}
      <button
        onClick={() => setFlagMode(!flagMode)}
        className={`mb-4 px-6 py-2 rounded-xl font-bold transition-all ${flagMode ? 'scale-105' : ''}`}
        style={{
          backgroundColor: flagMode ? COLORS.flag + '30' : '#222',
          border: `2px solid ${flagMode ? COLORS.flag : '#444'}`,
          color: flagMode ? COLORS.flag : '#888',
          boxShadow: flagMode ? `0 0 20px ${COLORS.flag}40` : 'none',
        }}
      >
        {flagMode ? '🚩 Flag Mode ON' : '👆 Tap to Reveal'}
      </button>

      {/* Game Board */}
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: boardWidth + 8,
          border: `4px solid ${COLORS.border}`,
          boxShadow: `0 0 40px ${COLORS.text}20, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
      >
        <div
          className="grid gap-[1px]"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
            backgroundColor: '#111',
            padding: '1px',
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const display = getCellDisplay(cell)
              const isRevealed = cell.state === 'revealed'
              const isMineExploded = isRevealed && cell.isMine && gameState === 'lost'

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                  className={`flex items-center justify-center font-bold transition-all ${
                    !isRevealed ? 'hover:brightness-125 active:scale-95' : ''
                  }`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isMineExploded
                      ? COLORS.mine + '60'
                      : isRevealed
                        ? COLORS.revealed
                        : COLORS.hidden,
                    border: isRevealed ? 'none' : `1px solid ${COLORS.border}`,
                    borderRadius: isRevealed ? 0 : 4,
                    fontSize: cellSize * 0.5,
                    color: display.color,
                    textShadow: display.color ? `0 0 8px ${display.color}` : 'none',
                    boxShadow: !isRevealed ? `inset 1px 1px 2px rgba(255,255,255,0.1)` : 'none',
                  }}
                  disabled={gameState === 'won' || gameState === 'lost'}
                >
                  {display.content}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Best time display */}
      {getBestTime(difficulty) !== null && (
        <div className="mt-4 text-center">
          <span className="text-gray-500 font-mono text-sm">
            Best time: <span style={{ color: COLORS.textGold }}>{formatTime(getBestTime(difficulty)!)}</span>
          </span>
        </div>
      )}

      {/* High scores button */}
      <button
        onClick={() => setShowHighScores(true)}
        className="mt-4 px-6 py-2 rounded-full font-bold font-mono transition-all hover:scale-105"
        style={{
          backgroundColor: '#222',
          color: COLORS.textGold,
          border: `2px solid ${COLORS.textGold}40`,
          textShadow: `0 0 10px ${COLORS.textGold}`,
        }}
      >
        🏆 High Scores
      </button>

      {/* Instructions */}
      <div className="mt-4 max-w-md text-center text-gray-500 text-xs font-mono px-4">
        <p>Click to reveal • Right-click or use Flag Mode to place flags</p>
        <p>Find all safe squares without hitting a mine!</p>
      </div>

      {/* Game Over Modal */}
      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{
              backgroundColor: '#111',
              borderColor: gameState === 'won' ? COLORS.textGold : COLORS.mine,
            }}
          >
            <div className="text-6xl mb-4">{gameState === 'won' ? '🎉' : '💥'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: gameState === 'won' ? COLORS.textGold : COLORS.mine,
                textShadow: `0 0 20px ${gameState === 'won' ? COLORS.textGold : COLORS.mine}`,
              }}
            >
              {gameState === 'won' ? (isNewHighScore ? 'NEW RECORD!' : 'YOU WIN!') : 'GAME OVER!'}
            </h2>
            <div className="text-gray-400 text-sm mb-3">{config.name.toUpperCase()} MODE</div>
            {gameState === 'won' && isNewHighScore && (
              <div className="text-yellow-400 text-xl mb-2 animate-pulse">⭐ Best Time! ⭐</div>
            )}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.text }}>
                  {formatTime(timer)}
                </div>
                <div className="text-xs text-gray-400">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono" style={{ color: COLORS.flag }}>
                  {flagsPlaced}
                </div>
                <div className="text-xs text-gray-400">Flags Used</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: COLORS.text,
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
                  color: COLORS.textGold,
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
              borderColor: COLORS.textGold + '60',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-2xl font-black font-mono"
                style={{
                  color: COLORS.textGold,
                  textShadow: `0 0 15px ${COLORS.textGold}`,
                }}
              >
                🏆 HIGH SCORES
              </h2>
              <button onClick={() => setShowHighScores(false)} className="text-gray-400 hover:text-white text-2xl">
                ×
              </button>
            </div>

            {/* Tabs for difficulties */}
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
              const scores = highScores.filter((s) => s.difficulty === diff).sort((a, b) => a.time - b.time)
              const cfg = DIFFICULTIES[diff]

              return (
                <div key={diff} className="mb-4">
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: COLORS.text }}
                  >
                    {cfg.emoji} {cfg.name}
                  </h3>
                  {scores.length === 0 ? (
                    <p className="text-gray-500 text-sm font-mono">No scores yet</p>
                  ) : (
                    <div className="space-y-1">
                      {scores.slice(0, 5).map((entry, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            index === 0
                              ? 'border-yellow-500/50 bg-yellow-500/10'
                              : 'border-gray-700 bg-gray-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                            <span className="font-bold font-mono" style={{ color: COLORS.text }}>
                              {formatTime(entry.time)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400 font-mono">{formatDate(entry.date)}</span>
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
                localStorage.removeItem('minesweeper-high-scores')
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
