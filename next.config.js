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
  // ESLint configuration - ignore warnings during build, only fail on errors
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only use this if you're sure you want to.
    ignoreDuringBuilds: false,
  },
  // TypeScript configuration
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors. Only enable this if you understand the risks.
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
