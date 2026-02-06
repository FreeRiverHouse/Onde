'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'menu' | 'playing' | 'paused' | 'gameover'
type GameMode = '1p' | '2p'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
}

interface Paddle {
  y: number
  score: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

// Game constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 500
const PADDLE_WIDTH = 12
const PADDLE_HEIGHT = 80
const PADDLE_OFFSET = 30
const BALL_SIZE = 12
const INITIAL_BALL_SPEED = 6
const SPEED_INCREMENT = 0.3
const MAX_BALL_SPEED = 15
const WINNING_SCORE = 11

// Retro neon colors
const COLORS = {
  background: '#0a0a12',
  court: '#0f0f1a',
  paddle1: '#00ff88',
  paddle2: '#ff4488',
  ball: '#ffffff',
  text: '#00ff88',
  centerLine: '#1a2a3a',
  glow: '#00ffaa',
  accent: '#ff00aa',
}

// AI difficulty settings
const AI_SETTINGS: Record<Difficulty, { reactionSpeed: number; errorMargin: number; predictionAccuracy: number }> = {
  easy: { reactionSpeed: 0.02, errorMargin: 40, predictionAccuracy: 0.6 },
  medium: { reactionSpeed: 0.05, errorMargin: 20, predictionAccuracy: 0.8 },
  hard: { reactionSpeed: 0.1, errorMargin: 5, predictionAccuracy: 0.95 },
}

// Sound effects using Web Audio API
function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundEnabledRef = useRef(true)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback((type: 'paddle' | 'wall' | 'score' | 'start' | 'win') => {
    if (!soundEnabledRef.current) return
    
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      switch (type) {
        case 'paddle':
          osc.type = 'square'
          osc.frequency.value = 440
          gain.gain.value = 0.15
          osc.start()
          osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.05)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
          osc.stop(ctx.currentTime + 0.1)
          break
        case 'wall':
          osc.type = 'triangle'
          osc.frequency.value = 220
          gain.gain.value = 0.1
          osc.start()
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
          osc.stop(ctx.currentTime + 0.08)
          break
        case 'score':
          osc.type = 'sine'
          osc.frequency.value = 330
          gain.gain.value = 0.2
          osc.start()
          osc.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 0.3)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
          osc.stop(ctx.currentTime + 0.4)
          break
        case 'start':
          osc.type = 'square'
          osc.frequency.value = 440
          gain.gain.value = 0.15
          osc.start()
          osc.frequency.setValueAtTime(550, ctx.currentTime + 0.1)
          osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
          osc.stop(ctx.currentTime + 0.3)
          break
        case 'win':
          osc.type = 'sine'
          osc.frequency.value = 523
          gain.gain.value = 0.2
          osc.start()
          setTimeout(() => {
            const osc2 = ctx.createOscillator()
            const gain2 = ctx.createGain()
            osc2.connect(gain2)
            gain2.connect(ctx.destination)
            osc2.type = 'sine'
            osc2.frequency.value = 659
            gain2.gain.value = 0.2
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
            osc2.stop(ctx.currentTime + 0.3)
          }, 150)
          setTimeout(() => {
            const osc3 = ctx.createOscillator()
            const gain3 = ctx.createGain()
            osc3.connect(gain3)
            gain3.connect(ctx.destination)
            osc3.type = 'sine'
            osc3.frequency.value = 784
            gain3.gain.value = 0.2
            osc3.start()
            gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
            osc3.stop(ctx.currentTime + 0.4)
          }, 300)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
          osc.stop(ctx.currentTime + 0.2)
          break
      }
    } catch {
      // Audio context failed, ignore
    }
  }, [getAudioContext])

  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current
    return soundEnabledRef.current
  }, [])

  return { playSound, toggleSound, isSoundEnabled: () => soundEnabledRef.current }
}

