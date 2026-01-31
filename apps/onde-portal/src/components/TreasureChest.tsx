'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTreasureHunt, TreasureChest as ChestType, RARITY_CONFIG, DIFFICULTY_CONFIG } from '@/hooks/useTreasureHunt'

interface TreasureChestProps {
  chestId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showHintOnHover?: boolean
}

// Main TreasureChest component - place this where chests should appear
export function TreasureChest({ 
  chestId, 
  className = '', 
  size = 'md',
  showHintOnHover = false 
}: TreasureChestProps) {
  const { findChest, isChestFound, getChest, mounted } = useTreasureHunt()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [hoverCount, setHoverCount] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const chest = getChest(chestId)
  const found = isChestFound(chestId)

  // Handle trigger based on type
  const handleTrigger = useCallback(() => {
    if (!chest || found || isOpen) return

    const success = findChest(chestId)
    if (success) {
      setIsOpen(true)
      setTimeout(() => setShowReward(true), 600)
    }
  }, [chest, found, isOpen, findChest, chestId])

  // Click trigger
  const handleClick = () => {
    if (chest?.triggerType === 'click') {
      handleTrigger()
    }
  }

  // Hover trigger
  const handleMouseEnter = () => {
    setIsHovering(true)
    if (chest?.triggerType === 'hover') {
      const newCount = hoverCount + 1
      setHoverCount(newCount)
      if (newCount >= (chest.triggerData?.hoverCount || 3)) {
        handleTrigger()
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  // Time trigger
  useEffect(() => {
    if (!chest || found || chest.triggerType !== 'time') return

    const interval = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1
        if (newTime >= (chest.triggerData?.timeSeconds || 30)) {
          handleTrigger()
          clearInterval(interval)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [chest, found, handleTrigger])

  // Sequence trigger (keyboard)
  useEffect(() => {
    if (!chest || found || chest.triggerType !== 'sequence') return

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
          handleTrigger()
          return []
        }
        
        return newProgress
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chest, found, handleTrigger])

  // Scroll trigger
  useEffect(() => {
    if (!chest || found || chest.triggerType !== 'scroll') return

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercentage >= (chest.triggerData?.scrollPercentage || 50)) {
        handleTrigger()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chest, found, handleTrigger])

  if (!chest || !mounted) return null
  if (found && !isOpen) return null // Already found, don't show again

  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl'
  }

  const rarityConfig = RARITY_CONFIG[chest.reward.rarity]
  const difficultyConfig = DIFFICULTY_CONFIG[chest.difficulty]

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // Closed chest with shimmer animation
          <motion.div
            key="closed"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            className={`
              relative ${sizeClasses[size]} rounded-xl flex items-center justify-center
              cursor-pointer select-none
              ${rarityConfig.bg} ${rarityConfig.border} border-2
              hover:scale-110 transition-transform duration-200
              ${rarityConfig.glow}
            `}
          >
            {/* Chest emoji */}
            <span className="relative z-10">📦</span>

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-xl overflow-hidden"
              initial={false}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'linear',
                  repeatDelay: 1
                }}
              />
            </motion.div>

            {/* Sparkle particles for rare+ chests */}
            {chest.reward.rarity !== 'common' && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-onde-gold"
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <motion.div
                  className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-onde-gold"
                  animate={{ 
                    scale: [1, 1.3, 1], 
                    opacity: [0.5, 1, 0.5] 
                  }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
              </>
            )}

            {/* Legendary glow pulse */}
            {chest.reward.rarity === 'legendary' && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-onde-gold"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}

            {/* Hint tooltip */}
            {showHintOnHover && isHovering && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                           bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg
                           whitespace-nowrap z-20"
              >
                {chest.hint}
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Open chest with reward
          <motion.div
            key="open"
            initial={{ scale: 1.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`
              relative ${sizeClasses[size]} rounded-xl flex items-center justify-center
              ${rarityConfig.bg} ${rarityConfig.border} border-2 ${rarityConfig.glow}
            `}
          >
            {/* Open chest emoji */}
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              🎁
            </motion.span>

            {/* Confetti burst */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  ['bg-onde-gold', 'bg-onde-coral', 'bg-onde-ocean', 'bg-purple-500', 'bg-pink-400'][i % 5]
                }`}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.cos(i * 30 * Math.PI / 180) * 60,
                  y: Math.sin(i * 30 * Math.PI / 180) * 60 - 20,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  ease: 'easeOut'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward popup */}
      <AnimatePresence>
        {showReward && (
          <TreasureRewardPopup
            chest={chest}
            onClose={() => {
              setShowReward(false)
              setIsOpen(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Reward popup component
interface TreasureRewardPopupProps {
  chest: ChestType
  onClose: () => void
}

function TreasureRewardPopup({ chest, onClose }: TreasureRewardPopupProps) {
  const rarityConfig = RARITY_CONFIG[chest.reward.rarity]

  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`
          relative bg-white rounded-3xl p-8 max-w-sm mx-4
          ${rarityConfig.glow} border-4 ${rarityConfig.border}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient background based on rarity */}
        <div className={`
          absolute inset-0 rounded-3xl opacity-20
          ${chest.reward.rarity === 'legendary' ? 'bg-gradient-to-br from-onde-gold via-amber-200 to-onde-gold animate-gradient-x' : ''}
          ${chest.reward.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : ''}
          ${chest.reward.rarity === 'rare' ? 'bg-gradient-to-br from-onde-ocean to-onde-teal' : ''}
        `} />

        {/* Content */}
        <div className="relative text-center">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2 text-gray-800"
          >
            🎉 Treasure Found!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mb-6"
          >
            {chest.name}
          </motion.p>

          {/* Reward icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className={`
              w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4
              ${rarityConfig.bg} ${rarityConfig.border} border-2 ${rarityConfig.glow}
            `}
          >
            <span className="text-5xl">{chest.reward.icon}</span>
          </motion.div>

          {/* Reward details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className={`text-xl font-bold ${rarityConfig.color}`}>
              {chest.reward.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {chest.reward.description}
            </p>

            {/* Rarity badge */}
            <div className={`
              inline-block mt-4 px-3 py-1 rounded-full text-sm font-medium
              ${rarityConfig.bg} ${rarityConfig.color} ${rarityConfig.border} border
            `}>
              {rarityConfig.label}
            </div>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-onde-ocean text-white rounded-full
                       hover:bg-onde-ocean/90 transition-colors font-medium"
          >
            Awesome! 🎊
          </motion.button>
        </div>

        {/* Floating particles for legendary */}
        {chest.reward.rarity === 'legendary' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-onde-gold"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + Math.random(),
                  delay: Math.random()
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// Treasure Map component
export function TreasureMap() {
  const { allChests, isChestFound, stats, mounted } = useTreasureHunt()
  const [selectedChest, setSelectedChest] = useState<ChestType | null>(null)

  if (!mounted) return null

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-amber-100 to-amber-50 
                    rounded-2xl border-4 border-amber-800/30 overflow-hidden">
      {/* Map grid background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-amber-800"/>
        </svg>
      </div>

      {/* Compass rose */}
      <div className="absolute top-4 right-4 text-4xl opacity-50">🧭</div>

      {/* Map title */}
      <div className="absolute top-4 left-4 bg-amber-100/80 px-4 py-2 rounded-lg border border-amber-800/20">
        <h3 className="text-lg font-bold text-amber-900">Treasure Map</h3>
        <p className="text-sm text-amber-700">
          {stats.foundCount}/{stats.totalChests} found
        </p>
      </div>

      {/* Chest markers */}
      {allChests.map(chest => {
        if (!chest.coordinates) return null
        const found = isChestFound(chest.id)
        
        // Don't show secret chests that haven't been found
        if (chest.isSecret && !found) return null

        const rarityConfig = RARITY_CONFIG[chest.reward.rarity]

        return (
          <motion.div
            key={chest.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute cursor-pointer"
            style={{
              left: `${chest.coordinates.x}%`,
              top: `${chest.coordinates.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedChest(chest)}
            whileHover={{ scale: 1.2 }}
          >
            <div className={`
              relative w-10 h-10 rounded-full flex items-center justify-center
              ${found ? rarityConfig.bg : 'bg-gray-300'}
              ${found ? rarityConfig.border : 'border-gray-400'}
              border-2 shadow-lg
              ${found && chest.reward.rarity !== 'common' ? rarityConfig.glow : ''}
            `}>
              <span className="text-lg">
                {found ? '✅' : '❓'}
              </span>

              {/* Pulse for unfound */}
              {!found && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-onde-coral"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>
          </motion.div>
        )
      })}

      {/* Selected chest info */}
      <AnimatePresence>
        {selectedChest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-xl p-4 shadow-lg"
          >
            <button
              onClick={() => setSelectedChest(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <div className="flex items-start gap-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${RARITY_CONFIG[selectedChest.reward.rarity].bg}
              `}>
                <span className="text-2xl">
                  {isChestFound(selectedChest.id) ? selectedChest.reward.icon : '📦'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{selectedChest.name}</h4>
                <p className="text-sm text-gray-600">{selectedChest.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${DIFFICULTY_CONFIG[selectedChest.difficulty].bg}
                    ${DIFFICULTY_CONFIG[selectedChest.difficulty].color}
                  `}>
                    {DIFFICULTY_CONFIG[selectedChest.difficulty].label}
                  </span>
                  <span className="text-xs text-gray-500">
                    📍 {selectedChest.location}
                  </span>
                </div>
                {isChestFound(selectedChest.id) && (
                  <p className="text-sm text-green-600 mt-1">✅ Found!</p>
                )}
                {!isChestFound(selectedChest.id) && (
                  <p className="text-sm text-amber-600 mt-1 italic">
                    💡 {selectedChest.hint}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Treasure Leaderboard component
export function TreasureLeaderboard() {
  const { leaderboard, mounted } = useTreasureHunt()

  if (!mounted) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-onde-gold to-amber-400 p-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🏆 Treasure Hunters Leaderboard
        </h3>
      </div>

      {/* Leaderboard list */}
      <div className="divide-y divide-gray-100">
        {leaderboard.map((player, index) => {
          const isTop3 = index < 3
          const isCurrentUser = 'isCurrentUser' in player && player.isCurrentUser

          return (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4
                ${isCurrentUser ? 'bg-onde-ocean/5' : ''}
                ${isTop3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : ''}
              `}
            >
              {/* Rank */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${index === 0 ? 'bg-onde-gold text-white' : ''}
                ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                ${index === 2 ? 'bg-amber-600 text-white' : ''}
                ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
              `}>
                {index === 0 ? '👑' : player.rank}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{player.avatar}</span>
                <span className={`font-medium ${isCurrentUser ? 'text-onde-ocean' : 'text-gray-800'}`}>
                  {player.username}
                  {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </span>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="font-bold text-gray-800">{player.points} pts</div>
                <div className="text-sm text-gray-500">{player.chestsFound} chests</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Mini treasure chest indicator for navigation/sidebar
export function TreasureProgress() {
  const { stats, mounted } = useTreasureHunt()

  if (!mounted) return null

  const percentage = stats.percentage

  return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
      <div className="text-2xl">🗺️</div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-amber-800">Treasure Hunt</span>
          <span className="text-amber-600">{stats.foundCount}/{stats.totalChests}</span>
        </div>
        <div className="mt-1 h-2 bg-amber-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-onde-gold to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

// Toast notification for newly found chests
export function TreasureFoundToast() {
  const { newlyFoundChest, clearNewlyFound } = useTreasureHunt()

  if (!newlyFoundChest) return null

  const rarityConfig = RARITY_CONFIG[newlyFoundChest.reward.rarity]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
        onClick={clearNewlyFound}
      >
        <div className={`
          bg-white rounded-2xl p-4 shadow-2xl border-2 ${rarityConfig.border}
          flex items-center gap-4 min-w-[300px] cursor-pointer
          ${rarityConfig.glow}
        `}>
          <motion.div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${rarityConfig.bg}`}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-3xl">{newlyFoundChest.reward.icon}</span>
          </motion.div>
          <div>
            <p className="text-sm text-gray-500">Treasure Found! 🎉</p>
            <p className={`font-bold ${rarityConfig.color}`}>
              {newlyFoundChest.reward.name}
            </p>
            <p className="text-xs text-gray-400">{rarityConfig.label}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Export all components
export default TreasureChest
