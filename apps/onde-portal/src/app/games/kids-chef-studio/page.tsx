'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'

// CSS keyframes for ingredient animations
const ingredientAnimationStyles = `
@keyframes flyIn {
  0% {
    transform: translateY(-100vh) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  60% {
    transform: translateY(20px) rotate(360deg) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translateY(-10px) rotate(380deg) scale(0.95);
  }
  100% {
    transform: translateY(0) rotate(360deg) scale(1);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0) translateX(-100px);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) translateX(10px);
  }
  70% {
    transform: scale(0.9) translateX(-5px);
  }
  100% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
}

@keyframes wobble {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes poof {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) scale(0.5);
    opacity: 0;
  }
}

@keyframes combineSpin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.8);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.fly-in {
  animation: flyIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.wobble {
  animation: wobble 0.5s ease-in-out infinite;
}

.poof {
  animation: poof 0.5s ease-out forwards;
}

.sparkle {
  animation: sparkle 0.6s ease-out forwards;
}

.float-up {
  animation: floatUp 0.8s ease-out forwards;
}

.combine-spin {
  animation: combineSpin 0.6s ease-in-out;
}
`

// Recipe book data type
interface RecipeBookEntry {
  recipeId: string
  timesCooked: number
  lastCooked: string
}

const RECIPE_BOOK_KEY = 'kids-chef-recipe-book'

function useRecipeBook() {
  const [recipeBook, setRecipeBook] = useState<RecipeBookEntry[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(RECIPE_BOOK_KEY)
    if (saved) {
      try {
        setRecipeBook(JSON.parse(saved))
      } catch {
        setRecipeBook([])
      }
    }
  }, [])

  const saveRecipe = useCallback((recipeId: string) => {
    setRecipeBook(prev => {
      const existing = prev.find(e => e.recipeId === recipeId)
      const updated = existing
        ? prev.map(e => e.recipeId === recipeId 
            ? { ...e, timesCooked: e.timesCooked + 1, lastCooked: new Date().toISOString() }
            : e)
        : [...prev, { recipeId, timesCooked: 1, lastCooked: new Date().toISOString() }]
      localStorage.setItem(RECIPE_BOOK_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const getTimesCooked = useCallback((recipeId: string) => {
    return recipeBook.find(e => e.recipeId === recipeId)?.timesCooked || 0
  }, [recipeBook])

  return { recipeBook, saveRecipe, getTimesCooked }
}

// Sound effects hook using Web Audio API
function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) { /* Audio not available */ }
  }, [getAudioContext])

  const playSizzle = useCallback(() => {
    try {
      const ctx = getAudioContext()
      // White noise for sizzle effect
      const bufferSize = ctx.sampleRate * 0.5
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 3000
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()
    } catch (e) { /* Audio not available */ }
  }, [getAudioContext])

  const playStir = useCallback(() => {
    try {
      const ctx = getAudioContext()
      // Swooshing stir sound
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        const startTime = ctx.currentTime + i * 0.15
        osc.frequency.setValueAtTime(200, startTime)
        osc.frequency.exponentialRampToValueAtTime(400, startTime + 0.1)
        osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.15)
        gain.gain.setValueAtTime(0.1, startTime)
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
        osc.start(startTime)
        osc.stop(startTime + 0.15)
      }
    } catch (e) { /* Audio not available */ }
  }, [getAudioContext])

  const playDing = useCallback(() => {
    try {
      const ctx = getAudioContext()
      // Oven ding!
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) { /* Audio not available */ }
  }, [getAudioContext])

  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext()
      // Happy success jingle
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        const startTime = ctx.currentTime + i * 0.15
        gain.gain.setValueAtTime(0.2, startTime)
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
        osc.start(startTime)
        osc.stop(startTime + 0.3)
      })
    } catch (e) { /* Audio not available */ }
  }, [getAudioContext])

  const playPop = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } catch (e) { /* Audio not available */ }
  }, [getAudioContext])

  return { playClick, playSizzle, playStir, playDing, playSuccess, playPop }
}

