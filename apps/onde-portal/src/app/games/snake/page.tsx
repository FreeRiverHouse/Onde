'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }
type GameState = 'idle' | 'playing' | 'paused' | 'gameover'

interface HighScoreEntry {
  score: number
  date: string
  length: number
}

// Game constants
const GRID_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREASE = 5
const MIN_SPEED = 60

// Retro colors
const COLORS = {
  background: '#0a0a0a',
  grid: '#1a1a2e',
  snake: '#00ff41',
  snakeHead: '#39ff14',
  food: '#ff073a',
  foodGlow: '#ff4757',
  text: '#00ff41',
  border: '#16213e',
}

// Sound effects
const playSound = (type: 'eat' | 'die' | 'move') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    if (type === 'eat') {
      osc.type = 'square'
      osc.frequency.value = 440
      gain.gain.value = 0.15
      osc.start()
      osc.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
      osc.stop(audio.currentTime + 0.15)
    } else if (type === 'die') {
      osc.type = 'sawtooth'
      osc.frequency.value = 200
      gain.gain.value = 0.2
      osc.start()
      osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.5)
      gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
      osc.stop(audio.currentTime + 0.5)
    } else if (type === 'move') {
      osc.type = 'sine'
      osc.frequency.value = 100
      gain.gain.value = 0.03
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05)
      osc.stop(audio.currentTime + 0.05)
    }
  } catch {
    // Audio not supported
  }
}

const playVictorySound = () => {
  try {
    const audio = new AudioContext()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.connect(gain)
        gain.connect(audio.destination)
        osc.type = 'square'
        osc.frequency.value = freq
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
      }, i * 100)
    })
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#00ff41', '#ff073a', '#00d4ff', '#ffff00', '#ff6b00', '#ff00ff']
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

// Food component with animation
const Food = ({ position, cellSize }: { position: Position; cellSize: number }) => (
  <div
    className="absolute animate-pulse-food"
    style={{
      left: position.x * cellSize,
      top: position.y * cellSize,
      width: cellSize - 2,
      height: cellSize - 2,
      backgroundColor: COLORS.food,
      borderRadius: '50%',
      boxShadow: `0 0 ${cellSize}px ${COLORS.foodGlow}, 0 0 ${cellSize * 2}px ${COLORS.food}40`,
    }}
  >
    <span
      className="absolute inset-0 flex items-center justify-center text-xs"
      style={{ fontSize: cellSize * 0.6 }}
    >
      🍎
    </span>
  </div>
)

