# ChimeraGraph Platform Launcher (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting ChimeraGraph LeetCode Interactive Platform   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = $PSScriptRoot

Write-Host "`n[1/2] Starting Python FastAPI Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; py main.py"

Write-Host "[2/2] Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "`nBoth services launched!" -ForegroundColor Green
Write-Host "Web Platform URL: http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host "API Health & Swagger: http://127.0.0.1:8000/docs" -ForegroundColor Cyan

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:5173"
