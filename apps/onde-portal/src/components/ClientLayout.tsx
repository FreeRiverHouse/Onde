'use client';

import { ReactNode } from 'react';
import { I18nProvider, useTranslations } from '@/i18n';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navigation from '@/components/Navigation';
import SearchModal from '@/components/SearchModal';
import WatercolorBackground from '@/components/ui/WatercolorBackground';
import VercelAnalytics from '@/components/VercelAnalytics';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AICompanionProvider } from '@/components/AICompanion';

function Footer() {
  const t = useTranslations();

  return (
    <footer className="relative z-10 mt-24 border-t border-onde-ocean/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-display font-bold text-onde-ocean">Onde</span>
            </div>
            <p className="text-onde-ocean/60 max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <h2 className="font-display font-semibold text-onde-ocean mb-4 text-base">{t.footer.explore}</h2>
            <ul className="space-y-2">
              <li><a href="/libri" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">{t.navigation.books}</a></li>
              <li><a href="/reader/" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">{t.navigation.read}</a></li>
              <li><a href="/about" className="text-onde-ocean/60 hover:text-onde-coral transition-colors">{t.navigation.about}</a></li>
            </ul>
          </nav>

          {/* Social */}
          <div>
            <h2 className="font-display font-semibold text-onde-ocean mb-4 text-base">{t.footer.followUs}</h2>
            <div className="flex gap-4">
              <a href="https://twitter.com/Onde_FRH" target="_blank" rel="noopener noreferrer"
                 aria-label="Follow us on X (Twitter)"
                 className="w-10 h-10 rounded-full bg-onde-ocean/5 flex items-center justify-center
                            text-onde-ocean/60 hover:bg-onde-coral hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@Onde" target="_blank" rel="noopener noreferrer"
                 aria-label="Subscribe on YouTube"
                 className="w-10 h-10 rounded-full bg-onde-ocean/5 flex items-center justify-center
                            text-onde-ocean/60 hover:bg-onde-coral hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-onde-ocean/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-onde-ocean/40">
            {t.footer.copyright}
          </p>
          <div className="flex gap-6 text-sm text-onde-ocean/40">
            <a href="/privacy" className="hover:text-onde-ocean transition-colors">{t.footer.privacy}</a>
            <a href="/terms" className="hover:text-onde-ocean transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SkipToContent() {
  const t = useTranslations();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
                 focus:px-4 focus:py-2 focus:bg-onde-ocean focus:text-white focus:rounded-lg
                 focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-onde-gold focus:ring-offset-2
                 transition-all"
    >
      {t.accessibility?.skipToContent || 'Skip to main content'}
    </a>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AICompanionProvider>
          <SkipToContent />
          <WatercolorBackground />
          <Navigation />
          <main id="main-content" className="relative z-10 pt-20" tabIndex={-1}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <Footer />
          <SearchModal />
          <VercelAnalytics />
        </AICompanionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
