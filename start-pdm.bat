@echo off
title Islamic Bank Mudaraba PDM & Pool Simulator
echo ================================================================================
echo   ISLAMIC BANK MUDARABA PDM ^& POOL MANAGEMENT COMMAND SCRIPT
echo ================================================================================
echo.
echo [1/2] Running Command-Line Simulation Verification (12 Scenarios + Waterfall)...
node "%~dp0pdm-cli.js" --all-scenarios
echo.
echo [2/2] Starting Multi-Page Web Application on http://localhost:3088 ...
start "" "http://localhost:3088/dashboard.html"
node "%~dp0server.js"
pause
