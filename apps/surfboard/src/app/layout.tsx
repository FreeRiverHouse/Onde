import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { AuthButtons } from '@/components/AuthButtons'
import { HeaderClient } from '@/components/HeaderClient'

export const metadata: Metadata = {
  title: 'FRH HQ | FreeRiverHouse',
  description: 'FreeRiverHouse Central Operations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Providers>
          {/* Subtle gradient overlay */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.1),transparent_50%)] pointer-events-none" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08),transparent_50%)] pointer-events-none" />

          {/* Header */}
          <header className="sticky top-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              {/* Logo */}
              <a href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  FRH
                </div>
                <span className="text-white font-medium hidden sm:block">HQ</span>
              </a>

              {/* Nav */}
              <div className="flex items-center gap-4">
                <nav className="hidden md:flex items-center gap-1">
                  <a href="/" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    Dashboard
                  </a>
                  <a href="/social" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    Social
                  </a>
                  <a href="/corde" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    CORDE
                  </a>
                </nav>
                <HeaderClient />
                <AuthButtons />
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="relative z-10 min-h-[calc(100vh-120px)]">{children}</main>

          {/* Footer */}
          <footer className="relative z-10 border-t border-white/5 py-6">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
              <span className="text-xs text-white/30">FreeRiverHouse</span>
              <span className="text-xs text-white/30">2026</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
