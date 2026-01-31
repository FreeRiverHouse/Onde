'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from './ui/Button'

// Types
interface UserProfile {
  name: string
  avatar: string
  interests: ('books' | 'games')[]
}

type OnboardingStep = 'welcome' | 'profile' | 'interests' | 'tour' | 'complete'

// Available avatars
const AVATARS = ['🐙', '🐋', '🐬', '🦈', '🐢', '🦑', '🐠', '🦭', '🦐', '🐡', '🦞', '🐚']

// Tour steps
const TOUR_STEPS = [
  {
    title: 'Explore Books',
    description: 'Discover our collection of interactive stories and adventures.',
    icon: '📚',
    color: 'from-onde-coral to-onde-coral-light',
  },
  {
    title: 'Play Games',
    description: 'Fun educational games that make learning an adventure.',
    icon: '🎮',
    color: 'from-onde-teal to-onde-teal-light',
  },
  {
    title: 'Track Progress',
    description: 'Earn achievements and watch your reading journey grow.',
    icon: '🏆',
    color: 'from-onde-gold to-onde-gold-light',
  },
  {
    title: 'Personalize',
    description: 'Customize your experience with themes and preferences.',
    icon: '🎨',
    color: 'from-onde-purple to-onde-purple-light',
  },
  {
    title: 'Connect',
    description: 'Join a community of young readers and adventurers.',
    icon: '🌊',
    color: 'from-onde-ocean to-onde-ocean-light',
  },
]

// Confetti particle component
function Confetti({ count = 50 }: { count?: number }) {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 12,
      color: ['#D4AF37', '#5B9AA0', '#26619C', '#E5C158', '#7EB8C4'][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
    })), [count])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: -20,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: particle.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

// Mascot component
function Mascot({ mood = 'happy' }: { mood?: 'happy' | 'excited' | 'wave' }) {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -10, 0],
        rotate: mood === 'wave' ? [0, -5, 5, -5, 0] : 0,
      }}
      transition={{
        y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        rotate: { repeat: mood === 'wave' ? Infinity : 0, duration: 1.5 },
      }}
    >
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-onde-teal to-onde-ocean rounded-full opacity-20 blur-xl" />
        <div className="relative w-full h-full bg-gradient-to-br from-onde-teal to-onde-ocean rounded-full flex items-center justify-center shadow-xl shadow-onde-teal/30">
          <span className="text-5xl" role="img" aria-label="Octopus mascot">
            🐙
          </span>
        </div>
        {mood === 'excited' && (
          <>
            <motion.div
              className="absolute -top-2 -right-2 text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-3 text-xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }}
            >
              ⭐
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}

// Step indicator
function StepIndicator({ 
  steps, 
  currentStep, 
  onStepClick 
}: { 
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((_, index) => (
        <button
          key={index}
          onClick={() => onStepClick?.(index)}
          disabled={!onStepClick || index > currentStep}
          className={`
            w-2.5 h-2.5 rounded-full transition-all duration-300
            ${index === currentStep 
              ? 'w-8 bg-gradient-to-r from-onde-coral to-onde-gold' 
              : index < currentStep
                ? 'bg-onde-teal cursor-pointer hover:scale-110'
                : 'bg-gray-300'
            }
          `}
          aria-label={`Step ${index + 1}`}
        />
      ))}
    </div>
  )
}

// Welcome Step
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      className="text-center px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Mascot mood="wave" />
      
      <motion.h1
        className="mt-8 text-4xl md:text-5xl font-display font-bold text-onde-ocean"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to Onde!
      </motion.h1>
      
      <motion.p
        className="mt-4 text-lg text-onde-ocean/70 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Dive into a world of stories, games, and adventures. Let&apos;s set up your experience!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Button size="lg" onClick={onNext}>
          Let&apos;s Go! 🚀
        </Button>
      </motion.div>
    </motion.div>
  )
}

