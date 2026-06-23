import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { TrendingUp, ShoppingBag, Users, Star } from 'lucide-react'

const PERIODS = [
  { value: 'daily', label: 'Bugun' },
  { value: 'weekly', label: 'Hafta' },
  { value: 'monthly', label: 'Oy' },
]

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-report', period],
    queryFn: () => reportsApi.getSales(period).then(r => r.data),
  })

  const { data: ordersReport } = useQuery({
    queryKey: ['orders-report', period],
    queryFn: () => reportsApi.getOrders(period).then(r => r.data),
  })

  const { data: topMenu } = useQuery({
    queryKey: ['top-menu'],
    queryFn: () => reportsApi.getTopMenu({ limit: 10 }).then(r => r.data),
  })

  const { data: staffReport } = useQuery({
    queryKey: ['staff-report'],
    queryFn: () => reportsApi.getStaff().then(r => r.data),
  })

  if (salesLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${period === p.value ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Daromad</p>
            <p className="text-xl font-bold">{Number(sales?.total_revenue || 0).toLocaleString()} so'm</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Buyurtmalar</p>
            <p className="text-xl font-bold">{ordersReport?.total_orders || 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Star size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">O'rtacha buyurtma</p>
            <p className="text-xl font-bold">{Number(ordersReport?.avg_order_value || 0).toLocaleString()} so'm</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment methods */}
        <div className="card">
          <h3 className="font-semibold mb-4">To'lov usullari</h3>
          {sales?.by_method?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sales.by_method} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}>
                  {sales.by_method.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} so'm`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">Ma'lumot yo'q</p>}
        </div>

        {/* Orders by status */}
        <div className="card">
          <h3 className="font-semibold mb-4">Buyurtmalar statusi</h3>
          {ordersReport?.by_status?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersReport.by_status}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">Ma'lumot yo'q</p>}
        </div>

        {/* Top menu items */}
        <div className="card">
          <h3 className="font-semibold mb-4">Eng ko'p buyurtma qilingan taomlar</h3>
          <div className="space-y-2">
            {(topMenu || []).slice(0, 8).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.menu_item__name}</span>
                    <span className="text-gray-500">{item.total_quantity} ta</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min((item.total_quantity / (topMenu[0]?.total_quantity || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!topMenu || topMenu.length === 0) && <p className="text-gray-400 text-center py-6">Ma'lumot yo'q</p>}
          </div>
        </div>

        {/* Staff performance */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={18} /> Xodimlar samaradorligi</h3>
          <div className="space-y-2">
            {(staffReport || []).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.total_orders} ta buyurtma</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-amber-600 text-sm">{Number(s.total_revenue).toLocaleString()} so'm</p>
                  <p className="text-xs text-gray-500">{s.completed_orders} yakunlangan</p>
                </div>
              </div>
            ))}
            {(!staffReport || staffReport.length === 0) && <p className="text-gray-400 text-center py-6">Ma'lumot yo'q</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
