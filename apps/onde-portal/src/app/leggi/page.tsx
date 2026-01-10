'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ePub, { Book, Rendition, NavItem } from 'epubjs'

// Static list of available epub files
const availableBooks = [
  {
    id: 'salmo-23-bambini-it',
    title: 'Il Salmo 23 per Bambini',
    file: '/books/epub/salmo-23-bambini-it.epub',
    lang: 'Italiano',
    cover: null as string | null,
  },
  {
    id: 'salmo-23-bambini-en',
    title: 'Psalm 23 for Children',
    file: '/books/epub/salmo-23-bambini-en.epub',
    lang: 'English',
    cover: null as string | null,
  },
  {
    id: 'psalm-23-abundance-de',
    title: 'Psalm 23: Abundance',
    file: '/books/epub/psalm-23-abundance-de.epub',
    lang: 'Deutsch',
    cover: null as string | null,
  },
  {
    id: 'psalm-23-abundance-es',
    title: 'Salmo 23: Abundancia',
    file: '/books/epub/psalm-23-abundance-es.epub',
    lang: 'Espanol',
    cover: null as string | null,
  },
  {
    id: 'psalm-23-abundance-fr',
    title: 'Psaume 23: Abondance',
    file: '/books/epub/psalm-23-abundance-fr.epub',
    lang: 'Francais',
    cover: null as string | null,
  },
  {
    id: 'psalm-23-abundance-ko',
    title: 'Psalm 23: Abundance',
    file: '/books/epub/psalm-23-abundance-ko.epub',
    lang: 'Korean',
    cover: null as string | null,
  },
]

