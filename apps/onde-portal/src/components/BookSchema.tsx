import Script from 'next/script'

interface BookSchemaProps {
  title: string
  author: string
  description: string
  url: string
  coverImage: string
  datePublished?: string
  genre?: string
  language?: string
  pageCount?: number
  isbn?: string
}

/**
 * Generates JSON-LD Book schema for SEO.
 * 
 * Usage:
 * <BookSchema
 *   title="Meditations"
 *   author="Marcus Aurelius"
 *   description="..."
 *   url="https://onde.la/libri/meditations"
 *   coverImage="https://onde.la/books/meditations-cover.jpg"
 * />
 */
export function BookSchema({
  title,
  author,
  description,
  url,
  coverImage,
  datePublished,
  genre,
  language = 'en',
  pageCount,
  isbn,
}: BookSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: title,
    author: {
      '@type': 'Person',
      name: author,
    },
    description,
    url,
    image: coverImage,
    inLanguage: language,
    publisher: {
      '@type': 'Organization',
      name: 'Onde',
      url: 'https://onde.la',
    },
    ...(datePublished && { datePublished }),
    ...(genre && { genre }),
    ...(pageCount && { numberOfPages: pageCount }),
    ...(isbn && { isbn }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <Script
      id={`book-schema-${title.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Generates JSON-LD Article schema for book pages/blog posts.
 */
export function ArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author = 'Onde Editorial',
}: {
  title: string
  description: string
  url: string
  image: string
  datePublished: string
  dateModified?: string
  author?: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
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
      '@id': url,
    },
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default BookSchema