// Snake segment component
const SnakeSegment = ({
  position,
  isHead,
  cellSize,
  direction,
  index,
}: {
  position: Position
  isHead: boolean
  cellSize: number
  direction: Direction
  index: number
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'UP':
        return 0
      case 'RIGHT':
        return 90
      case 'DOWN':
        return 180
      case 'LEFT':
        return 270
    }
  }

  return (
    <div
      className="absolute transition-all duration-75"
      style={{
        left: position.x * cellSize + 1,
        top: position.y * cellSize + 1,
        width: cellSize - 2,
        height: cellSize - 2,
        backgroundColor: isHead ? COLORS.snakeHead : COLORS.snake,
        borderRadius: isHead ? '30%' : '20%',
        boxShadow: isHead
          ? `0 0 ${cellSize}px ${COLORS.snakeHead}, 0 0 ${cellSize * 2}px ${COLORS.snake}60`
          : `0 0 ${cellSize / 2}px ${COLORS.snake}80`,
        transform: isHead ? `rotate(${getRotation()}deg)` : undefined,
        opacity: 1 - index * 0.01,
      }}
    >
      {isHead && (
        <>
          {/* Eyes */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: cellSize * 0.2,
              height: cellSize * 0.2,
              top: '20%',
              left: '20%',
              boxShadow: '0 0 3px #fff',
            }}
          >
            <div
              className="absolute bg-black rounded-full"
              style={{
                width: '50%',
                height: '50%',
                top: '25%',
                left: '25%',
              }}
            />
          </div>
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: cellSize * 0.2,
              height: cellSize * 0.2,
              top: '20%',
              right: '20%',
              boxShadow: '0 0 3px #fff',
            }}
          >
            <div
              className="absolute bg-black rounded-full"
              style={{
                width: '50%',
                height: '50%',
                top: '25%',
                left: '25%',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

// Main game component
export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 10 })
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [cellSize, setCellSize] = useState(20)

  const directionRef = useRef(direction)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate cell size based on container
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = Math.min(containerRef.current.offsetWidth - 32, 400)
        setCellSize(Math.floor(containerWidth / GRID_SIZE))
      }
    }
    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [])

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('snake-high-scores')
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

  // Generate random food position
  const generateFood = useCallback(
    (currentSnake: Position[]): Position => {
      let newFood: Position
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        }
      } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
      return newFood
    },
    []
  )

  // Save high score
  const saveHighScore = useCallback(
    (newScore: number, length: number) => {
      const newEntry: HighScoreEntry = {
        score: newScore,
        date: new Date().toISOString(),
        length,
      }

      const newScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)

      setHighScores(newScores)
      setHighScore(Math.max(newScore, highScore))
      localStorage.setItem('snake-high-scores', JSON.stringify(newScores))

      if (newScore > highScore) {
        setIsNewHighScore(true)
        setShowConfetti(true)
        if (soundEnabled) playVictorySound()
        setTimeout(() => setShowConfetti(false), 3000)
      }
    },
    [highScores, highScore, soundEnabled]
  )

  // Game loop
  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] }
      const currentDirection = directionRef.current

      // Move head
      switch (currentDirection) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (soundEnabled) playSound('die')
        setGameState('gameover')
        saveHighScore(score, prevSnake.length)
        return prevSnake
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        if (soundEnabled) playSound('die')
        setGameState('gameover')
        saveHighScore(score, prevSnake.length)
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        if (soundEnabled) playSound('eat')
        setScore((prev) => prev + 10)
        setFood(generateFood(newSnake))
        // Increase speed
        setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_INCREASE))
        return newSnake
      }

      // Remove tail if no food eaten
      newSnake.pop()
      return newSnake
    })
  }, [food, generateFood, saveHighScore, score, soundEnabled])

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, speed)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameState, speed, moveSnake])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle') {
        startGame()
        return
      }

      if (gameState !== 'playing') return

      const currentDirection = directionRef.current

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection !== 'DOWN') {
            directionRef.current = 'UP'
            setDirection('UP')
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection !== 'UP') {
            directionRef.current = 'DOWN'
            setDirection('DOWN')
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection !== 'RIGHT') {
            directionRef.current = 'LEFT'
            setDirection('LEFT')
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection !== 'LEFT') {
            directionRef.current = 'RIGHT'
            setDirection('RIGHT')
          }
          break
        case ' ':
          e.preventDefault()
          setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState])

  // Handle touch input for swipe
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

    if (gameState === 'idle') {
      startGame()
      return
    }

    if (gameState !== 'playing') return

    const currentDirection = directionRef.current

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > minSwipe && currentDirection !== 'LEFT') {
        directionRef.current = 'RIGHT'
        setDirection('RIGHT')
      } else if (dx < -minSwipe && currentDirection !== 'RIGHT') {
        directionRef.current = 'LEFT'
        setDirection('LEFT')
      }
    } else {
      // Vertical swipe
      if (dy > minSwipe && currentDirection !== 'UP') {
        directionRef.current = 'DOWN'
        setDirection('DOWN')
      } else if (dy < -minSwipe && currentDirection !== 'DOWN') {
        directionRef.current = 'UP'
        setDirection('UP')
      }
    }

    touchStartRef.current = null
  }

  // Start new game
  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection('RIGHT')
    directionRef.current = 'RIGHT'
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameState('playing')
    setShowConfetti(false)
    setIsNewHighScore(false)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const boardSize = cellSize * GRID_SIZE

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
        className="text-4xl md:text-6xl font-black mb-2 mt-16 text-center font-mono tracking-wider"
        style={{
          color: COLORS.text,
          textShadow: `0 0 20px ${COLORS.snake}, 0 0 40px ${COLORS.snake}60`,
        }}
      >
        🐍 SNAKE
      </h1>
      <p className="text-gray-500 mb-4 text-center font-mono text-sm">
        Use arrow keys or swipe to move
      </p>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-4 justify-center">
        <div
          className="px-4 py-2 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: COLORS.text,
            borderColor: COLORS.snake + '40',
            textShadow: `0 0 10px ${COLORS.snake}`,
          }}
        >
          🎯 Score: {score}
        </div>
        <div
          className="px-4 py-2 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: '#ffd700',
            borderColor: '#ffd70040',
            textShadow: '0 0 10px #ffd700',
          }}
        >
          🏆 Best: {highScore}
        </div>
        <div
          className="px-4 py-2 rounded-full font-bold font-mono shadow-lg border"
          style={{
            backgroundColor: '#111',
            color: '#ff6b6b',
            borderColor: '#ff6b6b40',
            textShadow: '0 0 10px #ff6b6b',
          }}
        >
          📏 Length: {snake.length}
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: boardSize,
          height: boardSize,
          backgroundColor: COLORS.grid,
          border: `4px solid ${COLORS.border}`,
          boxShadow: `0 0 40px ${COLORS.snake}20, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(${COLORS.snake}20 1px, transparent 1px),
              linear-gradient(90deg, ${COLORS.snake}20 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />

        {/* Scanlines effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />

        {/* Food */}
        <Food position={food} cellSize={cellSize} />

        {/* Snake */}
        {snake.map((segment, index) => (
          <SnakeSegment
            key={index}
            position={segment}
            isHead={index === 0}
            cellSize={cellSize}
            direction={direction}
            index={index}
          />
        ))}

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
            <div className="text-6xl mb-4 animate-bounce">🐍</div>
            <button
              onClick={startGame}
              className="px-8 py-4 rounded-xl font-black text-xl font-mono transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.snake,
                color: '#000',
                boxShadow: `0 0 30px ${COLORS.snake}, 0 0 60px ${COLORS.snake}60`,
              }}
            >
              START GAME
            </button>
            <p className="text-gray-400 mt-4 text-sm font-mono">Press any key to start</p>
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
            if (gameState === 'playing' && directionRef.current !== 'DOWN') {
              directionRef.current = 'UP'
              setDirection('UP')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'RIGHT') {
              directionRef.current = 'LEFT'
              setDirection('LEFT')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ◀
        </button>
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'UP') {
              directionRef.current = 'DOWN'
              setDirection('DOWN')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
          }}
        >
          ▼
        </button>
        <button
          onClick={() => {
            if (gameState === 'playing' && directionRef.current !== 'LEFT') {
              directionRef.current = 'RIGHT'
              setDirection('RIGHT')
            }
          }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
          style={{
            backgroundColor: '#222',
            color: COLORS.text,
            border: `2px solid ${COLORS.snake}40`,
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

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 animate-bounceIn"
            style={{
              backgroundColor: '#111',
              borderColor: isNewHighScore ? '#ffd700' : COLORS.food,
            }}
          >
            <div className="text-6xl mb-4">{isNewHighScore ? '🎉' : '💀'}</div>
            <h2
              className="text-3xl font-black mb-2 font-mono"
              style={{
                color: isNewHighScore ? '#ffd700' : COLORS.food,
                textShadow: `0 0 20px ${isNewHighScore ? '#ffd700' : COLORS.food}`,
              }}
            >
              {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER!'}
            </h2>
            {isNewHighScore && (
              <div className="text-yellow-400 text-xl mb-2 animate-pulse">⭐ Amazing! ⭐</div>
            )}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold font-mono" style={{ color: COLORS.text }}>
                  {score}
                </div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-yellow-400">{highScore}</div>
                <div className="text-sm text-gray-400">Best</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono" style={{ color: COLORS.food }}>
                  {snake.length}
                </div>
                <div className="text-sm text-gray-400">Length</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all font-mono"
                style={{
                  backgroundColor: COLORS.snake,
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
            className="rounded-3xl p-6 max-w-md w-full shadow-2xl border-2"
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
                        <div className="text-xs text-gray-500">Length: {entry.length}</div>
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
                localStorage.removeItem('snake-high-scores')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all font-mono"
            >
              🗑️ Clear Scores
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 max-w-md text-center text-gray-500 text-sm font-mono">
        <p className="mb-1">
          <strong className="text-gray-400">Controls:</strong> Arrow keys / WASD / Swipe
        </p>
        <p>
          <strong className="text-gray-400">Pause:</strong> Spacebar
        </p>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-4 left-4 text-2xl opacity-20 animate-pulse">🐍</div>
      <div
        className="fixed bottom-8 right-4 text-xl opacity-20 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      >
        🍎
      </div>
      <div
        className="fixed top-24 right-8 text-lg opacity-10 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        ✨
      </div>

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
        @keyframes pulse-food {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-pulse-food {
          animation: pulse-food 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
