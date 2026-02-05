'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Player = 'red' | 'yellow' | null
type Board = Player[][]
type GameMode = 'ai' | 'local'
type Difficulty = 'easy' | 'medium' | 'hard'
type WinCells = [number, number][] | null

interface Scores {
  red: number
  yellow: number
  draws: number
}

interface DroppingPiece {
  col: number
  row: number
  player: Player
  startTime: number
}

const ROWS = 6
const COLS = 7
const DIRECTIONS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
]

// Create empty board
const createEmptyBoard = (): Board => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
}

// Sound effects using Web Audio API
const playSound = (type: 'drop' | 'win' | 'draw' | 'click' | 'hover') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'drop':
        // Satisfying drop sound
        osc.frequency.value = 300
        osc.type = 'sine'
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'hover':
        osc.frequency.value = 600
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'click':
        osc.frequency.value = 800
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'win':
        // Victory fanfare
        const notes = [392, 523.25, 659.25, 783.99]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'triangle'
            gain2.gain.value = 0.25
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
            osc2.stop(audio.currentTime + 0.4)
          }, i * 120)
        })
        osc.stop(0)
        break
      case 'draw':
        osc.frequency.value = 250
        osc.type = 'triangle'
        gain.gain.value = 0.15
        osc.start()
        setTimeout(() => { osc.frequency.value = 200 }, 150)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active, color }: { active: boolean; color: 'red' | 'yellow' }) => {
  if (!active) return null

  const colors = color === 'red' 
    ? ['#ef4444', '#f87171', '#fca5a5', '#dc2626', '#b91c1c', '#fee2e2']
    : ['#eab308', '#facc15', '#fde047', '#ca8a04', '#a16207', '#fef9c3']
  
  const confetti = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 12,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : ''}`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Piece component with drop animation
const Piece = ({ 
  player, 
  isWinning, 
  isDropping,
  dropRow,
}: { 
  player: Player
  isWinning: boolean
  isDropping?: boolean
  dropRow?: number
}) => {
  if (!player) return null

  const baseColor = player === 'red' 
    ? 'from-red-400 via-red-500 to-red-600' 
    : 'from-yellow-300 via-yellow-400 to-yellow-500'

  const shadowColor = player === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(234, 179, 8, 0.5)'

  return (
    <div 
      className={`
        w-10 h-10 md:w-12 md:h-12 rounded-full
        bg-gradient-to-br ${baseColor}
        shadow-lg
        ${isWinning ? 'animate-pulse ring-4 ring-white ring-opacity-80' : ''}
        ${isDropping ? 'animate-drop' : ''}
      `}
      style={{
        boxShadow: `inset 0 -4px 8px ${shadowColor}, 0 4px 8px rgba(0,0,0,0.3)`,
        '--drop-distance': dropRow !== undefined ? `${dropRow * 52}px` : '0px',
      } as React.CSSProperties}
    >
      {/* Shine effect */}
      <div className="absolute top-1 left-1 w-3 h-3 md:w-4 md:h-4 bg-white/40 rounded-full" />
    </div>
  )
}

// Cell component
const Cell = ({ 
  player,
  isWinning,
  onClick,
  disabled,
  isHovered,
}: {
  player: Player
  isWinning: boolean
  onClick: () => void
  disabled: boolean
  isHovered: boolean
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-12 md:w-14 md:h-14
        bg-blue-700/50
        rounded-full
        flex items-center justify-center
        transition-all duration-150
        ${!disabled && !player ? 'hover:bg-blue-600/50 cursor-pointer' : ''}
        ${isHovered && !player ? 'bg-blue-600/60' : ''}
        ${disabled ? 'cursor-not-allowed' : ''}
      `}
      style={{
        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.4)',
      }}
    >
      {player && <Piece player={player} isWinning={isWinning} />}
    </button>
  )
}

// Preview piece at top
const PreviewPiece = ({ player, visible }: { player: Player; visible: boolean }) => {
  if (!visible || !player) return null
  
  return (
    <div className="w-10 h-10 md:w-12 md:h-12 animate-bounce">
      <Piece player={player} isWinning={false} />
    </div>
  )
}

