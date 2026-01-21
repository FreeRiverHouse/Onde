"use client"

import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon (light mode) */}
      <svg
        className={`w-4 h-4 transition-all duration-300 ${
          theme === 'light'
            ? 'text-amber-400 rotate-0 scale-100'
            : 'text-white/30 -rotate-90 scale-75'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Toggle track */}
      <div className="relative w-10 h-5 rounded-full bg-white/10 border border-white/10 overflow-hidden">
        {/* Animated background */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-slate-800 to-slate-700'
              : 'bg-gradient-to-r from-sky-400 to-amber-300'
          }`}
        />

        {/* Toggle knob */}
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-lg ${
            theme === 'dark'
              ? 'left-0.5 bg-slate-300'
              : 'left-5 bg-white'
          }`}
        >
          {/* Moon crater decoration for dark mode */}
          {theme === 'dark' && (
            <>
              <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-slate-400/50" />
              <div className="absolute top-2 left-2 w-0.5 h-0.5 rounded-full bg-slate-400/50" />
            </>
          )}
        </div>

        {/* Stars for dark mode */}
        {theme === 'dark' && (
          <>
            <div className="absolute top-1 right-1.5 w-0.5 h-0.5 rounded-full bg-white/60 animate-pulse" />
            <div className="absolute top-2.5 right-2.5 w-0.5 h-0.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </div>

      {/* Moon icon (dark mode) */}
      <svg
        className={`w-4 h-4 transition-all duration-300 ${
          theme === 'dark'
            ? 'text-cyan-400 rotate-0 scale-100'
            : 'text-white/30 rotate-90 scale-75'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {showLabel && (
        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  )
}

// Minimal variant for header
export function ThemeToggleMinimal({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5 text-white/60 hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-600 hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
