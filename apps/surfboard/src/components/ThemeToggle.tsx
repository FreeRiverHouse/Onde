"use client"

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] 
                 flex items-center justify-center transition-all duration-300 group
                 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-amber-400 transition-all duration-300
                     ${theme === 'light' 
                       ? 'opacity-100 rotate-0 scale-100' 
                       : 'opacity-0 rotate-90 scale-50'}`}
        />
        {/* Moon icon */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-cyan-400 transition-all duration-300
                     ${theme === 'dark' 
                       ? 'opacity-100 rotate-0 scale-100' 
                       : 'opacity-0 -rotate-90 scale-50'}`}
        />
      </div>
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      ${theme === 'dark' 
                        ? 'bg-cyan-500/10' 
                        : 'bg-amber-400/10'}`} 
      />
    </button>
  )
}
