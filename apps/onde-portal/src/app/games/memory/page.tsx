'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

interface LeaderboardEntry {
  time: number
  moves: number
  difficulty: Difficulty
  date: string
}

type Difficulty = '4x4' | '6x6'

// Emoji sets for different themes
const EMOJI_SETS = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐔', '🐧'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭', '🍔', '🍕', '🌮', '🍦', '🧁'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌵', '🌲', '🍀', '🍁', '🌈', '⭐', '🌙', '☀️', '🔥', '💧', '❄️', '⚡', '🌊'],
  travel: ['🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸', '🚁', '⛵', '🚂', '🚲', '🛴', '🏍️', '🛶'],
}

// Sound effects using Web Audio API
const playSound = (type: 'flip' | 'match' | 'nomatch' | 'win') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'flip':
        osc.frequency.value = 600
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.08)
        osc.stop(audio.currentTime + 0.08)
        break
      case 'match':
        osc.frequency.value = 523.25 // C5
        gain.gain.value = 0.2
        osc.start()
        setTimeout(() => {
          osc.frequency.value = 659.25 // E5
        }, 100)
        setTimeout(() => {
          osc.frequency.value = 783.99 // G5
        }, 200)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
      case 'nomatch':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'win':
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.2
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 150)
        })
        osc.stop(0) // Don't play the original
        break
    }
  } catch {
    // Audio not supported, ignore
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea']
  const confetti = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : ''}`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Card component with flip animation
const MemoryCard = ({
  card,
  onClick,
  disabled,
  size,
}: {
  card: Card
  onClick: () => void
  disabled: boolean
  size: 'small' | 'large'
}) => {
  const cardSize = size === 'large' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12 md:w-14 md:h-14'
  const emojiSize = size === 'large' ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'

  return (
    <button
      onClick={onClick}
      disabled={disabled || card.isFlipped || card.isMatched}
      className={`
        ${cardSize} relative cursor-pointer transition-transform duration-200
        ${!card.isFlipped && !card.isMatched && !disabled ? 'hover:scale-105 hover:-rotate-2' : ''}
        ${card.isMatched ? 'opacity-70' : ''}
      `}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-500
          ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Back of card */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl shadow-lg flex items-center justify-center border-4 border-white/30"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-white text-2xl font-black">?</span>
          <div className="absolute inset-1 border-2 border-white/20 rounded-lg" />
        </div>

        {/* Front of card */}
        <div
          className={`
            absolute inset-0 rounded-xl shadow-lg flex items-center justify-center
            ${card.isMatched 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-green-300' 
              : 'bg-gradient-to-br from-white to-gray-100 border-4 border-gray-200'
            }
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className={`${emojiSize} ${card.isMatched ? 'animate-bounce' : ''}`}>
            {card.emoji}
          </span>
        </div>
      </div>
    </button>
  )
}

