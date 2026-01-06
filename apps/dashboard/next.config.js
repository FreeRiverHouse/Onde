/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@onde/core'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
