#!/bin/bash

# Netlify Build Script for Sully Booking System
set -e  # Exit on any error

echo "🚀 Starting Netlify build process..."

# Set Node.js memory limit for large builds
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies with legacy peer deps to avoid conflicts
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps --prefer-offline --no-audit --no-fund

# Generate Prisma Client with explicit permissions
echo "🗄️  Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# Verify Prisma Client was generated
if [ ! -d "node_modules/.prisma" ]; then
  echo "❌ Prisma client generation failed"
  exit 1
fi

# Set production environment
export NODE_ENV=production

# Build the application with timeout handling
echo "🔨 Building Next.js application..."
timeout 600 npm run build || {
  echo "❌ Build timed out or failed"
  exit 1
}

echo "✅ Build completed successfully!"
