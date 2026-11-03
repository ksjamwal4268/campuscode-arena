@echo off
setlocal enabledelayedexpansion
title CampusCode Local Server

:: 1. Force working directory to the folder containing this batch file
cd /d "%~dp0"

echo ======================================================
echo           CampusCode Local Environment
echo ======================================================
echo.
echo Folder: %CD%
echo.

:: 2. Check if user ran directly from inside zip without extracting
if not exist "server.js" (
    echo [ERROR] "server.js" was not found in this directory!
    echo.
    echo Please make sure you EXTRACTED the zip file first!
    echo Do not double-click inside the zip folder.
    echo Right-click the zip ^> "Extract All" ^> then run start.bat.
    echo.
    pause
    exit /b
)

:: 3. Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Node.js is NOT installed or not in PATH on this computer!
    echo.
    echo Node.js is required to run the local server.
    echo You can download it free in 1 minute from:
    echo   https://nodejs.org
    echo.
    echo Checking if Python is installed as a fallback...
    where python >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Python found! Launching Python static web server on port 3000...
        timeout /t 2 >nul
        start http://localhost:3000
        python -m http.server 3000
        pause
        exit /b
    )
    echo Neither Node.js nor Python was found.
    echo Please install Node.js from https://nodejs.org, then re-run start.bat!
    echo.
    pause
    exit /b
)

:: 4. Node is present - start the server and open browser
echo [OK] Node.js is detected!
echo Starting CampusCode server on http://localhost:3000...
echo.

:: Open browser after 1 second delay so the server starts listening first
start "" cmd /c "timeout /t 1 >nul && start http://localhost:3000"

:: Start the Node server (this keeps running)
node server.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly (code %errorlevel%).
)

pause
