'use client'

import { useState, useEffect } from 'react'

type PostType = 'text' | 'image' | 'video' | 'link' | 'thread'
type PostStatus = 'draft' | 'approved' | 'scheduled' | 'posted'
type Account = 'onde' | 'freeriverhouse' | 'magmatic'

interface Post {
  id: string
  account: Account
  text: string
  type: PostType
  status: PostStatus
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  linkTitle?: string
  threadPosts?: string[]
  book?: string
  scheduledDate?: string
  scheduledTime?: string
  editedText?: string
}

// Account info
const accounts: Record<Account, { name: string; handle: string; avatar: string; color: string }> = {
  onde: {
    name: 'Onde',
    handle: '@Onde_FRH',
    avatar: '📚',
    color: 'amber'
  },
  freeriverhouse: {
    name: 'FreeRiverHouse',
    handle: '@FreeRiverHouse',
    avatar: '🏠',
    color: 'blue'
  },
  magmatic: {
    name: 'Magmatic',
    handle: '@magmatic__',
    avatar: '🌋',
    color: 'purple'
  }
}

// Load posts from new calendar
function loadCalendarPosts(): Post[] {
  // These would normally be loaded from the JSON file via API
  // For now, inline the key posts from new-calendar-2026-01-19.json
  const posts: Post[] = [
    // ONDE posts
    {
      id: 'onde-01',
      account: 'onde',
      text: "Sai quella sensazione quando leggi qualcosa a tuo figlio e vedi che si ferma a pensare?\n\nEcco, per quella sensazione facciamo libri.\n\nNon per vendere. Per creare quei momenti.\n\nSe poi vendono, bene. Ma il momento viene prima.",
      type: 'text',
      status: 'draft',
      scheduledTime: '8:08'
    },
    {
      id: 'onde-02',
      account: 'onde',
      text: "Nel nostro libro MILO, c'è un passaggio che mi commuove ogni volta.\n\nIl robot dice a Sofia: \"Io sono molto intelligente in alcuni modi. Ma non sono vivo. Ed essere vivi - questa è una cosa molto speciale che avete voi.\"\n\nUn robot che insegna ai bambini il valore di essere umani. Forse è il modo più gentile per parlare di AI.",
      type: 'image',
      status: 'draft',
      book: 'MILO',
      scheduledTime: '11:11',
      imageUrl: '/images/books/milo-cover.jpg'
    },
    {
      id: 'onde-03',
      account: 'onde',
      text: "Stamattina in redazione abbiamo riletto il Salmo 23 per la decima volta.\n\nNon per correggere errori. Per sentire il ritmo. Un libro per bambini deve suonare come una ninnananna - se inciampi su una parola, hai sbagliato qualcosa.\n\nLa musicalità non è un extra. È il fondamento.",
      type: 'text',
      status: 'draft',
      book: 'Salmo 23',
      scheduledTime: '22:22'
    },
    {
      id: 'onde-04',
      account: 'onde',
      text: "\"Non temere,\" disse piano il pastore nella valle buia.\n\"Io sono qui, proprio accanto a te.\nIl buio non ti può far male quando camminiamo insieme.\"\n\nDal Salmo 23 per Bambini.\n\nQuante volte nella vita abbiamo avuto bisogno di sentire esattamente queste parole?",
      type: 'image',
      status: 'draft',
      book: 'Salmo 23',
      imageUrl: '/images/books/psalm23-shepherd.jpg'
    },
    {
      id: 'onde-05',
      account: 'onde',
      text: "Stella Stellina, la notte s'avvicina...\n\nLina Schwarz scrisse questa poesia più di cento anni fa. I bambini la cantano ancora oggi.\n\nLe parole buone non invecchiano. Attraversano il tempo come se nulla fosse.",
      type: 'video',
      status: 'draft',
      book: 'Piccole Rime',
      videoUrl: '/videos/stella-stellina.mp4'
    },

    // FREERIVERHOUSE posts
    {
      id: 'frh-01',
      account: 'freeriverhouse',
      text: "Today I spent 4 hours debugging something that turned out to be a typo.\n\nThe lesson isn't \"be more careful.\" The lesson is: complex problems often have embarrassingly simple solutions.\n\nOr maybe I just needed coffee. Both are valid.",
      type: 'text',
      status: 'draft',
      scheduledTime: '9:09'
    },
    {
      id: 'frh-02',
      account: 'freeriverhouse',
      text: "We're building something weird at Onde.\n\nA children's book publisher where the authors and illustrators are... illustrations themselves. AI-generated characters writing AI-assisted books about AI.\n\nIs it meta? Absolutely. Is it the future? We think so. Is it confusing? A little. Are we having fun? Definitely.",
      type: 'text',
      status: 'draft',
      scheduledTime: '12:12'
    },
    {
      id: 'frh-03',
      account: 'freeriverhouse',
      text: "The automation finally works.\n\nThe bot scans commits, picks what's interesting, writes a post, schedules it. While I sleep.\n\n3 weeks of work for something that takes 10 seconds.\n\nWorth it? Ask me in 6 months when I've saved 300 hours.",
      type: 'image',
      status: 'draft',
      scheduledTime: '21:21',
      imageUrl: '/images/dev-workspace.jpg'
    },
    {
      id: 'frh-04',
      account: 'freeriverhouse',
      text: "Our publishing stack:\n\n- Claude for writing assistance\n- Grok for illustrations\n- TypeScript for automation\n- Telegram for approvals on the go\n\nAI-native publishing. Not replacing humans - amplifying them. The human still decides. The machines just make it faster.",
      type: 'text',
      status: 'draft'
    },
    {
      id: 'frh-05',
      account: 'freeriverhouse',
      text: "Lesson learned building children's apps:\n\nKids don't read instructions. They tap everything.\nKids don't wait for loading screens. They tap again.\nKids don't care about your clever UX. They want it to work NOW.\n\nDesigning for kids is designing for honesty. They show you exactly what's wrong.",
      type: 'thread',
      status: 'draft',
      threadPosts: [
        "Lesson learned building children's apps:\n\nKids don't read instructions. They tap everything.",
        "Kids don't wait for loading screens. They tap again.",
        "Kids don't care about your clever UX. They want it to work NOW.",
        "Designing for kids is designing for honesty. They show you exactly what's wrong."
      ]
    },

    // MAGMATIC posts
    {
      id: 'mag-01',
      account: 'magmatic',
      text: "Some mornings the light through the window says more than I could write in a year.\n\nI just try to notice it.",
      type: 'text',
      status: 'draft',
      scheduledTime: '17:17'
    },
    {
      id: 'mag-02',
      account: 'magmatic',
      text: "Building in silence.\nSharing in whispers.\nLetting the work speak.\n\nMost things that matter happen quietly.",
      type: 'text',
      status: 'draft'
    },
    {
      id: 'mag-03',
      account: 'magmatic',
      text: "The best code I've ever written felt like poetry.\nThe best poetry I've ever read felt like truth.\nThe best truth I've ever found felt like silence.\n\nMaybe they're all the same thing.",
      type: 'image',
      status: 'draft',
      imageUrl: '/images/sunset-la.jpg'
    }
  ]
  return posts
}

