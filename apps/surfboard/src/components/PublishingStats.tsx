'use client'

import { useEffect, useState } from 'react'

interface PublishingStatsProps {
  booksPublished: number
  audiobooks: number
  podcasts: number
  videos: number
}

export default function PublishingStats({
  booksPublished,
  audiobooks,
  podcasts,
  videos
}: PublishingStatsProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(true)
  }, [])

  const categories = [
    {
      name: 'Books Published',
      value: booksPublished,
      icon: '📚',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      target: 20,
      description: 'KDP + Onde Books'
    },
    {
      name: 'Audiobooks',
      value: audiobooks,
      icon: '🎧',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      target: 10,
      description: 'ElevenLabs narration'
    },
    {
      name: 'Podcast Episodes',
      value: podcasts,
      icon: '🎙️',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      target: 50,
      description: 'Storie della Buonanotte'
    },
    {
      name: 'Videos',
      value: videos,
      icon: '🎬',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      target: 30,
      description: 'YouTube + TikTok'
    }
  ]

  const totalContent = booksPublished + audiobooks + podcasts + videos

  // Books detail
  const booksList = [
    { title: 'AIKO - AI Spiegata ai Bambini', status: 'published', lang: 'IT/EN' },
    { title: 'Il Salmo 23 per Bambini', status: 'published', lang: 'IT' },
    { title: 'Piccole Rime', status: 'published', lang: 'IT' },
    { title: 'Il Libro Sbilenco', status: 'in_progress', lang: 'IT' },
    { title: 'Vibe Coding', status: 'in_progress', lang: 'EN' },
  ]

  return (
    <div className="chart-container">
      {/* Total Content Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
        <div>
          <p className="text-sm opacity-60 mb-1">Total Content Pieces</p>
          <p className="text-4xl font-bold glow-text text-onde-gold">
            {animated ? totalContent : 0}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-60 mb-1">Q1 2026 Target</p>
          <p className="text-2xl font-semibold text-onde-green">100+</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {categories.map((cat, index) => (
          <div
            key={cat.name}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold ${cat.color}">
                  {animated ? cat.value : 0}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium mb-1">{cat.name}</p>
            <p className="text-xs opacity-40">{cat.description}</p>

            {/* Progress to target */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-40">Progress</span>
                <span className={cat.color}>{Math.round((cat.value / cat.target) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${cat.bgColor} transition-all duration-1000`}
                  style={{
                    width: animated ? `${Math.min((cat.value / cat.target) * 100, 100)}%` : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Books List */}
      <div className="border-t border-white/10 pt-6">
        <h4 className="text-sm font-semibold mb-4 opacity-60">Recent Books</h4>
        <div className="space-y-2">
          {booksList.map((book) => (
            <div
              key={book.title}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {book.status === 'published' ? '✅' : '📝'}
                </span>
                <div>
                  <p className="text-sm font-medium">{book.title}</p>
                  <p className="text-xs opacity-40">{book.lang}</p>
                </div>
              </div>
              <span className={`badge ${book.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                {book.status === 'published' ? 'Published' : 'In Progress'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Publishing Note */}
      <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <p className="text-sm">
          <span className="text-green-400 font-semibold">Multi-format strategy:</span>
          {' '}Ogni libro diventa audiobook, podcast e video. Un contenuto = 4x output.
        </p>
      </div>
    </div>
  )
}
