'use client'

import React from 'react'
import Link from 'next/link'

/**
 * 🎨 KidUI - Child-Friendly UI Components
 * Consistent, soft, friendly design for all games
 */

// =============================================================================
// 🎨 COLOR PALETTE - Soft, friendly colors
// =============================================================================

export const kidColors = {
  // Primary palette - soft and inviting
  primary: {
    purple: 'from-violet-400 to-purple-500',
    pink: 'from-pink-400 to-rose-500',
    blue: 'from-sky-400 to-blue-500',
    green: 'from-emerald-400 to-green-500',
    orange: 'from-amber-400 to-orange-500',
    cyan: 'from-cyan-400 to-teal-500',
  },
  // Background gradients - gentle and warm
  backgrounds: {
    warmSky: 'from-amber-100 via-orange-100 to-pink-100',
    coolSky: 'from-sky-100 via-blue-100 to-indigo-100',
    meadow: 'from-green-100 via-emerald-100 to-teal-100',
    sunset: 'from-rose-100 via-pink-100 to-purple-100',
    ocean: 'from-cyan-100 via-sky-100 to-blue-100',
    candy: 'from-pink-100 via-purple-100 to-indigo-100',
  },
  // Text colors
  text: {
    primary: 'text-gray-800',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    white: 'text-white',
  },
}

// =============================================================================
// 🔙 BACK BUTTON - Consistent navigation
// =============================================================================

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ 
  href = '/games', 
  label = '← Giochi',
  className = ''
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center gap-2
        px-5 py-3 min-h-[48px] min-w-[48px]
        bg-white/95 backdrop-blur-sm
        rounded-full shadow-lg
        font-bold text-gray-700
        border-2 border-gray-200
        hover:bg-white hover:scale-105 hover:shadow-xl
        active:scale-95
        transition-all duration-200
        ${className}
      `}
    >
      <span className="text-lg">🏠</span>
      <span className="text-sm md:text-base">{label}</span>
    </Link>
  )
}

// =============================================================================
// 🔊 SOUND TOGGLE - Always visible, easy to find
// =============================================================================

interface SoundToggleProps {
  enabled: boolean
  onToggle: () => void
  className?: string
}

export function SoundToggle({ enabled, onToggle, className = '' }: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center justify-center
        w-14 h-14 min-w-[48px] min-h-[48px]
        bg-white/95 backdrop-blur-sm
        rounded-full shadow-lg
        font-bold
        border-2 border-gray-200
        hover:bg-white hover:scale-105 hover:shadow-xl
        active:scale-95
        transition-all duration-200
        ${className}
      `}
      aria-label={enabled ? 'Disattiva suono' : 'Attiva suono'}
      title={enabled ? 'Suono attivo - clicca per disattivare' : 'Suono disattivato - clicca per attivare'}
    >
      <span className="text-2xl">{enabled ? '🔊' : '🔇'}</span>
    </button>
  )
}

// =============================================================================
// 📝 GAME TITLE - Friendly typography
// =============================================================================

interface GameTitleProps {
  emoji: string
  title: string
  subtitle?: string
  className?: string
}

export function GameTitle({ emoji, title, subtitle, className = '' }: GameTitleProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg mb-2">
        <span className="mr-3">{emoji}</span>
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// 🎮 GAME BUTTON - Big touch targets (min 48px)
// =============================================================================

interface GameButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'md' | 'lg' | 'xl'
  className?: string
  icon?: string
}

export function GameButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  className = '',
  icon,
}: GameButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-purple-300 hover:from-violet-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 hover:from-gray-200 hover:to-gray-300',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-green-300 hover:from-emerald-600 hover:to-green-700',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-red-300 hover:from-rose-600 hover:to-red-700',
    ghost: 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white',
  }

  const sizes = {
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]',
    xl: 'px-8 py-5 text-xl min-h-[64px]',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        ${sizes[size]}
        ${variants[variant]}
        rounded-2xl shadow-lg
        font-bold
        border-2
        hover:scale-105 hover:shadow-xl
        active:scale-95
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  )
}

// =============================================================================
// 📊 STATS BADGE - Game statistics display
// =============================================================================

interface StatsBadgeProps {
  icon: string
  value: string | number
  label?: string
  className?: string
}

export function StatsBadge({ icon, value, label, className = '' }: StatsBadgeProps) {
  return (
    <div className={`
      inline-flex items-center gap-2
      px-4 py-2 min-h-[44px]
      bg-white/95 backdrop-blur-sm
      rounded-full shadow-lg
      font-bold text-gray-700
      border-2 border-gray-100
      ${className}
    `}>
      <span className="text-lg">{icon}</span>
      <span className="text-base md:text-lg">{value}</span>
      {label && <span className="text-sm text-gray-500 hidden md:inline">{label}</span>}
    </div>
  )
}

// =============================================================================
// ⏳ LOADING STATE - Friendly spinner
// =============================================================================

interface LoadingSpinnerProps {
  message?: string
  emoji?: string
  className?: string
}

