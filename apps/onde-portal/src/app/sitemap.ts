import { MetadataRoute } from 'next'

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
    '/about',
    '/app',
    '/vr',
  ]

  const staticEntries = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : path === '/libri' ? 0.9 : 0.7,
  }))

  return staticEntries
}
