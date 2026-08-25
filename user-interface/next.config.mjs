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
  },
  experimental: {
    // Adds integrity hashes to Next's own script tags.
    sri: {
      algorithm: 'sha256',
    },
  },
}

export default nextConfig
