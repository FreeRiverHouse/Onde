'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'idle' | 'playing' | 'gameover'
type ObstacleType = 'cactus-small' | 'cactus-large' | 'cactus-group' | 'bird-low' | 'bird-high'
type TimeOfDay = 'day' | 'night'

interface Obstacle {
  id: number
  type: ObstacleType
  x: number
  width: number
  height: number
  y: number
}

interface Cloud {
  id: number
  x: number
  y: number
  speed: number
}

interface Star {
  x: number
  y: number
  size: number
  twinkle: number
}

interface HighScoreEntry {
  score: number
  date: string
}

// Game constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 300
const GROUND_Y = 240
const DINO_WIDTH = 44
const DINO_HEIGHT = 47
const DINO_DUCK_HEIGHT = 26
const INITIAL_SPEED = 6
const MAX_SPEED = 16
const SPEED_INCREMENT = 0.001
const GRAVITY = 0.6
const JUMP_FORCE = -13
const DAY_NIGHT_CYCLE = 700 // Score interval for day/night switch

// Colors
const COLORS = {
  dayBg: '#f7f7f7',
  nightBg: '#1a1a2e',
  daySky: '#87CEEB',
  nightSky: '#0f0f1a',
  ground: '#535353',
  dino: '#535353',
  dinoNight: '#c0c0c0',
  obstacle: '#535353',
  obstacleNight: '#c0c0c0',
  cloud: '#c0c0c0',
  cloudNight: '#2a2a4a',
  text: '#535353',
  textNight: '#ffffff',
  moon: '#fffacd',
  star: '#ffffff',
}

// Sound effects
const playSound = (type: 'jump' | 'score' | 'hit' | 'milestone') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'jump':
        osc.frequency.value = 600
        osc.type = 'square'
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(400, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'score':
        osc.frequency.value = 880
        osc.type = 'sine'
        gain.gain.value = 0.1
        osc.start()
        setTimeout(() => { osc.frequency.value = 1100 }, 50)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'hit':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'milestone':
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
            osc2.stop(audio.currentTime + 0.1)
          }, i * 60)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Draw pixel-art style dino
const drawDino = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isDucking: boolean,
  isJumping: boolean,
  frame: number,
  isNight: boolean
) => {
  const color = isNight ? COLORS.dinoNight : COLORS.dino
  ctx.fillStyle = color

  if (isDucking) {
    // Ducking dino - lower and wider
    // Body
    ctx.fillRect(x, y + 20, 55, 16)
    // Head
    ctx.fillRect(x + 35, y + 12, 20, 18)
    // Eye (white space)
    ctx.fillStyle = isNight ? COLORS.nightBg : COLORS.dayBg
    ctx.fillRect(x + 47, y + 16, 4, 4)
    ctx.fillStyle = color
    // Legs (animated)
    if (frame % 2 === 0) {
      ctx.fillRect(x + 10, y + 36, 6, 10)
      ctx.fillRect(x + 30, y + 36, 6, 10)
    } else {
      ctx.fillRect(x + 5, y + 36, 6, 10)
      ctx.fillRect(x + 25, y + 36, 6, 10)
    }
  } else {
    // Standing/running dino
    // Body
    ctx.fillRect(x + 10, y, 30, 35)
    // Tail
    ctx.fillRect(x, y + 10, 15, 10)
    ctx.fillRect(x - 5, y + 15, 10, 5)
    // Head
    ctx.fillRect(x + 25, y - 15, 22, 25)
    ctx.fillRect(x + 35, y - 20, 12, 10)
    // Eye (white space)
    ctx.fillStyle = isNight ? COLORS.nightBg : COLORS.dayBg
    ctx.fillRect(x + 39, y - 12, 5, 5)
    ctx.fillStyle = color
    // Arms
    ctx.fillRect(x + 30, y + 15, 8, 12)
    ctx.fillRect(x + 26, y + 22, 6, 5)
    
    // Legs (animated only when running)
    if (!isJumping && frame % 2 === 0) {
      ctx.fillRect(x + 12, y + 35, 8, 14)
      ctx.fillRect(x + 28, y + 35, 8, 8)
    } else if (!isJumping) {
      ctx.fillRect(x + 12, y + 35, 8, 8)
      ctx.fillRect(x + 28, y + 35, 8, 14)
    } else {
      // Both legs down when jumping
      ctx.fillRect(x + 12, y + 35, 8, 12)
      ctx.fillRect(x + 28, y + 35, 8, 12)
    }
  }
}

