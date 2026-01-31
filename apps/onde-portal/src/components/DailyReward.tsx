'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCoins, formatCoinAmount } from '@/hooks/useCoins'

// ============================================
// TYPES
// ============================================

interface DailyRewardDay {
  day: number
  baseReward: number
  streakBonus: number
  totalReward: number
  icon: string
  isSpecial: boolean
  specialLabel?: string
}

interface ClaimResult {
  earned: number
  streak: number
  isWeeklyBonus: boolean
}

// ============================================
// REWARD CONFIGURATION
// ============================================

const DAILY_REWARDS: DailyRewardDay[] = [
  { day: 1, baseReward: 10, streakBonus: 5, totalReward: 15, icon: '🌟', isSpecial: false },
  { day: 2, baseReward: 10, streakBonus: 10, totalReward: 20, icon: '✨', isSpecial: false },
  { day: 3, baseReward: 10, streakBonus: 15, totalReward: 25, icon: '💫', isSpecial: false },
  { day: 4, baseReward: 10, streakBonus: 20, totalReward: 30, icon: '🌙', isSpecial: false },
  { day: 5, baseReward: 10, streakBonus: 25, totalReward: 35, icon: '⭐', isSpecial: false },
  { day: 6, baseReward: 10, streakBonus: 30, totalReward: 40, icon: '🔥', isSpecial: false },
  { day: 7, baseReward: 50, streakBonus: 50, totalReward: 100, icon: '🎁', isSpecial: true, specialLabel: 'BONUS SETTIMANALE!' },
]

// ============================================
// FLOATING COINS EFFECT
// ============================================

