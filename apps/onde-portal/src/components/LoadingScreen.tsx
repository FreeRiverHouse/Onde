'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

// ============================================
// TYPES
// ============================================

export type LoadingTheme = 
  | 'ocean'      // Deep sea exploration
  | 'books'      // Library magic
  | 'games'      // Playful gaming
  | 'adventure'  // Epic journey
  | 'cosmic'     // Space exploration
  | 'default'    // General purpose

export interface LoadingScreenProps {
  isLoading: boolean
  theme?: LoadingTheme
  progress?: number         // 0-100, optional manual progress
  showTips?: boolean
  customMessage?: string
  minimumDisplayTime?: number  // Minimum time to show (ms)
  onLoadingComplete?: () => void
}

// ============================================
// LOADING MESSAGES BY THEME
// ============================================

const LOADING_MESSAGES: Record<LoadingTheme, string[]> = {
  ocean: [
    'Diving into the deep...',
    'Summoning the waves...',
    'Waking up the sea creatures...',
    'Collecting shells of wisdom...',
    'Surfing the digital currents...',
    'Exploring underwater caves...',
    'Following the starfish trail...',
  ],
  books: [
    'Opening magical pages...',
    'Dusting off ancient tales...',
    'Bookmarking your adventure...',
    'Brewing story potions...',
    'Gathering fairy dust...',
    'Whispering to the library spirits...',
    'Enchanting the letters...',
  ],
  games: [
    'Loading power-ups...',
    'Spawning fun particles...',
    'Calibrating joy sensors...',
    'Warming up the game engine...',
    'Generating excitement...',
    'Polishing the high scores...',
    'Summoning friendly dragons...',
  ],
  adventure: [
    'Preparing your journey...',
    'Mapping uncharted territories...',
    'Packing magical supplies...',
    'Consulting the wise owls...',
    'Charging your courage...',
    'Awakening ancient magic...',
    'Following the golden path...',
  ],
  cosmic: [
    'Aligning the stars...',
    'Traveling through nebulas...',
    'Collecting stardust...',
    'Charting the cosmos...',
    'Waking the constellations...',
    'Crossing the Milky Way...',
    'Orbiting dream planets...',
  ],
  default: [
    'Preparing magic...',
    'Almost there...',
    'Creating wonders...',
    'Weaving dreams...',
    'Crafting experiences...',
    'Sprinkling pixie dust...',
    'Unlocking treasures...',
  ],
}

// ============================================
// LOADING TIPS
// ============================================

const LOADING_TIPS: string[] = [
  '💡 Did you know? Reading for 20 minutes a day exposes you to 1.8 million words per year!',
  '🐙 Octopuses have three hearts and blue blood!',
  '📚 The longest book ever written has over 4 million words!',
  '🌊 Waves can travel thousands of miles across the ocean!',
  '⭐ There are more stars in the universe than grains of sand on Earth!',
  '🎮 Playing games can improve problem-solving skills!',
  '🦋 A butterfly can see more colors than humans!',
  '📖 The first book was printed over 500 years ago!',
  '🐬 Dolphins sleep with one eye open!',
  '✨ Your brain creates new connections every time you learn!',
  '🌙 The moon is slowly moving away from Earth each year!',
  '🎨 Some shrimp can see 16 different colors!',
]

// ============================================
// THEME CONFIGURATIONS
// ============================================

interface ThemeConfig {
  gradient: string
  accentColor: string
  glowColor: string
  particleEmoji: string[]
  waveColors: string[]
}

