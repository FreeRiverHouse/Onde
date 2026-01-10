'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import { useTranslations } from '@/i18n'

type BookSource = 'classic' | 'onde-studio'

interface Book {
  id: string
  title: string
  subtitle: string
  author: string
  description: string
  category: string
  price: number
  featured: boolean
  color: 'coral' | 'teal' | 'gold'
  coverImage: string
  kdpLink: string
  source: BookSource
}

const books: Book[] = [
  // === CLASSICI (Public Domain - Gutenberg) ===
  {
    id: 'alice',
    title: 'Alice nel Paese delle Meraviglie',
    subtitle: 'Edizione Illustrata',
    author: 'Lewis Carroll',
    description: 'Il viaggio di Alice nel mondo capovolto. Illustrazioni originali in stile acquarello europeo.',
    category: 'classici',
    price: 0,
    featured: true,
    color: 'coral' as const,
    coverImage: '/books/alice-cover.jpg',
    kdpLink: '#',
    source: 'classic',
  },
  {
    id: 'jungle-book',
    title: 'Il Libro della Giungla',
    subtitle: 'Edizione Illustrata',
    author: 'Rudyard Kipling',
    description: 'Mowgli e i suoi amici della giungla. La legge del branco, l\'amicizia e il coraggio.',
    category: 'classici',
    price: 0,
    featured: true,
    color: 'teal' as const,
    coverImage: '/books/jungle-book-cover.jpg',
    kdpLink: '#',
    source: 'classic',
  },
  {
    id: 'peter-rabbit',
    title: 'Peter Rabbit',
    subtitle: 'Le Avventure Complete',
    author: 'Beatrix Potter',
    description: 'Il coniglio piu famoso della letteratura inglese. Illustrazioni fedeli allo spirito originale.',
    category: 'classici',
    price: 0,
    featured: true,
    color: 'gold' as const,
    coverImage: '/books/peter-rabbit-cover.jpg',
    kdpLink: '#',
    source: 'classic',
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    subtitle: 'Poesie Italiane per Bambini',
    author: 'Lina Schwarz, A.S. Novaro',
    description: 'Le piu belle filastrocche della tradizione italiana, illustrate ad acquarello. Stella Stellina, La Pioggerellina di Marzo e altre perle poetiche.',
    category: 'poesia',
    price: 0,
    featured: false,
    color: 'gold' as const,
    coverImage: '/books/piccole-rime-cover.jpg',
    kdpLink: 'https://www.amazon.com/dp/PLACEHOLDER_PICCOLERIME',
    source: 'classic',
  },
  // === ONDE STUDIO (Creati da Onde con AI) ===
  {
    id: 'salmo-23',
    title: 'Il Pastore',
    subtitle: 'Il Salmo 23 per Bambini',
    author: 'Tradizione Biblica',
    description: 'Il Salmo piu amato, raccontato e illustrato per i piu piccoli. Un viaggio di fiducia e protezione attraverso pascoli verdeggianti e acque tranquille.',
    category: 'spiritualita',
    price: 0,
    featured: true,
    color: 'coral' as const,
    coverImage: '/books/salmo-23-cover.jpg',
    kdpLink: 'https://www.amazon.com/dp/PLACEHOLDER_SALMO23',
    source: 'onde-studio',
  },
  {
    id: 'aiko',
    title: 'AIKO',
    subtitle: 'La Mia Amica Robot',
    author: 'Onde',
    description: 'Sofia scopre che la sua nuova amica non e come le altre bambine. E un\'intelligenza artificiale! Un\'avventura di amicizia, tecnologia e scoperta.',
    category: 'tech',
    price: 0,
    featured: true,
    color: 'teal' as const,
    coverImage: '/books/aiko-cover.jpg',
    kdpLink: 'https://www.amazon.com/dp/PLACEHOLDER_AIKO',
    source: 'onde-studio',
  },
  {
    id: 'aiko-2',
    title: 'AIKO 2',
    subtitle: 'L\'Avventura del Robotaxi',
    author: 'Onde',
    description: 'Sofia e AIKO scoprono come funzionano le auto che guidano da sole. Un viaggio dalla nonna diventa una lezione di tecnologia!',
    category: 'tech',
    price: 0,
    featured: false,
    color: 'teal' as const,
    coverImage: '/books/aiko-2-cover.jpg',
    kdpLink: '#',
    source: 'onde-studio',
  },
  {
    id: 'mindfulness-kids',
    title: 'Il Respiro Magico',
    subtitle: 'Mindfulness per Bambini',
    author: 'Onde',
    description: 'Impara a respirare, calmarti e trovare la pace interiore. Esercizi semplici per piccoli guerrieri della tranquillita.',
    category: 'spiritualita',
    price: 0,
    featured: true,
    color: 'coral' as const,
    coverImage: '/books/mindfulness-cover.jpg',
    kdpLink: '#',
    source: 'onde-studio',
  },
]

