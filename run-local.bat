@echo off
REM SmartSolar Local Development Script (Windows Batch)
REM This script runs all services locally without Docker

echo.
echo ================================================
echo   SmartSolar Local Development Setup
echo ================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Running PowerShell script...
    powershell -ExecutionPolicy Bypass -File "%~dp0run-local.ps1"
) else (
    echo PowerShell not found. Please run run-local.ps1 manually.
    pause
    exit /b 1
)

pause
