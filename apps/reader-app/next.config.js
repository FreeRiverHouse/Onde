/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.STATIC_EXPORT ? '/reader' : '',
  assetPrefix: process.env.STATIC_EXPORT ? '/reader/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // PWA support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
