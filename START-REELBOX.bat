@echo off
echo ==========================================
echo   REELBOX - Starting Local Server...
echo ==========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Trying py launcher...
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Python is not installed.
        echo Please install Python from https://python.org
        echo.
        pause
        exit /b 1
    )
    set PYTHON=py
) else (
    set PYTHON=python
)

REM Get the directory this batch file is in
cd /d "%~dp0"

echo Starting server on http://localhost:8080
echo.
echo ReelBox will open in your browser automatically...
echo.
echo Keep this window open while using ReelBox.
echo Close this window to stop the server.
echo.

REM Open browser after short delay
start "" timeout /t 2 >nul
start "" "http://localhost:8080/index.html"

REM Start Python server
%PYTHON% -m http.server 8080

pause
