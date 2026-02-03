import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gaming Island - Free Games for Kids | Onde',
  description: 'Play fun educational games for free! Puzzle, memory, drawing, music and more. Safe and ad-free gaming for children.',
  keywords: [
    'free games for kids',
    'educational games',
    'kids games online',
    'safe games for children',
    'learning games',
    'puzzle games',
    'memory games',
    'drawing games',
  ],
  openGraph: {
    title: '🏝️ Gaming Island - Free Games for Kids!',
    description: 'Fun educational games for children. Puzzle, memory, drawing, music and more. Safe and ad-free!',
    url: 'https://onde.la/games/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-games.png',
        width: 1200,
        height: 630,
        alt: 'Gaming Island - Fun Games for Kids',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🏝️ Gaming Island - Free Games for Kids!',
    description: 'Fun educational games for children. Safe and ad-free!',
    images: ['/images/og-games.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/',
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
