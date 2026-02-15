import type { Metadata } from 'next'
import Script from 'next/script'

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How We Built onde.la — A Free Kids\' Site, Mostly by AI, in Two Weeks',
  description:
    'The full technical story behind onde.la: Next.js 14, Tailwind, Cloudflare Pages, 50+ browser games, an ePub reader, a Minecraft skin creator, and two AI agents that wrote 90% of the code.',
  image: 'https://onde.la/images/og-onde.png',
  datePublished: '2026-02-28',
  dateModified: '2026-02-28',
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
    '@id': 'https://onde.la/blog/how-we-built-onde-la',
  },
  keywords: [
    'Next.js',
    'Tailwind CSS',
    'Cloudflare Pages',
    'children website',
    'browser games',
    'ePub reader',
    'Minecraft skin creator',
    'Three.js',
    'AI development',
    'Claude',
    'PWA',
    'Framer Motion',
    'i18n',
  ],
  about: [
    { '@type': 'Thing', name: 'Web Development' },
    { '@type': 'Thing', name: 'AI-Assisted Development' },
    { '@type': 'Thing', name: 'Children\'s Education' },
  ],
  proficiencyLevel: 'Intermediate',
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
      name: 'How We Built onde.la',
      item: 'https://onde.la/blog/how-we-built-onde-la',
    },
  ],
}

export const metadata: Metadata = {
  title: 'How We Built onde.la — A Free Kids\' Site, Mostly by AI | Onde Blog',
  description:
    'The full technical story: Next.js 14, Tailwind CSS, Cloudflare Pages, 50+ browser games, ePub reader, Minecraft skin creator, and two AI agents that wrote 90% of the code in two weeks.',
  keywords: [
    'Next.js 14',
    'Tailwind CSS',
    'Cloudflare Pages',
    'free kids website',
    'browser games HTML5',
    'ePub reader web',
    'Minecraft skin creator Three.js',
    'AI web development',
    'Claude AI coding',
    'PWA offline',
    'Framer Motion animations',
    'i18n Next.js',
  ],
  alternates: {
    canonical: '/blog/how-we-built-onde-la',
  },
  openGraph: {
    title: 'How We Built onde.la — A Free Kids\' Site, Mostly by AI',
    description:
      'Next.js 14 + Tailwind + Cloudflare Pages + 50 games + ePub reader + Minecraft skin creator. Two AI agents wrote 90% of the code in two weeks.',
    url: 'https://onde.la/blog/how-we-built-onde-la',
    siteName: 'Onde',
    type: 'article',
    publishedTime: '2026-02-28T00:00:00Z',
    authors: ['FreeRiverHouse'],
    tags: ['Next.js', 'Tailwind', 'Cloudflare Pages', 'AI Development', 'Kids', 'Games', 'Three.js'],
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'How We Built onde.la',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How We Built onde.la — A Free Kids\' Site, Mostly by AI',
    description:
      '50+ games, ePub reader, Minecraft skin creator, built in 2 weeks by AI agents. Here\'s how.',
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
