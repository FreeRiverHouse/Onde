'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ── Constants ────────────────────────────────────────────────────
const CANVAS_W = 400
const CANVAS_H = 600
const INITIAL_BLOCK_W = 200
const BLOCK_H = 30
const MIN_BLOCK_W = 20
const INITIAL_SPEED = 2
const SPEED_INCREMENT = 0.15
const MAX_SPEED = 8
const PERFECT_THRESHOLD = 3 // pixels tolerance for "perfect" placement

interface Block {
  x: number
  y: number
  w: number
  color: string
  perfect?: boolean
}

interface FallingPiece {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  color: string
  rotation: number
  rotSpeed: number
}

type GameState = 'idle' | 'playing' | 'gameover'

// Pretty gradient colors
const BLOCK_COLORS = [
  '#f43f5e', '#fb7185', '#e11d48', // rose
  '#f97316', '#fb923c', '#ea580c', // orange
  '#eab308', '#facc15', '#ca8a04', // yellow
  '#22c55e', '#4ade80', '#16a34a', // green
  '#06b6d4', '#22d3ee', '#0891b2', // cyan
  '#8b5cf6', '#a78bfa', '#7c3aed', // violet
  '#ec4899', '#f472b6', '#db2777', // pink
]

function getBlockColor(level: number): string {
  return BLOCK_COLORS[level % BLOCK_COLORS.length]
}

