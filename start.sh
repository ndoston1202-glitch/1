#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD} ========================================"
echo "   RESTORAN BOSHQARUV TIZIMI"
echo -e " ========================================${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Python tekshirish ----
if ! command -v python3 &>/dev/null; then
    echo -e "${RED} [XATO] Python3 topilmadi!${NC}"
    exit 1
fi

# ---- Node.js tekshirish ----
if ! command -v node &>/dev/null; then
    echo -e "${RED} [XATO] Node.js topilmadi!${NC}"
    exit 1
fi

# ---- .env avtomatik yaratish ----
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
SECRET_KEY=django-insecure-restoran-boshqaruv-tizimi-2024
DEBUG=True
ALLOWED_HOSTS=*

USE_SQLITE=true

DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo -e "${GREEN} [OK] .env fayl yaratildi (SQLite)${NC}"
fi

# ---- Virtual muhit ----
if [ ! -d "backend/venv" ]; then
    echo -e "${CYAN} Virtual muhit yaratilmoqda...${NC}"
    python3 -m venv backend/venv
fi

source backend/venv/bin/activate

# ---- Paketlar ----
echo -e "${CYAN} [1/3] Backend paketlari tekshirilmoqda...${NC}"
pip install -r backend/requirements.txt -q --disable-pip-version-check
echo -e "${GREEN} [OK] Tayyor${NC}"

# ---- Migrations ----
echo -e "${CYAN} [2/3] Baza yangilanmoqda...${NC}"
cd backend
python manage.py migrate --noinput > /dev/null 2>&1

# Admin yaratish
python manage.py shell -c "
from django.contrib.auth import get_user_model
U = get_user_model()
if not U.objects.filter(username='admin').exists():
    U.objects.create_superuser('admin','admin@restoran.uz','admin123', first_name='Admin', last_name='User', role='admin')
    print('Admin yaratildi')
" 2>/dev/null

cd ..
echo -e "${GREEN} [OK] Tayyor${NC}"

# ---- Frontend ----
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${CYAN} Frontend paketlari o'rnatilmoqda...${NC}"
    cd frontend && npm install --silent && cd ..
fi

mkdir -p logs

# ---- Eski processlarni o'ldirish ----
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# ---- Backend ishga tushirish ----
echo -e "${CYAN} [3/3] Serverlar ishga tushirilmoqda...${NC}"
source backend/venv/bin/activate
cd backend
python manage.py runserver > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN} [OK] Backend ishga tushdi (PID: $BACKEND_PID)${NC}"

sleep 2

# ---- Frontend ishga tushirish ----
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN} [OK] Frontend ishga tushdi (PID: $FRONTEND_PID)${NC}"

sleep 3

# ---- Brauzer ochish ----
if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:3000
elif command -v open &>/dev/null; then
    open http://localhost:3000
fi

echo ""
echo -e "${GREEN}${BOLD} ========================================"
echo "   DASTUR ISHGA TUSHDI!"
echo -e " ========================================${NC}"
echo ""
echo -e "  Brauzer:  http://localhost:3000"
echo -e "  Admin:    http://localhost:8000/admin"
echo ""
echo -e "  Login:    admin"
echo -e "  Parol:    admin123"
echo ""
echo -e "${YELLOW}  To'xtatish uchun: ./stop.sh${NC}"
echo ""
