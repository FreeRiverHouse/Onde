/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // No basePath for standalone mobile app
  images: {
    unoptimized: true, // Required for static export
  },
};
module.exports = nextConfig;
