import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-onde-cream to-white">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-onde-ocean/20 mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold text-onde-ocean mb-4">
          Pagina non trovata
        </h2>
        <p className="text-onde-ocean/60 mb-8 max-w-md mx-auto">
          Ops! La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-onde-coral to-onde-coral-light
                     text-white font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          ← Torna alla Home
        </Link>
      </div>
    </div>
  )
}
