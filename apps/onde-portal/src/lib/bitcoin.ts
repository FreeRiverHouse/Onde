/**
 * Bitcoin/Lightning Payment Integration via OpenNode
 *
 * Onde Publishing - Bitcoin Payments for El Salvador Strategy
 *
 * OpenNode provides:
 * - Lightning Network (instant, near-zero fees)
 * - On-chain Bitcoin (traditional)
 * - Automatic conversion to USD/EUR if needed
 * - Hosted checkout or custom QR codes
 */

// OpenNode API configuration
const OPENNODE_API_KEY = process.env.OPENNODE_API_KEY || ''
const OPENNODE_API_URL = process.env.OPENNODE_ENV === 'production'
  ? 'https://api.opennode.com/v1'
  : 'https://dev-api.opennode.com/v1' // Testnet for development

export interface BitcoinInvoice {
  id: string
  description: string
  amount: number // in satoshis
  fiatValue: number // original fiat amount
  currency: string
  status: 'unpaid' | 'paid' | 'expired' | 'processing'
  lightningInvoice: string // BOLT11 invoice for Lightning
  bitcoinAddress: string // On-chain address
  qrCodeUrl: string
  expiresAt: Date
  createdAt: Date
  metadata?: Record<string, string>
}

export interface CreateInvoiceParams {
  amount: number // in cents (EUR)
  currency?: string // default EUR
  description: string
  orderId: string
  customerEmail?: string
  callbackUrl?: string
  successUrl?: string
  metadata?: Record<string, string>
}

/**
 * Convert EUR cents to satoshis using current BTC/EUR rate
 * OpenNode handles this automatically, but we estimate for display
 */
export async function eurToSatoshis(eurCents: number): Promise<number> {
  try {
    // OpenNode provides rate info in charge creation response
    // For estimation, we use a simple fetch to their rates endpoint
    const response = await fetch(`${OPENNODE_API_URL}/rates`)
    if (!response.ok) {
      throw new Error('Failed to fetch BTC rates')
    }
    const data = await response.json()
    const btcEurRate = data.data?.BTCEUR?.EUR || 90000 // fallback rate

    const eurAmount = eurCents / 100
    const btcAmount = eurAmount / btcEurRate
    const satoshis = Math.round(btcAmount * 100000000)

    return satoshis
  } catch (error) {
    console.error('Error converting EUR to sats:', error)
    // Fallback estimation (assuming ~90k EUR/BTC)
    return Math.round((eurCents / 100) / 90000 * 100000000)
  }
}

/**
 * Create a Bitcoin/Lightning invoice via OpenNode
 */
export async function createBitcoinInvoice(params: CreateInvoiceParams): Promise<{
  success: boolean
  invoice?: BitcoinInvoice
  checkoutUrl?: string
  error?: string
}> {
  if (!OPENNODE_API_KEY) {
    console.warn('OpenNode API key not configured')
    return {
      success: false,
      error: 'Bitcoin payments not configured. Contact support@onde.surf'
    }
  }

  try {
    const response = await fetch(`${OPENNODE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': OPENNODE_API_KEY,
      },
      body: JSON.stringify({
        amount: params.amount / 100, // OpenNode expects EUR, not cents
        currency: params.currency || 'EUR',
        description: params.description,
        order_id: params.orderId,
        customer_email: params.customerEmail,
        callback_url: params.callbackUrl,
        success_url: params.successUrl,
        auto_settle: false, // Keep in BTC, don't auto-convert
        metadata: params.metadata,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create invoice')
    }

    const data = await response.json()
    const charge = data.data

    const invoice: BitcoinInvoice = {
      id: charge.id,
      description: charge.description,
      amount: charge.amount_satoshi || charge.amount * 100000000 / charge.fiat_value,
      fiatValue: params.amount,
      currency: params.currency || 'EUR',
      status: charge.status,
      lightningInvoice: charge.lightning_invoice?.payreq || '',
      bitcoinAddress: charge.chain_invoice?.address || '',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(charge.lightning_invoice?.payreq || charge.chain_invoice?.address || '')}`,
      expiresAt: new Date(charge.expires_at * 1000),
      createdAt: new Date(charge.created_at * 1000),
      metadata: params.metadata,
    }

    return {
      success: true,
      invoice,
      checkoutUrl: charge.hosted_checkout_url,
    }
  } catch (error) {
    console.error('Error creating Bitcoin invoice:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Bitcoin invoice'
    }
  }
}

/**
 * Check the status of a Bitcoin invoice
 */
export async function checkInvoiceStatus(invoiceId: string): Promise<{
  success: boolean
  status?: 'unpaid' | 'paid' | 'expired' | 'processing'
  error?: string
}> {
  if (!OPENNODE_API_KEY) {
    return { success: false, error: 'Bitcoin payments not configured' }
  }

  try {
    const response = await fetch(`${OPENNODE_API_URL}/charge/${invoiceId}`, {
      headers: {
        'Authorization': OPENNODE_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to check invoice status')
    }

    const data = await response.json()
    return {
      success: true,
      status: data.data.status,
    }
  } catch (error) {
    console.error('Error checking invoice status:', error)
    return {
      success: false,
      error: 'Failed to check payment status'
    }
  }
}

/**
 * Verify OpenNode webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // OpenNode uses HMAC-SHA256 for webhook signatures
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}

/**
 * Format satoshis for display
 */
export function formatSatoshis(sats: number): string {
  if (sats >= 100000000) {
    return `${(sats / 100000000).toFixed(8)} BTC`
  } else if (sats >= 1000) {
    return `${(sats / 1000).toFixed(0)}k sats`
  }
  return `${sats} sats`
}

/**
 * Prices for Bitcoin payments (in EUR cents, same as Stripe)
 * Can be converted to satoshis at checkout time
 */
export const BTC_PRICES = {
  // Libri gratuiti (public domain) - donazione opzionale
  free: 0,
  donation_small: 100,   // 1 EUR
  donation_medium: 300,  // 3 EUR
  donation_large: 500,   // 5 EUR

  // Ebook Onde originali (same as Stripe pricing)
  ebook_small: 299,      // 2.99 EUR
  ebook_standard: 499,   // 4.99 EUR
  ebook_premium: 799,    // 7.99 EUR

  // Special: Meditations illustrated edition (TEST)
  meditations_btc: 499,  // 4.99 EUR - Test product
} as const

export type BtcPriceType = keyof typeof BTC_PRICES
