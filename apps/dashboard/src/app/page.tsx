import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Onde</h1>
          <p className="text-xl mb-8 opacity-90">
            Casa Editrice Digitale & Agenzia PR
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Link
              href="/dashboard"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Entra nella Dashboard
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-semibold mb-2">Catalogo</h3>
              <p className="opacity-80">
                Gestisci libri e release musicali con workflow editoriale completo.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-3">📣</div>
              <h3 className="text-xl font-semibold mb-2">Campagne PR</h3>
              <p className="opacity-80">
                Crea campagne marketing e posta automaticamente su X/Twitter.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Agents</h3>
              <p className="opacity-80">
                Editor, Marketer, Branding, GTM e Social agent al tuo servizio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
