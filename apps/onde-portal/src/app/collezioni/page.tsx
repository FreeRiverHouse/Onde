'use client'

import { motion } from 'framer-motion'
import { playlists, getFeaturedPlaylists } from '@/data/playlists'
import PlaylistCard from '@/components/spotify/PlaylistCard'

export default function CollezioniPage() {
  const featuredPlaylists = getFeaturedPlaylists()
  const regularPlaylists = playlists.filter(p => !p.featured)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Collezioni
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            Playlist curate per ogni momento. Scopri raccolte tematiche di libri selezionati per te.
          </p>
        </motion.div>

        {/* Featured Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-white">
              In evidenza
            </h2>
            <span className="px-3 py-1 rounded-full bg-onde-gold/20 text-onde-gold text-sm font-medium">
              Curate da Onde
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlaylists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                index={index}
                size="large"
              />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="glow-line w-full mb-16" />

        {/* All Playlists */}
        <section>
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Tutte le collezioni
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {regularPlaylists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                index={index}
                size="small"
              />
            ))}
          </div>
        </section>

        {/* Create Your Own CTA */}
        <motion.section
          className="mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-onde-purple/20 via-onde-teal/20 to-onde-coral/20" />
            <div className="absolute inset-0 bg-onde-dark/50" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/10" />

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.div
                className="text-5xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📚
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                Crea la tua collezione
              </h3>
              <p className="text-white/60 max-w-md mx-auto mb-6">
                Presto potrai creare le tue playlist personalizzate e condividerle con amici e famiglia.
              </p>
              <button className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/80 font-medium cursor-not-allowed">
                Prossimamente
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
