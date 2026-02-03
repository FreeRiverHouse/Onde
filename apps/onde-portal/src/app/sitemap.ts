import { MetadataRoute } from 'next'

// Static export compatibility
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://onde.la'
  
  // Static pages
  const staticPages = [
    '',
    '/libri',
    '/libreria',
    '/catalogo',
    '/collezioni',
    '/famiglia',
    '/leggi',
    '/giochi',
    '/games',
    '/games/skin-creator',
    '/games/moonlight-magic-house',
    '/games/kids-chef-studio',
    '/games/fortune-cookie',
    '/about',
    '/app',
    '/vr',
    '/shop',
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