// Main game component
export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('4x4')
  const [theme, setTheme] = useState<keyof typeof EMOJI_SETS>('animals')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isCheckingRef = useRef(false)

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('memory-game-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch {
        // Invalid data, ignore
      }
    }
  }, [])

  // Initialize game
  const initializeGame = useCallback(() => {
    const pairCount = difficulty === '4x4' ? 8 : 18
    const emojis = EMOJI_SETS[theme].slice(0, pairCount)
    const cardPairs = [...emojis, ...emojis]
    
    // Shuffle cards using Fisher-Yates
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
    }

    const newCards: Card[] = cardPairs.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))

    setCards(newCards)
    setFlippedCards([])
    setMoves(0)
    setTime(0)
    setGameOver(false)
    setShowConfetti(false)
    setIsPlaying(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [difficulty, theme])

  // Initialize on mount and when difficulty/theme changes
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Timer
  useEffect(() => {
    if (isPlaying && !gameOver) {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, gameOver])

  // Check for win
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameOver(true)
      setIsPlaying(false)
      setShowConfetti(true)
      
      if (soundEnabled) {
        playSound('win')
      }

      // Save to leaderboard
      const newEntry: LeaderboardEntry = {
        time,
        moves,
        difficulty,
        date: new Date().toISOString(),
      }
      
      const newLeaderboard = [...leaderboard, newEntry]
        .filter((e) => e.difficulty === difficulty)
        .sort((a, b) => a.time - b.time || a.moves - b.moves)
        .slice(0, 10)
      
      // Re-add other difficulty entries
      const otherEntries = leaderboard.filter((e) => e.difficulty !== difficulty)
      const fullLeaderboard = [...newLeaderboard, ...otherEntries]
      
      setLeaderboard(fullLeaderboard)
      localStorage.setItem('memory-game-leaderboard', JSON.stringify(fullLeaderboard))
    }
  }, [cards, time, moves, difficulty, leaderboard, soundEnabled])

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (isCheckingRef.current) return
    if (flippedCards.length >= 2) return
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return

    // Start timer on first click
    if (!isPlaying) {
      setIsPlaying(true)
    }

    if (soundEnabled) {
      playSound('flip')
    }

    // Flip the card
    const newCards = cards.map((card) =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    )
    setCards(newCards)

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      isCheckingRef.current = true

      const [first, second] = newFlipped
      if (newCards[first].emoji === newCards[second].emoji) {
        // Match!
        setTimeout(() => {
          if (soundEnabled) {
            playSound('match')
          }
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          )
          setFlippedCards([])
          isCheckingRef.current = false
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          if (soundEnabled) {
            playSound('nomatch')
          }
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          )
          setFlippedCards([])
          isCheckingRef.current = false
        }, 1000)
      }
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
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get current difficulty leaderboard
  const currentLeaderboard = leaderboard
    .filter((e) => e.difficulty === difficulty)
    .sort((a, b) => a.time - b.time || a.moves - b.moves)
    .slice(0, 5)

  const gridCols = difficulty === '4x4' ? 'grid-cols-4' : 'grid-cols-6'
  const cardSize = difficulty === '4x4' ? 'large' : 'small'

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center p-4">
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games"
        className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
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
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 mt-12 text-center drop-shadow-lg">
        🧠 Memory Game
      </h1>
      <p className="text-white/90 mb-4 text-center">
        Match all the pairs!
      </p>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          ⏱️ {formatTime(time)}
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          🎯 {moves} moves
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {/* Difficulty */}
        <div className="flex gap-1 bg-white/30 p-1 rounded-full">
          {(['4x4', '6x6'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d)
              }}
              disabled={isPlaying && !gameOver}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                difficulty === d
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-white hover:bg-white/20'
              } ${isPlaying && !gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Theme */}
        <div className="flex gap-1 bg-white/30 p-1 rounded-full">
          {(Object.keys(EMOJI_SETS) as (keyof typeof EMOJI_SETS)[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              disabled={isPlaying && !gameOver}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                theme === t
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-white hover:bg-white/20'
              } ${isPlaying && !gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t === 'animals' ? '🐾' : t === 'food' ? '🍕' : t === 'nature' ? '🌸' : '🚗'}
            </button>
          ))}
        </div>
      </div>

      {/* Game board */}
      <div
        className={`grid ${gridCols} gap-2 md:gap-3 p-4 bg-white/20 backdrop-blur rounded-2xl shadow-2xl`}
      >
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={flippedCards.length >= 2 || isCheckingRef.current}
            size={cardSize}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={initializeGame}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🔄 New Game
        </button>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🏆 Best Times
        </button>
      </div>

      {/* Win modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounceIn">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-purple-700 mb-4">You Won!</h2>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{formatTime(time)}</div>
                <div className="text-sm text-gray-500">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">{moves}</div>
                <div className="text-sm text-gray-500">Moves</div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowConfetti(false)
                initializeGame()
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🎮 Play Again
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" onClick={() => setShowLeaderboard(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-purple-700">🏆 Best Times ({difficulty})</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {currentLeaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No records yet! Play a game to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {currentLeaderboard.map((entry, index) => (
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
                        <div className="font-bold text-purple-700">{formatTime(entry.time)}</div>
                        <div className="text-xs text-gray-500">{entry.moves} moves</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(entry.date)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Difficulty tabs */}
            <div className="flex gap-2 mt-4 justify-center">
              {(['4x4', '6x6'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    difficulty === d
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setLeaderboard([])
                localStorage.removeItem('memory-game-leaderboard')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-all"
            >
              🗑️ Clear Records
            </button>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">⭐</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>🌟</div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>✨</div>

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
        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
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
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
