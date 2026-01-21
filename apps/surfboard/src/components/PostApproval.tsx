'use client'

import { useState, useEffect } from 'react'

interface PendingPost {
  id: string
  account: 'onde' | 'frh' | 'magmatic'
  content: string
  scheduledFor?: string
  status: 'pending' | 'approved' | 'rejected'
}

export function PostApproval() {
  const [posts, setPosts] = useState<PendingPost[]>([])
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  // Fetch pending posts
  useEffect(() => {
    fetchPosts()
    // Poll every 30 seconds for new posts
    const interval = setInterval(fetchPosts, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchPosts() {
    try {
      // Try local approval dashboard first (real data)
      const localRes = await fetch('http://localhost:3400/api/pending', { mode: 'cors' })
      if (localRes.ok) {
        const localData = await localRes.json()
        // Transform to our format
        const transformed = localData.map((p: any) => ({
          id: p.id,
          account: p.account,
          content: p.text,
          scheduledFor: p.createdAt ? new Date(p.createdAt).toLocaleString() : undefined,
          status: p.status
        }))
        setPosts(transformed)
        setLoading(false)
        return
      }
    } catch {
      // Local not available, try our API
    }

    try {
      const res = await fetch('/api/posts/pending')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch {
      // No posts available
      setPosts([])
    }
    setLoading(false)
  }

  async function handleApprove(id: string) {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'approved' } : p))
    // Try local dashboard first (real posting)
    try {
      await fetch(`http://localhost:3400/approve/${id}`, { method: 'POST', mode: 'cors' })
    } catch {
      // Fallback to our API
      await fetch('/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => {})
    }
    // Refresh posts
    setTimeout(fetchPosts, 1000)
  }

  async function handleReject(id: string) {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
    // Try local dashboard first (real posting)
    try {
      await fetch(`http://localhost:3400/reject/${id}`, { method: 'POST', mode: 'cors' })
    } catch {
      // Fallback to our API
      await fetch('/api/posts/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => {})
    }
    // Refresh posts
    setTimeout(fetchPosts, 1000)
  }

  async function handleFeedback(id: string) {
    const text = feedback[id]
    if (!text?.trim()) return

    await fetch('/api/posts/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, feedback: text })
    }).catch(() => {})

    setFeedback({ ...feedback, [id]: '' })
    // Agent will regenerate post based on feedback
    fetchPosts()
  }

  const accountColors = {
    onde: 'text-cyan-400',
    frh: 'text-emerald-400',
    magmatic: 'text-purple-400'
  }

  const accountLabels = {
    onde: '@Onde_FRH',
    frh: '@FreeRiverHouse',
    magmatic: '@magmatic__'
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-white">Post Approval</h2>
          <a
            href="http://localhost:3400"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
          >
            Full Dashboard
          </a>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
          {posts.filter(p => p.status === 'pending').length} pending
        </span>
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-8 text-center">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-white/40 text-sm py-8 text-center">No pending posts</div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {posts.map(post => (
            <div
              key={post.id}
              className={`p-4 rounded-xl border ${
                post.status === 'approved'
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : post.status === 'rejected'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${accountColors[post.account]}`}>
                  {accountLabels[post.account]}
                </span>
                {post.scheduledFor && (
                  <span className="text-xs text-white/40">{post.scheduledFor}</span>
                )}
              </div>

              {/* Content */}
              <p className="text-white/80 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

              {/* Actions */}
              {post.status === 'pending' && (
                <>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Reject
                    </button>
                  </div>

                  {/* Feedback input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Feedback for agent..."
                      value={feedback[post.id] || ''}
                      onChange={e => setFeedback({ ...feedback, [post.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleFeedback(post.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      onClick={() => handleFeedback(post.id)}
                      className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}

              {/* Status badge */}
              {post.status !== 'pending' && (
                <div className={`text-xs ${post.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {post.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
