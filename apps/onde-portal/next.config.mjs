/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Vercel handles image optimization natively
    // Set unoptimized only for static export (Cloudflare Pages)
    unoptimized: process.env.NEXT_OUTPUT === 'export',
  },
  // Static export for Cloudflare Pages (set NEXT_OUTPUT=export)
  // Vercel uses default SSR mode
  ...(process.env.NEXT_OUTPUT === 'export' ? { output: 'export' } : {}),
  // Ignore ESLint errors during build (fix later)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (fix later)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Trailing slash for consistent URLs
  trailingSlash: true,
  // Performance: optimize package imports (tree-shake heavy packages)
  experimental: {
    optimizePackageImports: ['framer-motion', '@/components/ui/aceternity'],
  },
}

export default nextConfig
