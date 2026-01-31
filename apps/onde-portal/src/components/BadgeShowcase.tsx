'use client'

import React, { useState, useEffect } from 'react'
import { 
  useBadges, 
  Badge, 
  BadgeRarity, 
  BadgeCategory,
  BADGE_RARITY_CONFIG,
  BADGE_CATEGORY_CONFIG,
  RARITY_ANIMATIONS,
  BadgeUnlockAnimation as AnimationType
} from '@/hooks/useBadges'

// ============================================
// Badge Card Component
// ============================================

interface BadgeCardProps {
  badge: Badge & { unlocked?: boolean; showcased?: boolean; favorite?: boolean }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showDetails?: boolean
  onClick?: () => void
  isNew?: boolean
  animation?: AnimationType
}

export function BadgeCard({
  badge,
  size = 'md',
  showDetails = true,
  onClick,
  isNew = false,
  animation
}: BadgeCardProps) {
  const rarityConfig = BADGE_RARITY_CONFIG[badge.rarity]
  const [animating, setAnimating] = useState(!!animation)

  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => setAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [animation])

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
    xl: 'w-28 h-28 text-5xl'
  }

  const isLocked = badge.unlocked === false

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-xl 
        transition-all duration-300 cursor-pointer
        ${onClick ? 'hover:scale-105 hover:shadow-lg' : ''}
        ${isLocked ? 'opacity-50 grayscale' : ''}
        ${rarityConfig.shadowClass}
        ${animating ? `animate-[badge-${animation}_1s_ease-out]` : ''}
      `}
    >
      {/* New badge indicator */}
      {isNew && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      )}

      {/* Badge icon container */}
      <div
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center rounded-full
          ${rarityConfig.bgColor}
          border-2 ${rarityConfig.borderColor}
          ${badge.rarity === 'mythic' ? 'animate-[mythic-rainbow_3s_linear_infinite]' : ''}
          ${badge.rarity === 'legendary' ? 'animate-[legendary-glow_2s_ease-in-out_infinite]' : ''}
          transition-all duration-300
        `}
        style={{
          boxShadow: badge.unlocked ? `0 0 20px ${rarityConfig.glowColor}` : 'none'
        }}
      >
        {isLocked && badge.secret ? (
          <span className="text-gray-400">❓</span>
        ) : (
          <span className={isLocked ? 'blur-sm' : ''}>{badge.icon}</span>
        )}
      </div>

      {/* Badge info */}
      {showDetails && (
        <div className="text-center">
          <h4 className={`font-semibold text-sm ${rarityConfig.color}`}>
            {isLocked && badge.secret ? '???' : badge.name}
          </h4>
          {size !== 'sm' && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {isLocked && badge.secret ? 'Secret badge' : badge.description}
            </p>
          )}
        </div>
      )}

      {/* Rarity indicator */}
      <span className={`
        text-xs px-2 py-0.5 rounded-full
        ${rarityConfig.bgColor} ${rarityConfig.color}
        font-medium
      `}>
        {rarityConfig.label}
      </span>

      {/* Showcased star */}
      {badge.showcased && (
        <div className="absolute top-1 left-1">
          <span className="text-onde-gold text-sm">⭐</span>
        </div>
      )}

      {/* Favorite heart */}
      {badge.favorite && (
        <div className="absolute top-1 right-1">
          <span className="text-red-500 text-sm">❤️</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Badge Grid Component
// ============================================

interface BadgeGridProps {
  badges: (Badge & { unlocked?: boolean; showcased?: boolean; favorite?: boolean })[]
  onBadgeClick?: (badge: Badge) => void
  size?: 'sm' | 'md' | 'lg'
  showLocked?: boolean
  columns?: number
}

export function BadgeGrid({
  badges,
  onBadgeClick,
  size = 'md',
  showLocked = true,
  columns = 4
}: BadgeGridProps) {
  const displayBadges = showLocked ? badges : badges.filter(b => b.unlocked)

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
      {displayBadges.map(badge => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          size={size}
          onClick={() => onBadgeClick?.(badge)}
        />
      ))}
    </div>
  )
}

