'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type Language = 'en' | 'it'
type GameMode = 'letterMatch' | 'caseMatch' | 'tracing' | 'quiz'
type GameState = 'menu' | 'playing' | 'results'

interface LetterData {
  letter: string
  uppercase: string
  lowercase: string
  objects: { emoji: string; nameEn: string; nameIt: string }[]
  soundEn: string
  soundIt: string
}

interface GameStats {
  score: number
  streak: number
  maxStreak: number
  correct: number
  total: number
  stars: number
  stickers: string[]
  completedLetters: string[]
}

// Letter data with objects, sounds, and translations
const ALPHABET_DATA: LetterData[] = [
  { letter: 'A', uppercase: 'A', lowercase: 'a', objects: [{ emoji: '🍎', nameEn: 'Apple', nameIt: 'Mela' }, { emoji: '🐜', nameEn: 'Ant', nameIt: 'Formica' }, { emoji: '✈️', nameEn: 'Airplane', nameIt: 'Aereo' }], soundEn: 'ay', soundIt: 'ah' },
  { letter: 'B', uppercase: 'B', lowercase: 'b', objects: [{ emoji: '🍌', nameEn: 'Banana', nameIt: 'Banana' }, { emoji: '🐻', nameEn: 'Bear', nameIt: 'Orso' }, { emoji: '🦋', nameEn: 'Butterfly', nameIt: 'Farfalla' }], soundEn: 'bee', soundIt: 'bee' },
  { letter: 'C', uppercase: 'C', lowercase: 'c', objects: [{ emoji: '🐱', nameEn: 'Cat', nameIt: 'Gatto' }, { emoji: '🥕', nameEn: 'Carrot', nameIt: 'Carota' }, { emoji: '🚗', nameEn: 'Car', nameIt: 'Auto' }], soundEn: 'see', soundIt: 'chee' },
  { letter: 'D', uppercase: 'D', lowercase: 'd', objects: [{ emoji: '🐕', nameEn: 'Dog', nameIt: 'Cane' }, { emoji: '🦆', nameEn: 'Duck', nameIt: 'Anatra' }, { emoji: '🍩', nameEn: 'Donut', nameIt: 'Ciambella' }], soundEn: 'dee', soundIt: 'dee' },
  { letter: 'E', uppercase: 'E', lowercase: 'e', objects: [{ emoji: '🐘', nameEn: 'Elephant', nameIt: 'Elefante' }, { emoji: '🥚', nameEn: 'Egg', nameIt: 'Uovo' }, { emoji: '👁️', nameEn: 'Eye', nameIt: 'Occhio' }], soundEn: 'ee', soundIt: 'eh' },
  { letter: 'F', uppercase: 'F', lowercase: 'f', objects: [{ emoji: '🐟', nameEn: 'Fish', nameIt: 'Pesce' }, { emoji: '🌸', nameEn: 'Flower', nameIt: 'Fiore' }, { emoji: '🦊', nameEn: 'Fox', nameIt: 'Volpe' }], soundEn: 'ef', soundIt: 'effeh' },
  { letter: 'G', uppercase: 'G', lowercase: 'g', objects: [{ emoji: '🍇', nameEn: 'Grapes', nameIt: 'Uva' }, { emoji: '🦒', nameEn: 'Giraffe', nameIt: 'Giraffa' }, { emoji: '🎸', nameEn: 'Guitar', nameIt: 'Chitarra' }], soundEn: 'jee', soundIt: 'jee' },
  { letter: 'H', uppercase: 'H', lowercase: 'h', objects: [{ emoji: '🏠', nameEn: 'House', nameIt: 'Casa' }, { emoji: '❤️', nameEn: 'Heart', nameIt: 'Cuore' }, { emoji: '🐴', nameEn: 'Horse', nameIt: 'Cavallo' }], soundEn: 'aych', soundIt: 'akka' },
  { letter: 'I', uppercase: 'I', lowercase: 'i', objects: [{ emoji: '🍦', nameEn: 'Ice cream', nameIt: 'Gelato' }, { emoji: '🏝️', nameEn: 'Island', nameIt: 'Isola' }, { emoji: '🦎', nameEn: 'Iguana', nameIt: 'Iguana' }], soundEn: 'eye', soundIt: 'ee' },
  { letter: 'J', uppercase: 'J', lowercase: 'j', objects: [{ emoji: '🧃', nameEn: 'Juice', nameIt: 'Succo' }, { emoji: '🤹', nameEn: 'Juggler', nameIt: 'Giocoliere' }, { emoji: '🐙', nameEn: 'Jellyfish', nameIt: 'Medusa' }], soundEn: 'jay', soundIt: 'ee-loonga' },
  { letter: 'K', uppercase: 'K', lowercase: 'k', objects: [{ emoji: '🔑', nameEn: 'Key', nameIt: 'Chiave' }, { emoji: '🪁', nameEn: 'Kite', nameIt: 'Aquilone' }, { emoji: '🦘', nameEn: 'Kangaroo', nameIt: 'Canguro' }], soundEn: 'kay', soundIt: 'kappa' },
  { letter: 'L', uppercase: 'L', lowercase: 'l', objects: [{ emoji: '🦁', nameEn: 'Lion', nameIt: 'Leone' }, { emoji: '🍋', nameEn: 'Lemon', nameIt: 'Limone' }, { emoji: '🍃', nameEn: 'Leaf', nameIt: 'Foglia' }], soundEn: 'el', soundIt: 'elleh' },
  { letter: 'M', uppercase: 'M', lowercase: 'm', objects: [{ emoji: '🐵', nameEn: 'Monkey', nameIt: 'Scimmia' }, { emoji: '🌙', nameEn: 'Moon', nameIt: 'Luna' }, { emoji: '🍄', nameEn: 'Mushroom', nameIt: 'Fungo' }], soundEn: 'em', soundIt: 'emmeh' },
  { letter: 'N', uppercase: 'N', lowercase: 'n', objects: [{ emoji: '👃', nameEn: 'Nose', nameIt: 'Naso' }, { emoji: '🌰', nameEn: 'Nut', nameIt: 'Noce' }, { emoji: '📰', nameEn: 'Newspaper', nameIt: 'Giornale' }], soundEn: 'en', soundIt: 'enneh' },
  { letter: 'O', uppercase: 'O', lowercase: 'o', objects: [{ emoji: '🍊', nameEn: 'Orange', nameIt: 'Arancia' }, { emoji: '🦉', nameEn: 'Owl', nameIt: 'Gufo' }, { emoji: '🐙', nameEn: 'Octopus', nameIt: 'Polpo' }], soundEn: 'oh', soundIt: 'oh' },
  { letter: 'P', uppercase: 'P', lowercase: 'p', objects: [{ emoji: '🐷', nameEn: 'Pig', nameIt: 'Maiale' }, { emoji: '🍕', nameEn: 'Pizza', nameIt: 'Pizza' }, { emoji: '🐧', nameEn: 'Penguin', nameIt: 'Pinguino' }], soundEn: 'pee', soundIt: 'pee' },
  { letter: 'Q', uppercase: 'Q', lowercase: 'q', objects: [{ emoji: '👸', nameEn: 'Queen', nameIt: 'Regina' }, { emoji: '❓', nameEn: 'Question', nameIt: 'Domanda' }, { emoji: '🦆', nameEn: 'Quack', nameIt: 'Qua' }], soundEn: 'kyoo', soundIt: 'koo' },
  { letter: 'R', uppercase: 'R', lowercase: 'r', objects: [{ emoji: '🐰', nameEn: 'Rabbit', nameIt: 'Coniglio' }, { emoji: '🌈', nameEn: 'Rainbow', nameIt: 'Arcobaleno' }, { emoji: '🤖', nameEn: 'Robot', nameIt: 'Robot' }], soundEn: 'ar', soundIt: 'erreh' },
  { letter: 'S', uppercase: 'S', lowercase: 's', objects: [{ emoji: '☀️', nameEn: 'Sun', nameIt: 'Sole' }, { emoji: '🐍', nameEn: 'Snake', nameIt: 'Serpente' }, { emoji: '⭐', nameEn: 'Star', nameIt: 'Stella' }], soundEn: 'es', soundIt: 'esseh' },
  { letter: 'T', uppercase: 'T', lowercase: 't', objects: [{ emoji: '🐢', nameEn: 'Turtle', nameIt: 'Tartaruga' }, { emoji: '🌳', nameEn: 'Tree', nameIt: 'Albero' }, { emoji: '🚂', nameEn: 'Train', nameIt: 'Treno' }], soundEn: 'tee', soundIt: 'tee' },
  { letter: 'U', uppercase: 'U', lowercase: 'u', objects: [{ emoji: '☂️', nameEn: 'Umbrella', nameIt: 'Ombrello' }, { emoji: '🦄', nameEn: 'Unicorn', nameIt: 'Unicorno' }, { emoji: '👆', nameEn: 'Up', nameIt: 'Su' }], soundEn: 'yoo', soundIt: 'oo' },
  { letter: 'V', uppercase: 'V', lowercase: 'v', objects: [{ emoji: '🌋', nameEn: 'Volcano', nameIt: 'Vulcano' }, { emoji: '🎻', nameEn: 'Violin', nameIt: 'Violino' }, { emoji: '🥕', nameEn: 'Veggie', nameIt: 'Verdura' }], soundEn: 'vee', soundIt: 'voo' },
  { letter: 'W', uppercase: 'W', lowercase: 'w', objects: [{ emoji: '🌊', nameEn: 'Wave', nameIt: 'Onda' }, { emoji: '🐋', nameEn: 'Whale', nameIt: 'Balena' }, { emoji: '⌚', nameEn: 'Watch', nameIt: 'Orologio' }], soundEn: 'double-yoo', soundIt: 'doppia-voo' },
  { letter: 'X', uppercase: 'X', lowercase: 'x', objects: [{ emoji: '🎸', nameEn: 'Xylophone', nameIt: 'Xilofono' }, { emoji: '❌', nameEn: 'X-mark', nameIt: 'Croce' }, { emoji: '🩻', nameEn: 'X-ray', nameIt: 'Raggi-X' }], soundEn: 'ex', soundIt: 'eeks' },
  { letter: 'Y', uppercase: 'Y', lowercase: 'y', objects: [{ emoji: '💛', nameEn: 'Yellow', nameIt: 'Giallo' }, { emoji: '🪀', nameEn: 'Yo-yo', nameIt: 'Yo-yo' }, { emoji: '🧘', nameEn: 'Yoga', nameIt: 'Yoga' }], soundEn: 'why', soundIt: 'ee-greka' },
  { letter: 'Z', uppercase: 'Z', lowercase: 'z', objects: [{ emoji: '🦓', nameEn: 'Zebra', nameIt: 'Zebra' }, { emoji: '⚡', nameEn: 'Zap', nameIt: 'Lampo' }, { emoji: '🧟', nameEn: 'Zombie', nameIt: 'Zombie' }], soundEn: 'zee', soundIt: 'dzeta' },
]

