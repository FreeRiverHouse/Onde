'use client'

import { useState } from 'react'
import Link from 'next/link'

// Books in the library
const books = [
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marco Aurelio',
    emoji: '🏛️',
    color: 'from-amber-600 to-yellow-500',
    epubUrl: '/books/epub/meditations-en.epub',
    readUrl: '/libro/meditations',
    spine: '#8B4513',
  },
  {
    id: 'salmo-23-it',
    title: 'Il Salmo 23',
    author: 'Onde',
    emoji: '🐑',
    color: 'from-emerald-500 to-green-400',
    epubUrl: '/books/epub/salmo-23-bambini-it.epub',
    readUrl: '/libro/salmo-23',
    spine: '#228B22',
  },
  {
    id: 'salmo-23-en',
    title: 'Psalm 23',
    author: 'Onde',
    emoji: '🌿',
    color: 'from-teal-500 to-cyan-400',
    epubUrl: '/books/epub/salmo-23-bambini-en.epub',
    readUrl: '/libro/psalm-23',
    spine: '#008B8B',
  },
  {
    id: 'shepherds-promise',
    title: "The Shepherd's Promise",
    author: 'Onde',
    emoji: '✨',
    color: 'from-purple-500 to-pink-400',
    epubUrl: '/books/epub/the-shepherds-promise.epub',
    readUrl: '/libro/shepherds-promise',
    spine: '#9932CC',
  },
]

// Empty shelf slots to show room for growth
const emptySlots = Array(4).fill(null)

function Book({ book, index }: { book: typeof books[0], index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={book.readUrl}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Book spine (3D effect) */}
      <div 
        className={`
          w-12 h-40 md:w-16 md:h-48 rounded-r-sm
          bg-gradient-to-b ${book.color}
          shadow-lg transform transition-all duration-300
          ${isHovered ? 'translate-x-4 -rotate-6 scale-105' : ''}
          flex flex-col items-center justify-center
          border-l-4
        `}
        style={{ borderColor: book.spine }}
      >
        {/* Book emoji */}
        <span className="text-2xl md:text-3xl mb-2">{book.emoji}</span>
        
        {/* Title on spine (vertical) */}
        <span 
          className="text-white text-xs font-bold tracking-wider"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {book.title.slice(0, 15)}
        </span>
      </div>

      {/* Hover info card */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white rounded-xl p-3 shadow-2xl z-20 whitespace-nowrap animate-fadeIn">
          <p className="font-bold text-gray-800">{book.title}</p>
          <p className="text-sm text-gray-500">{book.author}</p>
          <p className="text-xs text-green-600 mt-1">📖 Click to read!</p>
        </div>
      )}
    </Link>
  )
}

function EmptySlot() {
  return (
    <div className="w-12 h-40 md:w-16 md:h-48 rounded-r-sm bg-gradient-to-b from-gray-300 to-gray-400 opacity-30 border-l-4 border-gray-500 flex items-center justify-center">
      <span className="text-3xl opacity-50">📕</span>
    </div>
  )
}

function Shelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mb-8">
      {/* Books row */}
      <div className="flex items-end gap-2 px-4 pb-4">
        {children}
      </div>
      
      {/* Shelf wood */}
      <div className="h-4 bg-gradient-to-b from-amber-700 to-amber-900 rounded-sm shadow-lg" />
      
      {/* Shelf bracket left */}
      <div className="absolute -bottom-6 left-4 w-4 h-6 bg-amber-800 rounded-b" />
      
      {/* Shelf bracket right */}
      <div className="absolute -bottom-6 right-4 w-4 h-6 bg-amber-800 rounded-b" />
    </div>
  )
}

export default function MagicLibrary() {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-amber-50 to-orange-50">
      {/* Header */}
      <div className="text-center pt-12 pb-8 relative">
        <Link href="/" className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-amber-700 shadow-lg hover:scale-105 transition-all">
          ← Home
        </Link>
        
        <div className="text-6xl mb-4 animate-bounce">📚</div>
        <h1 className="text-4xl md:text-5xl font-black text-amber-800 drop-shadow-lg">
          Magic Library
        </h1>
        <p className="text-xl text-amber-600 mt-2">
          Pick a book from the shelf! ✨
        </p>
        <div className="mt-2 bg-white/60 inline-block px-4 py-1 rounded-full">
          <span className="font-bold text-amber-700">📖 {books.length} books available</span>
        </div>
      </div>

      {/* Library room */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Decorative window */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-b from-blue-200 to-blue-400 rounded-t-full w-32 h-16 border-4 border-amber-700 relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 w-1 h-full bg-amber-700" />
            <div className="absolute top-1/2 left-0 w-full h-1 bg-amber-700" />
            {/* Moon/sun */}
            <div className="absolute top-2 right-4 w-6 h-6 bg-yellow-300 rounded-full shadow-lg" />
          </div>
        </div>

        {/* Bookcase frame */}
        <div className="bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg p-6 shadow-2xl border-4 border-amber-950">
          {/* Top decoration */}
          <div className="h-3 bg-amber-700 rounded-t mb-6 shadow-inner" />
          
          {/* Shelf 1 - Real books */}
          <Shelf>
            {books.slice(0, 4).map((book, i) => (
              <Book key={book.id} book={book} index={i} />
            ))}
          </Shelf>

          {/* Shelf 2 - More books + empty slots */}
          <Shelf>
            {books.slice(4).map((book, i) => (
              <Book key={book.id} book={book} index={i + 4} />
            ))}
            {emptySlots.map((_, i) => (
              <EmptySlot key={`empty-${i}`} />
            ))}
          </Shelf>

          {/* Shelf 3 - Empty (coming soon) */}
          <Shelf>
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-center text-amber-200/60">
                <p className="text-lg">🌟 More books coming soon!</p>
                <p className="text-sm">This shelf is waiting to be filled...</p>
              </div>
            </div>
          </Shelf>

          {/* Bottom decoration */}
          <div className="h-3 bg-amber-700 rounded-b mt-2 shadow-inner" />
        </div>

        {/* Rug */}
        <div className="mt-8 mx-auto w-3/4 h-8 bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded-full shadow-lg opacity-80" />
      </div>

      {/* Reading corner */}
      <div className="text-center pb-12">
        <p className="text-amber-600 text-lg mb-4">
          🪑 Find a cozy spot and enjoy reading!
        </p>
        <Link 
          href="/libri/"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
        >
          📖 Browse All Books
        </Link>
      </div>

      {/* Floating decorations */}
      <div className="fixed bottom-4 left-4 text-4xl animate-bounce opacity-60">🕯️</div>
      <div className="fixed bottom-4 right-4 text-4xl animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}>🪴</div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
