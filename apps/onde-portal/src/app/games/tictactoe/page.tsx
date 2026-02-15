'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Types
type Player = 'X' | 'O' | null
type Board = Player[]
type GameMode = 'ai' | 'local'
type Difficulty = 'easy' | 'medium' | 'hard'
type WinLine = number[] | null

interface Scores {
  X: number
  O: number
  draws: number
}

// Winning combinations
const WINNING_LINES = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal
  [2, 4, 6], // anti-diagonal
]

// Sound effects using Web Audio API
const playSound = (type: 'place' | 'win' | 'draw' | 'click') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'place':
        osc.frequency.value = 500
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
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
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.2
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 150)
        })
        osc.stop(0)
        break
      case 'draw':
        osc.frequency.value = 300
        osc.type = 'triangle'
        gain.gain.value = 0.15
        osc.start()
        setTimeout(() => { osc.frequency.value = 250 }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
    }
  } catch {
    // Audio not supported, ignore
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea']
  const confetti = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
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

// X Mark Component with animation
const XMark = ({ animate }: { animate: boolean }) => (
  <div className={`relative w-16 h-16 md:w-20 md:h-20 ${animate ? 'animate-popIn' : ''}`}>
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`absolute w-3 h-16 md:w-4 md:h-20 bg-gradient-to-b from-rose-400 to-red-500 rounded-full shadow-lg ${
          animate ? 'animate-drawLine1' : ''
        }`}
        style={{ transform: 'rotate(45deg)' }}
      />
      <div
        className={`absolute w-3 h-16 md:w-4 md:h-20 bg-gradient-to-b from-rose-400 to-red-500 rounded-full shadow-lg ${
          animate ? 'animate-drawLine2' : ''
        }`}
        style={{ transform: 'rotate(-45deg)', animationDelay: '0.1s' }}
      />
    </div>
  </div>
)

