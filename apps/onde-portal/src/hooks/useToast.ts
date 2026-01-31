'use client'

import { createContext, useContext, useCallback, useState, useRef, useEffect, ReactNode } from 'react'

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  icon?: string
  actions?: ToastAction[]
  dismissible?: boolean
  pauseOnHover?: boolean
  createdAt: number
}

export interface ToastOptions {
  title: string
  message?: string
  type?: ToastType
  duration?: number
  icon?: string
  actions?: ToastAction[]
  dismissible?: boolean
  pauseOnHover?: boolean
}

export interface ToastConfig {
  position: ToastPosition
  maxToasts: number
  defaultDuration: number
  sound: boolean
}

export interface ToastContextValue {
  toasts: Toast[]
  config: ToastConfig
  show: (options: ToastOptions) => string
  success: (title: string, message?: string, options?: Partial<ToastOptions>) => string
  error: (title: string, message?: string, options?: Partial<ToastOptions>) => string
  info: (title: string, message?: string, options?: Partial<ToastOptions>) => string
  warning: (title: string, message?: string, options?: Partial<ToastOptions>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
  update: (id: string, options: Partial<ToastOptions>) => void
  setConfig: (config: Partial<ToastConfig>) => void
}

// ============================================================================
// Defaults & Config
// ============================================================================

const DEFAULT_CONFIG: ToastConfig = {
  position: 'top-right',
  maxToasts: 5,
  defaultDuration: 5000,
  sound: false,
}

const TYPE_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

// Notification sound - simple chime
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH6LjYyLiIaFhIeKjY2Kh4OAf4CChoeJiYeEgH18fYGFiIqKiIWBfXt7fYGFiIqKiYaCfnt6e36ChYiJiYeCfnp5eXt+goaIiYiGgn56eHh6fIGFiImJh4N/e3l4eHt/g4eJiomGgn56eHd4en6Ch4mKiYaDf3t5d3d5fYKGiYqKh4R/fHl3dnh8gYWJioqIhYF9enh3eHt/hIiKiomGgn57eHd3eX2ChouLiomFgX16eHZ3eXyChouLi4mGgn56eHZ2eHuAhYqMjImHg356d3Z1d3p/hIqMjYuIhIB7eHZ1dnh8gYaLjY2KiISAe3h2dXV4fIGGi42NioeEgHt4dnV1d3uAhYqMjYuIhYF8eXZ1dXd6f4WKjY2LiIWBfHl2dXV3en+FioyNi4iFgXx5dnR0dnh9goeMjYyJhoJ9eXZ0dHV4fIKHjI6NioeDfnp3dXR1eHyBhoyOjYqHg357d3V0dHd7gIWLjo6LiISAfHh1dHR2en+Ei46Oi4mFgX15dnR0dXl+g4iMjo2KhoJ+end1dHR3e4CGi46OjImFgX56d3V0dXl9goeLjo6LiYWBfXp3dXR1eHyBhoyOjouIhIF9end1dHR4fIGGi4+OjImFgX16d3V0dHh7gIWLj4+MiYaCfXp3dXR0d3t/hIqOj42Kh4N+e3h2dXR2en6Dio2Pjo2Jh4N+e3l2dXV3en+Eio6Qj46LiYR/fHl2dXR2eX2Cio6Qj42KhYB8eXZ1dHV3e3+Eio6Qj42KhYB7eHV0dHV4fICFio6Qj42Kh4J9enZ1dHR2eX2BhouPkI+Ni4eDfXp3dXR0dnh8gIWLj5CPjouIg358eXZ0c3R3e3+Dio6Qj4+Mi4eDfnp3dXR0dnh8gIaLj5CQjo2Kh4N+e3h1dHR1eHuAhYqOkJCPjoyJhYB7eHV0c3R2eXyAhYqNj5CPjoyJhYB7eHV0c3R2eXyAhIqNj5CPjoyJhYB7eHV0c3R2eXuAhIqNjw=='

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null)

// ============================================================================
// Provider Component (to be used with Toast.tsx)
// ============================================================================

