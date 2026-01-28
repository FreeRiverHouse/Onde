'use client'

export const runtime = 'edge'


import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Types - matching D1 schema
interface Post {
  id: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'posted'
  account: 'onde' | 'frh' | 'magmatic'
  scheduled_for?: string
  media_files?: string[]
  feedback?: string[]
  created_at: string
  approved_at?: string
  posted_at?: string
  post_url?: string
  source?: string
}

// Icons
const XIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XMarkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

// Account colors
const accountColors = {
  onde: { bg: 'from-cyan-500 to-teal-500', border: 'border-cyan-400/30', text: 'text-cyan-400', handle: '@Onde_FRH' },
  frh: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-400/30', text: 'text-purple-400', handle: '@FreeRiverHouse' },
  magmatic: { bg: 'from-amber-500 to-orange-500', border: 'border-amber-400/30', text: 'text-amber-400', handle: '@magmatic__' }
}

// Status styles
const statusStyles = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In attesa' },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approvato' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rifiutato' },
  posted: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Pubblicato' }
}

// Post Card Component
function PostCard({ post, onApprove, onReject, loading }: {
  post: Post
  onApprove: (id: string) => void
  onReject: (id: string) => void
  loading: boolean
}) {
  const account = accountColors[post.account]
  const status = statusStyles[post.status]

  return (
    <div className={`bg-white/5 rounded-2xl border ${account.border} hover:bg-white/10 transition-all duration-300`}>
      {/* Post Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${account.bg} flex items-center justify-center text-white`}>
            <XIcon />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{account.handle}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              {post.scheduled_for && (
                <>
                  <ClockIcon />
                  <span>{post.scheduled_for}</span>
                </>
              )}
              {post.source && <span className="text-white/30">• {post.source}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-white whitespace-pre-line text-[15px] leading-relaxed">
          {post.content}
        </p>

        {/* Media Indicator */}
        {post.media_files && post.media_files.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/60">
            <ImageIcon />
            <span className="text-sm">{post.media_files.length} file allegati</span>
          </div>
        )}

        {/* Feedback */}
        {post.feedback && post.feedback.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs text-amber-400 font-medium">Feedback:</span>
            {post.feedback.map((fb, i) => (
              <p key={i} className="text-sm text-white/70 mt-1">{fb}</p>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-2">
          {post.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(post.id)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <CheckIcon /> Approva
              </button>
              <button
                onClick={() => onReject(post.id)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <XMarkIcon /> Rifiuta
              </button>
            </>
          )}
          {post.status === 'posted' && post.post_url && (
            <a
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              Vedi su X
            </a>
          )}
        </div>
        <span className="text-xs text-white/30">
          {new Date(post.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// Filter Buttons
function FilterButton({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
        active
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
          : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${active ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

export default function SocialDashboard() {
  const { status: authStatus } = useSession()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filterAccount, setFilterAccount] = useState<'all' | 'onde' | 'frh' | 'magmatic'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'posted'>('pending')
  const [dataSource, setDataSource] = useState<string>('')

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      // Use the pending API for pending posts, or could add a general posts API
      const res = await fetch('/api/posts/pending')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        setDataSource(data.source || 'unknown')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchPosts()
    }
  }, [authStatus, fetchPosts])

  // Approve post
  const handleApprove = async (id: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        // Update local state optimistically
        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, status: 'approved' as const, approved_at: new Date().toISOString() } : p
        ))
      }
    } catch (error) {
      console.error('Error approving post:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Reject post
  const handleReject = async (id: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/posts/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, status: 'rejected' as const } : p
        ))
      }
    } catch (error) {
      console.error('Error rejecting post:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (filterAccount !== 'all' && post.account !== filterAccount) return false
    if (filterStatus !== 'all' && post.status !== filterStatus) return false
    return true
  })

  // Counts
  const counts = {
    all: posts.length,
    onde: posts.filter(p => p.account === 'onde').length,
    frh: posts.filter(p => p.account === 'frh').length,
    magmatic: posts.filter(p => p.account === 'magmatic').length,
    pending: posts.filter(p => p.status === 'pending').length,
    approved: posts.filter(p => p.status === 'approved').length,
    posted: posts.filter(p => p.status === 'posted').length
  }

  // Show loading while checking auth
  if (authStatus === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (authStatus === 'unauthenticated') {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white">
              <XIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Social Dashboard</h1>
              <p className="text-white/60">Approva i post per tutti gli account</p>
            </div>
          </div>
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshIcon />
            Aggiorna
          </button>
        </div>

        {/* Data source indicator */}
        {dataSource && (
          <div className="text-xs text-white/30 mb-4">
            Dati da: {dataSource === 'd1' ? 'Cloudflare D1' : dataSource === 'memory' ? 'Memoria locale (dev)' : dataSource}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">{counts.all}</div>
            <div className="text-white/50 text-sm">Post Totali</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{counts.pending}</div>
            <div className="text-white/50 text-sm">In Attesa</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{counts.approved}</div>
            <div className="text-white/50 text-sm">Approvati</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">{counts.posted}</div>
            <div className="text-white/50 text-sm">Pubblicati</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="text-white/50 text-sm py-2">Account:</span>
          <FilterButton active={filterAccount === 'all'} onClick={() => setFilterAccount('all')} count={counts.all}>
            Tutti
          </FilterButton>
          <FilterButton active={filterAccount === 'onde'} onClick={() => setFilterAccount('onde')} count={counts.onde}>
            <span className="text-cyan-400">@Onde_FRH</span>
          </FilterButton>
          <FilterButton active={filterAccount === 'frh'} onClick={() => setFilterAccount('frh')} count={counts.frh}>
            <span className="text-purple-400">@FreeRiverHouse</span>
          </FilterButton>
          <FilterButton active={filterAccount === 'magmatic'} onClick={() => setFilterAccount('magmatic')} count={counts.magmatic}>
            <span className="text-amber-400">@magmatic__</span>
          </FilterButton>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="text-white/50 text-sm py-2">Stato:</span>
          <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
            Tutti
          </FilterButton>
          <FilterButton active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')} count={counts.pending}>
            <span className="text-yellow-400">In Attesa</span>
          </FilterButton>
          <FilterButton active={filterStatus === 'approved'} onClick={() => setFilterStatus('approved')} count={counts.approved}>
            <span className="text-green-400">Approvati</span>
          </FilterButton>
          <FilterButton active={filterStatus === 'posted'} onClick={() => setFilterStatus('posted')} count={counts.posted}>
            <span className="text-cyan-400">Pubblicati</span>
          </FilterButton>
        </div>
      </section>

      {/* Schedule Overview */}
      <section className="mb-8 bg-white/5 rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 Schedule</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="text-cyan-400 font-bold mb-2">@Onde_FRH</div>
            <div className="text-white/60 text-sm">3x/giorno</div>
            <div className="text-white mt-2 font-mono text-lg">8:08 • 11:11 • 22:22</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/20">
            <div className="text-purple-400 font-bold mb-2">@FreeRiverHouse</div>
            <div className="text-white/60 text-sm">3x/giorno</div>
            <div className="text-white mt-2 font-mono text-lg">9:09 • 12:12 • 21:21</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-amber-400 font-bold mb-2">@magmatic__</div>
            <div className="text-white/60 text-sm">1x/giorno</div>
            <div className="text-white mt-2 font-mono text-lg">17:17</div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Post ({filteredPosts.length})
          {loading && <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />}
        </h2>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={actionLoading}
              />
            ))}
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-16 text-white/50">
            {posts.length === 0 ? (
              <div>
                <p className="text-lg mb-2">Nessun post in coda</p>
                <p className="text-sm">I post arrivano dal bot Telegram o dalla dashboard FRH</p>
              </div>
            ) : (
              'Nessun post trovato con questi filtri'
            )}
          </div>
        )}
      </section>
    </div>
  )
}
