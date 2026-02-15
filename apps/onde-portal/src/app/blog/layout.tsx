import type { Metadata } from 'next'
import Script from 'next/script'

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://onde.la',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://onde.la/blog',
    },
  ],
}

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://onde.la/blog',
  name: 'Onde Blog',
  description: 'Engineering stories, open-source exploits, and impossible setups from the FreeRiverHouse lab.',
  url: 'https://onde.la/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
    logo: {
      '@type': 'ImageObject',
      url: 'https://onde.la/icon.svg',
    },
  },
  inLanguage: 'en',
}

export const metadata: Metadata = {
  title: 'Blog | Onde — Engineering Stories & Open Source',
  description: 'Engineering stories, open-source exploits, and impossible setups from the FreeRiverHouse lab. GPU hacking, ML on Mac, and more.',
  keywords: ['blog', 'engineering', 'open source', 'machine learning', 'GPU', 'tinygrad', 'AMD', 'macOS', 'eGPU'],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Onde Blog — Engineering Stories & Open Source',
    description: 'Engineering stories, open-source exploits, and impossible setups from the FreeRiverHouse lab.',
    url: 'https://onde.la/blog',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'Onde Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onde Blog — Engineering Stories & Open Source',
    description: 'Engineering stories, open-source exploits, and impossible setups from the FreeRiverHouse lab.',
    creator: '@Onde_FRH',
    images: ['/images/og-onde.png'],
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="blog-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {children}
    </>
  )
}
