"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ============================================
// TYPES
// ============================================
interface ChatMessage {
  id: string
  session_key: string
  agent_id: string
  sender: string
  sender_name: string | null
  content: string
  status: string
  created_at: string
  delivered_at: string | null
  read_at: string | null
  metadata: string | null
}

interface Agent {
  id: string
  name: string
  emoji: string
  color: string
  description: string
}

// ============================================
// AGENTS CONFIG
// ============================================
const AGENTS: Agent[] = [
  { id: 'ondinho', name: 'Ondinho', emoji: '🌊', color: 'cyan', description: 'M4 Mac • Web, deploy, API' },
  { id: 'clawdinho', name: 'Clawdinho', emoji: '🤖', color: 'purple', description: 'M1 Mac + Radeon • GPU, ML, trading' },
]

// ============================================
// HELPERS
// ============================================
function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) {
      const h = Math.floor(diffMins / 60)
      return `${h}h ago`
    }
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + 
           ' ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

function formatTimeFull(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('it-IT', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    })
  } catch {
    return dateStr
  }
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'sending': return { icon: '⏳', label: 'Sending...', color: 'text-yellow-400' }
    case 'pending': return { icon: '📤', label: 'In queue', color: 'text-amber-400' }
    case 'delivered': return { icon: '✅', label: 'Delivered', color: 'text-green-400' }
    case 'read': return { icon: '👁️', label: 'Read', color: 'text-blue-400' }
    default: return { icon: '•', label: status, color: 'text-white/30' }
  }
}

