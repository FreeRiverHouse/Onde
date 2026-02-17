'use client'

export const runtime = 'edge'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageSquare, Users, ChevronLeft, Check, CheckCheck, Clock, Loader2 } from 'lucide-react'

// ── Agent config ──────────────────────────────────────────────────────
interface Agent {
  id: string
  name: string
  emoji: string
  description: string
  color: string
  glowColor: string
}

const AGENTS: Agent[] = [
  { id: 'clawdinho', name: 'Clawdinho', emoji: '🔵', description: 'Main AI assistant', color: 'text-blue-400', glowColor: 'shadow-blue-500/20' },
  { id: 'ondinho', name: 'Ondinho', emoji: '🟢', description: 'Publishing agent', color: 'text-emerald-400', glowColor: 'shadow-emerald-500/20' },
  { id: 'bubble', name: 'Bubble', emoji: '🫧', description: 'Social agent', color: 'text-purple-400', glowColor: 'shadow-purple-500/20' },
]

const ALL_AGENTS_OPTION = { id: '__all__', name: 'All Agents', emoji: '👥', description: 'Group chat', color: 'text-surf-aqua', glowColor: 'shadow-cyan-500/20' }

// ── Types ─────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string
  session_key: string
  agent_id: string
  sender: 'dashboard' | 'agent'
  sender_name: string | null
  content: string
  status: string
  created_at: string
  delivered_at: string | null
  read_at: string | null
  metadata: string | null
}

// ── Typing indicator ──────────────────────────────────────────────────
function TypingIndicator({ agentName, emoji }: { agentName: string; emoji: string }) {
  return (
    <div className="flex items-end gap-3 max-w-[85%]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm">
        {emoji}
      </div>
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-white/30 ml-2">{agentName} is typing</span>
        </div>
      </div>
    </div>
  )
}

// ── Status icon ───────────────────────────────────────────────────────
function MessageStatus({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Clock className="w-3 h-3 text-white/30" />
    case 'delivered':
      return <Check className="w-3 h-3 text-surf-aqua/60" />
    case 'read':
      return <CheckCheck className="w-3 h-3 text-surf-aqua" />
    default:
      return <Check className="w-3 h-3 text-white/20" />
  }
}

// ── Time formatting ───────────────────────────────────────────────────
function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// ── Date separator ────────────────────────────────────────────────────
function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function shouldShowDateSeparator(messages: ChatMessage[], index: number): boolean {
  if (index === 0) return true
  const prev = new Date(messages[index - 1].created_at).toDateString()
  const curr = new Date(messages[index].created_at).toDateString()
  return prev !== curr
}

