/**
 * Meditations - Bitcoin Payment Test Page
 *
 * TEST ONLY - This page is for testing Bitcoin/Lightning payments
 * on onde.surf before enabling on production (onde.la)
 *
 * Access: /libro/meditations-btc
 *
 * Implementation: Uses OpenNode Hosted Checkout (static site compatible)
 */

import { BitcoinPayButton, BitcoinPriceDisplay } from '@/components/BitcoinPayButton'
import Link from 'next/link'

export const metadata = {
  title: 'Meditations (Bitcoin Edition) - Onde Publishing',
  description: 'Marcus Aurelius Meditations - Pay with Bitcoin or Lightning Network',
}

export default function MeditationsBitcoinPage() {
  const book = {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    description: 'The timeless reflections of Roman Emperor Marcus Aurelius on Stoic philosophy, self-discipline, and the art of living.',
    priceEurCents: 499, // 4.99 EUR
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1f3c]">
      {/* Header */}
      <header className="border-b border-[#2dd4bf]/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#2dd4bf] font-bold text-xl">
            Onde
          </Link>
          <div className="flex items-center gap-2 bg-[#f7931a]/20 px-3 py-1 rounded-full">
            <span className="text-[#f7931a]">₿</span>
            <span className="text-[#f7931a] text-sm font-medium">Bitcoin TEST</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Test Banner */}
        <div className="bg-[#f7931a]/10 border border-[#f7931a]/30 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-[#f7931a] font-bold">Setup Required</h3>
              <p className="text-gray-400 text-sm">
                To enable Bitcoin payments: Create a checkout in OpenNode Dashboard
                and add the checkout ID to BitcoinPayButton.tsx
              </p>
            </div>
          </div>
        </div>

        {/* Book Card */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Book Cover Placeholder */}
            <div className="aspect-[3/4] bg-gradient-to-br from-[#1a365d] to-[#0a1628] rounded-xl flex items-center justify-center border border-[#fbbf24]/30">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-[#fbbf24] font-serif text-2xl font-bold mb-2">
                  {book.title}
                </h2>
                <p className="text-gray-400 italic">{book.author}</p>
              </div>
            </div>

            {/* Book Info */}
            <div className="flex flex-col justify-center">
              <div className="mb-2">
                <span className="bg-[#2dd4bf]/20 text-[#2dd4bf] text-xs px-3 py-1 rounded-full">
                  STOIC PHILOSOPHY
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                {book.title}
              </h1>

              <p className="text-xl text-gray-400 mb-4 italic">
                by {book.author}
              </p>

              <p className="text-gray-300 mb-6 leading-relaxed">
                {book.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-1">Price</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-white">
                    {(book.priceEurCents / 100).toFixed(2)} EUR
                  </span>
                  <span className="text-gray-500">or</span>
                  <BitcoinPriceDisplay priceEurCents={book.priceEurCents} showFiat={false} />
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-3">
                <BitcoinPayButton
                  bookId={book.id}
                  bookTitle={book.title}
                  priceEurCents={book.priceEurCents}
                  className="w-full justify-center"
                />

                <p className="text-center text-gray-500 text-sm">
                  or
                </p>

                <Link
                  href={`/libro/${book.id}`}
                  className="block w-full text-center px-6 py-3 rounded-lg font-semibold bg-white/10 text-white hover:bg-white/20 transition"
                >
                  Read Free Version (Gutenberg)
                </Link>
              </div>

              {/* Payment Info */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-medium mb-3">Why pay with Bitcoin?</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf]">✓</span>
                    Instant delivery via Lightning Network
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf]">✓</span>
                    No banks, no intermediaries
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf]">✓</span>
                    Support authors directly
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf]">✓</span>
                    Works globally (especially El Salvador!)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="text-white font-medium mb-2">ePub Format</h4>
            <p className="text-gray-400 text-sm">Read on any device</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h4 className="text-white font-medium mb-2">Illustrated Edition</h4>
            <p className="text-gray-400 text-sm">Beautiful watercolor art</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">♾️</div>
            <h4 className="text-white font-medium mb-2">Lifetime Access</h4>
            <p className="text-gray-400 text-sm">Download anytime</p>
          </div>
        </div>

        {/* Setup Instructions */}
        <details className="mt-8 bg-black/30 rounded-xl p-6">
          <summary className="text-gray-400 cursor-pointer hover:text-white font-medium">
            Setup Instructions (click to expand)
          </summary>
          <div className="mt-4 space-y-4 text-sm">
            <div className="bg-[#f7931a]/10 border border-[#f7931a]/20 rounded-lg p-4">
              <h4 className="text-[#f7931a] font-bold mb-2">To Enable Bitcoin Payments:</h4>
              <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                <li>Create account at <a href="https://app.opennode.com" target="_blank" rel="noopener" className="text-[#2dd4bf] underline">app.opennode.com</a></li>
                <li>Go to Dashboard &gt; Checkout &gt; Create Checkout</li>
                <li>Configure:
                  <ul className="ml-6 mt-1 space-y-1 text-gray-400">
                    <li>Amount: 4.99 EUR</li>
                    <li>Description: Meditations - Onde Publishing</li>
                    <li>Success URL: https://onde.surf/success?book=meditations&payment=bitcoin</li>
                    <li>Cancel URL: https://onde.surf/libro/meditations-btc</li>
                  </ul>
                </li>
                <li>Copy the Checkout ID</li>
                <li>Add to <code className="bg-black/50 px-1 rounded">BitcoinPayButton.tsx</code></li>
              </ol>
            </div>

            <div className="text-gray-500">
              <p>Implementation uses OpenNode Hosted Checkout for static site compatibility.</p>
              <p className="mt-1">For custom QR modal, use Cloudflare Pages Functions.</p>
            </div>
          </div>
        </details>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Onde Publishing - El Salvador Bitcoin Strategy
          </p>
          <p className="text-[#f7931a] text-xs mt-2">
            Lightning-first payments for the future
          </p>
        </div>
      </footer>
    </div>
  )
}
