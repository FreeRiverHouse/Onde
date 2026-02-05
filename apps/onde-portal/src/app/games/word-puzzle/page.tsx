'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Word categories with difficulty levels
const wordsByCategory: Record<string, { easy: string[], medium: string[], hard: string[] }> = {
  '🐾 Animals': {
    easy: ['CAT', 'DOG', 'FISH', 'BIRD', 'BEAR', 'FROG', 'DUCK', 'LION'],
    medium: ['HORSE', 'TIGER', 'SNAKE', 'MOUSE', 'SHEEP', 'ZEBRA', 'PANDA', 'KOALA'],
    hard: ['DOLPHIN', 'ELEPHANT', 'GIRAFFE', 'KANGAROO', 'PENGUIN', 'SQUIRREL', 'BUTTERFLY', 'HAMSTER']
  },
  '🍎 Food': {
    easy: ['CAKE', 'RICE', 'SOUP', 'MILK', 'CORN', 'PLUM', 'PEAR', 'LIME'],
    medium: ['BREAD', 'PIZZA', 'PASTA', 'SALAD', 'MANGO', 'GRAPE', 'LEMON', 'MELON'],
    hard: ['CHICKEN', 'SPAGHETTI', 'SANDWICH', 'PANCAKE', 'AVOCADO', 'BROCCOLI', 'MUSHROOM', 'BLUEBERRY']
  },
  '🎨 Colors': {
    easy: ['RED', 'BLUE', 'PINK', 'GOLD', 'GRAY', 'LIME', 'TEAL', 'CYAN'],
    medium: ['GREEN', 'WHITE', 'BLACK', 'BROWN', 'CORAL', 'PEACH', 'IVORY', 'BEIGE'],
    hard: ['PURPLE', 'ORANGE', 'YELLOW', 'SILVER', 'VIOLET', 'CRIMSON', 'MAGENTA', 'TURQUOISE']
  },
  '⚽ Sports': {
    easy: ['BALL', 'GOLF', 'SWIM', 'YOGA', 'KICK', 'JUMP', 'RACE', 'PLAY'],
    medium: ['TENNIS', 'SOCCER', 'BOXING', 'HOCKEY', 'RACING', 'SKIING', 'DIVING', 'HIKING'],
    hard: ['FOOTBALL', 'BASEBALL', 'BASKETBALL', 'SWIMMING', 'VOLLEYBALL', 'GYMNASTICS', 'WRESTLING', 'SURFING']
  },
  '🏠 Home': {
    easy: ['BED', 'DOOR', 'LAMP', 'SOFA', 'DESK', 'WALL', 'ROOF', 'BATH'],
    medium: ['TABLE', 'CHAIR', 'CLOCK', 'PLANT', 'GLASS', 'TOWEL', 'BRUSH', 'SHELF'],
    hard: ['KITCHEN', 'BEDROOM', 'BATHROOM', 'CURTAIN', 'BLANKET', 'BOOKCASE', 'COMPUTER', 'DOORBELL']
  },
  '🌍 Nature': {
    easy: ['TREE', 'LEAF', 'ROCK', 'SAND', 'RAIN', 'SNOW', 'STAR', 'MOON'],
    medium: ['RIVER', 'OCEAN', 'CLOUD', 'BEACH', 'GRASS', 'STORM', 'FLAME', 'FROST'],
    hard: ['MOUNTAIN', 'RAINBOW', 'VOLCANO', 'THUNDER', 'TORNADO', 'SUNSHINE', 'WATERFALL', 'SNOWFLAKE']
  }
}

// Difficulty settings
const difficultyConfig = {
  easy: { label: '⭐ Easy', minLetters: 3, maxLetters: 4, timeBonus: 10, hintPenalty: 5 },
  medium: { label: '⭐⭐ Medium', minLetters: 5, maxLetters: 6, timeBonus: 15, hintPenalty: 10 },
  hard: { label: '⭐⭐⭐ Hard', minLetters: 7, maxLetters: 10, timeBonus: 25, hintPenalty: 15 }
}

type Difficulty = 'easy' | 'medium' | 'hard'

// Helper functions
const getDateString = () => new Date().toISOString().split('T')[0]

const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

