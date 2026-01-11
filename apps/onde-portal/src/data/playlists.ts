// Playlist di libri tipo Spotify
// Ogni playlist ha un tema, descrizione, e lista di libri

export interface Playlist {
  id: string
  title: string
  description: string
  coverGradient: string // Tailwind gradient classes
  icon: string // Emoji o SVG
  bookIds: string[] // IDs dei libri inclusi
  curatorNote?: string // Nota del curatore (Onde)
  tags: string[]
  featured?: boolean
}

export const playlists: Playlist[] = [
  {
    id: 'inner-peace',
    title: 'Per chi cerca pace interiore',
    description: 'Letture che nutrono l\'anima e portano serenita\'',
    coverGradient: 'from-amber-500 via-orange-400 to-yellow-500',
    icon: '🕊️',
    bookIds: ['salmo-23', 'meditations', 'tao-te-ching'],
    curatorNote: 'Una selezione di testi millenari che hanno guidato l\'umanita\' verso la pace interiore.',
    tags: ['spiritualita\'', 'meditazione', 'saggezza'],
    featured: true,
  },
  {
    id: 'classic-must-reads',
    title: 'Classici da leggere una volta nella vita',
    description: 'I capolavori della letteratura mondiale che hanno definito generazioni',
    coverGradient: 'from-violet-600 via-purple-500 to-indigo-600',
    icon: '📚',
    bookIds: ['alice', 'wizard-oz', 'jungle-book', 'peter-rabbit', 'grimm-tales', 'andersen-tales'],
    curatorNote: 'Questi classici hanno ispirato film, adattamenti e continuano a incantare lettori di ogni eta\'.',
    tags: ['classici', 'letteratura', 'must-read'],
    featured: true,
  },
  {
    id: 'ai-for-kids',
    title: 'AI spiegata ai bambini',
    description: 'Come funziona l\'intelligenza artificiale, raccontata in modo semplice',
    coverGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    icon: '🤖',
    bookIds: ['aiko'],
    curatorNote: 'Preparare i bambini al futuro inizia dalla comprensione della tecnologia.',
    tags: ['tech', 'bambini', 'educazione', 'AI'],
    featured: true,
  },
  {
    id: 'italian-poetry',
    title: 'Poesia italiana per bambini',
    description: 'Le piu\' belle filastrocche e poesie della tradizione italiana',
    coverGradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    icon: '🌸',
    bookIds: ['piccole-rime'],
    curatorNote: 'La bellezza della lingua italiana nelle parole dei grandi poeti.',
    tags: ['poesia', 'italiano', 'filastrocche'],
    featured: false,
  },
  {
    id: 'bedtime-stories',
    title: 'Storie della buonanotte',
    description: 'Racconti dolci per accompagnare i sogni',
    coverGradient: 'from-indigo-600 via-purple-600 to-blue-700',
    icon: '🌙',
    bookIds: ['peter-rabbit', 'andersen-tales', 'grimm-tales'],
    curatorNote: 'Storie che i genitori leggono ai bambini da generazioni.',
    tags: ['buonanotte', 'bambini', 'racconti'],
    featured: false,
  },
  {
    id: 'adventure-tales',
    title: 'Avventure incredibili',
    description: 'Viaggi fantastici in mondi straordinari',
    coverGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: '🗺️',
    bookIds: ['alice', 'wizard-oz', 'jungle-book'],
    curatorNote: 'Per chi vuole partire per un\'avventura senza muoversi dal divano.',
    tags: ['avventura', 'fantasia', 'viaggi'],
    featured: false,
  },
  {
    id: 'wisdom-ancient',
    title: 'Saggezza degli antichi',
    description: 'Insegnamenti millenari ancora attuali',
    coverGradient: 'from-stone-600 via-amber-700 to-yellow-600',
    icon: '📜',
    bookIds: ['meditations', 'tao-te-ching', 'salmo-23'],
    tags: ['filosofia', 'spiritualita\'', 'classici'],
    featured: false,
  },
]

// Funzione per ottenere una playlist per ID
export function getPlaylistById(id: string): Playlist | undefined {
  return playlists.find(p => p.id === id)
}

// Funzione per ottenere le playlist in evidenza
export function getFeaturedPlaylists(): Playlist[] {
  return playlists.filter(p => p.featured)
}

// Funzione per ottenere playlist che contengono un libro specifico
export function getPlaylistsContainingBook(bookId: string): Playlist[] {
  return playlists.filter(p => p.bookIds.includes(bookId))
}
