'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { books, Book } from '@/data/books'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import ePub, { Book as EpubBook, Rendition, NavItem } from 'epubjs'

// Create a lookup map for faster access
const booksMap: Record<string, Book> = {}
books.forEach(book => {
  booksMap[book.id] = book
})

interface BookData {
  title: string
  author: string
  lang: string
  content: string
  chapters: { title: string; content: string; href?: string }[]
  wordCount: number
}

interface Bookmark {
  id: string
  label: string
  cfi?: string // For EPUB
  chapter?: number // For legacy reader
  createdAt: number
}

interface Props {
  bookId: string
}

export default function BookReaderClient({ bookId }: Props) {
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(19)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showToc, setShowToc] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [currentCfi, setCurrentCfi] = useState<string | null>(null)
  const [readingProgress, setReadingProgress] = useState(0)
  const [theme, setTheme] = useState<'notte' | 'giorno' | 'seppia'>('notte')
  const contentRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const epubRef = useRef<EpubBook | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const [tocItems, setTocItems] = useState<NavItem[]>([])
  const [useEpubViewer, setUseEpubViewer] = useState(false)

  const book = booksMap[bookId]
  const { addToRecentlyViewed } = useRecentlyViewed()

  // Bookmark storage key
  const bookmarkStorageKey = `onde-reader-bookmarks-${bookId}`

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(bookmarkStorageKey)
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch {
        setBookmarks([])
      }
    }
  }, [bookmarkStorageKey])

  // Save bookmarks to localStorage
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem(bookmarkStorageKey, JSON.stringify(bookmarks))
    } else {
      localStorage.removeItem(bookmarkStorageKey)
    }
  }, [bookmarks, bookmarkStorageKey])

  // Add current position as bookmark
  const addBookmark = useCallback(() => {
    const now = Date.now()
    const id = `bookmark-${now}`
    
    if (useEpubViewer && currentCfi) {
      // For EPUB: use CFI
      const label = `Pagina salvata ${new Date(now).toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}`
      setBookmarks(prev => [...prev, { id, label, cfi: currentCfi, createdAt: now }])
    } else if (bookData) {
      // For legacy reader: use chapter
      const chapterTitle = bookData.chapters[currentChapter]?.title || `Capitolo ${currentChapter + 1}`
      const label = `${chapterTitle} - ${new Date(now).toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      })}`
      setBookmarks(prev => [...prev, { id, label, chapter: currentChapter, createdAt: now }])
    }
  }, [useEpubViewer, currentCfi, bookData, currentChapter])

  // Remove a bookmark
  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
  }, [])

  // Navigate to a bookmark
  const goToBookmark = useCallback((bookmark: Bookmark) => {
    if (bookmark.cfi && renditionRef.current) {
      renditionRef.current.display(bookmark.cfi)
    } else if (bookmark.chapter !== undefined) {
      setCurrentChapter(bookmark.chapter)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setShowBookmarks(false)
  }, [])

  // Track recently viewed books
  useEffect(() => {
    if (bookId) {
      addToRecentlyViewed(bookId)
    }
  }, [bookId, addToRecentlyViewed])

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('onde-reader-fontsize')
    const savedTheme = localStorage.getItem('onde-reader-theme')
    if (savedFontSize) setFontSize(parseInt(savedFontSize))
    if (savedTheme) setTheme(savedTheme as 'notte' | 'giorno' | 'seppia')
  }, [])

  // Save preferences
  useEffect(() => {
    localStorage.setItem('onde-reader-fontsize', fontSize.toString())
    localStorage.setItem('onde-reader-theme', theme)
  }, [fontSize, theme])

  // Initialize and render EPUB
  const initEpub = useCallback(async (epubUrl: string) => {
    if (!viewerRef.current) return

    try {
      // Cleanup previous instance
      if (renditionRef.current) {
        renditionRef.current.destroy()
      }
      if (epubRef.current) {
        epubRef.current.destroy()
      }

      const epubBook = ePub(epubUrl)
      epubRef.current = epubBook

      // Load the book and get navigation
      await epubBook.ready
      const navigation = await epubBook.loaded.navigation
      setTocItems(navigation.toc)

      // Create rendition
      const rendition = epubBook.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'scrolled-doc',
      })

      renditionRef.current = rendition

      // Apply theme styles
      rendition.themes.default({
        body: {
          'font-family': 'Georgia, serif',
          'line-height': '1.8',
          'padding': '20px',
        },
        'p': {
          'margin-bottom': '1em',
        },
        'h1, h2, h3': {
          'margin-top': '1.5em',
          'margin-bottom': '0.5em',
        },
      })

      // Track current location for bookmarks
      rendition.on('relocated', (location: { start: { cfi: string } }) => {
        if (location?.start?.cfi) {
          setCurrentCfi(location.start.cfi)
        }
      })

      // Display first section
      await rendition.display()
      setUseEpubViewer(true)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load EPUB:', err)
      setError('Impossibile caricare il libro EPUB.')
      setLoading(false)
    }
  }, [])

  // Navigate to TOC item
  const navigateToTocItem = useCallback((href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href)
      setShowToc(false)
    }
  }, [])

  // Navigate next/prev
  const navigateNext = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.next()
    }
  }, [])

  const navigatePrev = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.prev()
    }
  }, [])

  // Load book content - prioritize EPUB files
  useEffect(() => {
    if (!bookId || !book) return

    // Check if book has an EPUB URL - use EPUB viewer
    if (book.epubUrl) {
      setLoading(true)
      initEpub(book.epubUrl)
      return
    }

    // No EPUB available
    setError('Contenuto non disponibile')
    setLoading(false)
  }, [book, bookId, initEpub])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy()
      }
      if (epubRef.current) {
        epubRef.current.destroy()
      }
    }
  }, [])

  // STILE ONDE - Colori Pina Pennello
  const themeStyles = {
    notte: {
      bg: 'bg-gradient-to-b from-[#0a1628] to-[#0d1f3c]',
      text: 'text-[#e8f4f8]',
      header: 'bg-[#0a1628]/95',
      border: 'border-[#2dd4bf]/20',
      accent: 'text-[#fbbf24]',
      accentBg: 'bg-[#fbbf24]/15',
      highlight: 'text-[#2dd4bf]',
      highlightBg: 'bg-[#2dd4bf]/10',
      muted: 'text-[#94a3b8]',
      icon: '🌙',
    },
    giorno: {
      bg: 'bg-gradient-to-b from-[#f0fdfa] to-[#ffffff]',
      text: 'text-[#134e4a]',
      header: 'bg-[#f0fdfa]/95',
      border: 'border-[#14b8a6]/20',
      accent: 'text-[#d97706]',
      accentBg: 'bg-[#d97706]/10',
      highlight: 'text-[#0d9488]',
      highlightBg: 'bg-[#0d9488]/10',
      muted: 'text-[#5eead4]',
      icon: '☀️',
    },
    seppia: {
      bg: 'bg-gradient-to-b from-[#fef3e2] to-[#fefaf6]',
      text: 'text-[#44403c]',
      header: 'bg-[#fef3e2]/95',
      border: 'border-[#d97706]/20',
      accent: 'text-[#b45309]',
      accentBg: 'bg-[#b45309]/10',
      highlight: 'text-[#0f766e]',
      highlightBg: 'bg-[#0f766e]/10',
      muted: 'text-[#a8a29e]',
      icon: '📜',
    },
  }

  const t = themeStyles[theme]

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-6">📚</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Libro non trovato</h1>
          <Link href="/catalogo" className="text-[#2dd4bf] hover:text-[#fbbf24] transition font-medium">
            ← Torna alla Biblioteca
          </Link>
        </div>
      </div>
    )
  }

  const readingTime = bookData ? Math.ceil(bookData.wordCount / 200) : 0

  const cycleTheme = () => {
    const themes: ('notte' | 'giorno' | 'seppia')[] = ['notte', 'giorno', 'seppia']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <div className={`min-h-screen ${t.bg} transition-all duration-500`}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#2dd4bf] via-[#fbbf24] to-[#f59e0b] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className={`sticky top-0 ${t.header} backdrop-blur-md ${t.border} border-b z-40`}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/catalogo"
              className={`${t.highlight} text-sm font-medium hover:${t.accent} transition flex items-center gap-2`}
            >
              <span>←</span>
              <span className="hidden sm:inline">Biblioteca</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={cycleTheme}
                className={`w-9 h-9 rounded-full ${t.highlightBg} ${t.highlight} text-base flex items-center justify-center hover:scale-110 transition-transform`}
                aria-label="Cambia tema"
              >
                {t.icon}
              </button>

              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className={`w-9 h-9 rounded-full ${t.accentBg} ${t.accent} text-sm font-bold hover:scale-110 transition-transform`}
                aria-label="Riduci font"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(s => Math.min(28, s + 2))}
                className={`w-9 h-9 rounded-full ${t.accentBg} ${t.accent} text-sm font-bold hover:scale-110 transition-transform`}
                aria-label="Ingrandisci font"
              >
                A+
              </button>

              <button
                onClick={addBookmark}
                className={`w-9 h-9 rounded-full ${t.accentBg} ${t.accent} text-base flex items-center justify-center hover:scale-110 transition-transform`}
                aria-label="Aggiungi segnalibro"
                title="Aggiungi segnalibro"
              >
                🔖
              </button>

              {bookmarks.length > 0 && (
                <button
                  onClick={() => {
                    setShowBookmarks(!showBookmarks)
                    setShowToc(false)
                  }}
                  className={`relative w-9 h-9 rounded-full ${t.highlightBg} ${t.highlight} text-sm font-bold hover:scale-110 transition-transform`}
                  aria-label="Segnalibri"
                  title={`${bookmarks.length} segnalibri`}
                >
                  📑
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {bookmarks.length}
                  </span>
                </button>
              )}

              {((bookData && bookData.chapters.length > 1) || (useEpubViewer && tocItems.length > 0)) && (
                <button
                  onClick={() => {
                    setShowToc(!showToc)
                    setShowBookmarks(false)
                  }}
                  className={`w-9 h-9 rounded-full ${t.highlightBg} ${t.highlight} text-sm font-bold hover:scale-110 transition-transform`}
                  aria-label="Indice"
                >
                  ☰
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* TOC Sidebar - EPUB viewer */}
      {showToc && useEpubViewer && tocItems.length > 0 && (
        <div className="fixed inset-0 z-30" onClick={() => setShowToc(false)}>
          <div className="absolute inset-0 bg-[#0a1628]/60 backdrop-blur-sm" />
          <aside
            className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] ${t.bg} ${t.border} border-l shadow-2xl overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className={`font-bold text-lg mb-5 ${t.accent} flex items-center gap-2`}>
                <span>📖</span> Indice
              </h3>
              <nav className="space-y-1">
                {tocItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateToTocItem(item.href)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${t.text} opacity-70 hover:opacity-100 hover:${t.accentBg}`}
                  >
                    {item.label || `Section ${idx + 1}`}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* TOC Sidebar - Legacy bookData */}
      {showToc && bookData && bookData.chapters.length > 1 && !useEpubViewer && (
        <div className="fixed inset-0 z-30" onClick={() => setShowToc(false)}>
          <div className="absolute inset-0 bg-[#0a1628]/60 backdrop-blur-sm" />
          <aside
            className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] ${t.bg} ${t.border} border-l shadow-2xl overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className={`font-bold text-lg mb-5 ${t.accent} flex items-center gap-2`}>
                <span>📖</span> Indice
              </h3>
              <nav className="space-y-1">
                {bookData.chapters.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentChapter(idx)
                      setShowToc(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      currentChapter === idx
                        ? `${t.highlightBg} ${t.highlight} font-medium`
                        : `${t.text} opacity-70 hover:opacity-100 hover:${t.accentBg}`
                    }`}
                  >
                    {chapter.title || `Sezione ${idx + 1}`}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Bookmarks Sidebar */}
      {showBookmarks && bookmarks.length > 0 && (
        <div className="fixed inset-0 z-30" onClick={() => setShowBookmarks(false)}>
          <div className="absolute inset-0 bg-[#0a1628]/60 backdrop-blur-sm" />
          <aside
            className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] ${t.bg} ${t.border} border-l shadow-2xl overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className={`font-bold text-lg mb-5 ${t.accent} flex items-center gap-2`}>
                <span>🔖</span> Segnalibri
              </h3>
              <nav className="space-y-2">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className={`group flex items-start gap-2 ${t.text} opacity-80 hover:opacity-100 transition-all`}
                  >
                    <button
                      onClick={() => goToBookmark(bookmark)}
                      className={`flex-1 text-left px-4 py-3 rounded-xl text-sm hover:${t.accentBg} transition-all`}
                    >
                      <div className="font-medium">{bookmark.label}</div>
                      <div className={`text-xs ${t.muted} mt-1`}>
                        {new Date(bookmark.createdAt).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className={`p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all`}
                      aria-label="Rimuovi segnalibro"
                      title="Rimuovi segnalibro"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </nav>
              {bookmarks.length > 0 && (
                <div className={`mt-6 pt-4 ${t.border} border-t`}>
                  <button
                    onClick={() => {
                      if (confirm('Vuoi eliminare tutti i segnalibri?')) {
                        setBookmarks([])
                      }
                    }}
                    className={`w-full text-center py-2 text-sm ${t.muted} hover:text-red-400 transition-colors`}
                  >
                    Elimina tutti i segnalibri
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Book Header */}
      <div className={`${t.border} border-b`}>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <div className={`${t.highlight} text-3xl mb-4`}>✦</div>

          <h1 className={`text-2xl md:text-4xl font-serif font-bold mb-3 ${t.text}`}>
            {book.title}
          </h1>
          <p className={`text-lg md:text-xl ${t.muted} mb-5 italic`}>{book.author}</p>

          <div className="flex items-center justify-center gap-4 text-sm flex-wrap mb-6">
            {book.lang && book.lang !== 'en' && (
              <span className={`${t.highlightBg} ${t.highlight} px-4 py-1.5 rounded-full font-medium`}>
                {book.lang.toUpperCase()}
              </span>
            )}
            {bookData && (
              <>
                <span className={`${t.muted}`}>
                  {bookData.wordCount.toLocaleString()} parole
                </span>
                <span className={`${t.muted}`}>•</span>
                <span className={`${t.muted}`}>
                  ~{readingTime} min di lettura
                </span>
              </>
            )}
          </div>

          {/* Download EPUB button for Onde books */}
          {book.epubUrl && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href={book.epubUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] text-[#0a1628] font-bold text-sm hover:scale-105 transition-transform shadow-lg"
              >
                <span>📱</span> Scarica ePub
              </a>
              {book.pdfUrl && (
                <a
                  href={book.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-white font-bold text-sm hover:scale-105 transition-transform shadow-lg"
                >
                  <span>📄</span> PDF
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10 pb-24" ref={contentRef}>
        {loading ? (
          <div className="text-center py-24">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-4 border-[#2dd4bf]/20 border-t-[#2dd4bf] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
            </div>
            <p className={`${t.highlight} mt-6 animate-pulse font-medium`}>Caricamento in corso...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">📚</div>
            <p className={`${t.muted} mb-6 text-lg`}>{error}</p>
            <Link
              href="/catalogo"
              className={`${t.highlightBg} ${t.highlight} px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform inline-block`}
            >
              ← Torna alla biblioteca
            </Link>
          </div>
        ) : useEpubViewer ? (
          <>
            {/* EPUB Viewer Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={navigatePrev}
                className={`px-5 py-2.5 rounded-full ${t.highlightBg} ${t.highlight} font-medium hover:scale-105 transition-transform`}
              >
                ← Prec
              </button>
              <span className={`${t.muted} text-sm font-medium`}>
                {tocItems.length > 0 ? `${tocItems.length} sezioni` : 'Lettura'}
              </span>
              <button
                onClick={navigateNext}
                className={`px-5 py-2.5 rounded-full ${t.highlightBg} ${t.highlight} font-medium hover:scale-105 transition-transform`}
              >
                Succ →
              </button>
            </div>

            {/* EPUB Content Container */}
            <div
              ref={viewerRef}
              className={`epub-viewer ${t.text} rounded-xl overflow-hidden`}
              style={{
                minHeight: '70vh',
                fontSize: `${fontSize}px`,
                background: theme === 'notte' ? '#0d1f3c' : theme === 'seppia' ? '#fef3e2' : '#ffffff',
                color: theme === 'notte' ? '#e8f4f8' : theme === 'seppia' ? '#44403c' : '#134e4a',
              }}
            />

            {/* Bottom Navigation */}
            <div className={`flex items-center justify-between mt-10 pt-6 ${t.border} border-t`}>
              <button
                onClick={navigatePrev}
                className={`px-6 py-3 rounded-full ${t.highlightBg} ${t.highlight} font-medium hover:scale-105 transition-transform`}
              >
                ← Precedente
              </button>
              <button
                onClick={navigateNext}
                className={`px-6 py-3 rounded-full ${t.highlightBg} ${t.highlight} font-medium hover:scale-105 transition-transform`}
              >
                Successivo →
              </button>
            </div>
          </>
        ) : bookData ? (
          <>
            {bookData.chapters.length > 1 && (
              <div className="flex items-center justify-between mb-10">
                <button
                  onClick={() => {
                    setCurrentChapter(c => Math.max(0, c - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentChapter === 0}
                  className={`px-5 py-2.5 rounded-full ${t.highlightBg} ${t.highlight} font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
                >
                  ← Prec
                </button>
                <span className={`${t.muted} text-sm font-medium`}>
                  {currentChapter + 1} / {bookData.chapters.length}
                </span>
                <button
                  onClick={() => {
                    setCurrentChapter(c => Math.min(bookData.chapters.length - 1, c + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentChapter === bookData.chapters.length - 1}
                  className={`px-5 py-2.5 rounded-full ${t.highlightBg} ${t.highlight} font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
                >
                  Succ →
                </button>
              </div>
            )}

            {bookData.chapters[currentChapter]?.title && (
              <h2 className={`text-xl md:text-2xl font-serif font-bold mb-10 text-center ${t.accent}`}>
                {bookData.chapters[currentChapter].title}
              </h2>
            )}

            <article
              className={`${t.text} font-serif leading-relaxed`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: '2',
                textAlign: 'justify',
                hyphens: 'auto',
                WebkitHyphens: 'auto',
              }}
            >
              {bookData.chapters[currentChapter]?.content.split('\n\n').map((paragraph, idx) => (
                <p
                  key={idx}
                  className="mb-7 first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:leading-none"
                  style={{ textIndent: idx > 0 ? '1.5em' : '0' }}
                >
                  {paragraph.trim()}
                </p>
              ))}
            </article>

            {bookData.chapters.length > 1 && (
              <div className={`flex items-center justify-between mt-16 pt-10 ${t.border} border-t`}>
                <button
                  onClick={() => {
                    setCurrentChapter(c => Math.max(0, c - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentChapter === 0}
                  className={`px-6 py-3 rounded-full ${t.highlightBg} ${t.highlight} font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
                >
                  ← Capitolo Precedente
                </button>
                <button
                  onClick={() => {
                    setCurrentChapter(c => Math.min(bookData.chapters.length - 1, c + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentChapter === bookData.chapters.length - 1}
                  className={`px-6 py-3 rounded-full ${t.highlightBg} ${t.highlight} font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
                >
                  Capitolo Successivo →
                </button>
              </div>
            )}
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className={`${t.border} border-t py-10`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className={`${t.highlight} text-2xl mb-3`}>🌊</div>
          <p className={`${t.accent} text-sm font-medium`}>
            Onde Publishing
          </p>
        </div>
      </footer>
    </div>
  )
}