// Book Card Component
function BookCard({ book, onClick }: { book: typeof availableBooks[0], onClick: () => void }) {
  const [cover, setCover] = useState<string | null>(null)

  useEffect(() => {
    // Try to extract cover from epub
    const loadCover = async () => {
      try {
        const epub = ePub(book.file)
        await epub.ready
        const coverUrl = await epub.coverUrl()
        if (coverUrl) {
          setCover(coverUrl)
        }
        epub.destroy()
      } catch (e) {
        // Cover extraction failed, use placeholder
      }
    }
    loadCover()
  }, [book.file])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 border border-onde-coral/10 hover:border-onde-coral/30">
        {/* Book Cover */}
        <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-onde-cream to-onde-sand">
          {cover ? (
            <img
              src={cover}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">📖</div>
                <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-onde-coral via-onde-gold to-onde-teal" />
              </div>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-onde-ocean/80 via-onde-ocean/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
            <span className="text-white font-semibold px-6 py-3 rounded-full bg-onde-coral/90 flex items-center gap-2">
              <span>Leggi ora</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-5">
          <h3 className="font-display font-bold text-onde-ocean text-lg mb-2 line-clamp-2 group-hover:text-onde-coral transition-colors">
            {book.title}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-sm text-onde-ocean/60 bg-onde-cream/50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {book.lang}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Epub Reader Component
function EpubReaderModal({
  book,
  onClose
}: {
  book: typeof availableBooks[0],
  onClose: () => void
}) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string>('')
  const [toc, setToc] = useState<NavItem[]>([])
  const [showToc, setShowToc] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light')
  const [progress, setProgress] = useState(0)

  const themes = {
    light: {
      body: { background: '#ffffff', color: '#1B4F72' },
      name: 'Giorno',
      icon: '☀️',
      bgClass: 'bg-white',
      textClass: 'text-onde-ocean',
    },
    sepia: {
      body: { background: '#FDF6E3', color: '#44403c' },
      name: 'Seppia',
      icon: '📜',
      bgClass: 'bg-onde-cream',
      textClass: 'text-stone-700',
    },
    dark: {
      body: { background: '#0a1628', color: '#e8f4f8' },
      name: 'Notte',
      icon: '🌙',
      bgClass: 'bg-[#0a1628]',
      textClass: 'text-gray-100',
    },
  }

  // Initialize epub
  useEffect(() => {
    if (!viewerRef.current) return

    const initBook = async () => {
      try {
        setLoading(true)
        setError(null)

        // Create book instance
        const epub = ePub(book.file)
        bookRef.current = epub

        // Wait for book to be ready
        await epub.ready

        // Get table of contents
        const navigation = await epub.loaded.navigation
        if (navigation.toc) {
          setToc(navigation.toc)
        }

        // Create rendition
        const rendition = epub.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
        })

        renditionRef.current = rendition

        // Apply initial theme
        rendition.themes.default({
          body: themes[theme].body,
          'p, span, div': {
            'font-family': 'Georgia, serif !important',
            'line-height': '1.8 !important',
          },
        })

        // Display book
        await rendition.display()

        // Track location changes
        rendition.on('relocated', (location: { start: { cfi: string, percentage: number } }) => {
          setCurrentLocation(location.start.cfi)
          setProgress(Math.round(location.start.percentage * 100))
        })

        setLoading(false)
      } catch (e) {
        console.error('Error loading epub:', e)
        setError('Impossibile caricare il libro. Riprova.')
        setLoading(false)
      }
    }

    initBook()

    // Cleanup
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy()
      }
      if (bookRef.current) {
        bookRef.current.destroy()
      }
    }
  }, [book.file])

  // Update theme
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.default({
        body: themes[theme].body,
        'p, span, div': {
          'font-family': 'Georgia, serif !important',
          'line-height': '1.8 !important',
        },
      })
    }
  }, [theme])

  // Update font size
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}%`)
    }
  }, [fontSize])

  // Navigation handlers
  const goNext = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.next()
    }
  }, [])

  const goPrev = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.prev()
    }
  }, [])

  const goToChapter = useCallback((href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href)
      setShowToc(false)
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose])

  const cycleTheme = () => {
    const themeOrder: ('light' | 'sepia' | 'dark')[] = ['light', 'sepia', 'dark']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const currentTheme = themes[theme]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Reader Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`relative z-10 flex flex-col w-full h-full max-w-5xl mx-auto ${currentTheme.bgClass}`}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-onde-teal via-onde-gold to-onde-coral"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header */}
        <header className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-onde-ocean/10'}`}>
          <button
            onClick={onClose}
            className={`flex items-center gap-2 ${currentTheme.textClass} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline font-medium">Chiudi</span>
          </button>

          <h1 className={`font-display font-bold ${currentTheme.textClass} text-sm sm:text-base truncate max-w-[50%] text-center`}>
            {book.title}
          </h1>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-onde-ocean/10 hover:bg-onde-ocean/20'} transition-colors`}
              title={`Tema: ${currentTheme.name}`}
            >
              {currentTheme.icon}
            </button>

            {/* Font size controls */}
            <button
              onClick={() => setFontSize(s => Math.max(80, s - 10))}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-onde-ocean/10 hover:bg-onde-ocean/20 text-onde-ocean'} transition-colors`}
              title="Riduci testo"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(s => Math.min(150, s + 10))}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-onde-ocean/10 hover:bg-onde-ocean/20 text-onde-ocean'} transition-colors`}
              title="Ingrandisci testo"
            >
              A+
            </button>

            {/* TOC toggle */}
            {toc.length > 0 && (
              <button
                onClick={() => setShowToc(!showToc)}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-onde-ocean/10 hover:bg-onde-ocean/20 text-onde-ocean'} transition-colors`}
                title="Indice"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 relative overflow-hidden">
          {/* TOC Sidebar */}
          <AnimatePresence>
            {showToc && (
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] z-20 ${currentTheme.bgClass} border-l ${theme === 'dark' ? 'border-white/10' : 'border-onde-ocean/10'} shadow-2xl overflow-y-auto`}
              >
                <div className="p-5">
                  <h3 className={`font-display font-bold text-lg mb-4 ${theme === 'dark' ? 'text-onde-gold' : 'text-onde-coral'}`}>
                    Indice
                  </h3>
                  <nav className="space-y-1">
                    {toc.map((chapter, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToChapter(chapter.href)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${currentTheme.textClass} opacity-70 hover:opacity-100 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-onde-ocean/10'}`}
                      >
                        {chapter.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full border-4 border-onde-teal/20 border-t-onde-teal animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">📖</span>
                  </div>
                </div>
                <p className={`mt-4 ${currentTheme.textClass} animate-pulse`}>Caricamento...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">😕</div>
                <p className={`${currentTheme.textClass} mb-4`}>{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-onde-coral text-white rounded-full font-semibold hover:bg-onde-coral-dark transition-colors"
                >
                  Torna alla libreria
                </button>
              </div>
            </div>
          )}

          {/* Epub viewer */}
          <div
            ref={viewerRef}
            className={`w-full h-full ${loading || error ? 'invisible' : 'visible'}`}
            style={{ minHeight: '400px' }}
          />

          {/* Navigation buttons */}
          {!loading && !error && (
            <>
              <button
                onClick={goPrev}
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-onde-ocean/10 hover:bg-onde-ocean/20 text-onde-ocean'} transition-all opacity-50 hover:opacity-100`}
                title="Pagina precedente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-onde-ocean/10 hover:bg-onde-ocean/20 text-onde-ocean'} transition-all opacity-50 hover:opacity-100`}
                title="Pagina successiva"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className={`px-4 py-3 border-t ${theme === 'dark' ? 'border-white/10' : 'border-onde-ocean/10'} flex items-center justify-between text-sm`}>
          <span className={`${currentTheme.textClass} opacity-60`}>
            {progress}% completato
          </span>
          <div className="flex items-center gap-4">
            <span className={`${currentTheme.textClass} opacity-60 hidden sm:inline`}>
              Usa le frecce o clicca per navigare
            </span>
            <div className="flex items-center gap-2">
              <span className="text-onde-teal">🌊</span>
              <span className={`${currentTheme.textClass} opacity-60 font-medium`}>Onde</span>
            </div>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  )
}

// Main Page Component
export default function LeggiPage() {
  const [selectedBook, setSelectedBook] = useState<typeof availableBooks[0] | null>(null)

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <span className="section-badge">
                <span className="text-xl">📚</span>
                <span>Libreria Digitale</span>
              </span>

              <h1 className="section-title">
                Leggi i Nostri{' '}
                <span className="text-gradient-sunset">Libri</span>
              </h1>

              <p className="section-subtitle mt-4">
                Sfoglia e leggi i libri illustrati di Onde direttamente nel browser.
                Un&apos;esperienza di lettura pensata per le famiglie.
              </p>
            </motion.div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {availableBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => setSelectedBook(book)}
                />
              ))}
            </div>

            {/* Empty state if no books */}
            {availableBooks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="text-6xl mb-6">📚</div>
                <h2 className="text-2xl font-display font-bold text-onde-ocean mb-4">
                  Nessun libro disponibile
                </h2>
                <p className="text-onde-ocean/60 max-w-md mx-auto">
                  I nostri libri saranno presto disponibili. Torna a trovarci!
                </p>
                <Link
                  href="/"
                  className="btn-primary mt-8 inline-flex"
                >
                  Torna alla Home
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-transparent to-onde-cream/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-onde-coral/10"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-onde-coral/20 to-onde-gold/20 flex items-center justify-center text-3xl">
                  📱
                </div>
                <h3 className="font-display font-bold text-onde-ocean text-lg mb-2">
                  Leggi Ovunque
                </h3>
                <p className="text-onde-ocean/60 text-sm">
                  Accedi ai tuoi libri da qualsiasi dispositivo, anche offline dopo il primo caricamento.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-onde-teal/10"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-onde-teal/20 to-onde-blue/20 flex items-center justify-center text-3xl">
                  🌙
                </div>
                <h3 className="font-display font-bold text-onde-ocean text-lg mb-2">
                  Modalita Notte
                </h3>
                <p className="text-onde-ocean/60 text-sm">
                  Tre temi di lettura: giorno, seppia e notte per leggere in ogni condizione.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-onde-gold/10"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-onde-gold/20 to-onde-coral/20 flex items-center justify-center text-3xl">
                  👨‍👩‍👧‍👦
                </div>
                <h3 className="font-display font-bold text-onde-ocean text-lg mb-2">
                  Per Tutta la Famiglia
                </h3>
                <p className="text-onde-ocean/60 text-sm">
                  Contenuti selezionati e illustrati con cura per essere letti insieme.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedBook && (
          <EpubReaderModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