// Sticker rewards
const STICKER_REWARDS = ['🏆', '🎖️', '🥇', '🌈', '🦄', '🎪', '🎠', '🎡', '🎢', '🎯', '🎨', '🎭', '🏅', '👑', '💎', '🔮', '🎀', '🧸', '🎈', '🌟', '✨', '💫', '🎁', '🎊']

// Tracing path data for each letter (simplified SVG-like paths)
const LETTER_PATHS: { [key: string]: { points: { x: number; y: number }[]; strokes: number[][] }[] } = {
  A: [{ points: [{ x: 50, y: 180 }, { x: 100, y: 20 }, { x: 150, y: 180 }], strokes: [[0, 1], [1, 2]] }, { points: [{ x: 70, y: 110 }, { x: 130, y: 110 }], strokes: [[0, 1]] }],
  B: [{ points: [{ x: 50, y: 20 }, { x: 50, y: 180 }], strokes: [[0, 1]] }, { points: [{ x: 50, y: 20 }, { x: 120, y: 20 }, { x: 140, y: 50 }, { x: 120, y: 90 }, { x: 50, y: 90 }], strokes: [[0, 1], [1, 2], [2, 3], [3, 4]] }, { points: [{ x: 50, y: 90 }, { x: 130, y: 90 }, { x: 150, y: 130 }, { x: 130, y: 170 }, { x: 50, y: 180 }], strokes: [[0, 1], [1, 2], [2, 3], [3, 4]] }],
  C: [{ points: [{ x: 150, y: 40 }, { x: 100, y: 20 }, { x: 50, y: 60 }, { x: 50, y: 140 }, { x: 100, y: 180 }, { x: 150, y: 160 }], strokes: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] }],
  // Simplified - just key letters for demo
}

