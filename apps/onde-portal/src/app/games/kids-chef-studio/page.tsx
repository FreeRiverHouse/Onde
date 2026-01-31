'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

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

function PlayScreen({ recipe, onBack, sounds }: { 
  recipe: typeof recipes[0], 
  onBack: () => void,
  sounds: ReturnType<typeof useSoundEffects>
}) {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const steps = [
    { text: 'Raccogli gli ingredienti! 🛒', action: 'Tap sugli ingredienti', sound: 'click' },
    { text: 'Mescola tutto insieme! 🥄', action: 'Gira in cerchio!', sound: 'stir' },
    { text: 'Metti in forno! 🔥', action: 'Aspetta...', sound: 'sizzle' },
    { text: 'Decora il piatto! ✨', action: 'Aggiungi decorazioni', sound: 'ding' },
  ]

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
    }
  }

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
      <div className="text-center mb-6">
        <span className="text-7xl">{recipe.emoji}</span>
        <h2 className="text-2xl font-black text-white drop-shadow-lg mt-2">{recipe.name}</h2>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-white/30 rounded-full h-4 mb-6">
        <div 
          className="bg-white h-4 rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full text-center">
        <p className="text-sm text-gray-500 mb-2">Step {step + 1}/{steps.length}</p>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{steps[step].text}</h3>
        <p className="text-gray-500 mb-6">{steps[step].action}</p>
        
        {/* Action Button */}
        <button
          onClick={handleStep}
          className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl rounded-2xl shadow-lg hover:scale-105 transition-all animate-pulse"
        >
          {step < steps.length - 1 ? '✨ Fatto! Avanti!' : '🎉 Finisci!'}
        </button>
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
  const sounds = useSoundEffects()

  if (selectedRecipe) {
    return <PlayScreen recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} sounds={sounds} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-yellow-300 to-amber-400">
      {/* Header */}
      <div className="text-center pt-8 pb-4 relative">
        <Link href="/games" onClick={() => sounds.playClick()} className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all">
          ← Gaming Island
        </Link>
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