// Ingredient data for each recipe
const recipeIngredients: Record<string, string[]> = {
  pizza: ['🧀', '🍅', '🫓', '🌿'],
  biscotti: ['🥚', '🧈', '🍫', '🌾'],
  frullato: ['🍓', '🍌', '🥛', '🍯'],
  insalata: ['🥬', '🍅', '🥕', '🧀'],
  panino: ['🍞', '🥬', '🍖', '🧀'],
  gelato: ['🥛', '🍓', '🍫', '🍦'],
  torta: ['🥚', '🧈', '🍫', '🍓'],
  pasta: ['🍝', '🍅', '🧄', '🌿'],
  hamburger: ['🍞', '🥩', '🧀', '🥬'],
  pancakes: ['🥚', '🥛', '🧈', '🍯'],
  cheesecake: ['🧀', '🍓', '🍪', '🍯'],
  tacos: ['🌽', '🥩', '🧀', '🥬'],
  sushi: ['🍚', '🐟', '🥒', '🥑'],
}

// Animated Ingredient Component
function AnimatedIngredient({ 
  emoji, 
  index, 
  isCollected, 
  onClick,
  isCombining 
}: { 
  emoji: string
  index: number
  isCollected: boolean
  onClick: (e: React.MouseEvent) => void
  isCombining: boolean
}) {
  const [hasEntered, setHasEntered] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), index * 150)
    return () => clearTimeout(timer)
  }, [index])

  if (!hasEntered) return null

  return (
    <button
      onClick={onClick}
      disabled={isCollected}
      className={`
        text-5xl p-4 rounded-2xl transition-all duration-300
        ${isCollected 
          ? 'opacity-50 scale-75' 
          : 'hover:scale-125 cursor-pointer bg-white/20 hover:bg-white/40'
        }
        ${isCombining ? 'combine-spin' : ''}
      `}
      style={{
        animation: hasEntered && !isCollected 
          ? `${index % 2 === 0 ? 'flyIn' : 'bounceIn'} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
          : undefined,
        animationDelay: `${index * 0.15}s`,
      }}
    >
      <span className={isCollected ? '' : 'wobble inline-block'}>{emoji}</span>
    </button>
  )
}

// Poof Effect Component
function PoofEffect({ isActive, position }: { isActive: boolean, position: { x: number, y: number } }) {
  const [particles, setParticles] = useState<{ id: number, emoji: string, angle: number }[]>([])

  useEffect(() => {
    if (isActive) {
      const sparkleEmojis = ['✨', '💫', '⭐', '🌟', '💥', '✨', '💫', '⭐']
      const newParticles = sparkleEmojis.map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        angle: (360 / sparkleEmojis.length) * i
      }))
      setParticles(newParticles)
      
      const timer = setTimeout(() => setParticles([]), 800)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  if (!isActive && particles.length === 0) return null

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
    >
      {/* Central poof cloud */}
      <div className="poof text-6xl">💨</div>
      
      {/* Sparkle particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute sparkle text-2xl"
          style={{
            transform: `rotate(${particle.angle}deg) translateY(-40px)`,
            animationDelay: `${Math.random() * 0.2}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  )
}

// Collected Ingredient Bowl
function IngredientBowl({ 
  ingredients, 
  isMixing 
}: { 
  ingredients: string[]
  isMixing: boolean 
}) {
  return (
    <div className={`
      relative bg-white/30 rounded-full p-6 w-40 h-40 flex items-center justify-center flex-wrap gap-1
      ${isMixing ? 'combine-spin' : ''}
      transition-all duration-300
    `}>
      <div className="text-4xl absolute -top-2 left-1/2 -translate-x-1/2">🥣</div>
      {ingredients.map((ing, i) => (
        <span 
          key={i} 
          className="text-2xl float-up"
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animation: isMixing ? `floatUp 0.8s ease-out ${i * 0.1}s forwards` : 'none'
          }}
        >
          {ing}
        </span>
      ))}
    </div>
  )
}