export default function LibriPage() {
  const t = useTranslations()
  const [activeSection, setActiveSection] = useState<BookSource>('classic')

  const classicBooks = books.filter(b => b.source === 'classic')
  const ondeStudioBooks = books.filter(b => b.source === 'onde-studio')
  const activeBooks = activeSection === 'classic' ? classicBooks : ondeStudioBooks
  const featuredBooks = activeBooks.filter(b => b.featured)

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

        {/* Section Toggle - Classici / Onde Studio */}
        <motion.div
          className="flex justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Classici Tab */}
          <motion.button
            onClick={() => setActiveSection('classic')}
            className={`relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300
              ${activeSection === 'classic'
                ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-900 shadow-lg shadow-amber-200/50 border-2 border-amber-300'
                : 'bg-white/60 text-onde-ocean/60 hover:bg-amber-50/50 hover:text-amber-800 border-2 border-transparent'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div className="text-left">
                <div className="font-display">{t.books.sections.classics}</div>
                <div className="text-xs opacity-70 font-normal">{t.books.sections.classicsSubtitle}</div>
              </div>
            </div>
            {activeSection === 'classic' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-200/30 to-amber-100/30 -z-10"
              />
            )}
          </motion.button>

          {/* Onde Studio Tab */}
          <motion.button
            onClick={() => setActiveSection('onde-studio')}
            className={`relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300
              ${activeSection === 'onde-studio'
                ? 'bg-gradient-to-br from-onde-teal/20 to-onde-coral/10 text-onde-ocean shadow-lg shadow-onde-teal/20 border-2 border-onde-teal/50'
                : 'bg-white/60 text-onde-ocean/60 hover:bg-onde-teal/10 hover:text-onde-ocean border-2 border-transparent'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div className="text-left">
                <div className="font-display">{t.books.sections.ondeStudio}</div>
                <div className="text-xs opacity-70 font-normal">{t.books.sections.ondeStudioSubtitle}</div>
              </div>
            </div>
            {activeSection === 'onde-studio' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-onde-teal/20 to-onde-coral/10 -z-10"
              />
            )}
          </motion.button>
        </motion.div>

        {/* Section Description */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`max-w-2xl mx-auto text-center mb-12 p-6 rounded-2xl ${
            activeSection === 'classic'
              ? 'bg-gradient-to-br from-amber-50/80 to-amber-100/50 border border-amber-200/50'
              : 'bg-gradient-to-br from-onde-teal/5 to-onde-coral/5 border border-onde-teal/20'
          }`}
        >
          {activeSection === 'classic' ? (
            <>
              <h3 className="text-xl font-display font-bold text-amber-900 mb-2">
                {t.books.sections.classicsTitle}
              </h3>
              <p className="text-amber-800/70">
                {t.books.sections.classicsDescription}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-display font-bold text-onde-ocean mb-2">
                {t.books.sections.ondeStudioTitle}
              </h3>
              <p className="text-onde-ocean/70">
                {t.books.sections.ondeStudioDescription}
              </p>
            </>
          )}
        </motion.div>
      </section>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.h3
            className="text-2xl font-display font-bold text-onde-ocean mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.books.featured}
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard book={book} activeSection={activeSection} t={t} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Books Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.h3
          className="text-2xl font-display font-bold text-onde-ocean mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {activeSection === 'classic' ? t.books.sections.allClassics : t.books.sections.allOndeStudio}
        </motion.h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 }}
            >
              <BookCardSmall book={book} activeSection={activeSection} t={t} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-onde-coral to-onde-coral-dark
                     p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            {t.books.freeBooks.title}
          </h3>
          <p className="text-white/70 max-w-lg mx-auto mb-6">
            {t.books.freeBooks.description}
          </p>
          <Button
            href="/catalogo"
            variant="secondary"
            className="bg-white text-onde-coral hover:bg-onde-cream border-0"
          >
            {t.books.freeBooks.exploreCatalog}
          </Button>
        </motion.div>
      </section>
    </div>
  )
}

