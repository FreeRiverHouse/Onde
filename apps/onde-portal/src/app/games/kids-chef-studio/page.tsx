'use client'

import { useState } from 'react'
import Link from 'next/link'

// Recipe data
const recipes = [
  { id: 'pizza', name: 'Pizza Margherita', emoji: '🍕', difficulty: 1, time: '5 min', locked: false, color: 'from-red-400 to-orange-400' },
  { id: 'biscotti', name: 'Biscotti', emoji: '🍪', difficulty: 1, time: '4 min', locked: false, color: 'from-amber-400 to-yellow-400' },
  { id: 'frullato', name: 'Frullato di Frutta', emoji: '🥤', difficulty: 1, time: '3 min', locked: false, color: 'from-pink-400 to-purple-400' },
  { id: 'insalata', name: 'Insalata Colorata', emoji: '🥗', difficulty: 2, time: '4 min', locked: false, color: 'from-green-400 to-emerald-400' },
  { id: 'panino', name: 'Panino', emoji: '🥪', difficulty: 1, time: '3 min', locked: false, color: 'from-orange-400 to-amber-400' },
  { id: 'gelato', name: 'Gelato', emoji: '🍦', difficulty: 2, time: '6 min', locked: true, color: 'from-cyan-400 to-blue-400' },
  { id: 'torta', name: 'Torta di Compleanno', emoji: '🎂', difficulty: 3, time: '8 min', locked: true, color: 'from-pink-400 to-rose-400' },
  { id: 'pasta', name: 'Pasta al Pomodoro', emoji: '🍝', difficulty: 2, time: '5 min', locked: true, color: 'from-red-400 to-yellow-400' },
]

function RecipeCard({ recipe, onSelect }: { recipe: typeof recipes[0], onSelect: () => void }) {
  const stars = Array(3).fill(0).map((_, i) => (
    <span key={i} className={i < recipe.difficulty ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
  ))

  return (
    <button
      onClick={onSelect}
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

function PlayScreen({ recipe, onBack }: { recipe: typeof recipes[0], onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const steps = [
    { text: 'Raccogli gli ingredienti! 🛒', action: 'Tap sugli ingredienti' },
    { text: 'Mescola tutto insieme! 🥄', action: 'Gira in cerchio!' },
    { text: 'Metti in forno! 🔥', action: 'Aspetta...' },
    { text: 'Decora il piatto! ✨', action: 'Aggiungi decorazioni' },
  ]

  const handleStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      setScore(score + 25)
    } else {
      setCompleted(true)
      setScore(100)
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
            onClick={onBack}
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
        <button onClick={onBack} className="bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg">
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
  const [unlockedRecipes, setUnlockedRecipes] = useState(3) // Track unlocked

  if (selectedRecipe) {
    return <PlayScreen recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-yellow-300 to-amber-400">
      {/* Header */}
      <div className="text-center pt-8 pb-4 relative">
        <Link href="/games" className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all">
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
