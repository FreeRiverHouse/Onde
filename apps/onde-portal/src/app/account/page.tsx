'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string
  createdAt: string
  purchasesCount: number
}

interface Purchase {
  id: string
  bookId: string
  bookTitle: string
  purchasedAt: string
  price: number
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check URL params for messages
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setMessage('Accesso effettuato!')
    }
    if (params.get('error') === 'invalid_token') {
      setError('Link non valido o scaduto. Richiedi un nuovo link.')
    }
    if (params.get('error') === 'missing_token') {
      setError('Token mancante.')
    }

    // Fetch current user
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (data.user) {
        setUser(data.user)
        // Fetch purchases if logged in
        const purchasesRes = await fetch('/api/user/purchases')
        const purchasesData = await purchasesRes.json()
        setPurchases(purchasesData.purchases || [])
      }
    } catch (e) {
      console.error('Error fetching user:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
        setEmail('')
      } else {
        setError(data.error)
      }
    } catch (e) {
      setError('Errore di connessione. Riprova.')
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-white/10 rounded mb-8 w-1/2"></div>
          <div className="h-40 bg-white/10 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  // Logged in view
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Il Mio Account</h1>

        {/* Profile Card */}
        <div className="bg-white/5 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-onde-gold/20 rounded-full flex items-center justify-center text-3xl">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name || user.email}</h2>
              <p className="opacity-60">{user.email}</p>
              <p className="text-sm opacity-40 mt-1">
                Membro dal {new Date(user.createdAt).toLocaleDateString('it-IT', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <a
            href="/api/auth/logout"
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Esci
          </a>
        </div>

        {/* Library Section */}
        <div className="bg-white/5 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">La Mia Libreria</h3>

          {purchases.length === 0 ? (
            <div className="text-center py-12 opacity-60">
              <p className="mb-4">Non hai ancora acquistato nessun libro.</p>
              <a href="/catalogo" className="btn-primary inline-block">
                Esplora il Catalogo
              </a>
            </div>
          ) : (
            <div className="grid gap-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div>
                    <h4 className="font-bold">{purchase.bookTitle}</h4>
                    <p className="text-sm opacity-60">
                      Acquistato il {new Date(purchase.purchasedAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-onde-gold">EUR{purchase.price.toFixed(2)}</span>
                    <a
                      href={`/libro/${purchase.bookId}`}
                      className="px-4 py-2 bg-onde-gold text-black rounded-lg text-sm font-bold hover:bg-onde-gold/80"
                    >
                      Leggi
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Login view
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Accedi</h1>

      {message && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
          {error}
        </div>
      )}

      <div className="bg-white/5 rounded-2xl p-8">
        <p className="text-center mb-6 opacity-80">
          Inserisci la tua email per ricevere un link di accesso.
          <br />
          <span className="text-sm opacity-60">Nessuna password necessaria!</span>
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="la-tua@email.com"
            className="w-full bg-white/10 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-onde-gold"
            required
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-onde-gold text-black font-bold py-3 rounded-lg hover:bg-onde-gold/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Invio in corso...' : 'Invia Link di Accesso'}
          </button>
        </form>
      </div>

      <p className="text-center mt-8 opacity-60 text-sm">
        Non hai un account? Si crea automaticamente al primo accesso.
      </p>
    </div>
  )
}
