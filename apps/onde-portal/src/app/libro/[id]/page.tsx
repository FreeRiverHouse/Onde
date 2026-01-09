'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { books, Book } from '@/data/books'

// Create a lookup map for faster access
const booksMap: Record<string, Book> = {}
books.forEach(book => {
  booksMap[book.id] = book
})

export default function BookReader({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(18)

  const book = booksMap[params.id]

  useEffect(() => {
    if (!book?.gutenberg) {
      setError('Contenuto in arrivo')
      setLoading(false)
      return
    }

    const fetchBook = async () => {
      try {
        const response = await fetch(
          `https://www.gutenberg.org/cache/epub/${book.gutenberg}/pg${book.gutenberg}.txt`
        )

        if (!response.ok) {
          throw new Error('Non disponibile')
        }

        const text = await response.text()

        // Clean up Gutenberg header/footer
        let cleanText = text
        const startIdx = text.indexOf('*** START OF')
        const endIdx = text.indexOf('*** END OF')

        if (startIdx !== -1) {
          const afterStart = text.indexOf('\n', startIdx)
          cleanText = text.substring(afterStart + 1)
        }

        if (endIdx !== -1) {
          cleanText = cleanText.substring(0, cleanText.indexOf('*** END OF'))
        }

        setContent(cleanText.trim())
      } catch (err) {
        setError('Impossibile caricare')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [book])

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Non trovato</h1>
        <Link href="/catalogo" className="text-onde-gold hover:underline">
          Biblioteca
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-onde-dark">
      {/* Header fisso mobile-friendly */}
      <header className="sticky top-0 bg-onde-dark/95 backdrop-blur border-b border-onde-gold/20 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/catalogo" className="text-onde-gold text-sm">
            ← Biblioteca
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="w-8 h-8 rounded bg-onde-gold/20 text-onde-gold text-sm font-bold"
              aria-label="Diminuisci font"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(s => Math.min(28, s + 2))}
              className="w-8 h-8 rounded bg-onde-gold/20 text-onde-gold text-sm font-bold"
              aria-label="Aumenta font"
            >
              A+
            </button>
          </div>
        </div>
      </header>

      {/* Titolo */}
      <div className="max-w-2xl mx-auto px-4 py-4 border-b border-onde-gold/10">
        <h1 className="text-lg md:text-xl font-bold">{book.title}</h1>
        <p className="text-sm opacity-60">{book.author}</p>
        {book.lang && book.lang !== 'en' && (
          <span className="text-xs bg-onde-gold/20 text-onde-gold px-2 py-1 rounded mt-2 inline-block">
            {book.lang.toUpperCase()}
          </span>
        )}
      </div>

      {/* Contenuto */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-onde-gold">Caricamento...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="opacity-60 mb-4">{error}</p>
            <Link href="/catalogo" className="text-onde-gold hover:underline">
              Torna alla biblioteca
            </Link>
          </div>
        ) : (
          <article
            className="text-stone-200 whitespace-pre-wrap"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.8',
              wordBreak: 'break-word'
            }}
          >
            {content}
          </article>
        )}
      </main>
    </div>
  )
}
