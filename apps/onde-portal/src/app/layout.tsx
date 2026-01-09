import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onde - Classici Illustrati',
  description: 'I grandi classici della letteratura, illustrati ad acquarello.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-onde-dark text-white min-h-screen">
        <nav className="border-b border-onde-gold/20 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-onde-gold">Onde</a>
            <div className="flex gap-6">
              <a href="/catalogo" className="hover:text-onde-gold">Catalogo</a>
              <a href="/libreria" className="hover:text-onde-gold">Libreria</a>
              <a href="/famiglia" className="hover:text-onde-gold">Famiglia</a>
              <a href="/account" className="hover:text-onde-gold">Account</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-onde-gold/20 p-8 mt-20 text-center opacity-60">
          Onde - Classici della letteratura illustrati ad acquarello
        </footer>
      </body>
    </html>
  )
}
