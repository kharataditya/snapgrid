@echo off
setlocal
echo ========================================================
echo         SnapGrid - Automated Setup Script
echo ========================================================
echo.
echo [1/3] Installing root, backend, and frontend dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed. Please ensure Node.js and npm are installed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Setting up MySQL Database (snapgrid_db)...
node database/init_db.js
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Database initialization had an issue.
    echo Please verify MySQL is running and run: node database/init_db.js
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Building frontend for production verification...
call npm --prefix frontend run build

echo.
echo ========================================================
echo      Setup Complete! You are ready to run SnapGrid!
echo ========================================================
echo.
echo To start both Backend and Frontend:
echo   Double-click start-dev.bat
echo   OR run: npm run backend (terminal 1) and npm run frontend (terminal 2)
echo.
echo Open http://localhost:5173 in your browser to start.
echo ========================================================
pause
