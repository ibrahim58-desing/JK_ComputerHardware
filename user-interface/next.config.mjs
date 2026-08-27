/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root: a leftover node_modules one level up (from
  // before this app was split into its own service) otherwise makes
  // Turbopack infer the wrong project root and fail to find `next` itself.
  turbopack: {
    root: import.meta.dirname,
  },
  devIndicators: false,
  // Stop announcing the framework to fingerprinting scanners.
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    // Uploaded product photos live on backend-api's own subdomain — see
    // resolveImageUrl() in lib/products.ts for how a path becomes this URL.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.jkinfosystem.com',
        pathname: '/uploads/products/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/uploads/products/**',
      },
    ],
  },
  experimental: {
    // Adds integrity hashes to Next's own script tags.
    sri: {
      algorithm: 'sha256',
    },
  },
}

export default nextConfig
