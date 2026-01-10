'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { books, bookCount } from '@/data/books'

// Estrai le categorie uniche
const categories = [...new Set(books.map(b => b.category))].sort()

export default function Catalogo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)

  // Filtra i libri
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // Filtro ricerca
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = book.title.toLowerCase().includes(query)
        const matchesAuthor = book.author.toLowerCase().includes(query)
        if (!matchesTitle && !matchesAuthor) return false
      }

      // Filtro categoria
      if (selectedCategory && book.category !== selectedCategory) {
        return false
      }

      // Filtro lingua
      if (selectedLang) {
        const bookLang = book.lang || 'en'
        if (bookLang !== selectedLang) return false
      }

      return true
    })
  }, [searchQuery, selectedCategory, selectedLang])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedLang(null)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedLang

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* FREE BANNER */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <div>
            <p className="font-bold text-emerald-400">Tutto il catalogo è GRATIS</p>
            <p className="text-sm opacity-70">Scarica ePub, Kindle o leggi online - nessun costo</p>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-4">Biblioteca</h1>
      <p className="opacity-70 mb-8">{bookCount} titoli nella collezione • Tutti gratuiti</p>

      {/* Barra di ricerca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cerca per titolo o autore..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold focus:border-transparent"
        />
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Filtro categoria */}
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold"
        >
          <option value="">Tutte le categorie</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Filtro lingua */}
        <select
          value={selectedLang || ''}
          onChange={(e) => setSelectedLang(e.target.value || null)}
          className="px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-onde-gold"
        >
          <option value="">Tutte le lingue</option>
          <option value="en">English</option>
          <option value="it">Italiano</option>
          <option value="fr">Francais</option>
          <option value="de">Deutsch</option>
          <option value="es">Espanol</option>
        </select>

        {/* Reset filtri */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 transition-colors"
          >
            Reset filtri
          </button>
        )}
      </div>

      {/* Risultati count */}
      <p className="text-sm opacity-60 mb-6">
        {filteredBooks.length === books.length
          ? `Mostrando tutti i ${books.length} libri`
          : `${filteredBooks.length} libri trovati`
        }
      </p>

      {/* Griglia libri */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredBooks.map(book => (
            <Link href={'/libro/' + book.id} key={book.id} className="book-card group">
              <div className="aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-3xl md:text-4xl opacity-30">📖</span>
              </div>
              <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2 group-hover:text-onde-gold transition-colors">{book.title}</h3>
              <p className="text-xs md:text-sm opacity-60 mb-2">{book.author}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-onde-gold/20 text-onde-gold px-2 py-1 rounded">{book.category}</span>
                {book.lang && book.lang !== 'en' && (
                  <span className="text-xs bg-stone-200 px-2 py-1 rounded uppercase">{book.lang}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl opacity-60 mb-4">Nessun libro trovato</p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-lg bg-onde-gold text-white hover:bg-onde-gold/90 transition-colors"
          >
            Mostra tutti i libri
          </button>
        </div>
      )}
    </div>
  )
}
