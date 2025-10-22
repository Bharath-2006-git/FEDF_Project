# CarbonSense Setup Script for Windows PowerShell

Write-Host "🚀 CarbonSense Setup - Python Backend Migration" -ForegroundColor Green
Write-Host "=" * 60

# Check Python installation
Write-Host "`n📦 Checking Python installation..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
    
    # Check if Python 3.9+
    $version = [version]($pythonVersion -replace 'Python ', '')
    if ($version.Major -lt 3 -or ($version.Major -eq 3 -and $version.Minor -lt 9)) {
        Write-Host "⚠ Warning: Python 3.9+ recommended. Current: $pythonVersion" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Python not found! Please install Python 3.9 or higher." -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check Node.js installation
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ from:" -ForegroundColor Red
    Write-Host "https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Setup Backend
Write-Host "`n🐍 Setting up Python Backend..." -ForegroundColor Cyan
Write-Host "-" * 60

Set-Location backend

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠ Please edit backend/.env with your Supabase credentials!" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Set-Location ..

# Setup Frontend
Write-Host "`n⚛️ Setting up React Frontend..." -ForegroundColor Cyan
Write-Host "-" * 60

# Install Node dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

# Done
Write-Host "`n" + "=" * 60
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your Supabase credentials"
Write-Host "2. Start the backend: cd backend && python main.py"
Write-Host "3. Start the frontend: npm run dev"
Write-Host "4. Open browser: http://localhost:5173"
Write-Host "`n📚 View full documentation: MIGRATION_COMPLETE.md"
Write-Host "`n🎉 Happy coding!" -ForegroundColor Green