// Recipe data
const recipes = [
  { id: 'pizza', name: 'Pizza Margherita', emoji: '🍕', difficulty: 1, time: '5 min', locked: false, color: 'from-red-400 to-orange-400' },
  { id: 'biscotti', name: 'Biscotti', emoji: '🍪', difficulty: 1, time: '4 min', locked: false, color: 'from-amber-400 to-yellow-400' },
  { id: 'frullato', name: 'Frullato di Frutta', emoji: '🥤', difficulty: 1, time: '3 min', locked: false, color: 'from-pink-400 to-purple-400' },
  { id: 'insalata', name: 'Insalata Colorata', emoji: '🥗', difficulty: 2, time: '4 min', locked: false, color: 'from-green-400 to-emerald-400' },
  { id: 'panino', name: 'Panino', emoji: '🥪', difficulty: 1, time: '3 min', locked: false, color: 'from-orange-400 to-amber-400' },
  { id: 'gelato', name: 'Gelato', emoji: '🍦', difficulty: 2, time: '6 min', locked: false, color: 'from-cyan-400 to-blue-400' },
  { id: 'torta', name: 'Torta di Compleanno', emoji: '🎂', difficulty: 3, time: '8 min', locked: false, color: 'from-pink-400 to-rose-400' },
  { id: 'pasta', name: 'Pasta al Pomodoro', emoji: '🍝', difficulty: 2, time: '5 min', locked: false, color: 'from-red-400 to-yellow-400' },
  { id: 'hamburger', name: 'Hamburger', emoji: '🍔', difficulty: 2, time: '4 min', locked: false, color: 'from-amber-500 to-red-500' },
  { id: 'pancakes', name: 'Pancakes', emoji: '🥞', difficulty: 1, time: '3 min', locked: false, color: 'from-yellow-400 to-amber-500' },
  { id: 'cheesecake', name: 'Cheesecake', emoji: '🍰', difficulty: 3, time: '7 min', locked: false, color: 'from-rose-300 to-pink-400' },
  { id: 'tacos', name: 'Tacos', emoji: '🌮', difficulty: 2, time: '5 min', locked: false, color: 'from-yellow-500 to-orange-500' },
  { id: 'sushi', name: 'Sushi Roll', emoji: '🍣', difficulty: 3, time: '6 min', locked: false, color: 'from-slate-400 to-cyan-500' },
]

