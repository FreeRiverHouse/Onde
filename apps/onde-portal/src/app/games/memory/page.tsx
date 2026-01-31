'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
  isHinted: boolean
}

interface LeaderboardEntry {
  time: number
  moves: number
  difficulty: Difficulty
  date: string
}

type Difficulty = '4x4' | '6x6' | '8x8'

// Emoji sets for different themes
const EMOJI_SETS = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐔', '🐧', '🦋', '🐢', '🦀', '🐙', '🦈', '🐳', '🦩', '🦜', '🐺', '🦒', '🦘', '🦔', '🦥', '🦦'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭', '🍔', '🍕', '🌮', '🍦', '🧁', '🍩', '🍪', '🥐', '🥯', '🧇', '🥞', '🍰', '🎂', '🍫', '🍬', '🍭', '🍿', '🥤', '🧋'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌵', '🌲', '🍀', '🍁', '🌈', '⭐', '🌙', '☀️', '🔥', '💧', '❄️', '⚡', '🌊', '🌴', '🌱', '🍄', '🌾', '🪨', '💎', '🌋', '🏔️', '🏝️', '🌅', '🌌', '☁️', '🌤️', '⛈️'],
  travel: ['🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸', '🚁', '⛵', '🚂', '🚲', '🛴', '🏍️', '🛶', '🚤', '⛴️', '🚠', '🎢', '🗼', '🏰', '🗽', '🎡', '⛱️', '🏕️', '🧳', '🎪', '🚊', '🚆'],
  space: ['🚀', '🛸', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '⭐', '🌟', '✨', '💫', '☄️', '🪐', '🌌', '👽', '👾', '🛰️', '🔭', '🌠', '🪨', '☀️', '🌞', '🌛', '🌜', '🌝'],
  ocean: ['🐳', '🐋', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦐', '🦞', '🦀', '🐚', '🪸', '🦪', '🐢', '🦭', '🧜‍♀️', '🧜‍♂️', '🌊', '⚓', '🚢', '⛵', '🏄', '🏊', '🤿', '🎣', '🐊', '🦩', '🐸', '🪼', '🦆'],
}

const THEME_INFO: Record<keyof typeof EMOJI_SETS, { icon: string; label: string; gradient: string }> = {
  animals: { icon: '🐾', label: 'Animals', gradient: 'from-amber-500 to-orange-500' },
  food: { icon: '🍕', label: 'Food', gradient: 'from-red-500 to-yellow-500' },
  nature: { icon: '🌸', label: 'Nature', gradient: 'from-green-500 to-emerald-500' },
  travel: { icon: '🚗', label: 'Travel', gradient: 'from-blue-500 to-cyan-500' },
  space: { icon: '🚀', label: 'Space', gradient: 'from-indigo-600 to-purple-800' },
  ocean: { icon: '🌊', label: 'Ocean', gradient: 'from-cyan-500 to-blue-600' },
}

