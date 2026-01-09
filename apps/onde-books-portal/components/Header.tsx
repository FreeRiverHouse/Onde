export default function Header() {
  return (
    <header className="bg-gradient-to-r from-onde-cream via-onde-warm to-onde-cream py-8 px-4 border-b border-onde-sand/50">
      <div className="max-w-7xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="wave-icon text-4xl">🌊</div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text">
            Onde Books
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-onde-ocean text-lg md:text-xl font-light max-w-2xl mx-auto mb-6">
          I grandi classici della letteratura mondiale a{' '}
          <span className="font-semibold text-onde-rust">meno di 1 EUR</span>
          <br />
          <span className="text-base">Disponibili in 6 lingue</span>
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-onde-terracotta">60+</div>
            <div className="text-sm text-gray-500">Titoli Disponibili</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-onde-terracotta">6</div>
            <div className="text-sm text-gray-500">Lingue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-onde-terracotta">0.50-0.99</div>
            <div className="text-sm text-gray-500">EUR per libro</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-onde-terracotta">8</div>
            <div className="text-sm text-gray-500">Categorie</div>
          </div>
        </div>

        {/* Language flags showcase */}
        <div className="mt-6 flex justify-center gap-2">
          <span className="text-3xl hover:scale-125 transition-transform cursor-pointer" title="English">🇬🇧</span>
          <span className="text-3xl hover:scale-125 transition-transform cursor-pointer" title="Italiano">🇮🇹</span>
          <span className="text-3xl hover:scale-125 transition-transform cursor-pointer" title="Deutsch">🇩🇪</span>
          <span className="text-3xl hover:scale-125 transition-transform cursor-pointer" title="Espanol">🇪🇸</span>
          <span className="text-3xl hover:scale-125 transition-transform cursor-pointer" title="Francais">🇫🇷</span>
          <span className="text-3xl hover:scale-125 transition-transform cursor-pointer" title="Portugues">🇵🇹</span>
        </div>
      </div>
    </header>
  );
}