// Draw obstacles
const drawObstacle = (
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  frame: number,
  isNight: boolean
) => {
  const color = isNight ? COLORS.obstacleNight : COLORS.obstacle
  ctx.fillStyle = color

  switch (obstacle.type) {
    case 'cactus-small':
      // Small single cactus
      ctx.fillRect(obstacle.x + 8, obstacle.y, 10, obstacle.height)
      ctx.fillRect(obstacle.x, obstacle.y + 10, 8, 8)
      ctx.fillRect(obstacle.x + 18, obstacle.y + 15, 8, 8)
      break
    case 'cactus-large':
      // Large cactus
      ctx.fillRect(obstacle.x + 10, obstacle.y, 14, obstacle.height)
      ctx.fillRect(obstacle.x, obstacle.y + 15, 10, 10)
      ctx.fillRect(obstacle.x, obstacle.y + 25, 6, 15)
      ctx.fillRect(obstacle.x + 24, obstacle.y + 10, 10, 10)
      ctx.fillRect(obstacle.x + 28, obstacle.y + 20, 6, 20)
      break
    case 'cactus-group':
      // Group of cacti
      ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 8, obstacle.height - 5)
      ctx.fillRect(obstacle.x + 18, obstacle.y, 10, obstacle.height)
      ctx.fillRect(obstacle.x + 33, obstacle.y + 8, 8, obstacle.height - 8)
      // Arms
      ctx.fillRect(obstacle.x, obstacle.y + 20, 5, 6)
      ctx.fillRect(obstacle.x + 28, obstacle.y + 12, 5, 6)
      ctx.fillRect(obstacle.x + 41, obstacle.y + 22, 5, 6)
      break
    case 'bird-low':
    case 'bird-high':
      // Pterodactyl
      const wingOffset = frame % 2 === 0 ? -5 : 5
      // Body
      ctx.fillRect(obstacle.x + 15, obstacle.y + 10, 25, 12)
      // Head
      ctx.fillRect(obstacle.x + 35, obstacle.y + 8, 15, 8)
      ctx.fillRect(obstacle.x + 45, obstacle.y + 10, 10, 4)
      // Beak
      ctx.fillRect(obstacle.x + 50, obstacle.y + 12, 8, 3)
      // Wings (animated)
      ctx.fillRect(obstacle.x + 5, obstacle.y + wingOffset + 8, 20, 6)
      ctx.fillRect(obstacle.x, obstacle.y + wingOffset + 6, 8, 4)
      // Eye
      ctx.fillStyle = isNight ? COLORS.nightBg : COLORS.dayBg
      ctx.fillRect(obstacle.x + 42, obstacle.y + 10, 3, 3)
      break
  }
}

// Draw cloud
const drawCloud = (
  ctx: CanvasRenderingContext2D,
  cloud: Cloud,
  isNight: boolean
) => {
  ctx.fillStyle = isNight ? COLORS.cloudNight : COLORS.cloud
  ctx.beginPath()
  ctx.arc(cloud.x, cloud.y, 15, 0, Math.PI * 2)
  ctx.arc(cloud.x + 20, cloud.y - 5, 18, 0, Math.PI * 2)
  ctx.arc(cloud.x + 40, cloud.y, 15, 0, Math.PI * 2)
  ctx.arc(cloud.x + 25, cloud.y + 5, 12, 0, Math.PI * 2)
  ctx.fill()
}

// Draw moon
const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = COLORS.moon
  ctx.beginPath()
  ctx.arc(x, y, 25, 0, Math.PI * 2)
  ctx.fill()
  // Craters
  ctx.fillStyle = '#e6e0a0'
  ctx.beginPath()
  ctx.arc(x - 8, y - 5, 5, 0, Math.PI * 2)
  ctx.arc(x + 10, y + 8, 4, 0, Math.PI * 2)
  ctx.arc(x + 5, y - 10, 3, 0, Math.PI * 2)
  ctx.fill()
}

