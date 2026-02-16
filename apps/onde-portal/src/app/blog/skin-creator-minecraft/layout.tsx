import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Minecraft Skin Creator — Design Your Perfect Skin Online | Onde',
  description:
    'Create custom Minecraft skins for free with our online Skin Creator. 3D preview, layer system, templates, and AI-powered tools. Works with Java & Bedrock editions.',
  openGraph: {
    title: 'Free Minecraft Skin Creator — Design Your Perfect Skin Online',
    description:
      'Create custom Minecraft skins for free with our online Skin Creator. 3D preview, layer system, templates, and AI tools.',
    images: [{ url: '/images/og-skin-creator.png', width: 1200, height: 630 }],
    type: 'article',
    publishedTime: '2026-02-16T00:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Minecraft Skin Creator — Design Your Perfect Skin Online',
    description: 'Create custom Minecraft skins for free. 3D preview, layers, templates & AI tools.',
    images: ['/images/og-skin-creator.png'],
  },
  alternates: {
    canonical: 'https://onde.la/blog/skin-creator-minecraft/',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
