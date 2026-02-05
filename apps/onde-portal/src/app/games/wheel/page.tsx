'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// Prize types
type PrizeType = 'coins' | 'sticker' | 'badge' | 'mystery' | 'jackpot'

interface Prize {
  id: number
  type: PrizeType
  name: string
  value: number | string
  emoji: string
  color: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

// Wheel segments with prizes
const prizes: Prize[] = [
  { id: 1, type: 'coins', name: '10 Coins', value: 10, emoji: '🪙', color: '#FFD700', rarity: 'common' },
  { id: 2, type: 'sticker', name: 'Star Sticker', value: '⭐', emoji: '⭐', color: '#9333EA', rarity: 'uncommon' },
  { id: 3, type: 'coins', name: '25 Coins', value: 25, emoji: '💰', color: '#22C55E', rarity: 'common' },
  { id: 4, type: 'badge', name: 'Lucky Badge', value: '🍀', emoji: '🍀', color: '#10B981', rarity: 'rare' },
  { id: 5, type: 'coins', name: '50 Coins', value: 50, emoji: '💎', color: '#3B82F6', rarity: 'uncommon' },
  { id: 6, type: 'sticker', name: 'Rainbow Sticker', value: '🌈', emoji: '🌈', color: '#EC4899', rarity: 'rare' },
  { id: 7, type: 'coins', name: '100 Coins', value: 100, emoji: '👑', color: '#F59E0B', rarity: 'rare' },
  { id: 8, type: 'mystery', name: 'Mystery Box', value: '📦', emoji: '📦', color: '#8B5CF6', rarity: 'epic' },
  { id: 9, type: 'coins', name: '15 Coins', value: 15, emoji: '🪙', color: '#14B8A6', rarity: 'common' },
  { id: 10, type: 'badge', name: 'Fire Badge', value: '🔥', emoji: '🔥', color: '#EF4444', rarity: 'uncommon' },
  { id: 11, type: 'jackpot', name: 'JACKPOT!', value: 500, emoji: '🎰', color: '#7C3AED', rarity: 'legendary' },
  { id: 12, type: 'sticker', name: 'Heart Sticker', value: '❤️', emoji: '❤️', color: '#F43F5E', rarity: 'common' },
]

// Confetti particle
interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
}

// Prize history entry
interface PrizeHistoryEntry {
  prize: Prize
  date: string
  id: number
}

