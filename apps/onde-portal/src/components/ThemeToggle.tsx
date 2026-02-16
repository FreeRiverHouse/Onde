'use client'

import { motion } from 'framer-motion'
import { useTheme, useIsDarkMode, useToggleDarkMode } from '@/hooks/useTheme'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const isDark = useIsDarkMode()
  const toggleDark = useToggleDarkMode()

  return (
    <motion.button
      onClick={toggleDark}
      className={`relative flex items-center justify-center rounded-xl
                 transition-all duration-200 border
                 ${compact ? 'p-3 min-w-[44px] min-h-[44px]' : 'px-3 py-2'}
                 ${isDark
                   ? 'bg-onde-dark-surface/50 hover:bg-onde-dark-elevated border-white/10 text-amber-300'
                   : 'bg-onde-cream/50 hover:bg-onde-cream border-onde-ocean/10 text-onde-ocean/60 hover:text-onde-ocean'
                 }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode ☀️' : 'Dark mode 🌙'}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
        className="text-lg"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </motion.button>
  )
}

export function ThemeToggleCompact() {
  return <ThemeToggle compact />
}
