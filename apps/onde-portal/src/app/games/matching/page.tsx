'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { 
  GameLayout, 
  GameHeader, 
  GameTitle, 
  GameButton, 
  StatsBadge, 
  Confetti,
  StarRating 
} from '../components/KidUI'

// Types
interface MatchItem {
  id: string
  emoji: string
  name: string
  category: string
}

interface Category {
  id: string
  name: string
  emoji: string
  color: string
  items: string[]
}

interface LevelConfig {
  level: number
  theme: 'animals' | 'food' | 'shapes'
  title: string
  categories: Category[]
  timeLimit: number
  itemCount: number
}

type GameState = 'menu' | 'playing' | 'levelComplete' | 'gameOver'

// Sound effects using Web Audio API
function useMatchSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playPickup = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

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
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.15)
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
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playLevelComplete = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.3)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playDrop = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 300
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playStar = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  return { playPickup, playCorrect, playWrong, playLevelComplete, playDrop, playStar }
}

// Level configurations
const levelConfigs: LevelConfig[] = [
  // Level 1: Animals & Habitats (Easy)
  {
    level: 1,
    theme: 'animals',
    title: 'Where do they live?',
    timeLimit: 60,
    itemCount: 6,
    categories: [
      { id: 'ocean', name: 'Ocean', emoji: '🌊', color: 'from-blue-400 to-blue-600', items: ['🐟', '🐙', '🦈', '🐬', '🦑', '🐳'] },
      { id: 'forest', name: 'Forest', emoji: '🌲', color: 'from-green-500 to-green-700', items: ['🦊', '🐻', '🦌', '🐿️', '🦉', '🐺'] },
    ],
  },
  // Level 2: Animals & Habitats (Medium)
  {
    level: 2,
    theme: 'animals',
    title: 'Animal Homes',
    timeLimit: 50,
    itemCount: 8,
    categories: [
      { id: 'farm', name: 'Farm', emoji: '🏠', color: 'from-amber-400 to-amber-600', items: ['🐄', '🐷', '🐔', '🐴', '🐑', '🐐', '🦆', '🐓'] },
      { id: 'jungle', name: 'Jungle', emoji: '🌴', color: 'from-lime-500 to-lime-700', items: ['🦁', '🐘', '🦒', '🐵', '🦜', '🐆', '🦓', '🦛'] },
    ],
  },
  // Level 3: Food & Colors (Easy)
  {
    level: 3,
    theme: 'food',
    title: 'Sort by Color!',
    timeLimit: 55,
    itemCount: 6,
    categories: [
      { id: 'red', name: 'Red', emoji: '🔴', color: 'from-red-400 to-red-600', items: ['🍎', '🍓', '🍒', '🌶️', '🍅', '🫑'] },
      { id: 'yellow', name: 'Yellow', emoji: '🟡', color: 'from-yellow-400 to-yellow-600', items: ['🍌', '🍋', '🌽', '🧀', '⭐', '🌻'] },
    ],
  },
  // Level 4: Food & Colors (Medium)
  {
    level: 4,
    theme: 'food',
    title: 'Color Feast!',
    timeLimit: 45,
    itemCount: 8,
    categories: [
      { id: 'green', name: 'Green', emoji: '🟢', color: 'from-emerald-400 to-emerald-600', items: ['🥒', '🥦', '🥬', '🥝', '🍀', '🥗', '🫛', '🥑'] },
      { id: 'orange', name: 'Orange', emoji: '🟠', color: 'from-orange-400 to-orange-600', items: ['🍊', '🥕', '🎃', '🥧', '🧡', '🏀', '🦊', '🍑'] },
    ],
  },
  // Level 5: Shapes & Sizes (Easy)
  {
    level: 5,
    theme: 'shapes',
    title: 'Big or Small?',
    timeLimit: 50,
    itemCount: 6,
    categories: [
      { id: 'big', name: 'Big', emoji: '⬆️', color: 'from-purple-400 to-purple-600', items: ['🐘', '🏔️', '🌳', '🏠', '🚌', '🦣'] },
      { id: 'small', name: 'Small', emoji: '⬇️', color: 'from-pink-400 to-pink-600', items: ['🐜', '🐞', '🦋', '🍓', '💎', '🌸'] },
    ],
  },
  // Level 6: Shapes & Sizes (Medium)
  {
    level: 6,
    theme: 'shapes',
    title: 'Shape Sorter!',
    timeLimit: 45,
    itemCount: 8,
    categories: [
      { id: 'round', name: 'Round', emoji: '⭕', color: 'from-cyan-400 to-cyan-600', items: ['🏀', '⚽', '🍎', '🌕', '🍪', '🎱', '🔴', '🍊'] },
      { id: 'other', name: 'Not Round', emoji: '🔷', color: 'from-indigo-400 to-indigo-600', items: ['⭐', '💎', '🏠', '📚', '🎁', '📱', '🔺', '🧊'] },
    ],
  },
  // Level 7: Advanced Mix
  {
    level: 7,
    theme: 'animals',
    title: 'Sky or Land?',
    timeLimit: 40,
    itemCount: 10,
    categories: [
      { id: 'sky', name: 'Sky', emoji: '☁️', color: 'from-sky-400 to-sky-600', items: ['🦅', '🦋', '🐝', '🦇', '🕊️', '🐦', '🦜', '🪰', '🐞', '🦚'] },
      { id: 'land', name: 'Land', emoji: '🏞️', color: 'from-amber-500 to-amber-700', items: ['🦁', '🐕', '🐈', '🐇', '🦔', '🐢', '🦎', '🐛', '🐌', '🐸'] },
    ],
  },
  // Level 8: Challenge
  {
    level: 8,
    theme: 'food',
    title: 'Fruits vs Veggies!',
    timeLimit: 35,
    itemCount: 10,
    categories: [
      { id: 'fruits', name: 'Fruits', emoji: '🍎', color: 'from-rose-400 to-rose-600', items: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝'] },
      { id: 'veggies', name: 'Veggies', emoji: '🥕', color: 'from-teal-400 to-teal-600', items: ['🥕', '🥦', '🥬', '🌽', '🥒', '🍆', '🫑', '🧅', '🧄', '🥔'] },
    ],
  },
  // Level 9: Hard
  {
    level: 9,
    theme: 'shapes',
    title: 'Hot or Cold?',
    timeLimit: 30,
    itemCount: 10,
    categories: [
      { id: 'hot', name: 'Hot', emoji: '🔥', color: 'from-red-500 to-orange-600', items: ['🔥', '☀️', '🌶️', '🌋', '♨️', '🍳', '☕', '🏜️', '🎆', '💥'] },
      { id: 'cold', name: 'Cold', emoji: '❄️', color: 'from-blue-400 to-cyan-600', items: ['❄️', '🧊', '⛄', '🌨️', '🏔️', '🐧', '🎿', '🧤', '🍦', '🥶'] },
    ],
  },
  // Level 10: Master
  {
    level: 10,
    theme: 'animals',
    title: 'Day or Night?',
    timeLimit: 25,
    itemCount: 12,
    categories: [
      { id: 'day', name: 'Day', emoji: '☀️', color: 'from-yellow-400 to-amber-500', items: ['☀️', '🌻', '🐓', '🦋', '🐝', '🌈', '🏖️', '🎪', '🎈', '🌞', '🐤', '🌼'] },
      { id: 'night', name: 'Night', emoji: '🌙', color: 'from-indigo-500 to-purple-700', items: ['🌙', '⭐', '🦉', '🦇', '🌃', '🎆', '🔮', '💫', '🌛', '🦔', '🐺', '🌌'] },
    ],
  },
]

// Note: Confetti and StarRating imported from KidUI

// Draggable item component
function DraggableItem({
  item,
  onDragStart,
  onDragEnd,
  isMatched,
  shake,
}: {
  item: MatchItem
  onDragStart: (e: React.DragEvent | React.TouchEvent, item: MatchItem) => void
  onDragEnd: () => void
  isMatched: boolean
  shake: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
    onDragStart(e, item)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    onDragStart(e, item)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  if (isMatched) return null

  return (
    <div
      ref={elementRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        w-14 h-14 md:w-16 md:h-16 flex items-center justify-center
        bg-white rounded-xl shadow-lg cursor-grab active:cursor-grabbing
        transition-all duration-200 select-none touch-none
        ${isDragging ? 'scale-110 shadow-2xl opacity-80 rotate-6' : 'hover:scale-105 hover:-rotate-3'}
        ${shake ? 'animate-shake' : ''}
      `}
    >
      <span className="text-3xl md:text-4xl">{item.emoji}</span>
    </div>
  )
}

// Category drop zone component
function CategoryDropZone({
  category,
  onDrop,
  isOver,
  matchedItems,
  correct,
}: {
  category: Category
  onDrop: (category: Category) => void
  isOver: boolean
  matchedItems: MatchItem[]
  correct: boolean | null
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(category)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative p-3 md:p-4 rounded-2xl border-4 border-dashed transition-all duration-300
        min-h-[140px] md:min-h-[160px] flex flex-col
        ${isOver ? 'scale-105 border-solid' : ''}
        ${correct === true ? 'bg-green-100 border-green-400 animate-correct-flash' : ''}
        ${correct === false ? 'bg-red-100 border-red-400' : ''}
        ${correct === null ? `bg-gradient-to-br ${category.color} bg-opacity-20 border-white/50` : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl md:text-3xl">{category.emoji}</span>
        <span className="font-bold text-white text-sm md:text-base drop-shadow-md">{category.name}</span>
      </div>

      {/* Matched items grid */}
      <div className="flex-1 flex flex-wrap gap-1 content-start">
        {matchedItems.map((item) => (
          <div
            key={item.id}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/80 rounded-lg flex items-center justify-center animate-pop-in shadow"
          >
            <span className="text-xl md:text-2xl">{item.emoji}</span>
          </div>
        ))}
      </div>

      {/* Drop hint */}
      {matchedItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/50 font-medium text-sm">Drop here!</span>
        </div>
      )}
    </div>
  )
}

// Timer bar component
function TimerBar({ timeLeft, totalTime }: { timeLeft: number, totalTime: number }) {
  const percentage = (timeLeft / totalTime) * 100
  const isLow = timeLeft <= 10

  return (
    <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full transition-all duration-1000 rounded-full ${
          isLow ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse' : 'bg-gradient-to-r from-green-400 to-blue-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// Main game component
function MatchingGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [items, setItems] = useState<MatchItem[]>([])
  const [matchedItems, setMatchedItems] = useState<Map<string, MatchItem[]>>(new Map())
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [draggingItem, setDraggingItem] = useState<MatchItem | null>(null)
  const [hoverCategory, setHoverCategory] = useState<string | null>(null)
  const [correctCategory, setCorrectCategory] = useState<string | null>(null)
  const [wrongCategory, setWrongCategory] = useState<string | null>(null)
  const [shakeItem, setShakeItem] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [stars, setStars] = useState(0)
  const [animateStars, setAnimateStars] = useState(false)
  const [highScores, setHighScores] = useState<number[]>([])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { playPickup, playCorrect, playWrong, playLevelComplete, playDrop, playStar } = useMatchSounds()

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('matching-game-highscores')
    if (saved) {
      try {
        setHighScores(JSON.parse(saved))
      } catch { /* Invalid data */ }
    }
  }, [])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endLevel(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState])

  // Initialize level
  const initializeLevel = useCallback((level: number) => {
    const config = levelConfigs[level - 1]
    if (!config) {
      // Game complete!
      setGameState('gameOver')
      return
    }

    // Create items from categories
    const allItems: MatchItem[] = []
    config.categories.forEach((cat) => {
      const selectedItems = cat.items.slice(0, config.itemCount / 2)
      selectedItems.forEach((emoji, idx) => {
        allItems.push({
          id: `${cat.id}-${idx}`,
          emoji,
          name: emoji,
          category: cat.id,
        })
      })
    })

    // Shuffle items
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allItems[i], allItems[j]] = [allItems[j], allItems[i]]
    }

    setItems(allItems)
    setMatchedItems(new Map())
    setTimeLeft(config.timeLimit)
    setScore(0)
    setCorrectCategory(null)
    setWrongCategory(null)
    setGameState('playing')
  }, [])

  // Start game
  const startGame = (level: number = 1) => {
    setCurrentLevel(level)
    setTotalScore(0)
    initializeLevel(level)
  }

  // End level
  const endLevel = useCallback((completed: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)

    // Calculate stars based on performance
    const config = levelConfigs[currentLevel - 1]
    const matchedCount = Array.from(matchedItems.values()).flat().length
    const totalItems = config.itemCount
    const timeBonus = timeLeft > 0 ? Math.floor((timeLeft / config.timeLimit) * 100) : 0
    const accuracy = matchedCount / totalItems

    let earnedStars = 0
    if (completed) {
      if (accuracy >= 1 && timeBonus >= 50) earnedStars = 3
      else if (accuracy >= 0.8) earnedStars = 2
      else earnedStars = 1
    }

    const levelScore = score + timeBonus
    setScore(levelScore)
    setTotalScore((prev) => prev + levelScore)
    setStars(earnedStars)
    setAnimateStars(true)
    setShowConfetti(completed && earnedStars >= 2)

    if (soundEnabled) {
      playLevelComplete()
      if (earnedStars > 0) {
        setTimeout(() => playStar(), 300)
        if (earnedStars > 1) setTimeout(() => playStar(), 600)
        if (earnedStars > 2) setTimeout(() => playStar(), 900)
      }
    }

    setGameState('levelComplete')
      rewards.trackWin()

    // Save high score
    if (levelScore > (highScores[currentLevel - 1] || 0)) {
      const newHighScores = [...highScores]
      newHighScores[currentLevel - 1] = levelScore
      setHighScores(newHighScores)
      localStorage.setItem('matching-game-highscores', JSON.stringify(newHighScores))
    }
  }, [currentLevel, matchedItems, timeLeft, score, highScores, soundEnabled, playLevelComplete, playStar])

  // Check if level complete
  useEffect(() => {
    if (gameState !== 'playing') return

    const config = levelConfigs[currentLevel - 1]
    const matchedCount = Array.from(matchedItems.values()).flat().length

    if (matchedCount >= config.itemCount) {
      endLevel(true)
    }
  }, [matchedItems, currentLevel, gameState, endLevel])

  // Handle drag start
  const handleDragStart = (_e: React.DragEvent | React.TouchEvent, item: MatchItem) => {
    setDraggingItem(item)
    if (soundEnabled) playPickup()
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingItem(null)
    setHoverCategory(null)
  }

  // Handle drop
  const handleDrop = (category: Category) => {
    if (!draggingItem) return

    const isCorrect = draggingItem.category === category.id

    if (isCorrect) {
      // Correct match!
      if (soundEnabled) playCorrect()
      setCorrectCategory(category.id)
      setTimeout(() => setCorrectCategory(null), 500)

      // Update matched items
      setMatchedItems((prev) => {
        const newMap = new Map(prev)
        const existing = newMap.get(category.id) || []
        newMap.set(category.id, [...existing, draggingItem])
        return newMap
      })

      // Update items (remove matched)
      setItems((prev) => prev.filter((i) => i.id !== draggingItem.id))

      // Add score
      const timeBonus = Math.floor(timeLeft / 5)
      setScore((prev) => prev + 10 + timeBonus)
    } else {
      // Wrong match!
      if (soundEnabled) playWrong()
      setWrongCategory(category.id)
      setShakeItem(draggingItem.id)
      setTimeout(() => {
        setWrongCategory(null)
        setShakeItem(null)
      }, 500)

      // Penalty
      setScore((prev) => Math.max(0, prev - 5))
    }

    if (soundEnabled) playDrop()
    setDraggingItem(null)
    setHoverCategory(null)
  }

  // Next level
  const nextLevel = () => {
    setShowConfetti(false)
    setAnimateStars(false)
    if (currentLevel < levelConfigs.length) {
      setCurrentLevel((prev) => prev + 1)
      initializeLevel(currentLevel + 1)
    } else {
      setGameState('gameOver')
    }
  }

  // Retry level
  const retryLevel = () => {
    setShowConfetti(false)
    setAnimateStars(false)
    initializeLevel(currentLevel)
  }

  // Get current level config
  const levelConfig = levelConfigs[currentLevel - 1]

  // Theme backgrounds
  const getThemeBackground = (theme: string) => {
    switch (theme) {
      case 'animals':
        return 'from-emerald-400 via-teal-400 to-cyan-500'
      case 'food':
        return 'from-orange-400 via-rose-400 to-pink-500'
      case 'shapes':
        return 'from-violet-400 via-purple-400 to-indigo-500'
      default:
        return 'from-blue-400 via-purple-400 to-pink-400'
    }
  }

  // Render menu
  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-2 text-center drop-shadow-lg">
        🎯 Match It!
      </h1>
      <p className="text-white/90 mb-8 text-center text-lg">
        Drag items to the right category!
      </p>

      {/* Level selection */}
      <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6 max-w-md w-full">
        <h2 className="text-white font-bold text-xl mb-4 text-center">Select Level</h2>
        <div className="grid grid-cols-5 gap-2">
          {levelConfigs.map((config, idx) => (
            <button
              key={config.level}
              onClick={() => startGame(config.level)}
              className={`
                w-12 h-12 md:w-14 md:h-14 rounded-xl font-black text-lg
                transition-all hover:scale-110
                ${idx === 0 || highScores[idx - 1] > 0
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/30 text-white/50 cursor-not-allowed'
                }
              `}
              disabled={idx > 0 && !highScores[idx - 1]}
            >
              {config.level}
            </button>
          ))}
        </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="px-6 py-3 bg-white/30 text-white font-bold rounded-full hover:bg-white/40 transition-all mb-6"
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      {/* Start button */}
      <button
        onClick={() => startGame(1)}
        className="px-10 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-2xl rounded-full shadow-xl hover:scale-110 transition-all animate-bounce"
      >
        🎮 Play!
      </button>

      {/* Instructions */}
      <div className="mt-8 bg-white/20 backdrop-blur rounded-2xl p-4 max-w-md w-full">
        <h3 className="text-white font-bold mb-2">How to Play:</h3>
        <ul className="text-white/90 text-sm space-y-1">
          <li>👆 Drag items to matching categories</li>
          <li>✅ Green flash = Correct!</li>
          <li>❌ Red shake = Wrong, try again!</li>
          <li>⏱️ Be quick for bonus points!</li>
          <li>⭐ Get 3 stars on each level!</li>
        </ul>
      </div>

      {/* Decorations */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">🎯</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>🌟</div>
    </div>
  )

  // Render playing
  const renderPlaying = () => (
    <div className={`min-h-screen bg-gradient-to-b ${getThemeBackground(levelConfig.theme)} flex flex-col p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setGameState('menu')}
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="text-white font-black text-xl">Level {currentLevel}</div>
          <div className="text-white/80 text-sm">{levelConfig.title}</div>
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          🎯 {score}
        </div>
      </div>

      {/* Timer */}
      <div className="mb-4">
        <div className="flex justify-between text-white font-bold text-sm mb-1">
          <span>⏱️ Time</span>
          <span>{timeLeft}s</span>
        </div>
        <TimerBar timeLeft={timeLeft} totalTime={levelConfig.timeLimit} />
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-white/90 w-10 h-10 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {levelConfig.categories.map((category) => (
          <CategoryDropZone
            key={category.id}
            category={category}
            onDrop={handleDrop}
            isOver={hoverCategory === category.id}
            matchedItems={matchedItems.get(category.id) || []}
            correct={
              correctCategory === category.id
                ? true
                : wrongCategory === category.id
                ? false
                : null
            }
          />
        ))}
      </div>

      {/* Items to drag */}
      <div className="flex-1 flex flex-col">
        <div className="text-center text-white font-bold mb-3">
          Drag items below! 👇
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex-1">
          <div className="flex flex-wrap gap-3 justify-center">
            {items.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isMatched={false}
                shake={shakeItem === item.id}
              />
            ))}
          </div>
          {items.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <span className="text-white/60 font-medium">All items matched! 🎉</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render level complete
  const renderLevelComplete = () => (
    <div className={`min-h-screen bg-gradient-to-b ${getThemeBackground(levelConfig.theme)} flex flex-col items-center justify-center p-4`}>
      <Confetti active={showConfetti} />

      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounceIn">
        <div className="text-5xl mb-4">
          {stars >= 3 ? '🏆' : stars >= 2 ? '🎉' : stars >= 1 ? '👍' : '😅'}
        </div>
        
        <h2 className="text-3xl font-black text-purple-700 mb-2">
          {stars >= 2 ? 'Great Job!' : stars >= 1 ? 'Good Try!' : 'Time\'s Up!'}
        </h2>
        
        <p className="text-gray-600 mb-4">Level {currentLevel} Complete</p>

        {/* Stars */}
        <div className="mb-6">
          <StarRating stars={stars} animate={animateStars} />
        </div>

        {/* Score */}
        <div className="bg-purple-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl font-black text-purple-600">{score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-orange-500">{totalScore}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {stars >= 1 && currentLevel < levelConfigs.length && (
            <button
              onClick={nextLevel}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              ▶️ Next Level
            </button>
          )}
          <button
            onClick={retryLevel}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition-all"
          >
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )

  // Render game over
  const renderGameOver = () => (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 flex flex-col items-center justify-center p-4">
      <Confetti active={true} />

      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounceIn">
        <div className="text-6xl mb-4">🏆</div>
        
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
          Congratulations!
        </h2>
        
        <p className="text-gray-600 mb-6">You completed all levels!</p>

        {/* Total score */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            {totalScore}
          </div>
          <div className="text-gray-500 font-medium">Total Score</div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => startGame(1)}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🎮 Play Again
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition-all"
          >
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Link
        href="/games/arcade/"
        className="fixed top-4 left-4 z-50 bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
      >
        ← Games
      </Link>

      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'levelComplete' && renderLevelComplete()}
      {gameState === 'gameOver' && renderGameOver()}

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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-5deg); }
          40% { transform: translateX(8px) rotate(5deg); }
          60% { transform: translateX(-6px) rotate(-3deg); }
          80% { transform: translateX(6px) rotate(3deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        @keyframes pop-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
        @keyframes correct-flash {
          0%, 100% { background-color: rgba(34, 197, 94, 0.3); }
          50% { background-color: rgba(34, 197, 94, 0.6); }
        }
        .animate-correct-flash {
          animation: correct-flash 0.3s ease-out;
        }
        @keyframes star-pop {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(20deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-star-pop {
          animation: star-pop 0.5s ease-out both;
        }
      `}</style>
    </>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function MatchingGame() {
  return (
    <GameWrapper gameName="Matching Game" gameId="matching" emoji={"🃏"}>
      <MatchingGameInner />
    </GameWrapper>
  )
}