// ── Tower Stack Game ─────────────────────────────────────────────
function TowerStackGame() {
  const { trackWin, trackPerfect, trackGameEnd, trackScore } = useGameContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [level, setLevel] = useState(0)

  // Game refs
  const blocksRef = useRef<Block[]>([])
  const fallingPiecesRef = useRef<FallingPiece[]>([])
  const currentBlockRef = useRef({ x: 0, w: INITIAL_BLOCK_W, direction: 1 })
  const speedRef = useRef(INITIAL_SPEED)
  const levelRef = useRef(0)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const gameStateRef = useRef<GameState>('idle')
  const loopRef = useRef<number | null>(null)
  const cameraYRef = useRef(0) // scroll offset
  const perfectFlashRef = useRef(0)
  const shakeRef = useRef(0)

  useEffect(() => {
    const saved = localStorage.getItem('onde-tower-highscore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Start game
  const startGame = useCallback(() => {
    const baseBlock: Block = {
      x: CANVAS_W / 2 - INITIAL_BLOCK_W / 2,
      y: CANVAS_H - BLOCK_H - 10,
      w: INITIAL_BLOCK_W,
      color: getBlockColor(0),
    }
    blocksRef.current = [baseBlock]
    fallingPiecesRef.current = []
    currentBlockRef.current = { x: 0, w: INITIAL_BLOCK_W, direction: 1 }
    speedRef.current = INITIAL_SPEED
    levelRef.current = 0
    scoreRef.current = 0
    comboRef.current = 0
    cameraYRef.current = 0
    perfectFlashRef.current = 0
    shakeRef.current = 0
    setScore(0)
    setCombo(0)
    setLevel(0)
    gameStateRef.current = 'playing'
    setGameState('playing')
  }, [])

  // Place block
  const placeBlock = useCallback(() => {
    if (gameStateRef.current !== 'playing') return

    const blocks = blocksRef.current
    const current = currentBlockRef.current
    const lastBlock = blocks[blocks.length - 1]
    
    const currentY = lastBlock.y - BLOCK_H

    // Calculate overlap
    const currentLeft = current.x
    const currentRight = current.x + current.w
    const lastLeft = lastBlock.x
    const lastRight = lastBlock.x + lastBlock.w

    const overlapLeft = Math.max(currentLeft, lastLeft)
    const overlapRight = Math.min(currentRight, lastRight)
    const overlapW = overlapRight - overlapLeft

    if (overlapW <= 0) {
      // Completely missed!
      // Add falling piece for the entire block
      fallingPiecesRef.current.push({
        x: current.x, y: currentY, w: current.w, h: BLOCK_H,
        vx: current.direction * 2, vy: 0,
        color: getBlockColor(levelRef.current + 1),
        rotation: 0, rotSpeed: (Math.random() - 0.5) * 0.1,
      })
      
      shakeRef.current = 10
      gameStateRef.current = 'gameover'
      setGameState('gameover')
      const finalScore = scoreRef.current
      trackGameEnd('loss', finalScore)
      trackScore(finalScore)
      if (finalScore >= 500) trackWin()
      if (finalScore >= 1000) trackPerfect()
      const saved = parseInt(localStorage.getItem('onde-tower-highscore') || '0')
      if (finalScore > saved) {
        localStorage.setItem('onde-tower-highscore', finalScore.toString())
        setHighScore(finalScore)
      }
      return
    }

    levelRef.current++
    setLevel(levelRef.current)

    // Check if perfect
    const isPerfect = Math.abs(overlapW - current.w) < PERFECT_THRESHOLD && 
                      Math.abs(currentLeft - lastLeft) < PERFECT_THRESHOLD

    if (isPerfect) {
      comboRef.current++
      setCombo(comboRef.current)
      scoreRef.current += 50 + comboRef.current * 10
      perfectFlashRef.current = 15

      // Perfect = use full width of last block (reward!)
      const newBlock: Block = {
        x: lastBlock.x,
        y: currentY,
        w: Math.min(lastBlock.w + 2, INITIAL_BLOCK_W), // grow slightly on perfects!
        color: getBlockColor(levelRef.current),
        perfect: true,
      }
      blocks.push(newBlock)
      currentBlockRef.current = { x: 0, w: newBlock.w, direction: 1 }
    } else {
      comboRef.current = 0
      setCombo(0)
      scoreRef.current += 10

      // Cut off piece
      const cutLeft = currentLeft < lastLeft ? lastLeft - currentLeft : 0
      const cutRight = currentRight > lastRight ? currentRight - lastRight : 0

      if (cutLeft > 0) {
        fallingPiecesRef.current.push({
          x: currentLeft, y: currentY, w: cutLeft, h: BLOCK_H,
          vx: -2, vy: 0,
          color: getBlockColor(levelRef.current),
          rotation: 0, rotSpeed: -0.05 - Math.random() * 0.05,
        })
      }
      if (cutRight > 0) {
        fallingPiecesRef.current.push({
          x: lastRight, y: currentY, w: cutRight, h: BLOCK_H,
          vx: 2, vy: 0,
          color: getBlockColor(levelRef.current),
          rotation: 0, rotSpeed: 0.05 + Math.random() * 0.05,
        })
      }

      const newBlock: Block = {
        x: overlapLeft,
        y: currentY,
        w: overlapW,
        color: getBlockColor(levelRef.current),
      }
      blocks.push(newBlock)
      currentBlockRef.current = { x: 0, w: overlapW, direction: 1 }

      if (overlapW < MIN_BLOCK_W) {
        // Too thin — game over
        gameStateRef.current = 'gameover'
        setGameState('gameover')
        const finalScore = scoreRef.current
        trackGameEnd('loss', finalScore)
        trackScore(finalScore)
        if (finalScore >= 500) trackWin()
        if (finalScore >= 1000) trackPerfect()
        const saved = parseInt(localStorage.getItem('onde-tower-highscore') || '0')
        if (finalScore > saved) {
          localStorage.setItem('onde-tower-highscore', finalScore.toString())
          setHighScore(finalScore)
        }
        return
      }
    }

    setScore(scoreRef.current)

    // Speed up
    speedRef.current = Math.min(MAX_SPEED, speedRef.current + SPEED_INCREMENT)

    // Camera scroll up
    if (currentY < CANVAS_H * 0.4) {
      cameraYRef.current += BLOCK_H
    }
  }, [trackWin, trackPerfect, trackGameEnd, trackScore])

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = canvas.width / CANVAS_W

    ctx.save()
    ctx.scale(scale, scale)

    // Shake
    if (shakeRef.current > 0) {
      const sx = (Math.random() - 0.5) * shakeRef.current
      const sy = (Math.random() - 0.5) * shakeRef.current
      ctx.translate(sx, sy)
      shakeRef.current *= 0.9
      if (shakeRef.current < 0.5) shakeRef.current = 0
    }

    // Background gradient (sky gets darker as you go higher)
    const progress = Math.min(1, levelRef.current / 50)
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    
    if (progress < 0.3) {
      grad.addColorStop(0, '#bae6fd')
      grad.addColorStop(1, '#0ea5e9')
    } else if (progress < 0.6) {
      grad.addColorStop(0, '#7c3aed')
      grad.addColorStop(1, '#1e1b4b')
    } else {
      grad.addColorStop(0, '#0f172a')
      grad.addColorStop(1, '#1e1b4b')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Stars (when high enough)
    if (progress > 0.4) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.8, (progress - 0.4) * 2)})`
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137) % CANVAS_W)
        const sy = ((i * 97 + cameraYRef.current * 0.1) % CANVAS_H)
        ctx.fillRect(sx, sy, 1.5, 1.5)
      }
    }

    const camY = cameraYRef.current

    // Perfect flash
    if (perfectFlashRef.current > 0) {
      ctx.fillStyle = `rgba(255,255,255,${perfectFlashRef.current / 30})`
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      perfectFlashRef.current--
    }

    // Draw placed blocks
    blocksRef.current.forEach((block, i) => {
      const drawY = block.y + camY
      if (drawY > CANVAS_H + BLOCK_H || drawY < -BLOCK_H) return

      ctx.fillStyle = block.color
      ctx.fillRect(block.x, drawY, block.w, BLOCK_H - 1)

      // Highlight top edge
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fillRect(block.x, drawY, block.w, 2)

      // Shadow bottom edge
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(block.x, drawY + BLOCK_H - 3, block.w, 2)

      // Perfect indicator
      if (block.perfect) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2
        ctx.strokeRect(block.x, drawY, block.w, BLOCK_H - 1)
      }
    })

    // Draw current moving block
    if (gameStateRef.current === 'playing') {
      const current = currentBlockRef.current
      const blocks = blocksRef.current
      const lastBlock = blocks[blocks.length - 1]
      const currentY = lastBlock.y - BLOCK_H + camY

      ctx.fillStyle = getBlockColor(levelRef.current + 1)
      ctx.globalAlpha = 0.9
      ctx.fillRect(current.x, currentY, current.w, BLOCK_H - 1)
      ctx.globalAlpha = 1

      // Guide lines (faint)
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(lastBlock.x, 0)
      ctx.lineTo(lastBlock.x, CANVAS_H)
      ctx.moveTo(lastBlock.x + lastBlock.w, 0)
      ctx.lineTo(lastBlock.x + lastBlock.w, CANVAS_H)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Falling pieces
    fallingPiecesRef.current.forEach(piece => {
      const drawY = piece.y + camY
      if (drawY > CANVAS_H + 100) return
      
      ctx.save()
      ctx.translate(piece.x + piece.w / 2, drawY + piece.h / 2)
      ctx.rotate(piece.rotation)
      ctx.globalAlpha = 0.7
      ctx.fillStyle = piece.color
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h)
      ctx.globalAlpha = 1
      ctx.restore()
    })

    ctx.restore()
  }, [])

  // Update
  const update = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      const current = currentBlockRef.current
      current.x += speedRef.current * current.direction
      
      if (current.x + current.w >= CANVAS_W) {
        current.direction = -1
      } else if (current.x <= 0) {
        current.direction = 1
      }
    }

    // Update falling pieces
    fallingPiecesRef.current = fallingPiecesRef.current.filter(piece => {
      piece.x += piece.vx
      piece.vy += 0.3
      piece.y += piece.vy
      piece.rotation += piece.rotSpeed
      return piece.y + cameraYRef.current < CANVAS_H + 200
    })
  }, [])

  // Game loop
  useEffect(() => {
    const loop = () => {
      update()
      draw()
      loopRef.current = requestAnimationFrame(loop)
    }
    loopRef.current = requestAnimationFrame(loop)
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current)
    }
  }, [update, draw])

  // Canvas sizing
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const w = Math.min(parent.clientWidth, 400)
      canvas.width = w
      canvas.height = w * (CANVAS_H / CANVAS_W)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Input handlers
  const handleAction = useCallback(() => {
    if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') {
      startGame()
    } else if (gameStateRef.current === 'playing') {
      placeBlock()
    }
  }, [startGame, placeBlock])

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleAction()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleAction])

  // Touch/Click
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      handleAction()
    }
    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      handleAction()
    }
    canvas.addEventListener('touchstart', handleTouch, { passive: false })
    canvas.addEventListener('click', handleClick)
    return () => {
      canvas.removeEventListener('touchstart', handleTouch)
      canvas.removeEventListener('click', handleClick)
    }
  }, [handleAction])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white">
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Link href="/games/" className="text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium">
            ← Games
          </Link>
          <h1 className="text-xl font-bold text-center">🏗️ Tower Stack</h1>
          <div className="w-16" />
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between bg-purple-900/40 rounded-xl px-4 py-2 mb-3 border border-purple-700/30">
          <div className="text-center">
            <div className="text-xs text-purple-300 uppercase tracking-wider">Score</div>
            <div className="text-2xl font-bold text-purple-300 tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-300 uppercase tracking-wider">Level</div>
            <div className="text-xl font-semibold text-cyan-400 tabular-nums">{level}</div>
          </div>
          {combo > 1 && (
            <div className="text-center animate-pulse">
              <div className="text-xs text-amber-400 uppercase tracking-wider">Combo</div>
              <div className="text-xl font-bold text-amber-400 tabular-nums">x{combo}!</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-purple-300 uppercase tracking-wider">Best</div>
            <div className="text-2xl font-bold text-pink-400 tabular-nums">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-md mx-auto px-4 flex justify-center relative">
        <div className="w-full max-w-[400px] relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border-2 border-purple-700/50 shadow-2xl touch-none cursor-pointer"
          />

          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
              <div className="text-5xl mb-3 animate-bounce">🏗️</div>
              <h2 className="text-2xl font-bold mb-1">Tower Stack</h2>
              <p className="text-purple-200 text-sm mb-3 text-center px-4">
                Stack blocks perfectly to build the highest tower!
              </p>
              <button
                onClick={handleAction}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-3 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
              >
                ▶ Stack!
              </button>
              <p className="text-xs text-purple-300/60 mt-2">Space / Tap to place</p>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-2">💥</div>
              <h2 className="text-xl font-bold text-rose-400 mb-1">Tower Fell!</h2>
              <p className="text-3xl font-bold text-purple-300 mb-0 tabular-nums">{score}</p>
              <p className="text-sm text-cyan-400 mb-1">Level {level}</p>
              <p className="text-xs text-gray-400 mb-3">
                {score > highScore ? '🏆 New Record!' : `Best: ${highScore}`}
              </p>
              <button
                onClick={handleAction}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-3 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="max-w-md mx-auto px-4 mt-4 pb-8">
        <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/30 text-sm text-purple-200">
          <h3 className="font-semibold text-purple-100 mb-2">How to Play</h3>
          <ul className="space-y-1">
            <li>🏗️ Tap or press Space to place the moving block</li>
            <li>🎯 Line it up with the block below — precision matters!</li>
            <li>✨ <span className="text-amber-400">Perfect</span> placement = combo bonus + block grows back!</li>
            <li>💨 Speed increases with each level</li>
            <li>🌌 Build high enough and reach the stars!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function TowerStackPage() {
  return (
    <GameWrapper gameName="Tower Stack" gameId="tower" emoji="🏗️">
      <TowerStackGame />
    </GameWrapper>
  )
}
