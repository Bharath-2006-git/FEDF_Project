Write-Host "Starting Carbon Sense Application..." -ForegroundColor Green
Write-Host ""

# Kill any existing processes on common ports
Write-Host "Cleaning up any existing processes..." -ForegroundColor Yellow
try {
    npx kill-port 3000 5000 8080 5173 2>$null
    Write-Host "Cleanup completed" -ForegroundColor Green
} catch {
    Write-Host "No processes to clean up" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Starting development server with Microsoft Edge..." -ForegroundColor Green
npm run dev

Read-Host "Press Enter to exit"