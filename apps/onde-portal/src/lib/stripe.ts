import Stripe from 'stripe'

// Stripe server-side client
// STRIPE_SECRET_KEY deve essere impostata in .env.local
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey && stripeSecretKey !== 'sk_test_xxx'
  ? new Stripe(stripeSecretKey, {
      // @ts-expect-error - API version will be validated at runtime
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null

// Prezzi base per categoria (in centesimi)
export const PRICES = {
  // Libri gratuiti (public domain)
  free: 0,

  // Ebook Onde originali
  ebook_small: 299,      // €2.99 - libri brevi, poesie
  ebook_standard: 499,   // €4.99 - libri medi
  ebook_premium: 799,    // €7.99 - libri lunghi, illustrati

  // Bundle
  bundle_3: 999,         // €9.99 - 3 libri a scelta
  bundle_10: 2499,       // €24.99 - 10 libri a scelta
  bundle_all: 4999,      // €49.99 - accesso completo

  // Abbonamento mensile
  subscription: 999,     // €9.99/mese - tutti i libri
} as const

export type PriceType = keyof typeof PRICES

// Helper per formattare i prezzi
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Gratis'
  return `€${(cents / 100).toFixed(2)}`
}

// Tipi di prodotto disponibili
export interface OndeProduct {
  id: string
  name: string
  description: string
  priceType: PriceType
  priceCents: number
  metadata?: Record<string, string>
}

// Helper per creare un prodotto libro
export function createBookProduct(book: {
  id: string
  title: string
  author: string
  isFree?: boolean
  priceType?: PriceType
}): OndeProduct {
  const priceType = book.priceType || (book.isFree ? 'free' : 'ebook_standard')
  return {
    id: book.id,
    name: book.title,
    description: `di ${book.author}`,
    priceType,
    priceCents: PRICES[priceType],
    metadata: {
      type: 'book',
      bookId: book.id,
      author: book.author,
    }
  }
}

// Crea una sessione di checkout Stripe
export async function createCheckoutSession(
  bookId: string,
  bookTitle: string,
  priceInCents: number,
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ url: string | null; error?: string }> {
  // Se il libro è gratuito, redirect diretto
  if (priceInCents === 0) {
    return { url: successUrl || `/success?book=${bookId}` }
  }

  // Se Stripe non è configurato, errore
  if (!stripe) {
    console.warn('Stripe non configurato - checkout disabilitato')
    return {
      url: null,
      error: 'Sistema di pagamento non configurato. Contatta support@onde.surf'
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: bookTitle,
              description: `Ebook - Onde Publishing`,
              metadata: {
                bookId,
              },
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}&book=${bookId}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/libro/${bookId}`,
      customer_email: customerEmail,
      metadata: {
        bookId,
        bookTitle,
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error('Errore creazione checkout Stripe:', error)
    return {
      url: null,
      error: 'Errore durante la creazione del checkout. Riprova.'
    }
  }
}

// Verifica una sessione di checkout completata
export async function verifyCheckoutSession(sessionId: string) {
  if (!stripe) {
    return { verified: false, error: 'Stripe non configurato' }
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      return {
        verified: true,
        bookId: session.metadata?.bookId,
        customerEmail: session.customer_email,
      }
    }

    return { verified: false, error: 'Pagamento non completato' }
  } catch (error) {
    console.error('Errore verifica sessione:', error)
    return { verified: false, error: 'Errore verifica pagamento' }
  }
}

// Webhook handler per eventi Stripe
export async function handleStripeWebhook(
  body: string,
  signature: string,
  webhookSecret: string
): Promise<{ received: boolean; event?: Stripe.Event; error?: string }> {
  if (!stripe) {
    return { received: false, error: 'Stripe non configurato' }
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Gestisci eventi specifici
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // eslint-disable-next-line no-console
        console.log('Checkout completato:', session.id)
        // TODO: Attivare accesso al libro per l'utente
        break
      }

      case 'payment_intent.succeeded': {
        // eslint-disable-next-line no-console
        console.log('Pagamento riuscito')
        break
      }

      case 'payment_intent.payment_failed': {
        // eslint-disable-next-line no-console
        console.log('Pagamento fallito')
        break
      }
    }

    return { received: true, event }
  } catch (error) {
    console.error('Errore webhook Stripe:', error)
    return { received: false, error: 'Errore verifica webhook' }
  }
}
