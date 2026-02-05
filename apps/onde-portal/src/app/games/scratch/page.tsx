'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// Card tier types
type CardTier = 'bronze' | 'silver' | 'gold' | 'diamond'

interface Prize {
  emoji: string
  name: string
  value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

interface ScratchCard {
  tier: CardTier
  prizes: Prize[]
  isScratched: boolean
  revealedCount: number
}

// Prize pools by tier
const prizesByTier: Record<CardTier, Prize[]> = {
  bronze: [
    { emoji: '🍬', name: 'Candy', value: 5, rarity: 'common' },
    { emoji: '🍪', name: 'Cookie', value: 10, rarity: 'common' },
    { emoji: '⭐', name: 'Star', value: 15, rarity: 'common' },
    { emoji: '🎈', name: 'Balloon', value: 20, rarity: 'uncommon' },
    { emoji: '🧸', name: 'Teddy Bear', value: 50, rarity: 'uncommon' },
    { emoji: '🎁', name: 'Gift Box', value: 100, rarity: 'rare' },
  ],
  silver: [
    { emoji: '🍬', name: 'Candy', value: 10, rarity: 'common' },
    { emoji: '🌟', name: 'Shiny Star', value: 25, rarity: 'common' },
    { emoji: '🎈', name: 'Balloon', value: 30, rarity: 'common' },
    { emoji: '🧸', name: 'Teddy Bear', value: 75, rarity: 'uncommon' },
    { emoji: '🎁', name: 'Gift Box', value: 150, rarity: 'uncommon' },
    { emoji: '🎮', name: 'Game Controller', value: 300, rarity: 'rare' },
    { emoji: '👑', name: 'Crown', value: 500, rarity: 'epic' },
  ],
  gold: [
    { emoji: '🌟', name: 'Shiny Star', value: 50, rarity: 'common' },
    { emoji: '🎁', name: 'Gift Box', value: 100, rarity: 'common' },
    { emoji: '🎮', name: 'Game Controller', value: 250, rarity: 'uncommon' },
    { emoji: '👑', name: 'Crown', value: 500, rarity: 'uncommon' },
    { emoji: '💎', name: 'Diamond', value: 1000, rarity: 'rare' },
    { emoji: '🦄', name: 'Unicorn', value: 2000, rarity: 'epic' },
    { emoji: '🌈', name: 'Rainbow', value: 5000, rarity: 'legendary' },
  ],
  diamond: [
    { emoji: '👑', name: 'Crown', value: 250, rarity: 'common' },
    { emoji: '💎', name: 'Diamond', value: 500, rarity: 'common' },
    { emoji: '🦄', name: 'Unicorn', value: 1000, rarity: 'uncommon' },
    { emoji: '🌈', name: 'Rainbow', value: 2500, rarity: 'uncommon' },
    { emoji: '🚀', name: 'Rocket', value: 5000, rarity: 'rare' },
    { emoji: '🏆', name: 'Trophy', value: 10000, rarity: 'epic' },
    { emoji: '👸', name: 'Princess', value: 25000, rarity: 'legendary' },
  ],
}

// Tier configurations
const tierConfig: Record<CardTier, { name: string; color: string; gradient: string; cost: number; bgPattern: string }> = {
  bronze: {
    name: 'Bronze',
    color: 'from-amber-600 to-amber-800',
    gradient: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 50%, #cd7f32 100%)',
    cost: 0, // Free tier
    bgPattern: '🥉',
  },
  silver: {
    name: 'Silver',
    color: 'from-gray-300 to-gray-500',
    gradient: 'linear-gradient(135deg, #c0c0c0 0%, #808080 50%, #c0c0c0 100%)',
    cost: 100,
    bgPattern: '🥈',
  },
  gold: {
    name: 'Gold',
    color: 'from-yellow-400 to-yellow-600',
    gradient: 'linear-gradient(135deg, #ffd700 0%, #daa520 50%, #ffd700 100%)',
    cost: 500,
    bgPattern: '🥇',
  },
  diamond: {
    name: 'Diamond',
    color: 'from-cyan-300 to-blue-500',
    gradient: 'linear-gradient(135deg, #b9f2ff 0%, #00bfff 50%, #b9f2ff 100%)',
    cost: 2000,
    bgPattern: '💎',
  },
}

const rarityColors: Record<Prize['rarity'], string> = {
  common: 'text-gray-600 bg-gray-100',
  uncommon: 'text-green-600 bg-green-100',
  rare: 'text-blue-600 bg-blue-100',
  epic: 'text-purple-600 bg-purple-100',
  legendary: 'text-yellow-600 bg-yellow-100',
}

// Helper to get today's date string
const getDateString = () => new Date().toISOString().split('T')[0]

// Generate random prizes for a card
const generatePrizes = (tier: CardTier): Prize[] => {
  const pool = prizesByTier[tier]
  const prizes: Prize[] = []
  
  // Generate 9 prizes (3x3 grid)
  for (let i = 0; i < 9; i++) {
    // Weighted random selection based on rarity
    const weights: Record<Prize['rarity'], number> = {
      common: 50,
      uncommon: 30,
      rare: 15,
      epic: 4,
      legendary: 1,
    }
    
    const totalWeight = pool.reduce((sum, p) => sum + weights[p.rarity], 0)
    let random = Math.random() * totalWeight
    
    for (const prize of pool) {
      random -= weights[prize.rarity]
      if (random <= 0) {
        prizes.push(prize)
        break
      }
    }
    
    // Fallback to first prize if something went wrong
    if (prizes.length <= i) {
      prizes.push(pool[0])
    }
  }
  
  return prizes
}

// Audio context for sound effects
class SoundEffects {
  private audioContext: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  scratch() {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      filter.type = 'highpass'
      filter.frequency.value = 2000
      
      osc.type = 'sawtooth'
      osc.frequency.value = 100 + Math.random() * 200
      
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      
      gain.gain.value = 0.05
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.stop(ctx.currentTime + 0.05)
    } catch (e) {
      // Audio not available
    }
  }

