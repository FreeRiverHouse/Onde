'use client'

import { useState } from 'react'

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'footer'
  className?: string
}

export function NewsletterSignup({ variant = 'card', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email')
      return
    }

    setStatus('loading')

    try {
      // TODO: Integrate with email service (Buttondown, ConvertKit, etc.)
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store locally for now
      const subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]')
      if (!subscribers.includes(email)) {
        subscribers.push(email)
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers))
      }

      setStatus('success')
      setMessage('Thanks for subscribing! 🎉')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
        {message && (
          <span className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </span>
        )}
      </form>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h3 className="text-sm font-semibold text-white mb-2">Stay Updated</h3>
        <p className="text-xs text-white/60 mb-3">Get notified about new books and games!</p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-teal-400"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-3 py-2 text-sm bg-teal-500/80 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-xs text-red-400 mt-1">{message}</p>
        )}
      </div>
    )
  }

  // Card variant (default)
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 ${className}`}>
      <div className="text-center mb-4">
        <span className="text-3xl mb-2 block">📬</span>
        <h3 className="text-lg font-bold text-white">Join Our Newsletter</h3>
        <p className="text-sm text-white/60 mt-1">
          Be the first to know about new books, games, and updates!
        </p>
      </div>

      {status === 'success' ? (
        <div className="text-center py-4">
          <span className="text-4xl">🎉</span>
          <p className="text-green-400 font-medium mt-2">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <span className="animate-spin">⏳</span>
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <span>→</span>
              </>
            )}
          </button>
          {status === 'error' && (
            <p className="text-sm text-red-400 text-center">{message}</p>
          )}
          <p className="text-xs text-white/40 text-center">
            No spam, unsubscribe anytime. 💚
          </p>
        </form>
      )}
    </div>
  )
}

export default NewsletterSignup
