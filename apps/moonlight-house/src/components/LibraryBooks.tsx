import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LibraryBooks.css';

type Language = 'it' | 'en';

interface Book {
  id: string;
  title: { it: string; en: string };
  description: { it: string; en: string };
  cover: string;
  author: string;
  ageRange: string;
  price: number;
  coinPrice: number; // Coins to unlock demo
  pages: number;
  freePreview: number;
  storeUrl: string;
  color: string; // Spine color
  category: 'tech' | 'spiritual' | 'poetry' | 'growth' | 'mindfulness' | 'sensory';
}

// Onde Books - Real published books only!
const BOOKS: Book[] = [
  {
    id: 'meditations-en',
    title: { it: 'Meditazioni', en: 'Meditations' },
    description: { 
      it: 'La saggezza senza tempo di Marco Aurelio per vivere con coraggio e serenità.',
      en: 'Timeless wisdom from Marcus Aurelius on living with courage and tranquility.'
    },
    cover: '/images/books/meditations-cover.jpg',
    author: 'Marcus Aurelius',
    ageRange: '12+',
    price: 0,
    coinPrice: 0, // Free!
    pages: 120,
    freePreview: 10,
    storeUrl: 'https://onde.la/libro/meditations-en',
    color: '#2C3E50',
    category: 'spiritual',
  },
  {
    id: 'meditations-it',
    title: { it: 'Meditazioni', en: 'Meditations (Italian)' },
    description: { 
      it: 'La saggezza senza tempo di Marco Aurelio per vivere con coraggio e serenità.',
      en: 'Timeless wisdom from Marcus Aurelius. Italian edition.'
    },
    cover: '/images/books/meditations-cover.jpg',
    author: 'Marco Aurelio',
    ageRange: '12+',
    price: 0,
    coinPrice: 0, // Free!
    pages: 120,
    freePreview: 10,
    storeUrl: 'https://onde.la/libro/meditations-it',
    color: '#8E44AD',
    category: 'spiritual',
  },
  {
    id: 'shepherds-promise',
    title: { it: 'La Promessa del Pastore', en: "The Shepherd's Promise" },
    description: {
      it: 'Una dolce interpretazione del Salmo 23 con bellissime illustrazioni.',
      en: 'A gentle retelling of Psalm 23 with beautiful illustrations.'
    },
    cover: '/books/shepherds-promise-cover.jpg',
    author: 'Onde',
    ageRange: '4-10',
    price: 0,
    coinPrice: 0, // Free!
    pages: 32,
    freePreview: 10,
    storeUrl: 'https://onde.la/libro/shepherds-promise',
    color: '#27AE60',
    category: 'spiritual',
  },
];

// Demo pages content - excerpts from our real books
const DEMO_PAGES: Record<string, { it: string; en: string }[]> = {
  'meditations-en': [
    { it: 'Inizia ogni mattino dicendoti: oggi incontrerò...', en: 'Begin each day by telling yourself: Today I shall meet...' },
    { it: 'L\'impedimento all\'azione fa avanzare l\'azione.', en: 'The impediment to action advances action.' },
    { it: 'Non perdere tempo a discutere su cosa dovrebbe essere un brav\'uomo. Sii uno.', en: 'Waste no more time arguing about what a good man should be. Be one.' },
    { it: 'La felicità della tua vita dipende dalla qualità dei tuoi pensieri.', en: 'The happiness of your life depends upon the quality of your thoughts.' },
    { it: 'Ricevi senza superbia, lascia andare senza attaccamento.', en: 'Receive without pride, let go without attachment.' },
  ],
  'meditations-it': [
    { it: 'Inizia ogni mattino dicendoti: oggi incontrerò...', en: 'Begin each day by telling yourself: Today I shall meet...' },
    { it: 'L\'impedimento all\'azione fa avanzare l\'azione.', en: 'The impediment to action advances action.' },
    { it: 'Non perdere tempo a discutere su cosa dovrebbe essere un brav\'uomo. Sii uno.', en: 'Waste no more time arguing about what a good man should be. Be one.' },
    { it: 'La felicità della tua vita dipende dalla qualità dei tuoi pensieri.', en: 'The happiness of your life depends upon the quality of your thoughts.' },
    { it: 'Ricevi senza superbia, lascia andare senza attaccamento.', en: 'Receive without pride, let go without attachment.' },
  ],
  'shepherds-promise': [
    { it: 'Il Signore è il mio pastore, non mi manca nulla...', en: 'The Lord is my shepherd, I shall not want...' },
    { it: 'Mi fa riposare in verdi pascoli...', en: 'He makes me lie down in green pastures...' },
    { it: 'Mi conduce presso acque tranquille...', en: 'He leads me beside quiet waters...' },
    { it: 'Rinfranca l\'anima mia...', en: 'He refreshes my soul...' },
    { it: 'Anche se cammino in una valle oscura, non temo alcun male...', en: 'Even though I walk through the darkest valley, I will fear no evil...' },
  ],
};

