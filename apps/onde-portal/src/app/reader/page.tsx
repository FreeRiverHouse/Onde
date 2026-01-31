'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'
import { useTranslations } from '@/i18n/I18nProvider'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  readUrl: string
  category: string
}

// Featured books available for online reading
const featuredBooks: Book[] = [
  {
    id: 'salmo-23',
    title: 'Il Salmo 23',
    author: 'Onde',
    cover: '/books/shepherds-promise-cover.jpg',
    readUrl: '/libro/salmo-23',
    category: 'Faith',
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    author: 'Onde',
    cover: '/images/books/piccole-rime-stella.jpg',
    readUrl: '/libro/piccole-rime',
    category: 'Poetry',
  },
]

// Sun icon component
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

// Moon icon component
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

export default function ReaderPage() {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('reader-dark-mode')
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true')
    }
  }, [])

  // Apply dark mode class and save preference
  useEffect(() => {
    localStorage.setItem('reader-dark-mode', String(isDarkMode))
  }, [isDarkMode])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  return (
    <main className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-onde-cream via-white to-onde-cream/30'
    }`}>
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className={`fixed top-24 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isDarkMode
            ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600'
            : 'bg-white text-slate-700 hover:bg-gray-100'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <motion.div
          key={isDarkMode ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </motion.div>
      </motion.button>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl transition-colors duration-500 ${
            isDarkMode ? 'bg-blue-500/10' : 'bg-onde-gold/10'
          }`} />
          <div className={`absolute bottom-0 right-10 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${
            isDarkMode ? 'bg-purple-500/10' : 'bg-onde-coral/10'
          }`} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className={`transition-colors duration-500 ${isDarkMode ? '[&_h2]:text-white [&_p]:text-gray-300 [&_span]:bg-slate-700 [&_span]:text-gray-200' : ''}`}>
            <SectionHeader
              badge="📖 Reader"
              title="Read Online"
              subtitle="Enjoy our illustrated books directly in your browser. Beautiful stories for the whole family!"
              centered
            />
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-[3/4] rounded-2xl animate-pulse transition-colors duration-500 ${
                    isDarkMode ? 'bg-slate-700' : 'bg-onde-cream'
                  }`}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredBooks.map((book, index) => (
                  <AnimatedCard key={book.id} delay={index * 0.1}>
                    <Link href={book.readUrl} className="block group">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg
                                    group-hover:shadow-2xl transition-shadow duration-300">
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="inline-block px-3 py-1 mb-2 text-xs font-medium
                                         bg-onde-coral/90 text-white rounded-full">
                            {book.category}
                          </span>
                          <h3 className="text-xl font-display font-bold text-white mb-1">
                            {book.title}
                          </h3>
                          <p className="text-white/80 text-sm">{book.author}</p>
                        </div>
                        <div className="absolute top-4 right-4">
                          <motion.div
                            className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center
                                     shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                          >
                            <svg className="w-5 h-5 text-onde-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </AnimatedCard>
                ))}

                {/* Coming Soon Card */}
                <AnimatedCard delay={featuredBooks.length * 0.1}>
                  <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden
                                border-2 border-dashed transition-colors duration-500
                                flex flex-col items-center justify-center p-8 text-center ${
                                  isDarkMode
                                    ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-gray-600'
                                    : 'bg-gradient-to-br from-onde-teal/20 to-onde-gold/20 border-onde-ocean/20'
                                }`}>
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className={`text-xl font-display font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-onde-ocean'
                    }`}>
                      More Coming Soon!
                    </h3>
                    <p className={`text-sm mb-6 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-onde-ocean/60'
                    }`}>
                      New books are added regularly. Check back often!
                    </p>
                    <Link href="/libri">
                      <Button variant="secondary" size="sm">
                        Browse Library
                      </Button>
                    </Link>
                  </div>
                </AnimatedCard>
              </div>

              {/* CTA Section */}
              <motion.div
                className="mt-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className={`mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-onde-ocean/70'
                }`}>
                  Want to download books for offline reading?
                </p>
                <Link href="/libri">
                  <Button variant="primary" size="lg">
                    Visit Full Library
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