// X-style Post Preview Component
function XPostPreview({ post, account }: { post: Post; account: typeof accounts[Account] }) {
  const text = post.editedText || post.text

  return (
    <div className="bg-black text-white rounded-xl border border-gray-800 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 pb-0">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
            {account.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{account.name}</span>
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/>
              </svg>
            </div>
            <span className="text-gray-500 text-sm">{account.handle}</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 py-3">
        <p className="text-[15px] leading-relaxed whitespace-pre-line">{text}</p>
      </div>

      {/* Media */}
      {post.type === 'image' && post.imageUrl && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-800">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <span className="text-gray-500">📷 {post.imageUrl}</span>
          </div>
        </div>
      )}

      {post.type === 'video' && post.videoUrl && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-800">
          <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
            <span className="text-gray-500">🎬 {post.videoUrl}</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/80 flex items-center justify-center">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {post.type === 'link' && post.linkUrl && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-800">
          <div className="p-3 bg-gray-900">
            <p className="text-sm text-gray-400">{post.linkUrl}</p>
            {post.linkTitle && <p className="font-medium mt-1">{post.linkTitle}</p>}
          </div>
        </div>
      )}

      {/* Thread indicator */}
      {post.type === 'thread' && post.threadPosts && (
        <div className="mx-4 mb-3 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">🧵 Thread ({post.threadPosts.length} post)</span>
        </div>
      )}

      {/* Post Footer */}
      <div className="px-4 py-3 flex justify-between text-gray-500 border-t border-gray-800">
        <button className="flex items-center gap-2 hover:text-blue-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button className="flex items-center gap-2 hover:text-green-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button className="flex items-center gap-2 hover:text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button className="flex items-center gap-2 hover:text-blue-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Wave SVG component for decorations
function WaveTop() {
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1440 120" className="w-full h-20 md:h-28">
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGradient1)" d="M0,60 C150,120 350,0 500,60 C650,120 850,0 1000,60 C1150,120 1300,20 1440,60 L1440,0 L0,0 Z" />
        <path fill="url(#waveGradient1)" fillOpacity="0.5" d="M0,40 C200,100 400,0 600,50 C800,100 1000,10 1200,50 C1350,80 1400,30 1440,40 L1440,0 L0,0 Z" />
      </svg>
    </div>
  )
}

