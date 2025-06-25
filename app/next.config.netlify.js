const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  // Remove static export to enable API routes
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
    // Enable TypeScript checking but with better error handling
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json'
  },
  // Ensure clean builds
  cleanDistDir: true,
  // Webpack configuration to handle module resolution better
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore test files during build
    config.module.rules.push({
      test: /test-.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
};

module.exports = nextConfig;
