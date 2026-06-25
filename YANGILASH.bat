@echo off
title Restoran - Yangilanmoqda...
cd /d "%~dp0"

:: ===== AVVAL TO'XTATISH =====
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq BACKEND" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FRONTEND" /F >nul 2>&1
timeout /t 2 /nobreak >nul

:: ===== GITHUB DAN YANGI KOD OLISH =====
git pull origin main >nul 2>&1

:: ===== BACKEND PAKETLARNI YANGILASH =====
call backend\venv\Scripts\activate.bat >nul 2>&1
pip install -r backend\requirements.txt -q --disable-pip-version-check >nul 2>&1

:: ===== YANGI MIGRATIONLAR =====
cd backend
python manage.py makemigrations --noinput >nul 2>&1
python manage.py migrate --noinput >nul 2>&1
cd ..

:: ===== FRONTEND PAKETLARNI YANGILASH =====
cd frontend
npm install --legacy-peer-deps --silent >nul 2>&1
cd ..

:: ===== QAYTA ISHGA TUSHIRISH =====
set BACK=%~dp0backend
start /min "BACKEND" cmd /c "cd /d "%BACK%" && venv\Scripts\activate && python manage.py runserver"
timeout /t 4 /nobreak >nul

set FRONT=%~dp0frontend
start /min "FRONTEND" cmd /c "cd /d "%FRONT%" && npm run dev"
timeout /t 6 /nobreak >nul

start http://localhost:3000
exit
