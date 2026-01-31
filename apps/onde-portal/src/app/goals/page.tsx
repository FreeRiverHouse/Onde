'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useReadingGoals, GoalPeriod, GoalType, GoalHistory } from '@/hooks/useReadingGoals'

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: 400,
        x: Math.random() * 200 - 100,
        opacity: 0,
        rotate: Math.random() * 720 - 360
      }}
      transition={{ duration: 2, delay, ease: 'easeOut' }}
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: color, left: `${Math.random() * 100}%` }}
    />
  )
}

// Milestone celebration overlay
function MilestoneCelebration({ 
  milestone, 
  onClose 
}: { 
  milestone: number
  onClose: () => void 
}) {
  const messages: Record<number, { emoji: string; title: string; subtitle: string }> = {
    25: { emoji: '🌱', title: 'Great Start!', subtitle: "You're 25% of the way there!" },
    50: { emoji: '🔥', title: 'Halfway There!', subtitle: 'Keep up the momentum!' },
    75: { emoji: '⚡', title: 'Almost Done!', subtitle: 'The finish line is in sight!' },
    100: { emoji: '🎉', title: 'Goal Complete!', subtitle: 'You did it! Amazing work!' }
  }

  const config = messages[milestone] || messages[25]
  const confettiColors = ['#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981']

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle 
              key={i} 
              delay={Math.random() * 0.5} 
              color={confettiColors[i % confettiColors.length]} 
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-7xl mb-4"
          >
            {config.emoji}
          </motion.div>
          <h2 className="text-3xl font-bold text-teal-800 mb-2">{config.title}</h2>
          <p className="text-teal-600 text-lg mb-6">{config.subtitle}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Keep Going!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Goal creation modal
function CreateGoalModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (period: GoalPeriod, type: GoalType, target: number) => void
}) {
  const [period, setPeriod] = useState<GoalPeriod>('weekly')
  const [type, setType] = useState<GoalType>('pages')
  const [target, setTarget] = useState('')

  const presets = {
    pages: {
      weekly: [50, 100, 200, 500],
      monthly: [200, 500, 1000, 2000]
    },
    books: {
      weekly: [1, 2, 3, 5],
      monthly: [2, 4, 6, 10]
    }
  }

  if (!isOpen) return null

  const handleSubmit = () => {
    const targetNum = parseInt(target, 10)
    if (targetNum > 0) {
      onSubmit(period, type, targetNum)
      onClose()
      setTarget('')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-2xl font-bold text-teal-800 mb-6 text-center">
            📚 Set Your Reading Goal
          </h3>

          {/* Period Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-teal-700 mb-2">
              Goal Period
            </label>
            <div className="flex bg-teal-100 rounded-xl p-1">
              {(['weekly', 'monthly'] as GoalPeriod[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    period === p
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-teal-700 hover:bg-teal-200'
                  }`}
                >
                  {p === 'weekly' ? '📅 Weekly' : '🗓️ Monthly'}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-teal-700 mb-2">
              Goal Type
            </label>
            <div className="flex bg-teal-100 rounded-xl p-1">
              {(['pages', 'books'] as GoalType[]).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t)
                    setTarget('')
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    type === t
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-teal-700 hover:bg-teal-200'
                  }`}
                >
                  {t === 'pages' ? '📄 Pages' : '📖 Books'}
                </button>
              ))}
            </div>
          </div>

          {/* Target Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-2">
              Target ({type === 'pages' ? 'pages' : 'books'})
            </label>
            <input
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder={`Enter number of ${type}...`}
              className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:border-teal-500 focus:outline-none text-lg"
              min={1}
            />
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-teal-600 mb-2">
              Quick presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {presets[type][period].map(preset => (
                <button
                  key={preset}
                  onClick={() => setTarget(preset.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    target === preset.toString()
                      ? 'bg-teal-500 text-white'
                      : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                  }`}
                >
                  {preset} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-teal-600 font-medium rounded-xl hover:bg-teal-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!target || parseInt(target, 10) <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set Goal 🎯
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Progress ring component
function ProgressRing({ 
  percentage, 
  size = 200, 
  strokeWidth = 12 
}: { 
  percentage: number
  size?: number
  strokeWidth?: number 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-teal-800">{percentage}%</span>
        <span className="text-sm text-teal-600">Complete</span>
      </div>
    </div>
  )
}

// History card component
function HistoryCard({ goal }: { goal: GoalHistory }) {
  const startDate = new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endDate = new Date(goal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const unit = goal.type === 'pages' ? 'pages' : 'books'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 ${
        goal.completed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {goal.completed ? '✅' : goal.percentage >= 50 ? '📖' : '📕'}
          </span>
          <div>
            <p className="font-semibold text-gray-800">
              {goal.achieved}/{goal.target} {unit}
            </p>
            <p className="text-sm text-gray-500">
              {startDate} - {endDate} • {goal.period}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          goal.completed 
            ? 'bg-green-200 text-green-800' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {goal.percentage}%
        </div>
      </div>
    </motion.div>
  )
}

// Streak display component
function StreakDisplay({ current, longest }: { current: number; longest: number }) {
  const flames = Math.min(current, 7)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6 border-2 border-orange-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600 mb-1">Current Streak</p>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-orange-800">{current}</span>
            <span className="text-orange-600">goals</span>
          </div>
        </div>
        <div className="text-4xl">
          {Array.from({ length: flames }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              🔥
            </motion.span>
          ))}
          {flames === 0 && '💤'}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-orange-200">
        <p className="text-sm text-orange-600">
          <span className="font-medium">Longest streak:</span> {longest} goals 🏆
        </p>
      </div>
    </motion.div>
  )
}

// Share modal component
function ShareModal({ 
  isOpen, 
  shareText, 
  onClose,
  onShared
}: { 
  isOpen: boolean
  shareText: string
  onClose: () => void
  onShared: () => void
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      onShared()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
        onShared()
      } catch {
        // User cancelled or error
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold text-teal-800 mb-4 text-center">
            📤 Share Your Progress
          </h3>

          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <p className="text-gray-800 text-sm">{shareText}</p>
          </div>

          <div className="flex flex-col gap-3">
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>📱</span> Share
              </button>
            )}
            
            <button
              onClick={handleCopy}
              className={`w-full py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span> Copied!
                </>
              ) : (
                <>
                  <span>📋</span> Copy to Clipboard
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-teal-600 font-medium hover:bg-teal-50 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Update progress modal
function UpdateProgressModal({
  isOpen,
  goalType,
  currentProgress,
  target,
  onClose,
  onUpdate
}: {
  isOpen: boolean
  goalType: GoalType
  currentProgress: number
  target: number
  onClose: () => void
  onUpdate: (amount: number) => void
}) {
  const [amount, setAmount] = useState('')
  const unit = goalType === 'pages' ? 'pages' : 'books'

  if (!isOpen) return null

  const handleSubmit = () => {
    const num = parseInt(amount, 10)
    if (num > 0) {
      onUpdate(num)
      onClose()
      setAmount('')
    }
  }

  const quickAmounts = goalType === 'pages' ? [10, 25, 50, 100] : [1, 2]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold text-teal-800 mb-2 text-center">
            📝 Log Reading Progress
          </h3>
          <p className="text-sm text-teal-600 text-center mb-6">
            Current: {currentProgress}/{target} {unit}
          </p>

          <div className="mb-4">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`${unit} read...`}
              className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:border-teal-500 focus:outline-none text-lg text-center"
              min={1}
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {quickAmounts.map(q => (
              <button
                key={q}
                onClick={() => setAmount(q.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  amount === q.toString()
                    ? 'bg-teal-500 text-white'
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                }`}
              >
                +{q}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-teal-600 font-medium rounded-xl hover:bg-teal-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount || parseInt(amount, 10) <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function GoalsPage() {
  const {
    mounted,
    activeGoal,
    recentHistory,
    streak,
    stats,
    percentage,
    daysRemaining,
    celebratingMilestone,
    justCompleted,
    createGoal,
    updateProgress,
    deleteGoal,
    markAsShared,
    generateShareText
  } = useReadingGoals()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showMilestone, setShowMilestone] = useState<number | null>(null)

  // Show milestone celebration
  useEffect(() => {
    if (celebratingMilestone) {
      setShowMilestone(celebratingMilestone)
    }
  }, [celebratingMilestone])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }}>
        <div className="text-4xl animate-pulse">📚</div>
      </div>
    )
  }

  const unit = activeGoal?.type === 'pages' ? 'pages' : 'books'

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors mb-6"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-teal-800 mb-2">
            📚 Reading Goals
          </h1>
          <p className="text-teal-600">
            Set targets, track progress, celebrate achievements
          </p>
        </motion.div>

        {/* Active Goal or Create CTA */}
        {activeGoal ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border-2 border-teal-200 shadow-xl mb-8"
          >
            {/* Goal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-2">
                  {activeGoal.period === 'weekly' ? '📅 Weekly Goal' : '🗓️ Monthly Goal'}
                </span>
                <h2 className="text-2xl font-bold text-teal-800">
                  {activeGoal.progress} / {activeGoal.target} {unit}
                </h2>
                <p className="text-teal-600">
                  {daysRemaining} days remaining
                </p>
              </div>
              <ProgressRing percentage={percentage} />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                />
              </div>
              
              {/* Milestones markers */}
              <div className="relative mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  {[0, 25, 50, 75, 100].map(m => (
                    <div key={m} className="flex flex-col items-center">
                      <span className={activeGoal.milestones[m as 25 | 50 | 75 | 100] ? 'text-teal-600 font-medium' : ''}>
                        {m === 0 ? 'Start' : m === 100 ? '🎉' : `${m}%`}
                      </span>
                      {m > 0 && m < 100 && activeGoal.milestones[m as 25 | 50 | 75] && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUpdateModal(true)}
                className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>➕</span> Log Progress
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowShareModal(true)}
                className="py-3 px-6 bg-purple-100 text-purple-700 font-semibold rounded-xl hover:bg-purple-200 transition-all flex items-center gap-2"
              >
                <span>📤</span> Share
              </motion.button>

              <button
                onClick={deleteGoal}
                className="py-3 px-4 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete goal"
              >
                🗑️
              </button>
            </div>

            {/* Completion celebration */}
            {justCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300 text-center"
              >
                <p className="text-2xl mb-2">🎉🎊🎉</p>
                <p className="font-bold text-green-800">Goal Completed!</p>
                <p className="text-green-600 text-sm">Amazing work! You did it!</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border-2 border-teal-200 shadow-xl mb-8 text-center"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-teal-800 mb-2">
              No Active Goal
            </h2>
            <p className="text-teal-600 mb-6">
              Set a reading goal to start tracking your progress!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-lg"
            >
              Create Reading Goal 📚
            </motion.button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StreakDisplay 
              current={streak.current} 
              longest={streak.longest} 
            />
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-teal-200"
          >
            <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
              <span>📊</span> All-Time Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-teal-800">{stats.totalPagesRead}</p>
                <p className="text-sm text-teal-600">Pages Read</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-800">{stats.totalBooksCompleted}</p>
                <p className="text-sm text-teal-600">Books Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-800">{stats.completedGoals}</p>
                <p className="text-sm text-teal-600">Goals Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-800">{stats.successRate}%</p>
                <p className="text-sm text-teal-600">Success Rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Goal History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span>📜</span> Goal History
          </h2>
          
          {recentHistory.length > 0 ? (
            <div className="space-y-3">
              {recentHistory.map(goal => (
                <HistoryCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="bg-white/60 rounded-xl p-8 text-center">
              <p className="text-gray-500">No completed goals yet. Start your first goal above!</p>
            </div>
          )}
        </motion.section>

        {/* Create new goal button (if active goal exists) */}
        {activeGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              + Create New Goal (will archive current)
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-teal-500 text-sm pb-8">
          <p className="flex items-center justify-center gap-2">
            <span>🌊</span>
            Onde - Crafted by Code, Touched by Soul
            <span>☀️</span>
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(period, type, target) => createGoal(period, type, target)}
      />

      <ShareModal
        isOpen={showShareModal}
        shareText={generateShareText()}
        onClose={() => setShowShareModal(false)}
        onShared={markAsShared}
      />

      {activeGoal && (
        <UpdateProgressModal
          isOpen={showUpdateModal}
          goalType={activeGoal.type}
          currentProgress={activeGoal.progress}
          target={activeGoal.target}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={(amount) => updateProgress(amount)}
        />
      )}

      {/* Milestone celebration */}
      {showMilestone && (
        <MilestoneCelebration
          milestone={showMilestone}
          onClose={() => setShowMilestone(null)}
        />
      )}
    </div>
  )
}
