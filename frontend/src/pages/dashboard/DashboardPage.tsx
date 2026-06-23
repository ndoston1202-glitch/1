import { useQuery } from '@tanstack/react-query'
import { reportsApi, ordersApi, tablesApi } from '../../services/api'
import { TrendingUp, ShoppingBag, CheckCircle, XCircle, Clock, Table2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'

function StatCard({ title, value, icon: Icon, color, sub }: any) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsApi.getDashboard().then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: activeOrders } = useQuery({
    queryKey: ['active-orders'],
    queryFn: () => ordersApi.getOrders({ status: 'preparing,confirmed,pending,ready' }).then((r) => r.data),
    refetchInterval: 15000,
  })

  const { data: tables } = useQuery({
    queryKey: ['tables-dashboard'],
    queryFn: () => tablesApi.getTables().then((r) => r.data),
  })

  const { data: salesData } = useQuery({
    queryKey: ['sales-weekly'],
    queryFn: () => reportsApi.getSales('weekly').then((r) => r.data),
  })

  if (isLoading) return <LoadingSpinner />

  const tablesList = tables?.results || tables || []
  const freeCount = tablesList.filter((t: any) => t.status === 'free').length
  const occupiedCount = tablesList.filter((t: any) => t.status === 'occupied').length

  const orders = activeOrders?.results || activeOrders || []

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Bugungi buyurtmalar"
          value={stats?.today?.orders || 0}
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="Bugungi daromad"
          value={`${Number(stats?.today?.revenue || 0).toLocaleString()} so'm`}
          icon={TrendingUp}
          color="bg-amber-500"
        />
        <StatCard
          title="Faol buyurtmalar"
          value={stats?.active_orders || 0}
          icon={Clock}
          color="bg-orange-500"
          sub="Hozirgi vaqtda"
        />
        <StatCard
          title="Stollar holati"
          value={`${freeCount} bo'sh / ${occupiedCount} band`}
          icon={Table2}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stollar xaritasi */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Stollar holati</h3>
          <div className="grid grid-cols-5 gap-2">
            {tablesList.slice(0, 20).map((table: any) => (
              <div
                key={table.id}
                className={`p-2 rounded-lg text-center text-xs font-medium border-2 ${
                  table.status === 'free' ? 'bg-green-50 border-green-400 text-green-700' :
                  table.status === 'occupied' ? 'bg-red-50 border-red-400 text-red-700' :
                  table.status === 'reserved' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
                  'bg-blue-50 border-blue-400 text-blue-700'
                }`}
              >
                #{table.number}
                <div className="text-[10px] opacity-70">{table.capacity}kishi</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block"></span> Bo'sh</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"></span> Band</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block"></span> Bron</span>
          </div>
        </div>

        {/* Faol buyurtmalar */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Faol buyurtmalar</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Hozirda faol buyurtma yo'q</p>
            ) : (
              orders.slice(0, 10).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">#{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {order.table_number ? `Stol #${order.table_number}` : order.order_type}
                      {order.waiter_name && ` · ${order.waiter_name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-xs text-gray-500 mt-1">
                      {Number(order.total_amount).toLocaleString()} so'm
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Haftalik statistika */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Haftalik daromad</h3>
        {salesData ? (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{Number(salesData.total_revenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Jami daromad (so'm)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{salesData.total_transactions || 0}</p>
              <p className="text-xs text-gray-500">To'lovlar soni</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Number(stats?.weekly_revenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">7 kunlik daromad</p>
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(salesData?.by_method || []).map((m: any) => (
            <div key={m.method} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="font-semibold">{Number(m.total || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 capitalize">{m.method}</p>
              <p className="text-xs text-gray-400">{m.count} ta</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
