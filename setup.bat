@echo off
setlocal enabledelayedexpansion
title Birinchi marta sozlash
color 0B

echo.
echo  ========================================
echo   RESTORAN TIZIMI - SOZLASH (SETUP)
echo  ========================================
echo.

:: Python tekshirish
python --version >nul 2>&1
if errorlevel 1 (
    echo  [XATO] Python topilmadi!
    echo  https://python.org/downloads dan yuklab o'rnating (3.10+)
    pause & exit /b 1
)

:: Node.js tekshirish
node --version >nul 2>&1
if errorlevel 1 (
    echo  [XATO] Node.js topilmadi!
    echo  https://nodejs.org dan yuklab o'rnating (18+)
    pause & exit /b 1
)

echo  [OK] Python va Node.js mavjud.
echo.

:: ---- PostgreSQL yoki SQLite tanlash ----
set USE_SQLITE=false
pg_isready >nul 2>&1
if errorlevel 1 (
    echo  ----------------------------------------
    echo   PostgreSQL topilmadi!
    echo  ----------------------------------------
    echo.
    echo   [1] SQLite ishlatish  (tez, o'rnatish shart emas)
    echo   [2] PostgreSQL o'rnatish  (professional)
    echo.
    set /p DB_CHOICE=  Tanlovingiz (1 yoki 2): 

    if "!DB_CHOICE!"=="1" (
        set USE_SQLITE=true
        echo  [OK] SQLite tanlandi.
    ) else (
        echo.
        echo  PostgreSQL yuklab olish:
        echo  https://www.postgresql.org/download/windows/
        echo  O'rnatib, qayta ishga tushiring.
        pause & exit /b 1
    )
) else (
    echo  [OK] PostgreSQL topildi.
)
echo.

:: ---- .env sozlash ----
echo  ----------------------------------------
echo   Sozlamalar kiritish
echo  ----------------------------------------
echo.

set DB_NAME=restaurant_db
set DB_USER=postgres
set DB_PASS=postgres

if "!USE_SQLITE!"=="false" (
    set /p DB_NAME=  DB nomi [restaurant_db]: 
    set /p DB_USER=  DB user  [postgres]: 
    set /p DB_PASS=  DB parol [postgres]: 
    if "!DB_NAME!"=="" set DB_NAME=restaurant_db
    if "!DB_USER!"=="" set DB_USER=postgres
    if "!DB_PASS!"=="" set DB_PASS=postgres
)

(
echo SECRET_KEY=django-insecure-restoran-boshqaruv-2024
echo DEBUG=True
echo ALLOWED_HOSTS=*
echo.
echo USE_SQLITE=!USE_SQLITE!
echo.
echo DB_NAME=!DB_NAME!
echo DB_USER=!DB_USER!
echo DB_PASSWORD=!DB_PASS!
echo DB_HOST=localhost
echo DB_PORT=5432
echo.
echo CORS_ALLOWED_ORIGINS=http://localhost:3000
) > backend\.env

echo  [OK] .env fayl saqlandi.
echo.

:: ---- Virtual muhit ----
echo  [1/4] Virtual muhit yaratilmoqda...
if not exist "backend\venv" (
    python -m venv backend\venv
)
echo  [OK] Tayyor.

:: ---- Backend paketlar ----
echo  [2/4] Backend paketlari o'rnatilmoqda...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt -q --disable-pip-version-check
echo  [OK] Tayyor.

:: ---- Migrations ----
echo  [3/4] Ma'lumotlar bazasi yaratilmoqda...
cd backend
python manage.py makemigrations --noinput
python manage.py migrate --noinput
echo.

:: ---- Admin user ----
echo  ----------------------------------------
echo   Admin foydalanuvchi yarating:
echo  ----------------------------------------
python manage.py createsuperuser
cd ..

:: ---- Frontend ----
echo.
echo  [4/4] Frontend paketlari o'rnatilmoqda...
cd frontend
call npm install
cd ..

echo.
echo  ========================================
echo   SOZLASH MUVAFFAQIYATLI YAKUNLANDI!
echo  ========================================
echo.
echo   Endi start.bat ni ishga tushiring!
echo.
pause
