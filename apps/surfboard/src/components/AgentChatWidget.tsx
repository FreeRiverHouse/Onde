"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react'

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

interface AgentChatWidgetProps {
  defaultAgent?: string
  agents?: string[]
}

export function AgentChatWidget({ 
  defaultAgent = 'clawdinho',
  agents = ['clawdinho', 'ondinho']
}: AgentChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(defaultAgent)
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ agentId: selectedAgent, limit: '50' })
      if (sessionKey) {
        params.set('sessionKey', sessionKey)
      }
      const res = await fetch(`/api/agent-chat?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setError(null)
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [selectedAgent, sessionKey, scrollToBottom])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [fetchMessages])

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return

    try {
      setSending(true)
      setError(null)
      const body: Record<string, string> = {
        agentId: selectedAgent,
        content,
        senderName: 'Dashboard User',
      }
      if (sessionKey) body.sessionKey = sessionKey

      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      
      // Store session key for conversation continuity
      if (data.sessionKey && !sessionKey) {
        setSessionKey(data.sessionKey)
      }

      setInput('')
      // Refresh messages to show the new one
      await fetchMessages()
      inputRef.current?.focus()
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getAgentEmoji = (agentId: string) => {
    switch (agentId) {
      case 'clawdinho': return '🤖'
      case 'ondinho': return '🌊'
      default: return '🔧'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-yellow-400', label: 'Pending' }
      case 'delivered': return { color: 'text-green-400', label: 'Delivered' }
      case 'read': return { color: 'text-blue-400', label: 'Read' }
      default: return { color: 'text-gray-400', label: status }
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
      return date.toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Agent Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Agent selector */}
          <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
            {agents.map(agent => (
              <button
                key={agent}
                onClick={() => {
                  setSelectedAgent(agent)
                  setSessionKey(null) // Reset session on agent switch
                  setMessages([])
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  selectedAgent === agent
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {getAgentEmoji(agent)} {agent}
              </button>
            ))}
          </div>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-white transition rounded-md hover:bg-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to {selectedAgent}</p>
          </div>
        )}
        
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        )}

        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent'
          const isDashboard = msg.sender === 'dashboard'
          const status = getStatusBadge(msg.status)

          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isDashboard ? 'justify-end' : 'justify-start'}`}
            >
              {isAgent && (
                <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 ${
                  isDashboard
                    ? 'bg-purple-600/40 border border-purple-500/30 text-white'
                    : 'bg-slate-700/60 border border-slate-600/30 text-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                  {isDashboard && (
                    <span className={`text-[10px] ${status.color}`}>{status.label}</span>
                  )}
                </div>
              </div>
              {isDashboard && (
                <div className="w-7 h-7 rounded-full bg-slate-600/30 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50 text-red-300 text-xs shrink-0">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-slate-700 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedAgent}...`}
            disabled={sending}
            className="flex-1 bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded-lg transition flex items-center gap-1"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
