import Link from 'next/link'

export default function BookPage({ params }: { params: { id: string } }) {
  // In produzione, questo viene dal database
  const book = {
    id: params.id,
    title: 'AIKO - AI Spiegata ai Bambini',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    price: 0.99,
    description: 'Sofia riceve un regalo speciale: AIKO, un piccolo robot con gli occhi LED a forma di cuore. Insieme esploreranno il mondo dell\'intelligenza artificiale...',
    pages: 32,
    age: '5-10 anni',
    language: 'Italiano',
    format: 'ePub / PDF'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/catalogo" className="text-onde-gold mb-8 inline-block">
        ← Torna al catalogo
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Cover */}
        <div className="aspect-[3/4] bg-onde-blue rounded-2xl flex items-center justify-center">
          <span className="text-9xl">📚</span>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="opacity-70 mb-2">di <span className="text-onde-gold">{book.author}</span></p>
          <p className="opacity-70 mb-6">illustrazioni di <span className="text-onde-gold">{book.illustrator}</span></p>
          
          <p className="text-4xl font-bold text-onde-gold mb-6">€{book.price.toFixed(2)}</p>
          
          <button className="btn-primary w-full mb-4">
            Acquista Ora
          </button>
          <button className="btn-secondary w-full mb-8">
            Anteprima Gratuita
          </button>

          <div className="space-y-2 text-sm opacity-80">
            <p><strong>Pagine:</strong> {book.pages}</p>
            <p><strong>Età consigliata:</strong> {book.age}</p>
            <p><strong>Lingua:</strong> {book.language}</p>
            <p><strong>Formato:</strong> {book.format}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Descrizione</h2>
        <p className="opacity-80 leading-relaxed">{book.description}</p>
      </div>
    </div>
  )
}
