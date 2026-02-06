import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breakout - Free Online Game | Onde',
  description: 'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
  keywords: 'breakout game, brick breaker, arcade game',
  openGraph: {
    title: '🎮 Breakout - Play Free Online!',
    description: 'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
    url: 'https://onde.la/games/breakout/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Breakout - Free Online Game',
    description: 'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
