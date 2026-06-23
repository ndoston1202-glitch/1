@echo off
title Dasturni to'xtatish
color 0C

echo.
echo  ============================================
echo    DASTUR TO'XTATILMOQDA...
echo  ============================================
echo.

echo  Backend (port 8000) to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo  Frontend (port 3000) to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo  [OK] Barcha serverlar to'xtatildi!
echo.
timeout /t 2 /nobreak >nul
