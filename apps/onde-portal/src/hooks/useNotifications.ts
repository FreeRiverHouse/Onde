'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'onde-notifications'
const PREFERENCES_KEY = 'onde-notification-preferences'

export type NotificationType = 'achievement' | 'reminder' | 'update'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  createdAt: string
  read: boolean
  link?: string
}

export interface NotificationPreferences {
  enabled: boolean
  sound: boolean
  achievements: boolean
  reminders: boolean
  updates: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  achievements: true,
  reminders: true,
  updates: true,
}

// Notification sound - a simple pleasant chime
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH6LjYyLiIaFhIeKjY2Kh4OAf4CChoeJiYeEgH18fYGFiIqKiIWBfXt7fYGFiIqKiYaCfnt6e36ChYiJiYeCfnp5eXt+goaIiYiGgn56eHh6fIGFiImJh4N/e3l4eHt/g4eJiomGgn56eHd4en6Ch4mKiYaDf3t5d3d5fYKGiYqKh4R/fHl3dnh8gYWJioqIhYF9enh3eHt/hIiKiomGgn57eHd3eX2ChouLiomFgX16eHZ3eXyChouLi4mGgn56eHZ2eHuAhYqMjImHg356d3Z1d3p/hIqMjYuIhIB7eHZ1dnh8gYaLjY2KiISAe3h2dXV4fIGGi42NioeEgHt4dnV1d3uAhYqMjYuIhYF8eXZ1dXd6f4WKjY2LiIWBfHl2dXV3en+FioyNi4iFgXx5dnR0dnh9goeMjYyJhoJ9eXZ0dHV4fIKHjI6NioeDfnp3dXR1eHyBhoyOjYqHg357d3V0dHd7gIWLjo6LiISAfHh1dHR2en+Ei46Oi4mFgX15dnR0dXl+g4iMjo2KhoJ+end1dHR3e4CGi46OjImFgX56d3V0dXl9goeLjo6LiYWBfXp3dXR1eHyBhoyOjouIhIF9end1dHR4fIGGi4+OjImFgX16d3V0dHh7gIWLj4+MiYaCfXp3dXR0d3t/hIqOj42Kh4N+e3h2dXR2en6Dio2Pjo2Jh4N+e3l2dXV3en+Eio6Qj46LiYR/fHl2dXR2eX2Cio6Qj42KhYB8eXZ1dHV3e3+Eio6Qj42KhYB7eHV0dHV4fICFio6Qj42Kh4J9enZ1dHR2eX2BhouPkI+Ni4eDfXp3dXR0dnh8gIWLj5CPjouIg358eXZ0c3R3e3+Dio6Qj4+Mi4eDfnp3dXR0dnh8gIaLj5CQjo2Kh4N+e3h1dHR1eHuAhYqOkJCPjoyJhYB7eHV0c3R2eXyAhYqNj5CPjoyJhYB7eHV0c3R2eXyAhIqNj5CPjoyJhYB7eHV0c3R2eXuAhIqNjw=='

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [mounted, setMounted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL)
      audioRef.current.volume = 0.5
    }
  }, [])

  // Load notifications and preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem(STORAGE_KEY)
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications)
        if (Array.isArray(parsed)) {
          setNotifications(parsed)
        }
      }

      const storedPreferences = localStorage.getItem(PREFERENCES_KEY)
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
    setMounted(true)
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
      } catch (error) {
        console.error('Error saving notifications:', error)
      }
    }
  }, [notifications, mounted])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.error('Error saving notification preferences:', error)
      }
    }
  }, [preferences, mounted])

  // Play notification sound
  const playSound = useCallback(() => {
    if (preferences.sound && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors - user interaction required
      })
    }
  }, [preferences.sound])

  // Add a new notification
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: { icon?: string; link?: string }
  ) => {
    // Check if this type of notification is enabled
    if (!preferences.enabled) return
    if (type === 'achievement' && !preferences.achievements) return
    if (type === 'reminder' && !preferences.reminders) return
    if (type === 'update' && !preferences.updates) return

    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      icon: options?.icon,
      link: options?.link,
      createdAt: new Date().toISOString(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])
    playSound()
  }, [preferences, playSound])

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  // Toggle preference
  const togglePreference = useCallback((key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Get notifications by type
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type)
  }, [notifications])

  // Helper to add achievement notification
  const notifyAchievement = useCallback((name: string, description: string, icon?: string) => {
    addNotification('achievement', `🎉 ${name}`, description, { icon })
  }, [addNotification])

  // Helper to add reminder notification
  const notifyReminder = useCallback((title: string, message: string, link?: string) => {
    addNotification('reminder', `⏰ ${title}`, message, { link })
  }, [addNotification])

  // Helper to add update notification
  const notifyUpdate = useCallback((title: string, message: string, link?: string) => {
    addNotification('update', `✨ ${title}`, message, { link })
  }, [addNotification])

  return {
    notifications,
    preferences,
    mounted,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getUnreadCount,
    updatePreferences,
    togglePreference,
    getNotificationsByType,
    notifyAchievement,
    notifyReminder,
    notifyUpdate,
  }
}
