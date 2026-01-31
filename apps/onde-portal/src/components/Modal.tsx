'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useEffect, useRef, useCallback, ReactNode } from 'react'
import { createPortal } from 'react-dom'

// ============================================================================
// Types
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'slideUp' | 'none'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal content */
  children: ReactNode
  /** Modal size preset */
  size?: ModalSize
  /** Animation type */
  animation?: ModalAnimation
  /** Custom className for the modal container */
  className?: string
  /** Whether to close on backdrop click */
  closeOnBackdrop?: boolean
  /** Whether to close on escape key */
  closeOnEscape?: boolean
  /** Whether to show backdrop blur */
  blurBackdrop?: boolean
  /** Custom backdrop className */
  backdropClassName?: string
  /** Whether to lock body scroll when open */
  lockScroll?: boolean
  /** Initial focus element ref */
  initialFocusRef?: React.RefObject<HTMLElement>
  /** Element to return focus to on close */
  finalFocusRef?: React.RefObject<HTMLElement>
  /** Accessible label for the modal */
  ariaLabel?: string
  /** Accessible description id */
  ariaDescribedBy?: string
  /** z-index for stacking modals */
  zIndex?: number
}

export interface ModalHeaderProps {
  children: ReactNode
  className?: string
  /** Show close button */
  showCloseButton?: boolean
  /** Close button callback */
  onClose?: () => void
}

export interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export interface ModalFooterProps {
  children: ReactNode
  className?: string
}

// ============================================================================
// Animation Variants
// ============================================================================

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const getModalVariants = (animation: ModalAnimation): Variants => {
  switch (animation) {
    case 'slide':
      return {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
      }
    case 'slideUp':
      return {
        hidden: { opacity: 0, y: 100 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 100 }
      }
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      }
    case 'none':
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
        exit: { opacity: 1 }
      }
    case 'fade':
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      }
  }
}

// ============================================================================
// Size Classes
// ============================================================================

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4 md:mx-8'
}

// ============================================================================
// Focus Trap Hook
// ============================================================================

function useFocusTrap(
  modalRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  initialFocusRef?: React.RefObject<HTMLElement>,
  finalFocusRef?: React.RefObject<HTMLElement>
) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus initial element or first focusable
    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else if (modalRef.current) {
        const focusable = getFocusableElements(modalRef.current)
        if (focusable.length > 0) {
          focusable[0].focus()
        } else {
          modalRef.current.focus()
        }
      }
    }

    // Small delay to ensure modal is rendered
    const timeoutId = setTimeout(focusInitial, 10)

    return () => {
      clearTimeout(timeoutId)
      // Return focus on unmount
      const returnFocusTo = finalFocusRef?.current || previousFocusRef.current
      if (returnFocusTo && typeof returnFocusTo.focus === 'function') {
        returnFocusTo.focus()
      }
    }
  }, [isOpen, initialFocusRef, finalFocusRef, modalRef])

  // Handle tab key for focus trapping
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !modalRef.current) return

    const focusable = getFocusableElements(modalRef.current)
    if (focusable.length === 0) return

    const firstElement = focusable[0]
    const lastElement = focusable[focusable.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [modalRef])

  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

// ============================================================================
// Body Scroll Lock
// ============================================================================

function useBodyScrollLock(isOpen: boolean, lock: boolean) {
  useEffect(() => {
    if (!lock || !isOpen) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isOpen, lock])
}

// ============================================================================
// Modal Component
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  animation = 'scale',
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  blurBackdrop = true,
  backdropClassName = '',
  lockScroll = true,
  initialFocusRef,
  finalFocusRef,
  ariaLabel,
  ariaDescribedBy,
  zIndex = 50
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus trap
  useFocusTrap(modalRef, isOpen, initialFocusRef, finalFocusRef)

  // Body scroll lock
  useBodyScrollLock(isOpen, lockScroll)

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  // Don't render on server
  if (typeof window === 'undefined') return null

  const modalVariants = getModalVariants(animation)

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center p-4 ${backdropClassName}`}
          style={{ zIndex }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/50 ${blurBackdrop ? 'backdrop-blur-sm' : ''}`}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            className={`
              relative w-full ${sizeClasses[size]}
              bg-white dark:bg-gray-900
              rounded-2xl shadow-2xl
              overflow-hidden
              ${className}
            `}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Render in portal
  return createPortal(modalContent, document.body)
}

// ============================================================================
// Modal.Header Component
// ============================================================================

export function ModalHeader({ 
  children, 
  className = '',
  showCloseButton = true,
  onClose
}: ModalHeaderProps) {
  return (
    <div className={`
      flex items-center justify-between
      px-6 py-4
      border-b border-gray-200 dark:border-gray-700
      ${className}
    `}>
      <div className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
        {children}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="
            ml-4 p-2 rounded-full
            text-gray-500 hover:text-gray-700
            dark:text-gray-400 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-purple-500
          "
          aria-label="Close modal"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Modal.Body Component
// ============================================================================

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`
      px-6 py-4
      overflow-y-auto
      max-h-[60vh]
      ${className}
    `}>
      {children}
    </div>
  )
}

// ============================================================================
// Modal.Footer Component
// ============================================================================

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`
      flex items-center justify-end gap-3
      px-6 py-4
      border-t border-gray-200 dark:border-gray-700
      bg-gray-50 dark:bg-gray-800/50
      ${className}
    `}>
      {children}
    </div>
  )
}

// ============================================================================
// Compound Component Pattern
// ============================================================================

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
