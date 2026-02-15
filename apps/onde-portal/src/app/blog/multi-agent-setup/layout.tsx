import type { Metadata } from 'next'
import Script from 'next/script'

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans',
  description:
    'How we run a 24/7 AI workforce with 2 Mac Minis, 5 Claude-powered agents, a shared task system on git, and persistent memory — for about $200/month.',
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
    '@id': 'https://onde.la/blog/multi-agent-setup',
  },
  keywords: [
    'AI agents',
    'multi-agent',
    'Claude',
    'autonomous AI',
    'Mac Mini',
    'Clawdbot',
    'task management',
    'AI workforce',
    'git coordination',
    'persistent memory',
  ],
  about: [
    { '@type': 'Thing', name: 'Artificial Intelligence' },
    { '@type': 'Thing', name: 'Multi-Agent Systems' },
    { '@type': 'Thing', name: 'Software Development' },
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
      name: 'Multi-Agent Setup',
      item: 'https://onde.la/blog/multi-agent-setup',
    },
  ],
}

export const metadata: Metadata = {
  title: 'Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans | Onde Blog',
  description:
    'How we run a 24/7 AI workforce with 2 Mac Minis, 5 Claude-powered agents, a shared task system on git, and persistent memory — for about $200/month.',
  keywords: [
    'AI agents',
    'multi-agent system',
    'Claude AI',
    'autonomous agents',
    'Mac Mini AI',
    'Clawdbot',
    'AI workforce',
    'git task management',
    'persistent AI memory',
    'AI cost analysis',
  ],
  alternates: {
    canonical: '/blog/multi-agent-setup',
  },
  openGraph: {
    title: 'Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans',
    description:
      'How we run a 24/7 AI workforce with 2 Mac Minis, 5 Claude-powered agents, and git-based coordination — for ~$200/month.',
    url: 'https://onde.la/blog/multi-agent-setup',
    siteName: 'Onde',
    type: 'article',
    publishedTime: '2026-02-16T00:00:00Z',
    authors: ['FreeRiverHouse'],
    tags: ['AI Agents', 'Multi-Agent', 'Claude', 'Automation', 'Mac Mini'],
    images: [
      {
        url: '/images/og-onde.png',
        width: 1200,
        height: 630,
        alt: 'Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans',
    description:
      '2 Mac Minis, 5 Claude-powered AI agents, git-based coordination, persistent memory. ~$200/month for a 24/7 AI workforce.',
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
