import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pong - Free Online Game | Onde',
  description: 'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
  keywords: 'pong game, table tennis, classic arcade, retro game',
  openGraph: {
    title: '🎮 Pong - Play Free Online!',
    description: 'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
    url: 'https://onde.la/games/pong/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Pong - Free Online Game',
    description: 'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
