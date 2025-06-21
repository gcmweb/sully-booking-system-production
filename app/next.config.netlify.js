
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  // Enable static export for better Netlify compatibility
  output: 'export',
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable server-side features for static export
  async rewrites() {
    return []
  },
  // Configure for static hosting
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

module.exports = nextConfig;
