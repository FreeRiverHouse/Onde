// Stripe module - disabled for free Gutenberg catalog
// Will be re-enabled for premium content

export async function createCheckoutSession(
  _bookId: string,
  _bookTitle: string,
  _priceInCents: number,
  _customerEmail: string
) {
  return { url: '/success' }
}

export const stripe = null
