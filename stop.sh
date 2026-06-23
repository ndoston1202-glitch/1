#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${RED}${BOLD} ========================================"
echo "   DASTUR TO'XTATILMOQDA..."
echo -e " ========================================${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$SCRIPT_DIR/.pids"

# ---- Backend to'xtatish ----
echo -e "${CYAN} [1/2] Backend (Django) to'xtatilmoqda...${NC}"
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        echo -e "${GREEN} [OK] Backend to'xtatildi. (PID: $BACKEND_PID)${NC}"
    else
        echo " [INFO] Backend allaqachon to'xtatilgan."
    fi
    rm -f "$PID_DIR/backend.pid"
else
    # PID fayl yo'q — port orqali topamiz
    BACKEND_PID=$(lsof -ti:8000)
    if [ -n "$BACKEND_PID" ]; then
        kill -9 "$BACKEND_PID"
        echo -e "${GREEN} [OK] Backend to'xtatildi. (PID: $BACKEND_PID)${NC}"
    else
        echo " [INFO] Port 8000 da ishlaydigan server topilmadi."
    fi
fi

# ---- Frontend to'xtatish ----
echo -e "${CYAN} [2/2] Frontend (React/Vite) to'xtatilmoqda...${NC}"
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        echo -e "${GREEN} [OK] Frontend to'xtatildi. (PID: $FRONTEND_PID)${NC}"
    else
        echo " [INFO] Frontend allaqachon to'xtatilgan."
    fi
    rm -f "$PID_DIR/frontend.pid"
else
    FRONTEND_PID=$(lsof -ti:3000)
    if [ -n "$FRONTEND_PID" ]; then
        kill -9 "$FRONTEND_PID"
        echo -e "${GREEN} [OK] Frontend to'xtatildi. (PID: $FRONTEND_PID)${NC}"
    else
        echo " [INFO] Port 3000 da ishlaydigan server topilmadi."
    fi
fi

# ---- PID papkasini tozalash ----
rm -rf "$PID_DIR"

echo ""
echo -e "${GREEN}${BOLD} ========================================"
echo "   BARCHA SERVERLAR TO'XTATILDI!"
echo -e " ========================================${NC}"
echo ""
