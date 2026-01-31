import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Skin Gallery - Minecraft & Roblox Skins | Onde',
  description: 'Discover amazing community-created Minecraft and Roblox skins! Browse, like, and use thousands of free skins created by our community. Get inspired or share your own creations!',
  keywords: ['minecraft skin gallery', 'community skins', 'free minecraft skins', 'roblox skins gallery', 'skin templates', 'custom skins', 'skin showcase', 'minecraft character skins'],
  openGraph: {
    title: '🖼️ Community Skin Gallery - Free Minecraft & Roblox Skins',
    description: 'Browse amazing skins created by our community! Thousands of free skins to download and customize.',
    url: 'https://onde.la/games/skin-creator/gallery',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-skin-gallery.png',
        width: 1200,
        height: 630,
        alt: 'Community Skin Gallery - Free Minecraft & Roblox Skins',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🖼️ Community Skin Gallery - Free Skins!',
    description: 'Browse & download amazing community-created Minecraft & Roblox skins!',
    images: ['/images/og-skin-gallery.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/skin-creator/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
