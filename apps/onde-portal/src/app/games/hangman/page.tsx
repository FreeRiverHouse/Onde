'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Word lists by category with Italian and English
const WORD_LISTS: Record<string, { en: string[], it: string[] }> = {
  '🐾 Animals': {
    en: ['ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'CROCODILE', 'FLAMINGO', 'CHEETAH', 'HEDGEHOG', 'SQUIRREL', 'PELICAN', 'GORILLA', 'LEOPARD', 'HAMSTER'],
    it: ['ELEFANTE', 'GIRAFFA', 'DELFINO', 'PINGUINO', 'FARFALLA', 'CANGURO', 'POLPO', 'COCCODRILLO', 'FENICOTTERO', 'GHEPARDO', 'RICCIO', 'SCOIATTOLO', 'PELLICANO', 'GORILLA', 'LEOPARDO', 'CRICETO'],
  },
  '🍕 Food': {
    en: ['SPAGHETTI', 'PIZZA', 'HAMBURGER', 'CHOCOLATE', 'SANDWICH', 'STRAWBERRY', 'PINEAPPLE', 'AVOCADO', 'CROISSANT', 'BROCCOLI', 'WATERMELON', 'PANCAKE', 'LASAGNA', 'MOZZARELLA', 'TIRAMISU'],
    it: ['SPAGHETTI', 'PIZZA', 'PANINO', 'CIOCCOLATO', 'TRAMEZZINO', 'FRAGOLA', 'ANANAS', 'AVOCADO', 'CORNETTO', 'BROCCOLI', 'ANGURIA', 'FRITTELLA', 'LASAGNA', 'MOZZARELLA', 'TIRAMISU'],
  },
  '🏠 Home': {
    en: ['KITCHEN', 'BEDROOM', 'BATHROOM', 'FURNITURE', 'CURTAIN', 'BLANKET', 'BOOKSHELF', 'COMPUTER', 'TELEVISION', 'REFRIGERATOR', 'DISHWASHER', 'WARDROBE', 'FIREPLACE', 'STAIRCASE'],
    it: ['CUCINA', 'CAMERA', 'BAGNO', 'MOBILI', 'TENDA', 'COPERTA', 'LIBRERIA', 'COMPUTER', 'TELEVISIONE', 'FRIGORIFERO', 'LAVASTOVIGLIE', 'ARMADIO', 'CAMINO', 'SCALA'],
  },
  '🌍 Nature': {
    en: ['MOUNTAIN', 'RAINBOW', 'WATERFALL', 'VOLCANO', 'SUNSHINE', 'BUTTERFLY', 'THUNDERSTORM', 'SNOWFLAKE', 'EARTHQUAKE', 'HURRICANE', 'FOREST', 'DESERT', 'OCEAN', 'RIVER'],
    it: ['MONTAGNA', 'ARCOBALENO', 'CASCATA', 'VULCANO', 'SOLE', 'FARFALLA', 'TEMPORALE', 'FIOCCO', 'TERREMOTO', 'URAGANO', 'FORESTA', 'DESERTO', 'OCEANO', 'FIUME'],
  },
  '⚽ Sports': {
    en: ['FOOTBALL', 'BASKETBALL', 'SWIMMING', 'VOLLEYBALL', 'GYMNASTICS', 'SKATEBOARD', 'SURFING', 'BASEBALL', 'BADMINTON', 'WRESTLING', 'ARCHERY', 'CYCLING', 'KARATE'],
    it: ['CALCIO', 'PALLACANESTRO', 'NUOTO', 'PALLAVOLO', 'GINNASTICA', 'SKATEBOARD', 'SURF', 'BASEBALL', 'BADMINTON', 'LOTTA', 'TIRO', 'CICLISMO', 'KARATE'],
  },
  '🎭 Movies': {
    en: ['ADVENTURE', 'ANIMATION', 'COMEDY', 'DOCUMENTARY', 'FANTASY', 'HORROR', 'MUSICAL', 'MYSTERY', 'ROMANCE', 'THRILLER', 'WESTERN', 'DRAMA', 'ACTION'],
    it: ['AVVENTURA', 'ANIMAZIONE', 'COMMEDIA', 'DOCUMENTARIO', 'FANTASIA', 'HORROR', 'MUSICALE', 'MISTERO', 'ROMANTICO', 'THRILLER', 'WESTERN', 'DRAMMA', 'AZIONE'],
  },
}

// Hangman stages ASCII art
const HANGMAN_STAGES = [
  // 0 - Empty
  `
      ┌───────┐
      │       │
      │       
      │      
      │      
      │      
    ══╧══════════
  `,
  // 1 - Head
  `
      ┌───────┐
      │       │
      │      😟
      │      
      │      
      │      
    ══╧══════════
  `,
  // 2 - Body
  `
      ┌───────┐
      │       │
      │      😟
      │       │
      │       │
      │      
    ══╧══════════
  `,
  // 3 - Left arm
  `
      ┌───────┐
      │       │
      │      😟
      │      /│
      │       │
      │      
    ══╧══════════
  `,
  // 4 - Right arm
  `
      ┌───────┐
      │       │
      │      😰
      │      /│\\
      │       │
      │      
    ══╧══════════
  `,
  // 5 - Left leg
  `
      ┌───────┐
      │       │
      │      😨
      │      /│\\
      │       │
      │      /
    ══╧══════════
  `,
  // 6 - Right leg (dead)
  `
      ┌───────┐
      │       │
      │      😵
      │      /│\\
      │       │
      │      / \\
    ══╧══════════
  `,
]

type Language = 'en' | 'it'
type GameState = 'menu' | 'playing' | 'won' | 'lost'

// Sound effects
const playSound = (type: 'correct' | 'wrong' | 'win' | 'lose' | 'hint') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'correct':
        osc.frequency.value = 523.25
        gain.gain.value = 0.2
        osc.start()
        setTimeout(() => { osc.frequency.value = 659.25 }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'wrong':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
        osc.stop(audio.currentTime + 0.2)
        break
      case 'hint':
        osc.frequency.value = 880
        gain.gain.value = 0.15
        osc.start()
        setTimeout(() => { osc.frequency.value = 1047 }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.25)
        osc.stop(audio.currentTime + 0.25)
        break
      case 'win':
        const winNotes = [523.25, 659.25, 783.99, 1046.50]
        winNotes.forEach((freq, i) => {
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
        osc.stop(0)
        break
      case 'lose':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.2
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, audio.currentTime + 0.5)
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

  const confetti = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'][Math.floor(Math.random() * 7)],
    size: 8 + Math.random() * 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti rounded-full"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// Keyboard component
const Keyboard = ({
  onKeyPress,
  guessedLetters,
  correctLetters,
  disabled,
}: {
  onKeyPress: (letter: string) => void
  guessedLetters: Set<string>
  correctLetters: Set<string>
  disabled: boolean
}) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ]

  return (
    <div className="flex flex-col gap-2 items-center">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1 md:gap-2">
          {row.map((letter) => {
            const isGuessed = guessedLetters.has(letter)
            const isCorrect = correctLetters.has(letter)
            
            return (
              <button
                key={letter}
                onClick={() => onKeyPress(letter)}
                disabled={disabled || isGuessed}
                className={`
                  w-8 h-10 md:w-10 md:h-12 rounded-lg font-bold text-sm md:text-lg
                  shadow-lg transition-all transform
                  ${isGuessed
                    ? isCorrect
                      ? 'bg-green-500 text-white scale-95'
                      : 'bg-red-400 text-white scale-95 opacity-60'
                    : 'bg-white text-purple-700 hover:scale-110 hover:bg-yellow-100 active:scale-95'
                  }
                  ${disabled && !isGuessed ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function HangmanGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu')
  const [language, setLanguage] = useState<Language>('en')
  const [category, setCategory] = useState<string>('')
  const [currentWord, setCurrentWord] = useState<string>('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState<number>(0)
  const [hintsUsed, setHintsUsed] = useState<number>(0)
  const [maxHints] = useState<number>(3)
  
  // Stats
  const [score, setScore] = useState<number>(0)
  const [streak, setStreak] = useState<number>(0)
  const [gamesWon, setGamesWon] = useState<number>(0)
  const [gamesPlayed, setGamesPlayed] = useState<number>(0)
  
  // UI
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('hangman-stats')
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats)
        setScore(stats.score || 0)
        setStreak(stats.streak || 0)
        setGamesWon(stats.gamesWon || 0)
        setGamesPlayed(stats.gamesPlayed || 0)
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Save stats to localStorage
  const saveStats = useCallback((newStats: { score: number, streak: number, gamesWon: number, gamesPlayed: number }) => {
    localStorage.setItem('hangman-stats', JSON.stringify(newStats))
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      const letter = e.key.toUpperCase()
      if (/^[A-Z]$/.test(letter) && !guessedLetters.has(letter)) {
        handleGuess(letter)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, guessedLetters, currentWord])

  // Get correct letters in word
  const correctLetters = new Set(
    Array.from(guessedLetters).filter((letter) => currentWord.includes(letter))
  )

  // Check if word is complete
  const isWordComplete = currentWord
    .split('')
    .every((letter) => guessedLetters.has(letter) || letter === ' ')

  // Check win/lose conditions
  useEffect(() => {
    if (gameState !== 'playing') return

    if (isWordComplete && currentWord) {
      // Win!
      setGameState('won')
      setShowConfetti(true)
      if (soundEnabled) playSound('win')
      
      const bonus = Math.max(0, (6 - wrongGuesses) * 10)
      const hintPenalty = hintsUsed * 15
      const wordScore = currentWord.replace(/\s/g, '').length * 10 + bonus - hintPenalty
      const newScore = score + wordScore
      const newStreak = streak + 1
      const newGamesWon = gamesWon + 1
      const newGamesPlayed = gamesPlayed + 1
      
      setScore(newScore)
      setStreak(newStreak)
      setGamesWon(newGamesWon)
      setGamesPlayed(newGamesPlayed)
      saveStats({ score: newScore, streak: newStreak, gamesWon: newGamesWon, gamesPlayed: newGamesPlayed })
      
      setTimeout(() => setShowConfetti(false), 3000)
    } else if (wrongGuesses >= 6) {
      // Lose
      setGameState('lost')
      if (soundEnabled) playSound('lose')
      
      const newGamesPlayed = gamesPlayed + 1
      setStreak(0)
      setGamesPlayed(newGamesPlayed)
      saveStats({ score, streak: 0, gamesWon, gamesPlayed: newGamesPlayed })
    }
  }, [isWordComplete, wrongGuesses, gameState])

  // Start new game
  const startGame = (cat: string) => {
    setCategory(cat)
    const words = WORD_LISTS[cat][language]
    const word = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(word)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setHintsUsed(0)
    setGameState('playing')
  }

  // Handle letter guess
  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || gameState !== 'playing') return

    const newGuessed = new Set(guessedLetters)
    newGuessed.add(letter)
    setGuessedLetters(newGuessed)

    if (currentWord.includes(letter)) {
      if (soundEnabled) playSound('correct')
    } else {
      if (soundEnabled) playSound('wrong')
      setWrongGuesses((prev) => prev + 1)
    }
  }

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return

    // Find a letter that hasn't been guessed
    const unguessedLetters = currentWord
      .split('')
      .filter((letter) => letter !== ' ' && !guessedLetters.has(letter))

    if (unguessedLetters.length === 0) return

    const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)]
    const newGuessed = new Set(guessedLetters)
    newGuessed.add(hintLetter)
    setGuessedLetters(newGuessed)
    setHintsUsed((prev) => prev + 1)
    if (soundEnabled) playSound('hint')
  }

  // Display word with blanks
  const displayWord = currentWord.split('').map((letter, idx) => {
    if (letter === ' ') return { letter: ' ', revealed: true, idx }
    return { letter, revealed: guessedLetters.has(letter), idx }
  })

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        <Link
          href="/games/arcade/"
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

        {/* Stats */}
        <div className="absolute top-16 right-4 flex flex-col gap-2">
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg text-sm">
            🏆 {score.toLocaleString()}
          </div>
          {streak > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full font-bold text-white shadow-lg text-sm">
              🔥 {streak} streak
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-20 mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
            🎯 Hangman
          </h1>
          <p className="text-xl text-white/90">
            Guess the word before it&apos;s too late!
          </p>
        </div>

        {/* Language toggle */}
        <div className="flex gap-2 mb-6 bg-white/30 p-1 rounded-full">
          <button
            onClick={() => setLanguage('en')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-purple-700 shadow'
                : 'text-white hover:bg-white/20'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLanguage('it')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              language === 'it'
                ? 'bg-white text-purple-700 shadow'
                : 'text-white hover:bg-white/20'
            }`}
          >
            🇮🇹 Italiano
          </button>
        </div>

        {/* Category selection */}
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-3 text-center">
            {language === 'en' ? 'Choose a Category:' : 'Scegli una Categoria:'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(WORD_LISTS).map((cat) => (
              <button
                key={cat}
                onClick={() => startGame(cat)}
                className="p-4 rounded-xl font-bold text-lg bg-white/90 text-purple-700 hover:scale-105 hover:shadow-xl transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="mt-8 bg-white/30 backdrop-blur rounded-2xl p-6 max-w-md w-full">
          <h3 className="font-bold text-white text-lg mb-3 text-center">
            {language === 'en' ? '📊 Your Stats' : '📊 Le tue Statistiche'}
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-purple-700">{gamesPlayed}</div>
              <div className="text-xs text-purple-600">{language === 'en' ? 'Played' : 'Giocate'}</div>
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{gamesWon}</div>
              <div className="text-xs text-green-600">{language === 'en' ? 'Won' : 'Vinte'}</div>
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-600">
                {gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0}%
              </div>
              <div className="text-xs text-orange-600">{language === 'en' ? 'Win Rate' : 'Vittorie'}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/30 backdrop-blur rounded-2xl p-6 max-w-md">
          <h3 className="font-bold text-white text-lg mb-2">
            {language === 'en' ? 'How to Play:' : 'Come Giocare:'}
          </h3>
          <ul className="text-white/90 text-sm space-y-1">
            {language === 'en' ? (
              <>
                <li>• Guess letters to reveal the hidden word</li>
                <li>• You have 6 wrong guesses before game over</li>
                <li>• Use hints if you&apos;re stuck (costs points)</li>
                <li>• Use keyboard or click the letters</li>
              </>
            ) : (
              <>
                <li>• Indovina le lettere per rivelare la parola</li>
                <li>• Hai 6 tentativi sbagliati prima del game over</li>
                <li>• Usa i suggerimenti se sei bloccato (costa punti)</li>
                <li>• Usa la tastiera o clicca le lettere</li>
              </>
            )}
          </ul>
        </div>
      </div>
    )
  }

  // Game screen (playing, won, lost)
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center p-4">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4">
        <button
          onClick={() => setGameState('menu')}
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          ← {language === 'en' ? 'Menu' : 'Menu'}
        </button>
        
        <div className="flex gap-2">
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
            🏆 {score}
          </div>
          {streak > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-2 rounded-full font-bold text-white shadow-lg">
              🔥 {streak}
            </div>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="bg-white/80 rounded-full px-6 py-2 mb-4 font-bold text-purple-700 shadow-lg">
        {category} • {language === 'en' ? '🇬🇧' : '🇮🇹'}
      </div>

      {/* Hangman drawing */}
      <div className="bg-white/90 rounded-2xl p-4 mb-4 shadow-xl">
        <pre className="text-2xl md:text-3xl font-mono leading-tight text-purple-800 select-none">
          {HANGMAN_STAGES[wrongGuesses]}
        </pre>
      </div>

      {/* Wrong guesses indicator */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full transition-all ${
              idx < wrongGuesses ? 'bg-red-500 scale-110' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Word display */}
      <div className="flex gap-2 md:gap-3 mb-6 flex-wrap justify-center max-w-lg">
        {displayWord.map(({ letter, revealed, idx }) => (
          <div
            key={idx}
            className={`
              ${letter === ' ' ? 'w-4' : 'w-10 h-12 md:w-12 md:h-14'}
              flex items-center justify-center
              ${letter !== ' ' ? 'border-b-4 border-white' : ''}
              transition-all
            `}
          >
            <span
              className={`
                text-2xl md:text-3xl font-black
                ${revealed ? 'text-white animate-pop' : 'text-transparent'}
                ${gameState === 'lost' && !revealed ? '!text-red-300' : ''}
              `}
            >
              {gameState === 'lost' || revealed ? letter : '_'}
            </span>
          </div>
        ))}
      </div>

      {/* Result message */}
      {gameState === 'won' && (
        <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-xl mb-4 animate-bounce shadow-lg">
          🎉 {language === 'en' ? 'You Won!' : 'Hai Vinto!'}
        </div>
      )}
      {gameState === 'lost' && (
        <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-xl mb-4 shadow-lg">
          😢 {language === 'en' ? 'Game Over!' : 'Game Over!'}<br />
          <span className="text-sm font-normal">
            {language === 'en' ? 'The word was:' : 'La parola era:'} {currentWord}
          </span>
        </div>
      )}

      {/* Hint button */}
      {gameState === 'playing' && (
        <button
          onClick={useHint}
          disabled={hintsUsed >= maxHints}
          className={`
            px-6 py-3 rounded-full font-bold shadow-lg mb-4 transition-all
            ${hintsUsed < maxHints
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          💡 {language === 'en' ? 'Hint' : 'Aiuto'} ({maxHints - hintsUsed}/{maxHints})
        </button>
      )}

      {/* Keyboard */}
      {gameState === 'playing' ? (
        <Keyboard
          onKeyPress={handleGuess}
          guessedLetters={guessedLetters}
          correctLetters={correctLetters}
          disabled={gameState !== 'playing'}
        />
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => startGame(category)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🔄 {language === 'en' ? 'Play Again' : 'Gioca Ancora'}
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-4 bg-white/90 text-purple-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            📋 {language === 'en' ? 'Categories' : 'Categorie'}
          </button>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">🎯</div>
      <div className="fixed bottom-16 right-12 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>✨</div>

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
        :global(.animate-confetti) {
          animation: confetti ease-out forwards;
        }
        @keyframes pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        :global(.animate-pop) {
          animation: pop 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
