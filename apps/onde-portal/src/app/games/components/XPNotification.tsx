'use client'

import { useEffect, useState } from 'react'
import type { UseGameRewardsReturn } from '@/hooks/useGameRewards'

interface XPNotificationProps {
  rewards: UseGameRewardsReturn
}

/**
 * Floating XP bar + level-up celebration overlay.
 * Place this inside any game page alongside useGameRewards.
 */
export default function XPNotification({ rewards }: XPNotificationProps) {
  const { levelInfo, pendingLevelUp, showConfetti, clearLevelUp } = rewards
  const [visible, setVisible] = useState(false)

  // Show the mini bar briefly when mounted
  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [])

  // Re-show on XP change
  useEffect(() => {
    if (levelInfo.xpPercentage > 0) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(t)
    }
  }, [levelInfo.totalXp, levelInfo.xpPercentage])

  return (
    <>
      {/* Mini XP Bar - top right corner */}
      <div
        className={`fixed top-3 right-3 z-[60] transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 text-white flex items-center gap-2 shadow-lg min-w-[140px]">
          <span className="text-sm font-bold">{levelInfo.emoji} Lv{levelInfo.level}</span>
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden min-w-[60px]">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${levelInfo.xpPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-white/60">{levelInfo.xpPercentage}%</span>
        </div>
      </div>

      {/* Level-Up Celebration Overlay */}
      {pendingLevelUp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={clearLevelUp}
        >
          <div
            className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4 animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-black text-white mb-1">Level Up!</h2>
            <p className="text-white/90 text-lg font-bold mb-2">
              Level {pendingLevelUp.fromLevel} → {pendingLevelUp.toLevel}
            </p>
            {pendingLevelUp.rewards.length > 0 && (
              <div className="mt-3 space-y-1">
                {pendingLevelUp.rewards.map((r) => (
                  <div key={r.unlockId} className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                    {r.icon} {r.title}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={clearLevelUp}
              className="mt-5 bg-white text-amber-600 font-bold px-6 py-2 rounded-xl hover:bg-amber-50 transition-all active:scale-95"
            >
              Awesome! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => {
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
            const color = colors[i % colors.length]
            return (
              <div
                key={i}
                className="absolute animate-confetti-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  width: `${6 + Math.random() * 6}px`,
                  height: `${6 + Math.random() * 6}px`,
                  backgroundColor: color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            )
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
        :global(.animate-confetti-fall) { animation: confetti-fall 3s ease-out forwards; }
      `}</style>
    </>
  )
}
