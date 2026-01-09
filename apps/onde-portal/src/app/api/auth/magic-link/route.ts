import { NextRequest, NextResponse } from 'next/server'
import { generateMagicLinkToken } from '@/lib/auth'

// In production, use a real email service (Resend, SendGrid, etc.)
async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}`

  // For development, log the magic link
  console.log(`\n========================================`)
  console.log(`MAGIC LINK for ${email}:`)
  console.log(magicLink)
  console.log(`========================================\n`)

  // TODO: In production, send actual email via Resend/SendGrid
  // await resend.emails.send({
  //   from: 'Onde <noreply@onde.surf>',
  //   to: email,
  //   subject: 'Accedi a Onde',
  //   html: `<a href="${magicLink}">Clicca qui per accedere</a>`
  // })

  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      )
    }

    // Generate magic link
    const token = generateMagicLinkToken(email)

    // Send email
    await sendMagicLinkEmail(email, token)

    return NextResponse.json({
      success: true,
      message: 'Link di accesso inviato! Controlla la tua email.'
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    )
  }
}
