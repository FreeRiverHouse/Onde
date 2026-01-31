'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useI18n, useTranslations } from '@/i18n/I18nProvider'
import type { Locale } from '@/i18n/config'

// ============================================
// Settings Types
// ============================================

interface Settings {
  theme: 'light' | 'dark' | 'auto'
  soundEffects: boolean
  notifications: boolean
  fontSize: 'small' | 'medium' | 'large'
  reduceMotion: boolean
}

const defaultSettings: Settings = {
  theme: 'auto',
  soundEffects: true,
  notifications: true,
  fontSize: 'medium',
  reduceMotion: false,
}

// ============================================
// Custom Hooks
// ============================================

function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('onde-settings')
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setLoaded(true)
  }, [])

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates }
      localStorage.setItem('onde-settings', JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  return { settings, updateSettings, loaded }
}

// ============================================
// Toggle Switch Component
// ============================================

function ToggleSwitch({ 
  enabled, 
  onChange, 
  label,
  description 
}: { 
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-white font-medium">{label}</p>
        {description && (
          <p className="text-white/50 text-sm mt-1">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full 
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onde-gold focus-visible:ring-offset-2
          ${enabled ? 'bg-onde-teal' : 'bg-white/20'}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full 
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}

// ============================================
// Select Component
// ============================================

function SelectOption<T extends string>({
  value,
  onChange,
  options,
  label,
  description
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-white font-medium">{label}</p>
        {description && (
          <p className="text-white/50 text-sm mt-1">{description}</p>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-onde-dark-surface border border-white/10 rounded-lg px-3 py-2 text-white
                   focus:outline-none focus:ring-2 focus:ring-onde-gold focus:border-transparent
                   cursor-pointer min-w-[120px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ============================================
// Section Card Component
// ============================================

function SettingsSection({
  icon,
  title,
  children
}: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="card-3d p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-display font-bold text-white">{title}</h2>
      </div>
      <div className="divide-y divide-white/5">
        {children}
      </div>
    </motion.div>
  )
}

// ============================================
// Action Button Component
// ============================================

function ActionButton({
  icon,
  label,
  description,
  onClick,
  variant = 'default',
  disabled = false
}: {
  icon: string
  label: string
  description?: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 py-4 px-4 rounded-lg transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}
        ${variant === 'danger' ? 'hover:bg-red-500/10' : ''}
      `}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 text-left">
        <p className={`font-medium ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}>
          {label}
        </p>
        {description && (
          <p className="text-white/50 text-sm mt-1">{description}</p>
        )}
      </div>
      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

// ============================================
// Main Settings Page
// ============================================

export default function SettingsPage() {
  const t = useTranslations()
  const { locale, setLocale } = useI18n()
  const { settings, updateSettings, loaded } = useSettings()
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [showClearSuccess, setShowClearSuccess] = useState(false)

  // Get settings translations with fallback
  const st = t.settings || {
    title: 'Settings',
    subtitle: 'Customize your experience',
    appearance: {
      title: 'Appearance',
      theme: 'Theme',
      themeDesc: 'Choose your preferred color scheme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeAuto: 'Auto'
    },
    language: {
      title: 'Language',
      language: 'Language',
      languageDesc: 'Select your preferred language'
    },
    sounds: {
      title: 'Sounds & Notifications',
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Play sounds for interactions',
      notifications: 'Notifications',
      notificationsDesc: 'Receive updates and alerts'
    },
    data: {
      title: 'Data Management',
      clearCache: 'Clear Cache',
      clearCacheDesc: 'Remove temporary data to free up space',
      export: 'Export Data',
      exportDesc: 'Download a copy of your settings and preferences',
      import: 'Import Data',
      importDesc: 'Restore settings from a previous export'
    },
    accessibility: {
      title: 'Accessibility',
      fontSize: 'Font Size',
      fontSizeDesc: 'Adjust text size for better readability',
      fontSmall: 'Small',
      fontMedium: 'Medium',
      fontLarge: 'Large',
      reduceMotion: 'Reduce Motion',
      reduceMotionDesc: 'Minimize animations for comfort'
    },
    about: {
      title: 'About',
      version: 'Version',
      buildWith: 'Built with ❤️ in Los Angeles',
      copyright: '© 2026 Onde'
    },
    success: {
      cleared: 'Cache cleared successfully!',
      exported: 'Data exported successfully!'
    }
  }

  // Handle theme changes
  useEffect(() => {
    if (!loaded) return
    
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto: check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [settings.theme, loaded])

  // Handle reduce motion
  useEffect(() => {
    if (!loaded) return
    
    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [settings.reduceMotion, loaded])

  // Handle font size
  useEffect(() => {
    if (!loaded) return
    
    const root = document.documentElement
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${settings.fontSize}`)
  }, [settings.fontSize, loaded])

  const handleClearCache = async () => {
    // Clear various caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }
    
    // Clear session storage
    sessionStorage.clear()
    
    setShowClearSuccess(true)
    setTimeout(() => setShowClearSuccess(false), 3000)
  }

  const handleExport = () => {
    const data = {
      settings,
      locale,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onde-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setShowExportSuccess(true)
    setTimeout(() => setShowExportSuccess(false), 3000)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (data.settings) {
          updateSettings(data.settings)
        }
        if (data.locale) {
          setLocale(data.locale as Locale)
        }
      } catch (err) {
        console.error('Failed to import settings:', err)
      }
    }
    input.click()
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="floating-orb w-[400px] h-[400px] -top-40 -right-40"
          style={{ background: 'var(--onde-teal)' }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="floating-orb w-[300px] h-[300px] bottom-40 -left-20"
          style={{ background: 'var(--onde-purple)' }}
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ⚙️
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {st.title}
          </h1>
          <p className="text-white/60">{st.subtitle}</p>
        </motion.div>

        {/* Success Messages */}
        {(showClearSuccess || showExportSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50
                       bg-onde-teal text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {showClearSuccess ? st.success.cleared : st.success.exported}
          </motion.div>
        )}

        {/* Appearance Section */}
        <SettingsSection icon="🎨" title={st.appearance.title}>
          <SelectOption
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
            label={st.appearance.theme}
            description={st.appearance.themeDesc}
            options={[
              { value: 'light', label: st.appearance.themeLight },
              { value: 'dark', label: st.appearance.themeDark },
              { value: 'auto', label: st.appearance.themeAuto },
            ]}
          />
        </SettingsSection>

        {/* Language Section */}
        <SettingsSection icon="🌍" title={st.language.title}>
          <SelectOption
            value={locale}
            onChange={(v) => setLocale(v as Locale)}
            label={st.language.language}
            description={st.language.languageDesc}
            options={[
              { value: 'en', label: 'English' },
              { value: 'it', label: 'Italiano' },
            ]}
          />
        </SettingsSection>

        {/* Sounds & Notifications Section */}
        <SettingsSection icon="🔔" title={st.sounds.title}>
          <ToggleSwitch
            enabled={settings.soundEffects}
            onChange={(v) => updateSettings({ soundEffects: v })}
            label={st.sounds.soundEffects}
            description={st.sounds.soundEffectsDesc}
          />
          <ToggleSwitch
            enabled={settings.notifications}
            onChange={(v) => updateSettings({ notifications: v })}
            label={st.sounds.notifications}
            description={st.sounds.notificationsDesc}
          />
        </SettingsSection>

        {/* Data Management Section */}
        <SettingsSection icon="💾" title={st.data.title}>
          <ActionButton
            icon="🗑️"
            label={st.data.clearCache}
            description={st.data.clearCacheDesc}
            onClick={handleClearCache}
          />
          <ActionButton
            icon="📤"
            label={st.data.export}
            description={st.data.exportDesc}
            onClick={handleExport}
          />
          <ActionButton
            icon="📥"
            label={st.data.import}
            description={st.data.importDesc}
            onClick={handleImport}
          />
        </SettingsSection>

        {/* Accessibility Section */}
        <SettingsSection icon="♿" title={st.accessibility.title}>
          <SelectOption
            value={settings.fontSize}
            onChange={(v) => updateSettings({ fontSize: v })}
            label={st.accessibility.fontSize}
            description={st.accessibility.fontSizeDesc}
            options={[
              { value: 'small', label: st.accessibility.fontSmall },
              { value: 'medium', label: st.accessibility.fontMedium },
              { value: 'large', label: st.accessibility.fontLarge },
            ]}
          />
          <ToggleSwitch
            enabled={settings.reduceMotion}
            onChange={(v) => updateSettings({ reduceMotion: v })}
            label={st.accessibility.reduceMotion}
            description={st.accessibility.reduceMotionDesc}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection icon="ℹ️" title={st.about.title}>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">{st.about.version}</span>
              <span className="text-onde-teal font-mono">1.0.0</span>
            </div>
            <div className="pt-4 border-t border-white/10 text-center">
              <motion.div
                className="text-3xl mb-2"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌊
              </motion.div>
              <p className="text-white/60 text-sm">{st.about.buildWith}</p>
              <p className="text-white/40 text-xs mt-1">{st.about.copyright}</p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
