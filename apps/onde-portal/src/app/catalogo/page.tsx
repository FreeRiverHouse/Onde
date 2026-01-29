'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { books, bookCount, getBookReadingEstimate, Book } from '@/data/books'
import { useTranslations } from '@/i18n'

// Extract unique categories
const categories = [...new Set(books.map(b => b.category))].sort()

type SortOption = 'title' | 'author' | 'shortest' | 'longest'

export default function Catalogo() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('title')

  // Load sort preference from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem('catalog-sort')
    if (savedSort && ['title', 'author', 'shortest', 'longest'].includes(savedSort)) {
      setSortBy(savedSort as SortOption)
    }
  }, [])

  // Save sort preference
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    localStorage.setItem('catalog-sort', newSort)
  }

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = book.title.toLowerCase().includes(query)
        const matchesAuthor = book.author.toLowerCase().includes(query)
        if (!matchesTitle && !matchesAuthor) return false
      }

      // Category filter
      if (selectedCategory && book.category !== selectedCategory) {
        return false
      }

      // Language filter
      if (selectedLang) {
        const bookLang = book.lang || 'en'
        if (bookLang !== selectedLang) return false
      }

      return true
    })

    // Sort books
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'shortest':
          return getBookReadingEstimate(a).pages - getBookReadingEstimate(b).pages
        case 'longest':
          return getBookReadingEstimate(b).pages - getBookReadingEstimate(a).pages
        default:
          return 0
      }
    })

    return result
  }, [searchQuery, selectedCategory, selectedLang, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedLang(null)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedLang

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* LAUNCH BANNER */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          <div>
            <p className="font-bold text-emerald-400">{t.catalog.launchBanner.title}</p>
            <p className="text-sm opacity-70">{t.catalog.launchBanner.subtitle}</p>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-4">{t.catalog.title}</h1>
      <p className="opacity-70 mb-8">{bookCount} {t.catalog.subtitle}</p>

      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t.catalog.search.placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Category filter */}
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold"
        >
          <option value="">{t.catalog.filters.allCategories}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Language filter */}
        <select
          value={selectedLang || ''}
          onChange={(e) => setSelectedLang(e.target.value || null)}
          className="px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold"
        >
          <option value="">{t.catalog.filters.allLanguages}</option>
          <option value="en">English</option>
          <option value="it">Italiano</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold"
        >
          <option value="title">{t.catalog.sort?.title || 'Title (A-Z)'}</option>
          <option value="author">{t.catalog.sort?.author || 'Author (A-Z)'}</option>
          <option value="shortest">{t.catalog.sort?.shortest || 'Shortest first'}</option>
          <option value="longest">{t.catalog.sort?.longest || 'Longest first'}</option>
        </select>

        {/* Reset filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 transition-colors"
          >
            {t.catalog.filters.reset}
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm opacity-60 mb-6">
        {filteredBooks.length === books.length
          ? t.catalog.results.showingAll.replace('{count}', String(books.length))
          : t.catalog.results.found.replace('{count}', String(filteredBooks.length))
        }
      </p>

      {/* Books grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredBooks.map(book => {
            const estimate = getBookReadingEstimate(book)
            return (
              <Link href={'/libro/' + book.id} key={book.id} className="book-card group">
                <div className="aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl opacity-30">📖</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2 group-hover:text-onde-gold transition-colors">{book.title}</h3>
                <p className="text-xs md:text-sm opacity-60 mb-1">{book.author}</p>
                {/* Reading info */}
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span className="flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {estimate.pages}p
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {estimate.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-onde-gold/20 text-onde-gold px-2 py-1 rounded">{book.category}</span>
                  {book.lang && book.lang !== 'en' && (
                    <span className="text-xs bg-stone-200 px-2 py-1 rounded uppercase">{book.lang}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl opacity-60 mb-4">{t.catalog.noResults.title}</p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-lg bg-onde-gold text-white hover:bg-onde-gold/90 transition-colors"
          >
            {t.catalog.noResults.showAll}
          </button>
        </div>
      )}
    </div>
  )
}
