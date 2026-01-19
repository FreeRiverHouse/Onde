'use client'

import { useState } from 'react'

// Types
interface Post {
  id: string
  content: string
  type: string
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'posted'
  account: 'onde' | 'frh' | 'magmatic'
  scheduledTime?: string
  mediaType?: 'none' | 'image' | 'video' | 'thread'
  mediaUrl?: string
  book?: string | null
}

// Post data - loaded from calendar JSON
const initialPosts: Post[] = [
  // ONDE posts (21 total - showing first 10)
  { id: 'onde-01', content: "Sai quella sensazione quando leggi qualcosa a tuo figlio e vedi che si ferma a pensare?\n\nEcco, per quella sensazione facciamo libri.\n\nNon per vendere. Per creare quei momenti.\n\nSe poi vendono, bene. Ma il momento viene prima.", type: 'reflection', status: 'pending', account: 'onde', scheduledTime: '8:08', mediaType: 'none' },
  { id: 'onde-02', content: "Nel nostro libro MILO, c'è un passaggio che mi commuove ogni volta.\n\nIl robot dice a Sofia: \"Io sono molto intelligente in alcuni modi. Ma non sono vivo. Ed essere vivi - questa è una cosa molto speciale che avete voi.\"\n\nUn robot che insegna ai bambini il valore di essere umani.", type: 'quote', status: 'pending', account: 'onde', scheduledTime: '11:11', mediaType: 'image', book: 'MILO' },
  { id: 'onde-03', content: "Stamattina in redazione abbiamo riletto il Salmo 23 per la decima volta.\n\nNon per correggere errori. Per sentire il ritmo. Un libro per bambini deve suonare come una ninnananna - se inciampi su una parola, hai sbagliato qualcosa.\n\nLa musicalità non è un extra. È il fondamento.", type: 'behind_scenes', status: 'pending', account: 'onde', scheduledTime: '22:22', mediaType: 'none', book: 'Salmo 23' },
  { id: 'onde-04', content: "\"I tuoi pensieri sono come piccoli semi,\" disse la mamma a Leo.\n\"Se pensi cose belle, cresceranno fiori colorati.\"\n\nDal nostro libro Il Potere dei Desideri.\n\nA volte le verità più profonde si possono dire solo ai bambini. Perché loro ancora ci credono.", type: 'quote', status: 'pending', account: 'onde', scheduledTime: '8:08', mediaType: 'image', book: 'Potere dei Desideri' },
  { id: 'onde-05', content: "La cosa più difficile nello scrivere per bambini? Non è semplificare.\n\nÈ togliere tutto ciò che non serve, senza perdere ciò che conta.\n\nOgni parola deve meritare il suo posto. Se ne puoi togliere una senza perdere nulla, quella parola non doveva esserci.", type: 'reflection', status: 'pending', account: 'onde', scheduledTime: '11:11', mediaType: 'none' },
  { id: 'onde-06', content: "Nel libro MILO e il Viaggio dei Messaggi, spieghiamo Internet ai bambini.\n\n\"Anche adesso, mentre voi dormite, miliardi di messaggi stanno volando intorno al mondo. Auguri di compleanno, foto di gattini, videochiamate con le nonne...\"\n\nInternet non è paura. È meraviglia.", type: 'quote', status: 'pending', account: 'onde', scheduledTime: '22:22', mediaType: 'image', book: 'MILO Internet' },
  { id: 'onde-07', content: "Oggi abbiamo scelto i colori per MILO: arancione e blu.\n\nPerché arancione? È caldo, amichevole, dice \"non aver paura di me\".\nPerché blu? È tecnologico, ma calmo, dice \"sono qui per aiutarti\".\n\nOgni scelta visiva in un libro per bambini racconta una storia silenziosa.", type: 'behind_scenes', status: 'pending', account: 'onde', scheduledTime: '8:08', mediaType: 'none', book: 'MILO' },
  { id: 'onde-08', content: "\"Non temere,\" disse piano il pastore nella valle buia.\n\"Io sono qui, proprio accanto a te.\nIl buio non ti può far male quando camminiamo insieme.\"\n\nDal Salmo 23 per Bambini.\n\nQuante volte nella vita abbiamo avuto bisogno di sentire esattamente queste parole?", type: 'quote', status: 'pending', account: 'onde', scheduledTime: '11:11', mediaType: 'image', book: 'Salmo 23' },
  { id: 'onde-09', content: "Una confessione: a volte leggo i nostri libri ad alta voce, da solo, in ufficio.\n\nNon per controllare errori. Per sentire se funzionano.\n\nUn libro per bambini che non suona bene letto ad alta voce non è ancora finito.", type: 'behind_scenes', status: 'pending', account: 'onde', scheduledTime: '22:22', mediaType: 'none' },
  { id: 'onde-10', content: "Sofia chiede a MILO: \"Come fai a sapere che quello è un gatto?\"\n\n\"Mi hanno mostrato migliaia di foto di gatti,\" risponde MILO. \"Tu ne hai vista una sola. Il tuo cervello impara più velocemente del mio.\"\n\nA volte i bambini sottovalutano quanto sono straordinari. MILO glielo ricorda.", type: 'quote', status: 'pending', account: 'onde', scheduledTime: '8:08', mediaType: 'image', book: 'MILO' },

  // FRH posts (21 total - showing first 10)
  { id: 'frh-01', content: "Today I spent 4 hours debugging something that turned out to be a typo.\n\nThe lesson isn't \"be more careful.\" The lesson is: complex problems often have embarrassingly simple solutions.\n\nOr maybe I just needed coffee. Both are valid.", type: 'lesson', status: 'pending', account: 'frh', scheduledTime: '9:09', mediaType: 'none' },
  { id: 'frh-02', content: "We're building something weird at Onde.\n\nA children's book publisher where the authors and illustrators are... illustrations themselves. AI-generated characters writing AI-assisted books about AI.\n\nIs it meta? Absolutely. Is it the future? We think so. Is it confusing? A little. Are we having fun? Definitely.", type: 'building', status: 'pending', account: 'frh', scheduledTime: '12:12', mediaType: 'image' },
  { id: 'frh-03', content: "The automation finally works.\n\nThe bot scans commits, picks what's interesting, writes a post, schedules it. While I sleep.\n\n3 weeks of work for something that takes 10 seconds.\n\nWorth it? Ask me in 6 months when I've saved 300 hours.", type: 'tech', status: 'pending', account: 'frh', scheduledTime: '21:21', mediaType: 'none' },
  { id: 'frh-04', content: "Lesson learned building children's apps:\n\nKids don't read instructions. They tap everything.\nKids don't wait for loading screens. They tap again.\nKids don't care about your clever UX. They want it to work NOW.\n\nDesigning for kids is designing for honesty. They show you exactly what's wrong.", type: 'lesson', status: 'pending', account: 'frh', scheduledTime: '9:09', mediaType: 'none' },
  { id: 'frh-05', content: "Our publishing stack:\n\n- Claude for writing assistance\n- Grok for illustrations\n- TypeScript for automation\n- Telegram for approvals on the go\n\nAI-native publishing. Not replacing humans - amplifying them. The human still decides. The machines just make it faster.", type: 'tech', status: 'pending', account: 'frh', scheduledTime: '12:12', mediaType: 'none' },
  { id: 'frh-06', content: "Today I deleted more code than I wrote.\n\nThat's not failure. That's progress.\n\nThe best code is often no code at all. Simplicity is hard. Complexity is easy. Anyone can add. Removing takes courage.", type: 'lesson', status: 'pending', account: 'frh', scheduledTime: '21:21', mediaType: 'none' },
  { id: 'frh-07', content: "Building in public means sharing the ugly commits too.\n\nNot every day is a breakthrough. Some days are just \"fixed typo\" and \"moved file\" and \"why doesn't this work.\"\n\nThat's the real work. The breakthroughs are just the highlights reel.", type: 'reflection', status: 'pending', account: 'frh', scheduledTime: '9:09', mediaType: 'none' },
  { id: 'frh-08', content: "We rejected 12 book covers before finding the right one.\n\nNot because they were bad - some were beautiful. But beautiful isn't the same as RIGHT.\n\nA cover has 3 seconds to make a promise. You can't afford to make the wrong promise.", type: 'building', status: 'pending', account: 'frh', scheduledTime: '12:12', mediaType: 'none' },
  { id: 'frh-09', content: "The 90/10 rule of development:\n\n90% of the time you're trying to understand why something doesn't work.\n10% of the time you're actually writing code.\n\nToday was a 95/5 day. Tomorrow will be better. Probably.", type: 'lesson', status: 'pending', account: 'frh', scheduledTime: '21:21', mediaType: 'none' },
  { id: 'frh-10', content: "We wrote a children's book about AI. Using AI. About a robot named MILO. Generated by AI.\n\nMeta? Yes.\nConfusing? A little.\nHonest? Completely.\n\nThe future of publishing is transparent about its tools. We use AI. We're not hiding it. We're teaching kids about it.", type: 'building', status: 'pending', account: 'frh', scheduledTime: '9:09', mediaType: 'image' },

  // Magmatic posts (7 total)
  { id: 'mag-01', content: "Some mornings the light through the window says more than I could write in a year.\n\nI just try to notice it.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'image' },
  { id: 'mag-02', content: "Building in silence.\nSharing in whispers.\nLetting the work speak.\n\nMost things that matter happen quietly.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'none' },
  { id: 'mag-03', content: "The best code I've ever written felt like poetry.\nThe best poetry I've ever read felt like truth.\nThe best truth I've ever found felt like silence.\n\nMaybe they're all the same thing.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'none' },
  { id: 'mag-04', content: "I used to think productivity meant doing more.\n\nNow I think it means doing less, but meaning it.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'none' },
  { id: 'mag-05', content: "There's a moment just before sunset when everything turns gold.\n\nYou can't photograph it. You can't describe it.\nYou can only be there.\n\nSome things only exist in the present tense.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'image' },
  { id: 'mag-06', content: "The river doesn't try to be anything.\nIt just flows.\n\nMaybe that's the whole lesson.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'none' },
  { id: 'mag-07', content: "Lately I've been reading more and writing less.\n\nNot because I have nothing to say.\nBecause I'm not sure it's time to say it yet.\n\nSome words need to ripen.", type: 'thought', status: 'pending', account: 'magmatic', scheduledTime: '17:17', mediaType: 'none' }
]

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

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const ThreadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
)

// Account colors
const accountColors = {
  onde: { bg: 'from-surf-teal to-surf-cyan', border: 'border-surf-cyan/30', text: 'text-surf-cyan', handle: '@Onde_FRH' },
  frh: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-400/30', text: 'text-purple-400', handle: '@FreeRiverHouse' },
  magmatic: { bg: 'from-surf-gold to-orange-500', border: 'border-surf-gold/30', text: 'text-surf-gold', handle: '@magmatic__' }
}

// Status styles
const statusStyles = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In attesa' },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approvato' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rifiutato' },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Programmato' },
  posted: { bg: 'bg-surf-teal/20', text: 'text-surf-aqua', label: 'Pubblicato' }
}

// Post Card Component - X-like styling
function PostCard({ post, onApprove, onReject, onEdit }: {
  post: Post
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (id: string) => void
}) {
  const account = accountColors[post.account]
  const status = statusStyles[post.status]

  return (
    <div className={`bg-white/5 rounded-2xl border ${account.border} hover:bg-white/10 transition-all duration-300`}>
      {/* Post Header - X style */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${account.bg} flex items-center justify-center`}>
            <XIcon />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-surf-foam">{account.handle}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-surf-foam/50">
              <ClockIcon />
              <span>{post.scheduledTime}</span>
              {post.book && <span>• {post.book}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-surf-foam whitespace-pre-line text-[15px] leading-relaxed">
          {post.content}
        </p>

        {/* Media Indicator */}
        {post.mediaType && post.mediaType !== 'none' && (
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-surf-foam/60">
            {post.mediaType === 'image' && <><ImageIcon /> <span className="text-sm">Immagine allegata</span></>}
            {post.mediaType === 'video' && <><VideoIcon /> <span className="text-sm">Video allegato</span></>}
            {post.mediaType === 'thread' && <><ThreadIcon /> <span className="text-sm">Thread</span></>}
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
                className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <CheckIcon /> Approva
              </button>
              <button
                onClick={() => onReject(post.id)}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <XMarkIcon /> Rifiuta
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => onEdit(post.id)}
          className="px-4 py-2 rounded-xl bg-white/5 text-surf-foam/60 hover:bg-white/10 hover:text-surf-foam transition-colors flex items-center gap-2 text-sm"
        >
          <EditIcon /> Modifica
        </button>
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
          ? 'bg-surf-cyan/20 text-surf-cyan border border-surf-cyan/30'
          : 'bg-white/5 text-surf-foam/60 hover:bg-white/10 border border-white/10'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${active ? 'bg-surf-cyan/30' : 'bg-white/10'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

export default function SocialDashboard() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [filterAccount, setFilterAccount] = useState<'all' | 'onde' | 'frh' | 'magmatic'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'scheduled'>('all')
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

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
    scheduled: posts.filter(p => p.status === 'scheduled').length
  }

  // Actions
  const handleApprove = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'approved' as const } : p))
  }

  const handleReject = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p))
  }

  const handleEdit = (id: string) => {
    const post = posts.find(p => p.id === id)
    if (post) {
      setEditingPost(id)
      setEditContent(post.content)
    }
  }

  const handleSaveEdit = () => {
    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost ? { ...p, content: editContent } : p))
      setEditingPost(null)
      setEditContent('')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-surf-teal to-surf-cyan flex items-center justify-center">
            <XIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-surf-foam">Social Dashboard</h1>
            <p className="text-surf-foam/60">Gestisci i post per tutti gli account</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="surf-card text-center">
            <div className="stat-number text-3xl mb-1">{counts.all}</div>
            <div className="text-surf-foam/50 text-sm">Post Totali</div>
          </div>
          <div className="surf-card text-center">
            <div className="stat-number-gold text-3xl mb-1">{counts.pending}</div>
            <div className="text-surf-foam/50 text-sm">In Attesa</div>
          </div>
          <div className="surf-card text-center">
            <div className="stat-number text-3xl mb-1">{counts.approved}</div>
            <div className="text-surf-foam/50 text-sm">Approvati</div>
          </div>
          <div className="surf-card text-center">
            <div className="stat-number text-3xl mb-1">{counts.scheduled}</div>
            <div className="text-surf-foam/50 text-sm">Programmati</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="text-surf-foam/50 text-sm py-2">Account:</span>
          <FilterButton active={filterAccount === 'all'} onClick={() => setFilterAccount('all')} count={counts.all}>
            Tutti
          </FilterButton>
          <FilterButton active={filterAccount === 'onde'} onClick={() => setFilterAccount('onde')} count={counts.onde}>
            <span className="text-surf-cyan">@Onde_FRH</span>
          </FilterButton>
          <FilterButton active={filterAccount === 'frh'} onClick={() => setFilterAccount('frh')} count={counts.frh}>
            <span className="text-purple-400">@FreeRiverHouse</span>
          </FilterButton>
          <FilterButton active={filterAccount === 'magmatic'} onClick={() => setFilterAccount('magmatic')} count={counts.magmatic}>
            <span className="text-surf-gold">@magmatic__</span>
          </FilterButton>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="text-surf-foam/50 text-sm py-2">Stato:</span>
          <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
            Tutti
          </FilterButton>
          <FilterButton active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')} count={counts.pending}>
            <span className="text-yellow-400">In Attesa</span>
          </FilterButton>
          <FilterButton active={filterStatus === 'approved'} onClick={() => setFilterStatus('approved')} count={counts.approved}>
            <span className="text-green-400">Approvati</span>
          </FilterButton>
          <FilterButton active={filterStatus === 'scheduled'} onClick={() => setFilterStatus('scheduled')} count={counts.scheduled}>
            <span className="text-blue-400">Programmati</span>
          </FilterButton>
        </div>
      </section>

      {/* Schedule Overview */}
      <section className="mb-8 surf-card">
        <h2 className="text-xl font-bold text-surf-foam mb-4">📅 Schedule</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surf-cyan/10 border border-surf-cyan/20">
            <div className="text-surf-cyan font-bold mb-2">@Onde_FRH</div>
            <div className="text-surf-foam/60 text-sm">3x/giorno</div>
            <div className="text-surf-foam mt-2 font-mono text-lg">8:08 • 11:11 • 22:22</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/20">
            <div className="text-purple-400 font-bold mb-2">@FreeRiverHouse</div>
            <div className="text-surf-foam/60 text-sm">3x/giorno</div>
            <div className="text-surf-foam mt-2 font-mono text-lg">9:09 • 12:12 • 21:21</div>
          </div>
          <div className="p-4 rounded-xl bg-surf-gold/10 border border-surf-gold/20">
            <div className="text-surf-gold font-bold mb-2">@magmatic__</div>
            <div className="text-surf-foam/60 text-sm">1x/giorno</div>
            <div className="text-surf-foam mt-2 font-mono text-lg">17:17</div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section>
        <h2 className="text-xl font-bold text-surf-foam mb-6 flex items-center gap-2">
          Post ({filteredPosts.length})
        </h2>

        <div className="grid gap-6">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-surf-foam/50">
            Nessun post trovato con questi filtri
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surf-dark rounded-3xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-surf-foam">Modifica Post</h3>
            </div>
            <div className="p-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-surf-foam resize-none focus:outline-none focus:border-surf-cyan/50"
                placeholder="Scrivi il contenuto del post..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setEditingPost(null)}
                  className="px-6 py-2 rounded-xl bg-white/5 text-surf-foam/60 hover:bg-white/10 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 rounded-xl bg-surf-cyan/20 text-surf-cyan hover:bg-surf-cyan/30 transition-colors font-medium"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
