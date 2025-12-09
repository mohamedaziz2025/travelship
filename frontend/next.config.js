/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'ui-avatars.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  output: 'standalone',
}

module.exports = nextConfig
