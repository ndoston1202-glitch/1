@echo off
cd /d "%~dp0"
title Restoran - Yangilanmoqda...
color 0A

echo ============================================
echo   RESTORAN - YANGILANMOQDA
echo ============================================
echo.

:: ===== SERVERLARNI TO'XTATISH =====
echo [1/6] Eski serverlar to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 /nobreak >nul

:: ===== GITHUB DAN YANGI KOD =====
echo [2/6] GitHub dan yangi kod yuklanmoqda...
git fetch origin main >nul 2>&1
git reset --hard origin/main >nul 2>&1

:: ===== .ENV =====
(
echo SECRET_KEY=django-insecure-restoran-boshqaruv-tizimi-2024
echo DEBUG=True
echo ALLOWED_HOSTS=*
echo USE_SQLITE=true
echo DB_NAME=restaurant_db
echo DB_USER=postgres
echo DB_PASSWORD=postgres
echo DB_HOST=localhost
echo DB_PORT=5432
echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
) > .env

:: ===== VIRTUAL MUHIT =====
echo [3/6] Backend tayyorlanmoqda...
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat >nul 2>&1
pip install -r requirements.txt -q --disable-pip-version-check

:: ===== BAZA =====
echo [4/6] Baza yangilanmoqda...
python manage.py migrate --run-syncdb >nul 2>&1
python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); U.objects.filter(username='admin').exists() or U.objects.create_superuser('admin','admin@restoran.uz','admin123',first_name='Admin',last_name='User',role='admin')" >nul 2>&1

:: ===== FRONTEND =====
echo [5/6] Frontend tayyorlanmoqda (bir oz kuting)...
cd frontend
if not exist "node_modules\.bin\vite.cmd" (
    echo        npm install bajarilmoqda...
    call npm install --legacy-peer-deps
)
cd ..

:: ===== SERVERLARNI ISHGA TUSHIRISH =====
echo [6/6] Serverlar ishga tushirilmoqda...
set ROOT=%~dp0
start /min "BACKEND" cmd /c "cd /d "%ROOT%" && venv\Scripts\activate && python manage.py runserver"
timeout /t 4 /nobreak >nul

start /min "FRONTEND" cmd /c "cd /d "%ROOT%frontend" && npm run dev"
timeout /t 8 /nobreak >nul

start http://localhost:3000

echo.
echo ============================================
echo   TAYYOR! Brauzer ochilmoqda...
echo   Login: admin  Parol: admin123
echo ============================================
timeout /t 3 /nobreak >nul
exit
