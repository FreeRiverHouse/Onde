/**
 * Deploy Verification Tests - Playwright
 * Runs before deployment to verify site functionality
 * 
 * Usage:
 *   npx playwright test tools/tech-support/tests/deploy-verification.spec.ts
 *   
 * Environment vars:
 *   BASE_URL - Target URL (default: http://localhost:8888)
 *   ENVIRONMENT - onde-la or onde-surf (default: onde-la)
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8888';
const ENVIRONMENT = process.env.ENVIRONMENT || 'onde-la';

test.describe('Deploy Verification', () => {
  
  test.describe('Homepage', () => {
    test('should load successfully', async ({ page }) => {
      const response = await page.goto(BASE_URL);
      expect(response?.status()).toBeLessThan(400);
    });

    test('should have correct title', async ({ page }) => {
      await page.goto(BASE_URL);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(e => 
        !e.includes('Failed to load resource') && 
        !e.includes('favicon')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });

    test('should not have React/Next.js error overlay', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('domcontentloaded');
      
      const errorOverlay = await page.$('[data-nextjs-dialog-overlay]');
      expect(errorOverlay).toBeNull();
    });
  });

  test.describe('Navigation', () => {
    test('should have working navigation links', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Find all internal links
      const links = await page.$$('a[href^="/"]');
      const uniquePaths = new Set<string>();
      
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && !href.includes('#')) {
          uniquePaths.add(href);
        }
      }
      
      // Test first 5 unique paths
      const pathsToTest = Array.from(uniquePaths).slice(0, 5);
      
      for (const path of pathsToTest) {
        const response = await page.goto(`${BASE_URL}${path}`);
        expect(response?.status(), `Page ${path} should load`).toBeLessThan(400);
      }
    });
  });

  test.describe('Critical Pages', () => {
    const criticalPages = ENVIRONMENT === 'onde-la' 
      ? ['/', '/libri', '/catalogo', '/about', '/health']
      : ['/', '/betting'];

    for (const pagePath of criticalPages) {
      test(`${pagePath} should load`, async ({ page }) => {
        const response = await page.goto(`${BASE_URL}${pagePath}`);
        expect(response?.status()).toBeLessThan(400);
        
        // Verify page has content
        const body = await page.$('body');
        expect(body).not.toBeNull();
        
        const content = await page.textContent('body');
        expect(content?.length).toBeGreaterThan(100);
      });
    }
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // Should load in under 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Assets', () => {
    test('favicon should be accessible', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/icon.svg`);
      // Favicon might be at different paths, just check it doesn't 500
      if (response?.status() === 404) {
        // Try alternate paths
        const altResponse = await page.goto(`${BASE_URL}/favicon.ico`);
        // It's ok if favicon is missing, but should not error
        expect(altResponse?.status()).not.toBe(500);
      } else {
        expect(response?.status()).toBeLessThan(400);
      }
    });
  });

  // Onde.la specific tests
  if (ENVIRONMENT === 'onde-la') {
    test.describe('Onde.la Specific', () => {
      test('/libri should show books', async ({ page }) => {
        await page.goto(`${BASE_URL}/libri`);
        await page.waitForLoadState('networkidle');
        
        // Should have at least one book card or title
        const books = await page.$$('h2, h3, [class*="card"]');
        expect(books.length).toBeGreaterThan(0);
      });

      test('/health should show status', async ({ page }) => {
        await page.goto(`${BASE_URL}/health`);
        const content = await page.textContent('body');
        expect(content).toContain('Health');
      });

      test('RSS feed should be accessible', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/feed.xml`);
        expect(response?.status()).toBeLessThan(400);
      });
    });
  }

  // Onde.surf specific tests
  if (ENVIRONMENT === 'onde-surf') {
    test.describe('Onde.surf Specific', () => {
      test('/betting should load dashboard', async ({ page }) => {
        await page.goto(`${BASE_URL}/betting`);
        await page.waitForLoadState('networkidle');
        
        const content = await page.textContent('body');
        // Should have trading-related content
        expect(content?.toLowerCase()).toMatch(/trade|bet|market|performance/i);
      });
    });
  }
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const h1s = await page.$$('h1');
    // Should have exactly one h1
    expect(h1s.length).toBe(1);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const images = await page.$$('img');
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });
});