function RecipeBookModal({ 
  isOpen, 
  onClose, 
  recipeBook, 
  playClick 
}: { 
  isOpen: boolean
  onClose: () => void
  recipeBook: RecipeBookEntry[]
  playClick: () => void
}) {
  if (!isOpen) return null

  const completedRecipes = recipeBook
    .map(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId)
      return recipe ? { ...recipe, timesCooked: entry.timesCooked } : null
    })
    .filter(Boolean) as (typeof recipes[0] & { timesCooked: number })[]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4 text-center">
          <h2 className="text-2xl font-black text-white drop-shadow-lg">📖 My Recipe Book</h2>
          <p className="text-white/90 text-sm">{completedRecipes.length} recipes mastered!</p>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {completedRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <p>No recipes yet!</p>
              <p className="text-sm">Start cooking to fill your book!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedRecipes.map(recipe => (
                <div 
                  key={recipe.id}
                  className={`bg-gradient-to-br ${recipe.color} p-3 rounded-2xl flex items-center gap-3 shadow-lg`}
                >
                  <div className="text-4xl">{recipe.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white drop-shadow">{recipe.name}</h3>
                    <div className="flex gap-1">
                      {Array(recipe.difficulty).fill(0).map((_, i) => (
                        <span key={i} className="text-yellow-300 text-sm">⭐</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/90 px-3 py-1 rounded-full">
                    <span className="font-bold text-orange-600">×{recipe.timesCooked}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={() => { playClick(); onClose() }}
            className="w-full py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-full hover:scale-105 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function RecipeCard({ recipe, onSelect, playPop }: { recipe: typeof recipes[0], onSelect: () => void, playPop: () => void }) {
  const stars = Array(3).fill(0).map((_, i) => (
    <span key={i} className={i < recipe.difficulty ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
  ))

  const handleClick = () => {
    if (!recipe.locked) {
      playPop()
      onSelect()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={recipe.locked}
      className={`
        relative w-full p-4 rounded-3xl shadow-xl transition-all duration-300
        ${recipe.locked 
          ? 'bg-gray-200 opacity-60 cursor-not-allowed' 
          : `bg-gradient-to-br ${recipe.color} hover:scale-105 hover:shadow-2xl cursor-pointer`
        }
      `}
    >
      <div className="text-6xl mb-2">{recipe.emoji}</div>
      <h3 className="text-lg font-bold text-white drop-shadow-md">{recipe.name}</h3>
      <div className="flex justify-center gap-1 mt-1">{stars}</div>
      <p className="text-white/80 text-sm mt-1">⏱️ {recipe.time}</p>
      {recipe.locked && (
        <div className="absolute inset-0 bg-black/30 rounded-3xl flex items-center justify-center">
          <span className="text-4xl">🔒</span>
        </div>
      )}
    </button>
  )
}

function PlayScreen({ recipe, onBack, sounds, onComplete }: { 
  recipe: typeof recipes[0], 
  onBack: () => void,
  sounds: ReturnType<typeof useSoundEffects>,
  onComplete: () => void
}) {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Ingredient collection state
  const ingredients = recipeIngredients[recipe.id] || ['🥕', '🍅', '🧅', '🌿']
  const [collectedIngredients, setCollectedIngredients] = useState<string[]>([])
  const [showPoof, setShowPoof] = useState(false)
  const [poofPosition, setPoofPosition] = useState({ x: 0, y: 0 })
  const [isMixing, setIsMixing] = useState(false)

  // Inject animation styles
  useEffect(() => {
    const styleId = 'kids-chef-animations'
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.textContent = ingredientAnimationStyles
      document.head.appendChild(styleEl)
    }
    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  const steps = [
    { text: 'Raccogli gli ingredienti! 🛒', action: 'Tap sugli ingredienti per raccoglierli!', sound: 'click', isInteractive: true },
    { text: 'Mescola tutto insieme! 🥄', action: 'Premi per mescolare!', sound: 'stir', isInteractive: true },
    { text: 'Metti in forno! 🔥', action: 'Aspetta...', sound: 'sizzle', isInteractive: false },
    { text: 'Decora il piatto! ✨', action: 'Aggiungi decorazioni', sound: 'ding', isInteractive: false },
  ]

  const handleCollectIngredient = (ingredient: string, event: React.MouseEvent) => {
    if (step !== 0 || collectedIngredients.includes(ingredient)) return
    
    sounds.playPop()
    setCollectedIngredients(prev => [...prev, ingredient])
    
    // Show mini poof at ingredient location
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setPoofPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setShowPoof(true)
    setTimeout(() => setShowPoof(false), 500)
  }

  const handleMix = () => {
    if (step !== 1) return
    
    sounds.playStir()
    setIsMixing(true)
    
    // Big poof effect when combining
    setPoofPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    setTimeout(() => {
      setShowPoof(true)
      sounds.playPop()
    }, 400)
    
    setTimeout(() => {
      setShowPoof(false)
      setIsMixing(false)
      setStep(2)
      setScore(prev => prev + 25)
    }, 800)
  }

  const handleStep = () => {
    // Play sound based on current step
    const currentSound = steps[step].sound
    if (currentSound === 'click') sounds.playClick()
    else if (currentSound === 'stir') sounds.playStir()
    else if (currentSound === 'sizzle') sounds.playSizzle()
    else if (currentSound === 'ding') sounds.playDing()

    if (step < steps.length - 1) {
      setStep(step + 1)
      setScore(score + 25)
    } else {
      setCompleted(true)
      setScore(100)
      // Play success jingle after a short delay
      setTimeout(() => sounds.playSuccess(), 300)
      // Save to recipe book
      if (!saved) {
        onComplete()
        setSaved(true)
      }
    }
  }

  // Auto-advance when all ingredients collected
  useEffect(() => {
    if (step === 0 && collectedIngredients.length === ingredients.length) {
      setTimeout(() => {
        setStep(1)
        setScore(25)
      }, 500)
    }
  }, [collectedIngredients.length, ingredients.length, step])

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-orange-400 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md">
          <div className="text-8xl mb-4 animate-bounce">{recipe.emoji}</div>
          <h2 className="text-3xl font-black text-green-600 mb-2">Complimenti! 🎉</h2>
          <p className="text-xl text-gray-600 mb-4">Hai preparato: {recipe.name}</p>
          <div className="flex justify-center gap-2 text-4xl mb-4">⭐⭐⭐</div>
          <p className="text-2xl font-bold text-orange-500 mb-6">Punteggio: {score}/100</p>
          <button
            onClick={() => { sounds.playClick(); onBack() }}
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🏠 Torna al Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${recipe.color} flex flex-col items-center p-4`}>
      {/* Poof Effect */}
      <PoofEffect isActive={showPoof} position={poofPosition} />
      
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button onClick={() => { sounds.playClick(); onBack() }} className="bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all">
          ← Indietro
        </button>
        <div className="bg-white/80 px-4 py-2 rounded-full font-bold text-orange-600 shadow-lg">
          ⭐ {score}/100
        </div>
      </div>

      {/* Recipe Title */}
      <div className="text-center mb-4">
        <span className="text-6xl">{recipe.emoji}</span>
        <h2 className="text-2xl font-black text-white drop-shadow-lg mt-2">{recipe.name}</h2>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-white/30 rounded-full h-4 mb-4">
        <div 
          className="bg-white h-4 rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full text-center">
        <p className="text-sm text-gray-500 mb-2">Step {step + 1}/{steps.length}</p>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{steps[step].text}</h3>
        <p className="text-gray-500 mb-4">{steps[step].action}</p>
        
        {/* Step 0: Ingredient Collection */}
        {step === 0 && (
          <div className="mb-6">
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {ingredients.map((ing, i) => (
                <AnimatedIngredient
                  key={ing}
                  emoji={ing}
                  index={i}
                  isCollected={collectedIngredients.includes(ing)}
                  onClick={(e) => handleCollectIngredient(ing, e)}
                  isCombining={false}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">
              {collectedIngredients.length}/{ingredients.length} ingredienti raccolti
            </div>
          </div>
        )}

        {/* Step 1: Mixing Bowl */}
        {step === 1 && (
          <div className="mb-6 flex flex-col items-center">
            <IngredientBowl ingredients={collectedIngredients} isMixing={isMixing} />
            <button
              onClick={handleMix}
              disabled={isMixing}
              className="mt-4 px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold text-xl rounded-2xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              🥄 Mescola!
            </button>
          </div>
        )}
        
        {/* Action Button for non-interactive steps */}
        {step >= 2 && (
          <button
            onClick={handleStep}
            className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl rounded-2xl shadow-lg hover:scale-105 transition-all animate-pulse"
          >
            {step < steps.length - 1 ? '✨ Fatto! Avanti!' : '🎉 Finisci!'}
          </button>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 text-5xl animate-bounce">👨‍🍳</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-bounce delay-500">🥄</div>
    </div>
  )
}

export default function KidsChefStudio() {
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null)
  const [unlockedRecipes] = useState(13) // All unlocked!
  const [showRecipeBook, setShowRecipeBook] = useState(false)
  const sounds = useSoundEffects()
  const { recipeBook, saveRecipe } = useRecipeBook()

  if (selectedRecipe) {
    return (
      <PlayScreen 
        recipe={selectedRecipe} 
        onBack={() => setSelectedRecipe(null)} 
        sounds={sounds} 
        onComplete={() => saveRecipe(selectedRecipe.id)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-yellow-300 to-amber-400">
      <RecipeBookModal 
        isOpen={showRecipeBook} 
        onClose={() => setShowRecipeBook(false)} 
        recipeBook={recipeBook}
        playClick={sounds.playClick}
      />
      
      {/* Header */}
      <div className="text-center pt-8 pb-4 relative">
        <Link href="/games" onClick={() => sounds.playClick()} className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all">
          ← Gaming Island
        </Link>
        <button 
          onClick={() => { sounds.playClick(); setShowRecipeBook(true) }}
          className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-full font-bold text-amber-600 shadow-lg hover:scale-105 transition-all"
        >
          📖 My Recipes
        </button>
        <div className="text-6xl mb-2 animate-bounce">👨‍🍳</div>
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
          Kids Chef Studio
        </h1>
        <p className="text-xl text-white/90 mt-2 drop-shadow">
          Cucina piatti deliziosi! 🍳
        </p>
        <div className="mt-2 bg-white/80 inline-block px-4 py-1 rounded-full">
          <span className="font-bold text-orange-600">🏆 {unlockedRecipes}/{recipes.length} Ricette</span>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onSelect={() => !recipe.locked && setSelectedRecipe(recipe)}
              playPop={sounds.playPop}
            />
          ))}
        </div>
      </div>

      {/* Footer Chef Characters */}
      <div className="fixed bottom-0 left-0 right-0 h-20 flex justify-around items-end pointer-events-none">
        <span className="text-5xl animate-bounce">🥕</span>
        <span className="text-5xl animate-bounce delay-200">🍅</span>
        <span className="text-5xl animate-bounce delay-400">🧅</span>
        <span className="text-5xl animate-bounce delay-600">🥬</span>
      </div>
    </div>
  )
}
