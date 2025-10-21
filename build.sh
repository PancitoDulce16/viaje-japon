#!/bin/bash

# Build script for Japan Trip Planner
# This script ensures the build works in any environment

echo "🚀 Starting build process..."

# Try different methods to run vite build
echo "📦 Attempting to build with npx vite..."
if npx vite build; then
    echo "✅ Build successful with npx vite!"
    exit 0
fi

echo "⚠️ npx vite failed, trying local vite..."
if ./node_modules/.bin/vite build; then
    echo "✅ Build successful with local vite!"
    exit 0
fi

echo "⚠️ Local vite failed, trying node directly..."
if node ./node_modules/.bin/vite build; then
    echo "✅ Build successful with node!"
    exit 0
fi

echo "❌ All build methods failed!"
exit 1
