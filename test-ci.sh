#!/bin/bash

echo "🔄 Simulando workflow de GitHub Actions..."
echo ""

echo "📦 Step 1: Install dependencies"
npm ci
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed successfully"
echo ""

echo "🔍 Step 2: Type check"
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi
echo "✅ Type check passed"
echo ""

echo "🧹 Step 3: Lint code"
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Lint failed"
    exit 1
fi
echo "✅ Lint passed (warnings are OK)"
echo ""

echo "🔨 Step 4: Build for production"
NODE_ENV=production npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

echo "🎉 All checks passed! GitHub Actions should work now."
