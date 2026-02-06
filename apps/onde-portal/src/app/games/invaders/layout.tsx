import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Space Invaders - Free Online Game | Onde',
  description: 'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
  keywords: 'space invaders, alien shooter, arcade game, retro game',
  openGraph: {
    title: '🎮 Space Invaders - Play Free Online!',
    description: 'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
    url: 'https://onde.la/games/invaders/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Space Invaders - Free Online Game',
    description: 'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
