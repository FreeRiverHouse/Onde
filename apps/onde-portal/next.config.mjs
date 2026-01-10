import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// Setup Cloudflare dev platform
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Required for Cloudflare Pages
  experimental: {
    runtime: 'edge',
  },
}

export default nextConfig
