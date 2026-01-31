'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useDailyChallenge, STREAK_BADGES, XP_LEVELS } from '@/hooks/useDailyChallenge'

// Confetti component for celebrations
function Confetti() {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number }[]>([])
  
  useEffect(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
    }))
    setParticles(newParticles)
  }, [])
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3 rounded-full"
          style={{ left: `${p.x}%`, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: 720 }}
          transition={{ duration: 2.5, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

// Progress ring component
function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Streak flame animation
function StreakFlame({ streak }: { streak: number }) {
  if (streak === 0) return null
  
  const flameSize = Math.min(streak * 2 + 16, 40)
  
  return (
    <motion.div
      className="relative"
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [-2, 2, -2],
      }}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      <span style={{ fontSize: flameSize }} className="filter drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]">
        🔥
      </span>
    </motion.div>
  )
}

export default function DailyChallengePage() {
  const {
    state,
    mounted,
    todayChallenge,
    todayProgress,
    updateProgress,
    setProgress,
    claimReward,
    getLevel,
    getHistory,
    getLeaderboard,
    shareCompletion,
  } = useDailyChallenge()
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [rewardClaimed, setRewardClaimed] = useState<{ xp: number; badge?: string; streakBadge?: string | null } | null>(null)
  const [activeTab, setActiveTab] = useState<'challenge' | 'history' | 'leaderboard'>('challenge')
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  
  const level = getLevel()
  const history = getHistory(7)
  const leaderboard = getLeaderboard()
  const progressPercent = (todayProgress.progress / todayChallenge.target) * 100
  
  // Handle claim reward
  const handleClaimReward = () => {
    const reward = claimReward()
    if (reward) {
      setRewardClaimed(reward)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }
  
  // Handle share
  const handleShare = async () => {
    const success = await shareCompletion()
    setShareMessage(success ? 'Copied to clipboard!' : 'Could not share')
    setTimeout(() => setShareMessage(null), 2000)
  }
  
  // Demo: simulate progress (in production, this would be automatic from other hooks)
  const handleSimulateProgress = () => {
    updateProgress(1)
  }
  
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🌟</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-24">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--onde-dark)]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span>←</span>
            <span className="font-medium">Home</span>
          </Link>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
            Daily Challenge
          </h1>
          
          <div className="flex items-center gap-2">
            <StreakFlame streak={state.currentStreak} />
            <span className="text-white font-bold">{state.currentStreak}</span>
          </div>
        </div>
      </div>
      
      {/* Level & XP Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-white font-bold">Level {level.level}</p>
                <p className="text-white/60 text-sm">{level.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-300 font-bold">{state.totalXP} XP</p>
              {level.nextLevel && (
                <p className="text-white/50 text-sm">{level.xpToNext} XP to next level</p>
              )}
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300"
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {(['challenge', 'history', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'challenge' && '🎯 Today'}
              {tab === 'history' && '📅 History'}
              {tab === 'leaderboard' && '🏆 Leaders'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Today's Challenge Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-6">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full blur-2xl" />
                
                {/* Challenge type badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm mb-4">
                  <span className="capitalize text-white/80">{todayChallenge.type}</span>
                </div>
                
                <div className="flex items-start gap-6">
                  {/* Progress ring */}
                  <div className="relative flex-shrink-0">
                    <ProgressRing progress={progressPercent} size={120} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{todayChallenge.icon}</span>
                    </div>
                  </div>
                  
                  {/* Challenge details */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{todayChallenge.title}</h2>
                    <p className="text-white/70 mb-4">{todayChallenge.description}</p>
                    
                    {/* Progress text */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-bold text-teal-300">
                        {todayProgress.progress}
                      </span>
                      <span className="text-white/50">/</span>
                      <span className="text-xl text-white/70">
                        {todayChallenge.target} {todayChallenge.unit}
                      </span>
                    </div>
                    
                    {/* Reward preview */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
                        <span>✨</span>
                        <span className="text-amber-300 font-bold">{todayChallenge.xpReward} XP</span>
                      </div>
                      {todayChallenge.badgeReward && (
                        <div className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                          <span className="text-lg">{todayChallenge.badgeReward}</span>
                          <span className="text-purple-300 text-sm">Badge</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {todayProgress.completed && !todayProgress.claimed ? (
                    <motion.button
                      onClick={handleClaimReward}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎁 Claim Reward!
                    </motion.button>
                  ) : todayProgress.claimed ? (
                    <>
                      <div className="flex-1 py-3 px-6 bg-green-500/20 text-green-300 font-bold rounded-xl text-center border border-green-500/30">
                        ✅ Completed!
                      </div>
                      <motion.button
                        onClick={handleShare}
                        className="py-3 px-6 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        📤 Share
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      onClick={handleSimulateProgress}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ➕ Add Progress
                    </motion.button>
                  )}
                </div>
                
                {/* Share message */}
                <AnimatePresence>
                  {shareMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 text-center text-green-300"
                    >
                      {shareMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Reward claimed modal */}
              <AnimatePresence>
                {rewardClaimed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setRewardClaimed(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.8, y: 20 }}
                      className="bg-gradient-to-br from-[var(--onde-dark-surface)] to-[var(--onde-dark)] rounded-3xl p-8 max-w-sm w-full text-center border border-white/20"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-white mb-2">Reward Claimed!</h3>
                      
                      <div className="space-y-3 my-6">
                        <div className="flex items-center justify-center gap-2 text-amber-300 text-xl">
                          <span>✨</span>
                          <span className="font-bold">+{rewardClaimed.xp} XP</span>
                        </div>
                        
                        {rewardClaimed.badge && (
                          <div className="flex items-center justify-center gap-2 text-purple-300">
                            <span className="text-2xl">{rewardClaimed.badge}</span>
                            <span>New Badge!</span>
                          </div>
                        )}
                        
                        {rewardClaimed.streakBadge && (
                          <div className="flex items-center justify-center gap-2 text-orange-300">
                            <span className="text-2xl">{rewardClaimed.streakBadge}</span>
                            <span>Streak Badge!</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setRewardClaimed(null)}
                        className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl"
                      >
                        Awesome!
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-orange-300">{state.currentStreak}</p>
                  <p className="text-white/60 text-sm">Current Streak</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-purple-300">{state.longestStreak}</p>
                  <p className="text-white/60 text-sm">Best Streak</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-teal-300">{state.totalCompleted}</p>
                  <p className="text-white/60 text-sm">Completed</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-cyan-300">{state.badges.length}</p>
                  <p className="text-white/60 text-sm">Badges</p>
                </div>
              </div>
              
              {/* Badges Collection */}
              {state.badges.length > 0 && (
                <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-bold mb-3">🏅 Your Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    {state.badges.map((badge, i) => (
                      <motion.div
                        key={badge}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-3xl p-2 bg-white/10 rounded-lg"
                      >
                        {badge}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h2 className="text-lg font-bold text-white mb-4">📅 Last 7 Days</h2>
              
              {history.map(({ date, challenge, progress }, index) => {
                const isToday = date === new Date().toISOString().split('T')[0]
                const completed = progress?.completed || false
                const claimed = progress?.claimed || false
                
                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      isToday
                        ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/30'
                        : completed
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {/* Status icon */}
                    <div className="text-2xl">
                      {claimed ? '✅' : completed ? '🎁' : isToday ? '🎯' : '⭕'}
                    </div>
                    
                    {/* Challenge info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{challenge.icon}</span>
                        <span className="text-white font-medium">{challenge.title}</span>
                        {isToday && (
                          <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    {/* Progress */}
                    <div className="text-right">
                      <p className={`font-bold ${completed ? 'text-green-300' : 'text-white/60'}`}>
                        {progress ? progress.progress : 0}/{challenge.target}
                      </p>
                      {claimed && (
                        <p className="text-amber-300 text-sm">+{challenge.xpReward} XP</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
          
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-bold text-white mb-4">🏆 Top Readers</h2>
              
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  // Check if this is the current user
                  const userProfile = mounted ? localStorage.getItem('onde-user-profile') : null
                  const profile = userProfile ? JSON.parse(userProfile) : null
                  const isCurrentUser = profile ? 
                    (entry.username === profile.username || entry.username === 'You') :
                    entry.username === 'You'
                  
                  return (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30'
                          : entry.rank <= 3
                          ? 'bg-white/10 border-white/20'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-10 text-center">
                        {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                        {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                        {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                        {entry.rank > 3 && <span className="text-white/60 font-bold">#{entry.rank}</span>}
                      </div>
                      
                      {/* Avatar & name */}
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{entry.avatar}</span>
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-amber-300' : 'text-white'}`}>
                            {entry.username}
                            {isCurrentUser && <span className="text-sm ml-1">(You)</span>}
                          </p>
                          <div className="flex items-center gap-1 text-orange-300 text-sm">
                            <span>🔥</span>
                            <span>{entry.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* XP */}
                      <div className="text-right">
                        <p className="text-amber-300 font-bold">{entry.totalXP.toLocaleString()}</p>
                        <p className="text-white/50 text-sm">XP</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {state.totalCompleted === 0 && (
                <div className="mt-6 text-center py-8 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-4xl mb-3">🚀</p>
                  <p className="text-white/70">Complete your first challenge to join the leaderboard!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Streak badges info */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-bold mb-3">🏆 Streak Milestones</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(STREAK_BADGES).map(([days, badge]) => {
              const achieved = state.longestStreak >= parseInt(days)
              return (
                <div 
                  key={days}
                  className={`text-center p-2 rounded-lg transition-all ${
                    achieved ? 'bg-amber-500/20' : 'bg-white/5 opacity-50'
                  }`}
                >
                  <div className={`text-2xl ${achieved ? '' : 'grayscale'}`}>{badge.emoji}</div>
                  <p className="text-white/80 text-xs mt-1">{days} days</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
