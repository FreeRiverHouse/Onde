'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReadingProgress, getLastReadText, getEstimatedTimeRemaining } from '@/data/reading-state'

interface NowReadingProps {
  progress: ReadingProgress
  bookTitle: string
  bookAuthor: string
  index?: number
}

export default function NowReading({ progress, bookTitle, bookAuthor, index = 0 }: NowReadingProps) {
  const timeRemaining = getEstimatedTimeRemaining(progress)
  const lastRead = getLastReadText(progress.lastReadAt)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group"
    >
      <Link href={`/leggi/${progress.bookId}`}>
        <div className="relative flex gap-4 p-4 rounded-2xl glass-dark border border-white/5 hover:border-onde-teal/30 transition-all duration-300 hover:shadow-glow-teal">
          {/* Book Cover Placeholder */}
          <div className="relative flex-shrink-0 w-16 h-20 rounded-lg bg-gradient-to-br from-onde-teal/30 to-onde-blue/30 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-50">
              📖
            </div>
            {/* Progress indicator on cover */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
                className="h-full bg-onde-teal"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentComplete}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-white truncate group-hover:text-onde-teal transition-colors">
              {bookTitle}
            </h4>
            <p className="text-sm text-white/50 truncate">{bookAuthor}</p>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-onde-teal to-onde-blue rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentComplete}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>

            {/* Stats */}
            <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
              <span>{progress.percentComplete}% completato</span>
              <span>-</span>
              <span>{lastRead}</span>
            </div>
          </div>

          {/* Continue button */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-full bg-onde-teal flex items-center justify-center shadow-lg shadow-onde-teal/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </motion.div>

          {/* Time remaining badge */}
          {timeRemaining > 0 && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40">
              ~{timeRemaining} min rimanenti
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