// Sound effects using Web Audio API
function useAlphabetSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Play letter sound (phonetic)
  const playLetterSound = useCallback((letter: string, language: Language) => {
    try {
      const ctx = getAudioContext()
      const letterData = ALPHABET_DATA.find(l => l.letter === letter.toUpperCase())
      if (!letterData) return

      // Generate a unique frequency pattern for each letter
      const letterIndex = letter.toUpperCase().charCodeAt(0) - 65
      const baseFreq = 300 + letterIndex * 15

      // Play a short melodic sound representing the letter
      const notes = language === 'en' 
        ? [baseFreq, baseFreq * 1.25, baseFreq * 1.5]
        : [baseFreq * 1.1, baseFreq * 1.3, baseFreq * 1.1]

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.2)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.2)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Correct answer sound
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

  // Wrong answer sound
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

  // Pop sound
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
      const notes = [659.25, 783.99, 987.77, 1174.66]
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

  // Victory fanfare
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

  // Tracing sound
  const playTrace = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 600
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  return { playLetterSound, playCorrect, playWrong, playPop, playStar, playVictory, playTrace }
}

// Confetti explosion component
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

// Progress stars display
function ProgressStars({ count, max }: { count: number; max: number }) {
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
      <span className="font-black text-orange-500 text-xl" style={{ textShadow: `0 0 ${intensity * 2}px #ff6b35` }}>
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
        <span key={i} className="text-xl animate-sticker-pop" style={{ animationDelay: `${i * 0.1}s` }}>
          {sticker}
        </span>
      ))}
    </div>
  )
}

