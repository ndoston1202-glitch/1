@echo off
setlocal enabledelayedexpansion
title Restoran Boshqaruv Tizimi
color 0A
cd /d "%~dp0"

echo.
echo  ============================================
echo    RESTORAN BOSHQARUV TIZIMI
echo  ============================================
echo.

:: ====== PYTHON ======
echo  [1/6] Python tekshirilmoqda...
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [XATO] Python topilmadi!
    echo  https://www.python.org/downloads/ dan yuklab o'rnating
    pause & exit /b 1
)
echo  [OK] Python mavjud

:: ====== NODE.JS ======
echo  [2/6] Node.js tekshirilmoqda...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [XATO] Node.js topilmadi!
    echo  https://nodejs.org/ dan yuklab o'rnating
    pause & exit /b 1
)
echo  [OK] Node.js mavjud

:: ====== .ENV FAYL ======
echo  [3/6] Sozlamalar yaratilmoqda...
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
echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
) > backend\.env
echo  [OK] .env fayl tayyor

:: ====== VIRTUAL MUHIT ======
echo  [4/6] Backend o'rnatilmoqda...
if not exist "backend\venv" (
    echo       Virtual muhit yaratilmoqda...
    python -m venv backend\venv
)
call backend\venv\Scripts\activate.bat

echo       Paketlar o'rnatilmoqda (bir oz kuting)...
pip install -r backend\requirements.txt -q --disable-pip-version-check
echo  [OK] Backend paketlari tayyor

:: ====== MIGRATIONS ======
echo       Baza sozlanmoqda...
cd backend
python manage.py makemigrations --noinput >nul 2>&1
python manage.py migrate --noinput >nul 2>&1
python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); U.objects.filter(username='admin').exists() or U.objects.create_superuser('admin','admin@restoran.uz','admin123',first_name='Admin',last_name='User',role='admin')" >nul 2>&1
cd ..
echo  [OK] Baza tayyor

:: ====== FRONTEND ======
echo  [5/6] Frontend o'rnatilmoqda...
if not exist "frontend\node_modules" (
    echo       npm install bajarilmoqda (2-3 daqiqa kuting)...
    cd frontend
    call npm install
    cd ..
)
echo  [OK] Frontend tayyor

:: ====== PORTLARNI TOZALASH ======
echo  [6/6] Serverlar ishga tushirilmoqda...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 /nobreak >nul

:: ====== BACKEND - ALOHIDA OYNADA ======
start "BACKEND - Django :8000" cmd /k "color 0B && cd /d "%~dp0backend" && venv\Scripts\activate && echo. && echo  ===  BACKEND ISHLAMOQDA === && echo  http://localhost:8000 && echo. && python manage.py runserver"

echo  [OK] Backend ishga tushirildi
timeout /t 4 /nobreak >nul

:: ====== FRONTEND - ALOHIDA OYNADA ======
start "FRONTEND - Vite :3000" cmd /k "color 0E && cd /d "%~dp0frontend" && echo. && echo  ===  FRONTEND ISHLAMOQDA === && echo  http://localhost:3000 && echo. && npm run dev"

echo  [OK] Frontend ishga tushirildi
timeout /t 6 /nobreak >nul

:: ====== BRAUZER ======
start http://localhost:3000

echo.
echo  ============================================
echo    DASTUR ISHGA TUSHDI!
echo  ============================================
echo.
echo   Brauzer:  http://localhost:3000
echo   Backend:  http://localhost:8000
echo   Admin:    http://localhost:8000/admin
echo.
echo   Login:    admin
echo   Parol:    admin123
echo.
echo   DIQQAT: Ochilgan 2 ta qora oynani YOPMANG!
echo   (BACKEND va FRONTEND oynalari)
echo.
echo   Toxtatish uchun: TOXTAT.bat
echo  ============================================
echo.
pause
