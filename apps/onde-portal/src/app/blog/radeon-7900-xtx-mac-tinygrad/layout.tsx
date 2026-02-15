import type { Metadata } from 'next'
import Script from 'next/script'

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Running AMD Radeon RX 7900 XTX on macOS with TinyGrad: The "Impossible" Setup',
  description:
    'We got a Radeon RX 7900 XTX (24GB VRAM) running ML inference on a MacBook Pro M1 via Thunderbolt eGPU, using TinyGrad with a small patch.',
  image: 'https://onde.la/images/og-onde.png',
  datePublished: '2026-02-15',
  dateModified: '2026-02-15',
  author: {
    '@type': 'Organization',
    name: 'FreeRiverHouse',
    url: 'https://onde.la',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
    logo: {
      '@type': 'ImageObject',
      url: 'https://onde.la/icon.svg',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://onde.la/blog/radeon-7900-xtx-mac-tinygrad',
  },
  keywords: [
    'AMD Radeon RX 7900 XTX',
    'macOS',
    'eGPU',
    'TinyGrad',
    'machine learning',
    'LLaMA',
    'GPT-2',
    'Thunderbolt',
    'Apple Silicon',
    'M1',
    'RDNA3',
  ],
  about: [
    { '@type': 'Thing', name: 'Machine Learning' },
    { '@type': 'Thing', name: 'External GPU' },
    { '@type': 'Thing', name: 'AMD Graphics Card' },
  ],
  proficiencyLevel: 'Expert',
  inLanguage: 'en',
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://onde.la' },
    { '@type': 'ListItem', position: 2, name: 'Tech', item: 'https://onde.la/blog' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Radeon 7900 XTX + TinyGrad on macOS',
      item: 'https://onde.la/blog/radeon-7900-xtx-mac-tinygrad',
    },
  ],
}

export const metadata: Metadata = {
  title: 'Running AMD Radeon RX 7900 XTX on macOS with TinyGrad | Onde Tech',
  description:
    'We got a Radeon RX 7900 XTX (24GB VRAM) running ML inference on a MacBook Pro M1 via Thunderbolt eGPU using TinyGrad. GPT-2, LLaMA 3.1 8B, and more.',
  keywords: [
    'AMD Radeon RX 7900 XTX',
    'macOS eGPU',
    'TinyGrad AMD',
    'machine learning Mac',
    'LLaMA macOS',
    'GPT-2 AMD GPU',
    'Thunderbolt eGPU ML',
    'RDNA3 macOS',
    'Apple Silicon eGPU',
    'tinygrad float16 patch',
  ],
  alternates: {
    canonical: '/blog/radeon-7900-xtx-mac-tinygrad',
  },
  openGraph: {
    title: 'Running AMD Radeon RX 7900 XTX on macOS with TinyGrad',
    description:
      'The "impossible" setup: 24GB VRAM eGPU doing ML inference on a MacBook Pro M1 with TinyGrad. Here\'s how we did it.',
    url: 'https://onde.la/blog/radeon-7900-xtx-mac-tinygrad',
    siteName: 'Onde',
    type: 'article',
    publishedTime: '2026-02-15T00:00:00Z',
    authors: ['FreeRiverHouse'],
    tags: ['GPU', 'TinyGrad', 'macOS', 'AMD', 'Machine Learning', 'eGPU'],
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'Radeon 7900 XTX + TinyGrad on macOS',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Running AMD Radeon RX 7900 XTX on macOS with TinyGrad',
    description:
      'The "impossible" setup: 24GB VRAM eGPU + MacBook M1 + TinyGrad = ML inference. Here\'s how.',
    creator: '@Onde_FRH',
    images: ['/images/og-onde.png'],
  },
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="article-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  )
}