// Letter tracing canvas component
function LetterTracingCanvas({
  letter,
  onComplete,
  soundEnabled,
  playTrace,
}: {
  letter: string
  onComplete: () => void
  soundEnabled: boolean
  playTrace: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [tracedPoints, setTracedPoints] = useState<{ x: number; y: number }[]>([])
  const lastSoundTimeRef = useRef(0)

  // Draw the letter guide
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw letter guide (dotted outline)
    ctx.font = 'bold 180px Comic Sans MS, cursive'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 3
    ctx.strokeText(letter.toUpperCase(), canvas.width / 2, canvas.height / 2)

    // Draw filled letter with low opacity
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(200, 200, 255, 0.3)'
    ctx.fillText(letter.toUpperCase(), canvas.width / 2, canvas.height / 2)

    // Draw traced path
    if (tracedPoints.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 12
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(tracedPoints[0].x, tracedPoints[0].y)
      for (let i = 1; i < tracedPoints.length; i++) {
        ctx.lineTo(tracedPoints[i].x, tracedPoints[i].y)
      }
      ctx.stroke()
    }
  }, [letter, tracedPoints])

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const point = getCanvasPoint(e)
    if (point) {
      setTracedPoints([point])
    }
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const point = getCanvasPoint(e)
    if (point) {
      setTracedPoints((prev) => [...prev, point])

      // Play trace sound occasionally
      const now = Date.now()
      if (soundEnabled && now - lastSoundTimeRef.current > 50) {
        playTrace()
        lastSoundTimeRef.current = now
      }

      // Update progress
      setProgress((prev) => Math.min(prev + 0.5, 100))
    }
  }

  const handleEnd = () => {
    setIsDrawing(false)
    if (progress > 60) {
      onComplete()
      rewards.trackWin()
    }
  }

  const clearCanvas = () => {
    setTracedPoints([])
    setProgress(0)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="bg-white rounded-2xl shadow-lg border-4 border-purple-200 touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={clearCanvas}
        className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition-all"
      >
        🔄 Clear
      </button>
      <p className="text-white/80 text-sm">Trace the letter with your finger!</p>
    </div>
  )
}

// Animated letter display
function AnimatedLetter({ letter, size = 'lg', animate = true }: { letter: string; size?: 'sm' | 'md' | 'lg' | 'xl'; animate?: boolean }) {
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
    xl: 'text-9xl',
  }

  return (
    <div
      className={`font-black ${sizeClasses[size]} text-white drop-shadow-lg ${animate ? 'animate-bounce-gentle' : ''}`}
      style={{
        textShadow: '4px 4px 0 #8b5cf6, 8px 8px 0 #6d28d9',
        WebkitTextStroke: '2px #6d28d9',
      }}
    >
      {letter}
    </div>
  )
}

