/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'de-vanzare.site',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true, // Allow unoptimized images to bypass Next.js Image Optimization API
    domains: ['localhost', 'de-vanzare.site'], // Allow images from localhost and de-vanzare.site domains
  },
}

module.exports = nextConfig