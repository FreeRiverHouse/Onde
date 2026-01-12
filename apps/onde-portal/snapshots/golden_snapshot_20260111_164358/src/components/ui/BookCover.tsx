'use client'

import { useState } from 'react'
import Image from 'next/image'

interface BookCoverProps {
  title: string
  author?: string
  coverImage?: string
  color?: 'coral' | 'teal' | 'gold' | 'purple' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorGradients = {
  coral: 'from-rose-900 via-rose-700 to-amber-600',
  teal: 'from-teal-900 via-teal-700 to-cyan-600',
  gold: 'from-amber-900 via-amber-700 to-yellow-500',
  purple: 'from-purple-900 via-purple-700 to-pink-600',
  blue: 'from-blue-900 via-blue-700 to-cyan-500',
}

const colorAccents = {
  coral: 'border-rose-400/30',
  teal: 'border-teal-400/30',
  gold: 'border-amber-400/30',
  purple: 'border-purple-400/30',
  blue: 'border-blue-400/30',
}

export default function BookCover({
  title,
  author,
  coverImage,
  color = 'coral',
  size = 'md',
  className = '',
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false)
  const hasValidImage = coverImage && !imageError

  // Split title into lines for better display
  const titleLines = title.split(' ').reduce((acc: string[], word) => {
    const lastLine = acc[acc.length - 1] || ''
    if (lastLine.length + word.length < 15) {
      acc[acc.length - 1] = lastLine ? `${lastLine} ${word}` : word
    } else {
      acc.push(word)
    }
    return acc
  }, [''])

  return (
    <div
      className={`relative aspect-[3/4] rounded-xl overflow-hidden ${className}`}
    >
      {hasValidImage ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        // Dynamic Generated Cover
        <div className={`absolute inset-0 bg-gradient-to-br ${colorGradients[color]}`}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id={`pattern-${title}`} width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="white" />
              </pattern>
              <rect fill={`url(#pattern-${title})`} width="100" height="100" />
            </svg>
          </div>

          {/* Inner frame */}
          <div className={`absolute inset-3 sm:inset-4 border-2 ${colorAccents[color]} rounded-lg`}>
            {/* Corner decorations */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br" />
          </div>

          {/* Onde logo watermark */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M6.5 12c1.38 0 2.5-1.12 2.5-2.5S7.88 7 6.5 7 4 8.12 4 9.5 5.12 12 6.5 12zm11 0c1.38 0 2.5-1.12 2.5-2.5S18.88 7 17.5 7 15 8.12 15 9.5s1.12 2.5 2.5 2.5zm-5.5 6c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </div>

          {/* Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
            <div className="space-y-1">
              {titleLines.map((line, i) => (
                <h3
                  key={i}
                  className="font-display font-bold text-white drop-shadow-lg"
                  style={{
                    fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.5rem' : '1.125rem',
                    lineHeight: 1.2,
                  }}
                >
                  {line}
                </h3>
              ))}
            </div>
            {author && (
              <p
                className="mt-3 text-white/70 font-medium"
                style={{
                  fontSize: size === 'sm' ? '0.625rem' : size === 'lg' ? '0.875rem' : '0.75rem',
                }}
              >
                {author}
              </p>
            )}
          </div>

          {/* Decorative line */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-white/30 rounded-full" />

          {/* "Onde" text at bottom */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-xs text-white/40 font-medium tracking-widest">ONDE</span>
          </div>

          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  )
}
