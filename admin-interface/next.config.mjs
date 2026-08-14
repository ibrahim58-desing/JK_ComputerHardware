/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Stop announcing the framework to fingerprinting scanners.
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    // Adds integrity hashes to Next's own script tags.
    sri: {
      algorithm: 'sha256',
    },
  },
}

export default nextConfig
