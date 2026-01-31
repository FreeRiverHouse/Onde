'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, NotificationType } from '@/hooks/useNotifications'

// Icons for notification types
const TYPE_ICONS: Record<NotificationType, string> = {
  achievement: '🏆',
  reminder: '⏰',
  update: '✨',
}

const TYPE_COLORS: Record<NotificationType, string> = {
  achievement: 'bg-amber-100 text-amber-800 border-amber-200',
  reminder: 'bg-blue-100 text-blue-800 border-blue-200',
  update: 'bg-green-100 text-green-800 border-green-200',
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    notifications,
    preferences,
    mounted,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getUnreadCount,
    togglePreference,
  } = useNotifications()

  const unreadCount = getUnreadCount()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!mounted) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-onde-ocean/70 hover:text-onde-ocean transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center
                         bg-onde-coral text-white text-xs font-bold rounded-full px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-onde-ocean">Notifications</h3>
                {notifications.length > 0 && activeTab === 'all' && (
                  <div className="flex gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-onde-ocean/60 hover:text-onde-ocean transition-colors"
                    >
                      Mark all read
                    </button>
                    <span className="text-onde-ocean/30">|</span>
                    <button
                      onClick={clearAll}
                      className="text-xs text-onde-coral/60 hover:text-onde-coral transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === 'all'
                      ? 'bg-onde-ocean text-white'
                      : 'text-onde-ocean/60 hover:bg-onde-cream'
                    }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === 'settings'
                      ? 'bg-onde-ocean text-white'
                      : 'text-onde-ocean/60 hover:bg-onde-cream'
                    }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'all' ? (
                notifications.length === 0 ? (
                  <div className="p-8 text-center text-onde-ocean/50">
                    <div className="text-4xl mb-2">🔔</div>
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs mt-1">When something happens, you'll see it here!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative
                          ${!notification.read ? 'bg-onde-cream/30' : ''}`}
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.link) {
                            window.location.href = notification.link
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          {/* Type Badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                                          border ${TYPE_COLORS[notification.type]}`}>
                            {notification.icon || TYPE_ICONS[notification.type]}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-onde-ocean text-sm truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-onde-ocean/60 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-onde-ocean/40 mt-1">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-onde-coral flex-shrink-0 mt-2" />
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:opacity-100 
                                       text-onde-ocean/30 hover:text-onde-coral transition-opacity p-1"
                            aria-label="Remove notification"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              ) : (
                /* Settings Tab */
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    {/* Master Toggle */}
                    <ToggleSetting
                      label="Enable Notifications"
                      description="Turn all notifications on or off"
                      enabled={preferences.enabled}
                      onToggle={() => togglePreference('enabled')}
                    />

                    <hr className="border-gray-100" />

                    {/* Sound Toggle */}
                    <ToggleSetting
                      label="🔊 Notification Sound"
                      description="Play a sound for new notifications"
                      enabled={preferences.sound}
                      onToggle={() => togglePreference('sound')}
                      disabled={!preferences.enabled}
                    />

                    <hr className="border-gray-100" />

                    {/* Type Toggles */}
                    <p className="text-xs font-medium text-onde-ocean/60 uppercase tracking-wider">
                      Notification Types
                    </p>

                    <ToggleSetting
                      label="🏆 Achievements"
                      description="When you unlock achievements"
                      enabled={preferences.achievements}
                      onToggle={() => togglePreference('achievements')}
                      disabled={!preferences.enabled}
                    />

                    <ToggleSetting
                      label="⏰ Reminders"
                      description="Reading reminders and goals"
                      enabled={preferences.reminders}
                      onToggle={() => togglePreference('reminders')}
                      disabled={!preferences.enabled}
                    />

                    <ToggleSetting
                      label="✨ Updates"
                      description="New books and features"
                      enabled={preferences.updates}
                      onToggle={() => togglePreference('updates')}
                      disabled={!preferences.enabled}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  enabled,
  onToggle,
  disabled = false,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm font-medium text-onde-ocean">{label}</p>
        <p className="text-xs text-onde-ocean/50">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-onde-coral' : 'bg-gray-200'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        role="switch"
        aria-checked={enabled}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow"
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </div>
  )
}
