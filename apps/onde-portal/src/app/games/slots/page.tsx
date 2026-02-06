'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Slot symbols - kid-friendly fruits and treats
const SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍒', '🍓', '🌟', '💎']
const SYMBOL_VALUES: Record<string, number> = {
  '🍎': 10,
  '🍊': 15,
  '🍋': 20,
  '🍇': 25,
  '🍒': 30,
  '🍓': 40,
  '🌟': 100, // Special star
  '💎': 200, // Jackpot diamond
}

type GameState = 'idle' | 'spinning' | 'result'

interface Reel {
  symbols: string[]
  position: number
  finalSymbol: string
  spinning: boolean
}

// Sound effects using Web Audio API
const playSound = (type: 'spin' | 'stop' | 'win' | 'bigWin' | 'jackpot' | 'click' | 'freeSpin') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'spin':
        osc.frequency.value = 200
        osc.type = 'square'
        gain.gain.value = 0.08
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(400, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'stop':
        osc.frequency.value = 300
        osc.type = 'sine'
        gain.gain.value = 0.15
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(200, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'win':
        const winNotes = [523.25, 659.25, 783.99]
        winNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'sine'
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            osc2.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        osc.stop(0)
        break
      case 'bigWin':
        const bigNotes = [392, 493.88, 587.33, 783.99, 987.77]
        bigNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'triangle'
            gain2.gain.value = 0.18
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.25)
            osc2.stop(audio.currentTime + 0.25)
          }, i * 80)
        })
        osc.stop(0)
        break
      case 'jackpot':
        const jackpotNotes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.50]
        jackpotNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'sine'
            gain2.gain.value = 0.2
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 100)
        })
        osc.stop(0)
        break
      case 'click':
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'freeSpin':
        const freeNotes = [440, 554.37, 659.25, 880]
        freeNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            osc2.type = 'triangle'
            gain2.gain.value = 0.15
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
            osc2.stop(audio.currentTime + 0.15)
          }, i * 60)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti for wins
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#fcd34d', '#fbbf24', '#f59e0b', '#22c55e', '#4ade80', '#f472b6', '#c084fc', '#60a5fa']
  const confetti = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 10,
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

// Single reel component
const ReelDisplay = ({
  reel,
  index,
  isWinning,
}: {
  reel: Reel
  index: number
  isWinning: boolean
}) => {
  // Generate the visible symbols strip
  const displaySymbols = [...reel.symbols, ...reel.symbols, ...reel.symbols]

  return (
    <div className="relative">
      {/* Reel frame */}
      <div className={`
        relative w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36
        bg-gradient-to-b from-amber-100 via-white to-amber-100
        rounded-2xl shadow-inner overflow-hidden
        border-4 ${isWinning ? 'border-yellow-400 animate-pulse' : 'border-amber-600'}
        ${isWinning ? 'shadow-[0_0_30px_rgba(250,204,21,0.6)]' : ''}
      `}>
        {/* Symbol strip */}
        <div
          className={`
            absolute left-0 right-0 flex flex-col items-center
            transition-transform
            ${reel.spinning ? 'duration-100' : 'duration-300'}
          `}
          style={{
            transform: `translateY(-${reel.position * 100}%)`,
          }}
        >
          {displaySymbols.map((symbol, i) => (
            <div
              key={i}
              className="w-full h-28 sm:h-32 md:h-36 flex items-center justify-center"
            >
              <span
                className={`
                  text-4xl sm:text-5xl md:text-6xl
                  ${!reel.spinning && symbol === reel.finalSymbol ? 'animate-bounce-small' : ''}
                `}
              >
                {symbol}
              </span>
            </div>
          ))}
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      </div>

      {/* Reel index indicator */}
      <div className="text-center mt-2">
        <span className="text-xs text-amber-700 font-bold">
          {['LEFT', 'CENTER', 'RIGHT'][index]}
        </span>
      </div>
    </div>
  )
}

