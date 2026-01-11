'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface RecommendationCardProps {
  bookId: string
  bookTitle: string
  bookAuthor: string
  reason: string
  index?: number
}

export default function RecommendationCard({
  bookId,
  bookTitle,
  bookAuthor,
  reason,
  index = 0,
}: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/libro/${bookId}`}>
        <div className="group relative p-4 rounded-2xl glass-dark border border-white/5 hover:border-onde-purple/30 transition-all duration-300 hover:shadow-glow-purple">
          {/* Reason badge */}
          <div className="absolute -top-2 left-4 px-3 py-1 rounded-full bg-onde-purple/20 border border-onde-purple/30 text-onde-purple text-xs font-medium">
            {reason}
          </div>

          <div className="flex items-center gap-4 mt-2">
            {/* Book Cover Placeholder */}
            <div className="flex-shrink-0 w-14 h-18 rounded-lg bg-gradient-to-br from-onde-purple/30 to-onde-blue/30 flex items-center justify-center text-2xl overflow-hidden">
              📖
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-white truncate group-hover:text-onde-purple-light transition-colors">
                {bookTitle}
              </h4>
              <p className="text-sm text-white/50 truncate">{bookAuthor}</p>
            </div>

            {/* Arrow */}
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -10 }}
              whileHover={{ x: 0 }}
            >
              <svg className="w-5 h-5 text-onde-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
