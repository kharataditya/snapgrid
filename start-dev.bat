@echo off
echo ========================================================
echo        Starting SnapGrid Development Servers
echo ========================================================
echo.
echo 1. Launching Express Backend on port 5000...
start "SnapGrid Backend" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo 2. Launching Vite React Frontend on port 5173...
start "SnapGrid Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================================
echo Keep this window open or close it when done.
pause
