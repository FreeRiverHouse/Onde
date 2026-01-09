export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Chi Siamo</h1>

      <div className="space-y-8 text-lg leading-relaxed opacity-90">
        <p>
          <strong className="text-onde-gold">Onde</strong> nasce da un'idea semplice:
          i grandi classici della letteratura meritano edizioni curate, illustrate con gusto,
          e accessibili a tutti.
        </p>

        <p>
          Ogni nostro libro e illustrato ad acquarello, in stile europeo classico.
          Niente plastica digitale, niente cartoon americani.
          Solo pennellate morbide, luce dorata, e quella cura artigianale
          che trasforma ogni pagina in un piccolo quadro.
        </p>

        <p>
          Lavoriamo esclusivamente con testi in pubblico dominio,
          verificati su fonti originali. Le storie che hanno attraversato i secoli,
          finalmente in edizioni degne del loro valore.
        </p>

        <div className="border-t border-onde-gold/20 pt-8 mt-12">
          <h2 className="text-2xl font-bold mb-4">La Redazione</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-onde-gold">Gianni Parola</h3>
              <p className="opacity-70">Scrittore e curatore editoriale</p>
            </div>
            <div>
              <h3 className="font-bold text-onde-gold">Pina Pennello</h3>
              <p className="opacity-70">Illustratrice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
