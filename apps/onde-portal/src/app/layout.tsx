import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import ClientLayout from '@/components/ClientLayout'

// Google Analytics 4 - set NEXT_PUBLIC_GA_ID in environment
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

// Organization + WebSite JSON-LD for root
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
      description: 'AI-native publishing house based in Los Angeles. Crafted by code, touched by soul.',
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
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://onde.la'),
  title: 'Onde - Crafted by Code, Touched by Soul',
  description: 'AI-native publishing house based in Los Angeles. Crafted by code, touched by soul.',
  keywords: ['illustrated books', 'classic literature', 'digital publishing', 'ebooks', 'onde'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  alternates: {
    canonical: '/',
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
        <link rel="alternate" type="application/rss+xml" title="Onde Books RSS Feed" href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="Onde Books Atom Feed" href="/feed.atom" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
