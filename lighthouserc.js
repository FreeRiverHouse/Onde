/**
 * Lighthouse CI Configuration
 * Run: npx @lhci/cli autorun
 */
module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'https://onde.la/',
        'https://onde.la/libri',
        'https://onde.la/catalogo',
      ],
      numberOfRuns: 3, // Run multiple times for consistency
      settings: {
        // Chrome flags for CI environment
        chromeFlags: '--no-sandbox --headless',
        // Throttling settings (simulate 4G mobile)
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Other metrics
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