// Featured Book Card Component
function BookCard({
  book,
  activeSection,
  t
}: {
  book: Book
  activeSection: BookSource
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
}) {
  const isClassic = activeSection === 'classic'

  return (
    <motion.div
      className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl
                 border shadow-card overflow-hidden transition-all duration-500
                 ${isClassic ? 'border-amber-200/50' : 'border-onde-teal/30'}`}
      whileHover={{
        y: -8,
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Cover */}
      <Link href={`/libro/${book.id}`}>
        <div className={`aspect-[3/4] flex items-center justify-center relative overflow-hidden cursor-pointer
                        ${isClassic
                          ? 'bg-gradient-to-br from-amber-100/50 via-amber-50/30 to-amber-100/20'
                          : `bg-gradient-to-br from-onde-${book.color}/20 via-onde-cream/30 to-onde-${book.color}/10`
                        }`}>
          {/* Texture overlay */}
          <div className={`absolute inset-0 ${isClassic ? 'opacity-40' : 'opacity-30'}`}
               style={{
                 backgroundImage: isClassic
                   ? `radial-gradient(ellipse at 30% 20%, rgba(180, 140, 80, 0.2) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(160, 120, 60, 0.15) 0%, transparent 50%)`
                   : `radial-gradient(ellipse at 30% 20%, rgba(255, 127, 127, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(72, 201, 176, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 50%, rgba(244, 208, 63, 0.1) 0%, transparent 70%)`
               }}
          />

          {/* Book icon */}
          <div className="relative z-10 flex flex-col items-center">
            <span className={`text-9xl group-hover:scale-110 transition-transform duration-500 drop-shadow-lg
                            ${isClassic ? 'opacity-40' : 'opacity-30'}`}>
              {isClassic ? '📖' : '📚'}
            </span>
            <span className={`mt-4 px-4 py-2 rounded-xl backdrop-blur-sm text-sm font-medium
                            ${isClassic
                              ? 'bg-amber-100/60 text-amber-900/70'
                              : 'bg-white/60 text-onde-ocean/70'
                            }`}>
              {t.books.watercolorIllustrated}
            </span>
          </div>

          {/* Category Badge */}
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-semibold
                           backdrop-blur-sm capitalize shadow-sm
                           ${isClassic
                             ? 'bg-amber-100/90 text-amber-900'
                             : 'bg-white/90 text-onde-ocean'
                           }`}>
            {book.category}
          </span>

          {/* Source Badge */}
          <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm
                           ${isClassic
                             ? 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900'
                             : 'bg-gradient-to-r from-onde-teal to-onde-teal-light text-white'
                           }`}>
            {isClassic ? t.books.sections.classicBadge : t.books.sections.ondeStudioBadge}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        <Link href={`/libro/${book.id}`}>
          <h4 className={`text-xl font-display font-bold mb-1 transition-colors cursor-pointer
                         ${isClassic
                           ? 'text-amber-900 group-hover:text-amber-700'
                           : 'text-onde-ocean group-hover:text-onde-coral'
                         }`}>
            {book.title}
          </h4>
        </Link>
        <p className="text-sm text-onde-ocean/50 mb-2">{book.subtitle}</p>
        <p className="text-sm text-onde-ocean/40 mb-3">di {book.author}</p>
        <p className="text-onde-ocean/60 text-sm leading-relaxed line-clamp-3">
          {book.description}
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <a
            href={book.kdpLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       font-semibold shadow-lg transition-all duration-300 text-sm
                       ${isClassic
                         ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40'
                         : 'bg-gradient-to-r from-onde-coral to-onde-coral-light text-white shadow-onde-coral/30 hover:shadow-xl hover:shadow-onde-coral/40'
                       }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {t.books.buyOnAmazon}
          </a>
          <Link
            href={`/libro/${book.id}`}
            className="px-4 py-2.5 rounded-xl bg-onde-ocean/5 text-onde-ocean/70 font-medium
                       hover:bg-onde-ocean/10 transition-all duration-300 text-sm"
          >
            {t.books.details}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Small Book Card Component
function BookCardSmall({
  book,
  activeSection,
  t
}: {
  book: Book
  activeSection: BookSource
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
}) {
  const isClassic = activeSection === 'classic'

  return (
    <motion.div
      className="group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cover */}
      <Link href={`/libro/${book.id}`}>
        <div className={`aspect-[3/4] rounded-2xl mb-4 overflow-hidden relative cursor-pointer
                        shadow-card group-hover:shadow-card-hover transition-shadow duration-300
                        ${isClassic
                          ? 'bg-gradient-to-br from-amber-100/40 via-amber-50/30 to-amber-100/20'
                          : `bg-gradient-to-br from-onde-${book.color}/15 via-onde-cream/20 to-onde-${book.color}/5`
                        }`}>
          {/* Effect */}
          <div className={`absolute inset-0 ${isClassic ? 'opacity-30' : 'opacity-20'}`}
               style={{
                 backgroundImage: isClassic
                   ? `radial-gradient(ellipse at 25% 25%, rgba(180, 140, 80, 0.25) 0%, transparent 40%),
                      radial-gradient(ellipse at 75% 75%, rgba(160, 120, 60, 0.2) 0%, transparent 40%)`
                   : `radial-gradient(ellipse at 25% 25%, rgba(255, 127, 127, 0.2) 0%, transparent 40%),
                      radial-gradient(ellipse at 75% 75%, rgba(72, 201, 176, 0.2) 0%, transparent 40%)`
               }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-6xl group-hover:scale-110 transition-transform duration-500 drop-shadow-md
                            ${isClassic ? 'opacity-35' : 'opacity-25'}`}>
              {isClassic ? '📖' : '✨'}
            </span>
          </div>
          <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium
                           backdrop-blur-sm capitalize shadow-sm
                           ${isClassic
                             ? 'bg-amber-100/90 text-amber-900'
                             : 'bg-white/90 text-onde-ocean'
                           }`}>
            {book.category}
          </span>
          {book.featured && (
            <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold shadow-sm
                             ${isClassic
                               ? 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900'
                               : 'bg-gradient-to-r from-onde-gold to-onde-gold-light text-onde-ocean'
                             }`}>
              Top
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <Link href={`/libro/${book.id}`}>
        <h4 className={`font-display font-bold mb-1 transition-colors cursor-pointer
                       ${isClassic
                         ? 'text-amber-900 group-hover:text-amber-700'
                         : 'text-onde-ocean group-hover:text-onde-coral'
                       }`}>
          {book.title}
        </h4>
      </Link>
      <p className="text-sm text-onde-ocean/50 mb-2">{book.author}</p>

      {/* Buy Button */}
      <a
        href={book.kdpLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
                   shadow-md hover:shadow-lg transition-all duration-300
                   ${isClassic
                     ? 'bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white hover:from-amber-500 hover:to-amber-600'
                     : 'bg-gradient-to-r from-onde-coral/90 to-onde-coral-light/90 text-white hover:from-onde-coral hover:to-onde-coral-light'
                   }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Amazon
      </a>
    </motion.div>
  )
}
