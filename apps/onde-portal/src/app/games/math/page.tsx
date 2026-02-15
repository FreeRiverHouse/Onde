'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Operation = 'addition' | 'subtraction' | 'multiplication' | 'mixed'
type Difficulty = 'easy' | 'medium' | 'hard'
type GameState = 'menu' | 'playing' | 'levelComplete' | 'results'

interface Problem {
  num1: number
  num2: number
  operation: '+' | '-' | '×'
  answer: number
}

interface GameStats {
  score: number
  streak: number
  maxStreak: number
  correct: number
  total: number
  stars: number
  level: number
  stickers: string[]
}

// Sticker rewards for achievements
const STICKER_REWARDS = ['🏆', '🎖️', '🥇', '🦄', '🌈', '💎', '👑', '🎪', '🚀', '⚡', '🔮', '🎨', '🎯', '🎭', '🎸', '🌟', '🎀', '🧸', '🎈', '🎁']

// Celebration messages
const CELEBRATION_MESSAGES = {
  correct: ['Awesome! 🎉', 'Super! ⭐', 'Great job! 🌟', 'Fantastic! 💫', 'You rock! 🎸', 'Brilliant! 💡', 'Amazing! 🔥', 'Perfect! ✨'],
  streak3: ['On fire! 🔥', '3 in a row! 🌟', 'Keep going! 💪', 'Unstoppable! 🚀'],
  streak5: ['WOW! 5 streak! 🎆', 'Math genius! 🧠', 'Incredible! 🌈', 'Superstar! ⭐'],
  streak10: ['LEGENDARY! 👑', '10 STREAK! 🎊', 'Math Master! 🏆', 'UNBELIEVABLE! 💎'],
}

// Sound effects using Web Audio API
function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playCorrect = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.25)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.25)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playWrong = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(350, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.25)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playTick = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playTimeWarning = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playStreak = useCallback((level: number) => {
    try {
      const ctx = getAudioContext()
      const baseFreq = 400 + level * 40
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = baseFreq + i * 80
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.18)
        osc.start(ctx.currentTime + i * 0.05)
        osc.stop(ctx.currentTime + i * 0.05 + 0.18)
      }
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playLevelUp = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.2)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playVictory = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.35)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.35)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  return { playCorrect, playWrong, playTick, playTimeWarning, playStreak, playLevelUp, playVictory }
}

