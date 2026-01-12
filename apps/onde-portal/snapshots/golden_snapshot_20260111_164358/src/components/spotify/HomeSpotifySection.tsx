'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { getFeaturedPlaylists } from '@/data/playlists'
import { mockReadingState } from '@/data/reading-state'
import { books } from '@/data/books'
import PlaylistCard from './PlaylistCard'
import NowReading from './NowReading'
import RecommendationCard from './RecommendationCard'
import { getPersonalizedRecommendations } from '@/data/recommendations'

export default function HomeSpotifySection() {
  const featuredPlaylists = getFeaturedPlaylists()
  const { currentlyReading, recentlyFinished } = mockReadingState

  // Genera raccomandazioni basate sui libri finiti
  const recommendations = getPersonalizedRecommendations(recentlyFinished, [], 3)

  // Ottieni info libri per le raccomandazioni
  const recommendedBooks = recommendations.map(rec => ({
    ...rec,
    book: books.find(b => b.id === rec.bookId),
  })).filter(r => r.book)

  return (
    <>
      {/* ============================================
          NOW READING SECTION
          ============================================ */}
      {currentlyReading.length > 0 && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <span className="section-badge-futuristic mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Continua a leggere
                </span>
                <h2 className="text-3xl font-display font-bold text-white">
                  Dove eravamo rimasti
                </h2>
              </div>
              <Link href="/libreria" className="text-onde-teal hover:text-onde-teal-light transition-colors text-sm font-medium">
                Vedi libreria
              </Link>
            </motion.div>

            {/* Reading Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {currentlyReading.map((progress, index) => {
                const book = books.find(b => b.id === progress.bookId)
                if (!book) return null
                return (
                  <NowReading
                    key={progress.bookId}
                    progress={progress}
                    bookTitle={book.title}
                    bookAuthor={book.author}
                    index={index}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          FEATURED PLAYLISTS SECTION
          ============================================ */}
      <section className="relative py-16">
        {/* Decorative glow */}
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] floating-orb opacity-10"
             style={{ background: 'var(--onde-purple)', filter: 'blur(150px)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="section-badge-futuristic mb-2" style={{ borderColor: 'var(--onde-purple)', color: 'var(--onde-purple)' }}>
                <span className="w-2 h-2 rounded-full bg-onde-purple" />
                Collezioni curate
              </span>
              <h2 className="text-3xl font-display font-bold text-white">
                Playlist per te
              </h2>
            </div>
            <Link href="/collezioni" className="text-onde-purple hover:text-onde-purple-light transition-colors text-sm font-medium flex items-center gap-1">
              Vedi tutte
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Playlists Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlaylists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                index={index}
                size="medium"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          RECOMMENDATIONS SECTION
          ============================================ */}
      {recommendedBooks.length > 0 && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-badge-futuristic mb-2" style={{ borderColor: 'var(--onde-coral)', color: 'var(--onde-coral)' }}>
                <span className="w-2 h-2 rounded-full bg-onde-coral" />
                Consigliati per te
              </span>
              <h2 className="text-3xl font-display font-bold text-white">
                Se ti e' piaciuto quello che hai letto...
              </h2>
              <p className="text-white/50 mt-2">
                Basato sui libri che hai finito di recente
              </p>
            </motion.div>

            {/* Recommendations Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedBooks.map((rec, index) => (
                rec.book && (
                  <RecommendationCard
                    key={rec.bookId}
                    bookId={rec.bookId}
                    bookTitle={rec.book.title}
                    bookAuthor={rec.book.author}
                    reason={rec.reasons[0]}
                    index={index}
                  />
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          QUICK STATS SECTION
          ============================================ */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-6 rounded-2xl glass-dark border border-white/5 text-center">
              <div className="text-4xl font-display font-bold text-gradient-neon mb-2">
                {books.length}+
              </div>
              <div className="text-sm text-white/50">Libri disponibili</div>
            </div>
            <div className="p-6 rounded-2xl glass-dark border border-white/5 text-center">
              <div className="text-4xl font-display font-bold text-gradient-fire mb-2">
                {getFeaturedPlaylists().length}
              </div>
              <div className="text-sm text-white/50">Playlist curate</div>
            </div>
            <div className="p-6 rounded-2xl glass-dark border border-white/5 text-center">
              <div className="text-4xl font-display font-bold text-onde-teal mb-2">
                6
              </div>
              <div className="text-sm text-white/50">Lingue supportate</div>
            </div>
            <div className="p-6 rounded-2xl glass-dark border border-white/5 text-center">
              <div className="text-4xl font-display font-bold text-onde-gold mb-2">
                100%
              </div>
              <div className="text-sm text-white/50">Gratuito</div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
