export default function Account() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Il Mio Account</h1>
      
      <div className="bg-white/5 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Accedi</h2>
        <input type="email" placeholder="Email" className="w-full bg-white/10 rounded-lg px-4 py-3 mb-4" />
        <button className="btn-primary w-full">Accedi con Email</button>
      </div>

      <div className="text-center opacity-60">
        <p>Non hai un account? Si crea automaticamente al primo acquisto.</p>
      </div>
    </div>
  )
}