const THEME_CONFIGS: Record<LoadingTheme, ThemeConfig> = {
  ocean: {
    gradient: 'from-onde-ocean via-onde-teal to-blue-900',
    accentColor: '#5B9AA0',
    glowColor: 'rgba(91, 154, 160, 0.5)',
    particleEmoji: ['🐠', '🐙', '🦑', '🐚', '✨', '💫', '🫧'],
    waveColors: ['#26619C', '#5B9AA0', '#7EB8C4'],
  },
  books: {
    gradient: 'from-amber-900 via-onde-coral to-orange-800',
    accentColor: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.5)',
    particleEmoji: ['📚', '✨', '🪄', '⭐', '📖', '🌟', '✏️'],
    waveColors: ['#D4AF37', '#E5C158', '#FFD700'],
  },
  games: {
    gradient: 'from-purple-900 via-fuchsia-800 to-pink-900',
    accentColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    particleEmoji: ['🎮', '🕹️', '⭐', '💎', '🏆', '⚡', '🎯'],
    waveColors: ['#A855F7', '#D946EF', '#EC4899'],
  },
  adventure: {
    gradient: 'from-emerald-900 via-teal-800 to-cyan-900',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    particleEmoji: ['🗺️', '⚔️', '🏰', '🐉', '💎', '✨', '🌟'],
    waveColors: ['#10B981', '#14B8A6', '#22D3EE'],
  },
  cosmic: {
    gradient: 'from-indigo-950 via-purple-900 to-slate-900',
    accentColor: '#818CF8',
    glowColor: 'rgba(129, 140, 248, 0.5)',
    particleEmoji: ['🌟', '⭐', '💫', '🚀', '🌙', '☄️', '✨'],
    waveColors: ['#818CF8', '#A78BFA', '#C4B5FD'],
  },
  default: {
    gradient: 'from-onde-ocean via-onde-teal to-onde-ocean-light',
    accentColor: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.5)',
    particleEmoji: ['✨', '⭐', '💫', '🌟', '💎', '🔮', '🪄'],
    waveColors: ['#D4AF37', '#5B9AA0', '#26619C'],
  },
}

// ============================================
// ANIMATED ONDE LOGO
// ============================================

function AnimatedOndeLogo({ theme }: { theme: ThemeConfig }) {
  const waveVariants: Variants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  }

  return (
    <motion.div 
      className="relative w-32 h-32 md:w-40 md:h-40"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: theme.glowColor }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Logo container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: `drop-shadow(0 0 10px ${theme.glowColor})` }}
        >
          {/* Animated wave paths */}
          <motion.path
            d="M15 50 Q 30 30, 50 50 T 85 50"
            fill="none"
            stroke={theme.waveColors[0]}
            strokeWidth="4"
            strokeLinecap="round"
            variants={waveVariants}
            initial="initial"
            animate="animate"
          />
          <motion.path
            d="M15 60 Q 30 40, 50 60 T 85 60"
            fill="none"
            stroke={theme.waveColors[1]}
            strokeWidth="3"
            strokeLinecap="round"
            variants={waveVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          />
          <motion.path
            d="M15 70 Q 30 50, 50 70 T 85 70"
            fill="none"
            stroke={theme.waveColors[2]}
            strokeWidth="2"
            strokeLinecap="round"
            variants={waveVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          />
          
          {/* Central dot */}
          <motion.circle
            cx="50"
            cy="40"
            r="6"
            fill={theme.accentColor}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.8, duration: 0.5 }}
          />
        </svg>
        
        {/* Orbiting particle */}
        <motion.div
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: theme.accentColor }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          initial={{ x: 50 }}
        />
      </div>

      {/* "Onde" text */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span 
          className="text-2xl md:text-3xl font-bold tracking-wider"
          style={{ 
            color: theme.accentColor,
            textShadow: `0 0 20px ${theme.glowColor}`
          }}
        >
          ONDE
        </span>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// PROGRESS BAR
// ============================================

function ProgressBar({ progress, theme }: { progress: number; theme: ThemeConfig }) {
  return (
    <div className="w-64 md:w-80 mt-16">
      {/* Progress track */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        {/* Animated shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Progress fill */}
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: theme.accentColor }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      </div>
      
      {/* Progress percentage */}
      <motion.div
        className="mt-2 text-center text-sm text-white/60"
        key={Math.floor(progress)}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {Math.round(progress)}%
      </motion.div>
    </div>
  )
}

// ============================================
// FLOATING PARTICLES
// ============================================

function FloatingParticles({ theme }: { theme: ThemeConfig }) {
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: theme.particleEmoji[Math.floor(Math.random() * theme.particleEmoji.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 16 + Math.random() * 16,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })), [theme.particleEmoji])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: particle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.5, 1, 1, 0.5],
            y: [0, -30, -60, -90],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// WAVE ANIMATION
// ============================================

function WaveAnimation({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
      {theme.waveColors.map((color, index) => (
        <motion.svg
          key={index}
          className="absolute bottom-0 w-full h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ opacity: 0.3 - index * 0.1 }}
          animate={{ x: [0, -50, 0] }}
          transition={{
            duration: 3 + index,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path
            d={`M0,${60 + index * 10} C150,${30 + index * 10} 350,${90 + index * 5} 600,${60 + index * 10} C850,${30 + index * 10} 1050,${90 + index * 5} 1200,${60 + index * 10} L1200,120 L0,120 Z`}
            fill={color}
          />
        </motion.svg>
      ))}
    </div>
  )
}

// ============================================
// MAIN LOADING SCREEN COMPONENT
// ============================================

export function LoadingScreen({
  isLoading,
  theme = 'default',
  progress: externalProgress,
  showTips = true,
  customMessage,
  minimumDisplayTime = 1500,
  onLoadingComplete,
}: LoadingScreenProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentTip, setCurrentTip] = useState('')
  const [shouldShow, setShouldShow] = useState(isLoading)
  const [startTime] = useState(Date.now())

  const themeConfig = THEME_CONFIGS[theme]
  const messages = LOADING_MESSAGES[theme]
  
  // Use external progress if provided, otherwise use internal
  const progress = externalProgress ?? internalProgress

  // Rotate loading messages
  useEffect(() => {
    if (!shouldShow) return
    
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)])
    
    const interval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 2500)
    
    return () => clearInterval(interval)
  }, [shouldShow, messages])

  // Rotate tips
  useEffect(() => {
    if (!shouldShow || !showTips) return
    
    setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)])
    
    const interval = setInterval(() => {
      setCurrentTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)])
    }, 5000)
    
    return () => clearInterval(interval)
  }, [shouldShow, showTips])

  // Simulate progress if no external progress
  useEffect(() => {
    if (!shouldShow || externalProgress !== undefined) return
    
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        if (prev >= 90) return prev
        const increment = Math.random() * 15
        return Math.min(prev + increment, 90)
      })
    }, 300)
    
    return () => clearInterval(interval)
  }, [shouldShow, externalProgress])

  // Handle loading state changes with minimum display time
  useEffect(() => {
    if (isLoading) {
      setShouldShow(true)
      setInternalProgress(0)
    } else {
      // Complete the progress
      setInternalProgress(100)
      
      // Ensure minimum display time
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minimumDisplayTime - elapsed)
      
      const timer = setTimeout(() => {
        setShouldShow(false)
        onLoadingComplete?.()
      }, remaining + 500) // Extra 500ms for smooth completion
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, minimumDisplayTime, startTime, onLoadingComplete])

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br ${themeConfig.gradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'blur(10px)',
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Background effects */}
          <FloatingParticles theme={themeConfig} />
          <WaveAnimation theme={themeConfig} />
          
          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated logo */}
            <AnimatedOndeLogo theme={themeConfig} />
            
            {/* Loading message */}
            <motion.div
              className="mt-12 text-center"
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xl md:text-2xl text-white/90 font-medium">
                {customMessage || currentMessage}
              </p>
            </motion.div>
            
            {/* Progress bar */}
            <ProgressBar progress={progress} theme={themeConfig} />
            
            {/* Loading tip */}
            {showTips && currentTip && (
              <motion.div
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-md px-6 text-center"
                key={currentTip}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm text-white/60 italic">
                  {currentTip}
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Skip hint (for long loads) */}
          {progress < 100 && (
            <motion.div
              className="absolute bottom-6 text-white/30 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              Loading your experience...
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// HOOK FOR EASY USAGE
// ============================================

export function useLoadingScreen(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [progress, setProgress] = useState(0)
  const [theme, setTheme] = useState<LoadingTheme>('default')

  const startLoading = useCallback((newTheme?: LoadingTheme) => {
    if (newTheme) setTheme(newTheme)
    setProgress(0)
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setProgress(100)
    setIsLoading(false)
  }, [])

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)))
  }, [])

  return {
    isLoading,
    progress,
    theme,
    startLoading,
    stopLoading,
    updateProgress,
    setTheme,
    LoadingScreenComponent: (
      <LoadingScreen
        isLoading={isLoading}
        progress={progress}
        theme={theme}
      />
    ),
  }
}

// ============================================
// SECTION-SPECIFIC PRESETS
// ============================================

export function BooksLoadingScreen({ isLoading }: { isLoading: boolean }) {
  return <LoadingScreen isLoading={isLoading} theme="books" />
}

export function GamesLoadingScreen({ isLoading }: { isLoading: boolean }) {
  return <LoadingScreen isLoading={isLoading} theme="games" />
}

export function OceanLoadingScreen({ isLoading }: { isLoading: boolean }) {
  return <LoadingScreen isLoading={isLoading} theme="ocean" />
}

export function AdventureLoadingScreen({ isLoading }: { isLoading: boolean }) {
  return <LoadingScreen isLoading={isLoading} theme="adventure" />
}

export function CosmicLoadingScreen({ isLoading }: { isLoading: boolean }) {
  return <LoadingScreen isLoading={isLoading} theme="cosmic" />
}

export default LoadingScreen