export default function PongPage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu')
  const [gameMode, setGameMode] = useState<GameMode>('1p')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Game objects
  const [ball, setBall] = useState<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0, speed: INITIAL_BALL_SPEED })
  const [paddle1, setPaddle1] = useState<Paddle>({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 })
  const [paddle2, setPaddle2] = useState<Paddle>({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 })
  const [particles, setParticles] = useState<Particle[]>([])
  const [winner, setWinner] = useState<1 | 2 | null>(null)
  const [rally, setRally] = useState(0)
  const [maxRally, setMaxRally] = useState(0)
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  const touchRef = useRef<{ paddle1Y: number | null; paddle2Y: number | null }>({ paddle1Y: null, paddle2Y: null })
  const aiTargetRef = useRef<number>(CANVAS_HEIGHT / 2)
  const lastUpdateRef = useRef<number>(0)
  const ballRef = useRef(ball)
  const paddle1Ref = useRef(paddle1)
  const paddle2Ref = useRef(paddle2)
  const rallyRef = useRef(rally)
  
  const { playSound, toggleSound } = useGameSounds()
  
  // Keep refs in sync
  useEffect(() => { ballRef.current = ball }, [ball])
  useEffect(() => { paddle1Ref.current = paddle1 }, [paddle1])
  useEffect(() => { paddle2Ref.current = paddle2 }, [paddle2])
  useEffect(() => { rallyRef.current = rally }, [rally])
  
  // Initialize ball with random direction
  const resetBall = useCallback((scoredBy?: 1 | 2) => {
    const direction = scoredBy === 1 ? 1 : scoredBy === 2 ? -1 : (Math.random() > 0.5 ? 1 : -1)
    const angle = (Math.random() - 0.5) * Math.PI / 3 // -30 to +30 degrees
    
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: INITIAL_BALL_SPEED * direction * Math.cos(angle),
      vy: INITIAL_BALL_SPEED * Math.sin(angle),
      speed: INITIAL_BALL_SPEED,
    })
    setRally(0)
    rallyRef.current = 0
  }, [])
  
  // Create particles
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color,
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [])
  
  // AI logic
  const updateAI = useCallback(() => {
    if (gameMode !== '1p' || gameState !== 'playing') return
    
    const settings = AI_SETTINGS[difficulty]
    const b = ballRef.current
    const p2 = paddle2Ref.current
    
    // Only react when ball is coming towards AI
    if (b.vx > 0) {
      // Predict where ball will be when it reaches the paddle
      const timeToReach = (CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH - b.x) / b.vx
      let predictedY = b.y + b.vy * timeToReach * settings.predictionAccuracy
      
      // Account for bounces (simplified)
      while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
        if (predictedY < 0) predictedY = -predictedY
        if (predictedY > CANVAS_HEIGHT) predictedY = 2 * CANVAS_HEIGHT - predictedY
      }
      
      // Add some error margin
      predictedY += (Math.random() - 0.5) * settings.errorMargin
      aiTargetRef.current = predictedY
    }
    
    // Move towards target
    const targetY = aiTargetRef.current - PADDLE_HEIGHT / 2
    const diff = targetY - p2.y
    const moveAmount = diff * settings.reactionSpeed * 2 // Multiply for smoother movement
    
    setPaddle2(prev => ({
      ...prev,
      y: Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev.y + moveAmount)),
    }))
  }, [gameMode, gameState, difficulty])
  
  // Handle keyboard input
  const handlePaddleMovement = useCallback(() => {
    const speed = 8
    
    // Player 1 (W/S keys)
    if (keysRef.current.has('w') || keysRef.current.has('W')) {
      setPaddle1(prev => ({ ...prev, y: Math.max(0, prev.y - speed) }))
    }
    if (keysRef.current.has('s') || keysRef.current.has('S')) {
      setPaddle1(prev => ({ ...prev, y: Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev.y + speed) }))
    }
    
    // Player 2 (Arrow keys, only in 2P mode)
    if (gameMode === '2p') {
      if (keysRef.current.has('ArrowUp')) {
        setPaddle2(prev => ({ ...prev, y: Math.max(0, prev.y - speed) }))
      }
      if (keysRef.current.has('ArrowDown')) {
        setPaddle2(prev => ({ ...prev, y: Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev.y + speed) }))
      }
    }
  }, [gameMode])
  
  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return
    
    const deltaTime = timestamp - lastUpdateRef.current
    if (deltaTime < 16) { // Cap at ~60fps
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    lastUpdateRef.current = timestamp
    
    // Handle paddle movement
    handlePaddleMovement()
    
    // Update AI
    updateAI()
    
    // Handle touch input
    if (touchRef.current.paddle1Y !== null) {
      setPaddle1(prev => ({
        ...prev,
        y: Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, touchRef.current.paddle1Y! - PADDLE_HEIGHT / 2)),
      }))
    }
    if (gameMode === '2p' && touchRef.current.paddle2Y !== null) {
      setPaddle2(prev => ({
        ...prev,
        y: Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, touchRef.current.paddle2Y! - PADDLE_HEIGHT / 2)),
      }))
    }
    
    // Update ball position
    setBall(prevBall => {
      let { x, y, vx, vy, speed } = prevBall
      const p1 = paddle1Ref.current
      const p2 = paddle2Ref.current
      
      x += vx
      y += vy
      
      // Wall collision (top/bottom)
      if (y <= BALL_SIZE / 2 || y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
        vy = -vy
        y = y <= BALL_SIZE / 2 ? BALL_SIZE / 2 : CANVAS_HEIGHT - BALL_SIZE / 2
        playSound('wall')
        createParticles(x, y, COLORS.ball, 5)
      }
      
      // Paddle 1 collision (left)
      if (
        x - BALL_SIZE / 2 <= PADDLE_OFFSET + PADDLE_WIDTH &&
        x + BALL_SIZE / 2 >= PADDLE_OFFSET &&
        y >= p1.y &&
        y <= p1.y + PADDLE_HEIGHT &&
        vx < 0
      ) {
        // Calculate bounce angle based on where ball hit paddle
        const hitPos = (y - p1.y) / PADDLE_HEIGHT // 0 to 1
        const angle = (hitPos - 0.5) * Math.PI / 2 // -45 to +45 degrees
        
        speed = Math.min(MAX_BALL_SPEED, speed + SPEED_INCREMENT)
        vx = speed * Math.cos(angle)
        vy = speed * Math.sin(angle)
        x = PADDLE_OFFSET + PADDLE_WIDTH + BALL_SIZE / 2
        
        playSound('paddle')
        createParticles(x, y, COLORS.paddle1, 8)
        setRally(r => {
          const newRally = r + 1
          setMaxRally(m => Math.max(m, newRally))
          return newRally
        })
        rallyRef.current++
      }
      
      // Paddle 2 collision (right)
      if (
        x + BALL_SIZE / 2 >= CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH &&
        x - BALL_SIZE / 2 <= CANVAS_WIDTH - PADDLE_OFFSET &&
        y >= p2.y &&
        y <= p2.y + PADDLE_HEIGHT &&
        vx > 0
      ) {
        const hitPos = (y - p2.y) / PADDLE_HEIGHT
        const angle = (hitPos - 0.5) * Math.PI / 2
        
        speed = Math.min(MAX_BALL_SPEED, speed + SPEED_INCREMENT)
        vx = -speed * Math.cos(angle)
        vy = speed * Math.sin(angle)
        x = CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH - BALL_SIZE / 2
        
        playSound('paddle')
        createParticles(x, y, COLORS.paddle2, 8)
        setRally(r => {
          const newRally = r + 1
          setMaxRally(m => Math.max(m, newRally))
          return newRally
        })
        rallyRef.current++
      }
      
      // Scoring
      if (x < -BALL_SIZE) {
        // Player 2 scores
        playSound('score')
        createParticles(0, y, COLORS.paddle2, 20)
        setPaddle2(prev => {
          const newScore = prev.score + 1
          if (newScore >= WINNING_SCORE) {
            setWinner(2)
            setGameState('gameover')
            playSound('win')
          }
          return { ...prev, score: newScore }
        })
        setTimeout(() => resetBall(2), 1000)
        return { ...prevBall, x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0 }
      }
      
      if (x > CANVAS_WIDTH + BALL_SIZE) {
        // Player 1 scores
        playSound('score')
        createParticles(CANVAS_WIDTH, y, COLORS.paddle1, 20)
        setPaddle1(prev => {
          const newScore = prev.score + 1
          if (newScore >= WINNING_SCORE) {
            setWinner(1)
            setGameState('gameover')
            playSound('win')
          }
          return { ...prev, score: newScore }
        })
        setTimeout(() => resetBall(1), 1000)
        return { ...prevBall, x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0 }
      }
      
      return { x, y, vx, vy, speed }
    })
    
    // Update particles
    setParticles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 0.03,
        vx: p.vx * 0.95,
        vy: p.vy * 0.95,
      }))
      .filter(p => p.life > 0)
    )
    
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, gameMode, handlePaddleMovement, updateAI, playSound, createParticles, resetBall])
  
  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      lastUpdateRef.current = performance.now()
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, gameLoop])
  
  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused')
        else if (gameState === 'paused') setGameState('playing')
      }
      
      if (e.key === ' ' && (gameState === 'menu' || gameState === 'gameover')) {
        startGame()
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])
  
  // Touch event handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const getCanvasY = (clientY: number): number => {
      const rect = canvas.getBoundingClientRect()
      const scaleY = CANVAS_HEIGHT / rect.height
      return (clientY - rect.top) * scaleY
    }
    
    const getCanvasX = (clientX: number): number => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_WIDTH / rect.width
      return (clientX - rect.left) * scaleX
    }
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      Array.from(e.touches).forEach(touch => {
        const x = getCanvasX(touch.clientX)
        const y = getCanvasY(touch.clientY)
        
        if (x < CANVAS_WIDTH / 2) {
          touchRef.current.paddle1Y = y
        } else if (gameMode === '2p') {
          touchRef.current.paddle2Y = y
        }
      })
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      Array.from(e.touches).forEach(touch => {
        const x = getCanvasX(touch.clientX)
        const y = getCanvasY(touch.clientY)
        
        if (x < CANVAS_WIDTH / 2) {
          touchRef.current.paddle1Y = y
        } else if (gameMode === '2p') {
          touchRef.current.paddle2Y = y
        }
      })
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchRef.current.paddle1Y = null
        touchRef.current.paddle2Y = null
      } else {
        // Check remaining touches
        const remainingX = Array.from(e.touches).map(t => getCanvasX(t.clientX))
        if (!remainingX.some(x => x < CANVAS_WIDTH / 2)) {
          touchRef.current.paddle1Y = null
        }
        if (!remainingX.some(x => x >= CANVAS_WIDTH / 2)) {
          touchRef.current.paddle2Y = null
        }
      }
    }
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameMode])
  
  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw court background
    ctx.fillStyle = COLORS.court
    ctx.fillRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20)
    
    // Draw center line
    ctx.strokeStyle = COLORS.centerLine
    ctx.lineWidth = 4
    ctx.setLineDash([20, 15])
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 20)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw center circle
    ctx.strokeStyle = COLORS.centerLine
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50, 0, Math.PI * 2)
    ctx.stroke()
    
    // Draw scores
    ctx.font = 'bold 72px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = COLORS.paddle1 + '40'
    ctx.fillText(paddle1.score.toString(), CANVAS_WIDTH / 4, 90)
    ctx.fillStyle = COLORS.paddle2 + '40'
    ctx.fillText(paddle2.score.toString(), (CANVAS_WIDTH / 4) * 3, 90)
    
    // Draw rally counter
    if (rally > 0) {
      ctx.font = 'bold 24px monospace'
      ctx.fillStyle = COLORS.text + '80'
      ctx.fillText(`Rally: ${rally}`, CANVAS_WIDTH / 2, 40)
    }
    
    // Draw paddles with glow
    const drawPaddle = (x: number, y: number, color: string) => {
      // Glow
      ctx.shadowColor = color
      ctx.shadowBlur = 20
      ctx.fillStyle = color
      ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT)
      ctx.shadowBlur = 0
      
      // Inner highlight
      ctx.fillStyle = '#ffffff40'
      ctx.fillRect(x + 2, y + 2, PADDLE_WIDTH - 4, PADDLE_HEIGHT - 4)
    }
    
    drawPaddle(PADDLE_OFFSET, paddle1.y, COLORS.paddle1)
    drawPaddle(CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH, paddle2.y, COLORS.paddle2)
    
    // Draw ball with glow
    if (ball.vx !== 0 || ball.vy !== 0) {
      // Trail
      const trailLength = 5
      for (let i = trailLength; i > 0; i--) {
        const alpha = (1 - i / trailLength) * 0.3
        ctx.fillStyle = COLORS.ball + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(
          ball.x - ball.vx * i * 0.5,
          ball.y - ball.vy * i * 0.5,
          BALL_SIZE / 2 * (1 - i / trailLength * 0.3),
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    }
    
    // Ball
    ctx.shadowColor = COLORS.ball
    ctx.shadowBlur = 15
    ctx.fillStyle = COLORS.ball
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    
    // Draw particles
    particles.forEach(p => {
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0')
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Draw speed indicator
    const speedPercent = ((ball.speed - INITIAL_BALL_SPEED) / (MAX_BALL_SPEED - INITIAL_BALL_SPEED)) * 100
    if (speedPercent > 0 && gameState === 'playing') {
      ctx.fillStyle = COLORS.accent + '60'
      ctx.fillRect(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT - 25, speedPercent, 8)
      ctx.strokeStyle = COLORS.accent
      ctx.lineWidth = 1
      ctx.strokeRect(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT - 25, 100, 8)
    }
    
    // Pause overlay
    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      ctx.font = 'bold 48px monospace'
      ctx.fillStyle = COLORS.text
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
      
      ctx.font = '20px monospace'
      ctx.fillStyle = COLORS.text + '80'
      ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)
    }
    
  }, [ball, paddle1, paddle2, particles, gameState, rally])
  
  // Start game function
  const startGame = useCallback(() => {
    setPaddle1({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 })
    setPaddle2({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 })
    setWinner(null)
    setRally(0)
    setMaxRally(0)
    setParticles([])
    resetBall()
    setGameState('playing')
    playSound('start')
  }, [resetBall, playSound])
  
  // Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <Link
          href="/games/"
          className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
        >
          <span className="text-2xl">←</span>
          <span className="font-mono">Back</span>
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white font-mono tracking-wider">
          🏓 PONG
        </h1>
        
        <button
          onClick={() => {
            const enabled = toggleSound()
            setSoundEnabled(enabled)
          }}
          className="text-2xl hover:scale-110 transition-transform"
          aria-label="Toggle sound"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
      
      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-green-500/30 rounded-lg shadow-lg shadow-green-500/20 max-w-full h-auto touch-none"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl md:text-5xl font-bold text-green-400 font-mono mb-8 tracking-widest">
              PONG
            </h2>
            
            <div className="space-y-4 mb-8">
              {/* Game Mode Selection */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setGameMode('1p')}
                  className={`px-6 py-3 rounded-lg font-mono text-lg transition-all ${
                    gameMode === '1p'
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🤖 1 Player
                </button>
                <button
                  onClick={() => setGameMode('2p')}
                  className={`px-6 py-3 rounded-lg font-mono text-lg transition-all ${
                    gameMode === '2p'
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  👥 2 Players
                </button>
              </div>
              
              {/* Difficulty Selection (only in 1P mode) */}
              {gameMode === '1p' && (
                <div className="flex gap-2 justify-center">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 rounded font-mono transition-all ${
                        difficulty === d
                          ? 'bg-pink-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {d === 'easy' ? '😊' : d === 'medium' ? '😐' : '😈'} {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-xl rounded-lg font-mono transition-all hover:scale-105 active:scale-95"
            >
              START GAME
            </button>
            
            <div className="mt-8 text-gray-400 font-mono text-sm text-center">
              <p className="mb-2">Controls:</p>
              <p>Player 1: W/S keys or touch left side</p>
              {gameMode === '2p' && <p>Player 2: ↑/↓ arrows or touch right side</p>}
              <p className="mt-2 text-gray-500">First to {WINNING_SCORE} wins!</p>
            </div>
          </div>
        )}
        
        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-6xl mb-4">
              {winner === 1 ? '🏆' : '🤖'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-mono mb-2">
              {gameMode === '1p'
                ? winner === 1
                  ? 'YOU WIN!'
                  : 'AI WINS!'
                : `PLAYER ${winner} WINS!`}
            </h2>
            
            <div className="text-xl text-gray-400 font-mono mb-8">
              <p>Final Score: {paddle1.score} - {paddle2.score}</p>
              {maxRally > 0 && <p className="text-green-400">Best Rally: {maxRally}</p>}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg font-mono transition-all hover:scale-105"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg font-mono transition-all hover:scale-105"
              >
                MENU
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Game Info */}
      {gameState === 'playing' && (
        <div className="mt-4 flex gap-8 text-gray-400 font-mono text-sm">
          <span>ESC to pause</span>
          {gameMode === '1p' && (
            <span className="text-pink-400">
              AI: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          )}
        </div>
      )}
      
      {/* Mobile Controls Hint */}
      <div className="mt-4 text-gray-500 font-mono text-xs text-center md:hidden">
        Touch left side for Player 1{gameMode === '2p' && ', right side for Player 2'}
      </div>
    </div>
  )
}
