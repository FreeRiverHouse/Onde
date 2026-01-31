'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Portal from './Portal'
import { usePortalDiscovery, WorldType } from '@/hooks/usePortalDiscovery'

interface PortalHubProps {
  currentWorld: WorldType
  className?: string
}

// World configurations
const worldConfig: Record<WorldType, {
  name: string
  emoji: string
  color: string
  background: string
  description: string
}> = {
  'gaming-island': {
    name: 'Gaming Island',
    emoji: '🎮',
    color: 'from-purple-500 to-pink-500',
    background: 'from-purple-900/20 to-pink-900/20',
    description: 'The land of games and adventures',
  },
  'library': {
    name: 'The Library',
    emoji: '📚',
    color: 'from-amber-500 to-orange-500',
    background: 'from-amber-900/20 to-orange-900/20',
    description: 'A magical realm of stories and wisdom',
  },
  'secret-realm': {
    name: 'Secret Realm',
    emoji: '🌟',
    color: 'from-emerald-500 to-teal-500',
    background: 'from-emerald-900/20 to-teal-900/20',
    description: 'A hidden dimension for the worthy',
  },
  'void': {
    name: 'The Void',
    emoji: '🌀',
    color: 'from-slate-700 to-indigo-900',
    background: 'from-slate-900/40 to-indigo-900/40',
    description: 'The space between worlds...',
  },
}

// Portal routes based on current world
const portalRoutes: Record<WorldType, { portalId: string; destination: string }[]> = {
  'gaming-island': [
    { portalId: 'gaming-to-library', destination: '/libri' },
    { portalId: 'game-hopper', destination: '/giochi' },
  ],
  'library': [
    { portalId: 'library-to-gaming', destination: '/giochi' },
  ],
  'secret-realm': [
    { portalId: 'gaming-to-library', destination: '/libri' },
  ],
  'void': [
    { portalId: 'library-to-gaming', destination: '/giochi' },
    { portalId: 'gaming-to-library', destination: '/libri' },
  ],
}

export default function PortalHub({ currentWorld, className = '' }: PortalHubProps) {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<string | null>(null)
  const { getStats, mounted } = usePortalDiscovery()

  const currentConfig = worldConfig[currentWorld]
  const availablePortals = portalRoutes[currentWorld] || []
  const stats = getStats()

  const handlePortalEnter = (destination: string) => {
    setIsTransitioning(true)
    setPendingDestination(destination)
  }

  const handleTransitionComplete = () => {
    if (pendingDestination) {
      router.push(pendingDestination)
    }
    setIsTransitioning(false)
    setPendingDestination(null)
  }

  if (!mounted) {
    return null
  }

  return (
    <motion.div
      className={`relative rounded-4xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.background}`} />
      
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative px-8 py-12 md:px-12">
        {/* Current World Header */}
        <div className="text-center mb-12">
          <motion.div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl
                       bg-gradient-to-br ${currentConfig.color} shadow-xl mb-6`}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-4xl">{currentConfig.emoji}</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-onde-ocean mb-2">
            {currentConfig.name}
          </h2>
          <p className="text-onde-ocean/60">
            {currentConfig.description}
          </p>
        </div>

        {/* Portal Navigation */}
        <div className="mb-8">
          <h3 className="text-center text-lg font-semibold text-onde-ocean/80 mb-8">
            ✨ Choose Your Destination ✨
          </h3>

          <div className="flex flex-wrap justify-center gap-12">
            {availablePortals.map(({ portalId, destination }) => (
              <motion.div
                key={portalId}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Portal
                  portalId={portalId}
                  size="lg"
                  onEnter={() => handlePortalEnter(destination)}
                  onTransitionComplete={handleTransitionComplete}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-onde-ocean/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-onde-ocean/5">
            <span>🌀</span>
            <span className="text-sm text-onde-ocean/70">
              <strong>{stats.discovered}</strong> portals found
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-onde-ocean/5">
            <span>✨</span>
            <span className="text-sm text-onde-ocean/70">
              <strong>{stats.secrets}</strong> secrets unlocked
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-onde-ocean/5">
            <span>🚀</span>
            <span className="text-sm text-onde-ocean/70">
              <strong>{stats.totalUses}</strong> journeys
            </span>
          </div>
        </motion.div>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                🌀
              </motion.div>
              <p className="text-xl font-display">Traveling through dimensions...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Mini floating portal button for persistent navigation
export function FloatingPortalButton({
  currentWorld,
  className = '',
}: {
  currentWorld: WorldType
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { mounted } = usePortalDiscovery()

  const availablePortals = portalRoutes[currentWorld] || []

  if (!mounted) return null

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {availablePortals.map(({ portalId, destination }) => (
              <motion.button
                key={portalId}
                className="w-12 h-12 rounded-full bg-white shadow-lg
                         flex items-center justify-center text-2xl
                         hover:scale-110 transition-transform"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsOpen(false)
                  router.push(destination)
                }}
              >
                {portalId.includes('library') ? '📚' : '🎮'}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="w-14 h-14 rounded-full bg-gradient-to-br from-onde-teal to-onde-coral
                   shadow-xl shadow-onde-teal/30 flex items-center justify-center text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          rotate: isOpen ? 45 : 0,
        }}
      >
        🌀
      </motion.button>
    </div>
  )
}
