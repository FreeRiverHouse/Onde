'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import { useTranslations } from '@/i18n'

interface Book {
  id: string
  title: string
  subtitle: string
  author: string
  description: string
  category: string
  coverImage: string
  pdfLink: string
  epubLink: string
}

const books: Book[] = [
  {
    id: 'meditations',
    title: 'Meditations',
    subtitle: 'Thoughts to Himself',
    author: 'Marcus Aurelius',
    description: 'The private reflections of the Roman Emperor Marcus Aurelius, written during his military campaigns. A timeless guide to Stoic philosophy, self-discipline, and finding inner peace amidst chaos. Translated by George Long (1862).',
    category: 'Philosophy',
    coverImage: '/books/meditations-cover.jpg',
    pdfLink: '/books/meditations-en.pdf',
    epubLink: '/books/epub/meditations-en.epub',
  },
]

export default function LibriPage() {
  const t = useTranslations()
  const book = books[0]

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
        </div>
      </section>

      {/* Featured Book - Meditations */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-200/50
                     shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] md:aspect-auto">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
              {/* Category Badge */}
              <span className="absolute top-6 left-6 px-4 py-2 rounded-xl text-sm font-semibold
                             bg-amber-900/80 text-amber-100 backdrop-blur-md shadow-lg">
                {book.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-4xl font-display font-bold text-amber-900 mb-2">
                  {book.title}
                </h2>
                <p className="text-lg text-amber-700/80 mb-2">{book.subtitle}</p>
                <p className="text-onde-ocean/60 mb-6">by {book.author}</p>

                <p className="text-onde-ocean/70 leading-relaxed mb-8">
                  {book.description}
                </p>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={book.pdfLink}
                    download
                    className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl
                             bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold
                             shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                             transition-all duration-300 hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </a>
                  <a
                    href={book.epubLink}
                    download
                    className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl
                             bg-onde-ocean/10 text-onde-ocean font-semibold
                             hover:bg-onde-ocean/20 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Download EPUB
                  </a>
                </div>

                {/* Free Label */}
                <p className="mt-6 text-sm text-amber-600/80 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free illustrated edition - Public Domain
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
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
          <p className="text-onde-ocean/60 max-w-lg mx-auto">
            We&apos;re preparing more beautifully illustrated editions of classic literature.
            Stay tuned for new releases.
          </p>
        </motion.div>
      </section>
    </div>
  )
}
