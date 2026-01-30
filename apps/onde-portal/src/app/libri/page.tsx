'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { useTranslations } from '@/i18n'
import { useDownloadTracker } from '@/hooks/useDownloadTracker'
import { useReadingList } from '@/hooks/useReadingList'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { BookPreviewModal } from '@/components/BookPreviewModal'
import { useState, useEffect } from 'react'

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
  readingTime?: string // e.g., "~2h" or "~15 min"
}

const books: Book[] = [
  {
    id: 'salmo-23',
    title: 'Il Salmo 23',
    subtitle: 'Salmo Illustrato per Bambini',
    author: 'Onde',
    description: 'Il Salmo 23 con illustrazioni ad acquerello.',
    category: 'Spirituality',
    coverImage: '/books/shepherds-promise-cover.jpg',
    pdfLink: '/books/salmo-23.pdf',
    price: 'Free',
    isFree: true,
    pages: 12,
    readingTime: '~5 min',
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    subtitle: 'Filastrocche Italiane',
    author: 'Antologia',
    description: 'Raccolta di filastrocche e rime tradizionali italiane per bambini. Leggi online!',
    category: 'Poetry',
    coverImage: '/images/books/piccole-rime-stella.jpg',
    pdfLink: '', // Coming soon
    price: 'Free',
    isFree: true,
    pages: 24,
    readingTime: '~10 min',
  },
]

export default function LibriPage() {
  const t = useTranslations()
  const { trackDownload, getBookStats, getTotalDownloads } = useDownloadTracker()
  const { toggleBookmark, isBookmarked, getReadingListCount, mounted: readingListMounted } = useReadingList()
  const { getRecentlyViewedIds, getRecentlyViewedCount, mounted: recentlyViewedMounted } = useRecentlyViewed()
  const [mounted, setMounted] = useState(false)
  const [previewBook, setPreviewBook] = useState<Book | null>(null)
  
  // Get recently viewed books (filter books array by recently viewed IDs)
  const recentlyViewedBooks = recentlyViewedMounted 
    ? books.filter(book => getRecentlyViewedIds().includes(book.id))
    : []
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownload = (bookId: string, format: 'pdf' | 'epub') => {
    trackDownload(bookId, format)
  }

  const handleBookmark = (bookId: string) => {
    toggleBookmark(bookId)
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
                       bg-gradient-to-br from-onde-coral to-onde-coral-light
                       shadow-xl shadow-onde-coral/30 mb-8"
          >
            <span className="text-5xl">📚</span>
          </motion.div>

          <SectionHeader
            badge={t.books.badge}
            title={t.books.title}
            subtitle={t.books.subtitle}
            gradient="coral"
          />
          
          {/* Stats Counters */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {mounted && getTotalDownloads() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                           bg-green-100 text-green-700 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" />
                </svg>
                {getTotalDownloads()} total downloads
              </motion.div>
            )}
            {readingListMounted && getReadingListCount() > 0 && (
              <motion.a
                href="/my-books"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                           bg-amber-100 text-amber-700 text-sm font-medium
                           hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                {getReadingListCount()} in reading list
              </motion.a>
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewedMounted && recentlyViewedBooks.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🕐</span>
            <h2 className="text-xl font-display font-bold text-amber-900">Recently Viewed</h2>
            <span className="text-sm text-gray-500">({getRecentlyViewedCount()})</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-200">
            {recentlyViewedBooks.map((book, index) => (
              <Link
                key={book.id}
                href={`/libro/${book.id}`}
                className="flex-shrink-0 group"
              >
                <motion.div
                  className="w-32 bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-200/50
                             shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100">
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-amber-900 truncate">{book.title}</p>
                    <p className="text-[10px] text-gray-500 truncate">{book.author}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Books Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {books.map((book, index) => (
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
                {/* Bookmark + Price Badges */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {/* Bookmark Button */}
                  {readingListMounted && (
                    <button
                      onClick={() => handleBookmark(book.id)}
                      aria-label={isBookmarked(book.id) ? 'Remove from reading list' : 'Add to reading list'}
                      className={`p-2 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300
                                 ${isBookmarked(book.id)
                                   ? 'bg-amber-500 text-white hover:bg-amber-600'
                                   : 'bg-white/80 text-amber-900 hover:bg-amber-100'}`}
                    >
                      <svg className="w-4 h-4" fill={isBookmarked(book.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  )}
                  {/* Price Badge */}
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg
                                 ${book.isFree
                                   ? 'bg-green-500 text-white'
                                   : 'bg-amber-500 text-white'}`}>
                    {book.price}
                  </span>
                </div>
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
                {mounted && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {getBookStats(book.id).count > 0 ? (
                      <span>{getBookStats(book.id).count} download{getBookStats(book.id).count !== 1 ? 's' : ''}</span>
                    ) : (
                      <span>Be the first to download!</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewBook(book)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                             bg-gray-100 text-gray-700 font-semibold text-sm
                             hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  
                  {/* Download Buttons */}
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
      </section>

      {/* Coming Soon */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-onde-ocean/5 to-onde-teal/10
                     p-8 md:p-12 text-center border border-onde-ocean/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-4xl mb-4 block">📖</span>
          <h3 className="text-2xl font-display font-bold text-onde-ocean mb-4">
            More Books Coming Soon
          </h3>
          <p className="text-gray-700 max-w-lg mx-auto">
            We&apos;re preparing more beautifully illustrated editions of classic literature.
            Stay tuned for new releases.
          </p>
        </motion.div>
      </section>
      
      {/* Book Preview Modal */}
      {previewBook && (
        <BookPreviewModal
          isOpen={!!previewBook}
          onClose={() => setPreviewBook(null)}
          book={previewBook}
        />
      )}
    </div>
  )
}
