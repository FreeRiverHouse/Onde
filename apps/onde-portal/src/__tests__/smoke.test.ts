/**
 * Basic smoke tests for Onde Portal
 * Run with: npm test or npx jest
 */

describe('Onde Portal Smoke Tests', () => {
  const BASE_URL = process.env.TEST_BASE_URL || 'https://onde.la'

  describe('Homepage', () => {
    it('should return 200 status', async () => {
      const response = await fetch(BASE_URL)
      expect(response.status).toBe(200)
    })

    it('should contain expected title', async () => {
      const response = await fetch(BASE_URL)
      const html = await response.text()
      expect(html).toContain('Onde')
    })

    it('should have valid content-type', async () => {
      const response = await fetch(BASE_URL)
      expect(response.headers.get('content-type')).toContain('text/html')
    })
  })

  describe('Critical Pages', () => {
    const criticalPages = [
      { path: '/libri', name: 'Books' },
      { path: '/games', name: 'Games' },
      { path: '/games/skin-creator', name: 'Skin Creator' },
      { path: '/about', name: 'About' },
    ]

    criticalPages.forEach(({ path, name }) => {
      it(`${name} page (${path}) should return 200`, async () => {
        const response = await fetch(`${BASE_URL}${path}`)
        expect(response.status).toBe(200)
      })
    })
  })

  describe('SEO', () => {
    it('should have sitemap.xml', async () => {
      const response = await fetch(`${BASE_URL}/sitemap.xml`)
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toContain('<?xml')
      expect(text).toContain('urlset')
    })

    it('should have robots.txt', async () => {
      const response = await fetch(`${BASE_URL}/robots.txt`)
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toContain('Sitemap')
    })
  })

  describe('Assets', () => {
    it('should serve favicon', async () => {
      const response = await fetch(`${BASE_URL}/favicon.ico`)
      expect([200, 301, 302]).toContain(response.status)
    })

    it('should serve manifest.json', async () => {
      const response = await fetch(`${BASE_URL}/manifest.json`)
      expect(response.status).toBe(200)
      const manifest = await response.json()
      expect(manifest.name).toBeDefined()
    })
  })

  describe('Security Headers', () => {
    it('should have X-Content-Type-Options', async () => {
      const response = await fetch(BASE_URL)
      expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    })
  })

  describe('Performance', () => {
    it('homepage should load in reasonable time', async () => {
      const start = Date.now()
      await fetch(BASE_URL)
      const duration = Date.now() - start
      expect(duration).toBeLessThan(5000) // 5 seconds max
    })
  })
})
