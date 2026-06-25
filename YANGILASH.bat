@echo off
title Restoran - Yangilanmoqda...
cd /d "%~dp0"

echo Serverlar to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
timeout /t 2 /nobreak >nul

echo GitHub dan yangi kod yuklanmoqda...
git fetch origin main >nul 2>&1
git reset --hard origin/main >nul 2>&1
echo [OK] Yangi kod yuklandi!

echo Backend paketlari yangilanmoqda...
call backend\venv\Scripts\activate.bat >nul 2>&1
pip install -r backend\requirements.txt -q --disable-pip-version-check >nul 2>&1

echo Baza yangilanmoqda...
cd backend
python manage.py migrate --run-syncdb >nul 2>&1
cd ..
echo [OK] Baza tayyor!

echo Frontend yangilanmoqda...
cd frontend
npm install --legacy-peer-deps --silent >nul 2>&1
cd ..

echo Serverlar ishga tushirilmoqda...
set BACK=%~dp0backend
start /min "BACKEND" cmd /c "cd /d "%BACK%" && venv\Scripts\activate && python manage.py runserver"
timeout /t 4 /nobreak >nul

set FRONT=%~dp0frontend
start /min "FRONTEND" cmd /c "cd /d "%FRONT%" && npm run dev"
timeout /t 6 /nobreak >nul

start http://localhost:3000
exit
