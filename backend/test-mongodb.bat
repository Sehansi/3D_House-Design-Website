@echo off
REM ========================================================================
REM MONGODB CONNECTION TESTER
REM ========================================================================
REM This script tests MongoDB connection and provides troubleshooting help
REM
REM Usage: Double-click this file or run from terminal
REM ========================================================================

echo.
echo ========================================================================
echo MONGODB CONNECTION TESTER
echo ========================================================================
echo.

REM Check if Node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting MongoDB connection test...
echo.

REM Run test
node test-mongodb.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Connection test failed
    echo.
    echo For help, see: MONGODB_CONNECTION_GUIDE.md
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Connection test passed!
    echo.
    pause
)