// Main Game Component
export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red')
  const [winner, setWinner] = useState<Player>(null)
  const [winCells, setWinCells] = useState<WinCells>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [scores, setScores] = useState<Scores>({ red: 0, yellow: 0, draws: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [showModeSelect, setShowModeSelect] = useState(true)
  const [droppingPiece, setDroppingPiece] = useState<DroppingPiece | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  // Load scores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('connect4-scores')
    if (saved) {
      try {
        setScores(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Save scores
  useEffect(() => {
    localStorage.setItem('connect4-scores', JSON.stringify(scores))
  }, [scores])

  // Check for winner
  const checkWinner = useCallback((boardToCheck: Board): { winner: Player; cells: WinCells } => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const player = boardToCheck[row][col]
        if (!player) continue

        for (const [dr, dc] of DIRECTIONS) {
          const cells: [number, number][] = [[row, col]]
          let count = 1

          for (let i = 1; i < 4; i++) {
            const newRow = row + dr * i
            const newCol = col + dc * i
            if (
              newRow >= 0 && newRow < ROWS &&
              newCol >= 0 && newCol < COLS &&
              boardToCheck[newRow][newCol] === player
            ) {
              cells.push([newRow, newCol])
              count++
            } else {
              break
            }
          }

          if (count >= 4) {
            return { winner: player, cells }
          }
        }
      }
    }
    return { winner: null, cells: null }
  }, [])

  // Check for draw
  const checkDraw = useCallback((boardToCheck: Board): boolean => {
    return boardToCheck[0].every(cell => cell !== null)
  }, [])

  // Get valid row for column
  const getValidRow = (boardToCheck: Board, col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (boardToCheck[row][col] === null) {
        return row
      }
    }
    return -1
  }

  // Evaluate board for AI
  const evaluateWindow = (window: Player[], player: Player): number => {
    const opponent = player === 'red' ? 'yellow' : 'red'
    const playerCount = window.filter(c => c === player).length
    const opponentCount = window.filter(c => c === opponent).length
    const emptyCount = window.filter(c => c === null).length

    if (playerCount === 4) return 100
    if (playerCount === 3 && emptyCount === 1) return 5
    if (playerCount === 2 && emptyCount === 2) return 2
    if (opponentCount === 3 && emptyCount === 1) return -4
    return 0
  }

  const evaluateBoard = useCallback((boardToCheck: Board, player: Player): number => {
    let score = 0

    // Center column preference
    const centerCol = Math.floor(COLS / 2)
    const centerCount = boardToCheck.filter(row => row[centerCol] === player).length
    score += centerCount * 3

    // Horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [
          boardToCheck[row][col],
          boardToCheck[row][col + 1],
          boardToCheck[row][col + 2],
          boardToCheck[row][col + 3],
        ]
        score += evaluateWindow(window, player)
      }
    }

    // Vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const window = [
          boardToCheck[row][col],
          boardToCheck[row + 1][col],
          boardToCheck[row + 2][col],
          boardToCheck[row + 3][col],
        ]
        score += evaluateWindow(window, player)
      }
    }

    // Diagonal (positive slope)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [
          boardToCheck[row][col],
          boardToCheck[row + 1][col + 1],
          boardToCheck[row + 2][col + 2],
          boardToCheck[row + 3][col + 3],
        ]
        score += evaluateWindow(window, player)
      }
    }

    // Diagonal (negative slope)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [
          boardToCheck[row][col],
          boardToCheck[row - 1][col + 1],
          boardToCheck[row - 2][col + 2],
          boardToCheck[row - 3][col + 3],
        ]
        score += evaluateWindow(window, player)
      }
    }

    return score
  }, [])

  // Minimax with alpha-beta pruning
  const minimax = useCallback((
    boardToCheck: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number => {
    const { winner } = checkWinner(boardToCheck)
    if (winner === 'yellow') return 10000 - depth
    if (winner === 'red') return -10000 + depth
    if (checkDraw(boardToCheck) || depth === 0) {
      return evaluateBoard(boardToCheck, 'yellow')
    }

    const validCols = Array.from({ length: COLS }, (_, i) => i)
      .filter(col => getValidRow(boardToCheck, col) !== -1)

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const col of validCols) {
        const row = getValidRow(boardToCheck, col)
        const newBoard = boardToCheck.map(r => [...r])
        newBoard[row][col] = 'yellow'
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, false)
        maxEval = Math.max(maxEval, evaluation)
        alpha = Math.max(alpha, evaluation)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const col of validCols) {
        const row = getValidRow(boardToCheck, col)
        const newBoard = boardToCheck.map(r => [...r])
        newBoard[row][col] = 'red'
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, true)
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        if (beta <= alpha) break
      }
      return minEval
    }
  }, [checkWinner, checkDraw, evaluateBoard])

  // AI move
  const getAIMove = useCallback((boardToCheck: Board): number => {
    const validCols = Array.from({ length: COLS }, (_, i) => i)
      .filter(col => getValidRow(boardToCheck, col) !== -1)

    if (validCols.length === 0) return -1

    // Check for immediate win
    for (const col of validCols) {
      const row = getValidRow(boardToCheck, col)
      const testBoard = boardToCheck.map(r => [...r])
      testBoard[row][col] = 'yellow'
      if (checkWinner(testBoard).winner === 'yellow') {
        return col
      }
    }

    // Block immediate threat
    for (const col of validCols) {
      const row = getValidRow(boardToCheck, col)
      const testBoard = boardToCheck.map(r => [...r])
      testBoard[row][col] = 'red'
      if (checkWinner(testBoard).winner === 'red') {
        return col
      }
    }

    // Easy: mostly random
    if (difficulty === 'easy') {
      if (Math.random() < 0.7) {
        return validCols[Math.floor(Math.random() * validCols.length)]
      }
    }

    // Medium: sometimes random
    if (difficulty === 'medium' && Math.random() < 0.3) {
      return validCols[Math.floor(Math.random() * validCols.length)]
    }

    // Use minimax
    const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6
    let bestCol = validCols[0]
    let bestScore = -Infinity

    for (const col of validCols) {
      const row = getValidRow(boardToCheck, col)
      const newBoard = boardToCheck.map(r => [...r])
      newBoard[row][col] = 'yellow'
      const score = minimax(newBoard, depth, -Infinity, Infinity, false)
      if (score > bestScore) {
        bestScore = score
        bestCol = col
      }
    }

    return bestCol
  }, [difficulty, minimax, checkWinner])

  // Handle AI turn
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'yellow' && !winner && !isDraw && !showModeSelect && !droppingPiece) {
      setIsThinking(true)
      const timer = setTimeout(() => {
        const aiCol = getAIMove(board)
        if (aiCol !== -1) {
          dropPiece(aiCol, true)
        }
        setIsThinking(false)
      }, 700)

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, board, gameMode, winner, isDraw, showModeSelect, droppingPiece])

  // Drop piece with animation
  const dropPiece = (col: number, isAI = false) => {
    const row = getValidRow(board, col)
    if (row === -1 || winner || isDraw || droppingPiece) return

    if (soundEnabled) {
      playSound('drop')
    }

    // Start drop animation
    setDroppingPiece({ col, row, player: currentPlayer, startTime: Date.now() })

    // After animation, update board
    setTimeout(() => {
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = currentPlayer
      setBoard(newBoard)
      setDroppingPiece(null)

      const { winner: gameWinner, cells } = checkWinner(newBoard)
      if (gameWinner) {
        setWinner(gameWinner)
        setWinCells(cells)
        setShowConfetti(true)
        setScores(prev => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }))
        if (soundEnabled) {
          setTimeout(() => playSound('win'), 100)
        }
      } else if (checkDraw(newBoard)) {
        setIsDraw(true)
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }))
        if (soundEnabled) {
          setTimeout(() => playSound('draw'), 100)
        }
      } else {
        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
      }
    }, 300 + row * 50) // Animation time based on drop distance
  }

  // Reset game
  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setWinCells(null)
    setIsDraw(false)
    setShowConfetti(false)
    setHoveredCol(null)
    setIsThinking(false)
    setDroppingPiece(null)
  }

  // Reset scores
  const resetScores = () => {
    setScores({ red: 0, yellow: 0, draws: 0 })
    localStorage.removeItem('connect4-scores')
  }

  // Start game
  const startGame = (mode: GameMode) => {
    setGameMode(mode)
    setShowModeSelect(false)
    resetGame()
    if (soundEnabled) playSound('click')
  }

  // Change mode
  const changeMode = () => {
    setShowModeSelect(true)
    resetGame()
  }

  // Get player label
  const getPlayerLabel = (player: 'red' | 'yellow') => {
    if (gameMode === 'local') {
      return player === 'red' ? 'Player 1' : 'Player 2'
    }
    return player === 'red' ? 'You' : 'Computer'
  }

  // Check if cell is winning
  const isWinningCell = (row: number, col: number): boolean => {
    return winCells?.some(([r, c]) => r === row && c === col) || false
  }

  const difficultyLabels: Record<Difficulty, { label: string; emoji: string }> = {
    easy: { label: 'Easy', emoji: '😊' },
    medium: { label: 'Medium', emoji: '🤔' },
    hard: { label: 'Hard', emoji: '🧠' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 flex flex-col items-center p-4 overflow-hidden">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      <Confetti active={showConfetti} color={winner === 'red' ? 'red' : 'yellow'} />

      {/* Header */}
      <Link
        href="/games/arcade/"
        className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg hover:scale-105 transition-all z-20"
      >
        ← Games
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-20"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 mt-14 text-center drop-shadow-lg">
        🔴 Connect Four 🟡
      </h1>
      <p className="text-white/90 mb-4 text-center text-lg">
        {gameMode === 'ai' ? '🤖 vs Computer' : '👫 vs Friend'}
      </p>

      {/* Mode Selection */}
      {showModeSelect ? (
        <div className="flex flex-col items-center gap-6 mt-8 animate-fadeIn">
          <div className="text-2xl text-white font-bold mb-2">Choose Game Mode</div>
          
          <button
            onClick={() => startGame('ai')}
            className="w-64 px-8 py-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">🤖</span>
            <div className="text-left">
              <div>vs Computer</div>
              <div className="text-sm font-normal opacity-80">Challenge the AI!</div>
            </div>
          </button>

          <button
            onClick={() => startGame('local')}
            className="w-64 px-8 py-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">👫</span>
            <div className="text-left">
              <div>vs Friend</div>
              <div className="text-sm font-normal opacity-80">Play together!</div>
            </div>
          </button>

          {/* Difficulty selector */}
          <div className="mt-4 text-white/80 text-center">
            <div className="text-sm mb-2">AI Difficulty:</div>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d)
                    if (soundEnabled) playSound('click')
                  }}
                  className={`px-4 py-2 rounded-full font-bold transition-all ${
                    difficulty === d
                      ? 'bg-white text-blue-700 shadow-lg scale-105'
                      : 'bg-white/30 text-white hover:bg-white/40'
                  }`}
                >
                  {difficultyLabels[d].emoji} {difficultyLabels[d].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Score Board */}
          <div className="flex gap-4 mb-4">
            <div className="bg-gradient-to-br from-red-400 to-red-600 px-5 py-3 rounded-2xl font-bold text-white shadow-lg text-center">
              <div className="text-2xl">🔴</div>
              <div className="text-xs opacity-80">{getPlayerLabel('red')}</div>
              <div className="text-2xl">{scores.red}</div>
            </div>
            <div className="bg-white/90 px-5 py-3 rounded-2xl font-bold text-blue-700 shadow-lg text-center">
              <div className="text-2xl">🤝</div>
              <div className="text-xs opacity-60">Draws</div>
              <div className="text-2xl">{scores.draws}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 px-5 py-3 rounded-2xl font-bold text-white shadow-lg text-center">
              <div className="text-2xl">🟡</div>
              <div className="text-xs opacity-80">{getPlayerLabel('yellow')}</div>
              <div className="text-2xl">{scores.yellow}</div>
            </div>
          </div>

          {/* Turn indicator */}
          {!winner && !isDraw && (
            <div className="mb-4 px-6 py-3 bg-white/90 rounded-full font-bold text-blue-700 shadow-lg flex items-center gap-2">
              {isThinking ? (
                <>
                  <span className="animate-spin">🤔</span>
                  <span>Computer is thinking...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">{currentPlayer === 'red' ? '🔴' : '🟡'}</span>
                  <span>{getPlayerLabel(currentPlayer)}&apos;s turn</span>
                </>
              )}
            </div>
          )}

          {/* Difficulty selector during game */}
          {gameMode === 'ai' && !winner && !isDraw && (
            <div className="flex gap-1 bg-white/30 p-1 rounded-full mb-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d)
                    if (soundEnabled) playSound('click')
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                    difficulty === d
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {difficultyLabels[d].emoji}
                </button>
              ))}
            </div>
          )}

          {/* Preview row */}
          <div className="flex gap-2 mb-2 h-12 md:h-14">
            {Array.from({ length: COLS }).map((_, col) => (
              <div key={col} className="w-12 md:w-14 flex items-center justify-center">
                <PreviewPiece 
                  player={currentPlayer} 
                  visible={hoveredCol === col && !winner && !isDraw && !isThinking && !droppingPiece}
                />
              </div>
            ))}
          </div>

          {/* Game Board */}
          <div 
            ref={boardRef}
            className="relative p-3 bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl shadow-2xl"
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Dropping piece overlay */}
            {droppingPiece && (
              <div 
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${12 + droppingPiece.col * 56}px`,
                  top: '12px',
                }}
              >
                <div 
                  className="animate-dropPiece"
                  style={{
                    '--drop-rows': droppingPiece.row + 1,
                  } as React.CSSProperties}
                >
                  <Piece player={droppingPiece.player} isWinning={false} />
                </div>
              </div>
            )}

            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    player={cell}
                    isWinning={isWinningCell(rowIndex, colIndex)}
                    onClick={() => {
                      if (gameMode === 'ai' && currentPlayer === 'yellow') return
                      dropPiece(colIndex)
                    }}
                    disabled={
                      isThinking || 
                      winner !== null || 
                      isDraw || 
                      droppingPiece !== null ||
                      (gameMode === 'ai' && currentPlayer === 'yellow')
                    }
                    isHovered={hoveredCol === colIndex}
                  />
                ))
              )}
            </div>

            {/* Column hover zones */}
            <div 
              className="absolute inset-0 flex"
              onMouseLeave={() => setHoveredCol(null)}
            >
              {Array.from({ length: COLS }).map((_, col) => (
                <div
                  key={col}
                  className="flex-1 cursor-pointer"
                  onMouseEnter={() => {
                    if (!winner && !isDraw && !isThinking && !droppingPiece) {
                      setHoveredCol(col)
                    }
                  }}
                  onClick={() => {
                    if (gameMode === 'ai' && currentPlayer === 'yellow') return
                    dropPiece(col)
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🔄 New Round
            </button>
            <button
              onClick={changeMode}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🎮 Change Mode
            </button>
            <button
              onClick={resetScores}
              className="px-6 py-3 bg-white/80 text-blue-700 font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🗑️ Reset Scores
            </button>
          </div>
        </>
      )}

      {/* Winner/Draw Modal */}
      {(winner || isDraw) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounceIn">
            {winner ? (
              <>
                <div className="text-6xl mb-4">{winner === 'red' ? '🔴' : '🟡'}</div>
                <h2 className="text-3xl font-black text-blue-700 mb-2">
                  {getPlayerLabel(winner)} Wins!
                </h2>
                <p className="text-gray-500 mb-6">Four in a row! 🎉</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-3xl font-black text-blue-700 mb-2">It&apos;s a Draw!</h2>
                <p className="text-gray-500 mb-6">The board is full! Try again!</p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowConfetti(false)
                  resetGame()
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🎮 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60 pointer-events-none">🔴</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60 pointer-events-none" style={{ animationDelay: '0.3s' }}>🟡</div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40 pointer-events-none" style={{ animationDelay: '0.6s' }}>⭐</div>

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
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes dropPiece {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(calc(var(--drop-rows) * 56px));
          }
        }
        .animate-dropPiece {
          animation: dropPiece 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-duration: calc(0.08s * var(--drop-rows) + 0.1s);
        }
        @keyframes drop {
          0% {
            transform: translateY(calc(-1 * var(--drop-distance)));
          }
          70% {
            transform: translateY(5px);
          }
          85% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-drop {
          animation: drop 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
