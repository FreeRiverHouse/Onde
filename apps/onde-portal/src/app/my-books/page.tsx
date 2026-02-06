'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { useTranslations } from '@/i18n'
import { useReadingList } from '@/hooks/useReadingList'
import { useDownloadTracker } from '@/hooks/useDownloadTracker'
import { useEffect, useState } from 'react'

interface Book {
  id: string
  title: string
  subtitle: string
  author: string
  description: string
  category: string
  coverImage: string
  pdfLink: string
  epubLink?: string
  price: string
  isFree: boolean
  pages?: number
  readingTime?: string
}

// Same book data as /libri - in production this would come from a shared source
const allBooks: Book[] = [
  {
    id: 'meditations',
    title: 'Meditations',
    subtitle: 'Thoughts to Himself',
    author: 'Marcus Aurelius',
    description: 'Personal notes of a Roman Emperor. Stoic philosophy. George Long translation (1862).',
    category: 'Philosophy',
    coverImage: '/books/meditations-cover.jpg',
    pdfLink: '/books/meditations-en.pdf',
    epubLink: '/books/epub/meditations-en.epub',
    price: 'Free',
    isFree: true,
    pages: 112,
    readingTime: '~3h',
  },
  {
    id: 'shepherds-promise',
    title: "The Shepherd's Promise",
    subtitle: 'Psalm 23 Illustrated',
    author: 'Biblical Tradition',
    description: 'Psalm 23 with watercolor illustrations.',
    category: 'Spirituality',
    coverImage: '/books/shepherds-promise-cover.jpg',
    pdfLink: '/books/the-shepherds-promise.pdf',
    epubLink: '/books/epub/the-shepherds-promise.epub',
    price: 'Free',
    isFree: true,
    pages: 12,
    readingTime: '~5 min',
  },
]

export default function MyBooksPage() {
  const t = useTranslations()
  const { getReadingList, removeFromReadingList, clearReadingList, mounted: readingListMounted } = useReadingList()
  const { trackDownload, getBookStats } = useDownloadTracker()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const readingList = getReadingList()
  const bookmarkedBooks = allBooks.filter(book =>
    readingList.some(item => item.bookId === book.id)
  )

  const handleDownload = (bookId: string, format: 'pdf' | 'epub') => {
    trackDownload(bookId, format)
  }

  if (!mounted || !readingListMounted) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl
                       bg-gradient-to-br from-amber-500 to-amber-600
                       shadow-xl shadow-amber-500/30 mb-8"
          >
            <span className="text-5xl">📖</span>
          </motion.div>

          <SectionHeader
            badge="Your Collection"
            title="My Reading List"
            subtitle={bookmarkedBooks.length > 0
              ? `${bookmarkedBooks.length} book${bookmarkedBooks.length !== 1 ? 's' : ''} saved for later`
              : "Save books you want to read later"
            }
            gradient="coral"
          />

          {/* Actions */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/libri/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-onde-ocean/10 text-onde-ocean text-sm font-medium
                         hover:bg-onde-ocean/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse Library
            </Link>
            {bookmarkedBooks.length > 0 && (
              <button
                onClick={clearReadingList}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                           bg-red-100 text-red-700 text-sm font-medium
                           hover:bg-red-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear List
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Reading List */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {bookmarkedBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">
              Your reading list is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Browse our library and click the bookmark icon on any book to save it for later.
            </p>
            <Link
              href="/libri/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                         bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold
                         shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                         transition-all duration-300 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Explore Our Books
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {bookmarkedBooks.map((book, index) => (
              <motion.div
                key={book.id}
                className="bg-white/90 backdrop-blur-sm rounded-3xl border border-amber-200/50
                           shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-contain p-4"
                    priority={index === 0}
                  />
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-semibold
                                 bg-amber-900/80 text-amber-100 backdrop-blur-md shadow-lg">
                    {book.category}
                  </span>
                  {/* Remove Bookmark Button */}
                  <button
                    onClick={() => removeFromReadingList(book.id)}
                    aria-label="Remove from reading list"
                    className="absolute top-4 right-4 p-2 rounded-xl shadow-lg backdrop-blur-md
                               bg-amber-500 text-white hover:bg-red-500 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-2xl font-display font-bold text-amber-900 mb-1">
                    {book.title}
                  </h2>
                  <p className="text-amber-900 mb-1">{book.subtitle}</p>
                  <p className="text-gray-700 text-sm mb-2">by {book.author}</p>

                  {/* Reading info */}
                  {(book.pages || book.readingTime) && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      {book.pages && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {book.pages} pages
                        </span>
                      )}
                      {book.readingTime && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {book.readingTime}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-gray-800 text-sm leading-relaxed mb-6 line-clamp-3">
                    {book.description}
                  </p>

                  {/* Download Stats */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {getBookStats(book.id).count > 0 ? (
                      <span>{getBookStats(book.id).count} download{getBookStats(book.id).count !== 1 ? 's' : ''}</span>
                    ) : (
                      <span>Not downloaded yet</span>
                    )}
                  </div>

                  {/* Download Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={book.pdfLink}
                      download
                      onClick={() => handleDownload(book.id, 'pdf')}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                               bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm
                               shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                               transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                    {book.epubLink && (
                      <a
                        href={book.epubLink}
                        download
                        onClick={() => handleDownload(book.id, 'epub')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                                 bg-onde-ocean/10 text-onde-ocean font-semibold text-sm
                                 hover:bg-onde-ocean/20 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        EPUB
                      </a>
                    )}
                  </div>

                  {/* Free Label */}
                  {book.isFree && (
                    <p className="mt-4 text-xs text-green-600 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Free illustrated edition
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