// Scramble word (ensure it's different from original)
const scrambleWord = (word: string): string => {
  const arr = word.split('')
  let scrambled = word
  let attempts = 0
  while (scrambled === word && attempts < 50) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    scrambled = arr.join('')
    attempts++
  }
  return scrambled
}

// Get seeded random for daily challenge
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getDailyWord = (): { word: string, category: string } => {
  const today = getDateString()
  const seed = parseInt(today.replace(/-/g, ''))
  const categories = Object.keys(wordsByCategory)
  const categoryIndex = Math.floor(seededRandom(seed) * categories.length)
  const category = categories[categoryIndex]
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
  const diffIndex = Math.floor(seededRandom(seed + 1) * 3)
  const words = wordsByCategory[category][difficulties[diffIndex]]
  const wordIndex = Math.floor(seededRandom(seed + 2) * words.length)
  return { word: words[wordIndex], category }
}

// Confetti component
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <span 
            className="text-2xl"
            style={{ 
              filter: `hue-rotate(${Math.random() * 360}deg)`,
              display: 'inline-block',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            {['🎉', '🎊', '⭐', '✨', '🌟', '💫', '🏆', '🎯'][Math.floor(Math.random() * 8)]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function WordPuzzle() {
  // Game state
  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'daily' | 'result'>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [category, setCategory] = useState<string>('')
  const [currentWord, setCurrentWord] = useState<string>('')
  const [scrambledWord, setScrambledWord] = useState<string>('')
  const [userInput, setUserInput] = useState<string[]>([])
  const [selectedLetters, setSelectedLetters] = useState<number[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
  
  // Hint state
  const [hints, setHints] = useState<number>(3)
  const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set())
  
  // Timer & Score
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [score, setScore] = useState<number>(0)
  const [totalScore, setTotalScore] = useState<number>(0)
  const [wordsCompleted, setWordsCompleted] = useState<number>(0)
  
  // Streak
  const [streak, setStreak] = useState<number>(0)
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(false)
  
  // UI state
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [shake, setShake] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved data
  useEffect(() => {
    const savedScore = localStorage.getItem('word-puzzle-total-score')
    if (savedScore) setTotalScore(parseInt(savedScore))
    
    const savedStreak = localStorage.getItem('word-puzzle-streak')
    const lastPlay = localStorage.getItem('word-puzzle-last-play')
    const today = getDateString()
    
    if (savedStreak && lastPlay) {
      const currentStreak = parseInt(savedStreak)
      if (lastPlay === today) {
        setStreak(currentStreak)
      } else if (areConsecutiveDays(lastPlay, today)) {
        setStreak(currentStreak)
      } else {
        setStreak(0)
      }
    }
    
    const dailyDate = localStorage.getItem('word-puzzle-daily-date')
    if (dailyDate === today) {
      setDailyCompleted(true)
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameMode === 'playing' || gameMode === 'daily') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameMode])

  // Check if word is complete
  useEffect(() => {
    if (userInput.length === currentWord.length && currentWord.length > 0) {
      const attempt = userInput.join('')
      if (attempt === currentWord) {
        handleCorrectWord()
      }
    }
  }, [userInput, currentWord])

  const startGame = (diff: Difficulty, cat: string) => {
    setDifficulty(diff)
    setCategory(cat)
    setScore(0)
    setWordsCompleted(0)
    setHints(3)
    setTimeLeft(60)
    setGameMode('playing')
    loadNewWord(diff, cat)
  }

  const startDailyChallenge = () => {
    if (dailyCompleted) return
    const { word, category: cat } = getDailyWord()
    setCategory(cat)
    setCurrentWord(word)
    const scrambled = scrambleWord(word)
    setScrambledWord(scrambled)
    setAvailableLetters(scrambled.split(''))
    setUserInput([])
    setSelectedLetters([])
    setRevealedPositions(new Set())
    setScore(0)
    setWordsCompleted(0)
    setHints(3)
    setTimeLeft(90)
    setGameMode('daily')
    setMessage('')
  }

  const loadNewWord = (diff: Difficulty, cat: string) => {
    const words = wordsByCategory[cat][diff]
    const word = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(word)
    const scrambled = scrambleWord(word)
    setScrambledWord(scrambled)
    setAvailableLetters(scrambled.split(''))
    setUserInput([])
    setSelectedLetters([])
    setRevealedPositions(new Set())
    setMessage('')
  }

  const handleCorrectWord = () => {
    // Calculate score based on time and difficulty
    const config = difficultyConfig[difficulty]
    const wordScore = currentWord.length * 10 + config.timeBonus + Math.floor(timeLeft / 2)
    setScore((prev) => prev + wordScore)
    setWordsCompleted((prev) => prev + 1)
    
    // Celebration
    setShowConfetti(true)
    setMessage(`🎉 +${wordScore} points!`)
    
    // Play success sound
    try {
      const audio = new AudioContext()
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.connect(gain)
      gain.connect(audio.destination)
      osc.type = 'sine'
      osc.frequency.value = 523.25 // C5
      gain.gain.value = 0.3
      osc.start()
      setTimeout(() => {
        osc.frequency.value = 659.25 // E5
      }, 100)
      setTimeout(() => {
        osc.frequency.value = 783.99 // G5
      }, 200)
      gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
      osc.stop(audio.currentTime + 0.4)
    } catch (e) {
      // Audio not supported
    }
    
    setTimeout(() => {
      setShowConfetti(false)
      if (gameMode === 'daily') {
        completeDailyChallenge()
      } else {
        // Add bonus time
        setTimeLeft((prev) => Math.min(prev + 10, 90))
        loadNewWord(difficulty, category)
      }
    }, 1500)
  }

  const completeDailyChallenge = () => {
    const today = getDateString()
    const lastPlay = localStorage.getItem('word-puzzle-last-play')
    
    let newStreak = 1
    if (lastPlay && areConsecutiveDays(lastPlay, today)) {
      newStreak = streak + 1
    } else if (lastPlay === today) {
      newStreak = streak
    }
    
    setStreak(newStreak)
    localStorage.setItem('word-puzzle-streak', newStreak.toString())
    localStorage.setItem('word-puzzle-last-play', today)
    localStorage.setItem('word-puzzle-daily-date', today)
    setDailyCompleted(true)
    
    endGame()
  }

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    const newTotal = totalScore + score
    setTotalScore(newTotal)
    localStorage.setItem('word-puzzle-total-score', newTotal.toString())
    
    setGameMode('result')
  }

  const selectLetter = (index: number) => {
    if (selectedLetters.includes(index)) return
    if (userInput.length >= currentWord.length) return
    
    // Check if position is revealed by hint
    const nextPosition = userInput.length
    if (revealedPositions.has(nextPosition)) {
      // Must use the correct letter for revealed position
      if (availableLetters[index] !== currentWord[nextPosition]) {
        setShake(true)
        setTimeout(() => setShake(false), 300)
        return
      }
    }
    
    setSelectedLetters([...selectedLetters, index])
    setUserInput([...userInput, availableLetters[index]])
  }

  const removeLetter = (position: number) => {
    // Can't remove revealed letters
    if (revealedPositions.has(position)) return
    
    const letterToRemove = userInput[position]
    const indexInSelected = selectedLetters.findIndex(
      (selIdx) => availableLetters[selIdx] === letterToRemove && 
        selectedLetters.slice(0, selectedLetters.indexOf(selIdx) + 1)
          .filter(si => availableLetters[si] === letterToRemove).length === 
        userInput.slice(0, position + 1)
          .filter(l => l === letterToRemove).length
    )
    
    if (indexInSelected !== -1) {
      // Remove all letters from that position onwards
      const newUserInput = userInput.slice(0, position)
      const newSelected = selectedLetters.slice(0, position)
      setUserInput(newUserInput)
      setSelectedLetters(newSelected)
    }
  }

  const useHint = () => {
    if (hints <= 0) return
    if (revealedPositions.size >= currentWord.length) return
    
    // Find first unrevealed position
    let positionToReveal = -1
    for (let i = 0; i < currentWord.length; i++) {
      if (!revealedPositions.has(i)) {
        positionToReveal = i
        break
      }
    }
    
    if (positionToReveal === -1) return
    
    // Clear input from that position onwards
    const newUserInput = userInput.slice(0, positionToReveal)
    const newSelected = selectedLetters.slice(0, positionToReveal)
    
    // Find the correct letter in available letters
    const correctLetter = currentWord[positionToReveal]
    const letterIndex = availableLetters.findIndex(
      (letter, idx) => letter === correctLetter && !newSelected.includes(idx)
    )
    
    if (letterIndex !== -1) {
      newSelected.push(letterIndex)
      newUserInput.push(correctLetter)
    }
    
    setUserInput(newUserInput)
    setSelectedLetters(newSelected)
    setRevealedPositions(new Set([...revealedPositions, positionToReveal]))
    setHints(hints - 1)
    
    // Deduct score
    const penalty = difficultyConfig[difficulty].hintPenalty
    setScore((prev) => Math.max(0, prev - penalty))
  }

  const skipWord = () => {
    if (gameMode === 'daily') return
    setScore((prev) => Math.max(0, prev - 20))
    loadNewWord(difficulty, category)
  }

  const shuffleLetters = useCallback(() => {
    // Reshuffle available letters (maintaining selected state)
    const unselected = availableLetters
      .map((letter, idx) => ({ letter, idx }))
      .filter(({ idx }) => !selectedLetters.includes(idx))
    
    // Fisher-Yates shuffle
    for (let i = unselected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[unselected[i], unselected[j]] = [unselected[j], unselected[i]]
    }
    
    const newAvailable = [...availableLetters]
    let unselectedIdx = 0
    for (let i = 0; i < newAvailable.length; i++) {
      if (!selectedLetters.includes(i)) {
        newAvailable[i] = unselected[unselectedIdx].letter
        unselectedIdx++
      }
    }
    
    setAvailableLetters(newAvailable)
  }, [availableLetters, selectedLetters])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        <Link href="/games/arcade/" className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all">
          ← Games
        </Link>

        {/* Stats */}
        <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end">
          {streak > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full font-bold text-white shadow-lg">
              🔥 {streak} day streak!
            </div>
          )}
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
            🏆 {totalScore.toLocaleString()}
          </div>
        </div>

        {/* Title */}
        <div className="mt-16 mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
            🔤 Word Puzzle
          </h1>
          <p className="text-xl text-white/90">
            Unscramble the letters!
          </p>
        </div>

        {/* Daily Challenge */}
        <button
          onClick={startDailyChallenge}
          disabled={dailyCompleted}
          className={`
            w-full max-w-md mb-8 p-6 rounded-2xl shadow-xl font-bold text-xl
            transition-all transform
            ${dailyCompleted 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105 hover:shadow-2xl animate-pulse'
            }
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <div>Daily Challenge</div>
              <div className="text-sm opacity-80">
                {dailyCompleted ? '✅ Completed today!' : 'New word available!'}
              </div>
            </div>
          </div>
        </button>

        {/* Difficulty Selection */}
        <div className="w-full max-w-md mb-6">
          <h2 className="text-xl font-bold text-white mb-3 text-center">Choose Difficulty:</h2>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`
                  p-4 rounded-xl font-bold transition-all
                  ${difficulty === diff 
                    ? 'bg-white text-purple-700 shadow-lg scale-105'
                    : 'bg-white/50 text-white hover:bg-white/70'
                  }
                `}
              >
                {difficultyConfig[diff].label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-3 text-center">Choose Category:</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(wordsByCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => startGame(difficulty, cat)}
                className="
                  p-4 rounded-xl font-bold text-lg
                  bg-white/90 text-purple-700
                  hover:scale-105 hover:shadow-xl
                  transition-all
                "
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/30 backdrop-blur rounded-2xl p-6 max-w-md">
          <h3 className="font-bold text-white text-lg mb-2">How to Play:</h3>
          <ul className="text-white/90 text-sm space-y-1">
            <li>• Tap scrambled letters to form the word</li>
            <li>• Use hints if you&apos;re stuck (reveals one letter)</li>
            <li>• Complete words before time runs out</li>
            <li>• Play the daily challenge to build your streak!</li>
          </ul>
        </div>
      </div>
    )
  }

  // Result Screen
  if (gameMode === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-4">
        <Confetti show={true} />
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <h1 className="text-4xl font-black text-purple-700 mb-2">
            {wordsCompleted > 0 ? '🎉 Great Job!' : '⏰ Time\'s Up!'}
          </h1>
          
          <div className="my-8 space-y-4">
            <div className="bg-purple-100 rounded-2xl p-4">
              <div className="text-5xl font-black text-purple-700">{score.toLocaleString()}</div>
              <div className="text-purple-500 font-bold">Points This Round</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 rounded-xl p-3">
                <div className="text-2xl font-bold text-blue-700">{wordsCompleted}</div>
                <div className="text-blue-500 text-sm">Words Solved</div>
              </div>
              <div className="bg-orange-100 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-700">{streak}</div>
                <div className="text-orange-500 text-sm">Day Streak 🔥</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-700">{totalScore.toLocaleString()}</div>
              <div className="text-orange-500 text-sm">Total Score 🏆</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setGameMode('menu')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🎮 Play Again
            </button>
            <Link
              href="/games/arcade/"
              className="block w-full py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center p-4">
      <Confetti show={showConfetti} />
      
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current)
            setGameMode('menu')
          }}
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Exit
        </button>
        
        <div className="flex gap-2">
          <div className={`
            px-4 py-2 rounded-full font-bold shadow-lg
            ${timeLeft <= 10 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-white/90 text-purple-700'
            }
          `}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
            🏆 {score}
          </div>
        </div>
      </div>

      {/* Category & Difficulty */}
      <div className="bg-white/80 rounded-full px-6 py-2 mb-4 font-bold text-purple-700 shadow-lg">
        {gameMode === 'daily' ? '📅 Daily Challenge' : category} • {difficultyConfig[difficulty].label}
      </div>

      {/* Message */}
      {message && (
        <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold mb-4 animate-bounce shadow-lg">
          {message}
        </div>
      )}

      {/* Word Length Indicator */}
      <div className="text-white/80 mb-2 font-bold">
        {currentWord.length} letters
      </div>

      {/* Answer Slots */}
      <div 
        className={`
          flex gap-2 mb-8 justify-center flex-wrap
          ${shake ? 'animate-shake' : ''}
        `}
      >
        {Array.from({ length: currentWord.length }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => removeLetter(idx)}
            disabled={revealedPositions.has(idx)}
            className={`
              w-12 h-14 md:w-14 md:h-16 rounded-xl font-black text-2xl md:text-3xl
              shadow-lg transition-all border-3
              ${userInput[idx] 
                ? revealedPositions.has(idx)
                  ? 'bg-green-400 text-white border-green-500 cursor-not-allowed'
                  : 'bg-white text-purple-700 border-purple-300 hover:scale-110'
                : 'bg-white/50 border-white/50'
              }
            `}
          >
            {userInput[idx] || ''}
          </button>
        ))}
      </div>

      {/* Scrambled Letters */}
      <div className="flex gap-2 mb-8 justify-center flex-wrap max-w-md">
        {availableLetters.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => selectLetter(idx)}
            disabled={selectedLetters.includes(idx)}
            className={`
              w-12 h-14 md:w-14 md:h-16 rounded-xl font-black text-2xl md:text-3xl
              shadow-lg transition-all transform
              ${selectedLetters.includes(idx)
                ? 'bg-gray-300 text-gray-400 scale-90 opacity-50'
                : 'bg-gradient-to-b from-yellow-400 to-orange-500 text-white hover:scale-110 hover:-translate-y-1'
              }
            `}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={useHint}
          disabled={hints <= 0}
          className={`
            px-6 py-3 rounded-full font-bold shadow-lg transition-all
            ${hints > 0 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          💡 Hint ({hints})
        </button>
        
        <button
          onClick={shuffleLetters}
          className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg hover:scale-105 transition-all"
        >
          🔀 Shuffle
        </button>
        
        {gameMode !== 'daily' && (
          <button
            onClick={skipWord}
            className="px-6 py-3 rounded-full font-bold bg-white/80 text-purple-700 shadow-lg hover:scale-105 transition-all"
          >
            ⏭️ Skip (-20)
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="mt-8 text-white/80 font-bold">
        Words completed: {wordsCompleted}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        :global(.animate-confetti) {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
