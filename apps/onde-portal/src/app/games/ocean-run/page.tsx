'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ── Constants ────────────────────────────────────────────────────
const CANVAS_W = 800
const CANVAS_H = 300
const GROUND_Y = 230
const GRAVITY = 0.6
const JUMP_FORCE = -12
const DOUBLE_JUMP_FORCE = -10
const INITIAL_SPEED = 5
const MAX_SPEED = 14
const SPEED_INCREMENT = 0.002

// Player
const PLAYER_W = 40
const PLAYER_H = 44
const PLAYER_X = 80

// Obstacle types
interface Obstacle {
  x: number
  w: number
  h: number
  type: 'wave' | 'rock' | 'crab' | 'seagull'
  y: number // bottom-relative for ground, absolute for flying
}

interface Coin {
  x: number
  y: number
  collected: boolean
}

interface Cloud {
  x: number
  y: number
  w: number
  speed: number
}

type GameState = 'idle' | 'playing' | 'gameover'

// ── Ocean Run Game ────────────────────────────────────────────────
function OceanRunGame() {
  const { trackWin, trackPerfect, trackGameEnd, trackScore } = useGameContext()
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [coins, setCoins] = useState(0)

  // Game refs
  const playerYRef = useRef(GROUND_Y)
  const velYRef = useRef(0)
  const isJumpingRef = useRef(false)
  const canDoubleJumpRef = useRef(true)
  const isDuckingRef = useRef(false)
  const obstaclesRef = useRef<Obstacle[]>([])
  const coinsRef = useRef<Coin[]>([])
  const cloudsRef = useRef<Cloud[]>([
    { x: 100, y: 30, w: 60, speed: 0.3 },
    { x: 300, y: 50, w: 80, speed: 0.2 },
    { x: 550, y: 25, w: 50, speed: 0.4 },
    { x: 700, y: 60, w: 70, speed: 0.25 },
  ])
  const speedRef = useRef(INITIAL_SPEED)
  const scoreRef = useRef(0)
  const coinsCollectedRef = useRef(0)
  const frameRef = useRef(0)
  const gameStateRef = useRef<GameState>('idle')
  const loopRef = useRef<number | null>(null)
  const obstacleTimerRef = useRef(0)
  const coinTimerRef = useRef(0)

  // Wave animation
  const waveOffsetRef = useRef(0)

  useEffect(() => {
    const saved = localStorage.getItem('onde-ocean-run-highscore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Spawn obstacle
  const spawnObstacle = useCallback(() => {
    const types: Obstacle['type'][] = ['wave', 'rock', 'crab', 'seagull']
    const type = types[Math.floor(Math.random() * types.length)]
    
    let obs: Obstacle
    switch (type) {
      case 'wave':
        obs = { x: CANVAS_W + 50, w: 30, h: 35, type: 'wave', y: GROUND_Y }
        break
      case 'rock':
        obs = { x: CANVAS_W + 50, w: 35, h: 30, type: 'rock', y: GROUND_Y }
        break
      case 'crab':
        obs = { x: CANVAS_W + 50, w: 25, h: 20, type: 'crab', y: GROUND_Y }
        break
      case 'seagull':
        obs = { x: CANVAS_W + 50, w: 35, h: 25, type: 'seagull', y: GROUND_Y - 50 - Math.random() * 30 }
        break
      default:
        obs = { x: CANVAS_W + 50, w: 30, h: 35, type: 'wave', y: GROUND_Y }
    }
    
    obstaclesRef.current.push(obs)
  }, [])

  // Spawn coin
  const spawnCoin = useCallback(() => {
    const y = GROUND_Y - 30 - Math.random() * 60
    coinsRef.current.push({ x: CANVAS_W + 50, y, collected: false })
  }, [])

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = canvas.width / CANVAS_W

    ctx.save()
    ctx.scale(scale, scale)

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    skyGrad.addColorStop(0, '#0c4a6e')
    skyGrad.addColorStop(0.6, '#0ea5e9')
    skyGrad.addColorStop(1, '#38bdf8')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Sun
    ctx.fillStyle = '#fbbf24'
    ctx.shadowColor = '#fbbf2480'
    ctx.shadowBlur = 30
    ctx.beginPath()
    ctx.arc(680, 50, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Clouds
    cloudsRef.current.forEach(cloud => {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.w * 0.3, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.w * 0.3, cloud.y - 5, cloud.w * 0.25, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.w * 0.5, cloud.y, cloud.w * 0.2, 0, Math.PI * 2)
      ctx.fill()
    })

    // Ocean waves (background)
    const waveOff = waveOffsetRef.current
    ctx.fillStyle = '#0369a1'
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y + 15)
    for (let x = 0; x <= CANVAS_W; x += 10) {
      ctx.lineTo(x, GROUND_Y + 15 + Math.sin((x + waveOff * 30) * 0.02) * 5)
    }
    ctx.lineTo(CANVAS_W, CANVAS_H)
    ctx.lineTo(0, CANVAS_H)
    ctx.fill()

    // Sand / ground
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + 15)
    groundGrad.addColorStop(0, '#fcd34d')
    groundGrad.addColorStop(1, '#d97706')
    ctx.fillStyle = groundGrad
    ctx.fillRect(0, GROUND_Y, CANVAS_W, 15)

    // Ground dots (sand texture)
    ctx.fillStyle = '#b45309'
    for (let x = (frameRef.current * speedRef.current * 0.5) % 20; x < CANVAS_W; x += 20) {
      ctx.fillRect(CANVAS_W - x, GROUND_Y + 3, 2, 2)
      ctx.fillRect(CANVAS_W - x + 7, GROUND_Y + 8, 1, 1)
    }

    // Obstacles
    obstaclesRef.current.forEach(obs => {
      switch (obs.type) {
        case 'wave': {
          ctx.fillStyle = '#22d3ee'
          ctx.beginPath()
          const bx = obs.x, by = obs.y
          ctx.moveTo(bx, by)
          ctx.quadraticCurveTo(bx + obs.w / 2, by - obs.h, bx + obs.w, by)
          ctx.fill()
          // Foam
          ctx.fillStyle = '#e0f2fe'
          ctx.beginPath()
          ctx.arc(bx + obs.w * 0.3, by - obs.h * 0.6, 4, 0, Math.PI * 2)
          ctx.arc(bx + obs.w * 0.6, by - obs.h * 0.5, 3, 0, Math.PI * 2)
          ctx.fill()
          break
        }
        case 'rock': {
          ctx.fillStyle = '#78716c'
          ctx.beginPath()
          const rx = obs.x, ry = obs.y
          ctx.moveTo(rx, ry)
          ctx.lineTo(rx + 5, ry - obs.h)
          ctx.lineTo(rx + obs.w * 0.4, ry - obs.h * 0.8)
          ctx.lineTo(rx + obs.w * 0.7, ry - obs.h)
          ctx.lineTo(rx + obs.w, ry)
          ctx.fill()
          // Highlight
          ctx.fillStyle = '#a8a29e'
          ctx.beginPath()
          ctx.arc(rx + obs.w * 0.4, ry - obs.h * 0.5, 4, 0, Math.PI * 2)
          ctx.fill()
          break
        }
        case 'crab': {
          // Body
          ctx.fillStyle = '#ef4444'
          const cx = obs.x + obs.w / 2, cy = obs.y - obs.h / 2
          ctx.beginPath()
          ctx.ellipse(cx, cy, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2)
          ctx.fill()
          // Eyes
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.arc(cx - 5, cy - 6, 2, 0, Math.PI * 2)
          ctx.arc(cx + 5, cy - 6, 2, 0, Math.PI * 2)
          ctx.fill()
          // Claws
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(cx - obs.w / 2 - 5, cy, 5, -Math.PI * 0.8, Math.PI * 0.3)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(cx + obs.w / 2 + 5, cy, 5, Math.PI * 0.7, -Math.PI * 0.3)
          ctx.stroke()
          break
        }
        case 'seagull': {
          // Bird V shape
          ctx.strokeStyle = '#1e293b'
          ctx.lineWidth = 2.5
          const sx = obs.x + obs.w / 2, sy = obs.y
          const wingFlap = Math.sin(frameRef.current * 0.15) * 8
          ctx.beginPath()
          ctx.moveTo(sx - 15, sy + wingFlap)
          ctx.quadraticCurveTo(sx - 5, sy - 5, sx, sy)
          ctx.quadraticCurveTo(sx + 5, sy - 5, sx + 15, sy + wingFlap)
          ctx.stroke()
          // Body
          ctx.fillStyle = '#1e293b'
          ctx.beginPath()
          ctx.arc(sx, sy, 3, 0, Math.PI * 2)
          ctx.fill()
          break
        }
      }
    })

    // Coins
    coinsRef.current.forEach(coin => {
      if (coin.collected) return
      ctx.fillStyle = '#fbbf24'
      ctx.shadowColor = '#fbbf2460'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      // $ symbol
      ctx.fillStyle = '#92400e'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('$', coin.x, coin.y + 1)
    })

    // Player (surfing character)
    const py = playerYRef.current
    const ducking = isDuckingRef.current
    const ph = ducking ? PLAYER_H * 0.6 : PLAYER_H
    const pw = ducking ? PLAYER_W * 1.2 : PLAYER_W
    const px = PLAYER_X

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.beginPath()
    ctx.ellipse(px + pw / 2, GROUND_Y + 2, pw / 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillStyle = '#06b6d4'
    const bodyY = py - ph
    ctx.beginPath()
    ctx.roundRect(px + 5, bodyY, pw - 10, ph - 5, 8)
    ctx.fill()

    // Head
    ctx.fillStyle = '#fcd34d'
    ctx.beginPath()
    ctx.arc(px + pw / 2, bodyY - 2, 12, 0, Math.PI * 2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = '#000'
    const eyeY = bodyY - 4
    ctx.beginPath()
    ctx.arc(px + pw / 2 + 4, eyeY, 2, 0, Math.PI * 2)
    ctx.fill()
    // Smile
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(px + pw / 2 + 2, eyeY + 4, 4, 0, Math.PI * 0.8)
    ctx.stroke()

    // Surfboard (if running)
    if (!isJumpingRef.current || py >= GROUND_Y - 5) {
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.ellipse(px + pw / 2, py + 2, pw * 0.7, 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()

    // HUD overlay
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, canvas.width, 28 * scale)
    
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${14 * scale}px monospace`
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${Math.floor(scoreRef.current)}`, 10 * scale, 18 * scale)
    
    ctx.textAlign = 'center'
    ctx.fillText(`🪙 ${coinsCollectedRef.current}`, canvas.width / 2, 18 * scale)
    
    ctx.textAlign = 'right'
    ctx.fillText(`Best: ${highScore}`, (CANVAS_W - 10) * scale, 18 * scale)
  }, [highScore])

  // Game tick
  const update = useCallback(() => {
    if (gameStateRef.current !== 'playing') return

    const speed = speedRef.current
    frameRef.current++
    waveOffsetRef.current += speed * 0.02

    // Score
    scoreRef.current += speed * 0.05
    setScore(Math.floor(scoreRef.current))

    // Speed up
    speedRef.current = Math.min(MAX_SPEED, speedRef.current + SPEED_INCREMENT)

    // Player physics
    if (isJumpingRef.current) {
      velYRef.current += GRAVITY
      playerYRef.current += velYRef.current

      if (playerYRef.current >= GROUND_Y) {
        playerYRef.current = GROUND_Y
        velYRef.current = 0
        isJumpingRef.current = false
        canDoubleJumpRef.current = true
      }
    }

    // Move clouds
    cloudsRef.current.forEach(c => {
      c.x -= c.speed
      if (c.x + c.w < 0) {
        c.x = CANVAS_W + 50
        c.y = 20 + Math.random() * 50
      }
    })

    // Spawn obstacles
    obstacleTimerRef.current--
    if (obstacleTimerRef.current <= 0) {
      spawnObstacle()
      // Min gap decreases with speed
      const minGap = Math.max(40, 80 - speed * 3)
      obstacleTimerRef.current = minGap + Math.random() * 40
    }

    // Spawn coins
    coinTimerRef.current--
    if (coinTimerRef.current <= 0) {
      spawnCoin()
      coinTimerRef.current = 30 + Math.random() * 50
    }

    // Move obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obs => {
      obs.x -= speed
      return obs.x + obs.w > -50
    })

    // Move coins
    coinsRef.current = coinsRef.current.filter(coin => {
      coin.x -= speed
      return coin.x > -20 && !coin.collected
    })

    // Player hitbox
    const ducking = isDuckingRef.current
    const ph = ducking ? PLAYER_H * 0.6 : PLAYER_H
    const pw = ducking ? PLAYER_W * 1.2 : PLAYER_W
    const py = playerYRef.current
    const playerBox = {
      x: PLAYER_X + 8,
      y: py - ph + 5,
      w: pw - 16,
      h: ph - 10,
    }

    // Collision with obstacles
    for (const obs of obstaclesRef.current) {
      const obsBox = {
        x: obs.x + 3,
        y: obs.y - obs.h + 3,
        w: obs.w - 6,
        h: obs.h - 6,
      }

      if (
        playerBox.x < obsBox.x + obsBox.w &&
        playerBox.x + playerBox.w > obsBox.x &&
        playerBox.y < obsBox.y + obsBox.h &&
        playerBox.y + playerBox.h > obsBox.y
      ) {
        // Game over
        gameStateRef.current = 'gameover'
        setGameState('gameover')
        const finalScore = Math.floor(scoreRef.current)
        trackGameEnd('loss', finalScore)
        trackScore(finalScore)
        if (finalScore >= 500) trackWin()
        if (finalScore >= 1000) trackPerfect()
        const saved = parseInt(localStorage.getItem('onde-ocean-run-highscore') || '0')
        if (finalScore > saved) {
          localStorage.setItem('onde-ocean-run-highscore', finalScore.toString())
          setHighScore(finalScore)
        }
        return
      }
    }

    // Coin collection
    coinsRef.current.forEach(coin => {
      if (coin.collected) return
      const dx = Math.abs((PLAYER_X + PLAYER_W / 2) - coin.x)
      const dy = Math.abs((py - PLAYER_H / 2) - coin.y)
      if (dx < 20 && dy < 20) {
        coin.collected = true
        coinsCollectedRef.current++
        setCoins(coinsCollectedRef.current)
        scoreRef.current += 25
      }
    })
  }, [spawnObstacle, spawnCoin, trackWin, trackPerfect, trackGameEnd, trackScore])

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
      const w = Math.min(parent.clientWidth, 800)
      canvas.width = w
      canvas.height = w * (CANVAS_H / CANVAS_W)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Jump action
  const jump = useCallback(() => {
    if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') {
      // Start game
      playerYRef.current = GROUND_Y
      velYRef.current = 0
      isJumpingRef.current = false
      canDoubleJumpRef.current = true
      isDuckingRef.current = false
      obstaclesRef.current = []
      coinsRef.current = []
      speedRef.current = INITIAL_SPEED
      scoreRef.current = 0
      coinsCollectedRef.current = 0
      frameRef.current = 0
      obstacleTimerRef.current = 60
      coinTimerRef.current = 30
      setScore(0)
      setCoins(0)
      gameStateRef.current = 'playing'
      setGameState('playing')
      return
    }

    if (gameStateRef.current !== 'playing') return

    if (!isJumpingRef.current) {
      velYRef.current = JUMP_FORCE
      isJumpingRef.current = true
      isDuckingRef.current = false
    } else if (canDoubleJumpRef.current) {
      velYRef.current = DOUBLE_JUMP_FORCE
      canDoubleJumpRef.current = false
    }
  }, [])

  // Duck action
  const startDuck = useCallback(() => {
    if (gameStateRef.current !== 'playing') return
    if (!isJumpingRef.current) {
      isDuckingRef.current = true
    } else {
      // Fast fall
      velYRef.current = Math.max(velYRef.current, 8)
    }
  }, [])

  const stopDuck = useCallback(() => {
    isDuckingRef.current = false
  }, [])

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        jump()
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        startDuck()
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        stopDuck()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [jump, startDuck, stopDuck])

  // Touch
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      jump()
    }
    canvas.addEventListener('touchstart', handleTouch, { passive: false })
    return () => canvas.removeEventListener('touchstart', handleTouch)
  }, [jump])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-sky-800 to-cyan-900 text-white">
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/games/"
            className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm font-medium"
          >
            ← Games
          </Link>
          <h1 className="text-xl font-bold text-center">🏃 Ocean Run</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-3xl mx-auto px-4 flex justify-center relative">
        <div className="w-full relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border-2 border-sky-600/50 shadow-2xl touch-none cursor-pointer"
          />

          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
              <div className="text-5xl mb-3 animate-bounce">🏄</div>
              <h2 className="text-2xl font-bold mb-1">Ocean Run</h2>
              <p className="text-sky-200 text-sm mb-3 text-center px-4">
                Jump over waves! Double jump available!
              </p>
              <button
                onClick={jump}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                ▶ Run!
              </button>
              <p className="text-xs text-sky-300/60 mt-2">Space / ↑ / Tap to jump</p>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-2">🌊</div>
              <h2 className="text-xl font-bold text-rose-400 mb-1">Wiped Out!</h2>
              <p className="text-3xl font-bold text-cyan-400 mb-0 tabular-nums">{score}</p>
              <p className="text-sm text-amber-400 mb-1">🪙 {coins} coins</p>
              <p className="text-xs text-gray-400 mb-3">
                {score > highScore ? '🏆 New Record!' : `Best: ${highScore}`}
              </p>
              <button
                onClick={jump}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile controls */}
      <div className="max-w-3xl mx-auto px-4 mt-4 flex justify-center gap-4 md:hidden">
        <button
          onTouchStart={(e) => { e.preventDefault(); startDuck() }}
          onTouchEnd={(e) => { e.preventDefault(); stopDuck() }}
          className="bg-sky-800/80 hover:bg-sky-700 active:bg-cyan-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors border border-sky-600/50 select-none touch-none"
          aria-label="Duck"
        >
          ⬇️ Duck
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); jump() }}
          className="bg-sky-800/80 hover:bg-sky-700 active:bg-cyan-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors border border-sky-600/50 select-none touch-none"
          aria-label="Jump"
        >
          ⬆️ Jump
        </button>
      </div>

      {/* Info */}
      <div className="max-w-3xl mx-auto px-4 mt-4 pb-8">
        <div className="bg-sky-800/40 rounded-xl p-4 border border-sky-700/30 text-sm text-sky-200">
          <h3 className="font-semibold text-sky-100 mb-2">How to Play</h3>
          <ul className="space-y-1">
            <li>🏃 You run automatically — jump to avoid obstacles!</li>
            <li>⬆️ <strong>Space / ↑ / Tap</strong> to jump (double jump available!)</li>
            <li>⬇️ <strong>↓ / S</strong> to duck under seagulls</li>
            <li>🪙 Collect coins for bonus points (+25)</li>
            <li>💨 Speed increases over time — how far can you go?</li>
            <li>🌊 Watch out for waves, rocks, crabs, and seagulls!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ── Wrapped Export ────────────────────────────────────────────────
export default function OceanRunPage() {
  return (
    <GameWrapper gameName="Ocean Run" gameId="ocean-run" emoji="🏃">
      <OceanRunGame />
    </GameWrapper>
  )
}