// ============================================
// Profile Badge Display
// ============================================

interface ProfileBadgesProps {
  maxDisplay?: number
  showEmpty?: boolean
  onManageClick?: () => void
}

export function ProfileBadges({
  maxDisplay = 5,
  showEmpty = true,
  onManageClick
}: ProfileBadgesProps) {
  const { showcasedBadges, statistics, canAddToShowcase } = useBadges()

  const displayBadges = showcasedBadges.slice(0, maxDisplay)
  const emptySlots = showEmpty ? Math.max(0, maxDisplay - displayBadges.length) : 0

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">🏅 My Badges</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {statistics.unlockedCount}/{statistics.totalAvailable}
          </span>
          {onManageClick && (
            <button
              onClick={onManageClick}
              className="text-sm text-onde-ocean hover:underline"
            >
              Manage
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {displayBadges.map(badge => (
          <BadgeCard
            key={badge.id}
            badge={{ ...badge, unlocked: true, showcased: true }}
            size="sm"
            showDetails={false}
          />
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 
                       flex items-center justify-center text-gray-400"
          >
            <span>+</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-onde-ocean to-purple-500 transition-all duration-500"
            style={{ width: `${statistics.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">
          {statistics.percentage}% collected • {statistics.totalPoints} points
        </p>
      </div>
    </div>
  )
}

// ============================================
// Category Filter
// ============================================

interface CategoryFilterProps {
  selected: BadgeCategory | 'all'
  onChange: (category: BadgeCategory | 'all') => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories: (BadgeCategory | 'all')[] = ['all', 'games', 'reading', 'social', 'explorer', 'collector', 'special']

  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(cat => {
        const config = cat === 'all' 
          ? { label: 'All', icon: '🎯', color: 'text-gray-700', bgColor: 'bg-gray-100' }
          : BADGE_CATEGORY_CONFIG[cat]
        
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${selected === cat 
                ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Rarity Filter
// ============================================

interface RarityFilterProps {
  selected: BadgeRarity | 'all'
  onChange: (rarity: BadgeRarity | 'all') => void
}

export function RarityFilter({ selected, onChange }: RarityFilterProps) {
  const rarities: (BadgeRarity | 'all')[] = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic']

  return (
    <div className="flex gap-2 flex-wrap">
      {rarities.map(rarity => {
        const config = rarity === 'all'
          ? { label: 'All', color: 'text-gray-700', bgColor: 'bg-gray-100' }
          : BADGE_RARITY_CONFIG[rarity]
        
        return (
          <button
            key={rarity}
            onClick={() => onChange(rarity)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${selected === rarity 
                ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Badge Detail Modal
// ============================================

interface BadgeDetailModalProps {
  badge: Badge & { unlocked?: boolean; showcased?: boolean; favorite?: boolean } | null
  onClose: () => void
  onToggleShowcase?: () => void
  onToggleFavorite?: () => void
}

export function BadgeDetailModal({
  badge,
  onClose,
  onToggleShowcase,
  onToggleFavorite
}: BadgeDetailModalProps) {
  if (!badge) return null

  const rarityConfig = BADGE_RARITY_CONFIG[badge.rarity]
  const categoryConfig = BADGE_CATEGORY_CONFIG[badge.category]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Badge display */}
        <div className="flex flex-col items-center mb-4">
          <div
            className={`
              w-24 h-24 rounded-full flex items-center justify-center text-5xl
              ${rarityConfig.bgColor}
              border-3 ${rarityConfig.borderColor}
              ${rarityConfig.shadowClass}
              ${badge.unlocked ? '' : 'grayscale opacity-50'}
            `}
            style={{
              boxShadow: badge.unlocked ? `0 0 30px ${rarityConfig.glowColor}` : 'none'
            }}
          >
            {badge.unlocked || !badge.secret ? badge.icon : '❓'}
          </div>

          <h2 className={`text-xl font-bold mt-3 ${rarityConfig.color}`}>
            {badge.unlocked || !badge.secret ? badge.name : '???'}
          </h2>

          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${rarityConfig.bgColor} ${rarityConfig.color}`}>
              {rarityConfig.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryConfig.bgColor} ${categoryConfig.color}`}>
              {categoryConfig.icon} {categoryConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center mb-4">
          {badge.unlocked || !badge.secret ? badge.description : 'This is a secret badge...'}
        </p>

        {/* Requirement */}
        {badge.requirement && (badge.unlocked || !badge.secret) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">How to unlock:</span> {badge.requirement}
            </p>
          </div>
        )}

        {/* Points */}
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-onde-gold">{rarityConfig.points}</span>
          <span className="text-gray-500 ml-1">points</span>
        </div>

        {/* Actions */}
        {badge.unlocked && (
          <div className="flex gap-2">
            <button
              onClick={onToggleShowcase}
              className={`
                flex-1 py-2 rounded-lg font-medium transition-all
                ${badge.showcased 
                  ? 'bg-onde-gold text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {badge.showcased ? '⭐ Showcased' : 'Add to Showcase'}
            </button>
            <button
              onClick={onToggleFavorite}
              className={`
                p-2 rounded-lg transition-all
                ${badge.favorite 
                  ? 'bg-red-100 text-red-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {badge.favorite ? '❤️' : '🤍'}
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ============================================
// Badge Unlock Toast
// ============================================

interface BadgeUnlockToastProps {
  badge: Badge | null
  onClose: () => void
}

export function BadgeUnlockToast({ badge, onClose }: BadgeUnlockToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (badge) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [badge, onClose])

  if (!badge) return null

  const rarityConfig = BADGE_RARITY_CONFIG[badge.rarity]
  const animation = RARITY_ANIMATIONS[badge.rarity]

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        bg-white rounded-2xl shadow-2xl p-4
        flex items-center gap-4
        transform transition-all duration-300
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${rarityConfig.shadowClass}
      `}
      style={{
        boxShadow: `0 10px 40px ${rarityConfig.glowColor}`
      }}
    >
      {/* Badge icon with animation */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-3xl
          ${rarityConfig.bgColor}
          border-2 ${rarityConfig.borderColor}
          animate-[badge-${animation}_1s_ease-out]
        `}
      >
        {badge.icon}
      </div>

      {/* Text content */}
      <div>
        <p className="text-sm text-gray-500 font-medium">🎉 Badge Unlocked!</p>
        <h4 className={`font-bold ${rarityConfig.color}`}>{badge.name}</h4>
        <p className="text-xs text-gray-400">{badge.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${rarityConfig.bgColor} ${rarityConfig.color}`}>
            {rarityConfig.label}
          </span>
          <span className="text-xs text-onde-gold font-medium">+{rarityConfig.points} pts</span>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(onClose, 300)
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Sparkle effects for higher rarities */}
      {(badge.rarity === 'legendary' || badge.rarity === 'mythic') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-onde-gold rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Badge Statistics Summary
// ============================================

export function BadgeStatistics() {
  const { statistics, allBadgesWithStatus } = useBadges()

  const rarityOrder: BadgeRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common']
  const categoryOrder: BadgeCategory[] = ['games', 'reading', 'social', 'explorer', 'collector', 'special']

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-4">📊 Collection Stats</h3>

      {/* Main stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-onde-ocean">{statistics.unlockedCount}</div>
          <div className="text-xs text-gray-500">Badges</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-onde-gold">{statistics.totalPoints}</div>
          <div className="text-xs text-gray-500">Points</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{statistics.percentage}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* By rarity */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">By Rarity</h4>
        <div className="space-y-2">
          {rarityOrder.map(rarity => {
            const config = BADGE_RARITY_CONFIG[rarity]
            const total = allBadgesWithStatus.filter(b => b.rarity === rarity).length
            const unlocked = statistics.byRarity[rarity]
            const percentage = total > 0 ? (unlocked / total) * 100 : 0

            return (
              <div key={rarity} className="flex items-center gap-2">
                <span className={`text-xs font-medium w-20 ${config.color}`}>
                  {config.label}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      rarity === 'mythic' ? 'from-pink-500 via-purple-500 to-cyan-500' :
                      rarity === 'legendary' ? 'from-onde-gold to-amber-400' :
                      rarity === 'epic' ? 'from-purple-500 to-purple-400' :
                      rarity === 'rare' ? 'from-onde-ocean to-blue-400' :
                      'from-gray-400 to-gray-300'
                    } transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {unlocked}/{total}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* By category */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">By Category</h4>
        <div className="grid grid-cols-3 gap-2">
          {categoryOrder.map(category => {
            const config = BADGE_CATEGORY_CONFIG[category]
            const total = allBadgesWithStatus.filter(b => b.category === category).length
            const unlocked = statistics.byCategory[category]

            return (
              <div 
                key={category} 
                className={`p-2 rounded-lg ${config.bgColor} text-center`}
              >
                <div className="text-lg">{config.icon}</div>
                <div className={`text-sm font-medium ${config.color}`}>
                  {unlocked}/{total}
                </div>
                <div className="text-xs text-gray-500">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Secrets hint */}
      {statistics.secretsFound < statistics.totalSecrets && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg text-center">
          <span className="text-purple-600 text-sm">
            🔮 {statistics.totalSecrets - statistics.secretsFound} secret badge(s) to discover...
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Full Badge Showcase Page Component
// ============================================

export function BadgeShowcasePage() {
  const {
    allBadgesWithStatus,
    statistics,
    toggleShowcase,
    toggleFavorite,
    popToastQueue,
    toastQueue
  } = useBadges()

  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all')
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all')
  const [selectedBadge, setSelectedBadge] = useState<typeof allBadgesWithStatus[0] | null>(null)
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)
  const [currentToast, setCurrentToast] = useState<Badge | null>(null)

  // Handle toast queue
  useEffect(() => {
    if (toastQueue.length > 0 && !currentToast) {
      setCurrentToast(popToastQueue() || null)
    }
  }, [toastQueue, currentToast, popToastQueue])

  // Filter badges
  const filteredBadges = allBadgesWithStatus.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false
    if (showUnlockedOnly && !badge.unlocked) return false
    return true
  })

  // Sort: unlocked first, then by rarity (mythic first)
  const rarityOrder: BadgeRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common']
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏅 Badge Collection</h1>
          <p className="text-gray-600">
            Collect badges by exploring, reading, playing, and more!
          </p>
        </div>

        {/* Stats summary */}
        <div className="mb-8">
          <BadgeStatistics />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Rarity</label>
            <RarityFilter selected={selectedRarity} onChange={setSelectedRarity} />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={e => setShowUnlockedOnly(e.target.checked)}
              className="rounded border-gray-300 text-onde-ocean focus:ring-onde-ocean"
            />
            Show unlocked only
          </label>
        </div>

        {/* Badge grid */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">
              {sortedBadges.length} Badge{sortedBadges.length !== 1 ? 's' : ''}
            </h2>
            <span className="text-sm text-gray-500">
              Click a badge for details
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="md"
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>

          {sortedBadges.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl mb-4 block">🔍</span>
              <p>No badges match your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Badge detail modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
        onToggleShowcase={() => {
          if (selectedBadge) {
            toggleShowcase(selectedBadge.id)
            setSelectedBadge({
              ...selectedBadge,
              showcased: !selectedBadge.showcased
            })
          }
        }}
        onToggleFavorite={() => {
          if (selectedBadge) {
            toggleFavorite(selectedBadge.id)
            setSelectedBadge({
              ...selectedBadge,
              favorite: !selectedBadge.favorite
            })
          }
        }}
      />

      {/* Toast notification */}
      <BadgeUnlockToast
        badge={currentToast}
        onClose={() => setCurrentToast(null)}
      />

      {/* Global CSS animations are defined in useBadges.ts BADGE_ANIMATION_KEYFRAMES */}
    </div>
  )
}
