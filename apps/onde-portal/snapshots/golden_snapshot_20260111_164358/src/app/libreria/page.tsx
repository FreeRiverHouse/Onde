'use client'

import { useState, useEffect } from 'react'

interface Purchase {
  id: string
  bookId: string
  bookTitle: string
  purchasedAt: string
  price: number
}

interface User {
  id: string
  email: string
  name?: string
}

export default function Libreria() {
  const [user, setUser] = useState<User | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    try {
      const userRes = await fetch('/api/auth/me')
      const userData = await userRes.json()

      if (userData.user) {
        setUser(userData.user)

        const purchasesRes = await fetch('/api/user/purchases')
        const purchasesData = await purchasesRes.json()
        setPurchases(purchasesData.purchases || [])
      }
    } catch (e) {
      console.error('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-white/10 rounded mb-8 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">La Mia Libreria</h1>

        <div className="text-center py-20">
          <div className="text-6xl mb-6">🔐</div>
          <p className="text-xl mb-4 opacity-80">Accedi per vedere la tua libreria</p>
          <p className="opacity-60 mb-8">
            I tuoi libri acquistati saranno sempre disponibili qui.
          </p>
          <a
            href="/account"
            className="inline-block bg-onde-gold text-black font-bold px-8 py-3 rounded-lg hover:bg-onde-gold/80"
          >
            Accedi
          </a>
        </div>
      </div>
    )
  }

  // Logged in but no purchases
  if (purchases.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">La Mia Libreria</h1>

        <div className="text-center py-20 opacity-60">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl mb-4">La tua libreria e vuota</p>
          <p>Acquista il tuo primo libro per iniziare a leggere!</p>
          <a
            href="/catalogo"
            className="inline-block bg-onde-gold text-black font-bold px-8 py-3 rounded-lg hover:bg-onde-gold/80 mt-6"
          >
            Vai al Catalogo
          </a>
        </div>
      </div>
    )
  }

  // Logged in with purchases
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">La Mia Libreria</h1>
        <span className="text-onde-gold">{purchases.length} libri</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {purchases.map((purchase) => (
          <a
            key={purchase.id}
            href={`/libro/${purchase.bookId}`}
            className="group"
          >
            <div className="aspect-[3/4] bg-gradient-to-br from-onde-gold/30 to-onde-dark rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
              {/* Placeholder book cover */}
              <div className="text-4xl">📖</div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-onde-gold text-black font-bold px-4 py-2 rounded-lg">
                  Leggi
                </span>
              </div>
            </div>

            <h3 className="font-bold text-sm group-hover:text-onde-gold transition-colors line-clamp-2">
              {purchase.bookTitle}
            </h3>

            <p className="text-xs opacity-60 mt-1">
              Acquistato {new Date(purchase.purchasedAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </a>
        ))}
      </div>

      {/* Reading stats */}
      <div className="mt-16 grid grid-cols-3 gap-6 bg-white/5 rounded-2xl p-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-onde-gold">{purchases.length}</div>
          <div className="text-sm opacity-60">Libri acquistati</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-onde-gold">0</div>
          <div className="text-sm opacity-60">In lettura</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-onde-gold">0</div>
          <div className="text-sm opacity-60">Completati</div>
        </div>
      </div>
    </div>
  )
}
