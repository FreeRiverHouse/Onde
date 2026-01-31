'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Positive messages for kids (IT + EN)
const fortunes = [
  { text: "Sei speciale così come sei! ✨", lang: 'it' },
  { text: "You are braver than you believe! 🦁", lang: 'en' },
  { text: "Oggi sarà un giorno fantastico! 🌈", lang: 'it' },
  { text: "Your smile lights up the room! 😊", lang: 'en' },
  { text: "Puoi fare tutto ciò che sogni! 🚀", lang: 'it' },
  { text: "Kindness is your superpower! 💪", lang: 'en' },
  { text: "La tua gentilezza cambia il mondo! 🌍", lang: 'it' },
  { text: "Every mistake helps you grow! 🌱", lang: 'en' },
  { text: "Sei amato più di quanto immagini! ❤️", lang: 'it' },
  { text: "Your ideas are amazing! 💡", lang: 'en' },
  { text: "La curiosità è il tuo superpotere! 🔍", lang: 'it' },
  { text: "You make the world more fun! 🎉", lang: 'en' },
  { text: "Ogni giorno è un nuovo inizio! 🌅", lang: 'it' },
  { text: "Be proud of how far you've come! 🏆", lang: 'en' },
  { text: "I tuoi sogni sono importanti! 💫", lang: 'it' },
  { text: "You are enough, just as you are! 🌟", lang: 'en' },
  { text: "La tua creatività non ha limiti! 🎨", lang: 'it' },
  { text: "Today is full of possibilities! 🎁", lang: 'en' },
  { text: "Sei più forte di quanto pensi! 💎", lang: 'it' },
  { text: "Your heart is full of magic! ✨", lang: 'en' },
  { text: "Credi in te stesso, sempre! 🌈", lang: 'it' },
  { text: "Adventure awaits you! 🗺️", lang: 'en' },
  { text: "La felicità è dentro di te! ☀️", lang: 'it' },
  { text: "You are a wonderful friend! 🤗", lang: 'en' },
  { text: "Sbagliare ti aiuta a crescere! 🌱", lang: 'it' },
  { text: "Being scared is okay, being brave is trying anyway! 🦸", lang: 'en' },
  { text: "La tua gentilezza rende gli altri felici! 💕", lang: 'it' },
  { text: "Your imagination has no limits! 🚀", lang: 'en' },
  { text: "Il coraggio è fare un passo anche quando hai paura! 🌟", lang: 'it' },
  { text: "Every problem is a chance to learn something new! 📚", lang: 'en' },
  { text: "Le tue idee creative cambiano il mondo! 🎨", lang: 'it' },
  { text: "It's okay to ask for help - that's how we grow! 🤝", lang: 'en' },
  { text: "Non devi essere perfetto, devi solo essere te stesso! 💫", lang: 'it' },
  { text: "Your kind words can make someone's whole day! 🌻", lang: 'en' },
]

// Helper to get date string in YYYY-MM-DD format
const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0]
}

// Check if two dates are consecutive days
const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

