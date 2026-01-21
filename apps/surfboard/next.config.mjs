/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow both server and client components with API routes
  // Required for NextAuth
  images: {
    unoptimized: true,
  },
}

export default nextConfig
