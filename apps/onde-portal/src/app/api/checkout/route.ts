import { NextResponse } from 'next/server'
import { createCheckoutSession, PRICES, formatPrice } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookId, bookTitle, priceType, customerEmail } = body

    // Validazione
    if (!bookId || !bookTitle) {
      return NextResponse.json(
        { error: 'bookId e bookTitle sono richiesti' },
        { status: 400 }
      )
    }

    // Determina il prezzo
    const priceInCents = priceType && priceType in PRICES
      ? PRICES[priceType as keyof typeof PRICES]
      : 0 // Default: libri Gutenberg sono gratuiti

    // Crea sessione checkout
    const result = await createCheckoutSession(
      bookId,
      bookTitle,
      priceInCents,
      customerEmail
    )

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.url,
      price: formatPrice(priceInCents),
      isFree: priceInCents === 0
    })
  } catch (error) {
    console.error('Errore API checkout:', error)
    return NextResponse.json(
      { error: 'Errore durante il checkout' },
      { status: 500 }
    )
  }
}
