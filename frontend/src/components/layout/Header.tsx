import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/menu': 'Menyu boshqaruvi',
  '/tables': 'Stollar',
  '/orders': 'Buyurtmalar',
  '/kitchen': 'Oshxona paneli',
  '/cashier': 'Kassa',
  '/staff': 'Xodimlar',
  '/reports': 'Hisobotlar',
  '/delivery': 'Yetkazib berish',
}

export default function Header() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const title = pageTitles[pathname] || 'Boshqaruv paneli'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </header>
  )
}
