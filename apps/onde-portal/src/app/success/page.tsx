export default function Success() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-4xl font-bold mb-4">Grazie per l'acquisto!</h1>
      <p className="opacity-70 mb-8">
        Il tuo libro è ora disponibile nella tua libreria.
      </p>
      <div className="flex gap-4 justify-center">
        <a href="/libreria" className="btn-primary">Vai alla Libreria</a>
        <a href="/catalogo" className="btn-secondary">Continua a Esplorare</a>
      </div>
    </div>
  )
}
