'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface Racer {
  id: string
  name: string
  emoji: string
  progress: number
  wpm: number
  color: string
  isPlayer: boolean
  finished: boolean
  finishTime?: number
}

interface LeaderboardEntry {
  wpm: number
  accuracy: number
  time: number
  difficulty: Difficulty
  date: string
  position: number
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'
type GameState = 'menu' | 'countdown' | 'racing' | 'finished'

// Word/sentence sets by difficulty
const TEXTS = {
  easy: [
    'the cat sat on the mat',
    'i like to play games',
    'the sun is very bright',
    'dogs are good friends',
    'we had fun at the park',
    'my mom makes great food',
    'the bird can fly high',
    'i read a good book',
    'fish swim in the sea',
    'the tree has green leaves',
    'i love my family',
    'we play in the yard',
    'the sky is very blue',
    'i drink cold water',
    'the baby is sleeping',
  ],
  medium: [
    'the quick brown fox jumps over the lazy dog',
    'practice makes perfect when learning to type',
    'a journey of a thousand miles begins with a single step',
    'typing fast requires both speed and accuracy',
    'every champion was once a beginner who never gave up',
    'the early bird catches the worm but the second mouse gets the cheese',
    'all that glitters is not gold but silence is golden',
    'when life gives you lemons make some lemonade',
    'actions speak louder than words in every situation',
    'knowledge is power but wisdom is knowing how to use it',
  ],
  hard: [
    'The five boxing wizards jump quickly into the frozen lake at dawn.',
    'Pack my box with five dozen liquor jugs before the shipment arrives.',
    'How vexingly quick daft zebras jump through the mystical fog!',
    'Sphinx of black quartz, judge my vow and answer truly.',
    'Two driven jocks help fax my big quiz to the broadcasting network.',
    'The job requires extra pluck and zeal from every young wage earner.',
    'Crazy Frederick bought many very exquisite opal jewels from the store.',
    'We promptly judged antique ivory buckles for the next prize ceremony.',
    'A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.',
    'Jackdaws love my big sphinx of quartz and worship it daily.',
  ],
  insane: [
    'The complexity of modern JavaScript frameworks often bewilders newcomers who are just starting their programming journey.',
    'Quantum computing promises to revolutionize cryptography by making current encryption methods obsolete within decades.',
    'Biodiversity conservation requires international cooperation, significant funding, and a fundamental shift in human behavior.',
    'The intricate mechanisms of cellular respiration involve glycolysis, the citric acid cycle, and oxidative phosphorylation.',
    'Artificial intelligence systems are increasingly capable of generating human-like text, images, and even code snippets.',
  ],
}

// AI opponent names and personalities
const AI_RACERS = [
  { name: 'SpeedDemon', emoji: '👹', baseWPM: 35, variance: 15, color: '#ff4444' },
  { name: 'TypeMaster', emoji: '🤖', baseWPM: 45, variance: 20, color: '#4488ff' },
  { name: 'SwiftKeys', emoji: '⚡', baseWPM: 55, variance: 25, color: '#ffaa00' },
  { name: 'ProTyper', emoji: '🏆', baseWPM: 65, variance: 30, color: '#aa44ff' },
  { name: 'LegendTypist', emoji: '👑', baseWPM: 80, variance: 20, color: '#44ff88' },
]

// Difficulty settings
const DIFFICULTY_CONFIG = {
  easy: {
    label: '🌱 Easy',
    description: 'Short simple sentences',
    aiCount: 2,
    aiSpeedMult: 0.7,
    color: '#4ade80',
  },
  medium: {
    label: '🔥 Medium',
    description: 'Longer sentences',
    aiCount: 3,
    aiSpeedMult: 0.85,
    color: '#fbbf24',
  },
  hard: {
    label: '💎 Hard',
    description: 'Complex punctuation',
    aiCount: 4,
    aiSpeedMult: 1.0,
    color: '#f87171',
  },
  insane: {
    label: '☠️ Insane',
    description: 'Extreme challenge',
    aiCount: 5,
    aiSpeedMult: 1.2,
    color: '#c084fc',
  },
}

// Sound effects
const playSound = (type: 'type' | 'error' | 'correct' | 'finish' | 'countdown' | 'go') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'type':
        osc.frequency.value = 600 + Math.random() * 200
        osc.type = 'sine'
        gain.gain.value = 0.08
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.03)
        osc.stop(audio.currentTime + 0.03)
        break
      case 'error':
        osc.frequency.value = 150
        osc.type = 'sawtooth'
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'correct':
        osc.frequency.value = 880
        osc.type = 'sine'
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'countdown':
        osc.frequency.value = 440
        osc.type = 'square'
        gain.gain.value = 0.05
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'go':
        osc.frequency.value = 880
        osc.type = 'square'
        gain.gain.value = 0.06
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1760, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
      case 'finish':
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const o = audio.createOscillator()
            const g = audio.createGain()
            o.connect(g)
            g.connect(audio.destination)
            o.type = 'square'
            o.frequency.value = freq
            g.gain.value = 0.05
            o.start()
            g.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            o.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea']
  const confetti = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  )
}

