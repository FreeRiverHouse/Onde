import { MetadataRoute } from 'next'

// Static export compatibility
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/health',
        '/preprod',
        '/account',
        '/profile',
        '/settings',
        '/parental',
        '/my-books',
        '/goals',
        '/current',
        '/daily',
      ],
    },
    sitemap: 'https://onde.la/sitemap.xml',
  }
}
