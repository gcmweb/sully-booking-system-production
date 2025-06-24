/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Configure WebSocket for HMR in preview environments
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Ensure proper WebSocket handling
  experimental: {
    // Enable WebSocket support
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
