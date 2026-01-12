'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import ShareButton from './ShareButton'

interface BookRowProps {
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCategory: string
  index: number
  showNumber?: boolean
  isInPlaylist?: boolean
  gradient?: string
}

export default function BookRow({
  bookId,
  bookTitle,
  bookAuthor,
  bookCategory,
  index,
  showNumber = true,
  isInPlaylist = false,
  gradient = 'from-onde-teal/20 to-onde-blue/20',
}: BookRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
        {/* Number */}
        {showNumber && (
          <span className="w-8 text-center text-white/30 font-mono text-sm group-hover:text-onde-teal transition-colors">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}

        {/* Cover */}
        <Link href={`/libro/${bookId}`} className="flex-shrink-0">
          <motion.div
            className={`w-12 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-xl overflow-hidden relative`}
            whileHover={{ scale: 1.05 }}
          >
            📖
            {/* Play overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </motion.div>
        </Link>

        {/* Info */}
        <Link href={`/libro/${bookId}`} className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate group-hover:text-onde-teal transition-colors">
            {bookTitle}
          </h4>
          <p className="text-sm text-white/50 truncate">{bookAuthor}</p>
        </Link>

        {/* Category badge */}
        <span className="hidden sm:block px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50">
          {bookCategory}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Add to wishlist */}
          <motion.button
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-onde-coral transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Aggiungi alla lista"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.button>

          {/* Share */}
          <ShareButton
            title={bookTitle}
            description={`"${bookTitle}" di ${bookAuthor}`}
            type="book"
            variant="icon"
          />
        </div>

        {/* Duration estimate */}
        <span className="text-xs text-white/30 font-mono">
          ~2h
        </span>
      </div>
    </motion.div>
  )
}
