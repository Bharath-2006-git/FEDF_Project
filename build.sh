#!/bin/bash

# Build script for Render deployment
# This script is executed during the build phase

echo "🔨 Starting build process..."

# Install Python dependencies for backend
echo "📦 Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "✅ Build completed successfully!"