export function LoadingSpinner({ 
  message = 'Caricamento...', 
  emoji = '🎮',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Rotating ring */}
        <div className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        {/* Center emoji */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-bounce">{emoji}</span>
        </div>
      </div>
      <p className="text-lg font-bold text-gray-700 animate-pulse">{message}</p>
      {/* Bouncing dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// ⚠️ ERROR MESSAGE - Cute, not scary
// =============================================================================

interface ErrorMessageProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  title = 'Oops! Qualcosa è andato storto',
  message = 'Non preoccuparti, può succedere! Riproviamo?',
  onRetry,
  className = ''
}: ErrorMessageProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center gap-4
      p-6 max-w-md mx-auto
      bg-white/95 backdrop-blur-sm
      rounded-3xl shadow-xl
      border-2 border-orange-200
      ${className}
    `}>
      <div className="text-6xl animate-bounce">🙈</div>
      <h3 className="text-xl font-bold text-gray-800 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{message}</p>
      {onRetry && (
        <GameButton onClick={onRetry} variant="primary" icon="🔄">
          Riprova
        </GameButton>
      )}
    </div>
  )
}

// =============================================================================
// 📋 INSTRUCTIONS BOX - Simple Italian text with icons
// =============================================================================

interface InstructionsProps {
  title?: string
  items: Array<{ icon: string; text: string }>
  className?: string
}

export function Instructions({ 
  title = 'Come si gioca', 
  items, 
  className = '' 
}: InstructionsProps) {
  return (
    <div className={`
      bg-white/90 backdrop-blur-sm
      rounded-2xl shadow-lg
      p-4 md:p-6
      border-2 border-purple-100
      ${className}
    `}>
      <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
        <span>📖</span> {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-gray-700">
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="text-sm md:text-base">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// =============================================================================
// 🎉 CONFETTI - Celebration effect
// =============================================================================

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  if (!active) return null

  const colors = ['#ff6b9d', '#c44dff', '#4dc3ff', '#4dff88', '#ffdd4d', '#ff884d']
  const pieces = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// 🏆 WIN MODAL - Victory celebration
// =============================================================================

interface WinModalProps {
  show: boolean
  title?: string
  emoji?: string
  score?: number
  time?: string
  onPlayAgain?: () => void
  onGoBack?: () => void
  children?: React.ReactNode
}

export function WinModal({
  show,
  title = 'Hai vinto!',
  emoji = '🎉',
  score,
  time,
  onPlayAgain,
  onGoBack,
  children,
}: WinModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in">
        <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
        <h2 className="text-3xl font-black text-purple-700 mb-4">{title}</h2>
        
        {(score !== undefined || time) && (
          <div className="flex justify-center gap-6 mb-6">
            {score !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{score.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Punteggio</div>
              </div>
            )}
            {time && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{time}</div>
                <div className="text-sm text-gray-500">Tempo</div>
              </div>
            )}
          </div>
        )}

        {children}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {onPlayAgain && (
            <GameButton onClick={onPlayAgain} variant="success" icon="🔄">
              Gioca ancora
            </GameButton>
          )}
          {onGoBack && (
            <GameButton onClick={onGoBack} variant="secondary" icon="🏠">
              Altri giochi
            </GameButton>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// 🎨 GAME WRAPPER - Consistent layout for all games
// =============================================================================

interface GameLayoutProps {
  children: React.ReactNode
  background?: keyof typeof kidColors.backgrounds
  className?: string
}

export function GameLayout({ 
  children, 
  background = 'warmSky',
  className = ''
}: GameLayoutProps) {
  return (
    <div className={`
      min-h-screen
      bg-gradient-to-b ${kidColors.backgrounds[background]}
      ${className}
    `}>
      {children}
    </div>
  )
}

// =============================================================================
// 🎯 GAME HEADER - Consistent header layout
// =============================================================================

interface GameHeaderProps {
  backHref?: string
  backLabel?: string
  soundEnabled: boolean
  onSoundToggle: () => void
  children?: React.ReactNode
  className?: string
}

export function GameHeader({
  backHref = '/games',
  backLabel = '← Giochi',
  soundEnabled,
  onSoundToggle,
  children,
  className = ''
}: GameHeaderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Back button - fixed position */}
      <div className="absolute top-4 left-4 z-20">
        <BackButton href={backHref} label={backLabel} />
      </div>
      
      {/* Sound toggle - fixed position */}
      <div className="absolute top-4 right-4 z-20">
        <SoundToggle enabled={soundEnabled} onToggle={onSoundToggle} />
      </div>
      
      {/* Custom header content (title, stats, etc.) */}
      {children}
    </div>
  )
}

// =============================================================================
// 🎲 DIFFICULTY SELECTOR - Child-friendly difficulty picker
// =============================================================================

interface DifficultySelectorProps {
  value: string
  options: Array<{ value: string; label: string; emoji: string; description?: string }>
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function DifficultySelector({
  value,
  options,
  onChange,
  disabled = false,
  className = ''
}: DifficultySelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`
            flex items-center gap-2
            px-4 py-3 min-h-[48px]
            rounded-xl font-bold text-base
            border-2 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${value === option.value
              ? 'bg-purple-500 text-white border-purple-300 shadow-lg scale-105'
              : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white hover:scale-105'
            }
          `}
          title={option.description}
        >
          <span className="text-xl">{option.emoji}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

// =============================================================================
// 🌟 STAR RATING - Visual score display
// =============================================================================

interface StarRatingProps {
  score: number
  maxScore?: number
  className?: string
}

export function StarRating({ score, maxScore = 3, className = '' }: StarRatingProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: maxScore }, (_, i) => (
        <span 
          key={i} 
          className={`text-3xl transition-all duration-300 ${
            i < score ? 'scale-100 animate-star-pop' : 'scale-75 opacity-30 grayscale'
          }`}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {i < score ? '⭐' : '☆'}
        </span>
      ))}
      <style jsx>{`
        @keyframes star-pop {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.3) rotate(20deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-star-pop {
          animation: star-pop 0.5s ease-out both;
        }
      `}</style>
    </div>
  )
}
