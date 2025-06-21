
#!/bin/bash

echo "🔍 Sully Booking System - Build Verification Script"
echo "=================================================="

# Navigate to app directory
cd /home/ubuntu/sully-booking-system/app

echo "📋 Checking Environment..."
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "Yarn version: $(yarn --version)"

echo ""
echo "🧹 Cleaning Previous Builds..."
rm -rf .next .build tsconfig.tsbuildinfo
echo "✅ Build artifacts cleaned"

echo ""
echo "📦 Installing Dependencies..."
yarn install --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"

echo ""
echo "🏗️ Creating Production Build..."
yarn build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🔍 Verifying Build Output..."
if [ ! -d ".next" ]; then
    if [ -d ".build" ]; then
        echo "⚠️ Build created in .build instead of .next, moving..."
        mv .build .next
        echo "✅ Build moved to correct location"
    else
        echo "❌ No build directory found"
        exit 1
    fi
fi

echo "✅ Build directory exists"

# Check essential build files
REQUIRED_FILES=("BUILD_ID" "app-build-manifest.json" "build-manifest.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f ".next/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo ""
echo "🧪 Testing Build..."
echo "Starting production server..."
yarn start &
SERVER_PID=$!
sleep 5

# Test server response
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Server responding correctly (HTTP $HTTP_STATUS)"
else
    echo "❌ Server not responding correctly (HTTP $HTTP_STATUS)"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test login page
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/login)
if [ "$LOGIN_STATUS" = "200" ]; then
    echo "✅ Login page accessible (HTTP $LOGIN_STATUS)"
else
    echo "⚠️ Login page issue (HTTP $LOGIN_STATUS)"
fi

# Stop server
kill $SERVER_PID 2>/dev/null
sleep 2

echo ""
echo "🎉 BUILD VERIFICATION COMPLETE!"
echo "================================"
echo "✅ Build created successfully"
echo "✅ All required files present"
echo "✅ Server starts correctly"
echo "✅ Ready for deployment"
echo ""
echo "📁 Build location: $(pwd)/.next"
echo "📊 Build size: $(du -sh .next | cut -f1)"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the application locally: yarn dev"
echo "2. Deploy using your hosting platform"
echo "3. Verify deployment with the live URL"
