'use client'

import { useState, useCallback, useMemo, useRef } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface UseModalReturn {
  /** Whether the modal is currently open */
  isOpen: boolean
  /** Open the modal */
  open: () => void
  /** Close the modal */
  close: () => void
  /** Toggle the modal state */
  toggle: () => void
  /** Modal props to spread on Modal component */
  modalProps: {
    isOpen: boolean
    onClose: () => void
  }
}

export interface UseModalOptions {
  /** Initial open state */
  defaultOpen?: boolean
  /** Callback when modal opens */
  onOpen?: () => void
  /** Callback when modal closes */
  onClose?: () => void
}

export interface UseModalManagerReturn {
  /** Currently active modal id */
  activeModal: string | null
  /** Open a specific modal by id */
  open: (id: string) => void
  /** Close the currently active modal */
  close: () => void
  /** Close a specific modal by id */
  closeById: (id: string) => void
  /** Check if a specific modal is open */
  isOpen: (id: string) => boolean
  /** Get props for a specific modal */
  getModalProps: (id: string) => {
    isOpen: boolean
    onClose: () => void
  }
  /** Modal stack for nested modals */
  modalStack: string[]
  /** Push a modal to the stack */
  push: (id: string) => void
  /** Pop the top modal from the stack */
  pop: () => void
}

export interface UseConfirmModalReturn extends UseModalReturn {
  /** Confirm the action */
  confirm: () => void
  /** Cancel the action */
  cancel: () => void
  /** Open the modal and return a promise that resolves on confirm/cancel */
  openAsync: () => Promise<boolean>
  /** Whether the user confirmed */
  confirmed: boolean | null
}

// ============================================================================
// useModal Hook
// ============================================================================

/**
 * Simple hook to manage a single modal's open/close state.
 * 
 * @example
 * ```tsx
 * const modal = useModal()
 * 
 * return (
 *   <>
 *     <button onClick={modal.open}>Open Modal</button>
 *     <Modal {...modal.modalProps}>
 *       <Modal.Header onClose={modal.close}>Title</Modal.Header>
 *       <Modal.Body>Content</Modal.Body>
 *     </Modal>
 *   </>
 * )
 * ```
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { defaultOpen = false, onOpen, onClose: onCloseCb } = options
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const open = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    onCloseCb?.()
  }, [onCloseCb])

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev
      if (newState) {
        onOpen?.()
      } else {
        onCloseCb?.()
      }
      return newState
    })
  }, [onOpen, onCloseCb])

  const modalProps = useMemo(() => ({
    isOpen,
    onClose: close
  }), [isOpen, close])

  return {
    isOpen,
    open,
    close,
    toggle,
    modalProps
  }
}

// ============================================================================
// useModalManager Hook
// ============================================================================

/**
 * Hook to manage multiple modals with a single source of truth.
 * Supports modal stacking for nested modals.
 * 
 * @example
 * ```tsx
 * const modals = useModalManager()
 * 
 * return (
 *   <>
 *     <button onClick={() => modals.open('settings')}>Settings</button>
 *     <button onClick={() => modals.open('profile')}>Profile</button>
 *     
 *     <Modal {...modals.getModalProps('settings')}>
 *       <Modal.Header onClose={modals.close}>Settings</Modal.Header>
 *       <Modal.Body>...</Modal.Body>
 *     </Modal>
 *     
 *     <Modal {...modals.getModalProps('profile')}>
 *       <Modal.Header onClose={modals.close}>Profile</Modal.Header>
 *       <Modal.Body>...</Modal.Body>
 *     </Modal>
 *   </>
 * )
 * ```
 */
export function useModalManager(): UseModalManagerReturn {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalStack, setModalStack] = useState<string[]>([])

  const open = useCallback((id: string) => {
    setActiveModal(id)
  }, [])

  const close = useCallback(() => {
    setActiveModal(null)
  }, [])

  const closeById = useCallback((id: string) => {
    setActiveModal(current => current === id ? null : current)
  }, [])

  const isOpen = useCallback((id: string) => {
    return activeModal === id
  }, [activeModal])

  const getModalProps = useCallback((id: string) => ({
    isOpen: activeModal === id,
    onClose: close
  }), [activeModal, close])

  // Stack-based modal management for nested modals
  const push = useCallback((id: string) => {
    setModalStack(stack => [...stack, id])
    setActiveModal(id)
  }, [])

  const pop = useCallback(() => {
    setModalStack(stack => {
      const newStack = stack.slice(0, -1)
      setActiveModal(newStack.length > 0 ? newStack[newStack.length - 1] : null)
      return newStack
    })
  }, [])

  return {
    activeModal,
    open,
    close,
    closeById,
    isOpen,
    getModalProps,
    modalStack,
    push,
    pop
  }
}

// ============================================================================
// useConfirmModal Hook
// ============================================================================

/**
 * Hook for confirmation modals that resolve with a boolean.
 * 
 * @example
 * ```tsx
 * const confirm = useConfirmModal()
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm.openAsync()
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * }
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <Modal {...confirm.modalProps}>
 *       <Modal.Header onClose={confirm.cancel}>Confirm Delete</Modal.Header>
 *       <Modal.Body>Are you sure?</Modal.Body>
 *       <Modal.Footer>
 *         <button onClick={confirm.cancel}>Cancel</button>
 *         <button onClick={confirm.confirm}>Delete</button>
 *       </Modal.Footer>
 *     </Modal>
 *   </>
 * )
 * ```
 */
export function useConfirmModal(options: UseModalOptions = {}): UseConfirmModalReturn {
  const [confirmed, setConfirmed] = useState<boolean | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)
  
  const { isOpen, open: baseOpen, close: baseClose, toggle, modalProps } = useModal({
    ...options,
    onClose: () => {
      options.onClose?.()
      // If closed without explicit confirm/cancel, treat as cancel
      if (resolverRef.current) {
        resolverRef.current(false)
        resolverRef.current = null
      }
    }
  })

  const confirm = useCallback(() => {
    setConfirmed(true)
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
    baseClose()
  }, [baseClose])

  const cancel = useCallback(() => {
    setConfirmed(false)
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    baseClose()
  }, [baseClose])

  const openAsync = useCallback((): Promise<boolean> => {
    setConfirmed(null)
    baseOpen()
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [baseOpen])

  return {
    isOpen,
    open: baseOpen,
    close: baseClose,
    toggle,
    modalProps,
    confirm,
    cancel,
    openAsync,
    confirmed
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default useModal
