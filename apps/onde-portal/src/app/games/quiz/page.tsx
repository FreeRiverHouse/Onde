'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface Question {
  id: number
  category: Category
  question: string
  options: string[]
  correct: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface LeaderboardEntry {
  name: string
  score: number
  date: string
  combo: number
}

type Category = 'books' | 'science' | 'geography' | 'animals'
type GameState = 'menu' | 'playing' | 'results'

// Quiz sounds using Web Audio API
function useQuizSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Correct answer - happy ascending tone
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
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.2)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Wrong answer - descending sad tone
  const playWrong = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Tick sound for timer
  const playTick = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Timer warning sound
  const playWarning = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Combo sound - exciting ascending
  const playCombo = useCallback((level: number) => {
    try {
      const ctx = getAudioContext()
      const baseFreq = 400 + level * 50
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'triangle'
        osc.frequency.value = baseFreq + i * 100
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15)
        osc.start(ctx.currentTime + i * 0.05)
        osc.stop(ctx.currentTime + i * 0.05 + 0.15)
      }
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Game over fanfare
  const playGameOver = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.4)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  return { playCorrect, playWrong, playTick, playWarning, playCombo, playGameOver }
}

// Question bank
const questionBank: Question[] = [
  // Books category
  { id: 1, category: 'books', question: 'Who wrote "Harry Potter"?', options: ['J.K. Rowling', 'Roald Dahl', 'C.S. Lewis', 'J.R.R. Tolkien'], correct: 0, difficulty: 'easy' },
  { id: 2, category: 'books', question: 'What animal is Charlotte in "Charlotte\'s Web"?', options: ['Pig', 'Spider', 'Rat', 'Mouse'], correct: 1, difficulty: 'easy' },
  { id: 3, category: 'books', question: 'Who wrote "The Cat in the Hat"?', options: ['Dr. Seuss', 'Roald Dahl', 'Eric Carle', 'Maurice Sendak'], correct: 0, difficulty: 'easy' },
  { id: 4, category: 'books', question: 'In "The Lion, the Witch and the Wardrobe", which country do the children find?', options: ['Wonderland', 'Narnia', 'Hogwarts', 'Neverland'], correct: 1, difficulty: 'medium' },
  { id: 5, category: 'books', question: 'What color is the fish in "One Fish Two Fish Red Fish Blue Fish"?', options: ['Green and Yellow', 'Red and Blue', 'Purple and Orange', 'Pink and White'], correct: 1, difficulty: 'easy' },
  { id: 6, category: 'books', question: 'Who is Winnie the Pooh\'s best friend?', options: ['Tigger', 'Piglet', 'Eeyore', 'Rabbit'], correct: 1, difficulty: 'easy' },
  { id: 7, category: 'books', question: 'In "Alice in Wonderland", what does Alice follow down the hole?', options: ['A Cat', 'A Rabbit', 'A Mouse', 'A Bird'], correct: 1, difficulty: 'easy' },
  { id: 8, category: 'books', question: 'What kind of creature is Shrek?', options: ['Troll', 'Giant', 'Ogre', 'Goblin'], correct: 2, difficulty: 'easy' },
  { id: 9, category: 'books', question: 'Who wrote "Matilda"?', options: ['J.K. Rowling', 'Roald Dahl', 'Dr. Seuss', 'Enid Blyton'], correct: 1, difficulty: 'medium' },
  { id: 10, category: 'books', question: 'What does the Very Hungry Caterpillar turn into?', options: ['A Bird', 'A Butterfly', 'A Moth', 'A Bee'], correct: 1, difficulty: 'easy' },
  { id: 11, category: 'books', question: 'In "Peter Pan", what is the name of the fairy?', options: ['Tinker Bell', 'Fairy Queen', 'Pixie', 'Sparkle'], correct: 0, difficulty: 'easy' },
  { id: 12, category: 'books', question: 'Who lives in the Hundred Acre Wood?', options: ['Peter Rabbit', 'Winnie the Pooh', 'Paddington Bear', 'Babar'], correct: 1, difficulty: 'medium' },

  // Science category
  { id: 13, category: 'science', question: 'What planet is known as the "Red Planet"?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, difficulty: 'easy' },
  { id: 14, category: 'science', question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correct: 1, difficulty: 'easy' },
  { id: 15, category: 'science', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'], correct: 2, difficulty: 'medium' },
  { id: 16, category: 'science', question: 'What do plants need to make food?', options: ['Darkness', 'Sunlight', 'Cold', 'Wind'], correct: 1, difficulty: 'easy' },
  { id: 17, category: 'science', question: 'What is the center of an atom called?', options: ['Electron', 'Proton', 'Nucleus', 'Neutron'], correct: 2, difficulty: 'hard' },
  { id: 18, category: 'science', question: 'What gas do humans breathe out?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, difficulty: 'medium' },
  { id: 19, category: 'science', question: 'What force keeps us on the ground?', options: ['Magnetism', 'Gravity', 'Friction', 'Electricity'], correct: 1, difficulty: 'easy' },
  { id: 20, category: 'science', question: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], correct: 1, difficulty: 'easy' },
  { id: 21, category: 'science', question: 'What is the closest star to Earth?', options: ['North Star', 'The Sun', 'Alpha Centauri', 'Sirius'], correct: 1, difficulty: 'medium' },
  { id: 22, category: 'science', question: 'What is water made of?', options: ['Oxygen only', 'Hydrogen only', 'Hydrogen and Oxygen', 'Carbon and Oxygen'], correct: 2, difficulty: 'medium' },
  { id: 23, category: 'science', question: 'What do you call a baby frog?', options: ['Calf', 'Tadpole', 'Fry', 'Pup'], correct: 1, difficulty: 'easy' },
  { id: 24, category: 'science', question: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Silver'], correct: 2, difficulty: 'medium' },

  // Geography category
  { id: 25, category: 'geography', question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, difficulty: 'easy' },
  { id: 26, category: 'geography', question: 'Which continent is Egypt in?', options: ['Asia', 'Europe', 'Africa', 'Australia'], correct: 2, difficulty: 'medium' },
  { id: 27, category: 'geography', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Madrid', 'Paris'], correct: 3, difficulty: 'easy' },
  { id: 28, category: 'geography', question: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], correct: 1, difficulty: 'medium' },
  { id: 29, category: 'geography', question: 'Which country has the most people?', options: ['USA', 'India', 'China', 'Russia'], correct: 1, difficulty: 'medium' },
  { id: 30, category: 'geography', question: 'What ocean is between America and Europe?', options: ['Pacific', 'Indian', 'Arctic', 'Atlantic'], correct: 3, difficulty: 'easy' },
  { id: 31, category: 'geography', question: 'What is the smallest continent?', options: ['Europe', 'Antarctica', 'Australia', 'South America'], correct: 2, difficulty: 'medium' },
  { id: 32, category: 'geography', question: 'In which country is the Eiffel Tower?', options: ['Italy', 'Spain', 'France', 'Germany'], correct: 2, difficulty: 'easy' },
  { id: 33, category: 'geography', question: 'What is the capital of Italy?', options: ['Venice', 'Milan', 'Rome', 'Naples'], correct: 2, difficulty: 'easy' },
  { id: 34, category: 'geography', question: 'Which country looks like a boot?', options: ['Spain', 'France', 'Italy', 'Greece'], correct: 2, difficulty: 'easy' },
  { id: 35, category: 'geography', question: 'What is the largest desert in the world?', options: ['Sahara', 'Gobi', 'Antarctic', 'Arabian'], correct: 2, difficulty: 'hard' },
  { id: 36, category: 'geography', question: 'What continent is Brazil in?', options: ['Africa', 'North America', 'South America', 'Europe'], correct: 2, difficulty: 'easy' },

  // Animals category
  { id: 37, category: 'animals', question: 'What is the largest animal on Earth?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Shark'], correct: 1, difficulty: 'easy' },
  { id: 38, category: 'animals', question: 'What animal is known as the "King of the Jungle"?', options: ['Tiger', 'Elephant', 'Lion', 'Bear'], correct: 2, difficulty: 'easy' },
  { id: 39, category: 'animals', question: 'How many legs does an octopus have?', options: ['6', '8', '10', '12'], correct: 1, difficulty: 'easy' },
  { id: 40, category: 'animals', question: 'What is a group of wolves called?', options: ['Herd', 'Flock', 'Pack', 'School'], correct: 2, difficulty: 'medium' },
  { id: 41, category: 'animals', question: 'What animal has black and white stripes?', options: ['Giraffe', 'Zebra', 'Cheetah', 'Leopard'], correct: 1, difficulty: 'easy' },
  { id: 42, category: 'animals', question: 'What do pandas mostly eat?', options: ['Fish', 'Meat', 'Bamboo', 'Berries'], correct: 2, difficulty: 'easy' },
  { id: 43, category: 'animals', question: 'What animal can change its color?', options: ['Frog', 'Chameleon', 'Snake', 'Lizard'], correct: 1, difficulty: 'easy' },
  { id: 44, category: 'animals', question: 'How many humps does a dromedary camel have?', options: ['0', '1', '2', '3'], correct: 1, difficulty: 'hard' },
  { id: 45, category: 'animals', question: 'What is the fastest land animal?', options: ['Lion', 'Horse', 'Cheetah', 'Gazelle'], correct: 2, difficulty: 'medium' },
  { id: 46, category: 'animals', question: 'What animal is Dumbo?', options: ['Giraffe', 'Elephant', 'Hippo', 'Rhino'], correct: 1, difficulty: 'easy' },
  { id: 47, category: 'animals', question: 'What do butterflies start life as?', options: ['Eggs', 'Caterpillars', 'Pupae', 'Worms'], correct: 0, difficulty: 'medium' },
  { id: 48, category: 'animals', question: 'What animal has the longest neck?', options: ['Elephant', 'Camel', 'Giraffe', 'Horse'], correct: 2, difficulty: 'easy' },
]

// Category config
const categoryConfig: Record<Category, { emoji: string, color: string, bgGradient: string, name: string }> = {
  books: { emoji: '📚', color: 'text-purple-500', bgGradient: 'from-purple-500 to-purple-700', name: 'Books' },
  science: { emoji: '🔬', color: 'text-blue-500', bgGradient: 'from-blue-500 to-blue-700', name: 'Science' },
  geography: { emoji: '🌍', color: 'text-green-500', bgGradient: 'from-green-500 to-green-700', name: 'Geography' },
  animals: { emoji: '🦁', color: 'text-orange-500', bgGradient: 'from-orange-500 to-orange-700', name: 'Animals' },
}

// Confetti component
function Confetti({ count = 50 }: { count?: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-3 h-3 rotate-45"
            style={{
              backgroundColor: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#9b5de5', '#f15bb5'][i % 9],
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Timer ring component
function TimerRing({ timeLeft, maxTime }: { timeLeft: number, maxTime: number }) {
  const percentage = (timeLeft / maxTime) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const isWarning = timeLeft <= 5

  return (
    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${isWarning ? 'text-red-500' : 'text-blue-500'}`}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-3xl font-black ${isWarning ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
        {timeLeft}
      </div>
    </div>
  )
}

// Combo display
function ComboDisplay({ combo, show }: { combo: number, show: boolean }) {
  if (!show || combo < 2) return null

  return (
    <div className="absolute top-4 right-4 animate-bounce-in">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-black text-lg shadow-lg animate-pulse">
        🔥 {combo}x COMBO!
      </div>
    </div>
  )
}

export default function QuizGame() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['books', 'science', 'geography', 'animals'])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCombo, setShowCombo] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { playCorrect, playWrong, playTick, playWarning, playCombo, playGameOver } = useQuizSounds()

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quiz-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch { /* Invalid data */ }
    }
    const savedName = localStorage.getItem('quiz-player-name')
    if (savedName) setPlayerName(savedName)
  }, [])

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing' || showResult) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1) // Time's up, auto-wrong
          return 15
        }
        if (prev <= 6 && prev > 1 && soundEnabled) {
          playWarning()
        } else if (soundEnabled) {
          playTick()
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, showResult, currentQuestionIndex])

  // Toggle category selection
  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        if (prev.length === 1) return prev // Must have at least one
        return prev.filter(c => c !== category)
      }
      return [...prev, category]
    })
  }

  // Start game
  const startGame = () => {
    // Get questions from selected categories
    const filtered = questionBank.filter(q => selectedCategories.includes(q.category))
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)
    
    setQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setCorrectAnswers(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowResult(false)
    setGameState('playing')
  }

  // Handle answer selection
  const handleAnswer = useCallback((answerIndex: number) => {
    if (showResult) return

    if (timerRef.current) clearInterval(timerRef.current)
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = answerIndex === currentQuestion?.correct

    if (isCorrect) {
      if (soundEnabled) playCorrect()
      
      // Calculate score with combo multiplier
      const basePoints = 100
      const timeBonus = Math.floor(timeLeft * 5)
      const comboMultiplier = 1 + (combo * 0.25)
      const points = Math.floor((basePoints + timeBonus) * comboMultiplier)
      
      setScore(prev => prev + points)
      setCombo(prev => {
        const newCombo = prev + 1
        if (newCombo > maxCombo) setMaxCombo(newCombo)
        if (newCombo >= 2 && soundEnabled) playCombo(newCombo)
        return newCombo
      })
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 1500)
      setCorrectAnswers(prev => prev + 1)
    } else {
      if (soundEnabled) playWrong()
      setCombo(0)
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(15)
      } else {
        // Game over
        if (soundEnabled) playGameOver()
        setGameState('results')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
        setShowNameInput(true)
      }
    }, 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, questions, currentQuestionIndex, timeLeft, combo, maxCombo, soundEnabled])

  // Save score to leaderboard
  const saveScore = () => {
    if (!playerName.trim()) return

    localStorage.setItem('quiz-player-name', playerName)
    
    const entry: LeaderboardEntry = {
      name: playerName.trim().substring(0, 10).toUpperCase(),
      score,
      date: new Date().toISOString(),
      combo: maxCombo,
    }

    const newLeaderboard = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setLeaderboard(newLeaderboard)
    localStorage.setItem('quiz-leaderboard', JSON.stringify(newLeaderboard))
    setShowNameInput(false)
  }

  // Share score
  const shareScore = async () => {
    const text = `🧠 Quiz Challenge!\n\n🏆 Score: ${score.toLocaleString()}\n✅ ${correctAnswers}/10 correct\n🔥 Max combo: ${maxCombo}x\n\nPlay at onde.la/games/quiz`
    
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch { /* User cancelled */ }
    }
    
    try {
      await navigator.clipboard.writeText(text)
      alert('Score copied to clipboard!')
    } catch { /* Failed */ }
  }

  // Render menu
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2 animate-pulse">
          QUIZ TIME!
        </h1>
        <p className="text-xl text-gray-600">Test your knowledge! 🧠</p>
      </div>

      {/* Category selection */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(categoryConfig) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`
                p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105
                ${selectedCategories.includes(cat)
                  ? `bg-gradient-to-r ${categoryConfig[cat].bgGradient} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-2xl block mb-1">{categoryConfig[cat].emoji}</span>
              {categoryConfig[cat].name}
            </button>
          ))}
        </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="mb-6 px-4 py-2 bg-gray-100 rounded-full text-gray-600 font-medium hover:bg-gray-200 transition-all"
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      {/* Start button */}
      <button
        onClick={startGame}
        className="px-12 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-2xl rounded-full shadow-xl hover:scale-110 transition-all animate-bounce"
      >
        START QUIZ! 🚀
      </button>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="mt-10 bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🏆 High Scores</h2>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  i === 0 ? 'bg-yellow-100' : i === 1 ? 'bg-gray-100' : i === 2 ? 'bg-orange-100' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                  <span className="font-bold">{entry.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">{entry.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">🔥 {entry.combo}x combo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Render playing
  const renderPlaying = () => {
    const question = questions[currentQuestionIndex]
    if (!question) return null

    return (
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setGameState('menu')}
            className="bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow hover:scale-105 transition-all"
          >
            ✕ Quit
          </button>
          <div className="text-center">
            <div className="text-sm text-gray-500">Question</div>
            <div className="font-black text-xl">{currentQuestionIndex + 1}/{questions.length}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Score</div>
            <div className="font-black text-xl text-purple-600">{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <TimerRing timeLeft={timeLeft} maxTime={15} />
        </div>

        {/* Category badge */}
        <div className="flex justify-center mb-4">
          <span className={`px-4 py-1 rounded-full text-white font-bold bg-gradient-to-r ${categoryConfig[question.category].bgGradient}`}>
            {categoryConfig[question.category].emoji} {categoryConfig[question.category].name}
          </span>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex-grow max-w-2xl mx-auto w-full">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
          {question.options.map((option, i) => {
            let bgClass = 'bg-white hover:bg-gray-50 border-2 border-gray-200'
            
            if (showResult) {
              if (i === question.correct) {
                bgClass = 'bg-green-500 text-white border-2 border-green-600 animate-correct'
              } else if (i === selectedAnswer && i !== question.correct) {
                bgClass = 'bg-red-500 text-white border-2 border-red-600 animate-wrong'
              } else {
                bgClass = 'bg-gray-100 border-2 border-gray-200 opacity-50'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                className={`
                  p-4 rounded-xl font-bold text-lg transition-all transform
                  ${!showResult && 'hover:scale-105 hover:shadow-lg'}
                  ${bgClass}
                `}
              >
                <span className="mr-2 opacity-60">{['A', 'B', 'C', 'D'][i]}.</span>
                {option}
              </button>
            )
          })}
        </div>

        {/* Combo indicator */}
        {combo >= 2 && (
          <div className="text-center mt-4">
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-black animate-pulse">
              🔥 {combo}x Combo!
            </span>
          </div>
        )}

        <ComboDisplay combo={combo} show={showCombo} />
      </div>
    )
  }

  // Render results
  const renderResults = () => (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      {showConfetti && <Confetti count={100} />}
      
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
          {correctAnswers >= 8 ? '🎉 AMAZING!' : correctAnswers >= 5 ? '👏 GREAT JOB!' : '💪 NICE TRY!'}
        </h1>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
            {score.toLocaleString()}
          </div>
          <div className="text-gray-500 mb-6">POINTS</div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-1">✅</div>
              <div className="font-black text-xl">{correctAnswers}/10</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-black text-xl">{maxCombo}x</div>
              <div className="text-xs text-gray-500">Max Combo</div>
            </div>
            <div>
              <div className="text-3xl mb-1">⭐</div>
              <div className="font-black text-xl">{Math.floor(correctAnswers * 10)}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Name input for leaderboard */}
      {showNameInput && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 max-w-md w-full">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Save Your Score!</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              placeholder="YOUR NAME"
              maxLength={10}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-center uppercase focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={saveScore}
              disabled={!playerName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              SAVE
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={shareScore}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
        >
          📤 Share Score
        </button>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🔄 Play Again
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="px-8 py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🏠 Menu
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['❓', '💡', '🧠', '⭐', '🎯', '📚', '🔬', '🌍', '🦁'].map((emoji, i) => (
          <div
            key={i}
            className="absolute animate-float-slow opacity-30"
            style={{
              left: `${(i * 11) % 100}%`,
              top: `${(i * 17) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              fontSize: '2rem',
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Back link */}
      <Link
        href="/games"
        className="absolute top-4 left-4 z-20 bg-white/80 px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all backdrop-blur-sm"
      >
        ← Games
      </Link>

      {/* Main content */}
      <div className="relative z-10">
        {gameState === 'menu' && renderMenu()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'results' && renderResults()}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes correct {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes wrong {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
        .animate-correct {
          animation: correct 0.3s ease-in-out;
        }
        .animate-wrong {
          animation: wrong 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
