'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface FallingWord {
  id: number
  word: string
  x: number
  y: number
  speed: number
}

interface LeaderboardEntry {
  score: number
  wpm: number
  difficulty: Difficulty
  wordsTyped: number
  date: string
}

type Difficulty = 'easy' | 'medium' | 'hard'

// Word lists by difficulty
const WORDS = {
  easy: [
    // 3-4 letter simple words
    'CAT', 'DOG', 'SUN', 'FUN', 'RUN', 'BIG', 'PIG', 'HAT', 'BAT', 'RAT',
    'CUP', 'MUG', 'BUS', 'CAR', 'JAR', 'BOX', 'FOX', 'TOY', 'JOY', 'BOY',
    'BED', 'RED', 'PEN', 'HEN', 'TEN', 'EGG', 'LEG', 'BAG', 'TAG', 'WAG',
    'TOP', 'HOP', 'POP', 'MOP', 'COP', 'HOT', 'POT', 'DOT', 'COT', 'LOT',
    'MAP', 'CAP', 'TAP', 'RAP', 'GAP', 'NAP', 'LAP', 'ZAP', 'PAL', 'GAL',
    'FAN', 'CAN', 'MAN', 'PAN', 'TAN', 'VAN', 'RAN', 'BAN', 'DIG', 'FIG',
    'WIG', 'JIG', 'SIT', 'FIT', 'BIT', 'HIT', 'KIT', 'PIT', 'WIT', 'ZIT',
    'COW', 'BOW', 'ROW', 'TOW', 'NOW', 'HOW', 'WOW', 'SOW', 'LOW', 'MOW',
    'BEE', 'SEE', 'TEE', 'FEE', 'KEY', 'DAY', 'WAY', 'HAY', 'BAY', 'SAY',
    'ICE', 'ACE', 'PIE', 'TIE', 'LIE', 'DIE', 'SKY', 'FLY', 'CRY', 'TRY',
  ],
  medium: [
    // 5-6 letter words
    'APPLE', 'BEACH', 'CANDY', 'DANCE', 'EARTH', 'FAIRY', 'GAMES', 'HAPPY',
    'JUMPY', 'KITTEN', 'LEMON', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN',
    'ROBOT', 'SUNNY', 'TRAIN', 'UNCLE', 'VIDEO', 'WATER', 'YOUNG', 'ZEBRA',
    'BIRDS', 'CLOUD', 'DREAM', 'FLAME', 'GHOST', 'HEART', 'JELLY', 'KNIFE',
    'LIGHT', 'MONEY', 'NOISE', 'OLIVE', 'PARTY', 'QUICK', 'RIVER', 'SMILE',
    'TIGER', 'UNITY', 'VOICE', 'WITCH', 'YOUTH', 'BRAVE', 'CRISP', 'DRINK',
    'FRESH', 'GRASS', 'HORSE', 'JUICE', 'KOALA', 'LUNCH', 'MOVIE', 'NEVER',
    'PAINT', 'QUEST', 'ROUND', 'SWEET', 'TRUST', 'UNDER', 'VIVID', 'WORLD',
    'STORY', 'CLOWN', 'SPACE', 'GIANT', 'BREAD', 'CROWN', 'FLAME', 'GRAPE',
    'HOUSE', 'JEWEL', 'MOUSE', 'PEACE', 'QUEEN', 'SHARK', 'THUMB', 'WALTZ',
  ],
  hard: [
    // 7+ letter words (challenging!)
    'AWESOME', 'BALLOON', 'CAPTAIN', 'DIAMOND', 'ELEPHANT', 'FESTIVAL',
    'GIRAFFE', 'HARMONY', 'IMAGINE', 'JOURNEY', 'KINGDOM', 'LIBRARY',
    'MONSTER', 'NOTHING', 'OCTOPUS', 'PENGUIN', 'QUESTION', 'RAINBOW',
    'SUNSHINE', 'TREASURE', 'UMBRELLA', 'VACATION', 'WATERFALL', 'YOUTHFUL',
    'ADVENTURE', 'BUTTERFLY', 'CELEBRATE', 'DINOSAUR', 'EVERYONE', 'FANTASTIC',
    'GRATEFUL', 'HAMBURGER', 'IMPORTANT', 'JELLYFISH', 'KNOWLEDGE', 'LEMONADE',
    'MARVELOUS', 'NIGHTMARE', 'OPERATION', 'PINEAPPLE', 'QUESTIONS', 'RASPBERRY',
    'SNOWFLAKE', 'TRANSFORM', 'WONDERFUL', 'CHOCOLATE', 'CROCODILE', 'DANGEROUS',
  ],
}

