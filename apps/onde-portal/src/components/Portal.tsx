'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { usePortalDiscovery, PortalType, WorldType, PREDEFINED_PORTALS } from '@/hooks/usePortalDiscovery'

interface PortalProps {
  portalId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onEnter?: () => void
  onTransitionComplete?: () => void
  disabled?: boolean
  showLabel?: boolean
  className?: string
  autoDiscover?: boolean
}

// Portal color schemes based on type
const portalColors: Record<PortalType, { primary: string; secondary: string; glow: string }> = {
  book: {
    primary: 'from-amber-500 via-orange-400 to-yellow-300',
    secondary: 'from-amber-600 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
  game: {
    primary: 'from-purple-500 via-pink-400 to-cyan-300',
    secondary: 'from-purple-600 to-pink-500',
    glow: 'rgba(168, 85, 247, 0.6)',
  },
  secret: {
    primary: 'from-slate-800 via-indigo-900 to-violet-900',
    secondary: 'from-slate-900 to-indigo-800',
    glow: 'rgba(99, 102, 241, 0.6)',
  },
  'easter-egg': {
    primary: 'from-emerald-400 via-teal-300 to-cyan-400',
    secondary: 'from-emerald-500 to-teal-400',
    glow: 'rgba(20, 184, 166, 0.6)',
  },
}

const sizeConfig = {
  sm: { container: 'w-24 h-24', ring: 'w-20 h-20', inner: 'w-16 h-16' },
  md: { container: 'w-36 h-36', ring: 'w-32 h-32', inner: 'w-24 h-24' },
  lg: { container: 'w-48 h-48', ring: 'w-44 h-44', inner: 'w-32 h-32' },
  xl: { container: 'w-64 h-64', ring: 'w-56 h-56', inner: 'w-44 h-44' },
}

// Particle component for the swirling effect
function PortalParticle({ delay, duration, color }: { delay: number; duration: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ 
        x: 0, 
        y: 0, 
        opacity: 0, 
        scale: 0 
      }}
      animate={{
        x: [0, Math.random() * 60 - 30, 0],
        y: [0, Math.random() * 60 - 30, 0],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Swirling ring component
function SwirlRing({ 
  className, 
  duration, 
  reverse = false,
  opacity = 0.3,
}: { 
  className: string
  duration: number
  reverse?: boolean
  opacity?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full border-4 border-transparent ${className}`}
      style={{
        borderTopColor: `rgba(255, 255, 255, ${opacity})`,
        borderRightColor: `rgba(255, 255, 255, ${opacity * 0.5})`,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

export default function Portal({
  portalId,
  size = 'md',
  onEnter,
  onTransitionComplete,
  disabled = false,
  showLabel = true,
  className = '',
  autoDiscover = true,
}: PortalProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const controls = useAnimation()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const { discoverPortal, usePortal, isPortalDiscovered, getPortal } = usePortalDiscovery()
  
  const portalDef = PREDEFINED_PORTALS[portalId]
  const portal = getPortal(portalId)
  const colors = portalColors[portalDef?.type || 'game']
  const sizes = sizeConfig[size]

  // Auto-discover portal when component mounts
  useEffect(() => {
    if (autoDiscover && portalDef && !isPortalDiscovered(portalId)) {
      discoverPortal(portalId)
    }
  }, [autoDiscover, portalId, portalDef, isPortalDiscovered, discoverPortal])

  // Preload audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/portal-whoosh.mp3')
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 0.5
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playWhoosh = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Audio play failed (autoplay policy)
      })
    }
  }, [])

  const handleActivate = useCallback(async () => {
    if (disabled || isActivating) return

    setIsActivating(true)
    playWhoosh()
    
    // Track portal usage
    usePortal(portalId)
    
    // Pulse animation
    await controls.start({
      scale: [1, 1.2, 0.9, 1.1, 1],
      transition: { duration: 0.5 },
    })

    // Show fullscreen transition
    setShowTransition(true)
    onEnter?.()

    // Wait for transition animation
    setTimeout(() => {
      setIsActivating(false)
      setShowTransition(false)
      onTransitionComplete?.()
    }, 2000)
  }, [disabled, isActivating, controls, playWhoosh, usePortal, portalId, onEnter, onTransitionComplete])

  if (!portalDef) {
    return null
  }

  return (
    <>
      {/* Main Portal */}
      <motion.div
        className={`relative flex items-center justify-center cursor-pointer ${sizes.container} ${className}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleActivate}
        animate={controls}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: colors.glow }}
          animate={{
            opacity: isHovered ? 0.8 : 0.4,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Swirling rings */}
        <SwirlRing className={sizes.ring} duration={3} opacity={0.4} />
        <SwirlRing className={sizes.ring} duration={4} reverse opacity={0.3} />
        <SwirlRing className={`${sizes.inner}`} duration={2} opacity={0.5} />

        {/* Main portal vortex */}
        <motion.div
          className={`absolute ${sizes.inner} rounded-full overflow-hidden`}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-conic ${colors.primary}`} />
          
          {/* Spiral overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-conic-gradient(
                from 0deg,
                transparent 0deg 10deg,
                rgba(255,255,255,0.1) 10deg 20deg
              )`,
            }}
          />
        </motion.div>

        {/* Inner dark center */}
        <motion.div
          className="absolute w-1/3 h-1/3 rounded-full bg-black/80"
          animate={{
            scale: isHovered ? [1, 0.8, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isHovered ? Infinity : 0,
          }}
        >
          {/* Star sparkle */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-white/80"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✦
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <PortalParticle
              key={i}
              delay={i * 0.2}
              duration={2 + Math.random()}
              color={i % 2 === 0 ? '#fff' : colors.glow}
            />
          ))}
        </div>

        {/* Portal type icon */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                     bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5
                     shadow-lg border border-white/50 text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {portalDef.type === 'book' && '📚'}
          {portalDef.type === 'game' && '🎮'}
          {portalDef.type === 'secret' && '🌀'}
          {portalDef.type === 'easter-egg' && '🥚'}
        </motion.div>

        {/* Secret indicator */}
        {portalDef.isSecret && (
          <motion.div
            className="absolute -top-2 -right-2 text-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
        )}
      </motion.div>

      {/* Portal label */}
      {showLabel && (
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-display font-bold text-onde-ocean">
            {portalDef.name}
          </h3>
          <p className="text-sm text-onde-ocean/60 mt-1">
            {portalDef.description}
          </p>
          {portal && portal.useCount > 0 && (
            <p className="text-xs text-onde-teal mt-2">
              Used {portal.useCount} time{portal.useCount !== 1 ? 's' : ''}
            </p>
          )}
        </motion.div>
      )}

      {/* Fullscreen transition overlay */}
      <AnimatePresence>
        {showTransition && (
          <PortalTransition 
            type={portalDef.type} 
            from={portalDef.from}
            to={portalDef.to}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Fullscreen portal transition effect
function PortalTransition({ 
  type, 
  from, 
  to 
}: { 
  type: PortalType
  from: WorldType
  to: WorldType 
}) {
  const colors = portalColors[type]

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Swirling vortex background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
        }}
      />

      {/* Speed lines */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 bg-white/30"
            style={{
              left: '50%',
              top: '50%',
              width: '100vmax',
              transformOrigin: 'left center',
              rotate: `${(i * 360) / 30}deg`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.03,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Central vortex */}
      <motion.div
        className="relative w-64 h-64 rounded-full overflow-hidden"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1.5, 20],
          rotate: [0, 180, 720],
        }}
        transition={{
          duration: 1.8,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className={`absolute inset-0 bg-gradient-conic ${colors.primary}`} />
        <motion.div
          className="absolute inset-0"
          style={{
            background: `repeating-conic-gradient(
              from 0deg,
              transparent 0deg 5deg,
              rgba(255,255,255,0.15) 5deg 10deg
            )`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* World labels */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -50 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-white/80 text-sm uppercase tracking-widest">Leaving</p>
        <p className="text-white text-2xl font-display font-bold mt-2 capitalize">
          {from.replace('-', ' ')}
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-white/80 text-sm uppercase tracking-widest">Entering</p>
        <p className="text-white text-2xl font-display font-bold mt-2 capitalize">
          {to.replace('-', ' ')}
        </p>
      </motion.div>

      {/* Screen distortion effect (simulated with blur) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(0px)',
        }}
        animate={{
          backdropFilter: ['blur(0px)', 'blur(10px)', 'blur(0px)'],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.5, 1],
        }}
      />
    </motion.div>
  )
}

// Export transition component for use elsewhere
export { PortalTransition }
