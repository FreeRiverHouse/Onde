import Link from 'next/link'
import Image from 'next/image'

const featuredBooks = [
  {
    id: 'alice-wonderland',
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    cover: '/books/alice-cover.svg',
    description: 'Una caduta nel buio, un mondo capovolto. Il viaggio che ha ridefinito l\'immaginazione.'
  },
  {
    id: 'jungle-book',
    title: 'The Jungle Book',
    author: 'Rudyard Kipling',
    cover: '/books/jungle-cover.svg',
    description: 'Tra liane e ombre, un cucciolo d\'uomo impara la legge della giungla e della vita.'
  },
  {
    id: 'peter-rabbit',
    title: 'Peter Rabbit',
    author: 'Beatrix Potter',
    cover: '/books/peter-rabbit-cover.svg',
    description: 'L\'avventura di un coniglio ribelle nell\'orto proibito. Un classico senza tempo.'
  },
  {
    id: 'grimm-fairy-tales',
    title: 'Grimm\'s Fairy Tales',
    author: 'Brothers Grimm',
    cover: '/books/grimm-cover.svg',
    description: 'Foreste incantate, specchi parlanti, destini che si compiono. Le fiabe originali.'
  },
  {
    id: 'wizard-oz',
    title: 'The Wizard of Oz',
    author: 'L. Frank Baum',
    cover: '/books/wizard-oz-cover.svg',
    description: 'Una strada dorata verso casa. Il coraggio si trova dove meno te lo aspetti.'
  },
  {
    id: 'andersen-tales',
    title: 'Andersen\'s Fairy Tales',
    author: 'Hans Christian Andersen',
    cover: '/books/andersen-cover.svg',
    description: 'Storie di sirene e anatroccoli, di neve e di fuoco. La malinconia che diventa bellezza.'
  }
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-20">
        <h1 className="text-5xl font-bold mb-6">
          Storie che <span className="text-onde-gold">restano</span>
        </h1>
        <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
          I grandi classici della letteratura, illustrati ad acquarello.
          Edizioni curate a mano, accessibili a tutti.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/catalogo" className="btn-primary">
            Entra nella Biblioteca
          </Link>
          <Link href="/about" className="btn-secondary">
            La Nostra Storia
          </Link>
        </div>
      </section>

      {/* Featured Books */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">In Libreria</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredBooks.map(book => (
            <Link href={`/libro/${book.id}`} key={book.id} className="book-card group">
              <div className="aspect-[3/4] rounded-lg mb-4 overflow-hidden relative bg-gradient-to-br from-stone-100 to-stone-200">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">{book.title}</h3>
              <p className="text-sm opacity-60 mb-2">{book.author}</p>
              <p className="text-sm opacity-80 mb-4 leading-relaxed">{book.description}</p>
              <p className="text-onde-gold font-bold text-xl">$0</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Onde */}
      <section className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-12">Perche Onde</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-onde-gold/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-onde-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-lg">Letteratura per tutti</h3>
            <p className="opacity-70 leading-relaxed">I grandi classici, finalmente accessibili. Storie senza tempo per chi le sa apprezzare.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-onde-gold/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-onde-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-lg">Illustrazioni d'autore</h3>
            <p className="opacity-70 leading-relaxed">Acquarelli originali in stile europeo. Ogni pagina e un quadro da sfogliare.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-onde-gold/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-onde-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-lg">Cura artigianale</h3>
            <p className="opacity-70 leading-relaxed">Testi revisionati, impaginazione elegante. Ogni dettaglio conta.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