  reveal() {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.value = 523.25 // C5
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      gain.gain.value = 0.15
      osc.start()
      
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.2) // C6
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) {
      // Audio not available
    }
  }

  win() {
    try {
      const ctx = this.getContext()
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          
          osc.type = 'sine'
          osc.frequency.value = freq
          
          osc.connect(gain)
          gain.connect(ctx.destination)
          
          gain.gain.value = 0.15
          osc.start()
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
          osc.stop(ctx.currentTime + 0.4)
        }, i * 100)
      })
    } catch (e) {
      // Audio not available
    }
  }

  bigWin() {
    try {
      const ctx = this.getContext()
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]
      
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          
          osc.type = 'square'
          osc.frequency.value = freq
          
          osc.connect(gain)
          gain.connect(ctx.destination)
          
          gain.gain.value = 0.1
          osc.start()
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
          osc.stop(ctx.currentTime + 0.5)
        }, i * 80)
      })
    } catch (e) {
      // Audio not available
    }
  }
}

export default function ScratchCardGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [card, setCard] = useState<ScratchCard | null>(null)
  const [selectedTier, setSelectedTier] = useState<CardTier>('bronze')
  const [coins, setCoins] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [isScratching, setIsScratching] = useState(false)
  const [scratchPercent, setScratchPercent] = useState(0)
  const [revealedPrizes, setRevealedPrizes] = useState<Set<number>>(new Set())
  const [freeCardAvailable, setFreeCardAvailable] = useState(false)
  const [lastFreeCard, setLastFreeCard] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [cardsScratched, setCardsScratched] = useState(0)
  const soundsRef = useRef<SoundEffects | null>(null)
  const lastScratchSoundRef = useRef(0)

  // Initialize
  useEffect(() => {
    soundsRef.current = new SoundEffects()
    
    // Load saved data
    const savedCoins = localStorage.getItem('scratch-card-coins')
    const savedWinnings = localStorage.getItem('scratch-card-winnings')
    const savedLastFree = localStorage.getItem('scratch-card-last-free')
    const savedCardsScratched = localStorage.getItem('scratch-card-count')
    
    if (savedCoins) setCoins(parseInt(savedCoins))
    if (savedWinnings) setTotalWinnings(parseInt(savedWinnings))
    if (savedLastFree) setLastFreeCard(savedLastFree)
    if (savedCardsScratched) setCardsScratched(parseInt(savedCardsScratched))
    
    // Check if free card is available
    const today = getDateString()
    setFreeCardAvailable(savedLastFree !== today)
  }, [])

  // Save coins when they change
  useEffect(() => {
    localStorage.setItem('scratch-card-coins', coins.toString())
  }, [coins])

  // Initialize canvas for scratching
  useEffect(() => {
    if (!card || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Draw scratch layer
    const config = tierConfig[card.tier]
    
    // Create metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    if (card.tier === 'bronze') {
      gradient.addColorStop(0, '#cd7f32')
      gradient.addColorStop(0.5, '#8b4513')
      gradient.addColorStop(1, '#cd7f32')
    } else if (card.tier === 'silver') {
      gradient.addColorStop(0, '#c0c0c0')
      gradient.addColorStop(0.5, '#808080')
      gradient.addColorStop(1, '#e8e8e8')
    } else if (card.tier === 'gold') {
      gradient.addColorStop(0, '#ffd700')
      gradient.addColorStop(0.5, '#daa520')
      gradient.addColorStop(1, '#ffed4a')
    } else {
      gradient.addColorStop(0, '#b9f2ff')
      gradient.addColorStop(0.5, '#00bfff')
      gradient.addColorStop(1, '#e0ffff')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Add pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let x = 0; x < rect.width; x += 20) {
      for (let y = 0; y < rect.height; y += 20) {
        if ((x + y) % 40 === 0) {
          ctx.fillRect(x, y, 10, 10)
        }
      }
    }

    // Add text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH ME!', rect.width / 2, rect.height / 2 + 8)

    // Add decorative icons
    ctx.font = '40px Arial'
    ctx.fillText(config.bgPattern, 40, 50)
    ctx.fillText(config.bgPattern, rect.width - 40, rect.height - 30)

    setScratchPercent(0)
    setRevealedPrizes(new Set())
  }, [card])

  // Handle scratching
  const scratch = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current || !card) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left)
    const y = (clientY - rect.top)

    // Erase circle at touch point
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, Math.PI * 2)
    ctx.fill()

    // Play scratch sound (throttled)
    const now = Date.now()
    if (now - lastScratchSoundRef.current > 50) {
      soundsRef.current?.scratch()
      lastScratchSoundRef.current = now
    }

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let transparentPixels = 0
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparentPixels++
    }
    const percent = (transparentPixels / (imageData.data.length / 4)) * 100
    setScratchPercent(percent)

    // Check which prizes are revealed (based on grid positions)
    const gridSize = rect.width / 3
    const gridY = rect.height / 3
    const newRevealed = new Set(revealedPrizes)

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const prizeIndex = row * 3 + col
        const prizeX = col * gridSize + gridSize / 2
        const prizeY = row * gridY + gridY / 2

        // Check if area around prize is mostly scratched
        const checkRadius = Math.min(gridSize, gridY) / 3
        const checkData = ctx.getImageData(
          (prizeX - checkRadius) * 2,
          (prizeY - checkRadius) * 2,
          checkRadius * 4,
          checkRadius * 4
        )
        
        let areaTransparent = 0
        for (let i = 3; i < checkData.data.length; i += 4) {
          if (checkData.data[i] === 0) areaTransparent++
        }
        
        if (areaTransparent / (checkData.data.length / 4) > 0.5 && !revealedPrizes.has(prizeIndex)) {
          newRevealed.add(prizeIndex)
          soundsRef.current?.reveal()
        }
      }
    }

    setRevealedPrizes(newRevealed)

    // Auto-reveal all if scratched enough
    if (percent > 60 && !showResult) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setScratchPercent(100)
      
      const allPrizes = new Set(Array.from({ length: 9 }, (_, i) => i))
      setRevealedPrizes(allPrizes)
      
      // Calculate total winnings for this card
      const cardTotal = card.prizes.reduce((sum, p) => sum + p.value, 0)
      setCoins(prev => prev + cardTotal)
      setTotalWinnings(prev => {
        const newTotal = prev + cardTotal
        localStorage.setItem('scratch-card-winnings', newTotal.toString())
        return newTotal
      })
      
      // Update cards scratched count
      setCardsScratched(prev => {
        const newCount = prev + 1
        localStorage.setItem('scratch-card-count', newCount.toString())
        return newCount
      })
      
      // Check for big wins
      const hasLegendary = card.prizes.some(p => p.rarity === 'legendary')
      const hasEpic = card.prizes.some(p => p.rarity === 'epic')
      
      if (hasLegendary) {
        soundsRef.current?.bigWin()
      } else if (hasEpic) {
        soundsRef.current?.win()
      } else {
        soundsRef.current?.reveal()
      }
      
      setShowResult(true)
    }
  }, [card, revealedPrizes, showResult])

  // Touch/Mouse handlers
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsScratching(true)
    
    if ('touches' in e) {
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    } else {
      scratch(e.clientX, e.clientY)
    }
  }

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isScratching) return
    e.preventDefault()
    
    if ('touches' in e) {
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    } else {
      scratch(e.clientX, e.clientY)
    }
  }

  const handleEnd = () => {
    setIsScratching(false)
  }

  // Buy/Get new card
  const getNewCard = (tier: CardTier) => {
    const config = tierConfig[tier]
    
    // Check if can afford or free card
    if (tier === 'bronze' && freeCardAvailable) {
      // Use free card
      const today = getDateString()
      setLastFreeCard(today)
      setFreeCardAvailable(false)
      localStorage.setItem('scratch-card-last-free', today)
    } else if (coins < config.cost) {
      return // Can't afford
    } else {
      // Pay for card
      setCoins(prev => prev - config.cost)
    }
    
    // Generate new card
    setCard({
      tier,
      prizes: generatePrizes(tier),
      isScratched: false,
      revealedCount: 0,
    })
    setShowResult(false)
    setScratchPercent(0)
    setRevealedPrizes(new Set())
  }

  const resetCard = () => {
    setCard(null)
    setShowResult(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <Link href="/games/arcade/" className="bg-white/20 backdrop-blur px-4 py-2 rounded-full font-bold text-white shadow-lg hover:bg-white/30 transition-all">
          ← Games
        </Link>
        
        <div className="flex gap-2">
          <div className="bg-yellow-500/90 px-4 py-2 rounded-full font-bold text-yellow-900 shadow-lg flex items-center gap-1">
            <span className="text-lg">🪙</span>
            <span>{coins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 mb-2 text-center drop-shadow-lg">
        🎰 Scratch Cards
      </h1>
      <p className="text-white/80 mb-4 text-center">
        Scratch to reveal your prizes!
      </p>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-center">
          <div className="text-2xl">🎫</div>
          <div className="text-white/70 text-xs">Scratched</div>
          <div className="text-white font-bold">{cardsScratched}</div>
        </div>
        <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-center">
          <div className="text-2xl">💰</div>
          <div className="text-white/70 text-xs">Total Won</div>
          <div className="text-white font-bold">{totalWinnings.toLocaleString()}</div>
        </div>
        {freeCardAvailable && (
          <div className="bg-green-500/90 px-4 py-2 rounded-lg text-center animate-pulse">
            <div className="text-2xl">🎁</div>
            <div className="text-white text-xs font-bold">FREE</div>
            <div className="text-white text-xs">Card!</div>
          </div>
        )}
      </div>

      {!card ? (
        /* Card Selection */
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Choose Your Card</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(tierConfig) as CardTier[]).map(tier => {
              const config = tierConfig[tier]
              const canAfford = tier === 'bronze' ? freeCardAvailable || coins >= 0 : coins >= config.cost
              const isFree = tier === 'bronze' && freeCardAvailable
              
              return (
                <button
                  key={tier}
                  onClick={() => getNewCard(tier)}
                  disabled={!canAfford && !isFree}
                  className={`
                    relative p-4 rounded-xl shadow-xl transition-all
                    ${canAfford || isFree ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  `}
                  style={{ background: config.gradient }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-2">{config.bgPattern}</div>
                    <div className="text-xl font-black text-white drop-shadow-md">{config.name}</div>
                    <div className="text-white/90 font-bold mt-1">
                      {isFree ? (
                        <span className="text-green-200 animate-pulse">🎁 FREE!</span>
                      ) : config.cost === 0 ? (
                        'Play Anytime'
                      ) : (
                        `🪙 ${config.cost}`
                      )}
                    </div>
                  </div>
                  
                  {/* Lock overlay */}
                  {!canAfford && !isFree && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Free card timer hint */}
          {!freeCardAvailable && (
            <p className="text-white/60 text-center mt-4 text-sm">
              🕐 Free card refreshes daily at midnight!
            </p>
          )}
        </div>
      ) : (
        /* Active Card */
        <div className="w-full max-w-sm">
          {/* Card Header */}
          <div 
            className="text-center py-2 rounded-t-xl font-bold text-white text-lg"
            style={{ background: tierConfig[card.tier].gradient }}
          >
            {tierConfig[card.tier].bgPattern} {tierConfig[card.tier].name} Card {tierConfig[card.tier].bgPattern}
          </div>
          
          {/* Scratch Area */}
          <div className="relative bg-white rounded-b-xl overflow-hidden shadow-2xl">
            {/* Prize Grid (underneath) */}
            <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
              {card.prizes.map((prize, index) => (
                <div
                  key={index}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg
                    ${revealedPrizes.has(index) ? 'animate-pop' : ''}
                    ${rarityColors[prize.rarity]}
                  `}
                >
                  <span className="text-3xl md:text-4xl">{prize.emoji}</span>
                  <span className="text-xs font-bold mt-1">+{prize.value}</span>
                </div>
              ))}
            </div>

            {/* Canvas Scratch Layer */}
            <canvas
              ref={canvasRef}
              className="relative w-full aspect-square cursor-pointer touch-none"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-200"
              style={{ width: `${scratchPercent}%` }}
            />
          </div>
          <p className="text-white/70 text-center text-sm mt-1">
            {scratchPercent < 60 ? `${Math.round(scratchPercent)}% scratched` : '✨ Revealed!'}
          </p>

          {/* Results */}
          {showResult && (
            <div className="mt-6 text-center animate-fadeIn">
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <h3 className="text-2xl font-black text-yellow-300 mb-2">
                  🎉 You Won!
                </h3>
                <div className="text-4xl font-black text-white mb-4">
                  🪙 {card.prizes.reduce((sum, p) => sum + p.value, 0).toLocaleString()}
                </div>
                
                {/* Special prize callout */}
                {card.prizes.some(p => p.rarity === 'legendary') && (
                  <div className="bg-yellow-500/30 rounded-lg p-2 mb-4 animate-pulse">
                    <span className="text-xl font-bold text-yellow-300">
                      ⭐ LEGENDARY PRIZE! ⭐
                    </span>
                  </div>
                )}
                {card.prizes.some(p => p.rarity === 'epic') && !card.prizes.some(p => p.rarity === 'legendary') && (
                  <div className="bg-purple-500/30 rounded-lg p-2 mb-4">
                    <span className="text-lg font-bold text-purple-300">
                      💜 Epic Prize!
                    </span>
                  </div>
                )}

                <button
                  onClick={resetCard}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
                >
                  🎰 Get Another Card
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed top-20 left-10 text-4xl animate-float opacity-60">✨</div>
      <div className="fixed top-32 right-8 text-3xl animate-float opacity-50" style={{ animationDelay: '0.5s' }}>💫</div>
      <div className="fixed bottom-24 left-8 text-4xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🌟</div>
      <div className="fixed bottom-16 right-12 text-3xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>⭐</div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
