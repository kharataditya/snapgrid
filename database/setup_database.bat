@echo off
echo ========================================================
echo       SnapGrid MySQL Database Setup Assistant
echo ========================================================
echo.
echo This script will initialize the 'snapgrid_db' database in MySQL.
echo.
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo Executing setup_database.sql...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u %MYSQL_USER% -p < setup_database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo SUCCESS: snapgrid_db database initialized successfully!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo ERROR: Database setup failed. Please verify your password.
    echo ========================================================
)

pause
