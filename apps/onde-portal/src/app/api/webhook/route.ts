import { NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/lib/stripe'

// Webhook endpoint per Stripe
// Configurare in Stripe Dashboard: https://dashboard.stripe.com/webhooks

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature mancante' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET non configurato')
      return NextResponse.json(
        { error: 'Webhook non configurato' },
        { status: 500 }
      )
    }

    const result = await handleStripeWebhook(body, signature, webhookSecret)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Errore webhook:', error)
    return NextResponse.json(
      { error: 'Errore webhook' },
      { status: 500 }
    )
  }
}

// In App Router, request.text() already gives raw body
// No config needed - body parsing is automatic
