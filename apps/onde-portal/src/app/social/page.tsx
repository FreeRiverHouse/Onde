'use client'

import { useState, useEffect } from 'react'

const CORRECT_PASSWORD = 'Ond333!'

interface Post {
  id: string
  day: string
  time: string
  text: string
  author: string
  imagePrompt: string
  status: 'draft' | 'approved' | 'posted'
}

// Sample posts - will be replaced with actual calendar
const samplePosts: Post[] = [
  {
    id: '1',
    day: 'Monday',
    time: '8:08',
    text: '"Waste no more time arguing what a good man should be. Be one."\n\n— Marcus Aurelius',
    author: 'Marcus Aurelius',
    imagePrompt: 'Roman emperor writing by candlelight in tent, warm amber glow, contemplative, watercolor style, 4k',
    status: 'draft'
  },
  {
    id: '2',
    day: 'Monday',
    time: '11:11',
    text: 'Seneca had everything. Money, power, influence.\n\nStill spent his nights writing about how short life is.\n\nMakes you wonder.',
    author: 'Seneca',
    imagePrompt: 'Ancient Roman study at night, oil lamp, scrolls on desk, warm golden light, watercolor, 4k',
    status: 'draft'
  },
  {
    id: '3',
    day: 'Monday',
    time: '22:22',
    text: '"Hope is the thing with feathers\nThat perches in the soul"\n\n— Emily Dickinson\n\nShe wrote this in her room. Never published it herself.',
    author: 'Emily Dickinson',
    imagePrompt: 'Small bird on windowsill, soft morning light, delicate watercolor, warm tones, contemplative mood, 4k',
    status: 'draft'
  }
]

export default function SocialDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<Post[]>(samplePosts)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onde_social_auth')
    if (saved === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('onde_social_auth', 'true')
      setError('')
    } else {
      setError('Password non corretta')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('onde_social_auth')
  }

  const approvePost = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'approved' as const } : p))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'posted': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-gray-900 mb-2">Onde Social</h1>
            <p className="text-gray-500">Dashboard gestione post</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Inserisci password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif text-gray-900">Onde Social Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">@Onde_FRH</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-amber-600">{posts.filter(p => p.status === 'draft').length}</p>
            <p className="text-sm text-gray-500">Bozze</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-green-600">{posts.filter(p => p.status === 'approved').length}</p>
            <p className="text-sm text-gray-500">Approvati</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{posts.filter(p => p.status === 'posted').length}</p>
            <p className="text-sm text-gray-500">Pubblicati</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-serif text-gray-900">Calendario Post</h2>
            <p className="text-sm text-gray-500">3 post al giorno: 8:08, 11:11, 22:22</p>
          </div>

          <div className="divide-y">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-6 hover:bg-amber-50 cursor-pointer transition"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{post.day}</span>
                    <span className="text-amber-600 font-mono">{post.time}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{post.author}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line line-clamp-3">{post.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-serif">{selectedPost.day} @ {selectedPost.time}</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Post Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Testo Post</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-line">{selectedPost.text}</p>
                  </div>
                </div>

                {/* Image Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Prompt Immagine</label>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-amber-800 font-mono text-sm">{selectedPost.imagePrompt}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedPost.status === 'draft' && (
                    <button
                      onClick={() => {
                        approvePost(selectedPost.id)
                        setSelectedPost({ ...selectedPost, status: 'approved' })
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Approva
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
