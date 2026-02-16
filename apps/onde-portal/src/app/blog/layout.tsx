import type { Metadata } from 'next'
import Script from 'next/script'
import KidFriendlyAd from '@/components/KidFriendlyAd'

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
  description:
    'The Onde Blog — tech deep dives, AI agents, eGPU setups, and engineering stories from the FreeRiverHouse lab.',
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
  title: 'Blog | Onde — Stories from the Lab',
  description:
    'The Onde Blog — tech deep dives, AI agents, eGPU setups, and engineering stories from the FreeRiverHouse lab.',
  keywords: [
    'blog',
    'tech',
    'AI agents',
    'eGPU',
    'engineering',
    'open source',
    'machine learning',
    'GPU',
    'tinygrad',
    'AMD',
    'macOS',
  ],
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': '/blog/feed.xml/',
    },
  },
  openGraph: {
    title: 'Onde Blog — Stories from the Lab',
    description:
      'Tech deep dives, AI agents, eGPU setups, and engineering stories from the FreeRiverHouse lab.',
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
    title: 'Onde Blog — Stories from the Lab',
    description:
      'Tech deep dives, AI agents, eGPU setups, and engineering stories from the FreeRiverHouse lab.',
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
      <div className="relative">
        {/* Main content + optional sidebar ad */}
        <div className="flex flex-col lg:flex-row lg:gap-8 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">{children}</div>
          {/* Blog sidebar ad (visible on lg+) */}
          <div className="hidden lg:flex flex-col items-center pt-28 pr-4">
            <div className="sticky top-28">
              <KidFriendlyAd slot="blog-sidebar" />
            </div>
          </div>
        </div>
        {/* Mobile blog ad (below content, visible on <lg) */}
        <div className="flex lg:hidden justify-center py-6 px-4">
          <KidFriendlyAd slot="blog-sidebar" className="w-full max-w-md" />
        </div>
      </div>
    </>
  )
}
