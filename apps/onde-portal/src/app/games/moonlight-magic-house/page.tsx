'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// Game state machine
type GameState = 'menu' | 'find-toy' | 'feed-time' | 'reward' | 'loading'

// Reward types
interface Rewards {
  treats: number
  toys: number
}

// Hidden spot type for Find the Toy game
interface HidingSpot {
  id: number
  x: number
  y: number
  emoji: string
  hasToy: boolean
}

// Food item for Feed Time game
interface FoodItem {
  id: number
  emoji: string
  name: string
}

const HIDING_SPOTS_EMOJIS = ['🛋️', '🪴', '📦', '🧸', '🎁', '🪑', '🛏️', '🧺']
const FOOD_ITEMS: FoodItem[] = [
  { id: 1, emoji: '🐟', name: 'Fish' },
  { id: 2, emoji: '🍖', name: 'Meat' },
  { id: 3, emoji: '🥩', name: 'Steak' },
  { id: 4, emoji: '🍗', name: 'Chicken' },
]

export default function MoonlightMagicHouse() {
  const [isLoading, setIsLoading] = useState(true)
  const [gameState, setGameState] = useState<GameState>('loading')
  const [rewards, setRewards] = useState<Rewards>({ treats: 0, toys: 0 })
  
  // Find the Toy game state
  const [hidingSpots, setHidingSpots] = useState<HidingSpot[]>([])
  const [triesLeft, setTriesLeft] = useState(3)
  const [foundToy, setFoundToy] = useState(false)
  const [checkedSpots, setCheckedSpots] = useState<Set<number>>(new Set())
  
  // Feed Time game state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [petFed, setPetFed] = useState(false)
  const [petMood, setPetMood] = useState<'hungry' | 'eating' | 'happy'>('hungry')
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const petRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setGameState('menu')
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Initialize Find the Toy game
  const startFindToy = useCallback(() => {
    const spots: HidingSpot[] = []
    const toyIndex = Math.floor(Math.random() * 6)
    
    for (let i = 0; i < 6; i++) {
      spots.push({
        id: i,
        x: 15 + (i % 3) * 30,
        y: 30 + Math.floor(i / 3) * 25,
        emoji: HIDING_SPOTS_EMOJIS[Math.floor(Math.random() * HIDING_SPOTS_EMOJIS.length)],
        hasToy: i === toyIndex,
      })
    }
    
    setHidingSpots(spots)
    setTriesLeft(3)
    setFoundToy(false)
    setCheckedSpots(new Set())
    setGameState('find-toy')
  }, [])

  // Handle spot check in Find the Toy
  const checkSpot = (spot: HidingSpot) => {
    if (checkedSpots.has(spot.id) || foundToy || triesLeft <= 0) return
    
    setCheckedSpots(prev => new Set([...prev, spot.id]))
    
    if (spot.hasToy) {
      setFoundToy(true)
      setRewards(prev => ({ ...prev, toys: prev.toys + 1 }))
      setTimeout(() => setGameState('reward'), 1500)
    } else {
      const newTries = triesLeft - 1
      setTriesLeft(newTries)
      if (newTries <= 0) {
        setTimeout(() => setGameState('menu'), 2000)
      }
    }
  }

  // Initialize Feed Time game
  const startFeedTime = useCallback(() => {
    setSelectedFood(null)
    setPetFed(false)
    setPetMood('hungry')
    setDragPosition(null)
    setGameState('feed-time')
  }, [])

  // Handle food selection
  const selectFood = (food: FoodItem) => {
    if (!petFed) {
      setSelectedFood(food)
    }
  }

  // Handle drag
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedFood || petFed) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragPosition({ x: clientX, y: clientY })
  }

  // Handle drop on pet
  const handleDrop = () => {
    if (!selectedFood || petFed || !petRef.current || !dragPosition) {
      setDragPosition(null)
      return
    }
    
    const petRect = petRef.current.getBoundingClientRect()
    const isOverPet = 
      dragPosition.x >= petRect.left && 
      dragPosition.x <= petRect.right &&
      dragPosition.y >= petRect.top && 
      dragPosition.y <= petRect.bottom
    
    if (isOverPet) {
      setPetMood('eating')
      setTimeout(() => {
        setPetMood('happy')
        setPetFed(true)
        setRewards(prev => ({ ...prev, treats: prev.treats + 1 }))
        setTimeout(() => setGameState('reward'), 1500)
      }, 1000)
    }
    
    setDragPosition(null)
    setSelectedFood(null)
  }

  // Render loading screen
  if (isLoading || gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌙</div>
          <p className="text-white text-xl font-semibold">Loading Moonlight Magic House...</p>
        </div>
      </div>
    )
  }

  // Main menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center p-4">
        {/* Stars background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🌙 Moonlight Magic House 🏠
          </h1>
          <p className="text-purple-200 mb-8">Choose a mini-game to play!</p>
          
          {/* Rewards display */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🧸</span>
              <span className="text-white font-bold">{rewards.toys}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🍬</span>
              <span className="text-white font-bold">{rewards.treats}</span>
            </div>
          </div>
          
          {/* Game buttons */}
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <button
              onClick={startFindToy}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🔍 Find the Toy
            </button>
            <button
              onClick={startFeedTime}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🍽️ Feed Time
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Find the Toy game
  if (gameState === 'find-toy') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center p-4">
        {/* Header */}
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setGameState('menu')}
              className="text-white/70 hover:text-white text-sm"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-white">🔍 Find the Toy!</h2>
            <div className="text-white font-bold">
              Tries: {'❤️'.repeat(triesLeft)}{'🖤'.repeat(3 - triesLeft)}
            </div>
          </div>
          
          <p className="text-center text-purple-200 mb-6">
            {foundToy 
              ? '🎉 You found it!' 
              : triesLeft <= 0 
                ? '😿 Out of tries!' 
                : 'Tap a hiding spot to find the toy!'}
          </p>
        </div>
        
        {/* Game area */}
        <div className="relative w-full max-w-lg h-[60vh] bg-gradient-to-b from-[#2a2a4e] to-[#1a1a3e] rounded-3xl shadow-2xl overflow-hidden">
          {/* Room decoration */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl">🌙</div>
          <div className="absolute top-4 right-4 text-2xl">⭐</div>
          <div className="absolute top-4 left-4 text-2xl">✨</div>
          
          {/* Hiding spots */}
          {hidingSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => checkSpot(spot)}
              disabled={checkedSpots.has(spot.id) || foundToy || triesLeft <= 0}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-5xl transition-all duration-300
                ${checkedSpots.has(spot.id) 
                  ? spot.hasToy 
                    ? 'scale-125 animate-bounce' 
                    : 'opacity-50 grayscale'
                  : 'hover:scale-110 cursor-pointer active:scale-95'
                }
              `}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {checkedSpots.has(spot.id) && spot.hasToy ? '🧸✨' : spot.emoji}
            </button>
          ))}
          
          {/* Pet watching */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">
            {foundToy ? '😺' : '🐱'}
          </div>
        </div>
      </div>
    )
  }

  // Feed Time game
  if (gameState === 'feed-time') {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center p-4 select-none"
        onMouseMove={dragPosition ? handleDrag : undefined}
        onMouseUp={handleDrop}
        onTouchMove={dragPosition ? handleDrag : undefined}
        onTouchEnd={handleDrop}
      >
        {/* Header */}
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setGameState('menu')}
              className="text-white/70 hover:text-white text-sm"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-white">🍽️ Feed Time!</h2>
            <div className="w-16" />
          </div>
          
          <p className="text-center text-purple-200 mb-6">
            {petFed 
              ? '😻 Yummy! Pet is happy!' 
              : selectedFood 
                ? 'Drag the food to the pet!' 
                : 'Select food and drag it to your pet!'}
          </p>
        </div>
        
        {/* Game area */}
        <div className="relative w-full max-w-lg h-[50vh] bg-gradient-to-b from-[#2a2a4e] to-[#1a1a3e] rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Pet */}
          <div 
            ref={petRef}
            className={`text-8xl transition-transform duration-300 ${
              petMood === 'eating' ? 'animate-pulse' : 
              petMood === 'happy' ? 'animate-bounce' : ''
            }`}
          >
            {petMood === 'hungry' && '🐱'}
            {petMood === 'eating' && '😺'}
            {petMood === 'happy' && '😻'}
          </div>
          
          {/* Food bowl hint */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-4xl">
            🍽️
          </div>
        </div>
        
        {/* Food selection */}
        <div className="w-full max-w-lg mt-6">
          <p className="text-center text-white/60 mb-3 text-sm">Tap to select, then drag to pet</p>
          <div className="flex justify-center gap-4">
            {FOOD_ITEMS.map((food) => (
              <button
                key={food.id}
                onMouseDown={() => selectFood(food)}
                onTouchStart={(e) => {
                  selectFood(food)
                  handleDrag(e)
                }}
                disabled={petFed}
                className={`text-4xl p-3 rounded-2xl transition-all duration-200 ${
                  selectedFood?.id === food.id 
                    ? 'bg-yellow-500/30 scale-110' 
                    : 'bg-white/10 hover:bg-white/20'
                } ${petFed ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {food.emoji}
              </button>
            ))}
          </div>
        </div>
        
        {/* Dragging food indicator */}
        {dragPosition && selectedFood && (
          <div 
            className="fixed text-4xl pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: dragPosition.x, top: dragPosition.y }}
          >
            {selectedFood.emoji}
          </div>
        )}
      </div>
    )
  }

  // Reward screen
  if (gameState === 'reward') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center p-4">
        {/* Celebration effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            >
              {['⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
        
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-2">Great Job!</h2>
          <p className="text-purple-200 mb-8">You earned a reward!</p>
          
          {/* Updated rewards */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center gap-3">
              <span className="text-4xl">🧸</span>
              <span className="text-white font-bold text-2xl">{rewards.toys}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center gap-3">
              <span className="text-4xl">🍬</span>
              <span className="text-white font-bold text-2xl">{rewards.treats}</span>
            </div>
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Play Again! 🎮
          </button>
        </div>
      </div>
    )
  }

  return null
}
