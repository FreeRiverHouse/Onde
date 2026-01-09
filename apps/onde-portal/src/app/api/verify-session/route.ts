import { NextResponse } from 'next/server'
import { verifyCheckoutSession } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id richiesto' },
        { status: 400 }
      )
    }

    const result = await verifyCheckoutSession(sessionId)

    if (!result.verified) {
      return NextResponse.json(
        { verified: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      verified: true,
      bookId: result.bookId,
      customerEmail: result.customerEmail
    })
  } catch (error) {
    console.error('Errore verifica sessione:', error)
    return NextResponse.json(
      { error: 'Errore verifica' },
      { status: 500 }
    )
  }
}