// Race track component for a single racer
const RaceTrack = ({ racer, position }: { racer: Racer; position: number }) => {
  const trackWidth = Math.min(racer.progress, 100)
  
  return (
    <div className="relative mb-3">
      {/* Racer info */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{racer.emoji}</span>
          <span 
            className={`font-bold text-sm ${racer.isPlayer ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            {racer.isPlayer ? '👤 YOU' : racer.name}
          </span>
          {racer.finished && (
            <span className="text-xs bg-green-500/30 text-green-400 px-2 py-0.5 rounded-full">
              #{position + 1}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 font-mono">{Math.round(racer.wpm)} WPM</span>
      </div>
      
      {/* Track */}
      <div className="relative h-10 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
        {/* Track lines */}
        <div className="absolute inset-0 flex items-center justify-around opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-0.5 h-full bg-white" />
          ))}
        </div>
        
        {/* Progress bar */}
        <div 
          className="absolute h-full transition-all duration-100 ease-out rounded-r-lg"
          style={{ 
            width: `${trackWidth}%`,
            backgroundColor: racer.color + '40',
            borderRight: `3px solid ${racer.color}`,
          }}
        />
        
        {/* Car */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-100 ease-out"
          style={{ 
            left: `calc(${trackWidth}% - 20px)`,
            filter: `drop-shadow(0 0 8px ${racer.color})`,
          }}
        >
          🏎️
        </div>
        
        {/* Finish flag */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xl opacity-50">
          🏁
        </div>
      </div>
    </div>
  )
}

// Text display with highlighting
const TextDisplay = ({ 
  text, 
  currentIndex, 
  errorIndex 
}: { 
  text: string
  currentIndex: number
  errorIndex: number | null
}) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-700 font-mono text-lg md:text-xl leading-relaxed">
      {text.split('').map((char, index) => {
        let className = 'transition-colors duration-100'
        
        if (index < currentIndex) {
          // Correctly typed
          className += ' text-green-400'
        } else if (index === currentIndex) {
          // Current character
          if (errorIndex === index) {
            className += ' bg-red-500/50 text-white animate-pulse'
          } else {
            className += ' bg-yellow-400/30 text-yellow-300 underline'
          }
        } else {
          // Not yet typed
          className += ' text-gray-500'
        }
        
        // Handle spaces
        if (char === ' ') {
          return (
            <span key={index} className={className}>
              {index === currentIndex ? '␣' : ' '}
            </span>
          )
        }
        
        return (
          <span key={index} className={className}>
            {char}
          </span>
        )
      })}
    </div>
  )
}

// Main component
function TypingRaceInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errorIndex, setErrorIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [racers, setRacers] = useState<Racer[]>([])
  const [countdown, setCountdown] = useState(3)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [playerPosition, setPlayerPosition] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('typing-race-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Get random text
  const getRandomText = useCallback(() => {
    const texts = TEXTS[difficulty]
    return texts[Math.floor(Math.random() * texts.length)]
  }, [difficulty])

  // Initialize racers
  const initializeRacers = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty]
    const selectedAIs = [...AI_RACERS]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.aiCount)
    
    const aiRacers: Racer[] = selectedAIs.map((ai, index) => ({
      id: `ai-${index}`,
      name: ai.name,
      emoji: ai.emoji,
      progress: 0,
      wpm: 0,
      color: ai.color,
      isPlayer: false,
      finished: false,
      // Store AI config for simulation
      ...ai,
    }))
    
    const playerRacer: Racer = {
      id: 'player',
      name: 'You',
      emoji: '🧑',
      progress: 0,
      wpm: 0,
      color: '#fbbf24',
      isPlayer: true,
      finished: false,
    }
    
    // Randomize order
    const allRacers = [playerRacer, ...aiRacers].sort(() => Math.random() - 0.5)
    setRacers(allRacers)
  }, [difficulty])

  // Start countdown
  const startCountdown = useCallback(() => {
    const newText = getRandomText()
    setText(newText)
    setCurrentIndex(0)
    setErrorIndex(null)
    setErrors(0)
    setElapsedTime(0)
    setStartTime(null)
    setCountdown(3)
    setPlayerPosition(0)
    initializeRacers()
    setGameState('countdown')
    
    // Countdown timer
    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      if (soundEnabled) playSound('countdown')
      
      if (count <= 0) {
        clearInterval(countdownInterval)
        setGameState('racing')
        setStartTime(Date.now())
        if (soundEnabled) playSound('go')
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }, 1000)
  }, [getRandomText, initializeRacers, soundEnabled])

  // AI simulation
  useEffect(() => {
    if (gameState !== 'racing') return
    
    const config = DIFFICULTY_CONFIG[difficulty]
    
    aiTimerRef.current = setInterval(() => {
      setRacers(prev => prev.map(racer => {
        if (racer.isPlayer || racer.finished) return racer
        
        // Find AI config
        const aiConfig = AI_RACERS.find(ai => ai.name === racer.name) || AI_RACERS[0]
        
        // Calculate WPM with some variance
        const targetWPM = (aiConfig.baseWPM + (Math.random() - 0.5) * aiConfig.variance) * config.aiSpeedMult
        
        // Progress based on WPM
        // WPM = (chars / 5) / (time in minutes)
        // Progress per second = (WPM * 5) / 60 / textLength * 100
        const progressPerTick = (targetWPM * 5) / 60 / text.length * 100 * 0.1 // 100ms tick
        
        const newProgress = Math.min(racer.progress + progressPerTick * (0.8 + Math.random() * 0.4), 100)
        const finished = newProgress >= 100 && !racer.finished
        
        return {
          ...racer,
          progress: newProgress,
          wpm: targetWPM,
          finished: newProgress >= 100,
          finishTime: finished ? Date.now() : racer.finishTime,
        }
      }))
    }, 100)
    
    return () => {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current)
    }
  }, [gameState, difficulty, text.length])

  // Timer
  useEffect(() => {
    if (gameState !== 'racing' || !startTime) return
    
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, startTime])

  // Calculate WPM
  const calculateWPM = useCallback(() => {
    if (!startTime || currentIndex === 0) return 0
    const timeInMinutes = (Date.now() - startTime) / 60000
    const words = currentIndex / 5 // Standard: 5 chars = 1 word
    return Math.round(words / timeInMinutes)
  }, [startTime, currentIndex])

  // Update player progress
  useEffect(() => {
    if (gameState !== 'racing') return
    
    const progress = (currentIndex / text.length) * 100
    const wpm = calculateWPM()
    
    setRacers(prev => prev.map(racer => {
      if (!racer.isPlayer) return racer
      
      const finished = progress >= 100 && !racer.finished
      if (finished) {
        // Player finished!
        setTimeout(() => finishRace(), 100)
      }
      
      return {
        ...racer,
        progress,
        wpm,
        finished: progress >= 100,
        finishTime: finished ? Date.now() : racer.finishTime,
      }
    }))
  }, [currentIndex, text.length, gameState, calculateWPM])

  // Calculate positions
  useEffect(() => {
    const sorted = [...racers].sort((a, b) => {
      if (a.finished && b.finished) {
        return (a.finishTime || 0) - (b.finishTime || 0)
      }
      if (a.finished) return -1
      if (b.finished) return 1
      return b.progress - a.progress
    })
    
    const playerIdx = sorted.findIndex(r => r.isPlayer)
    setPlayerPosition(playerIdx)
  }, [racers])

  // Finish race
  const finishRace = useCallback(() => {
    if (gameState !== 'racing') return
    
    setGameState('finished')
    rewards.trackWin()
    if (timerRef.current) clearInterval(timerRef.current)
    if (aiTimerRef.current) clearInterval(aiTimerRef.current)
    
    const wpm = calculateWPM()
    const accuracy = Math.round(((text.length - errors) / text.length) * 100)
    const time = elapsedTime / 1000
    
    // Calculate final position
    const sorted = [...racers].sort((a, b) => {
      if (a.finished && b.finished) {
        return (a.finishTime || 0) - (b.finishTime || 0)
      }
      if (a.finished) return -1
      if (b.finished) return 1
      return b.progress - a.progress
    })
    const position = sorted.findIndex(r => r.isPlayer)
    
    // Save to leaderboard
    const newEntry: LeaderboardEntry = {
      wpm,
      accuracy,
      time,
      difficulty,
      date: new Date().toISOString(),
      position: position + 1,
    }
    
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 20)
    
    setLeaderboard(newLeaderboard)
    localStorage.setItem('typing-race-leaderboard', JSON.stringify(newLeaderboard))
    
    // Show confetti if won
    if (position === 0) {
      setShowConfetti(true)
      if (soundEnabled) playSound('finish')
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [gameState, calculateWPM, text.length, errors, elapsedTime, racers, difficulty, leaderboard, soundEnabled])

  // Handle typing
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return
    
    const inputValue = e.target.value
    const lastChar = inputValue.slice(-1)
    const expectedChar = text[currentIndex]
    
    if (lastChar === expectedChar) {
      // Correct!
      setCurrentIndex(prev => prev + 1)
      setErrorIndex(null)
      if (soundEnabled) playSound('type')
      
      // Check if completed
      if (currentIndex + 1 >= text.length) {
        if (soundEnabled) playSound('correct')
      }
    } else {
      // Error!
      setErrorIndex(currentIndex)
      setErrors(prev => prev + 1)
      if (soundEnabled) playSound('error')
    }
    
    // Clear input
    e.target.value = ''
  }, [gameState, text, currentIndex, soundEnabled])

  // Handle key press for special keys
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (gameState !== 'racing') return
    
    // Prevent space from scrolling
    if (e.key === ' ') {
      e.preventDefault()
    }
  }, [gameState])

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const decimals = Math.floor((ms % 1000) / 100)
    return `${seconds}.${decimals}s`
  }

  // Sort racers by position
  const sortedRacers = [...racers].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.finishTime || 0) - (b.finishTime || 0)
    }
    if (a.finished) return -1
    if (b.finished) return 1
    return b.progress - a.progress
  })

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        <Confetti active={showConfetti} />
        
        {/* Back button */}
        <Link
          href="/games/arcade/"
          className="absolute top-4 left-4 bg-gray-800 px-4 py-2 rounded-full font-bold text-purple-400 shadow-lg hover:scale-105 transition-all border border-purple-500/30"
        >
          ← Games
        </Link>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 right-4 bg-gray-800 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all border border-purple-500/30"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Title */}
        <div className="mt-16 mb-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 drop-shadow-lg mb-2">
            🏎️ TYPING RACE
          </h1>
          <p className="text-xl text-purple-300/80">
            Type fast to race against AI opponents!
          </p>
        </div>

        {/* Difficulty selection */}
        <div className="w-full max-w-md mb-8">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Choose Difficulty:</h2>
          <div className="space-y-3">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => {
              const config = DIFFICULTY_CONFIG[diff]
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`
                    w-full p-4 rounded-2xl font-bold transition-all border-2
                    ${difficulty === diff 
                      ? 'scale-105 shadow-xl' 
                      : 'opacity-70 hover:opacity-100'
                    }
                  `}
                  style={{
                    backgroundColor: difficulty === diff ? config.color + '30' : '#1f2937',
                    borderColor: difficulty === diff ? config.color : '#374151',
                    color: difficulty === diff ? config.color : '#9ca3af',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{config.label}</span>
                    <span className="text-sm opacity-80">{config.description}</span>
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {config.aiCount} AI opponents
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startCountdown}
          className="px-12 py-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-2xl rounded-full shadow-xl hover:scale-110 transition-all animate-pulse"
        >
          🏁 START RACE
        </button>

        {/* Leaderboard button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🏆 Leaderboard
        </button>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur rounded-2xl p-6 max-w-md border border-gray-700">
          <h3 className="font-bold text-white text-lg mb-3">📖 How to Play:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• Type the text as fast and accurate as you can</li>
            <li>• Race against AI opponents on different tracks</li>
            <li>• Your car moves based on your typing speed</li>
            <li>• Mistakes slow you down - be accurate!</li>
            <li>• Beat the AI to claim victory! 🏆</li>
          </ul>
        </div>

        {/* Leaderboard modal */}
        {showLeaderboard && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLeaderboard(false)}
          >
            <div 
              className="bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-auto border-2 border-yellow-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-yellow-400">🏆 Best Races</h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No races yet! Start racing to set records.
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border ${
                        index === 0
                          ? 'bg-yellow-500/20 border-yellow-500/50'
                          : index === 1
                          ? 'bg-gray-400/20 border-gray-400/50'
                          : index === 2
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <div>
                            <div className="text-xl font-bold text-green-400">{entry.wpm} WPM</div>
                            <div className="text-xs text-gray-400">
                              {entry.accuracy}% accuracy • {entry.time.toFixed(1)}s • {DIFFICULTY_CONFIG[entry.difficulty].label}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-yellow-400">#{entry.position}</div>
                          <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setLeaderboard([])
                  localStorage.removeItem('typing-race-leaderboard')
                }}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all"
              >
                🗑️ Clear Records
              </button>
            </div>
          </div>
        )}

        {/* Decorations */}
        <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-40">🏎️</div>
        <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-40" style={{ animationDelay: '0.3s' }}>⌨️</div>
        <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-30" style={{ animationDelay: '0.6s' }}>🏁</div>

        <style jsx>{`
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti {
            animation: confetti ease-out forwards;
          }
        `}</style>
      </div>
    )
  }

  // Countdown screen
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-9xl font-black text-yellow-400 animate-bounce drop-shadow-lg">
            {countdown > 0 ? countdown : '🏁'}
          </div>
          <p className="text-2xl text-purple-300 mt-4 font-bold">
            {countdown > 0 ? 'Get Ready!' : 'GO!'}
          </p>
        </div>
        
        {/* Preview of racers */}
        <div className="mt-8 w-full max-w-2xl px-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <div className="text-center text-gray-400 text-sm mb-2">Racers</div>
            <div className="flex flex-wrap justify-center gap-4">
              {racers.map((racer) => (
                <div 
                  key={racer.id} 
                  className={`text-center ${racer.isPlayer ? 'ring-2 ring-yellow-400 rounded-lg p-2' : 'p-2'}`}
                >
                  <div className="text-2xl">{racer.emoji}</div>
                  <div className="text-xs text-gray-300">{racer.isPlayer ? 'YOU' : racer.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Racing screen
  if (gameState === 'racing' || gameState === 'finished') {
    const accuracy = text.length > 0 ? Math.round(((currentIndex - errors) / Math.max(currentIndex, 1)) * 100) : 100
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-4">
        <Confetti active={showConfetti} />
        
        {/* Header */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-4">
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current)
              if (aiTimerRef.current) clearInterval(aiTimerRef.current)
              setGameState('menu')
            }}
            className="bg-gray-800 px-4 py-2 rounded-full font-bold text-red-400 shadow-lg hover:scale-105 transition-all border border-red-500/30"
          >
            ✕ Quit
          </button>
          
          <div className="flex gap-3">
            <div className="bg-gray-800 px-4 py-2 rounded-full font-bold text-green-400 shadow-lg border border-green-500/30">
              ⚡ {calculateWPM()} WPM
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-full font-bold text-blue-400 shadow-lg border border-blue-500/30">
              ⏱️ {formatTime(elapsedTime)}
            </div>
            <div className={`bg-gray-800 px-4 py-2 rounded-full font-bold shadow-lg border ${
              accuracy >= 95 ? 'text-green-400 border-green-500/30' : 
              accuracy >= 85 ? 'text-yellow-400 border-yellow-500/30' : 
              'text-red-400 border-red-500/30'
            }`}>
              🎯 {accuracy}%
            </div>
          </div>
        </div>

        {/* Position indicator */}
        <div className="w-full max-w-4xl mb-4">
          <div className={`text-center py-2 rounded-xl font-bold text-xl ${
            playerPosition === 0 ? 'bg-yellow-500/30 text-yellow-300' :
            playerPosition === 1 ? 'bg-gray-400/30 text-gray-300' :
            playerPosition === 2 ? 'bg-orange-500/30 text-orange-300' :
            'bg-gray-700/50 text-gray-400'
          }`}>
            {gameState === 'finished' 
              ? `🏁 You finished #${playerPosition + 1}!`
              : `Position: #${playerPosition + 1}`
            }
          </div>
        </div>

        {/* Race tracks */}
        <div className="w-full max-w-4xl bg-gray-800/50 rounded-2xl p-4 mb-6 border border-gray-700">
          {sortedRacers.map((racer, index) => (
            <RaceTrack key={racer.id} racer={racer} position={index} />
          ))}
        </div>

        {/* Text to type */}
        <div className="w-full max-w-4xl mb-4">
          <TextDisplay 
            text={text} 
            currentIndex={currentIndex} 
            errorIndex={errorIndex}
          />
        </div>

        {/* Input */}
        {gameState === 'racing' ? (
          <div className="w-full max-w-md">
            <input
              ref={inputRef}
              type="text"
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-6 py-4 text-2xl font-bold text-center bg-gray-800 text-white rounded-2xl shadow-xl border-4 border-purple-500/50 focus:border-yellow-400 outline-none transition-all placeholder-gray-500"
              placeholder="Start typing..."
              autoFocus
            />
            <p className="text-center text-gray-400 mt-2 text-sm">
              Type the highlighted character • {text.length - currentIndex} characters remaining
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-5xl mb-2">
                {playerPosition === 0 ? '🏆' : playerPosition === 1 ? '🥈' : playerPosition === 2 ? '🥉' : '🏎️'}
              </div>
              <h2 className={`text-3xl font-black ${
                playerPosition === 0 ? 'text-yellow-400' : 'text-purple-400'
              }`}>
                {playerPosition === 0 ? 'YOU WON!' : `Finished #${playerPosition + 1}`}
              </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
              <div className="bg-gray-800 rounded-xl p-4 border border-green-500/30">
                <div className="text-3xl font-bold text-green-400">{calculateWPM()}</div>
                <div className="text-xs text-gray-400">WPM</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-blue-500/30">
                <div className="text-3xl font-bold text-blue-400">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-gray-400">Time</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/30">
                <div className="text-3xl font-bold text-purple-400">{accuracy}%</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={startCountdown}
                className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🔄 Race Again
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-8 py-4 bg-gray-700 text-gray-300 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🏠 Menu
              </button>
            </div>
          </div>
        )}

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="fixed bottom-4 right-4 bg-gray-800 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all border border-gray-700"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <style jsx>{`
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti {
            animation: confetti ease-out forwards;
          }
        `}</style>
      </div>
    )
  }

  return null
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function TypingRace() {
  return (
    <GameWrapper gameName="Typing Race" gameId="typing-race" emoji={"🏎️"}>
      <TypingRaceInner />
    </GameWrapper>
  )
}
