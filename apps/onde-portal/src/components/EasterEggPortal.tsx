'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Portal from './Portal'
import { usePortalDiscovery } from '@/hooks/usePortalDiscovery'

interface EasterEggPortalProps {
  portalId: string
  triggerType: 'click' | 'hover' | 'proximity' | 'sequence'
  triggerSequence?: string[] // For sequence trigger (e.g., ['up', 'up', 'down', 'down'])
  proximityDistance?: number // For proximity trigger
  children: React.ReactNode
  onDiscover?: () => void
  onEnter?: () => void
  className?: string
}

export default function EasterEggPortal({
  portalId,
  triggerType,
  triggerSequence = [],
  proximityDistance = 100,
  children,
  onDiscover,
  onEnter,
  className = '',
}: EasterEggPortalProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([])
  const [hoverCount, setHoverCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const { discoverPortal, isPortalDiscovered } = usePortalDiscovery()

  // Handle sequence input (keyboard)
  useEffect(() => {
    if (triggerType !== 'sequence') return

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

      setSequenceProgress((prev) => {
        const newProgress = [...prev, mappedKey].slice(-triggerSequence.length)
        
        // Check if sequence matches
        if (
          newProgress.length === triggerSequence.length &&
          newProgress.every((k, i) => k === triggerSequence[i])
        ) {
          revealPortal()
          return []
        }
        
        return newProgress
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerType, triggerSequence])

  // Reveal portal
  const revealPortal = useCallback(() => {
    if (isRevealed) return
    
    setIsRevealed(true)
    
    // Discover if not already
    if (!isPortalDiscovered(portalId)) {
      discoverPortal(portalId)
      onDiscover?.()
    }
  }, [isRevealed, isPortalDiscovered, portalId, discoverPortal, onDiscover])

  // Handle click trigger
  const handleClick = () => {
    if (triggerType === 'click') {
      revealPortal()
    }
  }

  // Handle hover trigger (requires multiple hovers)
  const handleHover = () => {
    if (triggerType === 'hover') {
      const newCount = hoverCount + 1
      setHoverCount(newCount)
      
      if (newCount >= 3) {
        revealPortal()
      } else if (newCount >= 2) {
        setShowHint(true)
        setTimeout(() => setShowHint(false), 2000)
      }
    }
  }

  // Handle proximity (mouse position)
  useEffect(() => {
    if (triggerType !== 'proximity') return

    const container = document.getElementById(`easter-egg-${portalId}`)
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )

      if (distance < proximityDistance) {
        revealPortal()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [triggerType, portalId, proximityDistance, revealPortal])

  return (
    <div
      id={`easter-egg-${portalId}`}
      className={`relative ${className}`}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {/* Original content (hidden object) */}
      <motion.div
        animate={{
          opacity: isRevealed ? 0 : 1,
          scale: isRevealed ? 0.8 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        {children}

        {/* Subtle shimmer hint for undiscovered */}
        {!isRevealed && !isPortalDiscovered(portalId) && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
          </motion.div>
        )}
      </motion.div>

      {/* Hover hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                       px-3 py-1.5 rounded-lg bg-onde-ocean/80 text-white text-sm
                       shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Something magical here... ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed portal */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Magical reveal particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-onde-gold"
                initial={{ 
                  x: 0, 
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.02,
                  ease: 'easeOut',
                }}
              />
            ))}

            <Portal
              portalId={portalId}
              size="md"
              onEnter={onEnter}
              autoDiscover={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery celebration */}
      <AnimatePresence>
        {isRevealed && !isPortalDiscovered(portalId) && (
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-onde-gold to-onde-coral
                           text-white font-bold shadow-xl shadow-onde-gold/30">
              🎉 Secret Portal Found!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Konami code Easter Egg wrapper
export function KonamiPortal({
  portalId,
  children,
  onDiscover,
  onEnter,
  className = '',
}: Omit<EasterEggPortalProps, 'triggerType' | 'triggerSequence'>) {
  const konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']

  return (
    <EasterEggPortal
      portalId={portalId}
      triggerType="sequence"
      triggerSequence={konamiCode}
      onDiscover={onDiscover}
      onEnter={onEnter}
      className={className}
    >
      {children}
    </EasterEggPortal>
  )
}

// Hidden in corner Easter Egg
export function CornerPortal({
  portalId,
  corner = 'bottom-right',
  children,
  onDiscover,
  onEnter,
}: {
  portalId: string
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  children: React.ReactNode
  onDiscover?: () => void
  onEnter?: () => void
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const { discoverPortal, isPortalDiscovered } = usePortalDiscovery()

  const cornerPositions = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }

  const handleDiscover = () => {
    setIsRevealed(true)
    if (!isPortalDiscovered(portalId)) {
      discoverPortal(portalId)
      onDiscover?.()
    }
  }

  return (
    <div className="relative">
      {children}

      {/* Hidden trigger area */}
      <motion.button
        className={`absolute ${cornerPositions[corner]} w-8 h-8 rounded-full 
                   opacity-0 hover:opacity-20 transition-opacity cursor-default`}
        onClick={handleDiscover}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="sr-only">Hidden portal</span>
      </motion.button>

      {/* Revealed mini portal */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            className={`absolute ${cornerPositions[corner]} z-50`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Portal
              portalId={portalId}
              size="sm"
              showLabel={false}
              onEnter={onEnter}
              autoDiscover={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
