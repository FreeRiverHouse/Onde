import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import WatercolorBackground from '@/components/ui/WatercolorBackground'

export const metadata: Metadata = {
  title: 'Onde - Storie, App e Giochi per Bambini',
  description: 'Il portale italiano per famiglie. Libri illustrati ad acquarello, app educative e giochi per bambini.',
  keywords: ['libri bambini', 'app educative', 'giochi bambini', 'storie illustrate', 'onde'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <WatercolorBackground />
        <Navigation />

        <main className="relative z-10 pt-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-24 border-t border-onde-ocean/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="text-onde-coral">
                    <path d="M5 25C10 20 15 30 20 25C25 20 30 30 35 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M5 20C10 15 15 25 20 20C25 15 30 25 35 20" stroke="#F4D03F" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M5 15C10 10 15 20 20 15C25 10 30 20 35 15" stroke="#48C9B0" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xl font-display font-bold text-onde-ocean">Onde</span>
                </div>
                <p className="text-onde-ocean/60 max-w-sm leading-relaxed">
                  Creiamo storie illustrate, app educative e giochi che fanno
                  crescere immaginazione e curiosita.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-display font-semibold text-onde-ocean mb-4">Esplora</h4>
                <ul className="space-y-2">
                  <li><a href="/libri" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">Libri</a></li>
                  <li><a href="/app" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">App</a></li>
                  <li><a href="/giochi" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">Giochi</a></li>
                  <li><a href="/vr" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">🥽 VR</a></li>
                  <li><a href="/about" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">Chi Siamo</a></li>
                </ul>
              </div>

              {/* Social */}
              <div>
                <h4 className="font-display font-semibold text-onde-ocean mb-4">Seguici</h4>
                <div className="flex gap-4">
                  <a href="https://twitter.com/Onde_FRH" target="_blank" rel="noopener noreferrer"
                     className="w-10 h-10 rounded-full bg-onde-ocean/5 flex items-center justify-center
                                text-onde-ocean/60 hover:bg-onde-coral hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com/@Onde" target="_blank" rel="noopener noreferrer"
                     className="w-10 h-10 rounded-full bg-onde-ocean/5 flex items-center justify-center
                                text-onde-ocean/60 hover:bg-onde-coral hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-12 pt-8 border-t border-onde-ocean/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-onde-ocean/40">
                2026 Onde. Fatto con amore a Los Angeles.
              </p>
              <div className="flex gap-6 text-sm text-onde-ocean/40">
                <a href="/privacy" className="hover:text-onde-ocean transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-onde-ocean transition-colors">Termini</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
