import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onde - Building in Public Dashboard',
  description: 'Track Onde progress in real-time. Tasks, books, videos, followers, revenue.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-white/10 sticky top-0 bg-onde-dark/80 backdrop-blur-xl z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-onde-gold to-amber-600 flex items-center justify-center">
                <span className="text-onde-dark font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Onde</h1>
                <p className="text-xs opacity-60">Building in Public</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-onde-green live-indicator"></div>
                <span className="text-sm opacity-60">Live</span>
              </div>
              <a
                href="https://x.com/Onde_FRH"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm opacity-60 hover:opacity-100 hover:text-onde-gold transition-all"
              >
                @Onde_FRH
              </a>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-white/10 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center opacity-40 text-sm">
            Onde Publishing - Building the future of illustrated books
          </div>
        </footer>
      </body>
    </html>
  )
}
