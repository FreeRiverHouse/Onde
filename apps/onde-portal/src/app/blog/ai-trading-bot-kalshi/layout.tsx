import type { Metadata } from 'next'
import Script from 'next/script'

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How We Built an AI Trading Bot for Kalshi (And What We Learned)',
  description:
    'We built a trading bot for Kalshi prediction markets — starting with crypto price feeds, failing at 44% win rate, then discovering LLMs as forecasters.',
  image: 'https://onde.la/images/og-onde.png',
  datePublished: '2025-06-21',
  dateModified: '2025-06-21',
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
    '@id': 'https://onde.la/blog/ai-trading-bot-kalshi',
  },
  keywords: [
    'Kalshi',
    'prediction markets',
    'trading bot',
    'AI forecasting',
    'Claude',
    'LLM',
    'Python',
    'CPI prediction',
    'algorithmic trading',
  ],
  about: [
    { '@type': 'Thing', name: 'Prediction Markets' },
    { '@type': 'Thing', name: 'Algorithmic Trading' },
    { '@type': 'Thing', name: 'Artificial Intelligence' },
  ],
  proficiencyLevel: 'Expert',
  inLanguage: 'en',
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://onde.la' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://onde.la/blog' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'AI Trading Bot for Kalshi',
      item: 'https://onde.la/blog/ai-trading-bot-kalshi',
    },
  ],
}

export const metadata: Metadata = {
  title: 'How We Built an AI Trading Bot for Kalshi (And What We Learned) | Onde Blog',
  description:
    'We built a trading bot for Kalshi prediction markets. From 44% win rate with crypto feeds to discovering LLMs as surprisingly good forecasters for CPI, GDP, and politics.',
  keywords: [
    'Kalshi trading bot',
    'prediction market bot',
    'AI forecasting',
    'Claude prediction markets',
    'LLM trading',
    'algorithmic trading Kalshi',
    'CPI prediction',
    'prediction market strategy',
  ],
  alternates: {
    canonical: '/blog/ai-trading-bot-kalshi',
  },
  openGraph: {
    title: 'How We Built an AI Trading Bot for Kalshi (And What We Learned)',
    description:
      'From 44% win rate with crypto feeds to AI forecasting. Real code, real numbers, honest lessons.',
    url: 'https://onde.la/blog/ai-trading-bot-kalshi',
    siteName: 'Onde',
    type: 'article',
    publishedTime: '2025-06-21T00:00:00Z',
    authors: ['FreeRiverHouse'],
    tags: ['Kalshi', 'Prediction Markets', 'Trading Bot', 'AI', 'Claude', 'LLM'],
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'AI Trading Bot for Kalshi — Onde Blog',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How We Built an AI Trading Bot for Kalshi',
    description:
      'From 44% win rate to AI forecasting. Real code, real numbers, honest lessons about prediction markets.',
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
