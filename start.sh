#!/bin/bash

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}${BOLD} ========================================"
echo "   RESTORAN BOSHQARUV TIZIMI"
echo -e " ========================================${NC}"
echo ""

# ---- Python tekshirish ----
if ! command -v python3 &> /dev/null; then
    echo -e "${RED} [XATO] Python3 topilmadi! https://python.org dan yuklab oling.${NC}"
    exit 1
fi

# ---- Node.js tekshirish ----
if ! command -v node &> /dev/null; then
    echo -e "${RED} [XATO] Node.js topilmadi! https://nodejs.org dan yuklab oling.${NC}"
    exit 1
fi

# ---- PostgreSQL yoki SQLite tanlash ----
USE_SQLITE="false"
if ! command -v pg_isready &> /dev/null || ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW} [OGOHLANTIRISH] PostgreSQL topilmadi yoki ishlamayapti!${NC}"
    echo ""
    echo "  [1] SQLite ishlatish  (tez, o'rnatish shart emas)"
    echo "  [2] Chiqish va PostgreSQL o'rnatish"
    echo ""
    read -p "  Tanlovingiz (1 yoki 2): " db_choice
    if [ "$db_choice" == "1" ]; then
        USE_SQLITE="true"
        echo -e "${GREEN} [OK] SQLite tanlandi.${NC}"
    else
        echo "  PostgreSQL: https://www.postgresql.org/download"
        exit 1
    fi
else
    echo -e "${GREEN} [OK] PostgreSQL ulandi.${NC}"
fi
echo ""

# ---- .env fayl ----
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW} [INFO] .env fayl topilmadi, yaratilmoqda...${NC}"
    cp backend/.env.example backend/.env
    echo ""
    echo -e "${YELLOW} [MUHIM] backend/.env faylini tahrirlang:${NC}"
    echo "   DB_NAME, DB_USER, DB_PASSWORD ni o'rnating"
    echo ""

    # Redaktorda ochish
    if command -v nano &> /dev/null; then
        read -p " nano da ochishni xohlaysizmi? (y/n): " open_env
        [[ "$open_env" == "y" ]] && nano backend/.env
    elif command -v open &> /dev/null; then
        open backend/.env
    fi

    echo ""
    read -p " .env tayyor bo'lgach Enter bosing..."
fi

# ---- Script papkasi ----
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Virtual muhit ----
if [ ! -d "backend/venv" ]; then
    echo -e "${CYAN} [1/5] Virtual muhit yaratilmoqda...${NC}"
    python3 -m venv backend/venv
fi

# ---- Backend paketlar ----
echo -e "${CYAN} [2/5] Backend paketlari tekshirilmoqda...${NC}"
source backend/venv/bin/activate
pip install -r backend/requirements.txt -q --disable-pip-version-check
echo -e "${GREEN} [OK] Backend paketlari tayyor.${NC}"

# ---- Migrations ----
echo -e "${CYAN} [3/5] Ma'lumotlar bazasi sozlanmoqda...${NC}"
cd backend
python manage.py makemigrations --noinput > /dev/null 2>&1
python manage.py migrate --noinput
cd ..
echo -e "${GREEN} [OK] Baza tayyor.${NC}"

# ---- Frontend paketlar ----
echo -e "${CYAN} [4/5] Frontend paketlari tekshirilmoqda...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    cd frontend
    npm install --silent
    cd ..
fi
echo -e "${GREEN} [OK] Frontend paketlari tayyor.${NC}"

# ---- PID fayllar uchun papka ----
mkdir -p .pids

# ---- Backend ishga tushirish ----
echo -e "${CYAN} [5/5] Serverlar ishga tushirilmoqda...${NC}"
source backend/venv/bin/activate
cd backend
python manage.py runserver > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.pids/backend.pid
cd ..

# ---- Log papka ----
mkdir -p logs

# Backend qayta ishga tushirish (log papka bo'lmaganda xato bo'lishi mumkin)
kill $BACKEND_PID > /dev/null 2>&1
source backend/venv/bin/activate
cd backend
python manage.py runserver > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.pids/backend.pid
cd ..

# 2 soniya kutish
sleep 2

# ---- Frontend ishga tushirish ----
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.pids/frontend.pid
cd ..

# 3 soniya kutish
sleep 3

echo ""
echo -e "${GREEN}${BOLD} ========================================"
echo "   SERVERLAR ISHGA TUSHDI!"
echo -e " ========================================${NC}"
echo ""
echo -e "  ${BOLD}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BOLD}Backend:${NC}   http://localhost:8000"
echo -e "  ${BOLD}Admin:${NC}     http://localhost:8000/admin"
echo -e "  ${BOLD}API Docs:${NC}  http://localhost:8000/api/docs"
echo ""
echo -e "  Backend PID:  ${BACKEND_PID}"
echo -e "  Frontend PID: ${FRONTEND_PID}"
echo ""

# ---- Brauzer ochish ----
if command -v open &> /dev/null; then
    open http://localhost:3000          # Mac
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000      # Linux
fi

echo -e "${YELLOW} Dasturni to'xtatish uchun: ./stop.sh${NC}"
echo ""
echo -e " Loglarni ko'rish:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
