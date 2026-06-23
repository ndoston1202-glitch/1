# 🍽️ Restoran Boshqaruv Tizimi

Django REST API + React (TypeScript) + PostgreSQL

---

## 🚀 Ishga tushirish

### Backend

```bash
cd backend

# Virtual muhit yaratish
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Paketlarni o'rnatish
pip install -r requirements.txt

# .env fayl yaratish
cp .env.example .env
# .env ichidagi ma'lumotlarni to'ldiring

# Ma'lumotlar bazasini sozlash (PostgreSQL)
createdb restaurant_db

# Migrationlarni ishga tushirish
python manage.py makemigrations
python manage.py migrate

# Superuser yaratish
python manage.py createsuperuser

# Serverni ishga tushirish
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Paketlarni o'rnatish
npm install

# Ishga tushirish
npm run dev
```

---

## 📡 API Endpoints

| Modul | URL |
|-------|-----|
| Auth | `/api/auth/` |
| Menyu | `/api/menu/` |
| Stollar | `/api/tables/` |
| Buyurtmalar | `/api/orders/` |
| To'lovlar | `/api/payments/` |
| Oshxona | `/api/kitchen/` |
| Xodimlar | `/api/staff/` |
| Hisobotlar | `/api/reports/` |
| Yetkazib berish | `/api/delivery/` |
| API Docs | `/api/docs/` |
| Admin | `/admin/` |

---

## 👥 Rollar

| Rol | Huquqlar |
|-----|----------|
| Admin | Hamma narsaga kirish |
| Manager | Boshqaruv + hisobotlar |
| Waiter | Buyurtma + stollar |
| Cashier | Kassa + to'lovlar |
| Chef | Oshxona paneli |
| Delivery | Yetkazib berish |

---

## 🛠️ Texnologiyalar

**Backend:** Python 3.11, Django 4.2, DRF, JWT, PostgreSQL

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Query, Zustand, Recharts
