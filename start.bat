@echo off
setlocal enabledelayedexpansion
title Restoran Boshqaruv Tizimi
color 0A

echo.
echo  ========================================
echo   RESTORAN BOSHQARUV TIZIMI
echo  ========================================
echo.

:: Python tekshirish
python --version >nul 2>&1
if errorlevel 1 (
    echo  [XATO] Python topilmadi!
    pause & exit /b 1
)

:: Node.js tekshirish
node --version >nul 2>&1
if errorlevel 1 (
    echo  [XATO] Node.js topilmadi!
    pause & exit /b 1
)

:: ---- .env fayl tekshirish ----
if not exist "backend\.env" (
    echo  [INFO] .env topilmadi. Avval setup.bat ni ishga tushiring!
    pause & exit /b 1
)

:: USE_SQLITE ni .env dan o'qish
set USE_SQLITE=false
for /f "tokens=1,2 delims==" %%a in (backend\.env) do (
    if "%%a"=="USE_SQLITE" set USE_SQLITE=%%b
)

:: ---- PostgreSQL tekshirish (faqat postgres tanlangan bo'lsa) ----
if "!USE_SQLITE!"=="false" (
    pg_isready >nul 2>&1
    if errorlevel 1 (
        echo  [XATO] PostgreSQL ishlamayapti!
        echo.
        echo  Yechim:
        echo   - PostgreSQL ni ishga tushiring
        echo   - Yoki setup.bat da SQLite tanlang
        pause & exit /b 1
    )
    echo  [OK] PostgreSQL ulandi.
) else (
    echo  [OK] SQLite ishlatilmoqda.
)

echo  [OK] Barcha talablar tayyor.
echo.

:: ---- Virtual muhit tekshirish ----
if not exist "backend\venv" (
    echo  [XATO] Virtual muhit topilmadi!
    echo  Avval setup.bat ni ishga tushiring.
    pause & exit /b 1
)

:: ---- Migration (yangilanishlar bo'lsa) ----
echo  [1/3] Ma'lumotlar bazasi yangilanmoqda...
call backend\venv\Scripts\activate.bat
cd backend
python manage.py migrate --noinput >nul 2>&1
cd ..
echo  [OK] Tayyor.

:: ---- Frontend paketlar ----
echo  [2/3] Frontend tekshirilmoqda...
if not exist "frontend\node_modules" (
    echo  node_modules topilmadi, o'rnatilmoqda...
    cd frontend & npm install --silent & cd ..
)
echo  [OK] Tayyor.

:: ---- Loglar papkasi ----
if not exist "logs" mkdir logs

echo  [3/3] Serverlar ishga tushirilmoqda...
echo.

:: ---- Backend - alohida oynada ----
start "Backend - Django :8000" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver && pause"

:: ---- 2 soniya kutish ----
timeout /t 2 /nobreak >nul

:: ---- Frontend - alohida oynada ----
start "Frontend - React :3000" cmd /k "cd frontend && npm run dev && pause"

:: ---- 4 soniya keyin brauzer ochish ----
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo  ========================================
echo   SERVERLAR ISHGA TUSHDI!
echo  ========================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   Admin:     http://localhost:8000/admin
echo   API Docs:  http://localhost:8000/api/docs
echo.
echo   Dasturni toxtatish uchun: stop.bat
echo.
pause
