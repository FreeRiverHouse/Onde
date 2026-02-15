import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Minecraft Enchantment Calculator',
  description:
    'Calculate Minecraft enchantment costs and find the best enchantment combinations! See all compatible enchantments for every item, check conflicts, max levels, and total XP cost. Free online tool for Java & Bedrock.',
  url: 'https://onde.la/games/enchant-calc/',
  genre: ['Educational', 'Utility'],
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 6,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://onde.la' },
    { '@type': 'ListItem', position: 2, name: 'Games', item: 'https://onde.la/games' },
    { '@type': 'ListItem', position: 3, name: 'Enchantment Calculator', item: 'https://onde.la/games/enchant-calc/' },
  ],
};

export const metadata: Metadata = {
  title: 'Minecraft Enchantment Calculator - Best Enchantment Combos & XP Cost | Onde',
  description:
    'Free Minecraft enchantment calculator! Find the best enchantments for swords, pickaxes, armor, bows & more. See max levels, conflicts, descriptions, and calculate total XP cost. Works with Java & Bedrock Edition.',
  keywords: [
    'minecraft enchantment calculator',
    'minecraft enchantment guide',
    'minecraft xp calculator',
    'minecraft enchantment list',
    'minecraft enchantment combos',
    'minecraft best enchantments',
    'minecraft sword enchantments',
    'minecraft pickaxe enchantments',
    'minecraft armor enchantments',
    'minecraft bow enchantments',
    'minecraft enchantment conflicts',
    'minecraft enchantment cost',
    'minecraft anvil calculator',
    'minecraft enchanting guide',
    'free minecraft enchantment tool',
  ],
  openGraph: {
    title: '⚔️ Minecraft Enchantment Calculator - Best Combos & XP Cost!',
    description:
      'Find the best Minecraft enchantments for every item. Calculate XP cost, check conflicts, and see max levels!',
    url: 'https://onde.la/games/enchant-calc/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-enchant-calc.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft Enchantment Calculator - Find Best Enchantments',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '⚔️ Minecraft Enchantment Calculator - Best Combos & XP Cost!',
    description: 'Calculate enchantment costs & find the best combos for every Minecraft item. Free!',
    images: ['/images/og-enchant-calc.png'],
    creator: '@Onde_FRH',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/enchant-calc/' },
};

export default function EnchantCalcLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="enchant-calc-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="enchant-calc-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
