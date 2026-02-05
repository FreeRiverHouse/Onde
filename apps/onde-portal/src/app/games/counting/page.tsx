'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  GameLayout, 
  GameHeader, 
  GameTitle, 
  GameButton, 
  StatsBadge, 
  Confetti 
} from '../components/KidUI'

// Types
type Difficulty = 'easy' | 'medium' | 'hard'
type GameState = 'menu' | 'playing' | 'results'

interface GameStats {
  score: number
  streak: number
  maxStreak: number
  correct: number
  total: number
  stars: number
  stickers: string[]
}

// Object sets with emojis for counting
const OBJECT_SETS = {
  animals: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦋', '🐞'],
  fruits: ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭', '🍐', '🫐', '🍉', '🥥'],
  space: ['⭐', '🌟', '✨', '💫', '🌙', '🪐', '🚀', '👽', '🛸', '☄️', '🌠', '🔭', '🌌', '💎', '🎆'],
  food: ['🍕', '🍔', '🌮', '🍩', '🧁', '🍪', '🍭', '🍬', '🎂', '🍰', '🧀', '🍿', '🥨', '🍦', '🧇'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🌴', '🌵', '🍄', '🌾', '🌲', '🪻', '🪷', '💐'],
}

type ObjectTheme = keyof typeof OBJECT_SETS

// Sticker rewards
const STICKER_REWARDS = ['🏆', '🎖️', '🥇', '🌈', '🦄', '🎪', '🎠', '🎡', '🎢', '🎯', '🎨', '🎭', '🎪', '🏅', '👑', '💎', '🔮', '🎀', '🧸', '🎈']

// Sound effects using Web Audio API
function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Correct answer - happy ascending chime
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

  // Wrong answer - gentle descending tone
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

  // Pop sound for object appearance
  const playPop = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Star reward sound
  const playStar = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [659.25, 783.99, 987.77, 1174.66] // E5, G5, B5, D6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.2)
        osc.start(ctx.currentTime + i * 0.06)
        osc.stop(ctx.currentTime + i * 0.06 + 0.2)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Streak celebration sound
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

  // Victory fanfare
  const playVictory = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5] // C5, E5, G5, C6, G5, C6
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

  return { playCorrect, playWrong, playPop, playStar, playStreak, playVictory }
}

// Note: Confetti imported from KidUI

// Star burst animation component
function StarBurst({ show, position }: { show: boolean, position: { x: number, y: number } }) {
  if (!show) return null

  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 45) * (Math.PI / 180),
    delay: i * 0.03,
  }))

  return (
    <div 
      className="fixed pointer-events-none z-40"
      style={{ left: position.x, top: position.y }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-star-burst text-2xl"
          style={{
            animationDelay: `${star.delay}s`,
            '--angle': `${star.angle}rad`,
          } as React.CSSProperties}
        >
          ⭐
        </div>
      ))}
    </div>
  )
}

