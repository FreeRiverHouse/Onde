'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Portal from './Portal'
import { usePortalDiscovery, PREDEFINED_PORTALS } from '@/hooks/usePortalDiscovery'

interface PortalGalleryProps {
  showSecrets?: boolean
  onPortalEnter?: (portalId: string) => void
  className?: string
}

export default function PortalGallery({
  showSecrets = false,
  onPortalEnter,
  className = '',
}: PortalGalleryProps) {
  const { mounted, getStats, getDiscoveredPortals, isPortalDiscovered, achievementUnlocked } = usePortalDiscovery()
  const [showAchievement, setShowAchievement] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'discovered' | 'undiscovered'>('all')

  const stats = getStats()
  const discoveredPortals = getDiscoveredPortals()

  // Show achievement toast when unlocked
  useEffect(() => {
    if (achievementUnlocked && mounted) {
      setShowAchievement(true)
      const timer = setTimeout(() => setShowAchievement(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [achievementUnlocked, mounted])

  // Get filtered portals
  const getFilteredPortals = () => {
    const allPortals = Object.entries(PREDEFINED_PORTALS)
      .filter(([_, portal]) => !portal.isSecret || showSecrets)

    if (selectedFilter === 'discovered') {
      return allPortals.filter(([id]) => isPortalDiscovered(id))
    }
    if (selectedFilter === 'undiscovered') {
      return allPortals.filter(([id]) => !isPortalDiscovered(id))
    }
    return allPortals
  }

  const filteredPortals = getFilteredPortals()

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-onde-ocean/10 rounded-xl w-48 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-onde-ocean/10" />
              <div className="h-4 bg-onde-ocean/10 rounded w-24 mt-4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Stats Header */}
      <motion.div
        className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-onde-teal/10 text-onde-teal">
            <span className="text-xl">🌀</span>
            <span className="font-semibold">
              {stats.discovered}/{stats.total} Portals Discovered
            </span>
          </div>
          {stats.secrets > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/10 text-purple-600">
              <span className="text-xl">✨</span>
              <span className="font-semibold">
                {stats.secrets} Secret{stats.secrets !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {(['all', 'discovered', 'undiscovered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                         ${selectedFilter === filter
                           ? 'bg-onde-ocean text-white'
                           : 'bg-onde-ocean/10 text-onde-ocean hover:bg-onde-ocean/20'
                         }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative h-3 bg-onde-ocean/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-onde-teal to-onde-coral rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '500%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </div>
        <p className="text-center text-sm text-onde-ocean/60 mt-2">
          {stats.percentage}% Complete
        </p>
      </motion.div>

      {/* Portals Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-12"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredPortals.map(([portalId, portal]) => {
            const isDiscovered = isPortalDiscovered(portalId)

            return (
              <motion.div
                key={portalId}
                className="flex flex-col items-center"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                {isDiscovered ? (
                  <Portal
                    portalId={portalId}
                    size="lg"
                    onEnter={() => onPortalEnter?.(portalId)}
                    autoDiscover={false}
                  />
                ) : (
                  <LockedPortal
                    name={portal.name}
                    isSecret={portal.isSecret}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredPortals.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-onde-ocean/60 text-lg">
            {selectedFilter === 'discovered'
              ? 'No portals discovered yet. Explore to find them!'
              : 'All portals have been discovered!'}
          </p>
        </motion.div>
      )}

      {/* Total uses stats */}
      {stats.totalUses > 0 && (
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-onde-ocean/50 text-sm">
            Total portal travels: <span className="font-bold text-onde-teal">{stats.totalUses}</span>
          </p>
        </motion.div>
      )}

      {/* Achievement Toast */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
          >
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl
                           bg-gradient-to-r from-purple-600 to-pink-600
                           text-white shadow-2xl shadow-purple-500/30">
              <motion.span
                className="text-4xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🏆
              </motion.span>
              <div>
                <p className="font-bold text-lg">Portal Master!</p>
                <p className="text-white/80 text-sm">All secret portals discovered!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Locked/Undiscovered Portal Component
function LockedPortal({ name, isSecret }: { name: string; isSecret: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative w-48 h-48 flex items-center justify-center cursor-not-allowed"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Outer ring */}
        <div className="absolute w-44 h-44 rounded-full border-4 border-dashed border-onde-ocean/20" />
        
        {/* Inner circle */}
        <motion.div
          className="w-36 h-36 rounded-full bg-onde-ocean/5 flex items-center justify-center"
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
        >
          <motion.span
            className="text-5xl grayscale opacity-50"
            animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            {isSecret ? '🔮' : '🌀'}
          </motion.span>
        </motion.div>

        {/* Lock icon */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                     bg-onde-ocean/10 rounded-full p-3"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
        >
          <span className="text-xl">🔒</span>
        </motion.div>
      </motion.div>

      <div className="text-center mt-6">
        <h3 className="text-lg font-display font-bold text-onde-ocean/40">
          {isSecret ? '???' : name}
        </h3>
        <p className="text-sm text-onde-ocean/30 mt-1">
          {isSecret ? 'Hidden portal...' : 'Not yet discovered'}
        </p>
      </div>
    </div>
  )
}

export { LockedPortal }
