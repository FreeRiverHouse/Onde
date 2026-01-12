'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Playlist } from '@/data/playlists'

interface PlaylistCardProps {
  playlist: Playlist
  index?: number
  size?: 'small' | 'medium' | 'large'
}

export default function PlaylistCard({ playlist, index = 0, size = 'medium' }: PlaylistCardProps) {
  const sizeClasses = {
    small: 'aspect-square',
    medium: 'aspect-[4/5]',
    large: 'aspect-[3/4]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/playlist/${playlist.id}`} className="group block">
        <div className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden`}>
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${playlist.coverGradient}`} />

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
            {playlist.icon}
          </div>

          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Play button on hover */}
          <motion.div
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-onde-teal flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-onde-teal/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display font-bold text-white text-lg leading-tight mb-1 group-hover:text-onde-teal-light transition-colors">
              {playlist.title}
            </h3>
            <p className="text-white/60 text-sm line-clamp-2">
              {playlist.description}
            </p>
          </div>

          {/* Book count badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full glass-dark text-xs text-white/80 font-medium">
            {playlist.bookIds.length} {playlist.bookIds.length === 1 ? 'libro' : 'libri'}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