// Floating object with animation
function FloatingObject({ 
  emoji, 
  index, 
  total, 
  containerSize 
}: { 
  emoji: string
  index: number
  total: number
  containerSize: { width: number, height: number }
}) {
  // Calculate position in a scattered but readable layout
  const cols = Math.ceil(Math.sqrt(total * 1.5))
  const row = Math.floor(index / cols)
  const col = index % cols
  
  const baseX = (col + 0.5) * (containerSize.width / cols)
  const baseY = (row + 0.5) * (containerSize.height / Math.ceil(total / cols))
  
  // Add some randomness but keep objects spread out
  const offsetX = (Math.random() - 0.5) * 40
  const offsetY = (Math.random() - 0.5) * 40
  
  const x = Math.max(20, Math.min(containerSize.width - 40, baseX + offsetX))
  const y = Math.max(20, Math.min(containerSize.height - 40, baseY + offsetY))
  
  const animationDelay = index * 0.05
  const floatOffset = Math.random() * 2

  return (
    <div
      className="absolute text-3xl md:text-4xl animate-pop-in cursor-default select-none"
      style={{
        left: x,
        top: y,
        animationDelay: `${animationDelay}s`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div 
        className="animate-gentle-float"
        style={{ animationDelay: `${floatOffset}s` }}
      >
        {emoji}
      </div>
    </div>
  )
}

// Answer button component
function AnswerButton({
  value,
  onClick,
  disabled,
  isCorrect,
  isWrong,
  showResult,
}: {
  value: number
  onClick: () => void
  disabled: boolean
  isCorrect: boolean
  isWrong: boolean
  showResult: boolean
}) {
  let bgClass = 'bg-white hover:bg-purple-50 border-4 border-purple-200 hover:border-purple-400 text-purple-700'
  
  if (showResult) {
    if (isCorrect) {
      bgClass = 'bg-green-400 border-4 border-green-500 text-white animate-correct-bounce'
    } else if (isWrong) {
      bgClass = 'bg-red-400 border-4 border-red-500 text-white animate-shake'
    } else {
      bgClass = 'bg-gray-100 border-4 border-gray-200 text-gray-400'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-20 h-20 md:w-24 md:h-24 rounded-2xl font-black text-3xl md:text-4xl
        shadow-lg transition-all transform
        ${!disabled && !showResult && 'hover:scale-110 active:scale-95'}
        ${bgClass}
      `}
    >
      {value}
    </button>
  )
}

// Progress stars display
function ProgressStars({ count, max }: { count: number, max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span 
          key={i} 
          className={`text-2xl transition-all duration-300 ${i < count ? 'scale-100 animate-star-pop' : 'scale-75 opacity-30'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {i < count ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}

// Streak fire indicator
function StreakFire({ streak }: { streak: number }) {
  if (streak < 3) return null
  
  const intensity = Math.min(streak, 10)
  const fires = Math.min(Math.floor(streak / 3), 3)
  
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

// Sticker collection display
function StickerCollection({ stickers }: { stickers: string[] }) {
  if (stickers.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-xs">
      {stickers.map((sticker, i) => (
        <span 
          key={i} 
          className="text-xl animate-sticker-pop"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {sticker}
        </span>
      ))}
    </div>
  )
}

// Main game component
export default function CountingGame() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [theme, setTheme] = useState<ObjectTheme>('animals')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const [currentCount, setCurrentCount] = useState(0)
  const [currentEmoji, setCurrentEmoji] = useState('🐶')
  const [options, setOptions] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)
  const [totalRounds] = useState(10)
  
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    maxStreak: 0,
    correct: 0,
    total: 0,
    stars: 0,
    stickers: [],
  })
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStarBurst, setShowStarBurst] = useState(false)
  const [starBurstPos, setStarBurstPos] = useState({ x: 0, y: 0 })
  const [newSticker, setNewSticker] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const { playCorrect, playWrong, playPop, playStar, playStreak, playVictory } = useGameSounds()

  // Get difficulty config
  const getDifficultyConfig = useCallback(() => {
    switch (difficulty) {
      case 'easy':
        return { minCount: 1, maxCount: 10, optionCount: 3 }
      case 'medium':
        return { minCount: 5, maxCount: 15, optionCount: 4 }
      case 'hard':
        return { minCount: 10, maxCount: 20, optionCount: 4 }
    }
  }, [difficulty])

  // Generate a new round
  const generateRound = useCallback(() => {
    const config = getDifficultyConfig()
    const count = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount
    
    // Pick random emoji from theme
    const emojiSet = OBJECT_SETS[theme]
    const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)]
    
    // Generate wrong options
    const wrongOptions: number[] = []
    while (wrongOptions.length < config.optionCount - 1) {
      const offset = Math.floor(Math.random() * 5) + 1
      const wrongAnswer = count + (Math.random() > 0.5 ? offset : -offset)
      if (wrongAnswer > 0 && wrongAnswer !== count && !wrongOptions.includes(wrongAnswer)) {
        wrongOptions.push(wrongAnswer)
      }
    }
    
    // Shuffle options with correct answer
    const allOptions = [...wrongOptions, count].sort(() => Math.random() - 0.5)
    
    setCurrentCount(count)
    setCurrentEmoji(emoji)
    setOptions(allOptions)
    setSelectedAnswer(null)
    setShowResult(false)
    
    // Play pop sounds for objects appearing
    if (soundEnabled) {
      setTimeout(() => playPop(), 100)
    }
  }, [getDifficultyConfig, theme, soundEnabled, playPop])

  // Start game
  const startGame = useCallback(() => {
    setStats({
      score: 0,
      streak: 0,
      maxStreak: 0,
      correct: 0,
      total: 0,
      stars: 0,
      stickers: [],
    })
    setRound(1)
    setGameState('playing')
    generateRound()
  }, [generateRound])

  // Handle answer selection
  const handleAnswer = useCallback((answer: number) => {
    if (showResult) return
    
    setSelectedAnswer(answer)
    setShowResult(true)
    
    const isCorrect = answer === currentCount
    
    if (isCorrect) {
      if (soundEnabled) playCorrect()
      
      // Calculate points
      const basePoints = 100
      const streakBonus = stats.streak * 20
      const difficultyBonus = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 25 : 0
      const points = basePoints + streakBonus + difficultyBonus
      
      const newStreak = stats.streak + 1
      const newMaxStreak = Math.max(newStreak, stats.maxStreak)
      
      // Award star every 3 correct answers
      const newStars = stats.stars + ((stats.correct + 1) % 3 === 0 ? 1 : 0)
      if ((stats.correct + 1) % 3 === 0 && soundEnabled) {
        setTimeout(() => playStar(), 300)
      }
      
      // Award sticker on streaks of 5
      let newStickers = [...stats.stickers]
      if (newStreak > 0 && newStreak % 5 === 0) {
        const availableStickers = STICKER_REWARDS.filter(s => !newStickers.includes(s))
        if (availableStickers.length > 0) {
          const sticker = availableStickers[Math.floor(Math.random() * availableStickers.length)]
          newStickers = [...newStickers, sticker]
          setNewSticker(sticker)
          if (soundEnabled) playStreak(newStreak)
          setTimeout(() => setNewSticker(null), 2000)
        }
      }
      
      // Show star burst animation
      if (newStreak >= 3 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setStarBurstPos({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        })
        setShowStarBurst(true)
        setTimeout(() => setShowStarBurst(false), 600)
      }
      
      setStats(prev => ({
        ...prev,
        score: prev.score + points,
        streak: newStreak,
        maxStreak: newMaxStreak,
        correct: prev.correct + 1,
        total: prev.total + 1,
        stars: newStars,
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
    
    // Move to next round or end game
    setTimeout(() => {
      if (round >= totalRounds) {
        setGameState('results')
        setShowConfetti(true)
        if (soundEnabled) playVictory()
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        setRound(prev => prev + 1)
        generateRound()
      }
    }, 1500)
  }, [showResult, currentCount, stats, difficulty, round, totalRounds, soundEnabled, playCorrect, playWrong, playStar, playStreak, playVictory, generateRound])

  // Container size for object placement
  const [containerSize, setContainerSize] = useState({ width: 300, height: 200 })
  
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        if (containerRef.current) {
          setContainerSize({
            width: containerRef.current.offsetWidth - 40,
            height: containerRef.current.offsetHeight - 40,
          })
        }
      }
      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
  }, [gameState])

  // Render menu
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      {/* Back to Arcade */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/games/arcade/" className="bg-white/90 hover:bg-white px-4 py-2 rounded-full font-bold text-purple-600 shadow-lg transition-all hover:scale-105 text-sm">
          ◀ Arcade
        </Link>
      </div>
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse">
          COUNTING
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">Fun! 🔢</p>
        <p className="text-gray-500 mt-2">Count the objects and pick the right number!</p>
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
              {d === 'easy' ? '😊 Easy' : d === 'medium' ? '🤔 Medium' : '🔥 Hard'}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center mt-3">
          {difficulty === 'easy' && 'Count 1-10 objects'}
          {difficulty === 'medium' && 'Count 5-15 objects'}
          {difficulty === 'hard' && 'Count 10-20 objects'}
        </p>
      </div>

      {/* Theme selection */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Theme</h2>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(OBJECT_SETS) as ObjectTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-3 rounded-xl text-2xl transition-all ${
                theme === t
                  ? 'bg-purple-500 shadow-lg scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {OBJECT_SETS[t][0]}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center mt-3 capitalize">{theme}</p>
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
        
        <div className="text-center">
          <div className="text-sm text-gray-500">Round</div>
          <div className="font-black text-xl text-purple-600">{round}/{totalRounds}</div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Score</div>
          <div className="font-black text-xl text-purple-600">{stats.score.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress and streak */}
      <div className="flex items-center justify-between mb-4 px-2">
        <ProgressStars count={stats.stars} max={5} />
        <StreakFire streak={stats.streak} />
      </div>

      {/* Question prompt */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-purple-700">
          How many {currentEmoji} can you count?
        </h2>
      </div>

      {/* Objects container */}
      <div 
        ref={containerRef}
        className="flex-1 bg-white/90 rounded-3xl shadow-xl relative overflow-hidden mb-6 min-h-[250px] md:min-h-[300px]"
        style={{ padding: '20px' }}
      >
        {Array.from({ length: currentCount }, (_, i) => (
          <FloatingObject
            key={`${round}-${i}`}
            emoji={currentEmoji}
            index={i}
            total={currentCount}
            containerSize={containerSize}
          />
        ))}
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 left-4 text-6xl">🔢</div>
          <div className="absolute bottom-4 right-4 text-6xl">✨</div>
        </div>
      </div>

      {/* Answer options */}
      <div className="flex justify-center gap-4 mb-6">
        {options.map((option) => (
          <AnswerButton
            key={option}
            value={option}
            onClick={() => handleAnswer(option)}
            disabled={showResult}
            isCorrect={showResult && option === currentCount}
            isWrong={showResult && option === selectedAnswer && option !== currentCount}
            showResult={showResult}
          />
        ))}
      </div>

      {/* Sticker collection */}
      <div className="text-center">
        <StickerCollection stickers={stats.stickers} />
      </div>

      {/* New sticker popup */}
      {newSticker && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-bounce-in text-center">
            <div className="text-6xl mb-2">{newSticker}</div>
            <div className="font-black text-purple-600 text-xl">New Sticker!</div>
          </div>
        </div>
      )}

      <StarBurst show={showStarBurst} position={starBurstPos} />
    </div>
  )

  // Render results
  const renderResults = () => {
    const percentage = Math.round((stats.correct / stats.total) * 100)
    const rating = percentage >= 90 ? '🌟 AMAZING!' : percentage >= 70 ? '⭐ GREAT!' : percentage >= 50 ? '👍 GOOD!' : '💪 KEEP TRYING!'
    
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <Confetti active={showConfetti} />
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {rating}
          </h1>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {stats.score.toLocaleString()}
            </div>
            <div className="text-gray-500 font-medium">POINTS</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-1">✅</div>
              <div className="font-black text-xl text-green-500">{stats.correct}/{stats.total}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-black text-xl text-orange-500">{stats.maxStreak}x</div>
              <div className="text-xs text-gray-500">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⭐</div>
              <div className="font-black text-xl text-yellow-500">{stats.stars}</div>
              <div className="text-xs text-gray-500">Stars</div>
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

        {/* Action buttons */}
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
    <GameLayout background="candy" className="relative overflow-hidden">
      {/* Header - Back link */}
      <GameHeader
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        backLabel="← Giochi"
        className="w-full"
      />

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '🔢', '➕', '✨'].map((emoji, i) => (
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
        {gameState === 'results' && renderResults()}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pop-in {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes star-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(calc(cos(var(--angle)) * 60px), calc(sin(var(--angle)) * 60px)) scale(0); opacity: 0; }
        }
        @keyframes star-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes sticker-pop {
          0% { transform: scale(0) rotate(-180deg); }
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
        .animate-pop-in {
          animation: pop-in 0.4s ease-out forwards;
        }
        .animate-gentle-float {
          animation: gentle-float 3s ease-in-out infinite;
        }
        .animate-star-burst {
          animation: star-burst 0.5s ease-out forwards;
        }
        .animate-star-pop {
          animation: star-pop 0.3s ease-out;
        }
        .animate-sticker-pop {
          animation: sticker-pop 0.5s ease-out;
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
    </GameLayout>
  )
}
