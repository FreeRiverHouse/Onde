'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import Link from 'next/link'
import { useCoins, formatCoinAmount } from '@/hooks/useCoins'

interface CoinAnimationProps {
  amount: number
  onComplete: () => void
}

function CoinAnimation({ amount, onComplete }: CoinAnimationProps) {
  const controls = useAnimationControls()
  
  useEffect(() => {
    controls.start({
      y: [-20, -50],
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.8],
      transition: { duration: 1.5, times: [0, 0.3, 1] }
    }).then(onComplete)
  }, [controls, onComplete])
  
  return (
    <motion.div
      className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
      animate={controls}
      initial={{ y: 0, opacity: 0 }}
    >
      <span className="text-lg font-bold text-onde-gold drop-shadow-lg whitespace-nowrap">
        +{formatCoinAmount(amount)} 🪙
      </span>
    </motion.div>
  )
}

interface FloatingCoinsProps {
  count: number
  targetRef: React.RefObject<HTMLElement | null>
}

function FloatingCoins({ count, targetRef }: FloatingCoinsProps) {
  const coins = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    id: i,
    startX: Math.random() * 200 - 100,
    startY: Math.random() * 200 + 100,
    delay: i * 0.1
  }))
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          className="absolute text-2xl"
          initial={{ 
            x: window.innerWidth / 2 + coin.startX, 
            y: window.innerHeight / 2 + coin.startY,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: targetRef.current?.getBoundingClientRect().left || 0,
            y: targetRef.current?.getBoundingClientRect().top || 0,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            delay: coin.delay,
            ease: 'easeInOut'
          }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  )
}

