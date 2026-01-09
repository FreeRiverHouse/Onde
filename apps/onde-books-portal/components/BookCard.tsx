import { useState } from 'react';
import { Book, Language, languages } from '../data/books';

interface BookCardProps {
  book: Book;
  index: number;
}

export default function BookCard({ book, index }: BookCardProps) {
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const translation = book.translations[selectedLang];
  const currentFlag = languages.find(l => l.code === selectedLang)?.flag || '🇬🇧';

  return (
    <div
      className="book-card bg-white rounded-2xl shadow-lg overflow-hidden border border-onde-sand/30 hover:shadow-2xl grid-item"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Book Cover Placeholder */}
      <div className={`h-48 ${book.color} relative flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="text-white/90 font-serif text-lg leading-tight font-medium drop-shadow-lg">
            {translation.title}
          </div>
          <div className="text-white/70 text-sm mt-2 font-light">
            {book.author}
          </div>
        </div>

        {/* Year badge */}
        {book.year && (
          <div className="absolute top-3 left-3 bg-black/30 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {book.year}
          </div>
        )}

        {/* Language Selector */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="bg-white/90 hover:bg-white text-2xl w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            {currentFlag}
          </button>

          {showLangMenu && (
            <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl p-2 z-10 min-w-[140px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-onde-sand/30 ${
                    selectedLang === lang.code ? 'bg-onde-terracotta/10 text-onde-rust' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-onde-deep text-sm leading-tight mb-1 line-clamp-2">
          {translation.title}
        </h3>
        <p className="text-onde-ocean text-xs mb-2">{book.author}</p>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">
          {translation.description}
        </p>

        {/* Language flags row */}
        <div className="flex gap-1 mb-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`lang-flag text-lg p-1 rounded ${
                selectedLang === lang.code
                  ? 'bg-onde-terracotta/20 ring-2 ring-onde-terracotta'
                  : 'hover:bg-gray-100'
              }`}
              title={lang.name}
            >
              {lang.flag}
            </button>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-onde-rust font-bold text-xl">
              {book.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-400 text-sm">EUR</span>
          </div>
          <button className="bg-gradient-to-r from-onde-terracotta to-onde-rust text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all hover:scale-105">
            Acquista
          </button>
        </div>
      </div>
    </div>
  );
}
