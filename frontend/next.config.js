/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'ui-avatars.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