export default function CoinDisplay() {
  const { balance, mounted, pendingAnimations, popPendingAnimation, getActiveEvents } = useCoins()
  const [currentAnimation, setCurrentAnimation] = useState<{ id: string; amount: number } | null>(null)
  const [showFloating, setShowFloating] = useState(false)
  const [floatingCount, setFloatingCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()
  
  const activeEvents = getActiveEvents()
  
  // Process pending animations
  useEffect(() => {
    if (pendingAnimations.length > 0 && !currentAnimation) {
      const next = popPendingAnimation()
      if (next) {
        setCurrentAnimation({ id: next.id, amount: next.amount })
        
        // Trigger coin balance bounce
        controls.start({
          scale: [1, 1.2, 1],
          transition: { duration: 0.3 }
        })
        
        // Show floating coins for larger amounts
        if (next.amount >= 25) {
          setFloatingCount(Math.min(Math.floor(next.amount / 10), 15))
          setShowFloating(true)
          setTimeout(() => setShowFloating(false), 2000)
        }
      }
    }
  }, [pendingAnimations, currentAnimation, popPendingAnimation, controls])
  
  const handleAnimationComplete = useCallback(() => {
    setCurrentAnimation(null)
  }, [])
  
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-onde-cream/50">
        <span className="text-lg">🪙</span>
        <span className="font-medium text-onde-ocean/50">---</span>
      </div>
    )
  }
  
  return (
    <>
      <Link href="/shop">
        <motion.div
          ref={containerRef}
          className="relative flex items-center gap-2 px-3 py-2 rounded-xl
                     bg-gradient-to-r from-onde-gold/10 to-amber-100/50
                     border border-onde-gold/20 cursor-pointer
                     hover:from-onde-gold/20 hover:to-amber-100/70
                     transition-colors duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={controls}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Coin icon with shimmer */}
          <motion.span 
            className="text-xl"
            animate={isHovered ? { 
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 }
            } : {}}
          >
            🪙
          </motion.span>
          
          {/* Balance */}
          <span className="font-bold text-onde-ocean">
            {formatCoinAmount(balance)}
          </span>
          
          {/* Multiplier indicator */}
          {activeEvents.length > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 
                         bg-gradient-to-r from-purple-500 to-pink-500
                         text-white rounded-full font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {activeEvents[0].multiplier}x
            </motion.span>
          )}
          
          {/* Current animation */}
          <AnimatePresence>
            {currentAnimation && (
              <CoinAnimation 
                key={currentAnimation.id}
                amount={currentAnimation.amount}
                onComplete={handleAnimationComplete}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
      
      {/* Floating coins effect */}
      <AnimatePresence>
        {showFloating && (
          <FloatingCoins 
            count={floatingCount} 
            targetRef={containerRef as React.RefObject<HTMLElement>} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Compact version for mobile
export function CoinDisplayCompact() {
  const { balance, mounted } = useCoins()
  
  if (!mounted) {
    return <span className="text-onde-ocean/50">🪙 ---</span>
  }
  
  return (
    <Link href="/shop">
      <motion.div
        className="flex items-center gap-1 text-sm font-medium text-onde-ocean"
        whileTap={{ scale: 0.95 }}
      >
        <span>🪙</span>
        <span>{formatCoinAmount(balance)}</span>
      </motion.div>
    </Link>
  )
}

// Large display for shop/profile
export function CoinDisplayLarge() {
  const { balance, lifetimeEarned, lifetimeSpent, loginStreak, mounted, getActiveEvents, claimDailyLogin } = useCoins()
  const [dailyClaimed, setDailyClaimed] = useState(false)
  const [claimResult, setClaimResult] = useState<{ earned: number; streak: number } | null>(null)
  
  const activeEvents = getActiveEvents()
  
  const handleClaimDaily = () => {
    const result = claimDailyLogin()
    if (result) {
      setDailyClaimed(true)
      setClaimResult(result)
    }
  }
  
  if (!mounted) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-2xl h-40 w-full" />
    )
  }
  
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-onde-gold/20 via-amber-50 to-yellow-100
                 border-2 border-onde-gold/30 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-8xl rotate-12">🪙</div>
        <div className="absolute bottom-4 left-4 text-6xl -rotate-12">✨</div>
      </div>
      
      <div className="relative z-10">
        {/* Main balance */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-onde-ocean/60 mb-1">Il tuo Tesoro</p>
          <motion.div
            className="flex items-center justify-center gap-3"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <span className="text-4xl">🪙</span>
            <span className="text-5xl font-bold text-onde-ocean">
              {balance.toLocaleString()}
            </span>
          </motion.div>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-xs text-onde-ocean/50">Guadagnate</p>
            <p className="text-lg font-bold text-green-600">+{formatCoinAmount(lifetimeEarned)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-onde-ocean/50">Spese</p>
            <p className="text-lg font-bold text-red-500">-{formatCoinAmount(lifetimeSpent)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-onde-ocean/50">Serie</p>
            <p className="text-lg font-bold text-purple-600">{loginStreak} 🔥</p>
          </div>
        </div>
        
        {/* Daily login */}
        {!dailyClaimed ? (
          <motion.button
            onClick={handleClaimDaily}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-onde-gold to-amber-500
                       text-white font-bold shadow-lg shadow-onde-gold/30
                       hover:shadow-xl hover:shadow-onde-gold/40 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎁 Riscatta Bonus Giornaliero
          </motion.button>
        ) : claimResult ? (
          <motion.div
            className="text-center py-3 rounded-xl bg-green-100 border border-green-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="font-bold text-green-700">
              +{claimResult.earned} monete! 🎉
            </p>
            <p className="text-sm text-green-600">
              Serie di {claimResult.streak} giorni!
            </p>
          </motion.div>
        ) : (
          <div className="text-center py-3 rounded-xl bg-gray-100 text-gray-500">
            ✓ Bonus già riscattato oggi
          </div>
        )}
        
        {/* Active events */}
        {activeEvents.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeEvents[0].icon}</span>
              <div>
                <p className="font-bold text-purple-700">{activeEvents[0].name}</p>
                <p className="text-xs text-purple-600">{activeEvents[0].description}</p>
              </div>
              <span className="ml-auto text-2xl font-black text-purple-600">
                {activeEvents[0].multiplier}x
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
