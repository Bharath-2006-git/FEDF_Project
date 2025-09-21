@echo off
echo Starting Carbon Sense Application...
echo.

REM Kill any existing processes on common ports
echo Cleaning up any existing processes...
npx kill-port 3000 5000 8080 5173 2>nul || echo No processes to clean up

echo.
echo Starting development server with Microsoft Edge...
npm run dev

pause