// Main game component
function AlphabetGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [gameMode, setGameMode] = useState<GameMode>('letterMatch')
  const [language, setLanguage] = useState<Language>('en')
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [options, setOptions] = useState<{ emoji: string; name: string; isCorrect: boolean }[]>([])
  const [caseOptions, setCaseOptions] = useState<{ letter: string; isCorrect: boolean }[]>([])
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
    completedLetters: [],
  })

  const [showConfetti, setShowConfetti] = useState(false)
  const [newSticker, setNewSticker] = useState<string | null>(null)

  const { playLetterSound, playCorrect, playWrong, playPop, playStar, playVictory, playTrace } = useAlphabetSounds()

  // Get current letter data
  const currentLetter = ALPHABET_DATA[currentLetterIndex]

  // Generate letter match round
  const generateLetterMatchRound = useCallback(() => {
    const letterIndex = Math.floor(Math.random() * 26)
    setCurrentLetterIndex(letterIndex)
    const letter = ALPHABET_DATA[letterIndex]

    // Get correct object
    const correctObject = letter.objects[Math.floor(Math.random() * letter.objects.length)]

    // Get wrong objects from other letters
    const wrongObjects: { emoji: string; name: string; isCorrect: boolean }[] = []
    while (wrongObjects.length < 3) {
      const wrongIndex = Math.floor(Math.random() * 26)
      if (wrongIndex !== letterIndex) {
        const wrongLetter = ALPHABET_DATA[wrongIndex]
        const wrongObj = wrongLetter.objects[Math.floor(Math.random() * wrongLetter.objects.length)]
        if (!wrongObjects.some((o) => o.emoji === wrongObj.emoji)) {
          wrongObjects.push({
            emoji: wrongObj.emoji,
            name: language === 'en' ? wrongObj.nameEn : wrongObj.nameIt,
            isCorrect: false,
          })
        }
      }
    }

    // Create options array
    const allOptions = [
      ...wrongObjects,
      {
        emoji: correctObject.emoji,
        name: language === 'en' ? correctObject.nameEn : correctObject.nameIt,
        isCorrect: true,
      },
    ].sort(() => Math.random() - 0.5)

    setOptions(allOptions)
    setSelectedAnswer(null)
    setShowResult(false)

    if (soundEnabled) {
      setTimeout(() => playPop(), 100)
      setTimeout(() => playLetterSound(letter.letter, language), 300)
    }
  }, [language, soundEnabled, playPop, playLetterSound])

  // Generate case match round
  const generateCaseMatchRound = useCallback(() => {
    const letterIndex = Math.floor(Math.random() * 26)
    setCurrentLetterIndex(letterIndex)
    const letter = ALPHABET_DATA[letterIndex]

    // Randomly choose uppercase or lowercase as the question
    const isUppercase = Math.random() > 0.5
    const questionLetter = isUppercase ? letter.uppercase : letter.lowercase

    // Get wrong options
    const wrongOptions: { letter: string; isCorrect: boolean }[] = []
    while (wrongOptions.length < 3) {
      const wrongIndex = Math.floor(Math.random() * 26)
      if (wrongIndex !== letterIndex) {
        const wrongLetter = ALPHABET_DATA[wrongIndex]
        const wrongChar = isUppercase ? wrongLetter.lowercase : wrongLetter.uppercase
        if (!wrongOptions.some((o) => o.letter === wrongChar)) {
          wrongOptions.push({ letter: wrongChar, isCorrect: false })
        }
      }
    }

    // Correct answer is the matching case
    const correctChar = isUppercase ? letter.lowercase : letter.uppercase

    const allOptions = [...wrongOptions, { letter: correctChar, isCorrect: true }].sort(() => Math.random() - 0.5)

    setCaseOptions(allOptions)
    setOptions([{ emoji: questionLetter, name: '', isCorrect: false }]) // Reuse for display
    setSelectedAnswer(null)
    setShowResult(false)

    if (soundEnabled) {
      setTimeout(() => playPop(), 100)
      setTimeout(() => playLetterSound(letter.letter, language), 300)
    }
  }, [language, soundEnabled, playPop, playLetterSound])

  // Generate tracing round
  const generateTracingRound = useCallback(() => {
    const letterIndex = Math.floor(Math.random() * 26)
    setCurrentLetterIndex(letterIndex)
    setSelectedAnswer(null)
    setShowResult(false)

    if (soundEnabled) {
      const letter = ALPHABET_DATA[letterIndex]
      setTimeout(() => playLetterSound(letter.letter, language), 300)
    }
  }, [language, soundEnabled, playLetterSound])

  // Generate round based on mode
  const generateRound = useCallback(() => {
    switch (gameMode) {
      case 'letterMatch':
        generateLetterMatchRound()
        break
      case 'caseMatch':
        generateCaseMatchRound()
        break
      case 'tracing':
        generateTracingRound()
        break
      case 'quiz':
        // Mix of letter match and case match
        if (Math.random() > 0.5) {
          generateLetterMatchRound()
        } else {
          generateCaseMatchRound()
        }
        break
    }
  }, [gameMode, generateLetterMatchRound, generateCaseMatchRound, generateTracingRound])

  // Start game
  const startGame = useCallback(
    (mode: GameMode) => {
      setGameMode(mode)
      setStats({
        score: 0,
        streak: 0,
        maxStreak: 0,
        correct: 0,
        total: 0,
        stars: 0,
        stickers: [],
        completedLetters: [],
      })
      setRound(1)
      setGameState('playing')
      // Delay to let state settle
      setTimeout(() => {
        switch (mode) {
          case 'letterMatch':
            generateLetterMatchRound()
            break
          case 'caseMatch':
            generateCaseMatchRound()
            break
          case 'tracing':
            generateTracingRound()
            break
          case 'quiz':
            if (Math.random() > 0.5) {
              generateLetterMatchRound()
            } else {
              generateCaseMatchRound()
            }
            break
        }
      }, 100)
    },
    [generateLetterMatchRound, generateCaseMatchRound, generateTracingRound]
  )

  // Handle answer selection
  const handleAnswer = useCallback(
    (index: number, isCorrect: boolean) => {
      if (showResult) return

      setSelectedAnswer(index)
      setShowResult(true)

      if (isCorrect) {
        if (soundEnabled) playCorrect()

        // Calculate points
        const basePoints = 100
        const streakBonus = stats.streak * 20
        const points = basePoints + streakBonus

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
          const availableStickers = STICKER_REWARDS.filter((s) => !newStickers.includes(s))
          if (availableStickers.length > 0) {
            const sticker = availableStickers[Math.floor(Math.random() * availableStickers.length)]
            newStickers = [...newStickers, sticker]
            setNewSticker(sticker)
            setTimeout(() => setNewSticker(null), 2000)
          }
        }

        // Track completed letters
        const newCompletedLetters = [...stats.completedLetters]
        if (!newCompletedLetters.includes(currentLetter.letter)) {
          newCompletedLetters.push(currentLetter.letter)
        }

        setStats((prev) => ({
          ...prev,
          score: prev.score + points,
          streak: newStreak,
          maxStreak: newMaxStreak,
          correct: prev.correct + 1,
          total: prev.total + 1,
          stars: newStars,
          stickers: newStickers,
          completedLetters: newCompletedLetters,
        }))
      } else {
        if (soundEnabled) playWrong()
        setStats((prev) => ({
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
          setRound((prev) => prev + 1)
          generateRound()
        }
      }, 1500)
    },
    [showResult, stats, currentLetter, round, totalRounds, soundEnabled, playCorrect, playWrong, playStar, playVictory, generateRound]
  )

  // Handle tracing complete
  const handleTracingComplete = useCallback(() => {
    if (soundEnabled) playCorrect()

    const basePoints = 150
    const streakBonus = stats.streak * 20
    const points = basePoints + streakBonus

    const newStreak = stats.streak + 1
    const newMaxStreak = Math.max(newStreak, stats.maxStreak)
    const newStars = stats.stars + ((stats.correct + 1) % 3 === 0 ? 1 : 0)

    if ((stats.correct + 1) % 3 === 0 && soundEnabled) {
      setTimeout(() => playStar(), 300)
    }

    let newStickers = [...stats.stickers]
    if (newStreak > 0 && newStreak % 5 === 0) {
      const availableStickers = STICKER_REWARDS.filter((s) => !newStickers.includes(s))
      if (availableStickers.length > 0) {
        const sticker = availableStickers[Math.floor(Math.random() * availableStickers.length)]
        newStickers = [...newStickers, sticker]
        setNewSticker(sticker)
        setTimeout(() => setNewSticker(null), 2000)
      }
    }

    const newCompletedLetters = [...stats.completedLetters]
    if (!newCompletedLetters.includes(currentLetter.letter)) {
      newCompletedLetters.push(currentLetter.letter)
    }

    setStats((prev) => ({
      ...prev,
      score: prev.score + points,
      streak: newStreak,
      maxStreak: newMaxStreak,
      correct: prev.correct + 1,
      total: prev.total + 1,
      stars: newStars,
      stickers: newStickers,
      completedLetters: newCompletedLetters,
    }))

    setTimeout(() => {
      if (round >= totalRounds) {
        setGameState('results')
        setShowConfetti(true)
        if (soundEnabled) playVictory()
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        setRound((prev) => prev + 1)
        generateTracingRound()
      }
    }, 1500)
  }, [stats, currentLetter, round, totalRounds, soundEnabled, playCorrect, playStar, playVictory, generateTracingRound])

  // Play letter sound button
  const handlePlaySound = () => {
    if (soundEnabled && currentLetter) {
      playLetterSound(currentLetter.letter, language)
    }
  }

  // Render menu
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
          ABC
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">
          {language === 'en' ? 'Alphabet Fun!' : 'Alfabeto Divertente!'}
        </p>
        <p className="text-gray-500 mt-2">{language === 'en' ? 'Learn your ABCs!' : 'Impara le lettere!'}</p>
      </div>

      {/* Language toggle */}
      <div className="flex gap-2 bg-white rounded-full p-1 shadow-lg">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded-full font-bold transition-all ${language === 'en' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setLanguage('it')}
          className={`px-4 py-2 rounded-full font-bold transition-all ${language === 'it' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          🇮🇹 Italiano
        </button>
      </div>

      {/* Game mode selection */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => startGame('letterMatch')}
          className="bg-gradient-to-br from-pink-400 to-pink-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">🎯</div>
          <div className="font-bold">{language === 'en' ? 'Find Object' : 'Trova Oggetto'}</div>
          <div className="text-sm opacity-80">{language === 'en' ? 'Match letter to object' : 'Abbina lettera a oggetto'}</div>
        </button>

        <button
          onClick={() => startGame('caseMatch')}
          className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">Aa</div>
          <div className="font-bold">{language === 'en' ? 'Match Case' : 'Maiusc./Minusc.'}</div>
          <div className="text-sm opacity-80">{language === 'en' ? 'Upper & lowercase' : 'Maiuscole e minuscole'}</div>
        </button>

        <button
          onClick={() => startGame('tracing')}
          className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">✏️</div>
          <div className="font-bold">{language === 'en' ? 'Trace Letters' : 'Traccia Lettere'}</div>
          <div className="text-sm opacity-80">{language === 'en' ? 'Practice writing' : 'Pratica la scrittura'}</div>
        </button>

        <button
          onClick={() => startGame('quiz')}
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">🧠</div>
          <div className="font-bold">{language === 'en' ? 'Mixed Quiz' : 'Quiz Misto'}</div>
          <div className="text-sm opacity-80">{language === 'en' ? 'Test your knowledge' : 'Testa le tue conoscenze'}</div>
        </button>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="px-6 py-3 bg-gray-100 rounded-full text-gray-600 font-medium hover:bg-gray-200 transition-all"
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      {/* Alphabet preview */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 max-w-md w-full">
        <div className="text-center text-gray-500 text-sm mb-2">{language === 'en' ? 'Learn all 26 letters!' : 'Impara tutte le 26 lettere!'}</div>
        <div className="flex flex-wrap justify-center gap-1">
          {ALPHABET_DATA.map((l) => (
            <span key={l.letter} className="text-lg font-bold text-purple-600">
              {l.letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  // Render letter match game
  const renderLetterMatchGame = () => (
    <div className="flex flex-col items-center gap-6">
      {/* Letter display */}
      <div className="text-center">
        <p className="text-white/80 mb-2">{language === 'en' ? 'Find something that starts with:' : 'Trova qualcosa che inizia con:'}</p>
        <button onClick={handlePlaySound} className="hover:scale-105 transition-all">
          <AnimatedLetter letter={currentLetter.letter} size="xl" />
        </button>
        <p className="text-white/60 text-sm mt-2">{language === 'en' ? 'Tap the letter to hear it!' : 'Tocca la lettera per sentirla!'}</p>
      </div>

      {/* Object options */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index, option.isCorrect)}
            disabled={showResult}
            className={`
              p-4 rounded-2xl shadow-lg transition-all transform
              ${!showResult && 'hover:scale-105 active:scale-95'}
              ${
                showResult
                  ? option.isCorrect
                    ? 'bg-green-400 border-4 border-green-500 animate-correct-bounce'
                    : selectedAnswer === index
                    ? 'bg-red-400 border-4 border-red-500 animate-shake'
                    : 'bg-gray-200 opacity-50'
                  : 'bg-white border-4 border-purple-200 hover:border-purple-400'
              }
            `}
          >
            <div className="text-5xl mb-2">{option.emoji}</div>
            <div className={`font-bold text-sm ${showResult && option.isCorrect ? 'text-white' : 'text-gray-700'}`}>{option.name}</div>
          </button>
        ))}
      </div>
    </div>
  )

  // Render case match game
  const renderCaseMatchGame = () => (
    <div className="flex flex-col items-center gap-6">
      {/* Letter display */}
      <div className="text-center">
        <p className="text-white/80 mb-2">{language === 'en' ? 'Find the matching letter:' : 'Trova la lettera corrispondente:'}</p>
        <button onClick={handlePlaySound} className="hover:scale-105 transition-all">
          <AnimatedLetter letter={options[0]?.emoji || ''} size="xl" />
        </button>
        <p className="text-white/60 text-sm mt-2">
          {language === 'en'
            ? options[0]?.emoji === options[0]?.emoji?.toUpperCase()
              ? 'Find the lowercase'
              : 'Find the uppercase'
            : options[0]?.emoji === options[0]?.emoji?.toUpperCase()
            ? 'Trova la minuscola'
            : 'Trova la maiuscola'}
        </p>
      </div>

      {/* Case options */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {caseOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index, option.isCorrect)}
            disabled={showResult}
            className={`
              py-8 px-4 rounded-2xl shadow-lg transition-all transform
              ${!showResult && 'hover:scale-105 active:scale-95'}
              ${
                showResult
                  ? option.isCorrect
                    ? 'bg-green-400 border-4 border-green-500 animate-correct-bounce'
                    : selectedAnswer === index
                    ? 'bg-red-400 border-4 border-red-500 animate-shake'
                    : 'bg-gray-200 opacity-50'
                  : 'bg-white border-4 border-purple-200 hover:border-purple-400'
              }
            `}
          >
            <div className={`text-5xl font-black ${showResult && option.isCorrect ? 'text-white' : 'text-purple-700'}`}>{option.letter}</div>
          </button>
        ))}
      </div>
    </div>
  )

  // Render tracing game
  const renderTracingGame = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-white/80 mb-2">{language === 'en' ? 'Trace the letter:' : 'Traccia la lettera:'}</p>
        <button onClick={handlePlaySound} className="mb-2">
          <span className="text-4xl font-black text-white drop-shadow-lg">
            {currentLetter.uppercase} {currentLetter.lowercase}
          </span>
        </button>
      </div>

      <LetterTracingCanvas letter={currentLetter.letter} onComplete={handleTracingComplete} soundEnabled={soundEnabled} playTrace={playTrace} />

      {/* Object hint */}
      <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
        <span className="text-2xl">{currentLetter.objects[0].emoji}</span>
        <span className="text-white font-medium">
          {language === 'en' ? currentLetter.objects[0].nameEn : currentLetter.objects[0].nameIt}
        </span>
      </div>
    </div>
  )

  // Render playing state
  const renderPlaying = () => (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setGameState('menu')}
          className="bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow hover:scale-105 transition-all"
        >
          ← {language === 'en' ? 'Back' : 'Indietro'}
        </button>

        <div className="text-center">
          <div className="text-sm text-white/80">{language === 'en' ? 'Round' : 'Round'}</div>
          <div className="font-black text-xl text-white">
            {round}/{totalRounds}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-white/80">{language === 'en' ? 'Score' : 'Punti'}</div>
          <div className="font-black text-xl text-white">{stats.score.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress and streak */}
      <div className="flex items-center justify-between mb-4 px-2">
        <ProgressStars count={stats.stars} max={5} />
        <StreakFire streak={stats.streak} />
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-white/80 w-10 h-10 rounded-full shadow-lg hover:scale-105 transition-all z-20 flex items-center justify-center"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Game content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {gameMode === 'letterMatch' && renderLetterMatchGame()}
        {gameMode === 'caseMatch' && renderCaseMatchGame()}
        {gameMode === 'tracing' && renderTracingGame()}
        {gameMode === 'quiz' && (caseOptions.length > 0 ? renderCaseMatchGame() : renderLetterMatchGame())}
      </div>

      {/* Sticker collection */}
      <div className="text-center mt-4">
        <StickerCollection stickers={stats.stickers} />
      </div>

      {/* New sticker popup */}
      {newSticker && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-bounce-in text-center">
            <div className="text-6xl mb-2">{newSticker}</div>
            <div className="font-black text-purple-600 text-xl">{language === 'en' ? 'New Sticker!' : 'Nuovo Adesivo!'}</div>
          </div>
        </div>
      )}
    </div>
  )

  // Render results
  const renderResults = () => {
    const percentage = Math.round((stats.correct / stats.total) * 100)
    const rating =
      percentage >= 90
        ? language === 'en'
          ? '🌟 AMAZING!'
          : '🌟 FANTASTICO!'
        : percentage >= 70
        ? language === 'en'
          ? '⭐ GREAT!'
          : '⭐ OTTIMO!'
        : percentage >= 50
        ? language === 'en'
          ? '👍 GOOD!'
          : '👍 BRAVO!'
        : language === 'en'
        ? '💪 KEEP TRYING!'
        : '💪 CONTINUA COSÌ!'

    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        <Confetti active={showConfetti} />

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">{rating}</h1>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {stats.score.toLocaleString()}
            </div>
            <div className="text-gray-500 font-medium">{language === 'en' ? 'POINTS' : 'PUNTI'}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-1">✅</div>
              <div className="font-black text-xl text-green-500">
                {stats.correct}/{stats.total}
              </div>
              <div className="text-xs text-gray-500">{language === 'en' ? 'Correct' : 'Corrette'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-black text-xl text-orange-500">{stats.maxStreak}x</div>
              <div className="text-xs text-gray-500">{language === 'en' ? 'Best Streak' : 'Serie Migliore'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⭐</div>
              <div className="font-black text-xl text-yellow-500">{stats.stars}</div>
              <div className="text-xs text-gray-500">{language === 'en' ? 'Stars' : 'Stelle'}</div>
            </div>
          </div>

          {/* Letters learned */}
          {stats.completedLetters.length > 0 && (
            <div className="text-center border-t pt-4 mb-4">
              <div className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Letters Practiced' : 'Lettere Praticate'}</div>
              <div className="flex justify-center gap-1 flex-wrap">
                {stats.completedLetters.map((letter, i) => (
                  <span key={i} className="text-lg font-bold text-purple-600 bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stickers earned */}
          {stats.stickers.length > 0 && (
            <div className="text-center border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Stickers Earned' : 'Adesivi Guadagnati'}</div>
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
            onClick={() => startGame(gameMode)}
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🔄 {language === 'en' ? 'Play Again' : 'Gioca Ancora'}
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🏠 {language === 'en' ? 'Menu' : 'Menu'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-300 via-pink-200 to-yellow-200 relative overflow-hidden">
      {/* Back link */}
      {gameState === 'menu' && (
        <Link
          href="/games/arcade/"
          className="absolute top-4 left-4 z-20 bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all backdrop-blur-sm"
        >
          ← {language === 'en' ? 'Games' : 'Giochi'}
        </Link>
      )}

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {['A', 'B', 'C', '🍎', '🐻', '🐱', 'X', 'Y', 'Z'].map((item, i) => (
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
            {item}
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
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes star-pop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes sticker-pop {
          0% {
            transform: scale(0) rotate(-180deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes correct-bounce {
          0%,
          100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(0.95);
          }
          75% {
            transform: scale(1.05);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          75% {
            transform: translateX(8px);
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0);
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
        @keyframes fire-flicker {
          0%,
          100% {
            transform: scale(1) rotate(-5deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
        }
        @keyframes float-decoration {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(15deg);
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-out forwards;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
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
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function AlphabetGame() {
  return (
    <GameWrapper gameName="ABC Fun" gameId="alphabet" emoji={"🔤"}>
      <AlphabetGameInner />
    </GameWrapper>
  )
}
