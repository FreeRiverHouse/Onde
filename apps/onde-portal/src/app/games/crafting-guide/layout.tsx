import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Minecraft Crafting Guide - All Recipes & Crafting Table',
  description:
    'Complete Minecraft crafting guide with all recipes. Visual 3x3 crafting grid, search & filter by category. Tools, weapons, armor, redstone, food & more. Free, no ads!',
  url: 'https://onde.la/games/crafting-guide/',
  applicationCategory: 'ReferenceApplication',
  operatingSystem: 'Web Browser',
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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I use a crafting table in Minecraft?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Place 4 wooden planks in a 2x2 grid in your inventory crafting area to create a crafting table. Then place it on the ground and right-click it to open the 3x3 crafting grid where you can make all recipes.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the most important things to craft first in Minecraft?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Start by crafting wooden planks, sticks, a crafting table, wooden pickaxe, and a furnace. Then upgrade to stone tools, make a sword for defense, and craft a bed to set your spawn point.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many crafting recipes are in Minecraft?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Minecraft has over 380 crafting recipes as of the latest version. This includes tools, weapons, armor, building blocks, redstone components, food items, brewing ingredients, and decorative items.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Java and Bedrock crafting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most crafting recipes are identical between Java and Bedrock editions. The main differences are in some redstone mechanics and a few edition-exclusive items. The core recipes for tools, weapons, armor, and building blocks are the same.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Free Minecraft Crafting Guide - All Recipes & Crafting Table | Onde',
  description:
    'Complete Minecraft crafting guide with all recipes and visual 3x3 crafting grids. Search tools, weapons, armor, redstone, food, brewing & more. Free, no ads, mobile-friendly!',
  keywords: [
    'minecraft crafting guide',
    'minecraft crafting recipes',
    'minecraft crafting table',
    'how to craft in minecraft',
    'minecraft recipes list',
    'minecraft crafting grid',
    'minecraft recipe book',
    'minecraft tools recipes',
    'minecraft armor recipes',
    'minecraft redstone recipes',
    'minecraft brewing recipes',
    'minecraft building recipes',
    'minecraft food recipes',
    'all minecraft recipes',
    'minecraft crafting cheat sheet',
  ],
  openGraph: {
    title: '📖 Free Minecraft Crafting Guide - All Recipes & Crafting Table | Onde',
    description:
      'Complete Minecraft crafting reference with visual 3x3 grids. Search 80+ recipes by category. Tools, weapons, armor, redstone & more!',
    url: 'https://onde.la/games/crafting-guide/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-crafting-guide.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft Crafting Guide - All Recipes Free',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '📖 Free Minecraft Crafting Guide | Onde',
    description:
      'Complete Minecraft crafting reference with visual grids. 80+ recipes, search & filter. Free, no ads!',
    images: ['/images/og-crafting-guide.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/crafting-guide/',
  },
};

export default function CraftingGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="crafting-guide-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="crafting-guide-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
