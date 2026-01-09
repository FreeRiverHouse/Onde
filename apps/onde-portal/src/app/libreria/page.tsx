export default function Libreria() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">La Mia Libreria</h1>
      
      <div className="text-center py-20 opacity-60">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-xl mb-4">La tua libreria è vuota</p>
        <p>Acquista il tuo primo libro per iniziare a leggere!</p>
        <a href="/catalogo" className="btn-primary inline-block mt-6">Vai al Catalogo</a>
      </div>
    </div>
  )
}
