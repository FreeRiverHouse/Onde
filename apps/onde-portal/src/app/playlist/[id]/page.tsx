import { motion } from 'framer-motion'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlaylistById } from '@/data/playlists'
import { books } from '@/data/books'
import ShareButton from '@/components/spotify/ShareButton'
import BookRow from '@/components/spotify/BookRow'

interface PlaylistPageProps {
  params: { id: string }
}

export async function generateStaticParams() {
  // Genera tutti gli ID delle playlist disponibili
  const { playlists } = await import('@/data/playlists')
  
  return playlists.map((playlist: any) => ({
    id: playlist.id,
  }))
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const playlist = getPlaylistById(params.id)

  if (!playlist) {
    notFound()
  }

  // Ottieni i libri della playlist
  const playlistBooks = playlist.bookIds
    .map(id => books.find(b => b.id === id))
    .filter(Boolean)

  // Calcola statistiche
  const totalBooks = playlistBooks.length
  const estimatedReadingTime = totalBooks * 2 // ore stimate

  return (
    <div className="min-h-screen relative">
      {/* Hero Section con gradient */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${playlist.coverGradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-onde-dark via-onde-dark/50 to-transparent" />

        {/* Floating icon */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {playlist.icon}
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full glass-dark text-sm font-medium text-white/80">
                PLAYLIST
              </span>
              {playlist.featured && (
                <span className="px-3 py-1 rounded-full bg-onde-gold/20 border border-onde-gold/30 text-onde-gold text-sm font-medium">
                  In evidenza
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
              {playlist.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-white/70 max-w-2xl mb-6">
              {playlist.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {totalBooks} libri
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{estimatedReadingTime}h di lettura
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="sticky top-0 z-20 bg-onde-dark/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play All */}
            <motion.button
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-onde-teal text-white font-semibold shadow-lg shadow-onde-teal/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Inizia a leggere
            </motion.button>

            {/* Shuffle */}
            <motion.button
              className="p-3 rounded-full glass-dark border border-white/10 text-white/70 hover:text-onde-teal transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Ordine casuale"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            {/* Save playlist */}
            <motion.button
              className="p-3 rounded-full glass-dark border border-white/10 text-white/70 hover:text-onde-coral transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Salva playlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>

            {/* Share */}
            <ShareButton
              title={playlist.title}
              description={playlist.description}
              type="playlist"
              variant="icon"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Curator Note */}
        {playlist.curatorNote && (
          <motion.div
            className="mb-8 p-6 rounded-2xl glass-dark border border-onde-gold/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-onde-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💫</span>
              </div>
              <div>
                <p className="text-sm text-onde-gold font-medium mb-1">Nota del curatore</p>
                <p className="text-white/70">{playlist.curatorNote}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Books List */}
        <div className="space-y-1">
          {playlistBooks.map((book, index) => (
            book && (
              <BookRow
                key={book.id}
                bookId={book.id}
                bookTitle={book.title}
                bookAuthor={book.author}
                bookCategory={book.category}
                index={index}
                gradient={playlist.coverGradient}
                isInPlaylist
              />
            )
          ))}
        </div>

        {/* Tags */}
        <div className="mt-12 flex flex-wrap gap-2">
          {playlist.tags.map(tag => (
            <span
              key={tag}
              className="px-4 py-2 rounded-full glass-dark border border-white/10 text-white/60 text-sm hover:border-onde-teal/30 hover:text-onde-teal transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
