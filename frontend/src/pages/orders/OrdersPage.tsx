import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../services/api'
import { ShoppingBag, Bike, UtensilsCrossed } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import DineInOrders from './DineInOrders'
import TakeawayOrders from './TakeawayOrders'
import RemoteOrders from './RemoteOrders'

const TABS = [
  { key: 'dine_in',   label: 'Stol',         icon: UtensilsCrossed, color: 'text-amber-600',  bg: 'bg-amber-500' },
  { key: 'takeaway',  label: 'Olib ketish',   icon: ShoppingBag,     color: 'text-blue-600',   bg: 'bg-blue-500'  },
  { key: 'delivery',  label: 'Masofadan',     icon: Bike,            color: 'text-green-600',  bg: 'bg-green-500' },
]

export default function OrdersPage() {
  const [tab, setTab] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')

  const { data } = useQuery({
    queryKey: ['orders-count'],
    queryFn: async () => {
      const r = await ordersApi.getOrders({})
      return r.data
    },
    refetchInterval: 15000,
  })

  const allActive = data?.results || data || []

  const countByType = (type: string) =>
    allActive.filter((o: any) => o.order_type === type).length

  return (
    <div className="space-y-5">
      {/* 3 ta tab */}
      <div className="grid grid-cols-3 gap-4">
        {TABS.map(({ key, label, icon: Icon, color, bg }) => {
          const count = countByType(key)
          const isActive = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                isActive
                  ? `${bg} text-white border-transparent shadow-lg scale-[1.02]`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isActive ? 'bg-white/20' : `bg-gray-50`
              }`}>
                <Icon size={24} className={isActive ? 'text-white' : color} />
              </div>
              <div>
                <p className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-800'}`}>
                  {label}
                </p>
                {count > 0 && (
                  <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {count} ta faol
                  </p>
                )}
              </div>
              {count > 0 && (
                <span className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-white text-amber-600' : `${bg} text-white`
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'dine_in'  && <DineInOrders />}
      {tab === 'takeaway' && <TakeawayOrders />}
      {tab === 'delivery' && <RemoteOrders />}
    </div>
  )
}
