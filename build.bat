@echo off
REM Build script for Render deployment (Windows version)
REM This script is executed during the build phase

echo Starting build process...

REM Install Python dependencies for backend
echo Installing Python dependencies...
pip install -r backend/requirements.txt

echo Build completed successfully!
