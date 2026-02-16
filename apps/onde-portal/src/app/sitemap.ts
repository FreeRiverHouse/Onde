import { MetadataRoute } from 'next'

// Static export compatibility
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://onde.la'
  
  // Static pages - ordered by priority
  const staticPages = [
    // Core pages
    '',
    '/libri',
    '/games',
    '/about',
    '/app',
    
    // Books & Reading
    '/libreria',
    '/catalogo',
    '/collezioni',
    '/famiglia',
    '/leggi',
    
    // Games - Categories
    '/games/category/puzzle',
    '/games/category/educational',
    '/games/category/creative',
    '/games/category/action',
    '/games/minecraft',
    
    // Games - Featured
    '/games/skin-creator',
    '/games/banner-maker',
    '/games/pixel-art',
    '/games/enchant-calc',
    '/games/name-generator',
    '/games/crafting-guide',
    '/games/cookie-clicker',
    '/games/virtual-pet',
    '/games/moonlight-magic-house',
    '/games/arcade',
    '/games/kids-chef-studio',
    '/games/fortune-cookie',
    '/games/leaderboard',
    
    // Games - All games (A-Z)
    '/games/2048',
    '/games/alphabet',
    '/games/asteroids',
    '/games/breakout',
    '/games/bubble-pop',
    '/games/bubbles',
    '/games/catch',
    '/games/coloring',
    '/games/connect4',
    '/games/counting',
    '/games/crossword',
    '/games/dino',
    '/games/draw',
    '/games/flappy',
    '/games/hangman',
    '/games/invaders',
    '/games/jigsaw',
    '/games/matching',
    '/games/math',
    '/games/maze',
    '/games/memory',
    '/games/minesweeper',
    '/games/music',
    '/games/pong',
    '/games/puzzle',
    '/games/quiz',
    '/games/reaction',
    '/games/rhythm',
    '/games/scratch',
    '/games/simon',
    '/games/slots',
    '/games/spot-difference',
    '/games/sudoku',
    '/games/tictactoe',
    '/games/typing',
    '/games/typing-race',
    '/games/snake',
    '/games/ocean-run',
    '/games/tower',
    '/games/whack',
    '/games/wheel',
    '/games/word-puzzle',
    '/games/wordle',
    
    // Individual books (reader pages) — slugs must match built output in out/libro/
    '/libro/meditations-en',
    '/libro/meditations-it',
    '/libro/shepherds-promise',
    '/libro/alice-wonderland-en',
    '/libro/jungle-book-en',
    '/libro/peter-rabbit-en',
    '/libro/frankenstein-en',
    
    // Blog
    '/blog',
    '/blog/radeon-7900-xtx-mac-tinygrad',
    
    // Other sections
    '/giochi',
    '/vr',
    '/shop',
    '/explore',
    '/skin-creator',
    
    // Legal & Settings
    '/privacy',
    '/terms',
    '/settings',
  ]

  // Add trailing slash to all paths to match trailingSlash:true in next.config.mjs
  // Without this, every sitemap URL triggers a 301 redirect, wasting crawl budget
  const staticEntries = staticPages.map((path) => ({
    url: path === '' ? `${baseUrl}/` : `${baseUrl}${path}/`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : path === '/libri' ? 0.9 : 0.7,
  }))

  return staticEntries
}