function WaveBottom() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1440 120" className="w-full h-20 md:h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGradient2)" d="M0,60 C150,0 350,120 500,60 C650,0 850,120 1000,60 C1150,0 1300,100 1440,60 L1440,120 L0,120 Z" />
        <path fill="url(#waveGradient2)" fillOpacity="0.5" d="M0,80 C200,20 400,120 600,70 C800,20 1000,110 1200,70 C1350,40 1400,90 1440,80 L1440,120 L0,120 Z" />
      </svg>
    </div>
  )
}

export default function SocialDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [activeAccount, setActiveAccount] = useState<Account | 'all'>('all')
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')

  // Load posts on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('onde_social_posts_v2')
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      setPosts(loadCalendarPosts())
    }
  }, [])

  // Save posts to localStorage when they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('onde_social_posts_v2', JSON.stringify(posts))
    }
  }, [posts])

  const approvePost = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'approved' as const } : p))
  }

  const schedulePost = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'scheduled' as const } : p))
  }

  const saveEdit = (id: string, newText: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, editedText: newText } : p))
    setEditMode(false)
    setEditText('')
  }

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'posted': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: PostType) => {
    switch (type) {
      case 'text': return '📝'
      case 'image': return '🖼️'
      case 'video': return '🎬'
      case 'link': return '🔗'
      case 'thread': return '🧵'
    }
  }

  const filteredPosts = activeAccount === 'all'
    ? posts
    : posts.filter(p => p.account === activeAccount)

  // Public Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Wave decorations */}
      <WaveTop />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🌊 Free River Jams
          </h1>
          <p className="text-gray-400 text-lg">Social Media Dashboard</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-xs text-gray-500">Totale</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-yellow-500/30">
            <p className="text-2xl font-bold text-yellow-400">{posts.filter(p => p.status === 'draft').length}</p>
            <p className="text-xs text-gray-500">Bozze</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-green-500/30">
            <p className="text-2xl font-bold text-green-400">{posts.filter(p => p.status === 'approved').length}</p>
            <p className="text-xs text-gray-500">Approvati</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/30">
            <p className="text-2xl font-bold text-blue-400">{posts.filter(p => p.status === 'scheduled').length}</p>
            <p className="text-xs text-gray-500">Schedulati</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-gray-400">{posts.filter(p => p.status === 'posted').length}</p>
            <p className="text-xs text-gray-500">Pubblicati</p>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveAccount('all')}
            className={`px-4 py-2 rounded-full font-medium transition whitespace-nowrap ${
              activeAccount === 'all'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Tutti ({posts.length})
          </button>
          {(Object.keys(accounts) as Account[]).map(acc => (
            <button
              key={acc}
              onClick={() => setActiveAccount(acc)}
              className={`px-4 py-2 rounded-full font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeAccount === acc
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {accounts[acc].avatar} {accounts[acc].name} ({posts.filter(p => p.account === acc).length})
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="cursor-pointer transform transition hover:scale-[1.02]"
              onClick={() => {
                setSelectedPost(post)
                setEditText(post.editedText || post.text)
              }}
            >
              {/* Status & Type badges */}
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                  <span className="text-sm">{getTypeIcon(post.type)}</span>
                  {post.scheduledTime && (
                    <span className="text-xs text-gray-500 font-mono">{post.scheduledTime}</span>
                  )}
                </div>
                {post.book && (
                  <span className="text-xs text-gray-500">📖 {post.book}</span>
                )}
              </div>
              {/* X-style preview */}
              <XPostPreview post={post} account={accounts[post.account]} />
            </div>
          ))}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-gray-800">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{accounts[selectedPost.account].avatar}</span>
                  <div>
                    <h3 className="font-bold">{accounts[selectedPost.account].name}</h3>
                    <p className="text-sm text-gray-500">{accounts[selectedPost.account].handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPost(null)
                    setEditMode(false)
                  }}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Anteprima X</label>
                  <XPostPreview
                    post={editMode ? { ...selectedPost, editedText: editText } : selectedPost}
                    account={accounts[selectedPost.account]}
                  />
                </div>

                {/* Edit Mode */}
                {editMode ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Modifica Testo</label>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-40 p-4 bg-gray-800 border border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">{editText.length} caratteri</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                          Annulla
                        </button>
                        <button
                          onClick={() => {
                            saveEdit(selectedPost.id, editText)
                            setSelectedPost({ ...selectedPost, editedText: editText })
                          }}
                          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Salva
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Testo ({(selectedPost.editedText || selectedPost.text).length} caratteri)
                    </label>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="whitespace-pre-line">{selectedPost.editedText || selectedPost.text}</p>
                    </div>
                  </div>
                )}

                {/* Media info */}
                {selectedPost.type !== 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Media</label>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400">
                        {selectedPost.type === 'image' && `🖼️ Immagine: ${selectedPost.imageUrl}`}
                        {selectedPost.type === 'video' && `🎬 Video: ${selectedPost.videoUrl}`}
                        {selectedPost.type === 'link' && `🔗 Link: ${selectedPost.linkUrl}`}
                        {selectedPost.type === 'thread' && `🧵 Thread: ${selectedPost.threadPosts?.length} post`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Schedule info */}
                {selectedPost.scheduledTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Orario Schedulato</label>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="font-mono text-blue-400">{selectedPost.scheduledTime}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-600 transition font-medium"
                    >
                      ✏️ Modifica
                    </button>
                  )}

                  {selectedPost.status === 'draft' && !editMode && (
                    <button
                      onClick={() => {
                        approvePost(selectedPost.id)
                        setSelectedPost({ ...selectedPost, status: 'approved' })
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium"
                    >
                      ✅ Approva
                    </button>
                  )}

                  {selectedPost.status === 'approved' && !editMode && (
                    <button
                      onClick={() => {
                        schedulePost(selectedPost.id)
                        setSelectedPost({ ...selectedPost, status: 'scheduled' })
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                      📅 Schedula
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPost.editedText || selectedPost.text)
                    }}
                    className="px-4 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom wave decoration */}
      <WaveBottom />
    </div>
  )
}