interface LibraryBooksProps {
  lang: Language;
  coins: number;
  onUnlockBook: (bookId: string, cost: number) => void;
  onBack: () => void;
  unlockedBooks: string[];
  onReward: (reward: { happiness?: number; xp?: number; health?: number; coins?: number }) => void;
}

export function LibraryBooks({
  lang,
  coins,
  onUnlockBook,
  onBack,
  unlockedBooks,
  onReward,
}: LibraryBooksProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showShelf, setShowShelf] = useState(true);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentPage(0);
    setShowShelf(false);
  };

  const handleUnlock = (book: Book) => {
    if (coins >= book.coinPrice) {
      onUnlockBook(book.id, book.coinPrice);
    }
  };

  const handleNextPage = () => {
    if (!selectedBook) return;
    const pages = DEMO_PAGES[selectedBook.id] || [];
    const maxPages = unlockedBooks.includes(selectedBook.id) 
      ? pages.length 
      : selectedBook.freePreview;
    
    if (currentPage < maxPages - 1) {
      setCurrentPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  const handleFinishReading = () => {
    // Reading boosts happiness, health, XP, and earns coins!
    onReward({ happiness: 20, xp: 15, health: 10, coins: 5 });
    setSelectedBook(null);
    setShowShelf(true);
  };

  const handleBuyBook = (book: Book) => {
    window.open(book.storeUrl, '_blank');
  };

  // Bookshelf view
  if (showShelf) {
    return (
      <motion.div 
        className="library-books-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="library-header glass-card">
          <button className="back-btn" onClick={onBack}>← 🏠</button>
          <h1 className="library-title">
            📚 {lang === 'it' ? 'Biblioteca di Luna' : 'Luna\'s Library'}
          </h1>
          <div className="coins-display">
            <span className="coin-icon">✨</span>
            <span>{coins}</span>
          </div>
        </div>

        <div className="bookshelf">
          <div className="shelf-row">
            {BOOKS.slice(0, 4).map((book, index) => (
              <motion.button
                key={book.id}
                className="book-spine"
                style={{ backgroundColor: book.color }}
                onClick={() => handleSelectBook(book)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="book-spine-title">{book.title[lang]}</span>
                {unlockedBooks.includes(book.id) && (
                  <span className="book-unlocked-badge">✓</span>
                )}
              </motion.button>
            ))}
          </div>
          <div className="shelf-wood" />
          
          <div className="shelf-row">
            {BOOKS.slice(4).map((book, index) => (
              <motion.button
                key={book.id}
                className="book-spine"
                style={{ backgroundColor: book.color }}
                onClick={() => handleSelectBook(book)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 4) * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="book-spine-title">{book.title[lang]}</span>
                {unlockedBooks.includes(book.id) && (
                  <span className="book-unlocked-badge">✓</span>
                )}
              </motion.button>
            ))}
          </div>
          <div className="shelf-wood" />
        </div>

        <p className="library-hint">
          {lang === 'it' 
            ? '👆 Tocca un libro per leggerlo!' 
            : '👆 Tap a book to read it!'}
        </p>

        <div className="luna-reading">
          <img 
            src="/assets/character/luna-happy.svg" 
            alt="Luna"
            className="luna-library-img"
          />
          <div className="luna-speech-bubble">
            {lang === 'it' 
              ? '"Quale libro leggiamo oggi?" 📖✨' 
              : '"Which book shall we read today?" 📖✨'}
          </div>
        </div>
      </motion.div>
    );
  }

  // Book reading view
  if (selectedBook) {
    const pages = DEMO_PAGES[selectedBook.id] || [];
    const isUnlocked = unlockedBooks.includes(selectedBook.id);
    const maxPages = isUnlocked ? pages.length : selectedBook.freePreview;
    const isLastPage = currentPage >= maxPages - 1;
    const showUnlockPrompt = !isUnlocked && currentPage >= selectedBook.freePreview - 1;

    return (
      <motion.div 
        className="book-reader-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="book-reader-header glass-card">
          <button className="back-btn" onClick={() => { setSelectedBook(null); setShowShelf(true); }}>
            ← 📚
          </button>
          <h2 className="book-reader-title">{selectedBook.title[lang]}</h2>
          <span className="page-counter">
            {currentPage + 1} / {maxPages}
          </span>
        </div>

        <div className="book-open">
          <div className="book-page left-page">
            {currentPage > 0 && (
              <p className="page-text">{pages[currentPage - 1]?.[lang]}</p>
            )}
            {currentPage === 0 && (
              <div className="book-cover-mini">
                <span className="cover-emoji">📖</span>
                <h3>{selectedBook.title[lang]}</h3>
                <p className="book-author">{selectedBook.author}</p>
              </div>
            )}
          </div>
          
          <div className="book-spine-center" />
          
          <div className="book-page right-page">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="page-content"
              >
                {showUnlockPrompt ? (
                  <div className="unlock-prompt">
                    <span className="lock-icon">🔒</span>
                    <p>{lang === 'it' 
                      ? 'Sblocca il libro completo!' 
                      : 'Unlock the full book!'}</p>
                    <div className="unlock-options">
                      <button 
                        className="unlock-btn coins-btn"
                        onClick={() => handleUnlock(selectedBook)}
                        disabled={coins < selectedBook.coinPrice}
                      >
                        ✨ {selectedBook.coinPrice} {lang === 'it' ? 'monete' : 'coins'}
                      </button>
                      <span className="or-text">{lang === 'it' ? 'oppure' : 'or'}</span>
                      <button 
                        className="unlock-btn buy-btn"
                        onClick={() => handleBuyBook(selectedBook)}
                      >
                        🛒 €{selectedBook.price.toFixed(2)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="page-text">{pages[currentPage]?.[lang]}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="book-navigation">
          <button 
            className="nav-btn prev-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            ◀ {lang === 'it' ? 'Indietro' : 'Back'}
          </button>
          
          {isLastPage && !showUnlockPrompt ? (
            <button className="nav-btn finish-btn" onClick={handleFinishReading}>
              ✨ {lang === 'it' ? 'Fine!' : 'The End!'}
            </button>
          ) : (
            <button 
              className="nav-btn next-btn"
              onClick={handleNextPage}
              disabled={showUnlockPrompt}
            >
              {lang === 'it' ? 'Avanti' : 'Next'} ▶
            </button>
          )}
        </div>

        <div className="book-info glass-card">
          <span>👶 {selectedBook.ageRange} {lang === 'it' ? 'anni' : 'years'}</span>
          <span>📄 {selectedBook.pages} {lang === 'it' ? 'pagine' : 'pages'}</span>
          <span className="category-badge">{getCategoryIcon(selectedBook.category)}</span>
        </div>
      </motion.div>
    );
  }

  return null;
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    tech: '🤖',
    spiritual: '✨',
    poetry: '🎭',
    growth: '🌱',
    mindfulness: '🧘',
    sensory: '👁️',
  };
  return icons[category] || '📚';
}

export default LibraryBooks;
