'use client'

import { useState, useEffect } from 'react'

const CORRECT_PASSWORD = 'Ond333!'

interface Post {
  id: string
  day: number
  philosopher: string
  time: string
  text: string
  imagePrompt: string
  status: 'draft' | 'approved' | 'posted'
}

// Full 21 posts from Grok - 7 days x 3 posts/day
const stoicCalendar = {
  days: [
    {
      day: 1,
      philosopher: "Zeno of Citium",
      imagePrompt: "An ancient Greek philosopher standing thoughtfully under a olive tree in Athens, with subtle symbols of nature like flowing water and mountains in the background, in a vintage illustrated book style, 4k",
      posts: [
        { id: "d1p1", time: "8:08", text: "Zeno, the founder of Stoicism, had this gem: \"We have two ears and one mouth, so we should listen more than we say.\" It's so simple, but damn, it's hard to live by. I've been trying to shut up more in conversations lately, and it's amazing how much you learn when you're not always talking. Feels like a quiet revolution in my daily chats." },
        { id: "d1p2", time: "11:11", text: "Back in ancient Athens, Zeno taught that \"Man conquers the world by conquering himself.\" Hits home for me—I've spent too much time blaming external stuff for my frustrations. Lately, focusing on self-control has turned some tough days around. It's not easy, but it's empowering, you know?" },
        { id: "d1p3", time: "22:22", text: "Zeno believed, \"All things are parts of one single system, which is called nature; the individual life is good when it is in harmony with nature.\" I love this—reminds me to stop fighting the flow and just align with what's real. Been applying it to my routines, and life's a bit smoother, less forced." }
      ]
    },
    {
      day: 2,
      philosopher: "Cleanthes",
      imagePrompt: "A muscular ancient figure in simple robes, gazing at a stormy sky with lightning representing Zeus, surrounded by elements of fate like threads or a wheel, in a dramatic classical engraving aesthetic, 4k",
      posts: [
        { id: "d2p1", time: "8:08", text: "Cleanthes, Zeno's successor, said, \"He needs little who desires but little.\" Such a straightforward punch to consumerism. I've been decluttering my wants lately, and it's freeing—less stuff, more peace. Who knew a boxer-turned-philosopher could nail modern life so well?" },
        { id: "d2p2", time: "11:11", text: "In his hymn, Cleanthes wrote, \"Lead me, O Zeus, and thou, O Destiny.\" It's about surrendering to fate without resistance. I've leaned on this during uncertain times, like job shifts—going with it instead of pushing back. Makes the ride less bumpy, honestly." },
        { id: "d2p3", time: "22:22", text: "Cleanthes nailed it: \"The Fates lead the willing, but drag the unwilling.\" Resistance just wears you out, right? I've caught myself fighting changes that were inevitable, and switching to acceptance has saved so much energy. Simple wisdom from a guy who worked nights to philosophize." }
      ]
    },
    {
      day: 3,
      philosopher: "Chrysippus",
      imagePrompt: "A scholarly ancient Greek man at a desk piled with scrolls, deep in thought with geometric logic symbols floating around him, illustrated in a timeless woodcut print style, 4k",
      posts: [
        { id: "d3p1", time: "8:08", text: "Chrysippus, the logic master of Stoicism, said, \"If I had followed the multitude, I should not have studied philosophy.\" Love this rebel vibe—don't just go with the crowd. I've skipped trendy opinions to dig deeper, and it's led to better decisions. Feels authentic, not performative." },
        { id: "d3p2", time: "11:11", text: "According to Chrysippus, \"Wise people are in want of nothing, and yet need many things. On the other hand, nothing is needed by fools, for they do not understand how to use anything.\" Tricky, but true—wisdom's about using what you have right. Been reflecting on that with my daily habits, cutting waste." },
        { id: "d3p3", time: "22:22", text: "Chrysippus taught, \"Living virtuously is equal to living in accordance with one's experience of the actual course of nature.\" Aligning actions with reality, not wishes. It's helped me drop illusions about control—now I adapt more, stress less. Guy wrote volumes, but this sticks." }
      ]
    },
    {
      day: 4,
      philosopher: "Musonius Rufus",
      imagePrompt: "A wise Roman philosopher in modest attire, sharing a simple meal outdoors with students, evoking everyday virtue and restraint, in a soft watercolor book illustration, 4k",
      posts: [
        { id: "d4p1", time: "8:08", text: "Musonius Rufus, Epictetus's mentor, advised, \"You will earn the respect of all if you begin by earning the respect of yourself.\" Starts from within, huh? I've been working on self-compassion instead of seeking approval—it's shifted how I carry myself, more grounded." },
        { id: "d4p2", time: "11:11", text: "Rufus said, \"If you accomplish something good with hard work, the labor passes quickly, but the good endures.\" So true for tough projects— the grind fades, but the result stays. Pushed through a recent challenge with this in mind, and yeah, the payoff lingers." },
        { id: "d4p3", time: "22:22", text: "Practical as ever, Musonius Rufus noted, \"We should eat to live, not live to eat.\" Keeps indulgence in check. I've dialed back on comfort eating, focusing on fuel instead—feels better physically and mentally. Simple advice from a no-nonsense teacher." }
      ]
    },
    {
      day: 5,
      philosopher: "Epictetus",
      imagePrompt: "An ancient man with a crutch, symbolizing his enslaved past, sitting calmly in a marketplace teaching, with chains breaking into birds for freedom, in an inspirational etched art style, 4k",
      posts: [
        { id: "d5p1", time: "8:08", text: "Epictetus reminded us, \"There is only one way to happiness and that is to cease worrying about things which are beyond the power of our will.\" Game-changer for anxiety. I've been letting go of what I can't control, like others' opinions—more space for joy now." },
        { id: "d5p2", time: "11:11", text: "\"Don't explain your philosophy. Embody it,\" said Epictetus. Walk the talk, basically. I've stopped preaching and started living the principles—quiet actions speak louder. Born enslaved, but his mind was free; inspires me to do the same." },
        { id: "d5p3", time: "22:22", text: "Epictetus put it plainly: \"It's not what happens to you, but how you react to it that matters.\" Perspective shift! Used this after a setback recently—reframed it as a lesson, bounced back faster. His wisdom pulls me out of funks every time." }
      ]
    },
    {
      day: 6,
      philosopher: "Seneca",
      imagePrompt: "A Roman statesman writing by candlelight, with an hourglass spilling sand and scattered distractions around him, captured in a detailed Renaissance-inspired drawing, 4k",
      posts: [
        { id: "d6p1", time: "8:08", text: "Seneca wrote, \"Sometimes even to live is an act of courage.\" Resonates on tough days— just showing up counts. I've drawn from this during low points, pushing through with grit. Roman drama in his life, but his words steady me." },
        { id: "d6p2", time: "11:11", text: "\"True happiness is to enjoy the present, without anxious dependence upon the future,\" from Seneca. Stop future-tripping! Been practicing mindfulness more, savoring now—less worry, more contentment. His letters feel like old friends advising." },
        { id: "d6p3", time: "22:22", text: "Seneca's take on time: \"It is not that we have a short time to live, but that we waste a lot of it.\" Guilty as charged with distractions. Cutting nonsense has freed up hours for what matters—feels like extending life without magic." }
      ]
    },
    {
      day: 7,
      philosopher: "Marcus Aurelius",
      imagePrompt: "A Roman emperor in armor, meditating on a battlefield with a scroll in hand, blending stoic calm amid chaos like soldiers and storms, in an epic historical illustration format, 4k",
      posts: [
        { id: "d7p1", time: "8:08", text: "Marcus Aurelius noted, \"You have power over your mind—not outside events. Realize this, and you will find strength.\" Emperor amid chaos, yet calm. I've used this to handle stress—focus inward, not on the mess. Transformative stuff." },
        { id: "d7p2", time: "11:11", text: "\"The happiness of your life depends upon the quality of your thoughts,\" wrote Marcus in Meditations. Guard your mind! Shifted my negative loops to positive ones lately—brighter days follow. His journal wasn't for us, but glad it survived." },
        { id: "d7p3", time: "22:22", text: "Each morning, Marcus reflected: \"When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.\" Gratitude starter. I try this routine now—sets a tone of appreciation, less grumbling." }
      ]
    }
  ]
}

