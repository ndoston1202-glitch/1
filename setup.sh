#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD} ========================================"
echo "   BIRINCHI MARTA SOZLASH (SETUP)"
echo -e " ========================================${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Talablar tekshirish ----
echo -e "${CYAN} Talablar tekshirilmoqda...${NC}"

if ! command -v python3 &>/dev/null; then
    echo -e "${RED} [XATO] Python3 topilmadi! https://python.org${NC}"; exit 1
fi
if ! command -v node &>/dev/null; then
    echo -e "${RED} [XATO] Node.js topilmadi! https://nodejs.org${NC}"; exit 1
fi
if ! command -v psql &>/dev/null; then
    echo -e "${YELLOW} [OGOHLANTIRISH] psql topilmadi. PostgreSQL o'rnatilganligini tekshiring.${NC}"
fi

echo -e "${GREEN} [OK] Talablar mavjud.${NC}"
echo ""

# ---- .env sozlash ----
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
fi

echo -e "${CYAN}${BOLD} Ma'lumotlar bazasini sozlang:${NC}"
echo ""
read -p "  DB nomi       [restaurant_db]: " DB_NAME
read -p "  DB foydalanuvchi  [postgres]: " DB_USER
read -s -p "  DB paroli              : " DB_PASS
echo ""

DB_NAME="${DB_NAME:-restaurant_db}"
DB_USER="${DB_USER:-postgres}"

# .env faylga yozish
cat > backend/.env << EOF
SECRET_KEY=django-insecure-restoran-secret-key-2024
DEBUG=True
ALLOWED_HOSTS=*

DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000
EOF

echo -e "${GREEN} [OK] .env fayl saqlandi.${NC}"
echo ""

# ---- PostgreSQL da baza yaratish ----
echo -e "${CYAN} [1/4] PostgreSQL baza yaratilmoqda...${NC}"
psql -U postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null \
    && echo -e "${GREEN} [OK] Baza yaratildi: ${DB_NAME}${NC}" \
    || echo -e "${YELLOW} [INFO] Baza allaqachon mavjud yoki yaratib bo'lmadi.${NC}"

# ---- Virtual muhit ----
echo -e "${CYAN} [2/4] Virtual muhit yaratilmoqda...${NC}"
python3 -m venv backend/venv
source backend/venv/bin/activate
echo -e "${GREEN} [OK] Tayyor.${NC}"

# ---- Backend paketlar ----
echo -e "${CYAN} [3/4] Backend paketlari o'rnatilmoqda...${NC}"
pip install -r backend/requirements.txt -q
echo -e "${GREEN} [OK] Tayyor.${NC}"

# ---- Migrations ----
echo -e "${CYAN} Ma'lumotlar bazasi migrationlari...${NC}"
cd backend
python manage.py makemigrations
python manage.py migrate
echo ""

# ---- Superuser ----
echo -e "${YELLOW}${BOLD} Admin foydalanuvchi yarating:${NC}"
python manage.py createsuperuser
cd ..

# ---- Frontend ----
echo ""
echo -e "${CYAN} [4/4] Frontend paketlari o'rnatilmoqda...${NC}"
cd frontend && npm install --silent && cd ..
echo -e "${GREEN} [OK] Tayyor.${NC}"

# ---- Ruxsat berish ----
chmod +x start.sh stop.sh

echo ""
echo -e "${GREEN}${BOLD} ========================================"
echo "   SOZLASH YAKUNLANDI!"
echo -e " ========================================${NC}"
echo ""
echo -e "  Endi ishga tushirish uchun:  ${BOLD}./start.sh${NC}"
echo ""
