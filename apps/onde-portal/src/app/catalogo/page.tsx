import Link from 'next/link'

const books = [
  { id: 'aiko', title: 'AIKO - AI Spiegata ai Bambini', author: 'Gianni Parola', price: 0.99, category: 'tech' },
  { id: 'salmo-23', title: 'Il Salmo 23 per Bambini', author: 'Gianni Parola', price: 0.49, category: 'spiritualita' },
  { id: 'piccole-rime', title: 'Piccole Rime Italiane', author: 'Antologia', price: 0.50, category: 'poesia' },
  { id: 'meditazioni', title: 'Meditazioni - Marco Aurelio', author: 'Marco Aurelio', price: 0.99, category: 'psicologia' },
  { id: 'leopardi', title: 'L\'Infinito e Altre Poesie', author: 'Giacomo Leopardi', price: 0.50, category: 'poesia' },
  { id: 'seneca', title: 'Lettere a Lucilio', author: 'Seneca', price: 0.99, category: 'psicologia' },
  { id: 'favole-esopo', title: 'Le Favole di Esopo', author: 'Esopo', price: 0.99, category: 'classici' },
]

export default function Catalogo() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Catalogo</h1>
      <p className="opacity-70 mb-8">28 libri in pubblico dominio - prezzi onesti</p>
      
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map(book => (
          <Link href={'/libro/' + book.id} key={book.id} className="book-card">
            <div className="aspect-[3/4] bg-onde-blue rounded-lg mb-4 flex items-center justify-center text-5xl">📖</div>
            <h3 className="font-bold mb-1 line-clamp-2">{book.title}</h3>
            <p className="text-sm opacity-60 mb-2">{book.author}</p>
            <span className="text-xs bg-onde-gold/20 text-onde-gold px-2 py-1 rounded">{book.category}</span>
            <p className="text-onde-gold font-bold mt-2">€{book.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
