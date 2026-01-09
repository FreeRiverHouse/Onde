import Link from 'next/link'

const featuredBooks = [
  {
    id: 'aiko',
    title: 'AIKO - AI Spiegata ai Bambini',
    author: 'Gianni Parola',
    price: 0.99,
    cover: '/books/aiko-cover.jpg',
    description: 'Sofia e il suo robot AIKO esplorano il mondo dell\'intelligenza artificiale.'
  },
  {
    id: 'salmo-23',
    title: 'Il Salmo 23 per Bambini',
    author: 'Gianni Parola',
    price: 0.49,
    cover: '/books/salmo23-cover.jpg',
    description: 'Il Salmo del Buon Pastore illustrato per i più piccoli.'
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    author: 'Antologia',
    price: 0.99,
    cover: '/books/piccole-rime-cover.jpg',
    description: 'Poesie italiane classiche per bambini con illustrazioni.'
  }
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-20">
        <h1 className="text-5xl font-bold mb-6">
          Libri per <span className="text-onde-gold">Famiglie</span>
        </h1>
        <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
          Storie illustrate, valori tradizionali, prezzi onesti.
          Niente intermediari, niente 30% ad Amazon.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/catalogo" className="btn-primary">
            Esplora il Catalogo
          </Link>
          <Link href="/about" className="btn-secondary">
            Chi Siamo
          </Link>
        </div>
      </section>

      {/* Featured Books */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Libri in Evidenza</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredBooks.map(book => (
            <Link href={`/libro/${book.id}`} key={book.id} className="book-card">
              <div className="aspect-[3/4] bg-onde-blue rounded-lg mb-4 flex items-center justify-center">
                <span className="text-6xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{book.title}</h3>
              <p className="text-sm opacity-60 mb-2">di {book.author}</p>
              <p className="text-sm opacity-80 mb-4">{book.description}</p>
              <p className="text-onde-gold font-bold text-2xl">€{book.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Onde */}
      <section className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-8">Perché Onde Portal?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-bold mb-2">Prezzi Onesti</h3>
            <p className="opacity-70">€0.30 invece di €3. Il 97% resta a noi, non ad Amazon.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="font-bold mb-2">Qualità Italiana</h3>
            <p className="opacity-70">Illustrazioni acquarello europee. NO Pixar, NO CocoMelon.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">👨‍👩‍👧</div>
            <h3 className="font-bold mb-2">Per Famiglie</h3>
            <p className="opacity-70">Valori tradizionali. Storie che i genitori vogliono leggere ai figli.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
