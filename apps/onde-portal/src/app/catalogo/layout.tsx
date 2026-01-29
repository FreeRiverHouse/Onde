import type { Metadata } from 'next'
import Script from 'next/script'

// Breadcrumb JSON-LD for /catalogo
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
      name: 'Catalogo',
      item: 'https://onde.la/catalogo',
    },
  ],
}

// JSON-LD structured data for the catalog (Schema.org CollectionPage + ItemList)
const catalogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Catalogo Onde - Biblioteca Digitale Gratuita',
  description: 'Oltre 1000 libri classici gratuiti: fiabe, classici della letteratura, filosofia, poesia e libri per bambini.',
  url: 'https://onde.la/catalogo',
  inLanguage: ['en', 'it', 'fr', 'de', 'es'],
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
    name: 'Featured Books',
    numberOfItems: 1000,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Book',
          name: "Alice's Adventures in Wonderland",
          author: { '@type': 'Person', name: 'Lewis Carroll' },
          genre: 'classici',
          inLanguage: 'en',
          url: 'https://onde.la/libro/alice-wonderland',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Book',
          name: 'Meditations',
          author: { '@type': 'Person', name: 'Marcus Aurelius' },
          genre: 'filosofia',
          inLanguage: 'en',
          url: 'https://onde.la/libro/meditations',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Book',
          name: "Grimm's Fairy Tales",
          author: { '@type': 'Person', name: 'Brothers Grimm' },
          genre: 'fiabe',
          inLanguage: 'en',
          url: 'https://onde.la/libro/grimm-fairy-tales',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Book',
          name: 'Pride and Prejudice',
          author: { '@type': 'Person', name: 'Jane Austen' },
          genre: 'classici',
          inLanguage: 'en',
          url: 'https://onde.la/libro/pride-prejudice',
        },
      },
      {
        '@type': 'ListItem',
        position: 5,
        item: {
          '@type': 'Book',
          name: 'Le Avventure di Pinocchio',
          author: { '@type': 'Person', name: 'Carlo Collodi' },
          genre: 'classici',
          inLanguage: 'it',
          url: 'https://onde.la/libro/pinocchio',
        },
      },
    ],
  },
  about: [
    { '@type': 'Thing', name: 'Classic Literature' },
    { '@type': 'Thing', name: 'Fairy Tales' },
    { '@type': 'Thing', name: 'Philosophy' },
    { '@type': 'Thing', name: 'Poetry' },
    { '@type': 'Thing', name: "Children's Books" },
  ],
}

export const metadata: Metadata = {
  title: 'Catalogo Libri - Onde',
  description: 'Esplora il nostro catalogo completo di libri illustrati. Classici della letteratura, filosofia, poesia e libri per bambini in formato digitale gratuito.',
  alternates: {
    canonical: '/catalogo',
  },
  openGraph: {
    title: 'Catalogo Libri - Onde',
    description: 'Esplora libri illustrati gratuiti: classici della letteratura, filosofia e storie per bambini.',
    type: 'website',
  },
}

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="catalog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      {children}
    </>
  )
}