// Profile Step
function ProfileStep({ 
  profile, 
  onUpdate, 
  onNext, 
  onBack 
}: { 
  profile: UserProfile
  onUpdate: (profile: Partial<UserProfile>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <motion.div
      className="text-center px-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h2 className="text-3xl font-display font-bold text-onde-ocean">
        Who are you?
      </h2>
      <p className="mt-2 text-onde-ocean/70">
        Choose your avatar and tell us your name
      </p>

      {/* Avatar Selection */}
      <div className="mt-8">
        <div className="flex flex-wrap justify-center gap-3 max-w-sm mx-auto">
          {AVATARS.map((avatar) => (
            <motion.button
              key={avatar}
              onClick={() => onUpdate({ avatar })}
              className={`
                w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                transition-all duration-200
                ${profile.avatar === avatar 
                  ? 'bg-gradient-to-br from-onde-coral to-onde-gold ring-2 ring-onde-coral ring-offset-2 scale-110' 
                  : 'bg-onde-cream hover:bg-onde-cream-dark'
                }
              `}
              whileHover={{ scale: profile.avatar === avatar ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {avatar}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Name Input */}
      <div className="mt-8 max-w-xs mx-auto">
        <input
          type="text"
          placeholder="Your name..."
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border-2 border-onde-ocean/20 
                     focus:border-onde-coral focus:outline-none
                     text-center text-lg font-medium text-onde-ocean
                     placeholder:text-onde-ocean/40"
          maxLength={20}
        />
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!profile.name.trim()}>
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

// Interests Step
function InterestsStep({ 
  profile, 
  onUpdate, 
  onNext, 
  onBack 
}: { 
  profile: UserProfile
  onUpdate: (profile: Partial<UserProfile>) => void
  onNext: () => void
  onBack: () => void
}) {
  const toggleInterest = (interest: 'books' | 'games') => {
    const current = profile.interests
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    onUpdate({ interests: updated })
  }

  const interests = [
    { id: 'books' as const, icon: '📚', label: 'Books', description: 'Stories & Adventures' },
    { id: 'games' as const, icon: '🎮', label: 'Games', description: 'Fun & Learning' },
  ]

  return (
    <motion.div
      className="text-center px-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h2 className="text-3xl font-display font-bold text-onde-ocean">
        What do you like?
      </h2>
      <p className="mt-2 text-onde-ocean/70">
        Select your interests (you can choose both!)
      </p>

      <div className="mt-8 flex justify-center gap-6 flex-wrap">
        {interests.map((interest) => {
          const isSelected = profile.interests.includes(interest.id)
          return (
            <motion.button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`
                relative w-36 h-40 rounded-2xl p-4 
                flex flex-col items-center justify-center gap-2
                transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-br from-onde-coral/20 to-onde-gold/20 border-2 border-onde-coral' 
                  : 'bg-onde-cream border-2 border-transparent hover:border-onde-ocean/20'
                }
              `}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-5xl">{interest.icon}</span>
              <span className="font-bold text-onde-ocean">{interest.label}</span>
              <span className="text-xs text-onde-ocean/60">{interest.description}</span>
              
              {isSelected && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full
                             flex items-center justify-center text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={profile.interests.length === 0}>
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

// Tour Step
function TourStep({ 
  onNext, 
  onBack 
}: { 
  onNext: () => void
  onBack: () => void
}) {
  const [tourIndex, setTourIndex] = useState(0)
  const currentTour = TOUR_STEPS[tourIndex]

  const nextTour = () => {
    if (tourIndex < TOUR_STEPS.length - 1) {
      setTourIndex(tourIndex + 1)
    } else {
      onNext()
    }
  }

  const prevTour = () => {
    if (tourIndex > 0) {
      setTourIndex(tourIndex - 1)
    } else {
      onBack()
    }
  }

  return (
    <motion.div
      className="text-center px-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h2 className="text-3xl font-display font-bold text-onde-ocean">
        Quick Tour
      </h2>
      <p className="mt-2 text-onde-ocean/70">
        Here&apos;s what you can do on Onde
      </p>

      <div className="mt-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tourIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-2xl p-8 shadow-xl max-w-sm mx-auto"
          >
            <div className={`
              w-20 h-20 mx-auto rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${currentTour.color} shadow-lg
            `}>
              <span className="text-4xl">{currentTour.icon}</span>
            </div>
            <h3 className="mt-6 text-xl font-bold text-onde-ocean">
              {currentTour.title}
            </h3>
            <p className="mt-2 text-onde-ocean/70">
              {currentTour.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tour progress */}
      <div className="mt-6 flex justify-center gap-2">
        {TOUR_STEPS.map((_, index) => (
          <button
            key={index}
            onClick={() => setTourIndex(index)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === tourIndex 
                ? 'w-6 bg-onde-coral' 
                : 'bg-gray-300 hover:bg-gray-400'
              }
            `}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={prevTour}>
          {tourIndex === 0 ? 'Back' : 'Previous'}
        </Button>
        <Button onClick={nextTour}>
          {tourIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}
        </Button>
      </div>
    </motion.div>
  )
}

// Complete Step
function CompleteStep({ 
  profile, 
  onComplete 
}: { 
  profile: UserProfile
  onComplete: () => void
}) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      className="text-center px-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {showConfetti && <Confetti count={80} />}

      <Mascot mood="excited" />

      <motion.h1
        className="mt-8 text-4xl md:text-5xl font-display font-bold text-onde-ocean"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You&apos;re all set, {profile.name}! 🎉
      </motion.h1>

      <motion.div
        className="mt-6 flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-4xl">{profile.avatar}</span>
        <div className="flex gap-2">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 rounded-full bg-onde-cream text-onde-ocean text-sm font-medium"
            >
              {interest === 'books' ? '📚 Books' : '🎮 Games'}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.p
        className="mt-4 text-lg text-onde-ocean/70 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Your adventure begins now. Explore, learn, and have fun!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Button size="lg" onClick={onComplete}>
          Start Exploring 🌊
        </Button>
      </motion.div>
    </motion.div>
  )
}

// Storage key
const ONBOARDING_COMPLETE_KEY = 'onde_onboarding_complete'
const USER_PROFILE_KEY = 'onde_user_profile'

// Hook to check onboarding status
export function useOnboardingStatus() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null)

  useEffect(() => {
    const complete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true'
    setIsComplete(complete)
  }, [])

  const markComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
    setIsComplete(true)
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY)
    localStorage.removeItem(USER_PROFILE_KEY)
    setIsComplete(false)
  }, [])

  return { isComplete, markComplete, reset }
}

// Main Onboarding Component
interface OnboardingProps {
  onComplete?: () => void
  onSkip?: () => void
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    avatar: '🐙',
    interests: [],
  })

  const steps: OnboardingStep[] = ['welcome', 'profile', 'interests', 'tour', 'complete']
  const currentStepIndex = steps.indexOf(step)

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const handleComplete = () => {
    // Save profile to localStorage
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
    onSkip?.()
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-white via-onde-cream/50 to-white overflow-y-auto">
      {/* Skip button */}
      {step !== 'complete' && (
        <motion.button
          onClick={handleSkip}
          className="absolute top-4 right-4 px-4 py-2 text-sm text-onde-ocean/60 
                     hover:text-onde-ocean transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Skip
        </motion.button>
      )}

      {/* Step indicator */}
      {step !== 'complete' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <StepIndicator 
            steps={steps.slice(0, -1)} // Exclude complete step
            currentStep={currentStepIndex} 
          />
        </div>
      )}

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center py-20">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <WelcomeStep key="welcome" onNext={() => setStep('profile')} />
          )}
          {step === 'profile' && (
            <ProfileStep
              key="profile"
              profile={profile}
              onUpdate={updateProfile}
              onNext={() => setStep('interests')}
              onBack={() => setStep('welcome')}
            />
          )}
          {step === 'interests' && (
            <InterestsStep
              key="interests"
              profile={profile}
              onUpdate={updateProfile}
              onNext={() => setStep('tour')}
              onBack={() => setStep('profile')}
            />
          )}
          {step === 'tour' && (
            <TourStep
              key="tour"
              onNext={() => setStep('complete')}
              onBack={() => setStep('interests')}
            />
          )}
          {step === 'complete' && (
            <CompleteStep
              key="complete"
              profile={profile}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-onde-teal/5 to-transparent pointer-events-none" />
      <motion.div
        className="fixed -bottom-20 -left-20 w-64 h-64 bg-onde-teal/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="fixed -top-20 -right-20 w-64 h-64 bg-onde-coral/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
    </div>
  )
}

// Export named for convenience
export { Onboarding }