// Get date string
const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0]
}

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [coins, setCoins] = useState(100) // Starting coins
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(1)
  const [lastFreeSpinDate, setLastFreeSpinDate] = useState<string | null>(null)
  const [totalSpins, setTotalSpins] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [prizeHistory, setPrizeHistory] = useState<PrizeHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const SPIN_COST = 25

  // Load saved state
  useEffect(() => {
    const savedCoins = localStorage.getItem('wheel-coins')
    if (savedCoins) setCoins(parseInt(savedCoins))
    
    const savedSpins = localStorage.getItem('wheel-total-spins')
    if (savedSpins) setTotalSpins(parseInt(savedSpins))
    
    const savedHistory = localStorage.getItem('wheel-history')
    if (savedHistory) {
      try {
        setPrizeHistory(JSON.parse(savedHistory))
      } catch {
        // Invalid history
      }
    }
    
    // Check free spin
    const savedFreeSpinDate = localStorage.getItem('wheel-free-spin-date')
    const today = getDateString()
    
    if (savedFreeSpinDate !== today) {
      // New day, reset free spin
      setFreeSpinsLeft(1)
      setLastFreeSpinDate(null)
    } else {
      setFreeSpinsLeft(0)
      setLastFreeSpinDate(savedFreeSpinDate)
    }
  }, [])

  // Save coins
  useEffect(() => {
    localStorage.setItem('wheel-coins', coins.toString())
  }, [coins])

  // Create confetti explosion
  const createConfetti = useCallback(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98']
    const newParticles: Particle[] = []
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
      })
    }
    
    setParticles(newParticles)
    
    // Clear after animation
    setTimeout(() => setParticles([]), 3000)
  }, [])

  // Animate confetti
  useEffect(() => {
    if (particles.length === 0) return
    
    const animate = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.5, // gravity
          rotation: p.rotation + p.rotationSpeed,
        })).filter(p => p.y < window.innerHeight + 50)
      )
      
      if (particles.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particles.length])

  // Play sound effect
  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const audio = new AudioContext()
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.connect(gain)
      gain.connect(audio.destination)
      osc.frequency.value = frequency
      osc.type = type
      gain.gain.value = 0.2
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + duration)
      osc.stop(audio.currentTime + duration)
    } catch {
      // Audio not available
    }
  }

  // Spin the wheel
  const spin = () => {
    if (isSpinning) return
    
    const isFree = freeSpinsLeft > 0
    
    if (!isFree && coins < SPIN_COST) {
      // Not enough coins
      playSound(200, 0.3, 'square')
      return
    }
    
    // Deduct cost
    if (isFree) {
      setFreeSpinsLeft(0)
      const today = getDateString()
      setLastFreeSpinDate(today)
      localStorage.setItem('wheel-free-spin-date', today)
    } else {
      setCoins(prev => prev - SPIN_COST)
    }
    
    setIsSpinning(true)
    setWonPrize(null)
    setShowCelebration(false)
    
    // Play spin sound
    playSound(300, 0.1)
    
    // Calculate random prize (weighted by rarity)
    const weights = {
      common: 40,
      uncommon: 30,
      rare: 20,
      epic: 8,
      legendary: 2,
    }
    
    const totalWeight = prizes.reduce((sum, p) => sum + weights[p.rarity], 0)
    let random = Math.random() * totalWeight
    let selectedPrize = prizes[0]
    
    for (const prize of prizes) {
      random -= weights[prize.rarity]
      if (random <= 0) {
        selectedPrize = prize
        break
      }
    }
    
    // Calculate rotation to land on prize
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id)
    const segmentAngle = 360 / prizes.length
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2)
    const fullRotations = 5 + Math.floor(Math.random() * 3) // 5-7 full rotations
    const newRotation = rotation + (fullRotations * 360) + targetAngle - (rotation % 360)
    
    setRotation(newRotation)
    
    // Tick sounds during spin
    const tickInterval = setInterval(() => {
      playSound(400 + Math.random() * 200, 0.05)
    }, 100)
    
    // After spin completes
    setTimeout(() => {
      clearInterval(tickInterval)
      setIsSpinning(false)
      setWonPrize(selectedPrize)
      setShowCelebration(true)
      
      // Award prize
      if (selectedPrize.type === 'coins' || selectedPrize.type === 'jackpot') {
        setCoins(prev => prev + (selectedPrize.value as number))
      }
      
      // Update stats
      const newSpins = totalSpins + 1
      setTotalSpins(newSpins)
      localStorage.setItem('wheel-total-spins', newSpins.toString())
      
      // Add to history
      const entry: PrizeHistoryEntry = {
        prize: selectedPrize,
        date: new Date().toISOString(),
        id: Date.now(),
      }
      const newHistory = [entry, ...prizeHistory].slice(0, 20)
      setPrizeHistory(newHistory)
      localStorage.setItem('wheel-history', JSON.stringify(newHistory))
      
      // Celebration effects
      createConfetti()
      
      // Victory sound
      if (selectedPrize.rarity === 'legendary') {
        playSound(523.25, 0.2) // C5
        setTimeout(() => playSound(659.25, 0.2), 150) // E5
        setTimeout(() => playSound(783.99, 0.3), 300) // G5
        setTimeout(() => playSound(1046.50, 0.5), 450) // C6
      } else if (selectedPrize.rarity === 'epic' || selectedPrize.rarity === 'rare') {
        playSound(440, 0.2)
        setTimeout(() => playSound(554.37, 0.2), 150)
        setTimeout(() => playSound(659.25, 0.3), 300)
      } else {
        playSound(440, 0.3)
      }
    }, 4000)
  }

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const size = 300
    const center = size / 2
    const radius = center - 10
    
    canvas.width = size
    canvas.height = size
    
    ctx.clearRect(0, 0, size, size)
    
    // Draw segments
    const segmentAngle = (2 * Math.PI) / prizes.length
    
    prizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2
      const endAngle = startAngle + segmentAngle
      
      // Segment
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = prize.color
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Prize emoji
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'center'
      ctx.font = '24px sans-serif'
      ctx.fillText(prize.emoji, radius * 0.65, 8)
      ctx.restore()
    })
    
    // Center circle
    ctx.beginPath()
    ctx.arc(center, center, 25, 0, 2 * Math.PI)
    ctx.fillStyle = '#1F2937'
    ctx.fill()
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Center text
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SPIN', center, center + 4)
  }, [])

  const getRarityLabel = (rarity: Prize['rarity']) => {
    const labels = {
      common: { text: 'Common', color: 'text-gray-400' },
      uncommon: { text: 'Uncommon', color: 'text-green-400' },
      rare: { text: 'Rare', color: 'text-blue-400' },
      epic: { text: 'Epic', color: 'text-purple-400' },
      legendary: { text: 'Legendary', color: 'text-yellow-400' },
    }
    return labels[rarity]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center p-4 relative overflow-hidden">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
      
      {/* Header */}
      <Link href="/games/arcade/" className="absolute top-4 left-4 bg-white/20 backdrop-blur px-4 py-2 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-all z-10">
        ← Games
      </Link>

      {/* Stats */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-white/20 backdrop-blur px-4 py-2 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-all"
        >
          📜 {prizeHistory.length}
        </button>
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 rounded-full font-bold text-white shadow-lg flex items-center gap-1">
          🪙 {coins.toLocaleString()}
        </div>
      </div>

      {/* Info button */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="absolute top-16 right-4 bg-white/20 backdrop-blur w-10 h-10 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-all z-10 flex items-center justify-center"
      >
        ?
      </button>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mt-20 mb-2 text-center drop-shadow-lg">
        🎡 Prize Wheel
      </h1>
      <p className="text-lg text-purple-200 mb-4 text-center">
        Spin to win coins, stickers & badges!
      </p>

      {/* Free spin indicator */}
      {freeSpinsLeft > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 rounded-full font-bold text-white shadow-lg animate-pulse mb-4">
          🎁 FREE SPIN Available!
        </div>
      )}

      {/* Wheel container */}
      <div className="relative my-4">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
        </div>
        
        {/* Wheel */}
        <div
          className="relative transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '4s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-[300px] h-[300px] drop-shadow-2xl"
          />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-purple-500/20 blur-xl -z-10 scale-110" />
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={isSpinning || (freeSpinsLeft === 0 && coins < SPIN_COST)}
        className={`
          mt-4 px-12 py-4 rounded-full font-black text-2xl shadow-2xl
          transition-all transform
          ${isSpinning 
            ? 'bg-gray-500 cursor-not-allowed scale-95' 
            : freeSpinsLeft > 0
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-110 hover:shadow-green-500/50'
              : coins >= SPIN_COST
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-110 hover:shadow-orange-500/50'
                : 'bg-gray-500 cursor-not-allowed'
          }
          text-white
        `}
      >
        {isSpinning ? (
          <span className="animate-pulse">Spinning...</span>
        ) : freeSpinsLeft > 0 ? (
          '🎁 FREE SPIN!'
        ) : coins >= SPIN_COST ? (
          `🎰 Spin (${SPIN_COST} coins)`
        ) : (
          '❌ Need more coins'
        )}
      </button>

      {/* Total spins */}
      <p className="text-purple-300 mt-4 text-sm">
        Total spins: {totalSpins}
      </p>

      {/* Won prize modal */}
      {showCelebration && wonPrize && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowCelebration(false)}>
          <div 
            className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-yellow-400 animate-bounce-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">{wonPrize.emoji}</div>
              <h2 className="text-3xl font-black text-yellow-400 mb-2">
                {wonPrize.rarity === 'legendary' ? '🎉 JACKPOT! 🎉' : 'You Won!'}
              </h2>
              <p className="text-2xl font-bold text-white mb-2">{wonPrize.name}</p>
              <p className={`text-sm font-bold ${getRarityLabel(wonPrize.rarity).color}`}>
                ✨ {getRarityLabel(wonPrize.rarity).text}
              </p>
              {(wonPrize.type === 'coins' || wonPrize.type === 'jackpot') && (
                <p className="text-xl text-yellow-400 mt-4 font-bold">
                  +{wonPrize.value} coins added!
                </p>
              )}
              <button
                onClick={() => setShowCelebration(false)}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-white text-lg hover:scale-105 transition-all"
              >
                Awesome! 🎊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowHistory(false)}>
          <div 
            className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-6 max-w-md w-full max-h-[80vh] shadow-2xl border-2 border-purple-400"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-white mb-4 text-center">📜 Prize History</h2>
            <div className="overflow-y-auto max-h-[50vh] space-y-2">
              {prizeHistory.length === 0 ? (
                <p className="text-purple-300 text-center py-8">No prizes yet! Start spinning!</p>
              ) : (
                prizeHistory.map(entry => (
                  <div key={entry.id} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-3xl">{entry.prize.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{entry.prize.name}</p>
                      <p className={`text-xs ${getRarityLabel(entry.prize.rarity).color}`}>
                        {getRarityLabel(entry.prize.rarity).text}
                      </p>
                    </div>
                    <span className="text-purple-300 text-sm">{formatDate(entry.date)}</span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="mt-4 w-full py-3 bg-purple-600 rounded-full font-bold text-white hover:bg-purple-500 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowInstructions(false)}>
          <div 
            className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-purple-400"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-white mb-4 text-center">🎡 How to Play</h2>
            <div className="space-y-3 text-purple-100">
              <p>🎁 <strong>Daily Free Spin:</strong> Get 1 free spin every day!</p>
              <p>🪙 <strong>Extra Spins:</strong> Cost {SPIN_COST} coins each</p>
              <p>🎰 <strong>Prizes:</strong> Win coins, stickers, badges & more!</p>
              <div className="border-t border-purple-600 pt-3 mt-3">
                <p className="font-bold mb-2">Rarity Tiers:</p>
                <p><span className="text-gray-400">⚪ Common</span> - Most frequent</p>
                <p><span className="text-green-400">🟢 Uncommon</span> - Pretty good!</p>
                <p><span className="text-blue-400">🔵 Rare</span> - Getting lucky!</p>
                <p><span className="text-purple-400">🟣 Epic</span> - Amazing find!</p>
                <p><span className="text-yellow-400">🟡 Legendary</span> - JACKPOT!</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 w-full py-3 bg-purple-600 rounded-full font-bold text-white hover:bg-purple-500 transition-all"
            >
              Got it! 👍
            </button>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-10 left-10 text-4xl animate-float opacity-50">✨</div>
      <div className="fixed bottom-20 right-10 text-3xl animate-float opacity-50" style={{ animationDelay: '0.5s' }}>🌟</div>
      <div className="fixed top-1/3 left-5 text-2xl animate-float opacity-30" style={{ animationDelay: '1s' }}>💫</div>
      <div className="fixed top-1/4 right-5 text-2xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>⭐</div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
