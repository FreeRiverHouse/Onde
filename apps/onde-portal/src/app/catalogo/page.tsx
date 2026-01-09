import Link from 'next/link'
import { books, bookCount } from '@/data/books'

export default function Catalogo() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Biblioteca</h1>
      <p className="opacity-70 mb-8">{bookCount} titoli nella collezione</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {books.map(book => (
          <Link href={'/libro/' + book.id} key={book.id} className="book-card group">
            <div className="aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-3xl md:text-4xl opacity-30">📖</span>
            </div>
            <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2 group-hover:text-onde-gold transition-colors">{book.title}</h3>
            <p className="text-xs md:text-sm opacity-60 mb-2">{book.author}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-onde-gold/20 text-onde-gold px-2 py-1 rounded">{book.category}</span>
              <span className="text-onde-gold font-bold">$0</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
