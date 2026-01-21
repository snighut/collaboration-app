
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable image optimization for static-like environments or custom loaders
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
