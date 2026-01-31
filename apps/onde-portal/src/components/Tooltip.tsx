'use client'

import React, { useState, useRef, useCallback, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'
export type TooltipVariant = 'default' | 'ocean' | 'coral' | 'dark' | 'light'

export interface TooltipProps {
  /** Content to display in the tooltip */
  content: React.ReactNode
  /** The element that triggers the tooltip */
  children: React.ReactElement
  /** Position of the tooltip relative to the trigger */
  position?: TooltipPosition
  /** Visual variant of the tooltip */
  variant?: TooltipVariant
  /** Delay before showing (ms) */
  showDelay?: number
  /** Delay before hiding (ms) */
  hideDelay?: number
  /** Whether the tooltip is disabled */
  disabled?: boolean
  /** Whether to show an arrow pointing to the trigger */
  arrow?: boolean
  /** Maximum width of the tooltip */
  maxWidth?: number
  /** Additional className for the tooltip */
  className?: string
  /** Whether to trigger on touch devices (tap to toggle) */
  touchEnabled?: boolean
  /** Callback when tooltip visibility changes */
  onVisibilityChange?: (visible: boolean) => void
  /** Custom offset from the trigger element */
  offset?: number
}

// ============================================================================
// Styling Configuration
// ============================================================================

const variantStyles: Record<TooltipVariant, string> = {
  default: 'bg-onde-ocean text-white',
  ocean: 'bg-gradient-to-r from-onde-teal to-onde-blue text-white',
  coral: 'bg-gradient-to-r from-onde-coral to-onde-coral-light text-white',
  dark: 'bg-gray-900 text-white',
  light: 'bg-white text-onde-ocean border border-gray-200 shadow-lg',
}

const arrowStyles: Record<TooltipVariant, string> = {
  default: 'border-onde-ocean',
  ocean: 'border-onde-teal',
  coral: 'border-onde-coral',
  dark: 'border-gray-900',
  light: 'border-white',
}

const positionAnimations: Record<TooltipPosition, { initial: object; animate: object; exit: object }> = {
  top: {
    initial: { opacity: 0, y: 8, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 4, scale: 0.98 },
  },
  bottom: {
    initial: { opacity: 0, y: -8, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4, scale: 0.98 },
  },
  left: {
    initial: { opacity: 0, x: 8, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 4, scale: 0.98 },
  },
  right: {
    initial: { opacity: 0, x: -8, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -4, scale: 0.98 },
  },
}

// ============================================================================
// Main Component
// ============================================================================

export function Tooltip({
  content,
  children,
  position = 'top',
  variant = 'default',
  showDelay = 200,
  hideDelay = 100,
  disabled = false,
  arrow = true,
  maxWidth = 250,
  className,
  touchEnabled = true,
  onVisibilityChange,
  offset = 8,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipId = useId()

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - offset
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + scrollY + offset
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left + scrollX - tooltipRect.width - offset
        break
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + scrollX + offset
        break
    }

    // Boundary adjustments to keep tooltip within viewport
    const padding = 8
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Horizontal boundary check
    if (left < padding) {
      left = padding
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding
    }

    // Vertical boundary check
    if (top < scrollY + padding) {
      top = scrollY + padding
    } else if (top + tooltipRect.height > scrollY + viewportHeight - padding) {
      top = scrollY + viewportHeight - tooltipRect.height - padding
    }

    setTooltipPosition({ top, left })
  }, [position, offset])

  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      // Use requestAnimationFrame to ensure tooltip is rendered before calculating position
      requestAnimationFrame(calculatePosition)
      window.addEventListener('scroll', calculatePosition, true)
      window.addEventListener('resize', calculatePosition)
      
      return () => {
        window.removeEventListener('scroll', calculatePosition, true)
        window.removeEventListener('resize', calculatePosition)
      }
    }
  }, [isVisible, calculatePosition])

  // Notify parent of visibility changes
  useEffect(() => {
    onVisibilityChange?.(isVisible)
  }, [isVisible, onVisibilityChange])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, showDelay)
  }, [disabled, showDelay])

  const hide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
      showTimeoutRef.current = null
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, hideDelay)
  }, [hideDelay])

  const toggle = useCallback(() => {
    if (disabled) return
    setIsVisible((prev) => !prev)
  }, [disabled])

  // Handle touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!touchEnabled || disabled) return
    e.preventDefault()
    toggle()
  }, [touchEnabled, disabled, toggle])

  // Close on outside touch (for mobile)
  useEffect(() => {
    if (!isVisible || !touchEnabled) return

    const handleOutsideTouch = (e: TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener('touchstart', handleOutsideTouch)
    return () => document.removeEventListener('touchstart', handleOutsideTouch)
  }, [isVisible, touchEnabled])

  // Clone children with event handlers
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e)
      show()
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e)
      hide()
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e)
      show()
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e)
      hide()
    },
    onTouchStart: handleTouchStart,
    'aria-describedby': isVisible ? tooltipId : undefined,
  })

  const animation = positionAnimations[position]

  // Arrow positioning
  const arrowPositionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <>
      {trigger}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'fixed z-[9999] px-3 py-2 rounded-lg text-sm font-medium',
              'pointer-events-none select-none',
              'shadow-lg backdrop-blur-sm',
              variantStyles[variant],
              className
            )}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              maxWidth,
            }}
          >
            {content}
            
            {/* Arrow */}
            {arrow && (
              <span
                className={cn(
                  'absolute w-0 h-0 border-[6px] border-solid',
                  arrowPositionClasses[position],
                  arrowStyles[variant]
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================================================
// Tooltip with Icon
// ============================================================================

interface TooltipIconProps extends Omit<TooltipProps, 'children'> {
  /** Icon to display (defaults to info icon) */
  icon?: React.ReactNode
  /** Size of the icon button */
  size?: 'sm' | 'md' | 'lg'
  /** Additional className for the icon button */
  iconClassName?: string
}

export function TooltipIcon({
  icon,
  size = 'md',
  iconClassName,
  ...tooltipProps
}: TooltipIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(sizeClasses[size], 'text-onde-ocean/60 hover:text-onde-ocean transition-colors')}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )

  return (
    <Tooltip {...tooltipProps}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-onde-coral focus-visible:ring-offset-2',
          'transition-transform hover:scale-110 active:scale-95',
          iconClassName
        )}
        aria-label="More information"
      >
        {icon || defaultIcon}
      </button>
    </Tooltip>
  )
}

