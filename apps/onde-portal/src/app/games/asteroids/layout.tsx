import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asteroids - Free Online Game | Onde',
  description: 'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
  keywords: 'asteroids game, space shooter, arcade classic, retro game',
  openGraph: {
    title: '🎮 Asteroids - Play Free Online!',
    description: 'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
    url: 'https://onde.la/games/asteroids/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Asteroids - Free Online Game',
    description: 'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