export function createToastStore() {
  let toasts: Toast[] = []
  let config: ToastConfig = { ...DEFAULT_CONFIG }
  let listeners: Set<() => void> = new Set()
  let audioRef: HTMLAudioElement | null = null

  // Initialize audio
  if (typeof window !== 'undefined') {
    audioRef = new Audio(NOTIFICATION_SOUND_URL)
    audioRef.volume = 0.3
  }

  const notify = () => {
    listeners.forEach(listener => listener())
  }

  const playSound = () => {
    if (config.sound && audioRef) {
      audioRef.currentTime = 0
      audioRef.play().catch(() => {})
    }
  }

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    getState: () => ({ toasts, config }),
    
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    show: (options: ToastOptions): string => {
      const id = generateId()
      const toast: Toast = {
        id,
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        duration: options.duration ?? config.defaultDuration,
        icon: options.icon || TYPE_ICONS[options.type || 'info'],
        actions: options.actions,
        dismissible: options.dismissible ?? true,
        pauseOnHover: options.pauseOnHover ?? true,
        createdAt: Date.now(),
      }

      // Limit max toasts
      toasts = [toast, ...toasts].slice(0, config.maxToasts)
      playSound()
      notify()
      return id
    },

    dismiss: (id: string) => {
      toasts = toasts.filter(t => t.id !== id)
      notify()
    },

    dismissAll: () => {
      toasts = []
      notify()
    },

    update: (id: string, options: Partial<ToastOptions>) => {
      toasts = toasts.map(t => {
        if (t.id === id) {
          return {
            ...t,
            ...options,
            icon: options.icon || (options.type ? TYPE_ICONS[options.type] : t.icon),
          }
        }
        return t
      })
      notify()
    },

    setConfig: (newConfig: Partial<ToastConfig>) => {
      config = { ...config, ...newConfig }
      notify()
    },
  }
}

// Global store instance
let globalStore: ReturnType<typeof createToastStore> | null = null

function getStore() {
  if (!globalStore) {
    globalStore = createToastStore()
  }
  return globalStore
}

// ============================================================================
// Hook
// ============================================================================

export function useToast(): ToastContextValue {
  const store = getStore()
  const [state, setState] = useState(store.getState())
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const unsubscribe = store.subscribe(() => {
      if (mountedRef.current) {
        setState(store.getState())
      }
    })
    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [store])

  const show = useCallback((options: ToastOptions) => {
    return store.show(options)
  }, [store])

  const success = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return store.show({ title, message, type: 'success', ...options })
  }, [store])

  const error = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return store.show({ title, message, type: 'error', duration: 7000, ...options })
  }, [store])

  const info = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return store.show({ title, message, type: 'info', ...options })
  }, [store])

  const warning = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return store.show({ title, message, type: 'warning', duration: 6000, ...options })
  }, [store])

  const dismiss = useCallback((id: string) => {
    store.dismiss(id)
  }, [store])

  const dismissAll = useCallback(() => {
    store.dismissAll()
  }, [store])

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    store.update(id, options)
  }, [store])

  const setConfig = useCallback((config: Partial<ToastConfig>) => {
    store.setConfig(config)
  }, [store])

  return {
    toasts: state.toasts,
    config: state.config,
    show,
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll,
    update,
    setConfig,
  }
}

// ============================================================================
// Standalone functions (for use outside React components)
// ============================================================================

export const toast = {
  show: (options: ToastOptions) => getStore().show(options),
  success: (title: string, message?: string, options?: Partial<ToastOptions>) => 
    getStore().show({ title, message, type: 'success', ...options }),
  error: (title: string, message?: string, options?: Partial<ToastOptions>) => 
    getStore().show({ title, message, type: 'error', duration: 7000, ...options }),
  info: (title: string, message?: string, options?: Partial<ToastOptions>) => 
    getStore().show({ title, message, type: 'info', ...options }),
  warning: (title: string, message?: string, options?: Partial<ToastOptions>) => 
    getStore().show({ title, message, type: 'warning', duration: 6000, ...options }),
  dismiss: (id: string) => getStore().dismiss(id),
  dismissAll: () => getStore().dismissAll(),
  update: (id: string, options: Partial<ToastOptions>) => getStore().update(id, options),
}

// ============================================================================
// Context Provider (alternative to global store)
// ============================================================================

export { ToastContext }

export interface ToastProviderProps {
  children: ReactNode
  config?: Partial<ToastConfig>
}