// ============================================================================
// Tooltip Provider for controlled tooltips
// ============================================================================

interface TooltipProviderContextType {
  openTooltip: string | null
  setOpenTooltip: (id: string | null) => void
}

const TooltipProviderContext = React.createContext<TooltipProviderContextType | null>(null)

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)

  return (
    <TooltipProviderContext.Provider value={{ openTooltip, setOpenTooltip }}>
      {children}
    </TooltipProviderContext.Provider>
  )
}

export function useTooltipProvider() {
  const context = React.useContext(TooltipProviderContext)
  if (!context) {
    throw new Error('useTooltipProvider must be used within a TooltipProvider')
  }
  return context
}

// ============================================================================
// Controlled Tooltip (works with TooltipProvider)
// ============================================================================

interface ControlledTooltipProps extends TooltipProps {
  /** Unique ID for this tooltip (used with TooltipProvider) */
  id: string
}

export function ControlledTooltip({ id, children, ...props }: ControlledTooltipProps) {
  const { openTooltip, setOpenTooltip } = useTooltipProvider()
  const isOpen = openTooltip === id

  return (
    <Tooltip
      {...props}
      onVisibilityChange={(visible) => {
        setOpenTooltip(visible ? id : null)
        props.onVisibilityChange?.(visible)
      }}
    >
      {children}
    </Tooltip>
  )
}

// ============================================================================
// Simple text tooltip shorthand
// ============================================================================

interface SimpleTooltipProps {
  text: string
  children: React.ReactElement
  position?: TooltipPosition
}

export function SimpleTooltip({ text, children, position = 'top' }: SimpleTooltipProps) {
  return (
    <Tooltip content={text} position={position}>
      {children}
    </Tooltip>
  )
}

// ============================================================================
// Exports
// ============================================================================

export default Tooltip
