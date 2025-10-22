#!/bin/bash

# CarbonSense Setup Script for Mac/Linux

echo "🚀 CarbonSense Setup - Python Backend Migration"
echo "============================================================"

# Check Python installation
echo -e "\n📦 Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Python found: $PYTHON_VERSION"
else
    echo "❌ Python 3 not found! Please install Python 3.9 or higher."
    echo "Visit: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js installation
echo -e "\n📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found! Please install Node.js 18+"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Setup Backend
echo -e "\n🐍 Setting up Python Backend..."
echo "------------------------------------------------------------"

cd backend

# Create virtual environment
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo "✓ Virtual environment already exists"
else
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Python dependencies installed"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠ Please edit backend/.env with your Supabase credentials!"
else
    echo "✓ .env file already exists"
fi

cd ..

# Setup Frontend
echo -e "\n⚛️ Setting up React Frontend..."
echo "------------------------------------------------------------"

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Node.js dependencies installed"
else
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Done
echo -e "\n============================================================"
echo "✅ Setup Complete!"
echo "============================================================"

echo -e "\n📝 Next Steps:"
echo "1. Edit backend/.env with your Supabase credentials"
echo "2. Start the backend: cd backend && python3 main.py"
echo "3. Start the frontend: npm run dev"
echo "4. Open browser: http://localhost:5173"
echo -e "\n📚 View full documentation: MIGRATION_COMPLETE.md"
echo -e "\n🎉 Happy coding!"