// Draw stars
const drawStars = (ctx: CanvasRenderingContext2D, stars: Star[], frame: number) => {
  stars.forEach((star) => {
    const twinkle = Math.sin((frame + star.twinkle) * 0.1) * 0.5 + 0.5
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`
    ctx.fillRect(star.x, star.y, star.size, star.size)
  })
}

function DinoRunnerGameInner() {
  const rewards = useGameContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)

  // Game refs for animation loop
  const gameRef = useRef({
    dinoY: GROUND_Y - DINO_HEIGHT,
    dinoVelocity: 0,
    isDucking: false,
    isJumping: false,
    obstacles: [] as Obstacle[],
    clouds: [] as Cloud[],
    stars: [] as Star[],
    speed: INITIAL_SPEED,
    score: 0,
    frame: 0,
    groundOffset: 0,
    lastObstacleX: CANVAS_WIDTH + 200,
    nextObstacleId: 0,
    lastMilestone: 0,
  })

  const animationRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())

  // Initialize stars
  useEffect(() => {
    gameRef.current.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (GROUND_Y - 50),
      size: Math.random() * 2 + 1,
      twinkle: Math.random() * 100,
    }))
  }, [])

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dino-runner-highscore')
      if (saved) {
        const data: HighScoreEntry = JSON.parse(saved)
        setHighScore(data.score)
      }
    } catch {
      // Ignore
    }
  }, [])

  // Save high score
  const saveHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore)
      try {
        localStorage.setItem('dino-runner-highscore', JSON.stringify({
          score: newScore,
          date: new Date().toISOString(),
        }))
      } catch {
        // Ignore
      }
    }
  }, [highScore])

  // Generate obstacle
  const generateObstacle = useCallback((): Obstacle => {
    const types: ObstacleType[] = ['cactus-small', 'cactus-large', 'cactus-group', 'bird-low', 'bird-high']
    const weights = [30, 25, 20, 12, 13] // Weights for each type
    
    // Only spawn birds after score > 200
    const availableTypes = gameRef.current.score > 200 ? types : types.slice(0, 3)
    const availableWeights = gameRef.current.score > 200 ? weights : weights.slice(0, 3)
    
    const totalWeight = availableWeights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    let typeIndex = 0
    for (let i = 0; i < availableWeights.length; i++) {
      random -= availableWeights[i]
      if (random <= 0) {
        typeIndex = i
        break
      }
    }
    
    const type = availableTypes[typeIndex]
    
    let width: number, height: number, y: number
    
    switch (type) {
      case 'cactus-small':
        width = 26
        height = 40
        y = GROUND_Y - height
        break
      case 'cactus-large':
        width = 34
        height = 55
        y = GROUND_Y - height
        break
      case 'cactus-group':
        width = 46
        height = 45
        y = GROUND_Y - height
        break
      case 'bird-low':
        width = 58
        height = 25
        y = GROUND_Y - 50
        break
      case 'bird-high':
        width = 58
        height = 25
        y = GROUND_Y - 100
        break
      default:
        width = 26
        height = 40
        y = GROUND_Y - height
    }

    return {
      id: gameRef.current.nextObstacleId++,
      type,
      x: CANVAS_WIDTH + 50,
      width,
      height,
      y,
    }
  }, [])

  // Check collision
  const checkCollision = useCallback((dinoY: number, isDucking: boolean, obstacles: Obstacle[]): boolean => {
    const dinoX = 50
    const dinoWidth = isDucking ? 55 : DINO_WIDTH
    const dinoHeight = isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT
    const actualDinoY = isDucking ? GROUND_Y - dinoHeight : dinoY

    // Collision box with some padding for fairness
    const padding = 5
    const dinoBox = {
      left: dinoX + padding,
      right: dinoX + dinoWidth - padding,
      top: actualDinoY + padding,
      bottom: actualDinoY + dinoHeight - padding,
    }

    for (const obstacle of obstacles) {
      const obstacleBox = {
        left: obstacle.x + 5,
        right: obstacle.x + obstacle.width - 5,
        top: obstacle.y + 5,
        bottom: obstacle.y + obstacle.height - 5,
      }

      if (
        dinoBox.right > obstacleBox.left &&
        dinoBox.left < obstacleBox.right &&
        dinoBox.bottom > obstacleBox.top &&
        dinoBox.top < obstacleBox.bottom
      ) {
        return true
      }
    }

    return false
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const game = gameRef.current
    const isNight = timeOfDay === 'night'

    // Clear canvas
    ctx.fillStyle = isNight ? COLORS.nightBg : COLORS.dayBg
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw stars (night only)
    if (isNight) {
      drawStars(ctx, game.stars, game.frame)
      drawMoon(ctx, 700, 50)
    }

    // Draw clouds
    game.clouds.forEach((cloud) => {
      drawCloud(ctx, cloud, isNight)
    })

    // Draw ground
    ctx.strokeStyle = isNight ? COLORS.obstacleNight : COLORS.ground
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y + 2)
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 2)
    ctx.stroke()

    // Draw ground pattern
    ctx.lineWidth = 1
    for (let i = 0; i < CANVAS_WIDTH + 20; i += 20) {
      const x = (i - game.groundOffset % 20)
      ctx.beginPath()
      ctx.moveTo(x, GROUND_Y + 8)
      ctx.lineTo(x + 5, GROUND_Y + 8)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + 10, GROUND_Y + 12)
      ctx.lineTo(x + 13, GROUND_Y + 12)
      ctx.stroke()
    }

    // Handle input
    const isDucking = keysRef.current.has('ArrowDown') || keysRef.current.has('KeyS')
    const isJumpPressed = keysRef.current.has('ArrowUp') || keysRef.current.has('Space') || keysRef.current.has('KeyW')

    // Jump
    if (isJumpPressed && game.dinoY >= GROUND_Y - DINO_HEIGHT && !game.isJumping) {
      game.dinoVelocity = JUMP_FORCE
      game.isJumping = true
      if (soundEnabled) playSound('jump')
    }

    // Apply gravity
    if (game.isJumping || game.dinoY < GROUND_Y - DINO_HEIGHT) {
      // Fast fall when ducking in air
      const gravityMultiplier = isDucking ? 2 : 1
      game.dinoVelocity += GRAVITY * gravityMultiplier
      game.dinoY += game.dinoVelocity

      if (game.dinoY >= GROUND_Y - DINO_HEIGHT) {
        game.dinoY = GROUND_Y - DINO_HEIGHT
        game.dinoVelocity = 0
        game.isJumping = false
      }
    }

    game.isDucking = isDucking && !game.isJumping

    // Draw dino
    const dinoY = game.isDucking ? GROUND_Y - DINO_DUCK_HEIGHT : game.dinoY
    drawDino(ctx, 50, dinoY, game.isDucking, game.isJumping, game.frame, isNight)

    // Update and draw obstacles
    game.obstacles = game.obstacles.filter((obs) => obs.x > -100)
    game.obstacles.forEach((obstacle) => {
      obstacle.x -= game.speed
      drawObstacle(ctx, obstacle, game.frame, isNight)
    })

    // Spawn new obstacles
    const minGap = Math.max(300, 500 - game.speed * 10)
    const maxGap = Math.max(400, 700 - game.speed * 10)
    if (game.obstacles.length === 0 || 
        CANVAS_WIDTH - (game.obstacles[game.obstacles.length - 1]?.x || 0) > minGap + Math.random() * (maxGap - minGap)) {
      game.obstacles.push(generateObstacle())
    }

    // Update clouds
    game.clouds = game.clouds.filter((cloud) => cloud.x > -60)
    game.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed
    })
    if (game.clouds.length < 5 && Math.random() < 0.01) {
      game.clouds.push({
        id: Date.now(),
        x: CANVAS_WIDTH + 50,
        y: 30 + Math.random() * 60,
        speed: 1 + Math.random() * 0.5,
      })
    }

    // Update ground offset
    game.groundOffset += game.speed

    // Check collision
    if (checkCollision(game.dinoY, game.isDucking, game.obstacles)) {
      if (soundEnabled) playSound('hit')
      saveHighScore(Math.floor(game.score))
      setScore(Math.floor(game.score))
      setGameState('gameover')
      rewards.trackWin()
      return
    }

    // Update score
    game.score += 0.15
    setScore(Math.floor(game.score))

    // Milestone sound
    const currentMilestone = Math.floor(game.score / 100) * 100
    if (currentMilestone > game.lastMilestone && currentMilestone > 0) {
      game.lastMilestone = currentMilestone
      if (soundEnabled) playSound('milestone')
    }

    // Day/night cycle
    const shouldBeNight = Math.floor(game.score / DAY_NIGHT_CYCLE) % 2 === 1
    if (shouldBeNight && timeOfDay === 'day') {
      setTimeOfDay('night')
    } else if (!shouldBeNight && timeOfDay === 'night') {
      setTimeOfDay('day')
    }

    // Increase speed
    game.speed = Math.min(MAX_SPEED, INITIAL_SPEED + game.score * SPEED_INCREMENT)

    // Update frame counter
    game.frame++

    // Draw score
    ctx.fillStyle = isNight ? COLORS.textNight : COLORS.text
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`HI ${String(highScore).padStart(5, '0')}  ${String(Math.floor(game.score)).padStart(5, '0')}`, CANVAS_WIDTH - 20, 30)

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [timeOfDay, soundEnabled, highScore, checkCollision, generateObstacle, saveHighScore])

  // Start game
  const startGame = useCallback(() => {
    const game = gameRef.current
    game.dinoY = GROUND_Y - DINO_HEIGHT
    game.dinoVelocity = 0
    game.isDucking = false
    game.isJumping = false
    game.obstacles = []
    game.speed = INITIAL_SPEED
    game.score = 0
    game.frame = 0
    game.groundOffset = 0
    game.lastMilestone = 0
    game.clouds = [
      { id: 1, x: 200, y: 50, speed: 1.2 },
      { id: 2, x: 450, y: 70, speed: 0.8 },
      { id: 3, x: 650, y: 40, speed: 1 },
    ]

    setScore(0)
    setTimeOfDay('day')
    setGameState('playing')
    setShowInstructions(false)
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  // Stop game
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault()
      }
      keysRef.current.add(e.code)

      if (gameState === 'idle' || gameState === 'gameover') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          startGame()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, startGame])

  // Touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = touch.clientY - rect.top

    if (gameState === 'idle' || gameState === 'gameover') {
      startGame()
      return
    }

    // Top half = jump, bottom half = duck
    if (y < rect.height / 2) {
      keysRef.current.add('Space')
    } else {
      keysRef.current.add('ArrowDown')
    }
  }, [gameState, startGame])

  const handleTouchEnd = useCallback(() => {
    keysRef.current.delete('Space')
    keysRef.current.delete('ArrowDown')
  }, [])

  // Draw idle/game over screen
  useEffect(() => {
    if (gameState !== 'playing') {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      const isNight = timeOfDay === 'night'

      // Clear canvas
      ctx.fillStyle = isNight ? COLORS.nightBg : COLORS.dayBg
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw stars (night only)
      if (isNight) {
        drawStars(ctx, gameRef.current.stars, 0)
        drawMoon(ctx, 700, 50)
      }

      // Draw ground
      ctx.strokeStyle = isNight ? COLORS.obstacleNight : COLORS.ground
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y + 2)
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 2)
      ctx.stroke()

      // Draw dino
      drawDino(ctx, 50, GROUND_Y - DINO_HEIGHT, false, false, 0, isNight)

      // Draw text
      ctx.fillStyle = isNight ? COLORS.textNight : COLORS.text
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'

      if (gameState === 'gameover') {
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 100)
        ctx.font = 'bold 20px monospace'
        ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, 135)
        if (score >= highScore && score > 0) {
          ctx.fillStyle = '#ffd700'
          ctx.fillText('🏆 NEW HIGH SCORE! 🏆', CANVAS_WIDTH / 2, 165)
        }
      }

      ctx.fillStyle = isNight ? COLORS.textNight : COLORS.text
      ctx.font = '16px monospace'
      ctx.fillText('Press SPACE or tap to start', CANVAS_WIDTH / 2, 200)

      // Draw score
      ctx.font = 'bold 20px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`HI ${String(highScore).padStart(5, '0')}`, CANVAS_WIDTH - 20, 30)
    }
  }, [gameState, score, highScore, timeOfDay])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/games/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-2xl">←</span>
            <span>Back to Games</span>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🦖</span>
            Dino Runner
          </h1>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-2xl p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (gameState === 'idle' || gameState === 'gameover') {
              startGame()
            }
          }}
        />

        {/* Instructions overlay */}
        {showInstructions && gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 mx-4 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">🦖 How to Play</h2>
              <div className="space-y-3 text-left mb-6">
                <p className="flex items-center gap-3">
                  <span className="text-2xl">⬆️</span>
                  <span><strong>SPACE / ↑ / W</strong> - Jump over obstacles</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                  <span><strong>↓ / S</strong> - Duck under birds</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <span><strong>Touch</strong> - Top half = jump, Bottom = duck</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🌙</span>
                  <span>Day and night cycle every 700 points!</span>
                </p>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
              >
                Start Running! 🏃
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-8 text-white">
        <div className="text-center">
          <div className="text-3xl font-bold font-mono">{String(score).padStart(5, '0')}</div>
          <div className="text-white/60 text-sm">Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold font-mono text-yellow-400">{String(highScore).padStart(5, '0')}</div>
          <div className="text-white/60 text-sm">High Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl">{timeOfDay === 'day' ? '☀️' : '🌙'}</div>
          <div className="text-white/60 text-sm capitalize">{timeOfDay}</div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 text-white/50 text-sm text-center max-w-md">
        <p>💡 Hold down to duck while in the air for a fast fall!</p>
        <p className="mt-1">🦅 Birds appear after 200 points - duck under low ones, jump over high ones!</p>
      </div>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function DinoRunnerGame() {
  return (
    <GameWrapper gameName="Dino Runner" gameId="dino" emoji={"🦕"}>
      <DinoRunnerGameInner />
    </GameWrapper>
  )
}
