import './globals.css'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { AuthButtons } from '@/components/AuthButtons'

export const metadata: Metadata = {
  title: 'SurfBoard | Onde Command Center',
  description: 'Naviga la corrente. Dashboard futuristica per cavalcare il flusso Onde.',
}

// Surfboard Icon SVG
const SurfboardIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="surfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C11 2 10 3 10 4V20C10 21 11 22 12 22C13 22 14 21 14 20V4C14 3 13 2 12 2Z"
      fill="url(#surfGradient)"
    />
    <path
      d="M12 5C11.5 5 11 5.5 11 6V18C11 18.5 11.5 19 12 19C12.5 19 13 18.5 13 18V6C13 5.5 12.5 5 12 5Z"
      fill="rgba(255,255,255,0.3)"
    />
  </svg>
)

// Wave Icon
const WaveIcon = () => (
  <svg className="w-5 h-5 text-surf-cyan" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4v2c-2.6 0-4.8-1.3-6.5-3.3C11.8 12.5 9.6 11 7 11c-1.5 0-3 .7-4.2 2L2 12z"/>
    <path d="M2 8c2-3 4-4 6-4s4 1 6 4 4 4 6 4v2c-2.6 0-4.8-1.3-6.5-3.3C11.8 8.5 9.6 7 7 7c-1.5 0-3 .7-4.2 2L2 8z" opacity="0.5"/>
  </svg>
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen grid-pattern">
        {/* Animated Ocean Background */}
        <div className="ocean-bg">
          <div className="wave-layer wave-1"></div>
          <div className="wave-layer wave-2"></div>
          <div className="wave-layer wave-3"></div>
        </div>

        {/* Floating Orbs */}
        <div className="floating-orb w-96 h-96 bg-surf-teal/20 -top-48 -left-48"></div>
        <div className="floating-orb w-80 h-80 bg-surf-cyan/20 top-1/3 -right-40" style={{ animationDelay: '-3s' }}></div>
        <div className="floating-orb w-64 h-64 bg-surf-gold/10 bottom-20 left-1/4" style={{ animationDelay: '-5s' }}></div>

        {/* Noise Overlay */}
        <div className="noise-overlay"></div>

        {/* Header */}
        <header className="border-b border-white/5 sticky top-0 bg-surf-deep/80 backdrop-blur-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-surf-cyan/30 blur-xl animate-glow-pulse"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-surf-teal to-surf-cyan flex items-center justify-center shadow-surf-glow">
                  <SurfboardIcon />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-surf-aqua">Surf</span>
                  <span className="text-surf-foam">Board</span>
                </h1>
                <p className="text-xs text-surf-cyan/60 flex items-center gap-1">
                  <WaveIcon />
                  Naviga la corrente
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surf-teal/10 border border-surf-teal/20">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-surf-aqua"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-surf-aqua animate-ping"></div>
                </div>
                <span className="text-xs font-medium text-surf-aqua">LIVE</span>
              </div>

              {/* Links */}
              <nav className="hidden md:flex items-center gap-4">
                <a
                  href="/"
                  className="text-sm text-surf-foam/60 hover:text-surf-cyan transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/social"
                  className="text-sm text-surf-foam/60 hover:text-surf-gold transition-colors font-medium"
                >
                  📱 Social
                </a>
                {session && (
                  <a
                    href="/corde"
                    className="text-sm text-surf-foam/60 hover:text-surf-gold transition-colors font-medium"
                  >
                    🎨 CORDE
                  </a>
                )}
                <a
                  href="https://onde.la"
                  className="text-sm text-surf-foam/60 hover:text-surf-cyan transition-colors"
                >
                  onde.la
                </a>
                <AuthButtons session={session} />
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">{children}</main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-surf-cyan/40">
              <WaveIcon />
              <span className="text-sm">Onde Publishing - Orientarsi nella corrente</span>
            </div>
            <div className="text-sm text-surf-foam/30">
              Built with flow
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
