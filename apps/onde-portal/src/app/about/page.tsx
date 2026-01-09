export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="relative py-20 px-4 text-center bg-gradient-to-b from-[#0a1628] to-onde-dark">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-6">🌊</div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
            Chi Siamo
          </h1>
          <p className="text-xl text-[#2dd4bf] font-light italic">
            Storie che viaggiano come onde, raggiungendo ogni riva.
          </p>
        </div>
      </div>

      {/* Main content - Scritto da Gianni Parola */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-10 text-lg leading-relaxed">

          {/* La nostra storia */}
          <section>
            <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed">
              Le storie migliori sono quelle che continuano a vivere.
              Passano di mano in mano, di generazione in generazione,
              come onde che non smettono mai di muoversi.
            </p>
          </section>

          <section className="text-white/70 space-y-6">
            <p>
              <strong className="text-onde-gold">Onde</strong> è nata da una convinzione:
              i grandi classici della letteratura non appartengono a nessuno e appartengono a tutti.
              Sono patrimonio dell'umanità. E meritano di essere letti, amati, condivisi.
            </p>

            <p>
              Non vendiamo libri. Apriamo porte. Ogni titolo nel nostro catalogo è gratuito,
              perché crediamo che la bellezza debba circolare liberamente.
              Come un fiume che nutre la terra che attraversa.
            </p>
          </section>

          {/* La cura */}
          <section className="border-l-4 border-[#2dd4bf] pl-6 py-4">
            <p className="text-white/80 italic">
              "Non basta rendere disponibile un testo. Bisogna renderlo vivo.
              Ogni libro che pubblichiamo è curato come se fosse l'unico."
            </p>
            <p className="text-onde-gold mt-3 text-sm font-medium">— Gianni Parola</p>
          </section>

          <section className="text-white/70 space-y-6">
            <p>
              Le nostre illustrazioni sono acquarelli. Pennellate morbide, luce dorata,
              quello stile europeo che sa di libri sfogliati davanti al camino.
              Niente plastica digitale. Niente cartoon. Solo arte che respira.
            </p>

            <p>
              Ogni testo è verificato sulle fonti originali. Non ci accontentiamo
              di quello che troviamo in giro. Andiamo a cercare le edizioni storiche,
              confrontiamo, correggiamo. Perché le parole meritano rispetto.
            </p>
          </section>

          {/* Il nome */}
          <section className="bg-white/5 rounded-2xl p-8 my-12">
            <h2 className="text-2xl font-serif font-bold text-[#2dd4bf] mb-4">
              Perché "Onde"?
            </h2>
            <p className="text-white/70">
              Perché le storie si muovono come onde. Partono da un punto
              e raggiungono rive che non potevano immaginare.
              Perché ogni lettura è un'onda che ti attraversa e ti cambia, anche solo un poco.
              Perché il nostro logo sembra un fiore che sboccia — e forse non è un caso.
            </p>
          </section>

        </div>

        {/* La Redazione */}
        <div className="border-t border-onde-gold/20 pt-16 mt-16">
          <h2 className="text-3xl font-serif font-bold mb-2 text-center text-white">La Redazione</h2>
          <p className="text-center text-white/50 mb-12">Le mani e i cuori dietro ogni pagina</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Gianni Parola */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-8 border border-white/10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2dd4bf]/20 to-onde-gold/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">✍️</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-onde-gold text-center mb-2">
                Gianni Parola
              </h3>
              <p className="text-[#2dd4bf] text-center text-sm mb-4">Scrittore & Curatore Editoriale</p>
              <p className="text-white/60 text-center text-sm leading-relaxed">
                Cerca le parole giuste tra quelle che esistono già.
                Cura i testi come un giardiniere cura le rose:
                con pazienza, rispetto, e un po' di meraviglia.
              </p>
            </div>

            {/* Pina Pennello */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-8 border border-white/10">
              <div className="w-20 h-20 bg-gradient-to-br from-onde-gold/20 to-[#2dd4bf]/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-onde-gold text-center mb-2">
                Pina Pennello
              </h3>
              <p className="text-[#2dd4bf] text-center text-sm mb-4">Illustratrice</p>
              <p className="text-white/60 text-center text-sm leading-relaxed">
                Dipinge mondi con l'acquarello, un colore alla volta.
                Il suo stile è quello dei libri che tua nonna sfogliava —
                morbido, caldo, senza tempo.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-20 py-12">
          <p className="text-white/50 mb-6">
            Mille libri. Zero euro. Infinite storie.
          </p>
          <a
            href="/catalogo"
            className="inline-block bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] text-[#0a1628] font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
          >
            Esplora la Biblioteca →
          </a>
        </div>
      </div>
    </div>
  )
}