function FloatingCoinsEffect({ count }: { count: number }) {
  const coins = Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 300 - 150,
    startY: Math.random() * 200 + 100,
    delay: i * 0.08,
    rotation: Math.random() * 360
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          className="absolute text-3xl"
          initial={{ 
            x: '50%',
            y: '80%',
            opacity: 0,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: [`50%`, `calc(50% + ${coin.startX}px)`],
            y: ['80%', `calc(80% - ${coin.startY}px)`],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.5],
            rotate: [0, coin.rotation]
          }}
          transition={{
            duration: 1.5,
            delay: coin.delay,
            ease: 'easeOut'
          }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// SPARKLE EFFECT
// ============================================

function SparkleEffect() {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    size: Math.random() * 8 + 4
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180]
          }}
          transition={{
            duration: 2,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-onde-gold">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// DAY CARD COMPONENT
// ============================================

interface DayCardProps {
  reward: DailyRewardDay
  status: 'claimed' | 'current' | 'locked'
  onClaim?: () => void
  isAnimating?: boolean
}

function DayCard({ reward, status, onClaim, isAnimating }: DayCardProps) {
  const isCurrent = status === 'current'
  const isClaimed = status === 'claimed'
  const isLocked = status === 'locked'

  return (
    <motion.div
      className={`
        relative rounded-xl p-3 text-center transition-all duration-300
        ${isClaimed ? 'bg-green-100 border-2 border-green-300' : ''}
        ${isCurrent ? 'bg-gradient-to-br from-onde-gold/20 to-amber-100 border-2 border-onde-gold shadow-lg shadow-onde-gold/20' : ''}
        ${isLocked ? 'bg-gray-100 border-2 border-gray-200 opacity-60' : ''}
        ${reward.isSpecial && !isClaimed ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
      `}
      whileHover={isCurrent ? { scale: 1.05 } : undefined}
      whileTap={isCurrent ? { scale: 0.98 } : undefined}
      animate={isAnimating ? {
        scale: [1, 1.1, 1],
        boxShadow: ['0 0 0 rgba(234, 179, 8, 0)', '0 0 30px rgba(234, 179, 8, 0.6)', '0 0 0 rgba(234, 179, 8, 0)']
      } : undefined}
      transition={{ duration: 0.5 }}
    >
      {/* Day label */}
      <div className={`
        text-xs font-bold uppercase tracking-wider mb-1
        ${isClaimed ? 'text-green-600' : isCurrent ? 'text-onde-gold' : 'text-gray-400'}
      `}>
        Giorno {reward.day}
      </div>

      {/* Icon */}
      <motion.div 
        className="text-3xl mb-2"
        animate={isCurrent ? { 
          y: [0, -5, 0],
          rotate: [0, -5, 5, 0]
        } : undefined}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {isClaimed ? '✅' : reward.icon}
      </motion.div>

      {/* Reward amount */}
      <div className={`
        flex items-center justify-center gap-1 font-bold
        ${isClaimed ? 'text-green-600' : isCurrent ? 'text-onde-ocean' : 'text-gray-400'}
      `}>
        <span className="text-lg">🪙</span>
        <span>{reward.totalReward}</span>
      </div>

      {/* Special label */}
      {reward.isSpecial && (
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 
                     bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white text-[10px] font-bold rounded-full whitespace-nowrap"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {reward.specialLabel}
        </motion.div>
      )}

      {/* Claim button overlay for current day */}
      {isCurrent && onClaim && (
        <motion.button
          onClick={onClaim}
          className="absolute inset-0 flex items-center justify-center 
                     bg-onde-gold/0 hover:bg-onde-gold/10 rounded-xl
                     transition-colors duration-200"
          whileHover={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}
        >
          <span className="sr-only">Riscatta</span>
        </motion.button>
      )}

      {/* Lock icon for future days */}
      {isLocked && (
        <div className="absolute top-1 right-1 text-gray-400 text-sm">
          🔒
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// CLAIM SUCCESS MODAL
// ============================================

interface ClaimSuccessModalProps {
  result: ClaimResult
  onClose: () => void
}

function ClaimSuccessModal({ result, onClose }: ClaimSuccessModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <SparkleEffect />
        <FloatingCoinsEffect count={result.isWeeklyBonus ? 20 : 10} />

        <div className="relative z-10 text-center">
          {/* Success icon */}
          <motion.div
            className="text-7xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            {result.isWeeklyBonus ? '🎁' : '🎉'}
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-2xl font-display font-bold text-onde-ocean mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {result.isWeeklyBonus ? 'Bonus Settimanale!' : 'Premio Giornaliero!'}
          </motion.h2>

          {/* Coins earned */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <span className="text-4xl">🪙</span>
            <span className="text-5xl font-black text-onde-gold">
              +{result.earned}
            </span>
          </motion.div>

          {/* Streak info */}
          <motion.div
            className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-purple-700">
                Serie di {result.streak} {result.streak === 1 ? 'giorno' : 'giorni'}!
              </span>
            </div>
            {result.streak < 7 && (
              <p className="text-sm text-purple-600 mt-1">
                Torna domani per continuare la serie!
              </p>
            )}
            {result.streak >= 7 && (
              <p className="text-sm text-purple-600 mt-1">
                Hai completato la settimana! 🌟
              </p>
            )}
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-onde-ocean to-onde-teal
                       text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Fantastico! 🎊
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// MAIN DAILY REWARD POPUP
// ============================================

interface DailyRewardPopupProps {
  isOpen: boolean
  onClose: () => void
  autoClaimOnOpen?: boolean
}

export function DailyRewardPopup({ isOpen, onClose, autoClaimOnOpen = false }: DailyRewardPopupProps) {
  const { loginStreak, lastDailyLogin, claimDailyLogin } = useCoins()
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [animatingDay, setAnimatingDay] = useState<number | null>(null)

  const today = new Date().toDateString()
  const canClaim = lastDailyLogin !== today

  // Calculate current day in the cycle (1-7)
  const currentDay = canClaim ? Math.min((loginStreak % 7) + 1, 7) : ((loginStreak - 1) % 7) + 1

  const handleClaim = useCallback(() => {
    const result = claimDailyLogin()
    if (result) {
      const isWeeklyBonus = result.streak % 7 === 0
      setClaimResult({ ...result, isWeeklyBonus })
      setAnimatingDay(currentDay)
      
      // Show success modal after brief animation
      setTimeout(() => {
        setShowSuccessModal(true)
        setAnimatingDay(null)
      }, 500)
    }
  }, [claimDailyLogin, currentDay])

  // Auto-claim on open if enabled
  useEffect(() => {
    if (isOpen && autoClaimOnOpen && canClaim) {
      const timer = setTimeout(handleClaim, 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClaimOnOpen, canClaim, handleClaim])

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    setClaimResult(null)
  }

  const getDayStatus = (day: number): 'claimed' | 'current' | 'locked' => {
    const cyclePosition = canClaim ? loginStreak % 7 : (loginStreak - 1) % 7
    
    if (day <= cyclePosition) return 'claimed'
    if (day === cyclePosition + 1 && canClaim) return 'current'
    if (day === cyclePosition + 1 && !canClaim) return 'claimed'
    return 'locked'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Main modal */}
          <motion.div
            className="relative bg-gradient-to-br from-white to-onde-cream rounded-3xl 
                       max-w-md w-full shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-onde-gold to-amber-400 p-6 text-center">
              <SparkleEffect />
              
              <motion.div
                className="text-5xl mb-2"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                📅
              </motion.div>
              
              <h2 className="text-2xl font-display font-bold text-white drop-shadow-lg">
                Premi Giornalieri
              </h2>
              
              <p className="text-white/80 text-sm mt-1">
                Torna ogni giorno per premi sempre più grandi!
              </p>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 
                           hover:bg-white/30 flex items-center justify-center
                           text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current streak display */}
              <div className="flex items-center justify-center gap-3 mb-6 p-3 
                             bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-xs text-purple-600 font-medium">Serie Attuale</p>
                  <p className="text-2xl font-black text-purple-700">
                    {loginStreak} {loginStreak === 1 ? 'Giorno' : 'Giorni'}
                  </p>
                </div>
              </div>

              {/* 7-day calendar grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {DAILY_REWARDS.map(reward => (
                  <DayCard
                    key={reward.day}
                    reward={reward}
                    status={getDayStatus(reward.day)}
                    onClaim={getDayStatus(reward.day) === 'current' ? handleClaim : undefined}
                    isAnimating={animatingDay === reward.day}
                  />
                ))}
              </div>

              {/* Claim button or status */}
              {canClaim ? (
                <motion.button
                  onClick={handleClaim}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-onde-gold to-amber-500
                             text-white font-bold text-lg shadow-lg shadow-onde-gold/30
                             hover:shadow-xl hover:shadow-onde-gold/40 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    boxShadow: [
                      '0 10px 15px -3px rgba(234, 179, 8, 0.3)',
                      '0 20px 25px -5px rgba(234, 179, 8, 0.5)',
                      '0 10px 15px -3px rgba(234, 179, 8, 0.3)'
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎁 Riscatta il Premio di Oggi!
                </motion.button>
              ) : (
                <div className="text-center py-4 rounded-xl bg-gray-100 border border-gray-200">
                  <p className="text-gray-600 font-medium">
                    ✓ Premio di oggi già riscattato!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Torna domani per continuare la serie
                  </p>
                </div>
              )}

              {/* Reward preview */}
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>
                  Giorno {currentDay}: <span className="font-bold text-onde-ocean">
                    {DAILY_REWARDS[Math.min(currentDay, 7) - 1].totalReward} monete
                  </span>
                </p>
                {currentDay < 7 && (
                  <p className="text-xs mt-1">
                    Domani: {DAILY_REWARDS[currentDay].totalReward} monete 
                    {DAILY_REWARDS[currentDay].isSpecial && ' 🎁'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Success modal overlay */}
          <AnimatePresence>
            {showSuccessModal && claimResult && (
              <ClaimSuccessModal 
                result={claimResult} 
                onClose={handleSuccessClose} 
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// DAILY REWARD TRIGGER BUTTON
// ============================================

export function DailyRewardButton() {
  const { lastDailyLogin, loginStreak, mounted } = useCoins()
  const [showPopup, setShowPopup] = useState(false)

  const today = new Date().toDateString()
  const canClaim = mounted && lastDailyLogin !== today

  return (
    <>
      <motion.button
        onClick={() => setShowPopup(true)}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium
          transition-all duration-300
          ${canClaim 
            ? 'bg-gradient-to-r from-onde-gold to-amber-500 text-white shadow-lg shadow-onde-gold/30' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={canClaim ? {
          boxShadow: [
            '0 10px 15px -3px rgba(234, 179, 8, 0.3)',
            '0 20px 25px -5px rgba(234, 179, 8, 0.5)',
            '0 10px 15px -3px rgba(234, 179, 8, 0.3)'
          ]
        } : undefined}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-xl">{canClaim ? '🎁' : '📅'}</span>
        <span>{canClaim ? 'Premio!' : `${loginStreak}🔥`}</span>
        
        {canClaim && (
          <motion.span
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </motion.button>

      <DailyRewardPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
    </>
  )
}

// ============================================
// AUTO-SHOW HOOK (for login detection)
// ============================================

export function useDailyRewardAutoShow() {
  const { lastDailyLogin, mounted } = useCoins()
  const [shouldShow, setShouldShow] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (mounted && !hasChecked) {
      const today = new Date().toDateString()
      const canClaim = lastDailyLogin !== today
      
      // Check if we've already shown the popup this session
      const sessionKey = `daily_reward_shown_${today}`
      const alreadyShown = sessionStorage.getItem(sessionKey)
      
      if (canClaim && !alreadyShown) {
        // Slight delay to let the page load
        setTimeout(() => {
          setShouldShow(true)
          sessionStorage.setItem(sessionKey, 'true')
        }, 1500)
      }
      
      setHasChecked(true)
    }
  }, [mounted, lastDailyLogin, hasChecked])

  const dismiss = useCallback(() => {
    setShouldShow(false)
  }, [])

  return { shouldShow, dismiss }
}

// ============================================
// DAILY REWARD AUTO-POPUP WRAPPER
// ============================================

export default function DailyReward() {
  const { shouldShow, dismiss } = useDailyRewardAutoShow()

  return (
    <DailyRewardPopup 
      isOpen={shouldShow} 
      onClose={dismiss}
      autoClaimOnOpen={false}
    />
  )
}

// ============================================
// COMPACT STREAK DISPLAY (for navbar)
// ============================================

export function StreakDisplay() {
  const { loginStreak, mounted } = useCoins()
  const [showPopup, setShowPopup] = useState(false)

  if (!mounted) return null

  return (
    <>
      <motion.button
        onClick={() => setShowPopup(true)}
        className="flex items-center gap-1 text-sm font-medium text-onde-ocean
                   hover:text-onde-gold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>🔥</span>
        <span>{loginStreak}</span>
      </motion.button>

      <DailyRewardPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
    </>
  )
}