// ── Empty state ───────────────────────────────────────────────────────
function EmptyState({ agentName, emoji }: { agentName: string; emoji: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4 px-6">
        <div className="text-6xl mb-2">{emoji}</div>
        <h3 className="text-xl font-semibold text-white">Start a conversation</h3>
        <p className="text-white/40 text-sm max-w-sm">
          Send a message to {agentName}. Messages are queued and picked up by the agent during heartbeat cycles.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-white/25 mt-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse" />
          <span>Agent is online</span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// MAIN CHAT PAGE
// ══════════════════════════════════════════════════════════════════════
export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('clawdinho')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)

  const currentAgent = selectedAgent === '__all__'
    ? ALL_AGENTS_OPTION
    : AGENTS.find(a => a.id === selectedAgent) || AGENTS[0]

  // ── Fetch messages ────────────────────────────────────────────────
  const fetchMessages = useCallback(async (isPolling = false) => {
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (selectedAgent !== '__all__') {
        params.set('agentId', selectedAgent)
      }

      const res = await fetch(`/api/agent-chat?${params}`)
      if (!res.ok) return

      const data = await res.json()
      const newMessages: ChatMessage[] = data.messages || []

      setMessages(newMessages)

      // Clear pending status for delivered messages
      setPendingMessages(prev => {
        const next = new Set(prev)
        newMessages.forEach((m: ChatMessage) => {
          if (m.status !== 'pending') next.delete(m.id)
        })
        return next
      })

      // Auto-scroll if new messages arrived or first load
      if (!isPolling || newMessages.length !== lastMessageCountRef.current) {
        lastMessageCountRef.current = newMessages.length
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: isPolling ? 'smooth' : 'auto' }), 50)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      if (!isPolling) setLoading(false)
    }
  }, [selectedAgent])

  // Initial fetch + polling
  useEffect(() => {
    setLoading(true)
    setMessages([])
    lastMessageCountRef.current = 0
    fetchMessages(false)

    const interval = setInterval(() => fetchMessages(true), 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Focus input on agent change
  useEffect(() => {
    inputRef.current?.focus()
  }, [selectedAgent])

  // ── Send message ──────────────────────────────────────────────────
  const sendMessage = async () => {
    const content = inputValue.trim()
    if (!content || sending || selectedAgent === '__all__') return

    setSending(true)
    setInputValue('')

    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          content,
          senderName: 'Mattia',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Optimistic update
        const optimistic: ChatMessage = {
          id: data.messageId,
          session_key: data.sessionKey,
          agent_id: selectedAgent,
          sender: 'dashboard',
          sender_name: 'Mattia',
          content,
          status: 'pending',
          created_at: new Date().toISOString(),
          delivered_at: null,
          read_at: null,
          metadata: null,
        }
        setMessages(prev => [...prev, optimistic])
        setPendingMessages(prev => new Set(prev).add(data.messageId))
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch (err) {
      console.error('Failed to send:', err)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Agent emoji helper ────────────────────────────────────────────
  const getAgentEmoji = (agentId: string) => {
    return AGENTS.find(a => a.id === agentId)?.emoji || '🤖'
  }

  const getAgentColor = (agentId: string) => {
    return AGENTS.find(a => a.id === agentId)?.color || 'text-white/70'
  }

  // ── Check if there are recent pending messages (show typing) ──────
  const hasPendingFromUser = messages.some(
    m => m.sender === 'dashboard' && m.status === 'pending' && selectedAgent !== '__all__'
  )

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/20">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div className={`
          ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
          md:w-72 flex-shrink-0 border-r border-white/[0.06]
          bg-white/[0.02] transition-all duration-300 flex flex-col
          ${sidebarOpen ? 'absolute md:relative z-20 h-full' : 'md:relative'}
        `}>
          {/* Sidebar header */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-surf-aqua" />
                <h2 className="font-semibold text-white text-sm">Agent Chat</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-white/30 mt-1">Chat with your AI agents</p>
          </div>

          {/* Agent list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* All agents group */}
            <button
              onClick={() => { setSelectedAgent('__all__'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                selectedAgent === '__all__'
                  ? 'bg-white/[0.08] border border-white/[0.1] shadow-lg shadow-cyan-500/5'
                  : 'hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center text-lg">
                <Users className="w-5 h-5 text-surf-aqua" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">All Agents</div>
                <div className="text-[11px] text-white/30 truncate">View all messages</div>
              </div>
            </button>

            <div className="h-px bg-white/[0.04] my-2" />

            {/* Individual agents */}
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => { setSelectedAgent(agent.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  selectedAgent === agent.id
                    ? 'bg-white/[0.08] border border-white/[0.1] shadow-lg ' + agent.glowColor
                    : 'hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-lg">
                    {agent.emoji}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0f1a]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${selectedAgent === agent.id ? agent.color : 'text-white'}`}>
                    {agent.name}
                  </div>
                  <div className="text-[11px] text-white/30 truncate">{agent.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-white/25">3 agents online</span>
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-base">
              {currentAgent.emoji === '👥' ? <Users className="w-4 h-4 text-surf-aqua" /> : currentAgent.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${currentAgent.color}`}>{currentAgent.name}</h3>
              <p className="text-[11px] text-white/30">{currentAgent.description}</p>
            </div>
            {selectedAgent !== '__all__' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">Online</span>
              </div>
            )}
          </div>

          {/* Messages area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {loading ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 text-surf-aqua animate-spin" />
                  <span className="text-xs text-white/30">Loading messages…</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <EmptyState agentName={currentAgent.name} emoji={currentAgent.emoji === '👥' ? '💬' : currentAgent.emoji} />
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'dashboard'
                  const agentEmoji = getAgentEmoji(msg.agent_id)
                  const agentColor = getAgentColor(msg.agent_id)
                  const showDate = shouldShowDateSeparator(messages, idx)

                  return (
                    <div key={msg.id}>
                      {/* Date separator */}
                      {showDate && (
                        <div className="flex items-center gap-3 my-6">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider">
                            {formatDateSeparator(msg.created_at)}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {/* Agent avatar (left) */}
                        {!isUser && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm">
                            {agentEmoji}
                          </div>
                        )}

                        <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          {/* Sender name (for agent messages or in "all" view) */}
                          {!isUser && (
                            <span className={`text-[11px] font-medium ${agentColor} ml-1`}>
                              {msg.sender_name || msg.agent_id}
                            </span>
                          )}

                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                              isUser
                                ? 'bg-gradient-to-br from-surf-cyan/20 to-surf-teal/20 border border-surf-cyan/20 text-white rounded-2xl rounded-br-md'
                                : 'bg-white/[0.04] border border-white/[0.06] text-white/90 rounded-2xl rounded-bl-md'
                            }`}
                          >
                            {msg.content}
                          </div>

                          {/* Timestamp + status */}
                          <div className={`flex items-center gap-1.5 ${isUser ? 'justify-end' : 'justify-start'} px-1`}>
                            <span className="text-[10px] text-white/20">{formatTime(msg.created_at)}</span>
                            {isUser && <MessageStatus status={msg.status} />}
                          </div>
                        </div>

                        {/* User avatar (right) */}
                        {isUser && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-surf-cyan/30 to-surf-teal/30 border border-surf-cyan/20 flex items-center justify-center text-sm">
                            👤
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {hasPendingFromUser && (
                  <TypingIndicator agentName={currentAgent.name} emoji={currentAgent.emoji === '👥' ? '🤖' : currentAgent.emoji} />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ──────────────────────────────────────────── */}
          <div className="border-t border-white/[0.06] bg-white/[0.02] p-4">
            {selectedAgent === '__all__' ? (
              <div className="text-center text-white/30 text-sm py-2">
                Select an agent to send a message
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${currentAgent.name}…`}
                    rows={1}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-surf-cyan/30 focus:ring-1 focus:ring-surf-cyan/20 transition-all max-h-32"
                    style={{ minHeight: '44px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || sending}
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    inputValue.trim() && !sending
                      ? 'bg-gradient-to-br from-surf-cyan to-surf-teal text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95'
                      : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
