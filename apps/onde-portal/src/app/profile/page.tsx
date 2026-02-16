'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useUserProfile, AVATAR_EMOJIS, ACHIEVEMENTS } from '@/hooks/useUserProfile'
import { useFavorites } from '@/hooks/useFavorites'
import { useReadingProgress } from '@/hooks/useReadingProgress'

// Emoji picker modal component
function EmojiPicker({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentEmoji 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelect: (emoji: string) => void
  currentEmoji: string
}) {
  if (!isOpen) return null

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
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold text-teal-800 mb-4 text-center">
            Choose Your Avatar
          </h3>
          <div className="grid grid-cols-8 gap-2">
            {AVATAR_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji)
                  onClose()
                }}
                className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 hover:bg-teal-100 ${
                  currentEmoji === emoji ? 'bg-teal-200 ring-2 ring-teal-500' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 text-teal-600 hover:text-teal-800 transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Stats card component
function StatCard({ 
  icon, 
  label, 
  value, 
  subtext 
}: { 
  icon: string
  label: string
  value: string | number
  subtext?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-teal-200 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-teal-800">{value}</p>
          <p className="text-sm text-teal-600">{label}</p>
          {subtext && <p className="text-xs text-teal-500/70">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  )
}

// Achievement badge component
function AchievementBadge({ 
  achievement, 
  unlocked 
}: { 
  achievement: typeof ACHIEVEMENTS[0]
  unlocked: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative p-4 rounded-xl text-center transition-all ${
        unlocked 
          ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-lg' 
          : 'bg-gray-100 border-2 border-gray-200 opacity-50'
      }`}
    >
      <span className={`text-4xl ${unlocked ? '' : 'grayscale'}`}>
        {achievement.icon}
      </span>
      <p className={`mt-2 font-semibold text-sm ${unlocked ? 'text-amber-800' : 'text-gray-500'}`}>
        {achievement.name}
      </p>
      <p className={`text-xs mt-1 ${unlocked ? 'text-amber-600' : 'text-gray-400'}`}>
        {achievement.description}
      </p>
      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}

// Settings toggle component
function SettingToggle({ 
  label, 
  options, 
  value, 
  onChange,
  icon
}: { 
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  icon: string
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-teal-200">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium text-teal-800">{label}</span>
      </div>
      <div className="flex bg-teal-100 rounded-lg p-1">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              value === option.value
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-teal-700 hover:bg-teal-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { 
    profile, 
    mounted, 
    setUsername, 
    setAvatar, 
    setTheme, 
    setLanguage,
    getUnlockedAchievements,
    getLockedAchievements,
    exportData,
    syncStats,
    unlockAchievement,
    isProfileSetup
  } = useUserProfile()
  
  const { getFavoritesCount, mounted: favoritesMounted } = useFavorites()
  const { getStartedCount, mounted: progressMounted } = useReadingProgress()
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showExportSuccess, setShowExportSuccess] = useState(false)

  // Sync username input with profile
  useEffect(() => {
    if (mounted) {
      setUsernameInput(profile.username)
    }
  }, [mounted, profile.username])

  // Sync stats from other hooks
  useEffect(() => {
    if (mounted && favoritesMounted && progressMounted) {
      syncStats({
        booksStarted: getStartedCount(),
        favoriteBooks: getFavoritesCount(),
      })
      
      // Check for achievements
      if (getStartedCount() >= 1) {
        unlockAchievement('first_book')
      }
      if (getStartedCount() >= 5) {
        unlockAchievement('five_books')
      }
      if (getFavoritesCount() >= 1) {
        unlockAchievement('first_favorite')
      }
      if (getFavoritesCount() >= 5) {
        unlockAchievement('five_favorites')
      }
      if (profile.stats.gamesPlayed.length >= 1) {
        unlockAchievement('first_game')
      }
      if (profile.stats.gamesPlayed.length >= 5) {
        unlockAchievement('five_games')
      }
      if (profile.visitStreak >= 7) {
        unlockAchievement('week_streak')
      }
    }
  }, [mounted, favoritesMounted, progressMounted, getStartedCount, getFavoritesCount, syncStats, unlockAchievement, profile.stats.gamesPlayed.length, profile.visitStreak])

  // Handle username save
  const handleSaveUsername = () => {
    setUsername(usernameInput.trim())
    setIsEditing(false)
    
    // Check for profile setup achievement
    if (usernameInput.trim() && !profile.achievements.includes('profile_setup')) {
      unlockAchievement('profile_setup')
    }
  }

  // Handle export
  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onde-profile-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setShowExportSuccess(true)
    setTimeout(() => setShowExportSuccess(false), 3000)
  }

  // Format reading time
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Calculate member duration
  const getMemberDuration = () => {
    const created = new Date(profile.createdAt)
    const now = new Date()
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Just joined!'
    if (days === 1) return '1 day'
    if (days < 30) return `${days} days`
    const months = Math.floor(days / 30)
    return months === 1 ? '1 month' : `${months} months`
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }}>
        <div className="text-4xl animate-pulse">🌊</div>
      </div>
    )
  }

  const unlockedAchievements = getUnlockedAchievements()
  const lockedAchievements = getLockedAchievements()

  return (
    <div className="min-h-screen py-8 px-4 dark:bg-gray-900" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors mb-6"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border-2 border-teal-200 shadow-xl mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker(true)}
              className="relative group"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-6xl shadow-xl">
                {profile.avatar}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Change</span>
              </div>
            </motion.button>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter your name..."
                    className="px-4 py-2 rounded-xl border-2 border-teal-300 focus:border-teal-500 focus:outline-none text-lg bg-white/80"
                    maxLength={20}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUsername}
                      className="px-4 py-2 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setUsernameInput(profile.username)
                        setIsEditing(false)
                      }}
                      className="px-4 py-2 text-teal-600 hover:text-teal-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-3xl font-bold text-teal-800">
                    {profile.username || 'Anonymous Explorer'}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-teal-500 hover:text-teal-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium flex items-center gap-1">
                  <span>📅</span> Member for {getMemberDuration()}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center gap-1">
                  <span>🔥</span> {profile.visitStreak} day streak
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium flex items-center gap-1">
                  <span>🏆</span> {unlockedAchievements.length} achievements
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span>📊</span> Your Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="📚"
              label="Books Started"
              value={profile.stats.booksStarted}
            />
            <StatCard
              icon="✅"
              label="Books Completed"
              value={profile.stats.booksCompleted}
            />
            <StatCard
              icon="🎮"
              label="Games Played"
              value={profile.stats.gamesPlayed.length}
            />
            <StatCard
              icon="❤️"
              label="Favorites"
              value={profile.stats.favoriteBooks}
            />
            <StatCard
              icon="⏱️"
              label="Reading Time"
              value={formatReadingTime(profile.stats.totalReadingTime)}
            />
            <StatCard
              icon="🔥"
              label="Streak"
              value={profile.visitStreak}
              subtext="days"
            />
            <StatCard
              icon="🏆"
              label="Achievements"
              value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
            />
            <StatCard
              icon="⭐"
              label="Level"
              value={Math.floor(unlockedAchievements.length / 2) + 1}
              subtext="Explorer"
            />
          </div>
        </motion.section>

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span>🏅</span> Achievements
          </h2>
          
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-teal-700 mb-3">Unlocked</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {unlockedAchievements.map(achievement => (
                  <AchievementBadge 
                    key={achievement.id} 
                    achievement={achievement} 
                    unlocked 
                  />
                ))}
              </div>
            </div>
          )}
          
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-500 mb-3">Locked</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {lockedAchievements.map(achievement => (
                  <AchievementBadge 
                    key={achievement.id} 
                    achievement={achievement} 
                    unlocked={false} 
                  />
                ))}
              </div>
            </div>
          )}
        </motion.section>

        {/* Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span>⚙️</span> Settings
          </h2>
          <div className="space-y-4">
            <SettingToggle
              icon="🎨"
              label="Theme"
              options={[
                { value: 'light', label: '☀️ Light' },
                { value: 'dark', label: '🌙 Dark' },
                { value: 'system', label: '💻 System' },
              ]}
              value={profile.theme}
              onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
            />
            <SettingToggle
              icon="🌍"
              label="Language"
              options={[
                { value: 'en', label: '🇬🇧 English' },
                { value: 'it', label: '🇮🇹 Italiano' },
              ]}
              value={profile.language}
              onChange={(v) => setLanguage(v as 'en' | 'it')}
            />
          </div>
        </motion.section>

        {/* Data Management */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span>💾</span> Your Data
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-teal-200">
            <p className="text-teal-600 mb-4">
              All your data is stored locally on your device. You can export it anytime.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <span>📤</span>
                Export My Data
              </motion.button>
              
              {showExportSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-green-600 font-medium"
                >
                  <span>✅</span> Downloaded!
                </motion.span>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-teal-100">
              <p className="text-sm text-teal-500">
                🔒 Your data never leaves your device unless you choose to export it.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <div className="text-center text-teal-500 text-sm pb-8">
          <p className="flex items-center justify-center gap-2">
            <span>🌊</span>
            Onde - Crafted by Code, Touched by Soul
            <span>☀️</span>
          </p>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={setAvatar}
        currentEmoji={profile.avatar}
      />
    </div>
  )
}
