'use client'

import { useState } from 'react'

interface BuyButtonProps {
  bookId: string
  bookTitle: string
  priceType?: 'free' | 'ebook_small' | 'ebook_standard' | 'ebook_premium'
  className?: string
}

export function BuyButton({
  bookId,
  bookTitle,
  priceType = 'free',
  className = ''
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFree = priceType === 'free'

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          bookTitle,
          priceType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore checkout')
      }

      // Redirect alla pagina di checkout o success
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  const buttonText = loading
    ? 'Caricamento...'
    : isFree
    ? 'Leggi Gratis'
    : 'Acquista'

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          px-6 py-3 rounded-lg font-semibold transition-all
          ${isFree
            ? 'bg-onde-gold text-black hover:bg-onde-gold/90'
            : 'bg-green-600 text-white hover:bg-green-700'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {buttonText}
      </button>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}

// Componente per mostrare il prezzo
export function PriceDisplay({
  priceType = 'free'
}: {
  priceType?: 'free' | 'ebook_small' | 'ebook_standard' | 'ebook_premium'
}) {
  const prices: Record<string, string> = {
    free: 'Gratis',
    ebook_small: '€2.99',
    ebook_standard: '€4.99',
    ebook_premium: '€7.99',
  }

  const price = prices[priceType] || 'Gratis'

  return (
    <span className={`
      font-bold text-lg
      ${priceType === 'free' ? 'text-onde-gold' : 'text-green-400'}
    `}>
      {price}
    </span>
  )
}
