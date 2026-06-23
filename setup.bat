@echo off
setlocal enabledelayedexpansion
title Restoran Tizimi - Sozlash
color 0B

echo.
echo  ============================================
echo    RESTORAN BOSHQARUV TIZIMI - SOZLASH
echo  ============================================
echo.

:: ---- Python tekshirish ----
echo  [1/5] Python tekshirilmoqda...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [XATO] Python topilmadi!
    echo  Quyidagi havoladan yuklab o'rnating:
    echo  https://www.python.org/downloads/
    echo.
    echo  O'rnatishda "Add Python to PATH" ni belgilang!
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo  [OK] %%v

:: ---- Node.js tekshirish ----
echo  [2/5] Node.js tekshirilmoqda...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [XATO] Node.js topilmadi!
    echo  Quyidagi havoladan yuklab o'rnating:
    echo  https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo  [OK] Node.js %%v

:: ---- .env fayl yaratish (avtomatik, SQLite) ----
echo  [3/5] Sozlamalar fayili yaratilmoqda...
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
echo  [OK] .env fayl tayyor (SQLite ishlatiladi)

:: ---- Virtual muhit ----
echo  [4/5] Backend o'rnatilmoqda...
if not exist "backend\venv" (
    echo       Virtual muhit yaratilmoqda...
    python -m venv backend\venv
    if errorlevel 1 (
        echo  [XATO] Virtual muhit yaratilmadi!
        pause & exit /b 1
    )
)

call backend\venv\Scripts\activate.bat

echo       Paketlar o'rnatilmoqda (bir oz kuting)...
pip install -r backend\requirements.txt -q --disable-pip-version-check
if errorlevel 1 (
    echo  [XATO] Paketlar o'rnatilmadi!
    pause & exit /b 1
)
echo  [OK] Backend paketlari tayyor

:: ---- Migrations ----
echo       Ma'lumotlar bazasi yaratilmoqda...
cd backend
python manage.py makemigrations --noinput >nul 2>&1
python manage.py migrate --noinput
if errorlevel 1 (
    echo  [XATO] Baza yaratilmadi!
    cd ..
    pause & exit /b 1
)

:: ---- Admin user avtomatik yaratish ----
echo       Admin foydalanuvchi yaratilmoqda...
python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); U.objects.filter(username='admin').exists() or U.objects.create_superuser('admin','admin@restoran.uz','admin123', first_name='Admin', last_name='User', role='admin')" >nul 2>&1
echo  [OK] Admin yaratildi: login=admin  parol=admin123
cd ..

:: ---- Frontend ----
echo  [5/5] Frontend o'rnatilmoqda (bir oz kuting)...
if not exist "frontend\node_modules" (
    cd frontend
    call npm install --silent
    if errorlevel 1 (
        echo  [XATO] Frontend paketlar o'rnatilmadi!
        cd ..
        pause & exit /b 1
    )
    cd ..
)
echo  [OK] Frontend tayyor

:: ---- Logs papkasi ----
if not exist "logs" mkdir logs

echo.
echo  ============================================
echo    SOZLASH MUVAFFAQIYATLI YAKUNLANDI!
echo  ============================================
echo.
echo   Kirish ma'lumotlari:
echo   ----------------------------
echo   Login:  admin
echo   Parol:  admin123
echo   ----------------------------
echo.
echo   Dasturni ishga tushirish uchun:
echo   start.bat ga ikki marta bosing!
echo.
pause