// Convert calendar to flat post array
function getPostsFromCalendar(): Post[] {
  const posts: Post[] = []
  stoicCalendar.days.forEach(day => {
    day.posts.forEach(post => {
      posts.push({
        id: post.id,
        day: day.day,
        philosopher: day.philosopher,
        time: post.time,
        text: post.text,
        imagePrompt: day.imagePrompt,
        status: 'draft'
      })
    })
  })
  return posts
}

export default function SocialDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar')

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onde_social_auth')
    if (saved === 'true') {
      setIsAuthenticated(true)
    }
    // Load posts
    const savedPosts = localStorage.getItem('onde_social_posts')
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      setPosts(getPostsFromCalendar())
    }
  }, [])

  // Save posts to localStorage when they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('onde_social_posts', JSON.stringify(posts))
    }
  }, [posts])

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

  const markAsPosted = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'posted' as const } : p))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'posted': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDayName = (day: number) => {
    const days = ['', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
    return days[day] || `Day ${day}`
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
            <p className="text-sm text-gray-500">Totale Post</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">{posts.filter(p => p.status === 'draft').length}</p>
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

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'calendar' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Vista Calendario
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Vista Lista
          </button>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-7 gap-4">
            {stoicCalendar.days.map((day) => (
              <div key={day.day} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-amber-600 text-white p-3 text-center">
                  <p className="font-medium">{getDayName(day.day)}</p>
                  <p className="text-xs opacity-80">{day.philosopher}</p>
                </div>
                <div className="p-3 space-y-2">
                  {posts.filter(p => p.day === day.day).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition hover:bg-amber-50 ${
                        post.status === 'posted' ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-amber-600">{post.time}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{post.text.substring(0, 60)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-serif text-gray-900">Calendario Post Stoici</h2>
              <p className="text-sm text-gray-500">7 giorni x 3 post/giorno: 8:08, 11:11, 22:22</p>
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
                      <span className="font-medium text-gray-900">{getDayName(post.day)}</span>
                      <span className="text-amber-600 font-mono">{post.time}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{post.philosopher}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line line-clamp-3">{post.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-serif">{getDayName(selectedPost.day)} @ {selectedPost.time}</h3>
                  <p className="text-sm text-gray-500">{selectedPost.philosopher}</p>
                </div>
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
                  <label className="block text-sm font-medium text-gray-500 mb-2">Testo Post ({selectedPost.text.length} caratteri)</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-line">{selectedPost.text}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedPost.text)}
                    className="mt-2 text-sm text-amber-600 hover:text-amber-700"
                  >
                    Copia testo
                  </button>
                </div>

                {/* Image Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Prompt Immagine</label>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-amber-800 font-mono text-sm">{selectedPost.imagePrompt}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedPost.imagePrompt)}
                    className="mt-2 text-sm text-amber-600 hover:text-amber-700"
                  >
                    Copia prompt
                  </button>
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
                  {selectedPost.status === 'approved' && (
                    <button
                      onClick={() => {
                        markAsPosted(selectedPost.id)
                        setSelectedPost({ ...selectedPost, status: 'posted' })
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Segna come Pubblicato
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
