'use client'

import { useEffect, useState, useCallback } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['g', 'h'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['g', 'b'], description: 'Go to Books', category: 'Navigation' },
  { keys: ['g', 'g'], description: 'Go to Games', category: 'Navigation' },
  { keys: ['/'], description: 'Focus search', category: 'Navigation' },
  
  // General
  { keys: ['?'], description: 'Show this help', category: 'General' },
  { keys: ['Esc'], description: 'Close modal / Cancel', category: 'General' },
  
  // Accessibility
  { keys: ['Tab'], description: 'Navigate forward', category: 'Accessibility' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backward', category: 'Accessibility' },
  { keys: ['Enter'], description: 'Activate button/link', category: 'Accessibility' },
]

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { containerRef } = useFocusTrap(isOpen)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      setIsOpen(true)
    }

    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }, [isOpen])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen) return null

  const categories = [...new Set(SHORTCUTS.map(s => s.category))]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div 
        ref={containerRef}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>⌨️</span>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => s.category === category).map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <span className="text-gray-700 text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal
