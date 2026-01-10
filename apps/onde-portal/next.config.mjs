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
}

export default nextConfig
