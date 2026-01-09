'use client'

import { useEffect, useRef, useState } from 'react'

interface EpubReaderProps {
  epubUrl: string
}

export default function EpubReader({ epubUrl }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [currentPage] = useState(1)
  const [totalPages] = useState(0)

  useEffect(() => {
    // In produzione, usa epub.js
    // Per ora, placeholder
    if (epubUrl) {
      // Future: load epub
    }
  }, [epubUrl])

  return (
    <div className="bg-white text-black rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <button className="px-4 py-2 bg-gray-200 rounded">← Indietro</button>
        <span>{currentPage} / {totalPages || '...'}</span>
        <button className="px-4 py-2 bg-gray-200 rounded">Avanti →</button>
      </div>

      {/* Content */}
      <div ref={viewerRef} className="min-h-[600px] p-8">
        <p className="text-center text-gray-500">
          Reader ePub - Caricamento in corso...
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-100 p-4 flex justify-center gap-4">
        <button className="px-4 py-2 bg-gray-200 rounded">A-</button>
        <button className="px-4 py-2 bg-gray-200 rounded">A+</button>
        <button className="px-4 py-2 bg-gray-200 rounded">🌙 Notte</button>
      </div>
    </div>
  )
}
