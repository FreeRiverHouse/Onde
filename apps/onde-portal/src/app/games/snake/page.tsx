'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ── Types ────────────────────────────────────────────────────────
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type GameState = 'idle' | 'playing' | 'paused' | 'gameover'
interface Point { x: number; y: number }

// ── Constants ────────────────────────────────────────────────────
const GRID_W = 20
const GRID_H = 20
const INITIAL_SPEED = 150 // ms per tick
const SPEED_INCREMENT = 2 // ms faster per food eaten
const MIN_SPEED = 60

// Colors
const COLORS = {
  bg: '#0a0e1a',
  grid: '#141a2e',
  gridLine: '#1a2140',
  snakeHead: '#22d3ee',
  snakeBody: '#06b6d4',
  snakeGlow: '#22d3ee80',
  food: '#f43f5e',
  foodGlow: '#f43f5e60',
  bonus: '#fbbf24',
  bonusGlow: '#fbbf2460',
  text: '#e2e8f0',
  textDim: '#94a3b8',
}

// ── Snake Game Component ─────────────────────────────────────────
function SnakeGame() {
  const { trackWin, trackPerfect, trackGameEnd, trackScore } = useGameContext()
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  // Game state refs for the game loop
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }])
  const dirRef = useRef<Direction>('RIGHT')
  const nextDirRef = useRef<Direction>('RIGHT')
  const foodRef = useRef<Point>({ x: 15, y: 10 })
  const bonusRef = useRef<Point | null>(null)
  const bonusTimerRef = useRef(0)
  const scoreRef = useRef(0)
  const speedRef = useRef(INITIAL_SPEED)
  const gameStateRef = useRef<GameState>('idle')
  const loopRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('onde-snake-highscore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Spawn food at random position not on snake
  const spawnFood = useCallback(() => {
    const snake = snakeRef.current
    let pos: Point
    do {
      pos = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) }
    } while (snake.some(s => s.x === pos.x && s.y === pos.y))
    foodRef.current = pos
  }, [])

  // Spawn bonus food occasionally
  const maybeSpawnBonus = useCallback(() => {
    if (bonusRef.current) return
    if (Math.random() < 0.15) { // 15% chance per food eaten
      const snake = snakeRef.current
      const food = foodRef.current
      let pos: Point
      do {
        pos = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) }
      } while (
        snake.some(s => s.x === pos.x && s.y === pos.y) ||
        (pos.x === food.x && pos.y === food.y)
      )
      bonusRef.current = pos
      bonusTimerRef.current = 50 // disappears after 50 ticks
    }
  }, [])

  // Draw the game
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellW = canvas.width / GRID_W
    const cellH = canvas.height / GRID_H

    // Background
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid lines
    ctx.strokeStyle = COLORS.gridLine
    ctx.lineWidth = 0.5
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cellW, 0)
      ctx.lineTo(x * cellW, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cellH)
      ctx.lineTo(canvas.width, y * cellH)
      ctx.stroke()
    }

    // Food
    const food = foodRef.current
    ctx.shadowColor = COLORS.foodGlow
    ctx.shadowBlur = 15
    ctx.fillStyle = COLORS.food
    ctx.beginPath()
    ctx.arc(
      food.x * cellW + cellW / 2,
      food.y * cellH + cellH / 2,
      cellW * 0.35,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Bonus food
    const bonus = bonusRef.current
    if (bonus) {
      ctx.shadowColor = COLORS.bonusGlow
      ctx.shadowBlur = 20
      ctx.fillStyle = COLORS.bonus
      ctx.beginPath()
      ctx.arc(
        bonus.x * cellW + cellW / 2,
        bonus.y * cellH + cellH / 2,
        cellW * 0.3,
        0,
        Math.PI * 2
      )
      ctx.fill()
      // Star shape
      ctx.fillStyle = '#fff'
      ctx.font = `${cellW * 0.5}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('⭐', bonus.x * cellW + cellW / 2, bonus.y * cellH + cellH / 2)
      ctx.shadowBlur = 0
    }

    // Snake
    const snake = snakeRef.current
    snake.forEach((segment, i) => {
      const isHead = i === 0
      const radius = cellW * 0.42

      if (isHead) {
        ctx.shadowColor = COLORS.snakeGlow
        ctx.shadowBlur = 12
        ctx.fillStyle = COLORS.snakeHead
      } else {
        ctx.shadowBlur = 0
        // Gradient body - gets darker toward tail
        const alpha = 1 - (i / snake.length) * 0.5
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`
      }

      // Rounded rectangle for each segment
      const x = segment.x * cellW + 1
      const y = segment.y * cellH + 1
      const w = cellW - 2
      const h = cellH - 2
      const r = isHead ? radius : cellW * 0.3

      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.fill()

      // Eyes on head
      if (isHead) {
        ctx.shadowBlur = 0
        ctx.fillStyle = '#0a0e1a'
        const dir = dirRef.current
        const eyeSize = cellW * 0.1
        let e1x: number, e1y: number, e2x: number, e2y: number

        const cx = segment.x * cellW + cellW / 2
        const cy = segment.y * cellH + cellH / 2

        switch (dir) {
          case 'RIGHT':
            e1x = cx + cellW * 0.15; e1y = cy - cellH * 0.15
            e2x = cx + cellW * 0.15; e2y = cy + cellH * 0.15
            break
          case 'LEFT':
            e1x = cx - cellW * 0.15; e1y = cy - cellH * 0.15
            e2x = cx - cellW * 0.15; e2y = cy + cellH * 0.15
            break
          case 'UP':
            e1x = cx - cellW * 0.15; e1y = cy - cellH * 0.15
            e2x = cx + cellW * 0.15; e2y = cy - cellH * 0.15
            break
          case 'DOWN':
            e1x = cx - cellW * 0.15; e1y = cy + cellH * 0.15
            e2x = cx + cellW * 0.15; e2y = cy + cellH * 0.15
            break
        }

        ctx.beginPath()
        ctx.arc(e1x!, e1y!, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(e2x!, e2y!, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.shadowBlur = 0
  }, [])

  // Game tick
  const tick = useCallback(() => {
    if (gameStateRef.current !== 'playing') return

    const snake = [...snakeRef.current]
    const head = { ...snake[0] }

    // Apply direction
    dirRef.current = nextDirRef.current
    switch (dirRef.current) {
      case 'UP': head.y--; break
      case 'DOWN': head.y++; break
      case 'LEFT': head.x--; break
      case 'RIGHT': head.x++; break
    }

    // Wall collision
    if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
      gameStateRef.current = 'gameover'
      setGameState('gameover')
      const finalScore = scoreRef.current
      trackGameEnd('loss', finalScore)
      trackScore(finalScore)
      if (finalScore >= 100) trackWin()
      if (finalScore >= 200) trackPerfect()
      // Save high score
      const saved = parseInt(localStorage.getItem('onde-snake-highscore') || '0')
      if (finalScore > saved) {
        localStorage.setItem('onde-snake-highscore', finalScore.toString())
        setHighScore(finalScore)
      }
      return
    }

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameStateRef.current = 'gameover'
      setGameState('gameover')
      const finalScore = scoreRef.current
      trackGameEnd('loss', finalScore)
      trackScore(finalScore)
      if (finalScore >= 100) trackWin()
      if (finalScore >= 200) trackPerfect()
      const saved = parseInt(localStorage.getItem('onde-snake-highscore') || '0')
      if (finalScore > saved) {
        localStorage.setItem('onde-snake-highscore', finalScore.toString())
        setHighScore(finalScore)
      }
      return
    }

    snake.unshift(head)

    // Food collision
    const food = foodRef.current
    if (head.x === food.x && head.y === food.y) {
      scoreRef.current += 10
      setScore(scoreRef.current)
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREMENT)
      setSpeed(speedRef.current)
      spawnFood()
      maybeSpawnBonus()
    } else {
      snake.pop()
    }

    // Bonus collision
    const bonus = bonusRef.current
    if (bonus && head.x === bonus.x && head.y === bonus.y) {
      scoreRef.current += 50
      setScore(scoreRef.current)
      bonusRef.current = null
      bonusTimerRef.current = 0
    }

    // Bonus timer
    if (bonusRef.current) {
      bonusTimerRef.current--
      if (bonusTimerRef.current <= 0) {
        bonusRef.current = null
      }
    }

    snakeRef.current = snake
  }, [spawnFood, maybeSpawnBonus, trackWin, trackPerfect, trackGameEnd, trackScore])

  // Game loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (gameStateRef.current === 'playing') {
        if (timestamp - lastTickRef.current >= speedRef.current) {
          tick()
          lastTickRef.current = timestamp
        }
      }
      draw()
      loopRef.current = requestAnimationFrame(loop)
    }

    loopRef.current = requestAnimationFrame(loop)

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current)
    }
  }, [tick, draw])

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const size = Math.min(parent.clientWidth, 500)
      canvas.width = size
      canvas.height = size
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Start game
  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }]
    dirRef.current = 'RIGHT'
    nextDirRef.current = 'RIGHT'
    scoreRef.current = 0
    speedRef.current = INITIAL_SPEED
    bonusRef.current = null
    bonusTimerRef.current = 0
    setScore(0)
    setSpeed(INITIAL_SPEED)
    spawnFood()
    gameStateRef.current = 'playing'
    setGameState('playing')
    lastTickRef.current = performance.now()
  }, [spawnFood])

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      gameStateRef.current = 'paused'
      setGameState('paused')
    } else if (gameStateRef.current === 'paused') {
      gameStateRef.current = 'playing'
      setGameState('playing')
      lastTickRef.current = performance.now()
    }
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState === 'idle' || gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          startGame()
          return
        }
      }

      if (e.key === 'p' || e.key === 'Escape') {
        e.preventDefault()
        togglePause()
        return
      }

      if (gameStateRef.current !== 'playing') return

      const current = dirRef.current
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          e.preventDefault()
          if (current !== 'DOWN') nextDirRef.current = 'UP'
          break
        case 'ArrowDown': case 's': case 'S':
          e.preventDefault()
          if (current !== 'UP') nextDirRef.current = 'DOWN'
          break
        case 'ArrowLeft': case 'a': case 'A':
          e.preventDefault()
          if (current !== 'RIGHT') nextDirRef.current = 'LEFT'
          break
        case 'ArrowRight': case 'd': case 'D':
          e.preventDefault()
          if (current !== 'LEFT') nextDirRef.current = 'RIGHT'
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState, startGame, togglePause])

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }

      // Tap to start/restart
      if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') {
        startGame()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return
      if (gameStateRef.current !== 'playing') return

      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      // Min swipe distance
      if (Math.max(absDx, absDy) < 20) return

      const current = dirRef.current
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0 && current !== 'LEFT') nextDirRef.current = 'RIGHT'
        else if (dx < 0 && current !== 'RIGHT') nextDirRef.current = 'LEFT'
      } else {
        // Vertical swipe
        if (dy > 0 && current !== 'UP') nextDirRef.current = 'DOWN'
        else if (dy < 0 && current !== 'DOWN') nextDirRef.current = 'UP'
      }

      touchStartRef.current = null
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startGame])

  // D-pad button handler
  const handleDpad = useCallback((dir: Direction) => {
    if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') {
      startGame()
      nextDirRef.current = dir
      return
    }
    if (gameStateRef.current !== 'playing') return
    const current = dirRef.current
    if (dir === 'UP' && current !== 'DOWN') nextDirRef.current = 'UP'
    if (dir === 'DOWN' && current !== 'UP') nextDirRef.current = 'DOWN'
    if (dir === 'LEFT' && current !== 'RIGHT') nextDirRef.current = 'LEFT'
    if (dir === 'RIGHT' && current !== 'LEFT') nextDirRef.current = 'RIGHT'
  }, [startGame])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/games/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
          >
            ← Games
          </Link>
          <h1 className="text-xl font-bold text-center">
            🐍 Snake
          </h1>
          <div className="w-16" />
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-2 mb-3 border border-gray-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-2xl font-bold text-cyan-400 tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Speed</div>
            <div className="text-lg font-semibold text-amber-400 tabular-nums">
              {Math.round((1 - (speed - MIN_SPEED) / (INITIAL_SPEED - MIN_SPEED)) * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Best</div>
            <div className="text-2xl font-bold text-purple-400 tabular-nums">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-lg mx-auto px-4 flex justify-center relative">
        <div className="w-full max-w-[500px] relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border-2 border-gray-700/50 shadow-2xl touch-none"
            style={{ aspectRatio: '1/1' }}
          />

          {/* Overlays */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
              <div className="text-6xl mb-4 animate-bounce">🐍</div>
              <h2 className="text-2xl font-bold mb-2">Snake Game</h2>
              <p className="text-gray-300 text-sm mb-4 text-center px-4">
                Use arrow keys, WASD, or swipe to control
              </p>
              <button
                onClick={startGame}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                ▶ Play
              </button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
              <div className="text-5xl mb-3">⏸️</div>
              <h2 className="text-xl font-bold mb-3">Paused</h2>
              <button
                onClick={togglePause}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2 rounded-xl transition-all"
              >
                ▶ Resume
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
              <div className="text-5xl mb-2">💀</div>
              <h2 className="text-2xl font-bold mb-1 text-rose-400">Game Over!</h2>
              <p className="text-4xl font-bold text-cyan-400 mb-1 tabular-nums">{score}</p>
              <p className="text-sm text-gray-400 mb-1">
                {score > highScore ? '🏆 New High Score!' : `Best: ${highScore}`}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Snake length: {snakeRef.current.length}
              </p>
              <button
                onClick={startGame}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                🔄 Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile D-Pad */}
      <div className="max-w-lg mx-auto px-4 mt-4 flex justify-center md:hidden">
        <div className="grid grid-cols-3 gap-1 w-40">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDpad('UP') }}
            className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-800 text-white font-bold py-4 rounded-xl text-2xl transition-colors border border-gray-700/50 select-none touch-none"
            aria-label="Up"
          >
            ▲
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDpad('LEFT') }}
            className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-800 text-white font-bold py-4 rounded-xl text-2xl transition-colors border border-gray-700/50 select-none touch-none"
            aria-label="Left"
          >
            ◄
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); togglePause() }}
            className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-800 text-white font-bold py-4 rounded-xl text-sm transition-colors border border-gray-700/50 select-none touch-none"
            aria-label="Pause"
          >
            {gameState === 'paused' ? '▶' : '⏸'}
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDpad('RIGHT') }}
            className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-800 text-white font-bold py-4 rounded-xl text-2xl transition-colors border border-gray-700/50 select-none touch-none"
            aria-label="Right"
          >
            ►
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDpad('DOWN') }}
            className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-800 text-white font-bold py-4 rounded-xl text-2xl transition-colors border border-gray-700/50 select-none touch-none"
            aria-label="Down"
          >
            ▼
          </button>
          <div />
        </div>
      </div>

      {/* Info */}
      <div className="max-w-lg mx-auto px-4 mt-4 pb-8">
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30 text-sm text-gray-400">
          <h3 className="font-semibold text-gray-300 mb-2">How to Play</h3>
          <ul className="space-y-1">
            <li>🎮 <strong>Desktop:</strong> Arrow keys or WASD to move</li>
            <li>📱 <strong>Mobile:</strong> Swipe or use D-pad buttons</li>
            <li>🍎 Eat the <span className="text-rose-400">red food</span> to grow (+10 pts)</li>
            <li>⭐ Catch <span className="text-amber-400">bonus stars</span> for +50 pts!</li>
            <li>💨 Speed increases as you eat more</li>
            <li>💀 Don&apos;t hit walls or yourself!</li>
            <li>⏸ Press <kbd className="bg-gray-700 px-1 rounded text-xs">P</kbd> or <kbd className="bg-gray-700 px-1 rounded text-xs">Esc</kbd> to pause</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ── Wrapped Export ────────────────────────────────────────────────
export default function SnakePage() {
  return (
    <GameWrapper gameName="Snake" gameId="snake" emoji="🐍">
      <SnakeGame />
    </GameWrapper>
  )
}
