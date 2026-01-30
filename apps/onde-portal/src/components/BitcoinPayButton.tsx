'use client'

import { useState } from 'react'

/**
 * Bitcoin Payment Button - Static Site Compatible
 *
 * Since onde-portal uses static export (output: 'export'),
 * we use OpenNode's hosted checkout page instead of custom API routes.
 *
 * Flow:
 * 1. User clicks button
 * 2. Redirects to OpenNode hosted checkout
 * 3. User pays with Lightning/On-chain
 * 4. OpenNode redirects back to success page
 *
 * For custom QR code modal (requires backend):
 * - Use Cloudflare Pages Functions
 * - Or deploy separate API service
 */

// OpenNode hosted checkout URL builder
// In production, generate this server-side with proper API key
const OPENNODE_CHECKOUT_BASE = 'https://checkout.opennode.com'

interface BitcoinPayButtonProps {
  bookId: string
  bookTitle: string
  priceEurCents?: number
  className?: string
}

export function BitcoinPayButton({
  bookId,
  bookTitle,
  priceEurCents = 499, // Default 4.99 EUR
  className = ''
}: BitcoinPayButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    setLoading(true)

    // For static site, we have two options:
    // 1. Use pre-generated OpenNode checkout link (configured in OpenNode dashboard)
    // 2. Use Cloudflare Pages Function to generate dynamic invoice

    // Option 1: Pre-configured checkout (simplest)
    // Configure in OpenNode Dashboard > Checkout > Create Checkout
    // Set fixed price, description, success/cancel URLs
    const checkoutId = getCheckoutIdForBook(bookId)

    if (checkoutId) {
      // Redirect to OpenNode hosted checkout
      window.location.href = `${OPENNODE_CHECKOUT_BASE}/${checkoutId}`
    } else {
      // Fallback: Show info modal with instructions
      alert(
        `Bitcoin payments for "${bookTitle}" will be available soon!\n\n` +
        `Price: ${(priceEurCents / 100).toFixed(2)} EUR\n\n` +
        `Contact: support@onde.surf`
      )
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
        bg-gradient-to-r from-[#f7931a] to-[#ff9500] text-white
        hover:from-[#ff9500] hover:to-[#f7931a]
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg hover:shadow-xl hover:scale-105
        ${className}
      `}
    >
      <span className="text-xl">₿</span>
      {loading ? 'Redirecting...' : 'Pay with Bitcoin'}
    </button>
  )
}

/**
 * Map book IDs to pre-configured OpenNode checkout IDs
 *
 * To add a new book:
 * 1. Go to OpenNode Dashboard > Checkout > Create Checkout
 * 2. Set: Amount, Currency, Description, Success URL, Cancel URL
 * 3. Copy the checkout ID and add it here
 */
function getCheckoutIdForBook(bookId: string): string | null {
  const checkoutIds: Record<string, string> = {
    // TEST ONLY - Replace with real checkout IDs from OpenNode Dashboard
    // Format: 'book-id': 'opennode-checkout-id'

    // Meditations - Test checkout
    // Configure in OpenNode: 4.99 EUR, "Meditations - Onde Publishing"
    // Success URL: https://onde.surf/success?book=meditations&payment=bitcoin
    // Cancel URL: https://onde.surf/libro/meditations-btc
    'meditations': '', // TODO: Add OpenNode checkout ID after creating in dashboard

    // Add more books here as needed
  }

  return checkoutIds[bookId] || null
}

// Display price in Bitcoin
export function BitcoinPriceDisplay({
  priceEurCents,
  showFiat = true
}: {
  priceEurCents: number
  showFiat?: boolean
}) {
  // Rough estimation: assumes ~90k EUR/BTC
  // In production, fetch real-time rate
  const estimatedSats = Math.round((priceEurCents / 100) / 90000 * 100000000)

  const formatSats = (sats: number) => {
    if (sats >= 1000) {
      return `${(sats / 1000).toFixed(1)}k sats`
    }
    return `${sats} sats`
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[#f7931a] font-bold">₿ {formatSats(estimatedSats)}</span>
      {showFiat && (
        <span className="text-gray-400 text-sm">
          (~{(priceEurCents / 100).toFixed(2)} EUR)
        </span>
      )}
    </span>
  )
}