// Sound effects using Web Audio API
const playSound = (type: 'flip' | 'match' | 'nomatch' | 'win' | 'hint') => {
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
      case 'hint':
        osc.frequency.value = 880 // A5
        osc.type = 'sine'
        gain.gain.value = 0.15
        osc.start()
        setTimeout(() => { osc.frequency.value = 1047 }, 100) // C6
        setTimeout(() => { osc.frequency.value = 880 }, 200)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
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

// Card component with enhanced flip animation
const MemoryCard = ({
  card,
  onClick,
  disabled,
  size,
  theme,
}: {
  card: Card
  onClick: () => void
  disabled: boolean
  size: 'small' | 'medium' | 'large'
  theme: keyof typeof EMOJI_SETS
}) => {
  const cardSizes = {
    large: 'w-16 h-16 md:w-20 md:h-20',
    medium: 'w-12 h-12 md:w-14 md:h-14',
    small: 'w-10 h-10 md:w-11 md:h-11',
  }
  const emojiSizes = {
    large: 'text-3xl md:text-4xl',
    medium: 'text-xl md:text-2xl',
    small: 'text-lg md:text-xl',
  }

  const themeGradient = THEME_INFO[theme].gradient

  return (
    <button
      onClick={onClick}
      disabled={disabled || card.isFlipped || card.isMatched}
      className={`
        ${cardSizes[size]} relative cursor-pointer transition-all duration-200
        ${!card.isFlipped && !card.isMatched && !disabled ? 'hover:scale-110 hover:-rotate-3 hover:shadow-xl' : ''}
        ${card.isMatched ? 'opacity-80' : ''}
        ${card.isHinted ? 'ring-4 ring-yellow-400 ring-opacity-100 animate-pulse' : ''}
      `}
      style={{ perspective: '1000px' }}
    >
      <div
        className="card-inner relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Back of card */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${themeGradient} rounded-xl shadow-lg flex items-center justify-center border-4 border-white/30`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-white text-2xl font-black drop-shadow-lg">?</span>
          <div className="absolute inset-1 border-2 border-white/20 rounded-lg" />
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-xl opacity-50" />
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
          <span 
            className={`${emojiSizes[size]} transition-transform duration-300`}
            style={{
              animation: card.isMatched ? 'matchPop 0.5s ease-out' : 'none',
            }}
          >
            {card.emoji}
          </span>
          {card.isMatched && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-xl animate-shine" />
          )}
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
  const [hintsRemaining, setHintsRemaining] = useState(3)
  const [hintedPair, setHintedPair] = useState<number[]>([])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isCheckingRef = useRef(false)

  // Get max hints based on difficulty
  const getMaxHints = useCallback((diff: Difficulty) => {
    switch (diff) {
      case '4x4': return 3
      case '6x6': return 4
      case '8x8': return 5
    }
  }, [])

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
    const pairCounts: Record<Difficulty, number> = {
      '4x4': 8,
      '6x6': 18,
      '8x8': 32,
    }
    const pairCount = pairCounts[difficulty]
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
      isHinted: false,
    }))

    setCards(newCards)
    setFlippedCards([])
    setMoves(0)
    setTime(0)
    setGameOver(false)
    setShowConfetti(false)
    setIsPlaying(false)
    setHintsRemaining(getMaxHints(difficulty))
    setHintedPair([])
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [difficulty, theme, getMaxHints])

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

  // Handle hint
  const handleHint = () => {
    if (hintsRemaining <= 0 || gameOver || flippedCards.length > 0) return
    
    // Find an unmatched pair
    const unmatchedCards = cards.filter(c => !c.isMatched)
    if (unmatchedCards.length < 2) return
    
    // Find first pair of matching cards
    const emojiMap = new Map<string, number[]>()
    for (const card of unmatchedCards) {
      const existing = emojiMap.get(card.emoji) || []
      existing.push(card.id)
      emojiMap.set(card.emoji, existing)
    }
    
    // Get first complete pair
    let pairIds: number[] = []
    for (const [, ids] of emojiMap) {
      if (ids.length >= 2) {
        pairIds = [ids[0], ids[1]]
        break
      }
    }
    
    if (pairIds.length !== 2) return
    
    if (soundEnabled) {
      playSound('hint')
    }
    
    // Highlight the pair briefly
    setHintedPair(pairIds)
    setCards(prev => prev.map(card => ({
      ...card,
      isHinted: pairIds.includes(card.id),
    })))
    
    // Flash the cards
    setTimeout(() => {
      setCards(prev => prev.map(card => ({
        ...card,
        isFlipped: pairIds.includes(card.id) ? true : card.isFlipped,
      })))
    }, 200)
    
    setTimeout(() => {
      setCards(prev => prev.map(card => ({
        ...card,
        isFlipped: pairIds.includes(card.id) && !card.isMatched ? false : card.isFlipped,
        isHinted: false,
      })))
      setHintedPair([])
    }, 1500)
    
    setHintsRemaining(h => h - 1)
    setMoves(m => m + 1) // Hints cost a move
    
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (isCheckingRef.current) return
    if (flippedCards.length >= 2) return
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return
    if (hintedPair.length > 0) return // Don't allow clicks during hint

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

  const gridConfig: Record<Difficulty, { cols: string; size: 'small' | 'medium' | 'large' }> = {
    '4x4': { cols: 'grid-cols-4', size: 'large' },
    '6x6': { cols: 'grid-cols-6', size: 'medium' },
    '8x8': { cols: 'grid-cols-8', size: 'small' },
  }
  
  const { cols: gridCols, size: cardSize } = gridConfig[difficulty]

  // Background gradient based on theme
  const bgGradient = theme === 'space' 
    ? 'from-slate-900 via-purple-900 to-indigo-900'
    : theme === 'ocean'
    ? 'from-cyan-500 via-blue-500 to-indigo-600'
    : 'from-indigo-400 via-purple-400 to-pink-400'

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex flex-col items-center p-4 transition-colors duration-500`}>
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
      <div className="flex gap-3 mb-4 flex-wrap justify-center">
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          ⏱️ {formatTime(time)}
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          🎯 {moves} moves
        </div>
        <button
          onClick={handleHint}
          disabled={hintsRemaining <= 0 || gameOver || flippedCards.length > 0 || hintedPair.length > 0}
          className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
            hintsRemaining > 0 && !gameOver && flippedCards.length === 0 && hintedPair.length === 0
              ? 'bg-yellow-400 text-yellow-900 hover:scale-105 hover:bg-yellow-300'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          💡 {hintsRemaining} hints
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {/* Difficulty */}
        <div className="flex gap-1 bg-white/30 p-1 rounded-full">
          {(['4x4', '6x6', '8x8'] as Difficulty[]).map((d) => (
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
              {d} {d === '8x8' && '🔥'}
            </button>
          ))}
        </div>

        {/* Theme */}
        <div className="flex gap-1 bg-white/30 p-1 rounded-full flex-wrap justify-center">
          {(Object.keys(EMOJI_SETS) as (keyof typeof EMOJI_SETS)[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              disabled={isPlaying && !gameOver}
              title={THEME_INFO[t].label}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                theme === t
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-white hover:bg-white/20'
              } ${isPlaying && !gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {THEME_INFO[t].icon}
            </button>
          ))}
        </div>
      </div>

      {/* Game board */}
      <div
        className={`grid ${gridCols} gap-1.5 md:gap-2 p-3 md:p-4 bg-white/20 backdrop-blur rounded-2xl shadow-2xl max-w-full overflow-auto`}
      >
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={flippedCards.length >= 2 || isCheckingRef.current || hintedPair.length > 0}
            size={cardSize}
            theme={theme}
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
            <p className="text-gray-600 mb-4">
              {difficulty === '8x8' ? '🔥 Hard Mode Champion!' : `Difficulty: ${difficulty}`}
            </p>
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
              {(['4x4', '6x6', '8x8'] as Difficulty[]).map((d) => (
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
      {theme === 'space' ? (
        <>
          <div className="fixed bottom-8 left-8 text-4xl animate-pulse opacity-60">⭐</div>
          <div className="fixed bottom-16 right-12 text-3xl animate-pulse opacity-60" style={{ animationDelay: '0.5s' }}>🌟</div>
          <div className="fixed top-32 right-8 text-2xl animate-pulse opacity-40" style={{ animationDelay: '1s' }}>✨</div>
          <div className="fixed top-48 left-12 text-xl animate-pulse opacity-30" style={{ animationDelay: '1.5s' }}>🚀</div>
        </>
      ) : theme === 'ocean' ? (
        <>
          <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">🐋</div>
          <div className="fixed bottom-16 right-12 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>🐠</div>
          <div className="fixed top-32 right-8 text-2xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>🫧</div>
        </>
      ) : (
        <>
          <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">⭐</div>
          <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>🌟</div>
          <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>✨</div>
        </>
      )}

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
        @keyframes matchPop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes shine {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 1s ease-in-out;
        }
      `}</style>
    </div>
  )
}
