import type { Metadata } from 'next'
import Script from 'next/script'

// JSON-LD structured data for books (Schema.org Book type)
const booksJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Onde Libri - Free Illustrated Books',
  description: 'Download free illustrated editions of classic literature.',
  url: 'https://onde.la/libri',
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
    logo: {
      '@type': 'ImageObject',
      url: 'https://onde.la/icon.svg',
    },
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Book',
          '@id': 'https://onde.la/libri#meditations',
          name: 'Meditations',
          alternateName: 'Thoughts to Himself',
          author: {
            '@type': 'Person',
            name: 'Marcus Aurelius',
          },
          translator: {
            '@type': 'Person',
            name: 'George Long',
          },
          datePublished: '1862',
          inLanguage: 'en',
          genre: 'Philosophy',
          description: 'Personal notes of a Roman Emperor. Stoic philosophy. George Long translation (1862).',
          image: 'https://onde.la/books/meditations-cover.jpg',
          url: 'https://onde.la/libri',
          bookFormat: 'https://schema.org/EBook',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: 'https://onde.la/books/meditations-en.pdf',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Book',
          '@id': 'https://onde.la/libri#shepherds-promise',
          name: "The Shepherd's Promise",
          alternateName: 'Psalm 23 Illustrated',
          author: {
            '@type': 'Organization',
            name: 'Biblical Tradition',
          },
          inLanguage: 'en',
          genre: 'Spirituality',
          description: 'Psalm 23 with watercolor illustrations.',
          image: 'https://onde.la/books/shepherds-promise-cover.jpg',
          url: 'https://onde.la/libri',
          bookFormat: 'https://schema.org/EBook',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: 'https://onde.la/books/the-shepherds-promise.pdf',
          },
        },
      },
    ],
  },
}

export const metadata: Metadata = {
  title: 'Libri | Onde - Free Illustrated Books',
  description: 'Download free illustrated editions of classic literature. Meditations by Marcus Aurelius, The Prophet by Kahlil Gibran, and more.',
  keywords: ['free ebooks', 'illustrated books', 'classic literature', 'Meditations', 'Marcus Aurelius', 'philosophy', 'public domain'],
  alternates: {
    canonical: '/libri',
  },
  openGraph: {
    title: 'Onde Libri - Free Illustrated Classics',
    description: 'Download free illustrated editions of timeless classics. Stoic philosophy, poetry, and more — beautifully designed.',
    url: 'https://onde.la/libri',
    siteName: 'Onde',
    images: [
      {
        url: 'https://onde.la/books/meditations-cover.jpg',
        width: 800,
        height: 1200,
        alt: 'Meditations by Marcus Aurelius - Illustrated Edition',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onde Libri - Free Illustrated Classics',
    description: 'Download free illustrated editions of timeless classics.',
    images: ['https://onde.la/books/meditations-cover.jpg'],
  },
}

export default function LibriLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="books-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(booksJsonLd) }}
      />
      {children}
    </>
  )
}
