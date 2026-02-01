import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Static export for Cloudflare Pages
  output: 'export',
  // Ignore ESLint errors during build (fix later)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (fix later)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip API routes in static export
  trailingSlash: true,
  
  // Performance optimizations
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: ['framer-motion', 'three', '@radix-ui/react-slot'],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  
  // Modularize imports for better tree-shaking
  modularizeImports: {
    'framer-motion': {
      transform: 'framer-motion/{{member}}',
      skipDefaultConversion: true,
    },
  },
}

export default withNextIntl(nextConfig);