// ============================================
// MAIN CHAT PAGE
// ============================================
export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch messages
  const fetchMessages = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      const params = new URLSearchParams({ agentId: selectedAgent.id, limit: '100' })
      if (sessionKey) params.set('sessionKey', sessionKey)
      
      const res = await fetch(`/api/agent-chat?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const data = await res.json()
      const newMessages = data.messages || []
      
      // Only update if messages changed
      setMessages(prev => {
        if (JSON.stringify(prev.map(m => m.id)) !== JSON.stringify(newMessages.map((m: ChatMessage) => m.id))) {
          setTimeout(scrollToBottom, 100)
          return newMessages
        }
        return prev
      })
      
      // Set session key from messages
      if (newMessages.length > 0 && !sessionKey) {
        setSessionKey(newMessages[newMessages.length - 1].session_key)
      }
      
      setError(null)
    } catch (err) {
      console.error('Fetch failed:', err)
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }, [selectedAgent.id, sessionKey, scrollToBottom])

  // Initial load + polling
  useEffect(() => {
    fetchMessages(true)
    
    // Poll every 5 seconds for faster response visibility
    pollRef.current = setInterval(() => fetchMessages(false), 5000)
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchMessages])

  // Send message
  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setError(null)
    setInput('')

    // Optimistic message
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_key: sessionKey || '',
      agent_id: selectedAgent.id,
      sender: 'dashboard',
      sender_name: 'Mattia',
      content,
      status: 'sending',
      created_at: new Date().toISOString(),
      delivered_at: null,
      read_at: null,
      metadata: null,
    }
    setMessages(prev => [...prev, optimisticMsg])
    setTimeout(scrollToBottom, 50)

    try {
      const body: Record<string, unknown> = {
        agentId: selectedAgent.id,
        content,
        senderName: 'Mattia (Dashboard)',
        metadata: { source: 'chat-page' },
      }
      if (sessionKey) body.sessionKey = sessionKey

      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (data.sessionKey && !sessionKey) {
        setSessionKey(data.sessionKey)
      }

      // Update optimistic message status
      setMessages(prev => prev.map(m => 
        m.id === optimisticMsg.id ? { ...m, id: data.messageId || m.id, status: 'pending' } : m
      ))

      // Fetch fresh data after a moment
      setTimeout(() => fetchMessages(false), 1000)
      inputRef.current?.focus()
    } catch (err) {
      console.error('Send failed:', err)
      setError('Failed to send')
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setInput(content) // Restore input
    } finally {
      setSending(false)
    }
  }

  // Switch agent
  const switchAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setSessionKey(null)
    setMessages([])
    setError(null)
  }

  // Handle textarea enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const agentColor = selectedAgent.color === 'cyan' ? 'cyan' : 'purple'

  return (
    <div className="h-screen flex bg-[#0a0a0f] text-white overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/10 bg-white/[0.02] flex flex-col overflow-hidden`}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">💬</span>
            Agent Chat
          </h1>
          <p className="text-xs text-white/40 mt-1">Talk to your AI agents</p>
        </div>

        {/* Agent list */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-white/30 px-2 mb-2">Agents</div>
          {AGENTS.map(agent => {
            const isSelected = selectedAgent.id === agent.id
            const colorClasses = agent.color === 'cyan' 
              ? 'border-cyan-500/50 bg-cyan-500/10' 
              : 'border-purple-500/50 bg-purple-500/10'
            const hoverClasses = agent.color === 'cyan'
              ? 'hover:border-cyan-500/30 hover:bg-cyan-500/5'
              : 'hover:border-purple-500/30 hover:bg-purple-500/5'
            
            return (
              <button
                key={agent.id}
                onClick={() => switchAgent(agent)}
                className={`w-full p-3 rounded-xl border transition-all text-left ${
                  isSelected 
                    ? colorClasses
                    : `border-white/5 bg-white/[0.02] ${hoverClasses}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{agent.name}</div>
                    <div className="text-[10px] text-white/40">{agent.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="text-[10px] text-white/20 text-center">
            Messages are queued and picked up by agents via heartbeat (~2-5 min)
          </div>
        </div>
      </aside>

      {/* ===== MAIN CHAT AREA ===== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/50 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <span className="text-2xl">{selectedAgent.emoji}</span>
            <div>
              <h2 className="text-sm font-semibold">{selectedAgent.name}</h2>
              <p className="text-[10px] text-white/40">{selectedAgent.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">Polling</span>
            </div>
            
            {/* Refresh */}
            <button
              onClick={() => fetchMessages(true)}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-white/10 transition text-white/50 hover:text-white disabled:opacity-50"
              title="Refresh"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Message count */}
            <span className="text-[10px] text-white/30">{messages.length} msgs</span>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {/* Empty state */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-6xl mb-4">{selectedAgent.emoji}</span>
                <h3 className="text-lg font-semibold text-white/70 mb-2">
                  Chat with {selectedAgent.name}
                </h3>
                <p className="text-sm text-white/40 max-w-sm">
                  Send a message below. Your agent will receive it on the next heartbeat (typically 2-5 minutes).
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && messages.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-white/40">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading messages...
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'dashboard'
              const status = getStatusInfo(msg.status)
              
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                    isUser 
                      ? 'bg-white/10' 
                      : agentColor === 'cyan' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                  }`}>
                    {isUser ? '👤' : selectedAgent.emoji}
                  </div>

                  {/* Message bubble */}
                  <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Sender name + time */}
                    <div className={`flex items-center gap-2 mb-1 text-[10px] text-white/30 ${isUser ? 'justify-end' : ''}`}>
                      <span>{isUser ? 'You' : selectedAgent.name}</span>
                      <span>•</span>
                      <span title={formatTimeFull(msg.created_at)}>{formatTime(msg.created_at)}</span>
                      {isUser && (
                        <span className={status.color} title={status.label}>
                          {status.icon}
                        </span>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? agentColor === 'cyan' 
                          ? 'bg-cyan-600/20 border border-cyan-500/20 text-cyan-100'
                          : 'bg-purple-600/20 border border-purple-500/20 text-purple-100'
                        : 'bg-white/[0.06] border border-white/10 text-white/80'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error bar */}
        {error && (
          <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/30 flex items-center justify-between shrink-0">
            <span className="text-xs text-red-300">⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-red-300">dismiss</button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/10 bg-white/[0.02] shrink-0">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className={`flex gap-3 items-end rounded-2xl border ${
              agentColor === 'cyan' 
                ? 'border-cyan-500/20 focus-within:border-cyan-500/40' 
                : 'border-purple-500/20 focus-within:border-purple-500/40'
            } bg-white/[0.03] px-4 py-3 transition-colors`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedAgent.name}...`}
                disabled={sending}
                rows={1}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 resize-none outline-none disabled:opacity-50"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className={`p-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  agentColor === 'cyan'
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {sending ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-white/20 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line • Agents respond within ~2-5 min
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