// Win line indicator
const WinIndicator = ({ prize, symbol }: { prize: number; symbol: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div className="animate-winLine">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 px-6 py-3 rounded-full shadow-2xl border-4 border-white">
          <span className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">
            {symbol}×3 = +{prize}! 🎉
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SlotMachine() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [coins, setCoins] = useState(100)
  const [bet, setBet] = useState(5)
  const [lastWin, setLastWin] = useState(0)
  const [totalWins, setTotalWins] = useState(0)
  const [freeSpins, setFreeSpins] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [winningSymbol, setWinningSymbol] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [reels, setReels] = useState<Reel[]>([
    { symbols: [...SYMBOLS], position: 0, finalSymbol: '🍎', spinning: false },
    { symbols: [...SYMBOLS], position: 0, finalSymbol: '🍊', spinning: false },
    { symbols: [...SYMBOLS], position: 0, finalSymbol: '🍋', spinning: false },
  ])

  const spinTimeouts = useRef<NodeJS.Timeout[]>([])

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      spinTimeouts.current.forEach((t) => clearTimeout(t))
    }
  }, [])

  // Check for free spin trigger (3 stars)
  const checkFreeSpins = useCallback((symbols: string[]) => {
    const starCount = symbols.filter((s) => s === '🌟').length
    if (starCount >= 2) {
      return starCount * 3 // 2 stars = 6 free spins, 3 stars = 9 free spins
    }
    return 0
  }, [])

  // Calculate win
  const calculateWin = useCallback((symbols: string[]): number => {
    // Check for 3 of a kind
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      const baseValue = SYMBOL_VALUES[symbols[0]] || 10
      return baseValue * bet
    }

    // Check for 2 of a kind (smaller win)
    if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
      const matchSymbol = symbols[0] === symbols[1] ? symbols[0] : symbols[1] === symbols[2] ? symbols[1] : symbols[0]
      const baseValue = SYMBOL_VALUES[matchSymbol] || 10
      return Math.floor((baseValue * bet) / 4)
    }

    return 0
  }, [bet])

  // Spin the reels
  const spin = useCallback(() => {
    if (gameState === 'spinning') return

    // Check if we have enough coins (unless free spin)
    if (freeSpins === 0 && coins < bet) {
      setMessage('Not enough coins! 💰')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    // Deduct bet (unless free spin)
    if (freeSpins > 0) {
      setFreeSpins((prev) => prev - 1)
      if (soundEnabled) playSound('freeSpin')
    } else {
      setCoins((prev) => prev - bet)
    }

    setGameState('spinning')
    setLastWin(0)
    setWinningSymbol(null)
    setShowConfetti(false)
    setMessage(freeSpins > 0 ? `✨ Free Spin! ${freeSpins - 1} left` : '')

    if (soundEnabled) playSound('spin')

    // Generate random final symbols
    const finalSymbols = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ]

    // Start spinning all reels
    setReels((prev) =>
      prev.map((reel) => ({
        ...reel,
        symbols: shuffleArray(SYMBOLS),
        spinning: true,
        position: 0,
      }))
    )

    // Animate each reel with spinning effect
    const spinDurations = [1500, 2000, 2500] // Staggered stops

    reels.forEach((_, reelIndex) => {
      let pos = 0
      const spinInterval = setInterval(() => {
        pos = (pos + 1) % SYMBOLS.length
        setReels((prev) =>
          prev.map((r, i) =>
            i === reelIndex ? { ...r, position: pos } : r
          )
        )
      }, 80)

      const timeout = setTimeout(() => {
        clearInterval(spinInterval)

        // Stop at final position
        setReels((prev) =>
          prev.map((r, i) =>
            i === reelIndex
              ? {
                  ...r,
                  spinning: false,
                  finalSymbol: finalSymbols[i],
                  position: SYMBOLS.indexOf(finalSymbols[i]),
                  symbols: [...SYMBOLS.slice(SYMBOLS.indexOf(finalSymbols[i])), ...SYMBOLS.slice(0, SYMBOLS.indexOf(finalSymbols[i]))],
                }
              : r
          )
        )

        if (soundEnabled) playSound('stop')

        // Check for win after last reel stops
        if (reelIndex === 2) {
          setTimeout(() => {
            const win = calculateWin(finalSymbols)
            const newFreeSpins = checkFreeSpins(finalSymbols)

            if (win > 0) {
              setLastWin(win)
              setCoins((prev) => prev + win)
              setTotalWins((prev) => prev + win)

              // Check if it's a 3-of-a-kind
              if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
                setWinningSymbol(finalSymbols[0])

                if (finalSymbols[0] === '💎') {
                  setMessage('💎💎💎 JACKPOT!!! 💎💎💎')
                  if (soundEnabled) playSound('jackpot')
                } else if (finalSymbols[0] === '🌟') {
                  setMessage('⭐ TRIPLE STARS! ⭐')
                  if (soundEnabled) playSound('bigWin')
                } else {
                  if (soundEnabled) playSound('bigWin')
                }
                setShowConfetti(true)
              } else {
                setMessage('Nice! 🎉')
                if (soundEnabled) playSound('win')
              }
            }

            if (newFreeSpins > 0) {
              setFreeSpins((prev) => prev + newFreeSpins)
              setMessage(`🎁 ${newFreeSpins} FREE SPINS! 🎁`)
              if (soundEnabled) playSound('freeSpin')
            }

            setGameState('result')

            // Clear message after delay
            setTimeout(() => {
              if (!newFreeSpins) setMessage('')
            }, 2500)
          }, 300)
        }
      }, spinDurations[reelIndex])

      spinTimeouts.current.push(timeout)
    })
  }, [gameState, coins, bet, freeSpins, soundEnabled, reels, calculateWin, checkFreeSpins])

  // Handle bet change
  const changeBet = (delta: number) => {
    if (gameState === 'spinning') return
    if (soundEnabled) playSound('click')
    setBet((prev) => Math.max(1, Math.min(20, prev + delta)))
  }

  // Add free coins
  const addCoins = () => {
    if (soundEnabled) playSound('win')
    setCoins((prev) => prev + 50)
    setMessage('🎁 +50 coins!')
    setTimeout(() => setMessage(''), 2000)
  }

  const isWinning = winningSymbol !== null

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center p-4 relative overflow-hidden">
      <Confetti active={showConfetti} />

      {/* Decorative lights */}
      <div className="absolute top-0 left-0 right-0 flex justify-around py-2 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-light"
            style={{
              backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d'][i % 5],
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-lg mb-4 z-10">
        <Link
          href="/games/"
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Games
        </Link>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 mb-2 text-center drop-shadow-lg z-10 animate-title">
        🎰 Lucky Fruits 🍀
      </h1>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center z-10">
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 rounded-full font-bold text-amber-900 shadow-lg flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <span>{coins}</span>
        </div>
        {freeSpins > 0 && (
          <div className="bg-gradient-to-r from-pink-400 to-purple-500 px-4 py-2 rounded-full font-bold text-white shadow-lg animate-pulse">
            ✨ Free: {freeSpins}
          </div>
        )}
        {lastWin > 0 && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-full font-bold text-white shadow-lg animate-bounce">
            +{lastWin}!
          </div>
        )}
      </div>

      {/* Message display */}
      {message && (
        <div className="bg-white/90 px-6 py-3 rounded-full shadow-2xl mb-4 animate-bounce-in z-20">
          <span className="text-lg font-black text-purple-700">{message}</span>
        </div>
      )}

      {/* Slot machine frame */}
      <div className="relative bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-amber-600 z-10">
        {/* Inner frame glow */}
        <div className="absolute inset-2 rounded-2xl bg-gradient-to-b from-amber-600/30 to-transparent pointer-events-none" />

        {/* Machine lights */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
          {['🔴', '🟡', '🟢', '🟡', '🔴'].map((light, i) => (
            <span
              key={i}
              className="text-xl animate-blink"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {light}
            </span>
          ))}
        </div>

        {/* Reels container */}
        <div className="relative bg-gradient-to-b from-gray-900 to-black p-4 rounded-2xl shadow-inner">
          {/* Win indicator overlay */}
          {isWinning && <WinIndicator prize={lastWin} symbol={winningSymbol} />}

          <div className="flex gap-3 sm:gap-4 justify-center">
            {reels.map((reel, index) => (
              <ReelDisplay
                key={index}
                reel={reel}
                index={index}
                isWinning={isWinning && reel.finalSymbol === winningSymbol}
              />
            ))}
          </div>
        </div>

        {/* Bet controls */}
        <div className="flex items-center justify-center gap-4 mt-6 bg-amber-950/50 py-3 px-4 rounded-xl">
          <span className="text-white font-bold text-sm">BET:</span>
          <button
            onClick={() => changeBet(-1)}
            disabled={gameState === 'spinning' || bet <= 1}
            className="w-10 h-10 bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-xl rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <div className="bg-black/50 px-4 py-2 rounded-lg min-w-[60px] text-center">
            <span className="text-yellow-400 font-black text-xl">{bet}</span>
          </div>
          <button
            onClick={() => changeBet(1)}
            disabled={gameState === 'spinning' || bet >= 20}
            className="w-10 h-10 bg-gradient-to-b from-green-500 to-green-700 text-white font-black text-xl rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {/* Spin button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={spin}
            disabled={gameState === 'spinning'}
            className={`
              px-10 py-4 rounded-full font-black text-xl shadow-2xl
              transition-all duration-200
              ${
                gameState === 'spinning'
                  ? 'bg-gray-500 cursor-not-allowed'
                  : freeSpins > 0
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white hover:scale-110 active:scale-95 animate-pulse'
                  : 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 text-white hover:scale-110 active:scale-95'
              }
            `}
          >
            {gameState === 'spinning' ? (
              <span className="animate-spin inline-block">🎰</span>
            ) : freeSpins > 0 ? (
              '✨ FREE SPIN! ✨'
            ) : (
              '🎰 SPIN!'
            )}
          </button>
        </div>
      </div>

      {/* Prize table */}
      <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-4 max-w-sm w-full z-10">
        <h3 className="text-center text-white font-bold mb-3">🏆 Prizes (×3 match)</h3>
        <div className="grid grid-cols-4 gap-2">
          {SYMBOLS.map((symbol) => (
            <div
              key={symbol}
              className="flex flex-col items-center bg-white/10 rounded-lg p-2"
            >
              <span className="text-2xl">{symbol}</span>
              <span className="text-xs text-yellow-300 font-bold">
                ×{SYMBOL_VALUES[symbol]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-white/70 text-xs mt-3">
          🌟🌟 = 6 Free Spins | 🌟🌟🌟 = 9 Free Spins!
        </p>
      </div>

      {/* Add coins button */}
      {coins < 10 && (
        <button
          onClick={addCoins}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 font-bold rounded-full shadow-lg hover:scale-105 transition-all z-10 animate-bounce"
        >
          🎁 Get 50 Free Coins!
        </button>
      )}

      {/* Total wins display */}
      <div className="mt-4 text-white/60 text-sm z-10">
        Total winnings: {totalWins} 🪙
      </div>

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
        @keyframes light {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        .animate-light {
          animation: light 0.8s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        .animate-blink {
          animation: blink 0.5s ease-in-out infinite;
        }
        @keyframes title {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .animate-title {
          animation: title 2s ease-in-out infinite;
        }
        @keyframes winLine {
          0% {
            transform: scale(0) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-winLine {
          animation: winLine 0.5s ease-out forwards;
        }
        @keyframes bounce-small {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-small {
          animation: bounce-small 0.5s ease-in-out infinite;
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
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