// O Mark Component with animation
const OMark = ({ animate }: { animate: boolean }) => (
  <div className={`relative w-16 h-16 md:w-20 md:h-20 ${animate ? 'animate-popIn' : ''}`}>
    <div
      className={`absolute inset-2 md:inset-3 border-[10px] md:border-[12px] border-sky-400 rounded-full shadow-lg ${
        animate ? 'animate-drawCircle' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, transparent, transparent)',
        borderColor: '#38bdf8',
        boxShadow: 'inset 0 2px 10px rgba(56, 189, 248, 0.3), 0 2px 10px rgba(56, 189, 248, 0.3)',
      }}
    />
  </div>
)

// Cell Component
const Cell = ({
  value,
  onClick,
  isWinningCell,
  isLatest,
  disabled,
}: {
  value: Player
  onClick: () => void
  isWinningCell: boolean
  isLatest: boolean
  disabled: boolean
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        w-24 h-24 md:w-28 md:h-28 
        flex items-center justify-center
        bg-white/80 backdrop-blur
        rounded-2xl shadow-lg
        transition-all duration-200
        ${!value && !disabled ? 'hover:bg-white hover:scale-105 hover:shadow-xl cursor-pointer' : ''}
        ${isWinningCell ? 'bg-gradient-to-br from-yellow-200 to-amber-200 ring-4 ring-yellow-400 animate-pulse' : ''}
        ${disabled && !value ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {value === 'X' && <XMark animate={isLatest} />}
      {value === 'O' && <OMark animate={isLatest} />}
    </button>
  )
}

// Win Line Overlay
const WinLineOverlay = ({ winLine }: { winLine: WinLine }) => {
  if (!winLine) return null

  // Calculate line position based on winning combination
  const getLineStyle = () => {
    const lineStyles: Record<string, React.CSSProperties> = {
      '0,1,2': { top: '16.67%', left: '5%', width: '90%', height: '8px', transform: 'translateY(-50%)' },
      '3,4,5': { top: '50%', left: '5%', width: '90%', height: '8px', transform: 'translateY(-50%)' },
      '6,7,8': { top: '83.33%', left: '5%', width: '90%', height: '8px', transform: 'translateY(-50%)' },
      '0,3,6': { top: '5%', left: '16.67%', width: '8px', height: '90%', transform: 'translateX(-50%)' },
      '1,4,7': { top: '5%', left: '50%', width: '8px', height: '90%', transform: 'translateX(-50%)' },
      '2,5,8': { top: '5%', left: '83.33%', width: '8px', height: '90%', transform: 'translateX(-50%)' },
      '0,4,8': { top: '50%', left: '50%', width: '120%', height: '8px', transform: 'translate(-50%, -50%) rotate(45deg)' },
      '2,4,6': { top: '50%', left: '50%', width: '120%', height: '8px', transform: 'translate(-50%, -50%) rotate(-45deg)' },
    }
    return lineStyles[winLine.join(',')] || {}
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div
        className="absolute bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 rounded-full animate-drawWinLine shadow-lg"
        style={getLineStyle()}
      />
    </div>
  )
}

// Main Game Component
function TicTacToeInner() {
  const rewards = useGameContext()
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Player>(null)
  const [winLine, setWinLine] = useState<WinLine>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, draws: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [latestMove, setLatestMove] = useState<number | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [showModeSelect, setShowModeSelect] = useState(true)

  // Load scores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tictactoe-scores')
    if (saved) {
      try {
        setScores(JSON.parse(saved))
      } catch {
        // Invalid data, ignore
      }
    }
  }, [])

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem('tictactoe-scores', JSON.stringify(scores))
  }, [scores])

  // Check for winner
  const checkWinner = useCallback((boardToCheck: Board): { winner: Player; line: WinLine } => {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line
      if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
        return { winner: boardToCheck[a], line }
      }
    }
    return { winner: null, line: null }
  }, [])

  // Check for draw
  const checkDraw = useCallback((boardToCheck: Board): boolean => {
    return boardToCheck.every((cell) => cell !== null)
  }, [])

  // Get available moves
  const getAvailableMoves = (boardToCheck: Board): number[] => {
    return boardToCheck.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
  }

  // Minimax algorithm for AI
  const minimax = useCallback(
    (boardToCheck: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
      const { winner } = checkWinner(boardToCheck)
      if (winner === 'O') return 10 - depth
      if (winner === 'X') return depth - 10
      if (checkDraw(boardToCheck)) return 0

      if (isMaximizing) {
        let maxEval = -Infinity
        for (const move of getAvailableMoves(boardToCheck)) {
          const newBoard = [...boardToCheck]
          newBoard[move] = 'O'
          const evaluation = minimax(newBoard, depth + 1, false, alpha, beta)
          maxEval = Math.max(maxEval, evaluation)
          alpha = Math.max(alpha, evaluation)
          if (beta <= alpha) break
        }
        return maxEval
      } else {
        let minEval = Infinity
        for (const move of getAvailableMoves(boardToCheck)) {
          const newBoard = [...boardToCheck]
          newBoard[move] = 'X'
          const evaluation = minimax(newBoard, depth + 1, true, alpha, beta)
          minEval = Math.min(minEval, evaluation)
          beta = Math.min(beta, evaluation)
          if (beta <= alpha) break
        }
        return minEval
      }
    },
    [checkWinner, checkDraw]
  )

  // AI Move
  const getAIMove = useCallback(
    (boardToCheck: Board): number => {
      const available = getAvailableMoves(boardToCheck)
      if (available.length === 0) return -1

      // Easy: Random move
      if (difficulty === 'easy') {
        return available[Math.floor(Math.random() * available.length)]
      }

      // Medium: 50% optimal, 50% random
      if (difficulty === 'medium' && Math.random() < 0.4) {
        return available[Math.floor(Math.random() * available.length)]
      }

      // Hard: Minimax (optimal play)
      let bestMove = available[0]
      let bestScore = -Infinity

      for (const move of available) {
        const newBoard = [...boardToCheck]
        newBoard[move] = 'O'
        const score = minimax(newBoard, 0, false, -Infinity, Infinity)
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }

      return bestMove
    },
    [difficulty, minimax]
  )

  // Handle AI turn
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner && !isDraw && !showModeSelect) {
      setIsThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board)
        if (aiMove !== -1) {
          makeMove(aiMove, true)
        }
        setIsThinking(false)
      }, 600) // Small delay to make it feel more natural

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, board, gameMode, winner, isDraw, showModeSelect])

  // Make a move
  const makeMove = (index: number, isAI = false) => {
    if (board[index] !== null || winner || isDraw) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    setLatestMove(index)

    if (soundEnabled && !isAI) {
      playSound('place')
    } else if (soundEnabled && isAI) {
      setTimeout(() => playSound('place'), 50)
    }

    const { winner: gameWinner, line } = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      if (gameWinner === 'X') rewards.trackWin() // Player wins
      setWinLine(line)
      setShowConfetti(true)
      setScores((prev) => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }))
      if (soundEnabled) {
        setTimeout(() => playSound('win'), 200)
      }
    } else if (checkDraw(newBoard)) {
      setIsDraw(true)
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
      if (soundEnabled) {
        setTimeout(() => playSound('draw'), 200)
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setWinLine(null)
    setIsDraw(false)
    setShowConfetti(false)
    setLatestMove(null)
    setIsThinking(false)
  }

  // Reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
    localStorage.removeItem('tictactoe-scores')
  }

  // Start game with selected mode
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
  const getPlayerLabel = (player: 'X' | 'O') => {
    if (gameMode === 'local') {
      return player === 'X' ? 'Player 1' : 'Player 2'
    }
    return player === 'X' ? 'You' : 'Computer'
  }

  // Difficulty labels with emojis
  const difficultyLabels: Record<Difficulty, { label: string; emoji: string }> = {
    easy: { label: 'Easy', emoji: '😊' },
    medium: { label: 'Medium', emoji: '🤔' },
    hard: { label: 'Hard', emoji: '🧠' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-400 via-purple-400 to-fuchsia-400 flex flex-col items-center p-4 overflow-hidden">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade/"
        className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all z-20"
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
        ⭕ Tic Tac Toe ❌
      </h1>
      <p className="text-white/90 mb-4 text-center text-lg">
        {gameMode === 'ai' ? '🤖 vs Computer' : '👫 vs Friend'}
      </p>

      {/* Mode Selection Screen */}
      {showModeSelect ? (
        <div className="flex flex-col items-center gap-6 mt-8 animate-fadeIn">
          <div className="text-2xl text-white font-bold mb-2">Choose Game Mode</div>
          
          <button
            onClick={() => startGame('ai')}
            className="w-64 px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">🤖</span>
            <div className="text-left">
              <div>vs Computer</div>
              <div className="text-sm font-normal opacity-80">Challenge the AI!</div>
            </div>
          </button>

          <button
            onClick={() => startGame('local')}
            className="w-64 px-8 py-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">👫</span>
            <div className="text-left">
              <div>vs Friend</div>
              <div className="text-sm font-normal opacity-80">Play together!</div>
            </div>
          </button>

          {/* Difficulty selector (only for AI mode preview) */}
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
                      ? 'bg-white text-purple-700 shadow-lg scale-105'
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
            <div className="bg-gradient-to-br from-rose-400 to-red-500 px-5 py-3 rounded-2xl font-bold text-white shadow-lg text-center">
              <div className="text-2xl">❌</div>
              <div className="text-xs opacity-80">{getPlayerLabel('X')}</div>
              <div className="text-2xl">{scores.X}</div>
            </div>
            <div className="bg-white/90 px-5 py-3 rounded-2xl font-bold text-purple-700 shadow-lg text-center">
              <div className="text-2xl">🤝</div>
              <div className="text-xs opacity-60">Draws</div>
              <div className="text-2xl">{scores.draws}</div>
            </div>
            <div className="bg-gradient-to-br from-sky-400 to-blue-500 px-5 py-3 rounded-2xl font-bold text-white shadow-lg text-center">
              <div className="text-2xl">⭕</div>
              <div className="text-xs opacity-80">{getPlayerLabel('O')}</div>
              <div className="text-2xl">{scores.O}</div>
            </div>
          </div>

          {/* Turn indicator */}
          {!winner && !isDraw && (
            <div className="mb-4 px-6 py-3 bg-white/90 rounded-full font-bold text-purple-700 shadow-lg flex items-center gap-2">
              {isThinking ? (
                <>
                  <span className="animate-spin">🤔</span>
                  <span>Computer is thinking...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">{currentPlayer === 'X' ? '❌' : '⭕'}</span>
                  <span>{getPlayerLabel(currentPlayer)}&apos;s turn</span>
                </>
              )}
            </div>
          )}

          {/* Difficulty selector (during AI game) */}
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
                      ? 'bg-white text-purple-700 shadow'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {difficultyLabels[d].emoji}
                </button>
              ))}
            </div>
          )}

          {/* Game Board */}
          <div className="relative p-4 bg-white/20 backdrop-blur rounded-3xl shadow-2xl">
            <WinLineOverlay winLine={winLine} />
            <div className="grid grid-cols-3 gap-3">
              {board.map((cell, index) => (
                <Cell
                  key={index}
                  value={cell}
                  onClick={() => {
                    if (gameMode === 'ai' && currentPlayer === 'O') return
                    makeMove(index)
                  }}
                  isWinningCell={winLine?.includes(index) || false}
                  isLatest={latestMove === index}
                  disabled={isThinking || winner !== null || isDraw || (gameMode === 'ai' && currentPlayer === 'O')}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🔄 New Round
            </button>
            <button
              onClick={changeMode}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🎮 Change Mode
            </button>
            <button
              onClick={resetScores}
              className="px-6 py-3 bg-white/80 text-purple-700 font-bold rounded-full shadow-lg hover:scale-105 transition-all"
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
                <div className="text-6xl mb-4">{winner === 'X' ? '❌' : '⭕'}</div>
                <h2 className="text-3xl font-black text-purple-700 mb-2">
                  {getPlayerLabel(winner)} Wins!
                </h2>
                <p className="text-gray-500 mb-6">Amazing play! 🎉</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-3xl font-black text-purple-700 mb-2">It&apos;s a Draw!</h2>
                <p className="text-gray-500 mb-6">Great game! Try again!</p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowConfetti(false)
                  resetGame()
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🎮 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60 pointer-events-none">⭐</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60 pointer-events-none" style={{ animationDelay: '0.3s' }}>🌟</div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40 pointer-events-none" style={{ animationDelay: '0.6s' }}>✨</div>

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
        .animate-popIn {
          animation: popIn 0.3s ease-out;
        }
        @keyframes drawLine1 {
          0% {
            transform: rotate(45deg) scaleY(0);
          }
          100% {
            transform: rotate(45deg) scaleY(1);
          }
        }
        .animate-drawLine1 {
          animation: drawLine1 0.2s ease-out forwards;
        }
        @keyframes drawLine2 {
          0% {
            transform: rotate(-45deg) scaleY(0);
          }
          100% {
            transform: rotate(-45deg) scaleY(1);
          }
        }
        .animate-drawLine2 {
          animation: drawLine2 0.2s ease-out forwards;
          animation-delay: 0.1s;
        }
        @keyframes drawCircle {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-drawCircle {
          animation: drawCircle 0.3s ease-out forwards;
        }
        @keyframes drawWinLine {
          0% {
            transform-origin: left center;
            transform: scaleX(0) translateY(-50%);
          }
          100% {
            transform-origin: left center;
            transform: scaleX(1) translateY(-50%);
          }
        }
        .animate-drawWinLine {
          animation: drawWinLine 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function TicTacToe() {
  return (
    <GameWrapper gameName="Tic Tac Toe" gameId="tictactoe" emoji={"❌"}>
      <TicTacToeInner />
    </GameWrapper>
  )
}
