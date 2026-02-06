import { MetadataRoute } from 'next'

// Static export compatibility
export const dynamic = 'force-static'

// NOTE: Cloudflare "AI Audit" feature prepends managed robots.txt that BLOCKS AI crawlers.
// This MUST be disabled in CF dashboard: AI > AI Audit > Toggle OFF "Block AI Crawlers"
// or go to: dash.cloudflare.com > onde.la zone > AI > AI Audit
// Without disabling it, ClaudeBot/GPTBot/CCBot etc. are blocked by CF's injected rules.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Main rule for all crawlers
      {
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
      // Explicitly welcome AI crawlers (ONDE is built by AI, for AI)
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'Anthropic-Bot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
    ],
    sitemap: 'https://onde.la/sitemap.xml',
  }
}