// Confetti component
function Confetti({ active }: { active: boolean }) {
  if (!active) return null

  const pieces = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea', '#ff9ff3', '#54a0ff'][i % 10],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Floating celebration emoji
function FloatingEmoji({ emoji, index }: { emoji: string; index: number }) {
  return (
    <div
      className="fixed text-4xl animate-float-up pointer-events-none z-40"
      style={{
        left: `${20 + (index * 15) % 60}%`,
        bottom: '20%',
        animationDelay: `${index * 0.15}s`,
      }}
    >
      {emoji}
    </div>
  )
}

// Star rating display
function StarRating({ stars, maxStars = 3 }: { stars: number; maxStars?: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`text-4xl md:text-5xl transition-all duration-500 ${
            i < stars ? 'animate-star-earn scale-100' : 'scale-75 opacity-30 grayscale'
          }`}
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {i < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}

// Timer bar with animation
function TimerBar({ timeLeft, maxTime, isWarning }: { timeLeft: number; maxTime: number; isWarning: boolean }) {
  const percentage = (timeLeft / maxTime) * 100

  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full transition-all duration-100 rounded-full ${
          isWarning 
            ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse' 
            : 'bg-gradient-to-r from-green-400 to-blue-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// Streak fire indicator
function StreakFire({ streak }: { streak: number }) {
  if (streak < 2) return null

  const fires = Math.min(Math.floor(streak / 2), 5)
  const intensity = Math.min(streak, 10)

  return (
    <div className="flex items-center gap-1 animate-bounce">
      {Array.from({ length: fires }, (_, i) => (
        <span key={i} className="text-2xl animate-fire-flicker" style={{ animationDelay: `${i * 0.1}s` }}>
          🔥
        </span>
      ))}
      <span
        className="font-black text-orange-500 text-xl"
        style={{ textShadow: `0 0 ${intensity * 2}px #ff6b35` }}
      >
        {streak}x
      </span>
    </div>
  )
}

// Answer button
function AnswerButton({
  value,
  onClick,
  disabled,
  isCorrect,
  isWrong,
  showResult,
  index,
}: {
  value: number
  onClick: () => void
  disabled: boolean
  isCorrect: boolean
  isWrong: boolean
  showResult: boolean
  index: number
}) {
  const colors = [
    'from-pink-400 to-pink-600 border-pink-500',
    'from-blue-400 to-blue-600 border-blue-500',
    'from-green-400 to-green-600 border-green-500',
    'from-purple-400 to-purple-600 border-purple-500',
  ]

  let bgClass = `bg-gradient-to-br ${colors[index]} text-white border-4 hover:scale-105`

  if (showResult) {
    if (isCorrect) {
      bgClass = 'bg-gradient-to-br from-green-400 to-green-600 border-4 border-green-300 text-white animate-correct-bounce'
    } else if (isWrong) {
      bgClass = 'bg-gradient-to-br from-red-400 to-red-600 border-4 border-red-300 text-white animate-shake'
    } else {
      bgClass = 'bg-gray-300 border-4 border-gray-400 text-gray-500'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-20 h-20 md:w-28 md:h-28 rounded-2xl font-black text-2xl md:text-4xl
        shadow-xl transition-all transform
        ${!disabled && !showResult && 'active:scale-95'}
        ${bgClass}
      `}
    >
      {value}
    </button>
  )
}

// Level progress indicator
function LevelProgress({ level, questionsInLevel, maxQuestions }: { level: number; questionsInLevel: number; maxQuestions: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-sm text-gray-600 font-medium">Level {level}</div>
      <div className="flex gap-1">
        {Array.from({ length: maxQuestions }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < questionsInLevel ? 'bg-purple-500 scale-100' : 'bg-gray-300 scale-75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Main component
function MathGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [operation, setOperation] = useState<Operation>('addition')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [options, setOptions] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [timeLeft, setTimeLeft] = useState(15)
  const [maxTime, setMaxTime] = useState(15)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [questionsInLevel, setQuestionsInLevel] = useState(0)
  const questionsPerLevel = 5

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    maxStreak: 0,
    correct: 0,
    total: 0,
    stars: 0,
    level: 1,
    stickers: [],
  })

  const [showConfetti, setShowConfetti] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<string[]>([])
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null)
  const [newSticker, setNewSticker] = useState<string | null>(null)
  const [levelStars, setLevelStars] = useState(0)

  const { playCorrect, playWrong, playTick, playTimeWarning, playStreak, playLevelUp, playVictory } = useGameSounds()

  // Get time for current level/difficulty
  const getTimeForLevel = useCallback((level: number, diff: Difficulty) => {
    const baseTimes = { easy: 15, medium: 12, hard: 10 }
    const levelReduction = Math.min((level - 1) * 0.5, 5) // Reduce 0.5s per level, max 5s reduction
    return Math.max(5, baseTimes[diff] - levelReduction)
  }, [])

  // Generate a problem based on operation, difficulty, and level
  const generateProblem = useCallback((): Problem => {
    const level = stats.level
    let num1: number, num2: number, answer: number
    let op: '+' | '-' | '×'

    // Select operation
    if (operation === 'mixed') {
      const ops = ['+', '-', '×'] as const
      op = ops[Math.floor(Math.random() * ops.length)]
    } else {
      op = operation === 'addition' ? '+' : operation === 'subtraction' ? '-' : '×'
    }

    // Number ranges based on difficulty and level
    const getRange = () => {
      const levelBonus = Math.floor((level - 1) * 2)
      switch (difficulty) {
        case 'easy':
          return { min: 1, max: 10 + levelBonus }
        case 'medium':
          return { min: 2, max: 15 + levelBonus }
        case 'hard':
          return { min: 5, max: 20 + levelBonus }
      }
    }

    const range = getRange()

    // Generate numbers based on operation
    if (op === '+') {
      num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
      num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
      answer = num1 + num2
    } else if (op === '-') {
      // Ensure positive result for kids
      num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
      num2 = Math.floor(Math.random() * num1) + 1
      answer = num1 - num2
    } else {
      // Multiplication - use smaller numbers
      const multRange = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10
      num1 = Math.floor(Math.random() * (multRange - 1)) + 2
      num2 = Math.floor(Math.random() * (multRange - 1)) + 2
      answer = num1 * num2
    }

    return { num1, num2, operation: op, answer }
  }, [operation, difficulty, stats.level])

  // Generate wrong options that are close to the correct answer
  const generateOptions = useCallback((correctAnswer: number): number[] => {
    const options = new Set<number>([correctAnswer])

    while (options.size < 4) {
      // Generate wrong answers close to correct one
      const offset = Math.floor(Math.random() * 6) + 1
      const direction = Math.random() > 0.5 ? 1 : -1
      const wrongAnswer = correctAnswer + (offset * direction)

      if (wrongAnswer > 0 && !options.has(wrongAnswer)) {
        options.add(wrongAnswer)
      }
    }

    // Shuffle options
    return Array.from(options).sort(() => Math.random() - 0.5)
  }, [])

  // Start a new round
  const startRound = useCallback(() => {
    const problem = generateProblem()
    const opts = generateOptions(problem.answer)

    setCurrentProblem(problem)
    setOptions(opts)
    setSelectedAnswer(null)
    setShowResult(false)
    setCelebrationMessage(null)

    const newMaxTime = getTimeForLevel(stats.level, difficulty)
    setMaxTime(newMaxTime)
    setTimeLeft(newMaxTime)
  }, [generateProblem, generateOptions, getTimeForLevel, stats.level, difficulty])

  // Start the game
  const startGame = useCallback(() => {
    setStats({
      score: 0,
      streak: 0,
      maxStreak: 0,
      correct: 0,
      total: 0,
      stars: 0,
      level: 1,
      stickers: [],
    })
    setQuestionsInLevel(0)
    setLevelStars(0)
    setGameState('playing')
    startRound()
  }, [startRound])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (showResult) return

    setShowResult(true)
    if (soundEnabled) playWrong()

    setStats(prev => ({
      ...prev,
      streak: 0,
      total: prev.total + 1,
    }))

    // Move to next question after delay
    setTimeout(() => {
      setQuestionsInLevel(prev => {
        const newCount = prev + 1
        if (newCount >= questionsPerLevel) {
          // Calculate stars for this level
          const levelCorrect = stats.correct - (Math.floor(stats.correct / questionsPerLevel) * questionsPerLevel)
          const stars = levelCorrect >= 4 ? 3 : levelCorrect >= 3 ? 2 : levelCorrect >= 1 ? 1 : 0
          setLevelStars(stars)
          setGameState('levelComplete')
          if (soundEnabled) playLevelUp()
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          return 0
        }
        return newCount
      })
      startRound()
    }, 1500)
  }, [showResult, soundEnabled, playWrong, playLevelUp, startRound, stats.correct])

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || showResult) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        if (prev <= 5 && soundEnabled) playTimeWarning()
        else if (soundEnabled && prev <= 10) playTick()
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, showResult, soundEnabled, playTick, playTimeWarning, handleTimeUp])

  // Handle answer selection
  const handleAnswer = useCallback((answer: number) => {
    if (showResult || !currentProblem) return

    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === currentProblem.answer

    if (isCorrect) {
      if (soundEnabled) playCorrect()

      // Calculate points
      const basePoints = 100
      const timeBonus = Math.floor(timeLeft * 10)
      const streakBonus = stats.streak * 25
      const levelBonus = (stats.level - 1) * 50
      const difficultyBonus = difficulty === 'hard' ? 100 : difficulty === 'medium' ? 50 : 0
      const points = basePoints + timeBonus + streakBonus + levelBonus + difficultyBonus

      const newStreak = stats.streak + 1
      const newMaxStreak = Math.max(newStreak, stats.maxStreak)

      // Celebration message
      let message: string
      if (newStreak >= 10) {
        message = CELEBRATION_MESSAGES.streak10[Math.floor(Math.random() * CELEBRATION_MESSAGES.streak10.length)]
        if (soundEnabled) playStreak(10)
      } else if (newStreak >= 5) {
        message = CELEBRATION_MESSAGES.streak5[Math.floor(Math.random() * CELEBRATION_MESSAGES.streak5.length)]
        if (soundEnabled) playStreak(5)
      } else if (newStreak >= 3) {
        message = CELEBRATION_MESSAGES.streak3[Math.floor(Math.random() * CELEBRATION_MESSAGES.streak3.length)]
        if (soundEnabled) playStreak(3)
      } else {
        message = CELEBRATION_MESSAGES.correct[Math.floor(Math.random() * CELEBRATION_MESSAGES.correct.length)]
      }
      setCelebrationMessage(message)

      // Floating emojis for big streaks
      if (newStreak >= 5) {
        setFloatingEmojis(['🎉', '⭐', '🌟', '✨', '💫'])
        setTimeout(() => setFloatingEmojis([]), 2000)
      }

      // Award sticker on streaks of 5
      let newStickers = [...stats.stickers]
      if (newStreak > 0 && newStreak % 5 === 0) {
        const availableStickers = STICKER_REWARDS.filter(s => !newStickers.includes(s))
        if (availableStickers.length > 0) {
          const sticker = availableStickers[Math.floor(Math.random() * availableStickers.length)]
          newStickers = [...newStickers, sticker]
          setNewSticker(sticker)
          setTimeout(() => setNewSticker(null), 2000)
        }
      }

      setStats(prev => ({
        ...prev,
        score: prev.score + points,
        streak: newStreak,
        maxStreak: newMaxStreak,
        correct: prev.correct + 1,
        total: prev.total + 1,
        stickers: newStickers,
      }))
    } else {
      if (soundEnabled) playWrong()
      setStats(prev => ({
        ...prev,
        streak: 0,
        total: prev.total + 1,
      }))
    }

    // Move to next question after delay
    setTimeout(() => {
      setQuestionsInLevel(prev => {
        const newCount = prev + 1
        if (newCount >= questionsPerLevel) {
          // Calculate stars for this level based on correct answers in this level
          const correctInLevel = isCorrect 
            ? (stats.correct % questionsPerLevel) + 1 
            : stats.correct % questionsPerLevel
          const stars = correctInLevel >= 5 ? 3 : correctInLevel >= 3 ? 2 : correctInLevel >= 1 ? 1 : 0
          setLevelStars(stars)
          setGameState('levelComplete')
          if (soundEnabled) playLevelUp()
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          return 0
        }
        return newCount
      })
      startRound()
    }, 1500)
  }, [showResult, currentProblem, timeLeft, stats, difficulty, soundEnabled, playCorrect, playWrong, playStreak, playLevelUp, startRound])

  // Continue to next level
  const continueToNextLevel = useCallback(() => {
    setStats(prev => ({
      ...prev,
      level: prev.level + 1,
      stars: prev.stars + levelStars,
    }))
    setQuestionsInLevel(0)
    setGameState('playing')
    startRound()
  }, [levelStars, startRound])

  // End game
  const endGame = useCallback(() => {
    setStats(prev => ({
      ...prev,
      stars: prev.stars + levelStars,
    }))
    setGameState('results')
        rewards.trackWin()
    if (soundEnabled) playVictory()
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }, [levelStars, soundEnabled, playVictory])

  // Render menu
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
          MATH
        </h1>
        <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
          Challenge! 🧮
        </div>
        <p className="text-gray-500 mt-2">Solve problems, beat the clock!</p>
      </div>

      {/* Floating math symbols decoration */}
      <div className="relative w-full max-w-md h-20 overflow-hidden">
        {['➕', '➖', '✖️', '🔢', '🎯', '⭐'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-3xl animate-float-decoration opacity-60"
            style={{
              left: `${(i * 17) % 100}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Operation selection */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Operation</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'addition', label: '➕ Addition', emoji: '➕' },
            { id: 'subtraction', label: '➖ Subtraction', emoji: '➖' },
            { id: 'multiplication', label: '✖️ Multiply', emoji: '✖️' },
            { id: 'mixed', label: '🎲 Mixed', emoji: '🎲' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id as Operation)}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                operation === op.id
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selection */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Difficulty</h2>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                difficulty === d
                  ? d === 'easy'
                    ? 'bg-green-500 text-white shadow-lg'
                    : d === 'medium'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d === 'easy' ? '😊' : d === 'medium' ? '🤔' : '🔥'} {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center mt-3">
          {difficulty === 'easy' && 'Small numbers, more time'}
          {difficulty === 'medium' && 'Bigger numbers, less time'}
          {difficulty === 'hard' && 'Biggest numbers, fastest pace!'}
        </p>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="px-6 py-3 bg-gray-100 rounded-full text-gray-600 font-medium hover:bg-gray-200 transition-all"
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      {/* Start button */}
      <button
        onClick={startGame}
        className="px-12 py-5 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-2xl rounded-full shadow-xl hover:scale-110 transition-all animate-bounce"
      >
        START! 🚀
      </button>
    </div>
  )

  // Render playing
  const renderPlaying = () => (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setGameState('menu')}
          className="bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow hover:scale-105 transition-all"
        >
          ← Back
        </button>

        <LevelProgress level={stats.level} questionsInLevel={questionsInLevel} maxQuestions={questionsPerLevel} />

        <div className="text-right">
          <div className="text-sm text-gray-500">Score</div>
          <div className="font-black text-xl text-purple-600">{stats.score.toLocaleString()}</div>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-4 px-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600 font-medium">⏱️ Time</span>
          <StreakFire streak={stats.streak} />
        </div>
        <TimerBar timeLeft={timeLeft} maxTime={maxTime} isWarning={timeLeft <= 5} />
      </div>

      {/* Problem display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {currentProblem && (
          <div className="bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 text-8xl">🧮</div>
              <div className="absolute bottom-4 right-4 text-6xl">✨</div>
            </div>

            {/* Problem */}
            <div className="relative z-10 text-center">
              <div className="text-5xl md:text-7xl font-black text-gray-800 tracking-wider">
                {currentProblem.num1}
                <span className="mx-4 text-purple-500">{currentProblem.operation}</span>
                {currentProblem.num2}
              </div>
              <div className="text-4xl md:text-6xl font-black text-gray-400 mt-4">= ?</div>
            </div>
          </div>
        )}

        {/* Celebration message */}
        {celebrationMessage && (
          <div className="text-center mb-4 animate-bounce-in">
            <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              {celebrationMessage}
            </span>
          </div>
        )}

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {options.map((option, index) => (
            <AnswerButton
              key={option}
              value={option}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              isCorrect={showResult && option === currentProblem?.answer}
              isWrong={showResult && option === selectedAnswer && option !== currentProblem?.answer}
              showResult={showResult}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} index={i} />
      ))}

      {/* New sticker popup */}
      {newSticker && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-bounce-in text-center">
            <div className="text-7xl mb-2">{newSticker}</div>
            <div className="font-black text-purple-600 text-xl">New Sticker!</div>
          </div>
        </div>
      )}
    </div>
  )

  // Render level complete
  const renderLevelComplete = () => (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <Confetti active={showConfetti} />

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-4">
          Level {stats.level} Complete!
        </h2>

        <StarRating stars={levelStars} />

        <div className="mt-6 mb-6">
          <div className="text-lg text-gray-600 mb-2">Score so far</div>
          <div className="text-4xl font-black text-purple-600">{stats.score.toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-100 rounded-xl p-3">
            <div className="text-2xl">✅</div>
            <div className="font-bold text-green-600">{stats.correct} correct</div>
          </div>
          <div className="bg-orange-100 rounded-xl p-3">
            <div className="text-2xl">🔥</div>
            <div className="font-bold text-orange-600">{stats.maxStreak}x best streak</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={continueToNextLevel}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            Next Level →
          </button>
          <button
            onClick={endGame}
            className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  )

  // Render results
  const renderResults = () => {
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    const rating =
      percentage >= 90
        ? '🌟 MATH GENIUS!'
        : percentage >= 70
        ? '⭐ SUPER SMART!'
        : percentage >= 50
        ? '👍 GREAT JOB!'
        : '💪 KEEP PRACTICING!'

    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <Confetti active={showConfetti} />

        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {rating}
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {stats.score.toLocaleString()}
            </div>
            <div className="text-gray-500 font-medium">POINTS</div>
          </div>

          {/* Total stars earned */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-2">Stars Earned</div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: stats.stars }, (_, i) => (
                <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                  ⭐
                </span>
              ))}
              {stats.stars === 0 && <span className="text-gray-400">No stars yet</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center bg-purple-50 rounded-xl p-4">
              <div className="text-3xl mb-1">📊</div>
              <div className="font-black text-xl text-purple-600">{stats.correct}/{stats.total}</div>
              <div className="text-xs text-gray-500">Correct ({percentage}%)</div>
            </div>
            <div className="text-center bg-orange-50 rounded-xl p-4">
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-black text-xl text-orange-600">{stats.maxStreak}x</div>
              <div className="text-xs text-gray-500">Best Streak</div>
            </div>
            <div className="text-center bg-blue-50 rounded-xl p-4">
              <div className="text-3xl mb-1">🎯</div>
              <div className="font-black text-xl text-blue-600">Level {stats.level}</div>
              <div className="text-xs text-gray-500">Reached</div>
            </div>
            <div className="text-center bg-green-50 rounded-xl p-4">
              <div className="text-3xl mb-1">⭐</div>
              <div className="font-black text-xl text-green-600">{stats.stars}</div>
              <div className="text-xs text-gray-500">Total Stars</div>
            </div>
          </div>

          {/* Stickers earned */}
          {stats.stickers.length > 0 && (
            <div className="text-center border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Stickers Earned</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {stats.stickers.map((sticker, i) => (
                  <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                    {sticker}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🔄 Play Again
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🏠 Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Back link */}
      {gameState === 'menu' && (
        <Link
          href="/games/arcade/"
          className="absolute top-4 left-4 z-20 bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all backdrop-blur-sm"
        >
          ← Games
        </Link>
      )}

      {/* Sound toggle in header */}
      {gameState !== 'menu' && (
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 right-4 z-20 bg-white/80 px-3 py-2 rounded-full shadow-lg hover:scale-105 transition-all"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      )}

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {['➕', '➖', '✖️', '🔢', '🧮', '💯', '🎯', '⭐'].map((emoji, i) => (
          <div
            key={i}
            className="absolute animate-float-decoration"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
              animationDelay: `${i * 0.8}s`,
              fontSize: '2.5rem',
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {gameState === 'menu' && renderMenu()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'levelComplete' && renderLevelComplete()}
        {gameState === 'results' && renderResults()}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(0); opacity: 0; }
        }
        @keyframes star-earn {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.3) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes correct-bounce {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.15); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fire-flicker {
          0%, 100% { transform: scale(1) rotate(-5deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }
        @keyframes float-decoration {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(15deg); }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-out forwards;
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
        .animate-star-earn {
          animation: star-earn 0.6s ease-out;
        }
        .animate-correct-bounce {
          animation: correct-bounce 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
        .animate-fire-flicker {
          animation: fire-flicker 0.3s ease-in-out infinite;
        }
        .animate-float-decoration {
          animation: float-decoration 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function MathGame() {
  return (
    <GameWrapper gameName="Math Quest" gameId="math" emoji={"🔢"}>
      <MathGameInner />
    </GameWrapper>
  )
}
