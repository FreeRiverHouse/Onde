import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { I18nProvider } from '@/i18n/I18nProvider'

import ClientLayout from '@/components/ClientLayout'

// Google Analytics 4 - set NEXT_PUBLIC_GA_ID in environment
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

// Organization + WebSite + FAQ JSON-LD for root
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://onde.la/#organization',
      name: 'Onde',
      url: 'https://onde.la',
      logo: {
        '@type': 'ImageObject',
        url: 'https://onde.la/icon.svg',
      },
      description: 'AI-native publishing house based in Los Angeles.',
      sameAs: [
        'https://twitter.com/Onde_FRH',
        'https://youtube.com/@Onde',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://onde.la/#website',
      url: 'https://onde.la',
      name: 'Onde',
      description: 'AI-native publishing house. Free illustrated ebooks, classic literature, and original stories.',
      publisher: { '@id': 'https://onde.la/#organization' },
      inLanguage: ['en', 'it'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://onde.la/catalogo?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://onde.la/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are the books really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All our illustrated ebooks are completely free to download during our launch period. We believe beautiful literature should be accessible to everyone.',
          },
        },
        {
          '@type': 'Question',
          name: 'What formats are available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our books are available in PDF format, optimized for both screen reading and printing. EPUB versions are coming soon for e-reader compatibility.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the Minecraft Skin Creator work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our free online skin creator lets you design custom Minecraft skins directly in your browser. Draw on the canvas, see a real-time 3D preview, and download your skin as a PNG file ready to use in Minecraft.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to create an account?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No account required! You can download books and use our games completely free without signing up. We respect your privacy.',
          },
        },
      ],
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://onde.la'),
  title: 'Onde - AI-Native Publishing House',
  description: 'AI-native publishing house based in Los Angeles. Free illustrated ebooks, classic literature, and original stories.',
  keywords: ['illustrated books', 'classic literature', 'digital publishing', 'ebooks', 'onde'],
  openGraph: {
    title: 'Onde - AI-Native Publishing House',
    description: 'Free illustrated ebooks, classic literature, and original stories for families.',
    url: 'https://onde.la',
    siteName: 'Onde',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'Onde - Beautiful illustrated books',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onde - AI-Native Publishing House',
    description: 'Free illustrated ebooks, classic literature, and original stories.',
    creator: '@Onde_FRH',
    images: ['/images/og-onde.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': 'https://onde.la',
      'it': 'https://onde.la',
      'x-default': 'https://onde.la',
    },
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/feed.atom',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical viewport meta tag for mobile stability */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="alternate" type="application/rss+xml" title="Onde Books RSS Feed" href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="Onde Books Atom Feed" href="/feed.atom" />
        {/* Resource hints for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Prefetch critical navigation paths */}
        <link rel="prefetch" href="/libri" as="document" />
        <link rel="prefetch" href="/games" as="document" />
        {/* Preload critical font for faster LCP */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen antialiased overflow-x-hidden">
        {/* Provide default English translations for legacy pages */}
        <I18nProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </I18nProvider>
      </body>
    </html>
  )
}
