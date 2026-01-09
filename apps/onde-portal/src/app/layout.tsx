import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onde Portal',
  description: 'News, Health, Tech, Books - All in one place',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-onde-dark text-white min-h-screen">
        <nav className="border-b border-onde-gold/20 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-onde-gold">Onde Portal</a>
            <div className="flex gap-6">
              <a href="/news" className="hover:text-onde-gold">News</a>
              <a href="/health" className="hover:text-onde-gold">Health</a>
              <a href="/tech" className="hover:text-onde-gold">Tech</a>
              <a href="/catalogo" className="hover:text-onde-gold">Books</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-onde-gold/20 p-8 mt-20 text-center opacity-60">
          Onde Portal - News, Health, Tech, Books
        </footer>
      </body>
    </html>
  )
}
