'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface BookPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  book: {
    id: string
    title: string
    subtitle?: string
    author: string
    description: string
    coverImage: string
    pages?: number
    readingTime?: string
    category?: string
  }
}

/**
 * Book preview modal showing the cover and first few pages.
 * Uses image previews stored at /books/previews/{bookId}-page-{n}.jpg
 * Falls back to showing cover + description if previews don't exist.
 */
export function BookPreviewModal({ isOpen, onClose, book }: BookPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [previewError, setPreviewError] = useState(false)
  
  // Preview image paths: cover (0) + first 3 pages (1-3)
  const maxPreviewPages = 3
  
  // Try to load preview images
  useEffect(() => {
    if (!isOpen) return
    
    setLoadingPreview(true)
    setPreviewError(false)
    setCurrentPage(0)
    
    // Check if preview images exist
    const checkPreviewImages = async () => {
      const images: string[] = [book.coverImage] // Always include cover
      
      // Try to load page previews
      for (let i = 1; i <= maxPreviewPages; i++) {
        const previewPath = `/books/previews/${book.id}-page-${i}.jpg`
        try {
          const response = await fetch(previewPath, { method: 'HEAD' })
          if (response.ok) {
            images.push(previewPath)
          }
        } catch {
          // Preview doesn't exist, that's fine
        }
      }
      
      setPreviewImages(images)
      setLoadingPreview(false)
    }
    
    checkPreviewImages()
  }, [isOpen, book.id, book.coverImage])
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  const nextPage = () => {
    if (currentPage < previewImages.length - 1) {
      setCurrentPage(p => p + 1)
    }
  }
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl z-50 
                       flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁️</span>
                <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-gray-900">
                    Preview: {book.title}
                  </h2>
                  <p className="text-sm text-gray-500">by {book.author}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Preview Area */}
              <div className="flex-1 relative bg-gray-50 flex items-center justify-center p-4">
                {loadingPreview ? (
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading preview...</p>
                  </div>
                ) : (
                  <>
                    {/* Current preview image */}
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="relative w-full h-full max-w-md max-h-[70vh] mx-auto"
                    >
                      <Image
                        src={previewImages[currentPage] || book.coverImage}
                        alt={`${book.title} - ${currentPage === 0 ? 'Cover' : `Page ${currentPage}`}`}
                        fill
                        className="object-contain drop-shadow-2xl"
                        onError={() => setPreviewError(true)}
                      />
                    </motion.div>
                    
                    {/* Navigation arrows */}
                    {previewImages.length > 1 && (
                      <>
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 0}
                          className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full
                                    bg-white/90 shadow-lg transition-all duration-300
                                    ${currentPage === 0 
                                      ? 'opacity-30 cursor-not-allowed' 
                                      : 'hover:bg-amber-50 hover:scale-110'}`}
                          aria-label="Previous page"
                        >
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextPage}
                          disabled={currentPage >= previewImages.length - 1}
                          className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full
                                    bg-white/90 shadow-lg transition-all duration-300
                                    ${currentPage >= previewImages.length - 1 
                                      ? 'opacity-30 cursor-not-allowed' 
                                      : 'hover:bg-amber-50 hover:scale-110'}`}
                          aria-label="Next page"
                        >
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Page indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      {previewImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                                    ${idx === currentPage 
                                      ? 'bg-amber-500 scale-125' 
                                      : 'bg-gray-300 hover:bg-gray-400'}`}
                          aria-label={`Go to ${idx === 0 ? 'cover' : `page ${idx}`}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Info sidebar */}
              <div className="w-full md:w-80 p-4 md:p-6 bg-white border-t md:border-t-0 md:border-l border-gray-100 
                            overflow-y-auto">
                {/* Book info */}
                <div className="mb-6">
                  {book.category && (
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold
                                   bg-amber-100 text-amber-800 mb-3">
                      {book.category}
                    </span>
                  )}
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-1">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-gray-600 mb-2">{book.subtitle}</p>
                  )}
                  <p className="text-sm text-gray-500">by {book.author}</p>
                </div>
                
                {/* Reading stats */}
                {(book.pages || book.readingTime) && (
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                    {book.pages && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {book.pages} pages
                      </span>
                    )}
                    {book.readingTime && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {book.readingTime}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">About this book</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
                </div>
                
                {/* Preview info */}
                {previewImages.length > 1 && (
                  <div className="text-xs text-gray-400 text-center">
                    Showing cover + {previewImages.length - 1} preview page{previewImages.length > 2 ? 's' : ''}
                  </div>
                )}
                {previewImages.length === 1 && !loadingPreview && (
                  <div className="text-xs text-gray-400 text-center">
                    💡 Full preview coming soon
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-gray-600 font-medium
                           hover:bg-gray-100 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BookPreviewModal
