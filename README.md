# 🍽️ Restoran Boshqaruv Tizimi

Django REST API + React (TypeScript) + PostgreSQL

---

## 🚀 Ishga tushirish — BIR TUGMA!

### 1-qadam: Birinchi marta sozlash (faqat bir marta)

| OS | Buyruq |
|----|--------|
| **Windows** | `setup.bat` ga ikki marta bosing |
| **Mac/Linux** | `chmod +x setup.sh && ./setup.sh` |

### 2-qadam: Ishga tushirish

| OS | Buyruq |
|----|--------|
| **Windows** | `start.bat` ga ikki marta bosing |
| **Mac/Linux** | `./start.sh` |

### To'xtatish

| OS | Buyruq |
|----|--------|
| **Windows** | `stop.bat` |
| **Mac/Linux** | `./stop.sh` |

### Qayta ishga tushirish

| OS | Buyruq |
|----|--------|
| **Windows** | `restart.bat` |
| **Mac/Linux** | `./restart.sh` |

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
