'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTreasureHunt, RARITY_CONFIG, TreasureChest } from '@/hooks/useTreasureHunt'

interface HiddenTreasureProps {
  chestId: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  revealStyle?: 'inline' | 'fixed' | 'replace'
}

/**
 * HiddenTreasure - Invisible trigger zones that reveal treasure when conditions are met.
 * Place these around pages where you want hidden treasures.
 * 
 * Usage examples:
 * - <HiddenTreasure chestId="home_welcome" /> - Auto-triggers based on chest config
 * - <HiddenTreasure chestId="games_click"><button>Secret</button></HiddenTreasure>
 */
export function HiddenTreasure({ 
  chestId, 
  className = '',
  style,
  children,
  revealStyle = 'fixed'
}: HiddenTreasureProps) {
  const { findChest, isChestFound, getChest, mounted } = useTreasureHunt()
  const [triggered, setTriggered] = useState(false)
  const [showChest, setShowChest] = useState(false)
  const [hoverCount, setHoverCount] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const chest = getChest(chestId)
  const found = isChestFound(chestId)

  // Trigger the treasure reveal
  const triggerChest = useCallback(() => {
    if (!chest || found || triggered) return

    setTriggered(true)
    setShowChest(true)
    
    // Auto-claim after animation
    setTimeout(() => {
      findChest(chestId)
    }, 1500)
  }, [chest, found, triggered, findChest, chestId])

  // Click trigger
  const handleClick = () => {
    if (chest?.triggerType === 'click') {
      triggerChest()
    }
  }

  // Hover trigger
  const handleMouseEnter = () => {
    if (chest?.triggerType === 'hover') {
      const newCount = hoverCount + 1
      setHoverCount(newCount)
      if (newCount >= (chest.triggerData?.hoverCount || 3)) {
        triggerChest()
      }
    }
  }

  // Time trigger - track time on page
  useEffect(() => {
    if (!chest || found || chest.triggerType !== 'time' || triggered) return

    const interval = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1
        if (newTime >= (chest.triggerData?.timeSeconds || 30)) {
          triggerChest()
          clearInterval(interval)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [chest, found, triggered, triggerChest])

  // Scroll trigger
  useEffect(() => {
    if (!chest || found || chest.triggerType !== 'scroll' || triggered) return

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
      
      if (scrollPercentage >= (chest.triggerData?.scrollPercentage || 50)) {
        triggerChest()
      }
    }

    // Check immediately in case already scrolled
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chest, found, triggered, triggerChest])

  // Sequence trigger (Konami code, etc.)
  useEffect(() => {
    if (!chest || found || chest.triggerType !== 'sequence' || triggered) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const keyMap: Record<string, string> = {
        arrowup: 'up',
        arrowdown: 'down',
        arrowleft: 'left',
        arrowright: 'right',
        enter: 'enter',
        ' ': 'space',
      }
      const mappedKey = keyMap[key] || key
      const targetSequence = chest.triggerData?.sequence || []

      setSequenceProgress(prev => {
        const newProgress = [...prev, mappedKey].slice(-targetSequence.length)
        
        if (
          newProgress.length === targetSequence.length &&
          newProgress.every((k, i) => k === targetSequence[i])
        ) {
          triggerChest()
          return []
        }
        
        return newProgress
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chest, found, triggered, triggerChest])

  if (!chest || !mounted) return null
  if (found) return null // Already found

  const rarityConfig = RARITY_CONFIG[chest.reward.rarity]

  return (
    <>
      {/* Invisible trigger zone (or wrapper for children) */}
      <div
        ref={containerRef}
        className={`${className} ${!children ? 'absolute inset-0 pointer-events-none' : ''}`}
        style={style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        {children}
      </div>

      {/* Chest reveal animation */}
      <AnimatePresence>
        {showChest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              z-50 flex items-center justify-center
              ${revealStyle === 'fixed' ? 'fixed inset-0 bg-black/50 backdrop-blur-sm' : 'absolute inset-0'}
            `}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative"
            >
              {/* Chest container */}
              <div className={`
                w-32 h-32 rounded-2xl flex items-center justify-center
                ${rarityConfig.bg} ${rarityConfig.border} border-4
                ${rarityConfig.glow}
              `}>
                <motion.span
                  className="text-6xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  🎁
                </motion.span>
              </div>

              {/* Sparkle burst */}
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    ['bg-onde-gold', 'bg-onde-coral', 'bg-onde-ocean', 'bg-purple-500', 'bg-pink-400', 'bg-white'][i % 6]
                  }`}
                  initial={{ 
                    x: 64, y: 64,
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: 64 + Math.cos(i * (360 / 16) * Math.PI / 180) * 100,
                    y: 64 + Math.sin(i * (360 / 16) * Math.PI / 180) * 100,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    ease: 'easeOut',
                    delay: 0.3
                  }}
                />
              ))}

              {/* Reward text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap
                           bg-white rounded-xl px-4 py-2 shadow-lg text-center"
              >
                <div className="text-2xl mb-1">{chest.reward.icon}</div>
                <div className={`font-bold ${rarityConfig.color}`}>{chest.reward.name}</div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * TreasureZone - Marks a page as having treasure(s)
 * Automatically sets up listeners for all chests on this route
 */
export function TreasureZone({ route }: { route: string }) {
  const { getChestsForLocation, isChestFound, mounted } = useTreasureHunt()
  
  if (!mounted) return null
  
  const chests = getChestsForLocation(route)
  const unfound = chests.filter(c => !isChestFound(c.id))
  
  if (unfound.length === 0) return null
  
  return (
    <>
      {unfound.map(chest => (
        <HiddenTreasure key={chest.id} chestId={chest.id} />
      ))}
    </>
  )
}

/**
 * Global treasure listener - add to layout for Konami code and other global triggers
 */
export function GlobalTreasureListener() {
  const { allChests, isChestFound, findChest, mounted } = useTreasureHunt()
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([])

  // Find global sequence-based chests
  const sequenceChests = allChests.filter(
    c => c.triggerType === 'sequence' && c.location === '/' && !isChestFound(c.id)
  )

  useEffect(() => {
    if (!mounted || sequenceChests.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const keyMap: Record<string, string> = {
        arrowup: 'up',
        arrowdown: 'down',
        arrowleft: 'left',
        arrowright: 'right',
        enter: 'enter',
        ' ': 'space',
      }
      const mappedKey = keyMap[key] || key

      setSequenceProgress(prev => {
        const newProgress = [...prev, mappedKey].slice(-10) // Keep last 10 keys

        // Check each sequence chest
        for (const chest of sequenceChests) {
          const seq = chest.triggerData?.sequence || []
          const lastN = newProgress.slice(-seq.length)
          
          if (lastN.length === seq.length && lastN.every((k, i) => k === seq[i])) {
            findChest(chest.id)
            return []
          }
        }

        return newProgress
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, sequenceChests, findChest])

  return null
}

export default HiddenTreasure
