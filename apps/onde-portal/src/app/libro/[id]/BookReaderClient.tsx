'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { books, Book } from '@/data/books'

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
  chapters: { title: string; content: string }[]
  wordCount: number
}

// Parse Gutenberg text into chapters
function parseGutenbergText(text: string, book: Book): BookData {
  // Remove Gutenberg header and footer
  const startMarkers = [
    '*** START OF THE PROJECT GUTENBERG EBOOK',
    '*** START OF THIS PROJECT GUTENBERG EBOOK',
    '*END*THE SMALL PRINT',
  ]
  const endMarkers = [
    '*** END OF THE PROJECT GUTENBERG EBOOK',
    '*** END OF THIS PROJECT GUTENBERG EBOOK',
    'End of the Project Gutenberg',
    'End of Project Gutenberg',
  ]

  let content = text
  for (const marker of startMarkers) {
    const idx = content.indexOf(marker)
    if (idx !== -1) {
      content = content.substring(idx + marker.length)
      break
    }
  }
  for (const marker of endMarkers) {
    const idx = content.indexOf(marker)
    if (idx !== -1) {
      content = content.substring(0, idx)
      break
    }
  }

  content = content.trim()

  // Try to split by chapters
  const chapterRegex = /\n\s*(CHAPTER|Chapter|PART|Part|BOOK|Book)\s+([IVXLCDM\d]+|[A-Z]+|\d+)[.\s]*/gi
  const chapters: { title: string; content: string }[] = []

  const parts = content.split(chapterRegex)

  if (parts.length > 3) {
    // We have chapters
    for (let i = 1; i < parts.length; i += 3) {
      const type = parts[i] || 'Chapter'
      const num = parts[i + 1] || ''
      const chapterContent = parts[i + 2] || ''

      // Extract chapter title (usually on first line)
      const lines = chapterContent.trim().split('\n')
      let title = `${type} ${num}`

      // Look for title in first few lines
      for (let j = 0; j < Math.min(3, lines.length); j++) {
        const line = lines[j].trim()
        if (line && !line.match(/^[\d\s]+$/) && line.length < 100) {
          title = `${type} ${num}: ${line}`
          break
        }
      }

      chapters.push({
        title: title,
        content: chapterContent.trim()
      })
    }
  } else {
    // No chapters found, treat as single section
    chapters.push({
      title: book.title,
      content: content
    })
  }

  // Count words
  const wordCount = content.split(/\s+/).filter(Boolean).length

  return {
    title: book.title,
    author: book.author,
    lang: book.lang || 'en',
    content: content,
    chapters: chapters,
    wordCount: wordCount
  }
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
  const [readingProgress, setReadingProgress] = useState(0)
  const [theme, setTheme] = useState<'notte' | 'giorno' | 'seppia'>('notte')
  const contentRef = useRef<HTMLDivElement>(null)

  const book = booksMap[bookId]

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

  // Fetch book directly from Gutenberg (client-side)
  useEffect(() => {
    if (!bookId) return

    if (!book?.gutenberg) {
      setError('Contenuto in arrivo')
      setLoading(false)
      return
    }

    const fetchBook = async () => {
      try {
        // Fetch directly from Project Gutenberg
        const gutenbergUrl = `https://www.gutenberg.org/cache/epub/${book.gutenberg}/pg${book.gutenberg}.txt`

        const response = await fetch(gutenbergUrl)
        if (!response.ok) {
          throw new Error('Non disponibile')
        }

        const text = await response.text()
        const parsed = parseGutenbergText(text, book)
        setBookData(parsed)
      } catch (err) {
        setError('Impossibile caricare il libro. Prova a ricaricare la pagina.')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [book, bookId])

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

              {bookData && bookData.chapters.length > 1 && (
                <button
                  onClick={() => setShowToc(!showToc)}
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

      {/* TOC Sidebar */}
      {showToc && bookData && bookData.chapters.length > 1 && (
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

          {/* FREE DOWNLOAD BUTTONS */}
          {book.gutenberg && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href={`https://www.gutenberg.org/ebooks/${book.gutenberg}.epub3.images`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] text-[#0a1628] font-bold text-sm hover:scale-105 transition-transform shadow-lg"
              >
                <span>📱</span> ePub Gratis
              </a>
              <a
                href={`https://www.gutenberg.org/ebooks/${book.gutenberg}.kf8.images`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0a1628] font-bold text-sm hover:scale-105 transition-transform shadow-lg"
              >
                <span>📚</span> Kindle Gratis
              </a>
              <a
                href={`https://www.gutenberg.org/ebooks/${book.gutenberg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white font-medium text-sm hover:scale-105 transition-transform"
              >
                <span>🌐</span> Altri formati
              </a>
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
          <p className={`${t.muted} text-sm`}>
            Testo da Project Gutenberg
          </p>
          <p className={`${t.accent} text-sm font-medium mt-1`}>
            Onde Publishing
          </p>
        </div>
      </footer>
    </div>
  )
}
