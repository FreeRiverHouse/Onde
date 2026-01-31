'use client'

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { useUserProfile } from '@/hooks/useUserProfile'

// ============================================
// TYPES & INTERFACES
// ============================================

type CompanionMood = 'idle' | 'happy' | 'excited' | 'thinking' | 'sad' | 'sleeping' | 'waving' | 'celebrating'
type CompanionSize = 'small' | 'medium' | 'large'

interface CompanionMessage {
  text: string
  duration?: number
  mood?: CompanionMood
  priority?: number
}

interface AICompanionContextType {
  isVisible: boolean
  toggleCompanion: () => void
  showMessage: (message: string, mood?: CompanionMood, duration?: number) => void
  triggerReaction: (reaction: 'win' | 'lose' | 'achievement' | 'levelUp' | 'hint' | 'welcome') => void
  setMood: (mood: CompanionMood) => void
}

// ============================================
// CONTEXT
// ============================================

const AICompanionContext = createContext<AICompanionContextType | null>(null)

export function useAICompanion() {
  const context = useContext(AICompanionContext)
  if (!context) {
    // Return a no-op context if not within provider
    return {
      isVisible: false,
      toggleCompanion: () => {},
      showMessage: () => {},
      triggerReaction: () => {},
      setMood: () => {},
    }
  }
  return context
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'onde-ai-companion'

// Context-aware tips based on the current page
const PAGE_TIPS: Record<string, string[]> = {
  '/': [
    "Welcome! I'm Bubbles, your reading buddy! 🎉",
    "Check out the latest books in our library!",
    "Did you know you can set reading goals?",
    "Try a game to take a fun break!",
  ],
  '/libri': [
    "Looking for something to read? I can help!",
    "Tap the ❤️ to save books you love!",
    "Use the search to find specific books!",
    "Books are sorted by reading level!",
  ],
  '/libreria': [
    "Here are all your saved books!",
    "Keep building your collection!",
    "Your reading progress is saved automatically!",
  ],
  '/games': [
    "Ready to play? Let's go! 🎮",
    "Games help your brain grow stronger!",
    "Try to beat your high score!",
    "Each game teaches different skills!",
  ],
  '/games/memory': [
    "Match the pairs as fast as you can!",
    "Tip: Remember where cards are!",
    "Start with the corners!",
  ],
  '/games/puzzle': [
    "Puzzles improve spatial thinking!",
    "Try the easier levels first!",
    "Take your time, no rush!",
  ],
  '/games/math': [
    "Math is like a superpower! ➕",
    "Practice makes perfect!",
    "Start with easy sums!",
  ],
  '/games/typing': [
    "Typing fast is so useful!",
    "Keep your fingers on home row!",
    "Accuracy first, then speed!",
  ],
  '/games/quiz': [
    "Test your knowledge!",
    "Learn something new every day!",
    "Don't worry if you get some wrong!",
  ],
  '/profile': [
    "This is YOUR space!",
    "Customize your avatar!",
    "Check your achievements!",
  ],
  '/reader': [
    "Happy reading! 📖",
    "Tap words you don't know!",
    "Take breaks if your eyes get tired!",
    "Adjust the text size if needed!",
  ],
  '/daily': [
    "New challenge every day!",
    "Daily streaks earn bonus XP!",
    "Come back tomorrow for more!",
  ],
}

// Easter egg triggers
const EASTER_EGGS: Record<string, { trigger: string; response: string; mood: CompanionMood }> = {
  'konami': { trigger: 'up up down down left right left right', response: "🎮 You know the code! LEGENDARY!", mood: 'celebrating' },
  'onde': { trigger: 'onde onde onde', response: "🌊 Onde onde onde~ I love my name!", mood: 'excited' },
  'bubbles': { trigger: 'bubbles', response: "That's my name! *blushes* 💕", mood: 'happy' },
}

// Reaction messages
const REACTIONS = {
  win: [
    "YAY! You did it! 🎉",
    "AMAZING! You're a superstar! ⭐",
    "Incredible work! 🏆",
    "You're on fire! 🔥",
    "WOOHOO! Victory! 🎊",
  ],
  lose: [
    "Don't give up! You've got this! 💪",
    "Almost there! Try again! 🌟",
    "Practice makes perfect! ✨",
    "I believe in you! 🙌",
    "Next time for sure! 🍀",
  ],
  achievement: [
    "WOW! New achievement unlocked! 🏅",
    "You're collecting achievements like a pro! 🌟",
    "Look at you go! So proud! 🎖️",
  ],
  levelUp: [
    "LEVEL UP! You're getting stronger! 📈",
    "New level! New adventures! 🚀",
    "Rising star alert! ⭐",
  ],
  hint: [
    "Psst... need a hint? 🤔",
    "Here's a little tip... 💡",
    "Let me help you out! 🙋",
  ],
  welcome: [
    "Hey there, friend! 👋",
    "So happy to see you! 🎉",
    "Ready for an adventure? 🌈",
  ],
}

// Idle animations and thoughts
const IDLE_THOUGHTS = [
  "*hums quietly* 🎵",
  "*looks around curiously* 👀",
  "*does a little dance* 💃",
  "*yawns* Getting sleepy... 😴",
  "*bounces happily* ✨",
  "*thinks about snacks* 🍪",
  "*admires the view* 🌸",
  "*practices magic tricks* ✨",
]

// ============================================
// COMPANION FACE COMPONENT
// ============================================

interface CompanionFaceProps {
  mood: CompanionMood
  isBlinking: boolean
  lookDirection: { x: number; y: number }
}

function CompanionFace({ mood, isBlinking, lookDirection }: CompanionFaceProps) {
  const getEyes = () => {
    if (isBlinking || mood === 'sleeping') {
      return (
        <g className="eyes">
          <path d="M18 28 Q22 26 26 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M38 28 Q42 26 46 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )
    }
    
    const eyeOffset = {
      x: Math.min(Math.max(lookDirection.x * 3, -3), 3),
      y: Math.min(Math.max(lookDirection.y * 3, -3), 3),
    }
    
    if (mood === 'happy' || mood === 'excited' || mood === 'celebrating') {
      return (
        <g className="eyes">
          <ellipse cx={22 + eyeOffset.x} cy={28 + eyeOffset.y} rx="5" ry="6" fill="currentColor" />
          <ellipse cx={42 + eyeOffset.x} cy={28 + eyeOffset.y} rx="5" ry="6" fill="currentColor" />
          <ellipse cx={23 + eyeOffset.x} cy={26 + eyeOffset.y} rx="2" ry="2" fill="white" />
          <ellipse cx={43 + eyeOffset.x} cy={26 + eyeOffset.y} rx="2" ry="2" fill="white" />
        </g>
      )
    }
    
    if (mood === 'sad') {
      return (
        <g className="eyes">
          <ellipse cx={22} cy={30} rx="4" ry="5" fill="currentColor" />
          <ellipse cx={42} cy={30} rx="4" ry="5" fill="currentColor" />
          <path d="M17 25 Q22 28 27 25" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M37 25 Q42 28 47 25" stroke="currentColor" strokeWidth="2" fill="none" />
        </g>
      )
    }
    
    if (mood === 'thinking') {
      return (
        <g className="eyes">
          <ellipse cx={24 + eyeOffset.x} cy={28} rx="5" ry="6" fill="currentColor" />
          <ellipse cx={44 + eyeOffset.x} cy={28} rx="5" ry="6" fill="currentColor" />
          <path d="M18 24 L28 24" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M38 24 L48 24" stroke="currentColor" strokeWidth="2" fill="none" />
        </g>
      )
    }
    
    // Default idle eyes
    return (
      <g className="eyes">
        <ellipse cx={22 + eyeOffset.x} cy={28 + eyeOffset.y} rx="5" ry="6" fill="currentColor" />
        <ellipse cx={42 + eyeOffset.x} cy={28 + eyeOffset.y} rx="5" ry="6" fill="currentColor" />
        <ellipse cx={23 + eyeOffset.x} cy={26 + eyeOffset.y} rx="2" ry="2" fill="white" />
        <ellipse cx={43 + eyeOffset.x} cy={26 + eyeOffset.y} rx="2" ry="2" fill="white" />
      </g>
    )
  }
  
  const getMouth = () => {
    if (mood === 'happy' || mood === 'celebrating') {
      return <path d="M25 40 Q32 50 39 40" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    }
    if (mood === 'excited') {
      return (
        <g>
          <ellipse cx="32" cy="44" rx="6" ry="5" fill="currentColor" />
          <ellipse cx="32" cy="42" rx="4" ry="3" fill="#ff9eb5" />
        </g>
      )
    }
    if (mood === 'sad') {
      return <path d="M25 46 Q32 38 39 46" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    }
    if (mood === 'thinking') {
      return <ellipse cx="38" cy="42" rx="3" ry="2" fill="currentColor" />
    }
    if (mood === 'sleeping') {
      return <path d="M28 42 Q32 44 36 42" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    }
    if (mood === 'waving') {
      return <path d="M26 42 Q32 48 38 42" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    }
    // Default idle - slight smile
    return <path d="M27 42 Q32 46 37 42" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  }
  
  const getBlush = () => {
    if (mood === 'happy' || mood === 'excited' || mood === 'celebrating') {
      return (
        <g className="blush" opacity="0.4">
          <ellipse cx="14" cy="36" rx="5" ry="3" fill="#ff9eb5" />
          <ellipse cx="50" cy="36" rx="5" ry="3" fill="#ff9eb5" />
        </g>
      )
    }
    return null
  }
  
  const getExtras = () => {
    if (mood === 'sleeping') {
      return (
        <g className="zzz">
          <text x="52" y="20" fontSize="12" fill="currentColor" opacity="0.6">z</text>
          <text x="56" y="14" fontSize="10" fill="currentColor" opacity="0.4">z</text>
          <text x="60" y="10" fontSize="8" fill="currentColor" opacity="0.3">z</text>
        </g>
      )
    }
    if (mood === 'celebrating') {
      return (
        <g className="sparkles">
          <text x="0" y="10" fontSize="10">✨</text>
          <text x="50" y="8" fontSize="8">⭐</text>
          <text x="55" y="50" fontSize="10">🎉</text>
        </g>
      )
    }
    if (mood === 'thinking') {
      return (
        <g className="thought-bubbles" opacity="0.5">
          <circle cx="55" cy="15" r="3" fill="currentColor" />
          <circle cx="58" cy="10" r="2" fill="currentColor" />
          <circle cx="60" cy="6" r="1.5" fill="currentColor" />
        </g>
      )
    }
    return null
  }
  
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <radialGradient id="companionGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#a8e6cf" />
          <stop offset="100%" stopColor="#7dd3c0" />
        </radialGradient>
        <filter id="companionShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {/* Body */}
      <ellipse 
        cx="32" cy="36" rx="28" ry="26" 
        fill="url(#companionGradient)" 
        filter="url(#companionShadow)"
        className="transition-transform duration-300"
        style={{
          transform: mood === 'excited' ? 'scale(1.05)' : 
                     mood === 'sad' ? 'scale(0.95)' : 
                     'scale(1)',
          transformOrigin: 'center',
        }}
      />
      
      {/* Inner glow */}
      <ellipse cx="26" cy="28" rx="12" ry="10" fill="white" opacity="0.3" />
      
      {/* Face */}
      <g className="face text-onde-ocean">
        {getEyes()}
        {getMouth()}
        {getBlush()}
        {getExtras()}
      </g>
    </svg>
  )
}

// ============================================
// SPEECH BUBBLE COMPONENT
// ============================================

interface SpeechBubbleProps {
  message: string | null
  position: 'left' | 'right' | 'top'
}

function SpeechBubble({ message, position }: SpeechBubbleProps) {
  if (!message) return null
  
  const positionClasses = {
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
  }
  
  const tailClasses = {
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-onde-cream border-y-transparent border-r-transparent',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-onde-cream border-y-transparent border-l-transparent',
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-onde-cream border-x-transparent border-b-transparent',
  }
  
  return (
    <div 
      className={`
        absolute ${positionClasses[position]}
        bg-onde-cream text-onde-ocean
        px-4 py-2 rounded-2xl
        shadow-lg
        min-w-[120px] max-w-[200px]
        text-sm font-medium text-center
        animate-in fade-in slide-in-from-bottom-2 duration-300
        z-50
      `}
    >
      {message}
      <div 
        className={`absolute w-0 h-0 border-8 ${tailClasses[position]}`}
      />
    </div>
  )
}

// ============================================
// COMPANION TOGGLE BUTTON
// ============================================

interface ToggleButtonProps {
  isVisible: boolean
  onClick: () => void
}

function CompanionToggleButton({ isVisible, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-4 left-4 z-40
        w-12 h-12 rounded-full
        flex items-center justify-center
        shadow-lg
        transition-all duration-300
        ${isVisible 
          ? 'bg-onde-coral hover:bg-onde-coral/80' 
          : 'bg-onde-teal hover:bg-onde-teal/80'
        }
        text-white
        hover:scale-110 active:scale-95
      `}
      aria-label={isVisible ? 'Hide AI companion' : 'Show AI companion'}
      title={isVisible ? 'Hide Bubbles' : 'Show Bubbles'}
    >
      {isVisible ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <span className="text-2xl">🫧</span>
      )}
    </button>
  )
}

// ============================================
// MAIN COMPANION COMPONENT
// ============================================

interface CompanionCharacterProps {
  mood: CompanionMood
  message: string | null
  position: { x: number; y: number }
  size: CompanionSize
  isDragging: boolean
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void
}

function CompanionCharacter({ 
  mood, 
  message, 
  position, 
  size, 
  isDragging,
  onDragStart 
}: CompanionCharacterProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [lookDirection, setLookDirection] = useState({ x: 0, y: 0 })
  const companionRef = useRef<HTMLDivElement>(null)
  
  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (mood !== 'sleeping') {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 150)
      }
    }, 3000 + Math.random() * 2000)
    
    return () => clearInterval(blinkInterval)
  }, [mood])
  
  // Look at cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (companionRef.current) {
        const rect = companionRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const deltaX = (e.clientX - centerX) / window.innerWidth
        const deltaY = (e.clientY - centerY) / window.innerHeight
        
        setLookDirection({ x: deltaX, y: deltaY })
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  const sizeClasses = {
    small: 'w-14 h-14',
    medium: 'w-20 h-20',
    large: 'w-24 h-24',
  }
  
  const getMoodAnimation = () => {
    switch (mood) {
      case 'excited':
        return 'animate-bounce'
      case 'happy':
        return 'animate-pulse'
      case 'celebrating':
        return 'animate-spin-slow'
      case 'sad':
        return ''
      case 'sleeping':
        return 'animate-pulse'
      case 'waving':
        return 'animate-wiggle'
      default:
        return 'animate-float'
    }
  }
  
  return (
    <div
      ref={companionRef}
      className={`
        fixed z-50
        ${sizeClasses[size]}
        ${getMoodAnimation()}
        ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}
        transition-transform duration-200
        select-none
        touch-none
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%)`,
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      role="img"
      aria-label={`AI companion Bubbles feeling ${mood}`}
    >
      <CompanionFace 
        mood={mood} 
        isBlinking={isBlinking} 
        lookDirection={lookDirection}
      />
      
      <SpeechBubble 
        message={message} 
        position={typeof window !== 'undefined' && position.x > window.innerWidth / 2 ? 'left' : 'right'}
      />
    </div>
  )
}

// ============================================
// PROVIDER COMPONENT
// ============================================

interface AICompanionProviderProps {
  children: React.ReactNode
}

export function AICompanionProvider({ children }: AICompanionProviderProps) {
  const pathname = usePathname()
  const { profile } = useUserProfile()
  
  // State
  const [isVisible, setIsVisible] = useState(false)
  const [mood, setMood] = useState<CompanionMood>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 100, y: 500 }) // Will be updated on mount
  const [isDragging, setIsDragging] = useState(false)
  const [size] = useState<CompanionSize>('medium')
  const [mounted, setMounted] = useState(false)
  
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastInteractionRef = useRef<number>(Date.now())
  
  // Load saved state
  useEffect(() => {
    // Set default position based on window size
    const defaultPosition = {
      x: 100,
      y: typeof window !== 'undefined' ? window.innerHeight - 150 : 500,
    }
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        setIsVisible(data.isVisible ?? false)
        if (data.position && typeof window !== 'undefined') {
          setPosition({
            x: Math.min(data.position.x, window.innerWidth - 50),
            y: Math.min(data.position.y, window.innerHeight - 50),
          })
        } else {
          setPosition(defaultPosition)
        }
      } else {
        setPosition(defaultPosition)
      }
    } catch (e) {
      console.warn('Failed to load companion state:', e)
      setPosition(defaultPosition)
    }
    setMounted(true)
  }, [])
  
  // Save state
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isVisible, position }))
      } catch (e) {
        console.warn('Failed to save companion state:', e)
      }
    }
  }, [isVisible, position, mounted])
  
  // Show welcome message when becoming visible
  useEffect(() => {
    if (isVisible && mounted) {
      const playerName = profile.username || ''
      const greeting = playerName 
        ? `Hi ${playerName}! 👋` 
        : "Hi there, friend! 👋"
      
      setTimeout(() => {
        showMessage(greeting, 'waving', 3000)
      }, 500)
    }
  }, [isVisible, mounted, profile.username])
  
  // Context-aware tips
  useEffect(() => {
    if (!isVisible || !mounted) return
    
    const tips = PAGE_TIPS[pathname] || PAGE_TIPS['/']
    
    // Show a random tip every 30-60 seconds
    const tipInterval = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current
      
      // Only show tips if user hasn't interacted recently
      if (timeSinceInteraction > 20000) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)]
        showMessage(randomTip, 'thinking', 5000)
      }
    }, 30000 + Math.random() * 30000)
    
    return () => clearInterval(tipInterval)
  }, [pathname, isVisible, mounted])
  
  // Idle behavior
  useEffect(() => {
    if (!isVisible) return
    
    const checkIdle = () => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current
      
      if (timeSinceInteraction > 120000) {
        // 2 minutes idle -> sleepy
        setMood('sleeping')
      } else if (timeSinceInteraction > 60000) {
        // 1 minute idle -> thinking/bored
        if (Math.random() > 0.5) {
          const thought = IDLE_THOUGHTS[Math.floor(Math.random() * IDLE_THOUGHTS.length)]
          showMessage(thought, 'idle', 4000)
        }
      }
    }
    
    idleTimeoutRef.current = setInterval(checkIdle, 30000)
    
    return () => {
      if (idleTimeoutRef.current) {
        clearInterval(idleTimeoutRef.current)
      }
    }
  }, [isVisible])
  
  // Message display function
  const showMessage = useCallback((text: string, moodOverride?: CompanionMood, duration = 4000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    lastInteractionRef.current = Date.now()
    setMessage(text)
    
    if (moodOverride) {
      setMood(moodOverride)
    }
    
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null)
      setMood('idle')
    }, duration)
  }, [])
  
  // Reaction triggers
  const triggerReaction = useCallback((reaction: 'win' | 'lose' | 'achievement' | 'levelUp' | 'hint' | 'welcome') => {
    const messages = REACTIONS[reaction]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    const moodMap: Record<string, CompanionMood> = {
      win: 'celebrating',
      lose: 'sad',
      achievement: 'excited',
      levelUp: 'excited',
      hint: 'thinking',
      welcome: 'waving',
    }
    
    showMessage(randomMessage, moodMap[reaction], reaction === 'win' ? 5000 : 4000)
  }, [showMessage])
  
  // Toggle visibility
  const toggleCompanion = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])
  
  // Dragging logic
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    lastInteractionRef.current = Date.now()
    
    if (mood === 'sleeping') {
      setMood('idle')
      showMessage("Hmm? I'm awake! 😊", 'happy', 2000)
    }
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY
      
      setPosition({
        x: Math.max(50, Math.min(window.innerWidth - 50, clientX)),
        y: Math.max(50, Math.min(window.innerHeight - 50, clientY)),
      })
    }
    
    const handleEnd = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
    
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)
  }, [mood, showMessage])
  
  // Context value
  const contextValue: AICompanionContextType = {
    isVisible,
    toggleCompanion,
    showMessage,
    triggerReaction,
    setMood,
  }
  
  if (!mounted) {
    return (
      <AICompanionContext.Provider value={contextValue}>
        {children}
      </AICompanionContext.Provider>
    )
  }
  
  return (
    <AICompanionContext.Provider value={contextValue}>
      {children}
      
      <CompanionToggleButton 
        isVisible={isVisible} 
        onClick={toggleCompanion} 
      />
      
      {isVisible && (
        <CompanionCharacter
          mood={mood}
          message={message}
          position={position}
          size={size}
          isDragging={isDragging}
          onDragStart={handleDragStart}
        />
      )}
    </AICompanionContext.Provider>
  )
}

// ============================================
// CUSTOM ANIMATION STYLES
// ============================================

// Add these to globals.css:
// @keyframes float {
//   0%, 100% { transform: translate(-50%, -50%) translateY(0); }
//   50% { transform: translate(-50%, -50%) translateY(-8px); }
// }
// @keyframes wiggle {
//   0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
//   25% { transform: translate(-50%, -50%) rotate(10deg); }
//   75% { transform: translate(-50%, -50%) rotate(-10deg); }
// }
// @keyframes spin-slow {
//   0% { transform: translate(-50%, -50%) rotate(0deg); }
//   100% { transform: translate(-50%, -50%) rotate(360deg); }
// }
// .animate-float { animation: float 3s ease-in-out infinite; }
// .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
// .animate-spin-slow { animation: spin-slow 2s linear infinite; }

export default AICompanionProvider
