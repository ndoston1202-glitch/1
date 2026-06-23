@echo off
title Dasturni to'xtatish
color 0C

echo.
echo  ========================================
echo   DASTUR TO'XTATILMOQDA...
echo  ========================================
echo.

:: Django serverni to'xtatish
echo  [1/2] Backend (Django) to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo  [OK] Backend to'xtatildi. (PID: %%a)
)

:: Vite (React) serverni to'xtatish
echo  [2/2] Frontend (React) to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo  [OK] Frontend to'xtatildi. (PID: %%a)
)

:: Node.js processlari tozalash (qolgan bo'lsa)
taskkill /IM "node.exe" /F >nul 2>&1

echo.
echo  ========================================
echo   BARCHA SERVERLAR TO'XTATILDI!
echo  ========================================
echo.
timeout /t 2 /nobreak >nul
