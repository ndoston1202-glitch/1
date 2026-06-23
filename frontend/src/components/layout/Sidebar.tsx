import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, UtensilsCrossed, Grid3X3, ClipboardList,
  ChefHat, CreditCard, Users, BarChart3, Bike, LogOut
} from 'lucide-react'

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'waiter', 'cashier', 'chef', 'delivery'] },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menyu', roles: ['admin', 'manager'] },
  { to: '/tables', icon: Grid3X3, label: 'Stollar', roles: ['admin', 'manager', 'waiter'] },
  { to: '/orders', icon: ClipboardList, label: 'Buyurtmalar', roles: ['admin', 'manager', 'waiter', 'cashier'] },
  { to: '/kitchen', icon: ChefHat, label: 'Oshxona', roles: ['admin', 'manager', 'chef'] },
  { to: '/cashier', icon: CreditCard, label: 'Kassa', roles: ['admin', 'manager', 'cashier'] },
  { to: '/staff', icon: Users, label: 'Xodimlar', roles: ['admin', 'manager'] },
  { to: '/reports', icon: BarChart3, label: 'Hisobotlar', roles: ['admin', 'manager'] },
  { to: '/delivery', icon: Bike, label: 'Yetkazib berish', roles: ['admin', 'manager', 'delivery'] },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const role = user?.role || 'waiter'

  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Restoran</h1>
            <p className="text-xs text-gray-400">Boshqaruv tizimi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full transition-colors"
        >
          <LogOut size={16} /> Chiqish
        </button>
      </div>
    </aside>
  )
}
