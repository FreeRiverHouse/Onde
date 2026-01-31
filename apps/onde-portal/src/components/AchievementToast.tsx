'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Achievement, RARITY_CONFIG, AchievementRarity } from '@/hooks/useAchievements'

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
  autoHideDuration?: number
}

export function AchievementToast({ 
  achievement, 
  onDismiss, 
  autoHideDuration = 5000 
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for exit animation
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [achievement, autoHideDuration, onDismiss])

  if (!achievement) return null

  const rarityConfig = RARITY_CONFIG[achievement.rarity]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto"
          onClick={() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300)
          }}
        >
          <div className={`
            relative overflow-hidden rounded-2xl p-1
            ${achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-onde-gold via-amber-300 to-onde-gold animate-gradient-x' : ''}
            ${achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500' : ''}
            ${achievement.rarity === 'rare' ? 'bg-gradient-to-r from-onde-ocean via-onde-teal to-onde-ocean' : ''}
            ${achievement.rarity === 'common' ? 'bg-gradient-to-r from-gray-400 to-gray-500' : ''}
          `}>
            <div className={`
              relative bg-white/95 backdrop-blur-xl rounded-xl p-4 
              flex items-center gap-4 min-w-[320px] max-w-[400px]
              ${rarityConfig.glow}
            `}>
              {/* Icon with animated background */}
              <div className={`
                relative w-16 h-16 rounded-xl flex items-center justify-center
                ${rarityConfig.bg} ${rarityConfig.border} border-2
                ${achievement.rarity === 'legendary' ? 'animate-pulse' : ''}
              `}>
                <span className="text-3xl">{achievement.icon}</span>
                
                {/* Sparkle effects for legendary */}
                {achievement.rarity === 'legendary' && (
                  <>
                    <motion.div
                      className="absolute top-0 right-0 w-2 h-2 bg-onde-gold rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <motion.div
                      className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-amber-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                    />
                  </>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    text-xs font-bold uppercase tracking-wider
                    ${rarityConfig.color}
                  `}>
                    {rarityConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    +{rarityConfig.points} pts
                  </span>
                </div>
                
                <h3 className="font-display font-bold text-onde-ocean text-lg leading-tight">
                  {achievement.name}
                </h3>
                
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                  {achievement.description}
                </p>
              </div>

              {/* Achievement unlocked badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="absolute -top-2 -right-2 bg-green-500 text-white 
                           rounded-full p-1.5 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            className="h-1 bg-gray-200 rounded-full mt-2 mx-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className={`h-full ${
                achievement.rarity === 'legendary' ? 'bg-onde-gold' :
                achievement.rarity === 'epic' ? 'bg-purple-500' :
                achievement.rarity === 'rare' ? 'bg-onde-ocean' :
                'bg-gray-400'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast container that manages a queue of achievements
interface AchievementToastContainerProps {
  toastQueue: Achievement[]
  onPopQueue: () => Achievement | undefined
}

export function AchievementToastContainer({ 
  toastQueue, 
  onPopQueue 
}: AchievementToastContainerProps) {
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null)

  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      const next = onPopQueue()
      if (next) {
        setCurrentToast(next)
      }
    }
  }, [toastQueue, currentToast, onPopQueue])

  const handleDismiss = useCallback(() => {
    setCurrentToast(null)
  }, [])

  return (
    <AchievementToast 
      achievement={currentToast} 
      onDismiss={handleDismiss} 
    />
  )
}

// Compact toast variant for inline use
interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  progress?: { current: number; max: number }
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementBadge({ 
  achievement, 
  unlocked, 
  progress,
  onClick,
  size = 'md'
}: AchievementBadgeProps) {
  const rarityConfig = RARITY_CONFIG[achievement.rarity]
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative rounded-xl flex items-center justify-center
        transition-all duration-300 ${sizeClasses[size]}
        ${unlocked 
          ? `${rarityConfig.bg} ${rarityConfig.border} border-2 ${rarityConfig.glow}` 
          : 'bg-gray-100 border-2 border-gray-200 opacity-50 grayscale'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      disabled={!onClick}
    >
      <span className={unlocked ? '' : 'opacity-30'}>
        {achievement.secret && !unlocked ? '❓' : achievement.icon}
      </span>

      {/* Progress indicator */}
      {progress && !unlocked && progress.max > 1 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                       bg-white rounded-full px-1.5 py-0.5 text-[10px] 
                       font-medium shadow-sm border border-gray-200">
          {progress.current}/{progress.max}
        </div>
      )}

      {/* Unlocked checkmark */}
      {unlocked && (
        <div className="absolute -top-1 -right-1 bg-green-500 text-white 
                       rounded-full p-0.5 shadow-sm">
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.button>
  )
}

// Add keyframes for gradient animation
const style = typeof document !== 'undefined' ? document.createElement('style') : null
if (style) {
  style.textContent = `
    @keyframes gradient-x {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .animate-gradient-x {
      background-size: 200% 200%;
      animation: gradient-x 3s ease infinite;
    }
  `
  if (typeof document !== 'undefined' && !document.head.querySelector('[data-achievement-styles]')) {
    style.setAttribute('data-achievement-styles', 'true')
    document.head.appendChild(style)
  }
}
