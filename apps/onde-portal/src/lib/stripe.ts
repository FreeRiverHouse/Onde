import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function createCheckoutSession(
  bookId: string,
  bookTitle: string,
  priceInCents: number,
  customerEmail: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: bookTitle,
            description: 'Ebook - Onde Books',
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?book=${bookId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/libro/${bookId}`,
    customer_email: customerEmail,
    metadata: {
      bookId,
    },
  })

  return session
}

export { stripe }
