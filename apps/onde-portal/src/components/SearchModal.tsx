'use client'

import { useEffect, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSearch, SearchResult } from '@/hooks/useSearch'

interface SearchModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function SearchModal({ isOpen: externalIsOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    query,
    setQuery,
    isOpen: internalIsOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    results,
    recentSearches,
    mounted,
    close,
    handleKeyDown: baseHandleKeyDown,
    saveRecentSearch,
    clearRecentSearches,
  } = useSearch()

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const handleClose = onClose || close

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navigateToResult = (result: SearchResult) => {
    saveRecentSearch(query)
    handleClose()
    router.push(result.href)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const result = baseHandleKeyDown(e)
    if (result) {
      navigateToResult(result)
    }
  }

  const handleRecentClick = (recentQuery: string) => {
    setQuery(recentQuery)
  }

  // Don't render until client is mounted to avoid hydration issues
  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-onde-ocean/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-[15%] z-[101] mx-auto max-w-2xl"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-onde-ocean/20 border border-onde-ocean/10">
              {/* Search Input */}
              <div className="flex items-center border-b border-onde-ocean/10 px-4">
                <svg
                  className="w-5 h-5 text-onde-ocean/40 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search books, games..."
                  className="flex-1 py-4 px-3 text-lg text-onde-ocean placeholder-onde-ocean/40 
                             bg-transparent border-none outline-none focus:ring-0"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium 
                                text-onde-ocean/40 bg-onde-cream rounded-md border border-onde-ocean/10">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {/* Recent Searches */}
                {query === '' && recentSearches.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-onde-ocean/50 uppercase tracking-wider">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-onde-coral hover:text-onde-coral-dark transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((recent, index) => (
                        <button
                          key={`${recent.query}-${recent.timestamp}`}
                          onClick={() => handleRecentClick(recent.query)}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left
                                     text-onde-ocean/70 hover:bg-onde-cream transition-colors group"
                        >
                          <svg
                            className="w-4 h-4 text-onde-ocean/30 group-hover:text-onde-ocean/50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm">{recent.query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {query !== '' && results.length > 0 && (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <SearchResultItem
                        key={`${result.type}-${result.id}`}
                        result={result}
                        isSelected={index === selectedIndex}
                        onClick={() => navigateToResult(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      />
                    ))}
                  </div>
                )}

                {/* No Results */}
                {query !== '' && results.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-onde-ocean/60 font-medium">
                      No results for &quot;{query}&quot;
                    </p>
                    <p className="text-sm text-onde-ocean/40 mt-1">
                      Try searching for something else
                    </p>
                  </div>
                )}

                {/* Empty State */}
                {query === '' && recentSearches.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-onde-ocean/60 font-medium">
                      Start typing to search
                    </p>
                    <p className="text-sm text-onde-ocean/40 mt-1">
                      Find books and games
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-onde-ocean/10 bg-onde-cream/50">
                <div className="flex items-center gap-4 text-xs text-onde-ocean/40">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-onde-ocean/10 font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-onde-ocean/10 font-mono">↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-onde-ocean/10 font-mono">↵</kbd>
                    <span className="ml-1">Open</span>
                  </span>
                </div>
                <div className="text-xs text-onde-ocean/40">
                  <span className="font-medium text-onde-coral">{results.length}</span> results
                </div>
              </div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

function SearchResultItem({ result, isSelected, onClick, onMouseEnter }: SearchResultItemProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl text-left transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-r from-onde-coral/10 to-onde-gold/10 shadow-sm' 
                    : 'hover:bg-onde-cream'
                  }`}
    >
      {/* Icon/Cover */}
      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl
                       ${result.type === 'book' 
                         ? 'bg-amber-100' 
                         : 'bg-purple-100'}`}>
        {result.type === 'book' ? '📖' : result.emoji || '🎮'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${isSelected ? 'text-onde-ocean' : 'text-onde-ocean/80'}`}>
            {result.title}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0
                           ${result.type === 'book' 
                             ? 'bg-amber-100 text-amber-700' 
                             : 'bg-purple-100 text-purple-700'}`}>
            {result.type === 'book' ? 'Book' : 'Game'}
          </span>
        </div>
        <p className="text-sm text-onde-ocean/50 truncate">
          {result.subtitle}
        </p>
      </div>

      {/* Arrow indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="shrink-0 text-onde-coral"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}
    </button>
  )
}

// Export a hook to control the search modal from anywhere
export function useSearchModal() {
  const { open, close, isOpen, setIsOpen } = useSearch()
  return { open, close, isOpen, setIsOpen }
}