// Difficulty settings
const DIFFICULTY_CONFIG = {
  easy: {
    label: '⭐ Easy',
    description: '3-4 letter words',
    baseSpeed: 0.3,
    spawnInterval: 3000,
    speedIncrease: 0.02,
    maxWords: 3,
  },
  medium: {
    label: '⭐⭐ Medium', 
    description: '5-6 letter words',
    baseSpeed: 0.4,
    spawnInterval: 2500,
    speedIncrease: 0.03,
    maxWords: 4,
  },
  hard: {
    label: '⭐⭐⭐ Hard',
    description: '7+ letter words',
    baseSpeed: 0.5,
    spawnInterval: 2000,
    speedIncrease: 0.04,
    maxWords: 5,
  },
}

// Sound effects using Web Audio API
const playSound = (type: 'type' | 'correct' | 'miss' | 'levelup' | 'gameover') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'type':
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'correct':
        osc.frequency.value = 523.25 // C5
        gain.gain.value = 0.2
        osc.start()
        setTimeout(() => { osc.frequency.value = 659.25 }, 80) // E5
        setTimeout(() => { osc.frequency.value = 783.99 }, 160) // G5
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'miss':
        osc.frequency.value = 150
        osc.type = 'sawtooth'
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'levelup':
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc2.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        osc.stop(0)
        break
      case 'gameover':
        osc.frequency.value = 300
        osc.type = 'sawtooth'
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.linearRampToValueAtTime(100, audio.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
        osc.stop(audio.currentTime + 0.5)
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

// Floating word component
const FloatingWord = ({
  word,
  typedPart,
  x,
  y,
  isActive,
}: {
  word: string
  typedPart: string
  x: number
  y: number
  isActive: boolean
}) => {
  return (
    <div
      className={`
        absolute px-4 py-2 rounded-xl font-bold text-xl md:text-2xl
        transition-all duration-100 select-none
        ${isActive 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-110 shadow-xl ring-4 ring-yellow-300' 
          : 'bg-white/90 text-gray-700 shadow-lg'
        }
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translateX(-50%)',
      }}
    >
      <span className={isActive ? 'text-green-300' : 'text-green-500'}>{typedPart}</span>
      <span>{word.slice(typedPart.length)}</span>
    </div>
  )
}

// Heart component for lives
const Hearts = ({ lives, maxLives }: { lives: number; maxLives: number }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLives }).map((_, i) => (
        <span
          key={i}
          className={`text-2xl transition-all ${
            i < lives ? 'animate-pulse scale-100' : 'grayscale scale-90 opacity-50'
          }`}
        >
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  )
}

// Main game component
export default function TypingGame() {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [wordsTyped, setWordsTyped] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  
  // Words state
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [activeWordId, setActiveWordId] = useState<number | null>(null)
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  
  // Refs
  const gameLoopRef = useRef<number | null>(null)
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wordIdCounter = useRef(0)
  const usedWords = useRef<Set<string>>(new Set())

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('typing-game-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Calculate WPM (words per minute)
  const calculateWPM = useCallback(() => {
    if (gameTime === 0) return 0
    // Standard: 5 characters = 1 word
    const minutes = gameTime / 60
    const wpm = Math.round((totalChars / 5) / minutes)
    return isFinite(wpm) ? wpm : 0
  }, [gameTime, totalChars])

  // Get a random word
  const getRandomWord = useCallback(() => {
    const wordList = WORDS[difficulty]
    const availableWords = wordList.filter(w => !usedWords.current.has(w))
    
    // Reset used words if we've used most of them
    if (availableWords.length < 5) {
      usedWords.current.clear()
      return wordList[Math.floor(Math.random() * wordList.length)]
    }
    
    const word = availableWords[Math.floor(Math.random() * availableWords.length)]
    usedWords.current.add(word)
    return word
  }, [difficulty])

  // Spawn a new word
  const spawnWord = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty]
    
    setFallingWords(prev => {
      if (prev.length >= config.maxWords) return prev
      
      const word = getRandomWord()
      const newWord: FallingWord = {
        id: wordIdCounter.current++,
        word,
        x: 10 + Math.random() * 80, // Random x position (10% - 90%)
        y: -5, // Start above screen
        speed: config.baseSpeed + (level - 1) * config.speedIncrease,
      }
      return [...prev, newWord]
    })
  }, [difficulty, level, getRandomWord])

  // Game loop - update word positions
  const gameLoop = useCallback(() => {
    setFallingWords(prev => {
      const updated = prev.map(w => ({
        ...w,
        y: w.y + w.speed,
      }))
      
      // Check for words that hit bottom
      const remaining: FallingWord[] = []
      let lostLife = false
      
      for (const w of updated) {
        if (w.y >= 90) {
          // Word hit bottom - lose a life
          lostLife = true
          if (soundEnabled) playSound('miss')
        } else {
          remaining.push(w)
        }
      }
      
      if (lostLife) {
        setLives(l => {
          const newLives = l - 1
          if (newLives <= 0) {
            setTimeout(() => endGame(), 100)
          }
          return newLives
        })
        setComboCount(0)
        setActiveWordId(null)
        setCurrentInput('')
      }
      
      return remaining
    })
    
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [soundEnabled])

  // Start the game
  const startGame = useCallback(() => {
    setGameState('playing')
    setScore(0)
    setLives(3)
    setLevel(1)
    setWordsTyped(0)
    setTotalChars(0)
    setGameTime(0)
    setFallingWords([])
    setCurrentInput('')
    setActiveWordId(null)
    setComboCount(0)
    usedWords.current.clear()
    wordIdCounter.current = 0
    
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    
    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)
    
    // Start spawning words
    const config = DIFFICULTY_CONFIG[difficulty]
    spawnWord()
    spawnTimerRef.current = setInterval(spawnWord, config.spawnInterval - (level - 1) * 100)
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameTime(t => t + 1)
    }, 1000)
  }, [difficulty, gameLoop, spawnWord])

  // End the game
  const endGame = useCallback(() => {
    setGameState('gameover')
    
    // Stop all timers
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    
    if (soundEnabled) playSound('gameover')
    
    // Save to leaderboard
    const wpm = calculateWPM()
    const newEntry: LeaderboardEntry = {
      score,
      wpm,
      difficulty,
      wordsTyped,
      date: new Date().toISOString(),
    }
    
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
    
    setLeaderboard(newLeaderboard)
    localStorage.setItem('typing-game-leaderboard', JSON.stringify(newLeaderboard))
    
    // Show confetti for good scores
    if (wordsTyped >= 10 || score >= 500) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [soundEnabled, score, difficulty, wordsTyped, leaderboard, calculateWPM])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
  }, [])

  // Level up check
  useEffect(() => {
    const wordsForLevel = level * 5
    if (wordsTyped >= wordsForLevel && wordsTyped > 0) {
      setLevel(l => l + 1)
      setShowLevelUp(true)
      if (soundEnabled) playSound('levelup')
      
      // Update spawn timer for faster words
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
        const config = DIFFICULTY_CONFIG[difficulty]
        const newInterval = Math.max(config.spawnInterval - level * 150, 1000)
        spawnTimerRef.current = setInterval(spawnWord, newInterval)
      }
      
      setTimeout(() => setShowLevelUp(false), 2000)
    }
  }, [wordsTyped, level, difficulty, soundEnabled, spawnWord])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase()
    setCurrentInput(input)
    
    if (soundEnabled && input.length > currentInput.length) {
      playSound('type')
    }
    
    if (!input) {
      setActiveWordId(null)
      return
    }
    
    // Find matching word
    const matchingWord = fallingWords.find(w => w.word.startsWith(input))
    
    if (matchingWord) {
      setActiveWordId(matchingWord.id)
      
      // Check if word is complete
      if (input === matchingWord.word) {
        // Word completed!
        const wordScore = matchingWord.word.length * 10 + Math.floor((90 - matchingWord.y) * 2)
        const comboBonus = comboCount * 5
        const finalScore = wordScore + comboBonus
        
        setScore(s => s + finalScore)
        setWordsTyped(w => w + 1)
        setTotalChars(c => c + matchingWord.word.length)
        setComboCount(c => c + 1)
        
        if (soundEnabled) playSound('correct')
        
        // Remove the word
        setFallingWords(prev => prev.filter(w => w.id !== matchingWord.id))
        setCurrentInput('')
        setActiveWordId(null)
      }
    } else {
      setActiveWordId(null)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-500 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        {/* Back button */}
        <Link
          href="/games/arcade/"
          className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Games
        </Link>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Title */}
        <div className="mt-16 mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
            ⌨️ Typing Race
          </h1>
          <p className="text-xl text-white/90">
            Type the falling words before they reach the bottom!
          </p>
        </div>

        {/* Difficulty selection */}
        <div className="w-full max-w-md mb-8">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Choose Difficulty:</h2>
          <div className="space-y-3">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`
                  w-full p-4 rounded-2xl font-bold transition-all
                  ${difficulty === diff 
                    ? 'bg-white text-blue-700 shadow-xl scale-105 ring-4 ring-yellow-300'
                    : 'bg-white/50 text-white hover:bg-white/70 hover:scale-102'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg">{DIFFICULTY_CONFIG[diff].label}</span>
                  <span className={`text-sm ${difficulty === diff ? 'text-blue-500' : 'text-white/80'}`}>
                    {DIFFICULTY_CONFIG[diff].description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="px-12 py-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-2xl rounded-full shadow-xl hover:scale-110 transition-all animate-bounce"
        >
          🚀 START GAME
        </button>

        {/* Leaderboard button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🏆 Leaderboard
        </button>

        {/* Instructions */}
        <div className="mt-8 bg-white/30 backdrop-blur rounded-2xl p-6 max-w-md">
          <h3 className="font-bold text-white text-lg mb-3">📖 How to Play:</h3>
          <ul className="text-white/90 space-y-2 text-sm">
            <li>• Words fall from the top of the screen</li>
            <li>• Type them before they reach the bottom!</li>
            <li>• You have 3 lives ❤️❤️❤️</li>
            <li>• Build combos for bonus points! 🔥</li>
            <li>• Speed increases as you level up 📈</li>
          </ul>
        </div>

        {/* Leaderboard modal */}
        {showLeaderboard && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLeaderboard(false)}
          >
            <div 
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-blue-700">🏆 High Scores</h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No scores yet! Play a game to set a record.
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <div className="font-bold text-blue-700">{entry.score.toLocaleString()} pts</div>
                          <div className="text-xs text-gray-500">
                            {entry.wordsTyped} words • {entry.wpm} WPM • {DIFFICULTY_CONFIG[entry.difficulty].label}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{formatDate(entry.date)}</div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setLeaderboard([])
                  localStorage.removeItem('typing-game-leaderboard')
                }}
                className="w-full mt-4 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-all"
              >
                🗑️ Clear Records
              </button>
            </div>
          </div>
        )}

        {/* Decorations */}
        <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">⌨️</div>
        <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>💫</div>
        <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>✨</div>
      </div>
    )
  }

  // Game over screen
  if (gameState === 'gameover') {
    const wpm = calculateWPM()
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-500 flex flex-col items-center justify-center p-4">
        <Confetti active={showConfetti} />
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {wordsTyped >= 20 ? '🏆' : wordsTyped >= 10 ? '🌟' : wordsTyped >= 5 ? '👍' : '💪'}
          </div>
          <h1 className="text-3xl font-black text-blue-700 mb-2">Game Over!</h1>
          
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4">
              <div className="text-4xl font-black text-blue-700">{score.toLocaleString()}</div>
              <div className="text-blue-500 font-bold">Score</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
              <div className="text-4xl font-black text-purple-700">{wpm}</div>
              <div className="text-purple-500 font-bold">WPM</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
              <div className="text-4xl font-black text-green-700">{wordsTyped}</div>
              <div className="text-green-500 font-bold">Words</div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4">
              <div className="text-4xl font-black text-orange-700">Lv.{level}</div>
              <div className="text-orange-500 font-bold">Level</div>
            </div>
          </div>
          
          <div className="text-gray-500 mb-6">
            Time: {formatTime(gameTime)} • {DIFFICULTY_CONFIG[difficulty].label}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="w-full py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playing screen
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-500 flex flex-col items-center p-4 relative overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <Confetti active={showConfetti} />
      
      {/* Level up notification */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-6 rounded-3xl font-black text-4xl shadow-2xl animate-bounce">
            🎉 LEVEL {level}! 🎉
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 z-10">
        <button
          onClick={() => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
            if (gameTimerRef.current) clearInterval(gameTimerRef.current)
            setGameState('menu')
          }}
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Exit
        </button>
        
        <Hearts lives={lives} maxLives={3} />
        
        <div className="flex gap-2">
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg">
            🏆 {score.toLocaleString()}
          </div>
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg">
            Lv.{level}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="w-full max-w-4xl flex justify-center gap-4 mb-4 z-10">
        <div className="bg-white/70 px-4 py-1 rounded-full font-bold text-blue-700 text-sm">
          ⏱️ {formatTime(gameTime)}
        </div>
        <div className="bg-white/70 px-4 py-1 rounded-full font-bold text-blue-700 text-sm">
          📝 {wordsTyped} words
        </div>
        <div className="bg-white/70 px-4 py-1 rounded-full font-bold text-blue-700 text-sm">
          ⚡ {calculateWPM()} WPM
        </div>
        {comboCount > 1 && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 px-4 py-1 rounded-full font-bold text-white text-sm animate-pulse">
            🔥 {comboCount}x Combo!
          </div>
        )}
      </div>

      {/* Game area */}
      <div className="w-full max-w-4xl h-[50vh] md:h-[60vh] bg-white/20 backdrop-blur rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Danger zone indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-500/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-16 left-0 right-0 border-t-2 border-dashed border-red-400/50" />
        
        {/* Falling words */}
        {fallingWords.map((word) => {
          const typedPart = activeWordId === word.id ? currentInput : ''
          return (
            <FloatingWord
              key={word.id}
              word={word.word}
              typedPart={typedPart}
              x={word.x}
              y={word.y}
              isActive={activeWordId === word.id}
            />
          )
        })}
        
        {/* Empty state */}
        {fallingWords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60 text-xl font-bold">Get ready...</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="w-full max-w-md mt-6 z-10">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          placeholder="Type here..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="w-full px-6 py-4 text-2xl font-bold text-center bg-white rounded-2xl shadow-xl border-4 border-blue-300 focus:border-yellow-400 outline-none transition-all placeholder-gray-300"
        />
        <p className="text-center text-white/80 mt-2 text-sm">
          Tap anywhere to focus • Just start typing!
        </p>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

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
      `}</style>
    </div>
  )
}
