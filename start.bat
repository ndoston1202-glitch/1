@echo off
setlocal enabledelayedexpansion
title Restoran Boshqaruv Tizimi
color 0A

echo.
echo  ============================================
echo    RESTORAN BOSHQARUV TIZIMI
echo  ============================================
echo.

:: ---- setup.bat ishga tushirilganmi tekshirish ----
if not exist "backend\venv" (
    echo  [INFO] Birinchi marta ishga tushirilmoqda...
    echo  Sozlash boshlanmoqda, kuting...
    echo.
    call setup.bat
)

:: ---- .env yo'q bo'lsa avtomatik yaratish ----
if not exist "backend\.env" (
    (
    echo SECRET_KEY=django-insecure-restoran-boshqaruv-tizimi-2024
    echo DEBUG=True
    echo ALLOWED_HOSTS=*
    echo.
    echo USE_SQLITE=true
    echo.
    echo DB_NAME=restaurant_db
    echo DB_USER=postgres
    echo DB_PASSWORD=postgres
    echo DB_HOST=localhost
    echo DB_PORT=5432
    echo.
    echo CORS_ALLOWED_ORIGINS=http://localhost:3000
    ) > backend\.env
)

:: ---- node_modules yo'q bo'lsa o'rnatish ----
if not exist "frontend\node_modules" (
    echo  [INFO] Frontend paketlari o'rnatilmoqda...
    cd frontend
    call npm install --silent
    cd ..
)

:: ---- Logs papkasi ----
if not exist "logs" mkdir logs

:: ---- Backend migration (yangilanishlar bo'lsa) ----
echo  [1/2] Backend ishga tushirilmoqda...
call backend\venv\Scripts\activate.bat
cd backend
python manage.py migrate --noinput >nul 2>&1
cd ..

:: ---- Eski processlarni to'xtatish (port band bo'lsa) ----
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: ---- Backend ishga tushirish ----
start "Backend - Django :8000" /min cmd /c "cd backend && venv\Scripts\activate && python manage.py runserver 2>&1 | tee ..\logs\backend.log"
echo  [OK] Backend ishga tushdi

:: ---- 3 soniya kutish ----
timeout /t 3 /nobreak >nul

:: ---- Frontend ishga tushirish ----
echo  [2/2] Frontend ishga tushirilmoqda...
start "Frontend - React :3000" /min cmd /c "cd frontend && npm run dev 2>&1 | tee ..\logs\frontend.log"
echo  [OK] Frontend ishga tushdi

:: ---- 4 soniya kutib brauzer ochish ----
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo  ============================================
echo    DASTUR ISHGA TUSHDI!
echo  ============================================
echo.
echo   Brauzer: http://localhost:3000
echo   Admin:   http://localhost:8000/admin
echo.
echo   Login:   admin
echo   Parol:   admin123
echo.
echo   Dasturni toxtatish uchun: stop.bat
echo  ============================================
echo.
pause
