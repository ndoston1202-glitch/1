@echo off
title Restoran Boshqaruv Tizimi
cd /d "%~dp0"

:: ===== BIRINCHI MARTA O'RNATISH =====
if not exist "backend\venv" (
    color 0B
    echo O'rnatilmoqda, kuting...
    python -m venv backend\venv >nul 2>&1
    call backend\venv\Scripts\activate.bat >nul 2>&1
    pip install -r backend\requirements.txt -q --disable-pip-version-check >nul 2>&1
)

:: ===== .ENV =====
(
echo SECRET_KEY=django-insecure-restoran-2024
echo DEBUG=True
echo ALLOWED_HOSTS=*
echo USE_SQLITE=true
echo DB_NAME=restaurant_db
echo DB_USER=postgres
echo DB_PASSWORD=postgres
echo DB_HOST=localhost
echo DB_PORT=5432
echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
) > backend\.env

:: ===== FRONTEND PAKETLAR =====
if not exist "frontend\node_modules" (
    echo Frontend o'rnatilmoqda, kuting (3-5 daqiqa)...
    cd frontend
    npm install --legacy-peer-deps --silent >nul 2>&1
    cd ..
)

:: ===== BAZA =====
call backend\venv\Scripts\activate.bat >nul 2>&1
cd backend
python manage.py makemigrations --noinput >nul 2>&1
python manage.py migrate --noinput >nul 2>&1
python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); U.objects.filter(username='admin').exists() or U.objects.create_superuser('admin','admin@restoran.uz','admin123',first_name='Admin',last_name='User',role='admin')" >nul 2>&1
cd ..

:: ===== PORTLARNI TOZALASH =====
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

:: ===== BACKEND - KO'RINMAS ISHGA TUSHIRISH =====
set BACK=%~dp0backend
start /min "BACKEND" cmd /c "cd /d "%BACK%" && venv\Scripts\activate && python manage.py runserver >nul 2>&1"

:: ===== 4 SONIYA KUTISH =====
timeout /t 4 /nobreak >nul

:: ===== FRONTEND - KO'RINMAS ISHGA TUSHIRISH =====
set FRONT=%~dp0frontend
start /min "FRONTEND" cmd /c "cd /d "%FRONT%" && npm run dev >nul 2>&1"

:: ===== 6 SONIYA KUTIB BRAUZER OCHISH =====
timeout /t 6 /nobreak >nul
start http://localhost:3000

exit
