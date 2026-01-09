export default function Footer() {
  return (
    <footer className="bg-onde-deep text-white py-12 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌊</span>
              <span className="text-2xl font-serif font-bold">Onde Books</span>
            </div>
            <p className="text-white/70 text-sm">
              Classici della letteratura mondiale accessibili a tutti.
              Ogni libro disponibile in 6 lingue a meno di 1 EUR.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categorie</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="hover:text-onde-gold cursor-pointer transition-colors">🕯️ Spiritualita</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">📜 Poesia</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">🎨 Arte</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">⚡ Tech</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">🌿 Health</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">🧸 Bambini</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">🦉 Filosofia</li>
              <li className="hover:text-onde-gold cursor-pointer transition-colors">📚 Classici</li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold mb-4">Lingue Disponibili</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">🇬🇧 English</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">🇮🇹 Italiano</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">🇩🇪 Deutsch</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">🇪🇸 Espanol</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">🇫🇷 Francais</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">🇵🇹 Portugues</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-white/50 text-sm">
          <p>2026 Onde Books - Tutti i diritti riservati</p>
          <p className="mt-2">
            Fatto con ❤️ per diffondere la cultura nel mondo
          </p>
        </div>
      </div>
    </footer>
  );
}
