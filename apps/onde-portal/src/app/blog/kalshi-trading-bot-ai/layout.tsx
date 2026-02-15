import type { Metadata } from 'next'
import Script from 'next/script'

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Come funziona il nostro trading bot AI su Kalshi',
  description:
    'Dietro le quinte del nostro autotrader: architettura multi-agente (Forecaster, Critic, Trader), Kelly criterion, momentum detection e edge calibration su prediction markets.',
  image: 'https://onde.la/images/og-onde.png',
  datePublished: '2026-02-16',
  dateModified: '2026-02-16',
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
    '@id': 'https://onde.la/blog/kalshi-trading-bot-ai',
  },
  keywords: [
    'trading bot',
    'Kalshi',
    'prediction markets',
    'AI trading',
    'Kelly criterion',
    'multi-agent architecture',
    'momentum detection',
    'regime detection',
    'edge calibration',
    'quantitative trading',
    'crypto trading',
    'autotrader',
    'Python',
  ],
  about: [
    { '@type': 'Thing', name: 'Algorithmic Trading' },
    { '@type': 'Thing', name: 'Prediction Markets' },
    { '@type': 'Thing', name: 'Artificial Intelligence' },
  ],
  proficiencyLevel: 'Expert',
  inLanguage: 'it',
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
      name: 'Trading Bot AI su Kalshi',
      item: 'https://onde.la/blog/kalshi-trading-bot-ai',
    },
  ],
}

export const metadata: Metadata = {
  title: 'Come funziona il nostro trading bot AI su Kalshi | Onde Tech',
  description:
    'Architettura multi-agente, Kelly criterion, momentum e regime detection, edge calibration: dietro le quinte del nostro autotrader su Kalshi prediction markets.',
  keywords: [
    'trading bot Kalshi',
    'AI trading bot',
    'Kelly criterion trading',
    'prediction market bot',
    'multi-agent trading',
    'momentum detection crypto',
    'regime detection trading',
    'edge calibration',
    'quantitative trading Python',
    'autotrader crypto',
  ],
  alternates: {
    canonical: '/blog/kalshi-trading-bot-ai',
  },
  openGraph: {
    title: 'Come funziona il nostro trading bot AI su Kalshi',
    description:
      'Dietro le quinte: architettura multi-agente, Kelly criterion, momentum detection e edge calibration su prediction markets.',
    url: 'https://onde.la/blog/kalshi-trading-bot-ai',
    siteName: 'Onde',
    type: 'article',
    publishedTime: '2026-02-16T00:00:00Z',
    authors: ['FreeRiverHouse'],
    tags: ['Trading', 'AI', 'Kalshi', 'Kelly Criterion', 'Prediction Markets', 'Python'],
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'Trading Bot AI su Kalshi - Onde Tech',
      },
    ],
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Come funziona il nostro trading bot AI su Kalshi',
    description:
      'Multi-agent architecture + Kelly criterion + momentum detection = un trading bot che impara. Dietro le quinte.',
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
