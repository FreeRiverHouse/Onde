import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Minecraft Skin Creator for Kids — AI-Powered Online Editor | Onde',
  description:
    'Create custom Minecraft skins for free! Our kid-friendly online editor features AI tools, 3D preview, and templates. Safe, no ads, no signup. Perfect for young gamers.',
  openGraph: {
    title: 'Free Minecraft Skin Creator for Kids — AI-Powered Online Editor',
    description:
      'Kid-friendly Minecraft skin creator with AI tools, 3D preview, and templates. 100% free, safe, no ads.',
    images: [{ url: '/images/og-skin-creator.png', width: 1200, height: 630 }],
    type: 'article',
    publishedTime: '2026-02-18T00:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Minecraft Skin Creator for Kids — AI-Powered Online Editor',
    description: 'Kid-friendly Minecraft skin creator. AI tools, 3D preview, templates. Free, safe, no ads.',
    images: ['/images/og-skin-creator.png'],
  },
  alternates: {
    canonical: 'https://onde.la/blog/free-minecraft-skin-creator-kids/',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
