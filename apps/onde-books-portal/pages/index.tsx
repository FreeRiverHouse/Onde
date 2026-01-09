import { useState, useMemo } from 'react';
import Head from 'next/head';
import { books, categories } from '../data/books';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCard from '../components/BookCard';
import CategoryFilter from '../components/CategoryFilter';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate book counts per category
  const bookCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.id] = books.filter((b) => b.category === cat.id).length;
    });
    return counts;
  }, []);

  // Filter books
  const filteredBooks = useMemo(() => {
    let result = books;

    if (selectedCategory) {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.translations.en.title.toLowerCase().includes(query) ||
          b.translations.it.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <Head>
        <title>Onde Books - Classici della Letteratura a meno di 1EUR</title>
        <meta
          name="description"
          content="I grandi classici della letteratura mondiale disponibili in 6 lingue a meno di 1 EUR. Spiritualita, Poesia, Arte, Filosofia e molto altro."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌊</text></svg>" />
      </Head>

      <div className="min-h-screen bg-onde-cream">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca titolo o autore..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 rounded-full border border-onde-sand bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-onde-terracotta focus:border-transparent"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              bookCounts={bookCounts}
            />
          </div>

          {/* Results count */}
          <div className="mb-6 text-center">
            <p className="text-onde-ocean">
              {filteredBooks.length === books.length ? (
                <>
                  Mostrando tutti i <span className="font-bold text-onde-rust">{books.length}</span> titoli
                </>
              ) : (
                <>
                  Trovati <span className="font-bold text-onde-rust">{filteredBooks.length}</span> titoli
                  {selectedCategory && (
                    <> in <span className="font-medium">{categories.find(c => c.id === selectedCategory)?.name}</span></>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Books Grid - THE TSUNAMI! */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>

          {/* Empty state */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-onde-deep mb-2">
                Nessun libro trovato
              </h3>
              <p className="text-gray-500">
                Prova a cercare con altri termini o seleziona una categoria diversa.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-4 px-6 py-2 bg-onde-terracotta text-white rounded-full hover:bg-onde-rust transition-colors"
              >
                Mostra tutti i libri
              </button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-onde-terracotta/10 via-onde-rust/10 to-onde-gold/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-onde-deep mb-4">
              La Conoscenza a Portata di Tutti
            </h2>
            <p className="text-onde-ocean max-w-2xl mx-auto mb-6">
              Ogni libro e disponibile in 6 lingue: Inglese, Italiano, Tedesco, Spagnolo, Francese e Portoghese.
              Il prezzo? Sempre meno di 1 EUR.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white px-6 py-3 rounded-full shadow-md">
                <span className="text-2xl mr-2">📖</span>
                <span className="font-medium text-onde-deep">{books.length}+ Titoli</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-full shadow-md">
                <span className="text-2xl mr-2">🌍</span>
                <span className="font-medium text-onde-deep">6 Lingue</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-full shadow-md">
                <span className="text-2xl mr-2">💰</span>
                <span className="font-medium text-onde-deep">Meno di 1EUR</span>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
