@echo off
echo ========================================================
echo   Starting ChimeraGraph LeetCode Interactive Platform
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend...
start "ChimeraGraph Backend" cmd /k "cd /d %~dp0backend && py main.py"

echo [2/2] Starting Vite Frontend on port 5173...
start "ChimeraGraph Frontend (port 5173)" cmd /k "cd /d %~dp0 && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Platform is launching!
echo Web App: http://127.0.0.1:5173
echo API Doc: http://127.0.0.1:8000/docs
echo.
timeout /t 3 >nul
start http://127.0.0.1:5173
