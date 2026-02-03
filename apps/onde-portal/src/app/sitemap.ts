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
    
    // Games - Featured
    '/games/skin-creator',
    '/games/moonlight-magic-house',
    '/games/arcade',
    '/games/kids-chef-studio',
    '/games/fortune-cookie',
    '/games/leaderboard',
    
    // Games - Mini-games (popular ones)
    '/games/memory',
    '/games/quiz',
    '/games/puzzle',
    '/games/snake',
    '/games/tetris',
    '/games/2048',
    '/games/wordle',
    
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

  const staticEntries = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : path === '/libri' ? 0.9 : 0.7,
  }))

  return staticEntries
}
