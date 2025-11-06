/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Use separate build directories based on environment variable
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  // Disable build output caching conflicts
  generateBuildId: async () => {
    // Generate unique build ID for each instance
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
}

module.exports = nextConfig
