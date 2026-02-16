import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Roblox Avatar Creator — Design Custom Skins Online | Onde',
  description:
    'Create custom Roblox avatars and skins for free with our online creator. AI-powered outfit maker, character customizer, multi-game support. No download, no signup.',
  openGraph: {
    title: 'Free Roblox Avatar Creator — Design Custom Skins Online',
    description:
      'Design custom Roblox avatars for free. AI outfit maker, character customizer, 3D preview. No download, no signup.',
    images: [{ url: '/images/og-skin-creator.png', width: 1200, height: 630 }],
    type: 'article',
    publishedTime: '2026-02-19T00:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Roblox Avatar Creator — Design Custom Skins Online',
    description: 'Free Roblox avatar creator & skin designer. AI-powered, kid-safe, no signup needed.',
    images: ['/images/og-skin-creator.png'],
  },
  alternates: {
    canonical: 'https://onde.la/blog/free-roblox-avatar-creator/',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
