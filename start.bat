@echo off
title Restoran Boshqaruv Tizimi
color 0A

echo.
echo  ========================================
echo   RESTORAN BOSHQARUV TIZIMI
echo  ========================================
echo.

:: ---- Python tekshirish ----
python --version >nul 2>&1
if errorlevel 1 (
    echo  [XATO] Python topilmadi! https://python.org dan yuklab oling.
    pause
    exit /b 1
)

:: ---- Node.js tekshirish ----
node --version >nul 2>&1
if errorlevel 1 (
    echo  [XATO] Node.js topilmadi! https://nodejs.org dan yuklab oling.
    pause
    exit /b 1
)

:: ---- PostgreSQL tekshirish ----
pg_isready >nul 2>&1
if errorlevel 1 (
    echo  [OGOHLANTIRISH] PostgreSQL ishlamayapti yoki topilmadi.
    echo  PostgreSQL ni ishga tushiring va qayta urinib koring.
    pause
    exit /b 1
)

echo  [OK] Barcha talablar mavjud.
echo.

:: ---- .env fayl tekshirish ----
if not exist "backend\.env" (
    echo  [INFO] .env fayl topilmadi, .env.example dan nusxa olinyapti...
    copy "backend\.env.example" "backend\.env" >nul
    echo  [MUHIM] backend\.env faylini oching va DB parolingizni kiriting!
    notepad "backend\.env"
    echo.
    echo  Tayyor bo'lgach, istalgan tugmani bosing...
    pause >nul
)

:: ---- Virtual muhit ----
if not exist "backend\venv" (
    echo  [1/5] Virtual muhit yaratilmoqda...
    python -m venv backend\venv
)

:: ---- Paketlar ----
echo  [2/5] Backend paketlari tekshirilmoqda...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt -q --disable-pip-version-check
echo  [OK] Backend paketlari tayyor.

:: ---- Migrations ----
echo  [3/5] Ma'lumotlar bazasi sozlanmoqda...
cd backend
python manage.py makemigrations --noinput >nul 2>&1
python manage.py migrate --noinput
cd ..
echo  [OK] Baza tayyor.

:: ---- Frontend paketlar ----
echo  [4/5] Frontend paketlari tekshirilmoqda...
if not exist "frontend\node_modules" (
    cd frontend
    npm install --silent
    cd ..
)
echo  [OK] Frontend paketlari tayyor.

:: ---- Ishga tushirish ----
echo  [5/5] Serverlar ishga tushirilmoqda...
echo.
echo  ========================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   Admin:    http://localhost:8000/admin
echo   API Docs: http://localhost:8000/api/docs
echo  ========================================
echo.

:: Backend - alohida oynada
start "Backend - Django" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

:: 2 soniya kutish
timeout /t 2 /nobreak >nul

:: Frontend - alohida oynada
start "Frontend - React" cmd /k "cd frontend && npm run dev"

:: 3 soniya keyin brauzer ochish
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo  [TAYYOR] Brauzer ochildi!
echo  Dasturni toxtatish uchun stop.bat ni ishga tushiring.
echo.
pause
