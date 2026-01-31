'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Achievement, 
  AchievementRarity, 
  RARITY_CONFIG, 
  ACHIEVEMENTS,
  useAchievements 
} from '@/hooks/useAchievements'
import { AchievementBadge } from './AchievementToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

type FilterCategory = Achievement['category'] | 'all'
type FilterRarity = AchievementRarity | 'all'
type FilterStatus = 'all' | 'unlocked' | 'locked'

interface AchievementGalleryProps {
  showFilters?: boolean
  showStats?: boolean
  columns?: 2 | 3 | 4 | 5 | 6
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementGallery({ 
  showFilters = true, 
  showStats = true,
  columns = 4,
  size = 'md'
}: AchievementGalleryProps) {
  const { 
    getAllAchievements, 
    getProgress, 
    stats, 
    totalPoints 
  } = useAchievements()

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all')
  const [rarityFilter, setRarityFilter] = useState<FilterRarity>('all')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  const filteredAchievements = useMemo(() => {
    return getAllAchievements.filter(a => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
      if (rarityFilter !== 'all' && a.rarity !== rarityFilter) return false
      if (statusFilter === 'unlocked' && !a.unlocked) return false
      if (statusFilter === 'locked' && a.unlocked) return false
      return true
    })
  }, [getAllAchievements, categoryFilter, rarityFilter, statusFilter])

  const categories: { value: FilterCategory; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🏆' },
    { value: 'reading', label: 'Reading', icon: '📚' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'exploration', label: 'Explore', icon: '🧭' },
    { value: 'collection', label: 'Collection', icon: '💎' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'special', label: 'Special', icon: '⭐' }
  ]

  const rarities: { value: FilterRarity; label: string }[] = [
    { value: 'all', label: 'All Rarities' },
    { value: 'common', label: 'Common' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ]

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {showStats && (
        <Card variant="gradient">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Progress */}
              <div className="text-center">
                <div className="text-3xl font-bold text-onde-ocean">
                  {stats.unlocked}/{stats.total}
                </div>
                <div className="text-sm text-gray-600">Unlocked</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-onde-coral to-onde-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Points */}
              <div className="text-center">
                <div className="text-3xl font-bold text-onde-gold">
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>

              {/* By Rarity */}
              <div className="text-center col-span-2 md:col-span-2">
                <div className="flex justify-center gap-3 mb-1">
                  {(['common', 'rare', 'epic', 'legendary'] as const).map(rarity => (
                    <div key={rarity} className="text-center">
                      <div className={`text-lg font-bold ${RARITY_CONFIG[rarity].color}`}>
                        {stats.byRarity[rarity]}
                      </div>
                      <div className="text-[10px] text-gray-500 capitalize">{rarity}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">By Rarity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${categoryFilter === cat.value
                    ? 'bg-onde-coral text-white shadow-md'
                    : 'bg-white/80 text-gray-600 hover:bg-onde-coral/10'
                  }
                `}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value as FilterRarity)}
              className="px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200 
                        text-sm focus:outline-none focus:ring-2 focus:ring-onde-coral/30"
            >
              {rarities.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200 
                        text-sm focus:outline-none focus:ring-2 focus:ring-onde-coral/30"
            >
              <option value="all">All Status</option>
              <option value="unlocked">Unlocked Only</option>
              <option value="locked">Locked Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      <div className={`grid ${columnClasses[columns]} gap-4`}>
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, index) => {
            const progress = getProgress(achievement.id)
            
            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card 
                  variant={achievement.unlocked ? 'gradient' : 'default'}
                  className={`
                    p-4 cursor-pointer transition-all duration-300
                    hover:shadow-lg hover:scale-[1.02]
                    ${achievement.unlocked ? '' : 'opacity-70'}
                  `}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <AchievementBadge
                      achievement={achievement}
                      unlocked={achievement.unlocked}
                      progress={progress.max > 1 ? progress : undefined}
                      size={size}
                    />
                    
                    <div className="min-w-0 w-full">
                      <h4 className={`
                        font-semibold text-sm truncate
                        ${achievement.unlocked ? 'text-onde-ocean' : 'text-gray-500'}
                      `}>
                        {achievement.secret && !achievement.unlocked ? '???' : achievement.name}
                      </h4>
                      
                      <span className={`
                        text-[10px] uppercase tracking-wider font-medium
                        ${RARITY_CONFIG[achievement.rarity].color}
                      `}>
                        {RARITY_CONFIG[achievement.rarity].label}
                      </span>
                    </div>

                    {/* Progress bar for progressive achievements */}
                    {progress.max > 1 && !achievement.unlocked && (
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-onde-coral/60 transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🔍</span>
          <p>No achievements match your filters</p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <AchievementDetailModal
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
            progress={getProgress(selectedAchievement.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Detail Modal Component
interface AchievementDetailModalProps {
  achievement: Achievement & { unlocked: boolean; unlockedAt?: string }
  onClose: () => void
  progress: { current: number; max: number; percentage: number }
}

function AchievementDetailModal({ 
  achievement, 
  onClose, 
  progress 
}: AchievementDetailModalProps) {
  const rarityConfig = RARITY_CONFIG[achievement.rarity]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`
          relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl
          ${achievement.rarity === 'legendary' ? 'ring-2 ring-onde-gold' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className={`
              w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4
              ${achievement.unlocked ? `${rarityConfig.bg} ${rarityConfig.border} border-2 ${rarityConfig.glow}` : 'bg-gray-100'}
            `}
          >
            <span className={`text-5xl ${achievement.unlocked ? '' : 'grayscale opacity-30'}`}>
              {achievement.icon}
            </span>
          </motion.div>

          {/* Rarity Badge */}
          <div className={`
            inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2
            ${rarityConfig.bg} ${rarityConfig.color}
          `}>
            {rarityConfig.label} • +{rarityConfig.points} pts
          </div>

          {/* Name */}
          <h3 className="text-2xl font-display font-bold text-onde-ocean mb-2">
            {achievement.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4">
            {achievement.description}
          </p>

          {/* Category */}
          <div className="text-sm text-gray-500 mb-4 capitalize">
            Category: {achievement.category}
          </div>

          {/* Progress or Unlock Status */}
          {achievement.unlocked ? (
            <div className="bg-green-100 rounded-xl p-3">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Unlocked!</span>
              </div>
              {achievement.unlockedAt && (
                <div className="text-xs text-green-600 mt-1">
                  {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          ) : progress.max > 1 ? (
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {progress.current} / {progress.max}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-onde-coral"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-3 text-gray-500">
              <span className="text-lg">🔒</span>
              <div className="text-sm">Keep exploring to unlock!</div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Compact achievement summary component
export function AchievementSummary() {
  const { stats, totalPoints } = useAchievements()

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl">
      <div className="text-2xl">🏆</div>
      <div>
        <div className="text-sm font-medium text-onde-ocean">
          {stats.unlocked}/{stats.total} Achievements
        </div>
        <div className="text-xs text-gray-500">
          {totalPoints} points • {stats.percentage}% complete
        </div>
      </div>
    </div>
  )
}

// Mini progress bar for navigation
export function AchievementProgressBar() {
  const { stats } = useAchievements()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">🏆</span>
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-onde-coral to-onde-gold transition-all duration-500"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{stats.percentage}%</span>
    </div>
  )
}
