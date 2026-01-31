'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast, Toast as ToastType, ToastType as ToastVariant, ToastPosition, ToastAction, ToastConfig } from '@/hooks/useToast'

// ============================================================================
// Type Config
// ============================================================================

interface TypeConfig {
  bg: string
  border: string
  iconBg: string
  iconColor: string
  progressBg: string
  title: string
}

const TYPE_CONFIG: Record<ToastVariant, TypeConfig> = {
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    progressBg: 'bg-green-500',
    title: 'text-green-800',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    progressBg: 'bg-red-500',
    title: 'text-red-800',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    progressBg: 'bg-amber-500',
    title: 'text-amber-800',
  },
  info: {
    bg: 'bg-white',
    border: 'border-onde-ocean/20',
    iconBg: 'bg-onde-ocean/10',
    iconColor: 'text-onde-ocean',
    progressBg: 'bg-onde-ocean',
    title: 'text-onde-ocean',
  },
}

// ============================================================================
// Position Config
// ============================================================================

const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

const getSlideDirection = (position: ToastPosition) => {
  if (position.includes('right')) return { x: 100, y: 0 }
  if (position.includes('left')) return { x: -100, y: 0 }
  if (position.includes('top')) return { x: 0, y: -50 }
  return { x: 0, y: 50 }
}

// ============================================================================
// Single Toast Component
// ============================================================================

interface ToastItemProps {
  toast: ToastType
  onDismiss: (id: string) => void
  position: ToastPosition
  index: number
}

function ToastItem({ toast, onDismiss, position, index }: ToastItemProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(100)
  const startTimeRef = useRef(Date.now())
  const remainingTimeRef = useRef(toast.duration || 5000)
  const config = TYPE_CONFIG[toast.type]
  const slideDir = getSlideDirection(position)

  // Auto-dismiss timer with pause support
  useEffect(() => {
    if (toast.duration === 0 || toast.duration === Infinity) return

    const duration = toast.duration || 5000
    
    if (!isPaused) {
      startTimeRef.current = Date.now()
      
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, remainingTimeRef.current)

      // Progress bar animation
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        const newProgress = Math.max(0, 100 - (elapsed / remainingTimeRef.current) * 100)
        setProgress(newProgress)
      }, 50)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
        // Save remaining time when paused
        const elapsed = Date.now() - startTimeRef.current
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
      }
    }
  }, [isPaused, toast.id, toast.duration, onDismiss])

  const handleMouseEnter = () => {
    if (toast.pauseOnHover) {
      setIsPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (toast.pauseOnHover) {
      setIsPaused(false)
    }
  }

  // Stack offset calculation
  const isBottom = position.includes('bottom')
  const stackOffset = index * 8
  const scaleOffset = 1 - index * 0.03

  return (
    <motion.div
      layout
      initial={{ 
        opacity: 0, 
        x: slideDir.x, 
        y: slideDir.y,
        scale: 0.9 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: isBottom ? -stackOffset : stackOffset,
        scale: scaleOffset,
      }}
      exit={{ 
        opacity: 0, 
        x: slideDir.x,
        scale: 0.8,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30 
      }}
      style={{ zIndex: 100 - index }}
      className="pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`
        relative overflow-hidden rounded-xl shadow-lg border
        ${config.bg} ${config.border}
        min-w-[320px] max-w-[420px]
        backdrop-blur-xl
      `}>
        <div className="p-4 flex gap-3">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
            ${config.iconBg}
          `}>
            <span className={`text-lg font-bold ${config.iconColor}`}>
              {toast.icon}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className={`font-semibold text-sm ${config.title}`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            )}
            
            {/* Action Buttons */}
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {toast.actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      action.onClick()
                      onDismiss(toast.id)
                    }}
                    className={`
                      text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                      ${action.variant === 'primary' 
                        ? `${config.progressBg} text-white hover:opacity-90`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          {toast.dismissible && (
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg text-gray-400 
                         hover:text-gray-600 hover:bg-gray-100 
                         transition-colors self-start"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {toast.duration && toast.duration > 0 && toast.duration !== Infinity && (
          <div className="h-1 bg-gray-100">
            <motion.div
              className={`h-full ${config.progressBg}`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>
        )}

        {/* Shimmer effect on hover */}
        {isPaused && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// Toast Container (Portal)
// ============================================================================

export function ToastContainer() {
  const { toasts, config, dismiss } = useToast()
  const position = config.position

  return (
    <div 
      className={`fixed ${POSITION_CLASSES[position]} z-[9999] flex flex-col gap-2 pointer-events-none`}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
            position={position}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Toast Provider with Container
// ============================================================================

interface ToastProviderProps {
  children: React.ReactNode
  config?: Partial<ToastConfig>
}

export function ToastProvider({ children, config }: ToastProviderProps) {
  const { setConfig } = useToast()

  useEffect(() => {
    if (config) {
      setConfig(config)
    }
  }, [config, setConfig])

  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}

// ============================================================================
// Compact Toast Variant
// ============================================================================

interface CompactToastProps {
  type: ToastVariant
  message: string
  onDismiss?: () => void
  className?: string
}

export function CompactToast({ type, message, onDismiss, className = '' }: CompactToastProps) {
  const config = TYPE_CONFIG[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        ${config.bg} ${config.border} border shadow-sm
        ${className}
      `}
    >
      <span className={`text-sm ${config.iconColor}`}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="text-sm text-gray-700">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

// ============================================================================
// Export everything
// ============================================================================

export { useToast, toast } from '@/hooks/useToast'
export type { Toast, ToastType, ToastPosition, ToastAction, ToastOptions, ToastConfig } from '@/hooks/useToast'
