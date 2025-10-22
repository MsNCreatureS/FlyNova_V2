/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static hosting on Hostinger
  },
  output: 'standalone',
  distDir: '.next',
}

module.exports = nextConfig
