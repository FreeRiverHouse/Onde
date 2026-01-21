"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Command {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  category: 'navigation' | 'action' | 'book' | 'agent'
  shortcut?: string
  action: () => void
}

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const NavigationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ActionIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const AgentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const DeployIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const categoryColors = {
  navigation: 'text-cyan-400',
  action: 'text-amber-400',
  book: 'text-purple-400',
  agent: 'text-emerald-400'
}

const categoryLabels = {
  navigation: 'Navigation',
  action: 'Actions',
  book: 'Books',
  agent: 'Agents'
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const commands: Command[] = [
    // Navigation
    { id: 'nav-dashboard', title: 'Go to Dashboard', description: 'Main control panel', icon: <NavigationIcon />, category: 'navigation', shortcut: 'G D', action: () => router.push('/') },
    { id: 'nav-social', title: 'Go to Social', description: 'Social media management', icon: <NavigationIcon />, category: 'navigation', shortcut: 'G S', action: () => router.push('/social') },
    { id: 'nav-corde', title: 'Go to CORDE', description: 'Content generation', icon: <NavigationIcon />, category: 'navigation', shortcut: 'G C', action: () => router.push('/corde') },

    // Actions
    { id: 'action-deploy', title: 'Deploy onde.surf', description: 'Deploy to production', icon: <DeployIcon />, category: 'action', action: () => { alert('Deploying onde.surf...'); setIsOpen(false) } },
    { id: 'action-deploy-portal', title: 'Deploy onde.la', description: 'Deploy portal to production', icon: <DeployIcon />, category: 'action', action: () => { alert('Deploying onde.la...'); setIsOpen(false) } },
    { id: 'action-generate-image', title: 'Generate Image', description: 'Open Grok image generator', icon: <ImageIcon />, category: 'action', action: () => { window.open('https://x.com/i/grok', '_blank'); setIsOpen(false) } },
    { id: 'action-new-post', title: 'Create New Post', description: 'Draft a new social post', icon: <ActionIcon />, category: 'action', action: () => { alert('Opening post editor...'); setIsOpen(false) } },

    // Books
    { id: 'book-milo', title: 'MILO Internet', description: 'AI explained for kids', icon: <BookIcon />, category: 'book', action: () => { alert('Opening MILO book...'); setIsOpen(false) } },
    { id: 'book-piccole-rime', title: 'Piccole Rime', description: 'Italian poetry collection', icon: <BookIcon />, category: 'book', action: () => { alert('Opening Piccole Rime...'); setIsOpen(false) } },
    { id: 'book-salmo', title: 'Salmo 23 per Bambini', description: 'Illustrated psalm for kids', icon: <BookIcon />, category: 'book', action: () => { alert('Opening Salmo 23...'); setIsOpen(false) } },

    // Agents
    { id: 'agent-ceo', title: 'CEO Orchestrator', description: 'Project coordination', icon: <AgentIcon />, category: 'agent', action: () => { alert('Connecting to CEO Agent...'); setIsOpen(false) } },
    { id: 'agent-eng', title: 'Engineering Manager', description: 'Development tasks', icon: <AgentIcon />, category: 'agent', action: () => { alert('Connecting to Engineering Agent...'); setIsOpen(false) } },
    { id: 'agent-qa', title: 'QA Engineer', description: 'Testing and quality', icon: <AgentIcon />, category: 'agent', action: () => { alert('Connecting to QA Agent...'); setIsOpen(false) } },
    { id: 'agent-gianni', title: 'Gianni Parola', description: 'Writing and content', icon: <AgentIcon />, category: 'agent', action: () => { alert('Connecting to Gianni Parola...'); setIsOpen(false) } },
  ]

  const filteredCommands = query
    ? commands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  const flatCommands = Object.values(groupedCommands).flat()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Handle navigation within palette
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % flatCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatCommands[selectedIndex]) {
        flatCommands[selectedIndex].action()
        setIsOpen(false)
        setQuery('')
      }
    }
  }, [flatCommands, selectedIndex])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white/60 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all shadow-lg group"
      >
        <SearchIcon />
        <span className="text-sm hidden sm:inline">Search</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/10 group-hover:bg-white/15">
          <span className="text-xs">Cmd</span>
          <span>K</span>
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setIsOpen(false)
          setQuery('')
        }}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNavigation}
            placeholder="Search commands, books, agents..."
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
          />
          <kbd className="px-2 py-1 text-xs bg-white/10 text-white/40 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedCommands).length === 0 ? (
            <div className="px-4 py-8 text-center text-white/40">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="py-2">
                <div className={`px-4 py-1 text-xs font-medium uppercase tracking-wider ${categoryColors[category as keyof typeof categoryColors]}`}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>
                {cmds.map((cmd) => {
                  const globalIndex = flatCommands.findIndex(c => c.id === cmd.id)
                  const isSelected = globalIndex === selectedIndex

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action()
                        setIsOpen(false)
                        setQuery('')
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-white/40'}`}>
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium">{cmd.title}</div>
                        {cmd.description && (
                          <div className="text-xs text-white/40 truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div className="flex items-center gap-1">
                          {cmd.shortcut.split(' ').map((key, i) => (
                            <kbd key={i} className="px-1.5 py-0.5 text-xs bg-white/10 text-white/40 rounded border border-white/10">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isSelected && (
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded">Enter</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded">ArrowUp/ArrowDown</kbd> to navigate
            </span>
          </div>
          <span>onde.surf command palette</span>
        </div>
      </div>
    </div>
  )
}