export default function FortuneCookie() {
  const [isOpen, setIsOpen] = useState(false)
  const [fortune, setFortune] = useState<typeof fortunes[0] | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [cookieCount, setCookieCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [selectedLang, setSelectedLang] = useState<'all' | 'it' | 'en'>('all')
  const [streak, setStreak] = useState(0)
  const [streakUpdatedToday, setStreakUpdatedToday] = useState(false)

  // Load cookie count, language preference, and streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fortune-cookie-count')
    if (saved) setCookieCount(parseInt(saved))
    const savedLang = localStorage.getItem('fortune-cookie-lang') as 'all' | 'it' | 'en'
    if (savedLang) setSelectedLang(savedLang)
    
    // Load streak data
    const savedStreak = localStorage.getItem('fortune-cookie-streak')
    const lastVisit = localStorage.getItem('fortune-cookie-last-visit')
    const today = getDateString()
    
    if (savedStreak && lastVisit) {
      const currentStreak = parseInt(savedStreak)
      
      if (lastVisit === today) {
        // Already visited today, keep streak
        setStreak(currentStreak)
        setStreakUpdatedToday(true)
      } else if (areConsecutiveDays(lastVisit, today)) {
        // Consecutive day - streak will be updated when cookie is opened
        setStreak(currentStreak)
        setStreakUpdatedToday(false)
      } else {
        // Missed a day - streak resets when cookie is opened
        setStreak(0)
        setStreakUpdatedToday(false)
      }
    }
  }, [])

  // Get filtered fortunes based on language
  const getFilteredFortunes = () => {
    if (selectedLang === 'all') return fortunes
    return fortunes.filter(f => f.lang === selectedLang)
  }

  const handleLangChange = (lang: 'all' | 'it' | 'en') => {
    setSelectedLang(lang)
    localStorage.setItem('fortune-cookie-lang', lang)
  }

  const openCookie = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    // Play crack sound
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.frequency.value = 200
    gain.gain.value = 0.3
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
    osc.stop(audio.currentTime + 0.1)

    setTimeout(() => {
      setIsOpen(true)
      const filtered = getFilteredFortunes()
      setFortune(filtered[Math.floor(Math.random() * filtered.length)])
      const newCount = cookieCount + 1
      setCookieCount(newCount)
      localStorage.setItem('fortune-cookie-count', newCount.toString())
      
      // Update streak if not already updated today
      if (!streakUpdatedToday) {
        const today = getDateString()
        const lastVisit = localStorage.getItem('fortune-cookie-last-visit')
        let newStreak = 1
        
        if (lastVisit && areConsecutiveDays(lastVisit, today)) {
          // Consecutive day - increment streak
          newStreak = streak + 1
        }
        // If missed a day or first visit, streak starts at 1
        
        setStreak(newStreak)
        setStreakUpdatedToday(true)
        localStorage.setItem('fortune-cookie-streak', newStreak.toString())
        localStorage.setItem('fortune-cookie-last-visit', today)
      }
      
      setIsAnimating(false)
    }, 500)
  }

  const reset = () => {
    setIsOpen(false)
    setFortune(null)
    setCopied(false)
  }

  const shareFortune = async () => {
    if (!fortune) return
    
    const shareText = `🥠 My fortune: ${fortune.text} - onde.la/games/fortune-cookie`
    
    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        })
        return
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name === 'AbortError') return
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-200 via-orange-200 to-red-200 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <Link href="/games" className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-amber-700 shadow-lg hover:scale-105 transition-all">
        ← Games
      </Link>

      <div className="absolute top-4 right-4 flex gap-2">
        {streak > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full font-bold text-white shadow-lg animate-pulse">
            🔥 {streak} day streak!
          </div>
        )}
        <div className="bg-white/80 px-4 py-2 rounded-full font-bold text-amber-700 shadow-lg">
          🥠 {cookieCount} opened
        </div>
      </div>

      {/* Language Selector */}
      <div className="absolute top-16 right-4 flex gap-2">
        <button
          onClick={() => handleLangChange('all')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
            selectedLang === 'all' 
              ? 'bg-amber-500 text-white shadow-lg' 
              : 'bg-white/80 text-amber-700 hover:bg-amber-100'
          }`}
        >
          🌍 All
        </button>
        <button
          onClick={() => handleLangChange('it')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
            selectedLang === 'it' 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-white/80 text-green-700 hover:bg-green-100'
          }`}
        >
          🇮🇹
        </button>
        <button
          onClick={() => handleLangChange('en')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
            selectedLang === 'en' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white/80 text-blue-700 hover:bg-blue-100'
          }`}
        >
          🇬🇧
        </button>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-black text-amber-800 mb-2 text-center drop-shadow-lg">
        Fortune Cookie
      </h1>
      <p className="text-lg text-amber-700 mb-8 text-center">
        {isOpen ? 'Your message!' : 'Tap the cookie to reveal your fortune!'}
      </p>

      {/* Cookie */}
      <div className="relative">
        {!isOpen ? (
          <button
            onClick={openCookie}
            disabled={isAnimating}
            className={`
              text-[150px] md:text-[200px] cursor-pointer
              transition-all duration-300
              ${isAnimating ? 'animate-shake scale-110' : 'hover:scale-110 hover:rotate-6'}
              drop-shadow-2xl
            `}
          >
            🥠
          </button>
        ) : (
          <div className="text-center animate-fadeIn">
            {/* Broken cookie pieces */}
            <div className="flex justify-center gap-4 mb-6">
              <span className="text-[80px] md:text-[100px] -rotate-12 animate-bounce">🥠</span>
              <span className="text-[80px] md:text-[100px] rotate-12 animate-bounce" style={{ animationDelay: '0.1s' }}>🥠</span>
            </div>

            {/* Fortune paper */}
            <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md mx-auto border-2 border-amber-300">
              <div className="text-3xl mb-4">✨</div>
              <p className="text-xl md:text-2xl font-bold text-amber-800 leading-relaxed">
                {fortune?.text}
              </p>
              <p className="text-sm text-amber-500 mt-4">
                {fortune?.lang === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={shareFortune}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
              >
                {copied ? '✅ Copied!' : '📤 Share'}
              </button>
              <button
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🥠 Another Cookie!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-10 left-10 text-5xl animate-bounce opacity-70">🍀</div>
      <div className="fixed bottom-16 right-10 text-4xl animate-bounce opacity-70" style={{ animationDelay: '0.3s' }}>⭐</div>
      <div className="fixed top-20 right-20 text-3xl animate-bounce opacity-50" style={{ animationDelay: '0.6s' }}>🌟</div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
