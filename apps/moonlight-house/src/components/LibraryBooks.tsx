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

// Onde Kids book catalog
const BOOKS: Book[] = [
  {
    id: 'aiko',
    title: { it: 'AIKO e l\'Intelligenza Artificiale', en: 'AIKO and Artificial Intelligence' },
    description: { 
      it: 'Scopri il mondo dell\'AI con AIKO! Un\'avventura tecnologica per i piccoli curiosi.',
      en: 'Discover the world of AI with AIKO! A tech adventure for curious kids.'
    },
    cover: '/assets/books/aiko-cover.jpg',
    author: 'Onde Kids',
    ageRange: '5-10',
    price: 4.99,
    coinPrice: 50,
    pages: 32,
    freePreview: 3,
    storeUrl: 'https://onde.la/books/aiko',
    color: '#4FC3F7',
    category: 'tech',
  },
  {
    id: 'salmo23',
    title: { it: 'Il Salmo 23 per Bambini', en: 'Psalm 23 for Kids' },
    description: {
      it: 'Una dolce interpretazione del Salmo più amato, con illustrazioni magiche.',
      en: 'A sweet interpretation of the most beloved Psalm, with magical illustrations.'
    },
    cover: '/assets/books/salmo23-cover.jpg',
    author: 'Onde Kids',
    ageRange: '4-8',
    price: 3.99,
    coinPrice: 40,
    pages: 24,
    freePreview: 2,
    storeUrl: 'https://onde.la/books/salmo23',
    color: '#81C784',
    category: 'spiritual',
  },
  {
    id: 'piccole-rime',
    title: { it: 'Piccole Rime', en: 'Little Rhymes' },
    description: {
      it: 'Poesie dolci e divertenti per i più piccoli. Rime che fanno sorridere!',
      en: 'Sweet and fun poems for little ones. Rhymes that make you smile!'
    },
    cover: '/assets/books/piccole-rime-cover.jpg',
    author: 'Onde Kids',
    ageRange: '3-6',
    price: 2.99,
    coinPrice: 30,
    pages: 20,
    freePreview: 3,
    storeUrl: 'https://onde.la/books/piccole-rime',
    color: '#F48FB1',
    category: 'poetry',
  },
  {
    id: 'desideri',
    title: { it: 'Il Potere dei Desideri', en: 'The Power of Wishes' },
    description: {
      it: 'Impara a sognare in grande! Una storia sulla forza dei desideri.',
      en: 'Learn to dream big! A story about the power of wishes.'
    },
    cover: '/assets/books/desideri-cover.jpg',
    author: 'Onde Kids',
    ageRange: '6-10',
    price: 4.99,
    coinPrice: 50,
    pages: 36,
    freePreview: 3,
    storeUrl: 'https://onde.la/books/desideri',
    color: '#FFD54F',
    category: 'growth',
  },
  {
    id: 'respiro-magico',
    title: { it: 'Il Respiro Magico', en: 'The Magic Breath' },
    description: {
      it: 'Tecniche di respirazione per bambini. Calma e relax in modo divertente!',
      en: 'Breathing techniques for kids. Calm and relaxation the fun way!'
    },
    cover: '/assets/books/respiro-cover.jpg',
    author: 'Onde Kids',
    ageRange: '4-8',
    price: 3.99,
    coinPrice: 40,
    pages: 28,
    freePreview: 2,
    storeUrl: 'https://onde.la/books/respiro-magico',
    color: '#B39DDB',
    category: 'mindfulness',
  },
  {
    id: 'inventore',
    title: { it: 'Il Piccolo Inventore', en: 'The Little Inventor' },
    description: {
      it: 'Sogna, crea, inventa! La storia di un bambino che cambia il mondo.',
      en: 'Dream, create, invent! The story of a child who changes the world.'
    },
    cover: '/assets/books/inventore-cover.jpg',
    author: 'Onde Kids',
    ageRange: '6-10',
    price: 4.99,
    coinPrice: 50,
    pages: 32,
    freePreview: 3,
    storeUrl: 'https://onde.la/books/inventore',
    color: '#FF8A65',
    category: 'tech',
  },
  {
    id: 'cinque-sensi',
    title: { it: 'I Cinque Sensi di Luna', en: 'Luna\'s Five Senses' },
    description: {
      it: 'Esplora il mondo attraverso i sensi insieme a Luna!',
      en: 'Explore the world through senses with Luna!'
    },
    cover: '/assets/books/sensi-cover.jpg',
    author: 'Onde Kids',
    ageRange: '3-6',
    price: 3.99,
    coinPrice: 35,
    pages: 24,
    freePreview: 2,
    storeUrl: 'https://onde.la/books/cinque-sensi',
    color: '#4DB6AC',
    category: 'sensory',
  },
];

