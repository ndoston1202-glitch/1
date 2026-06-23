@echo off
title Birinchi marta sozlash
color 0B

echo.
echo  ========================================
echo   BIRINCHI MARTA SOZLASH (SETUP)
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

:: .env sozlash
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
)

echo  ----------------------------------------
echo   Ma'lumotlar bazasini sozlang:
echo  ----------------------------------------
echo.
set /p DB_NAME=  DB nomi (default: restaurant_db): 
set /p DB_USER=  DB foydalanuvchisi (default: postgres): 
set /p DB_PASS=  DB paroli: 

if "%DB_NAME%"=="" set DB_NAME=restaurant_db
if "%DB_USER%"=="" set DB_USER=postgres

:: .env yozish
(
echo SECRET_KEY=django-insecure-restoran-secret-key-2024
echo DEBUG=True
echo ALLOWED_HOSTS=*
echo.
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASS%
echo DB_HOST=localhost
echo DB_PORT=5432
echo.
echo CORS_ALLOWED_ORIGINS=http://localhost:3000
) > backend\.env

echo.
echo  [OK] .env fayl saqlandi.

:: Virtual muhit
echo.
echo  [1/4] Virtual muhit yaratilmoqda...
python -m venv backend\venv
echo  [OK] Tayyor.

:: Backend paketlar
echo  [2/4] Backend paketlari o'rnatilmoqda...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt -q
echo  [OK] Tayyor.

:: Migrations
echo  [3/4] Ma'lumotlar bazasi yaratilmoqda...
cd backend
python manage.py makemigrations
python manage.py migrate
echo.

:: Superuser
echo  ----------------------------------------
echo   Admin foydalanuvchi yarating:
echo  ----------------------------------------
python manage.py createsuperuser
cd ..

:: Frontend
echo.
echo  [4/4] Frontend paketlari o'rnatilmoqda...
cd frontend
npm install
cd ..

echo.
echo  ========================================
echo   SOZLASH YAKUNLANDI!
echo  ========================================
echo.
echo  Endi start.bat ni ishga tushiring!
echo.
pause