// Demo pages content (placeholder - would be actual page images in production)
const DEMO_PAGES: Record<string, { it: string; en: string }[]> = {
  aiko: [
    { it: 'Ciao! Sono AIKO, un\'intelligenza artificiale...', en: 'Hi! I\'m AIKO, an artificial intelligence...' },
    { it: 'Ti chiedi cosa sia l\'AI? È come avere un amico robot che impara!', en: 'Wondering what AI is? It\'s like having a robot friend who learns!' },
    { it: 'Insieme possiamo esplorare come funziona la tecnologia!', en: 'Together we can explore how technology works!' },
  ],
  salmo23: [
    { it: 'Il Signore è il mio pastore, non mi manca nulla...', en: 'The Lord is my shepherd, I shall not want...' },
    { it: 'Mi fa riposare in verdi pascoli...', en: 'He makes me lie down in green pastures...' },
  ],
  'piccole-rime': [
    { it: 'La luna splende alta nel cielo, e illumina ogni bimbo bello...', en: 'The moon shines high in the sky, lighting every child passing by...' },
    { it: 'Le stelle danzano la sera, come una grande festa vera!', en: 'The stars dance at night, what a wonderful sight!' },
    { it: 'E quando chiudi gli occhietti, sogni dolci e perfetti!', en: 'And when you close your eyes tight, dreams are sweet and bright!' },
  ],
  desideri: [
    { it: 'C\'era una volta un bambino che sapeva sognare...', en: 'Once upon a time there was a child who knew how to dream...' },
    { it: 'I suoi desideri erano grandi come le stelle!', en: 'Her wishes were as big as the stars!' },
    { it: 'E un giorno scoprì che i sogni possono avverarsi...', en: 'And one day she discovered that dreams can come true...' },
  ],
  'respiro-magico': [
    { it: 'Inspira... 1, 2, 3... senti l\'aria entrare...', en: 'Breathe in... 1, 2, 3... feel the air come in...' },
    { it: 'Espira... 3, 2, 1... lascia andare tutto!', en: 'Breathe out... 3, 2, 1... let everything go!' },
  ],
  inventore: [
    { it: 'Tommaso aveva sempre mille idee in testa...', en: 'Tommy always had a thousand ideas in his head...' },
    { it: 'Un giorno costruì una macchina speciale...', en: 'One day he built a special machine...' },
    { it: 'Era fatta di cartone, bottoni e tanta fantasia!', en: 'It was made of cardboard, buttons, and lots of imagination!' },
  ],
  'cinque-sensi': [
    { it: 'Luna tocca il velluto morbido... che bello!', en: 'Luna touches the soft velvet... how nice!' },
    { it: 'Sente il profumo dei fiori nel giardino...', en: 'She smells the flowers in the garden...' },
  ],
};

interface LibraryBooksProps {
  lang: Language;
  coins: number;
  onUnlockBook: (bookId: string, cost: number) => void;
  onBack: () => void;
  unlockedBooks: string[];
  onReward: (reward: { happiness: number; xp: number }) => void;
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
    onReward({ happiness: 15, xp: 10 });
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
            src="/assets/character/luna-happy.jpg" 
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
