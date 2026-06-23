import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { kitchenApi } from '../../services/api'
import { Clock, CheckCircle, ChefHat, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const itemStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  preparing: 'bg-orange-100 border-orange-300 text-orange-800',
  ready: 'bg-green-100 border-green-300 text-green-800',
  served: 'bg-gray-100 border-gray-300 text-gray-600',
}

export default function KitchenPage() {
  const qc = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => kitchenApi.getOrders().then(r => r.data),
    refetchInterval: 10000,
  })

  const { data: stats } = useQuery({
    queryKey: ['kitchen-stats'],
    queryFn: () => kitchenApi.getStats().then(r => r.data),
    refetchInterval: 10000,
  })

  const markPreparing = useMutation({
    mutationFn: (orderId: number) => kitchenApi.markPreparing(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kitchen-orders'] }),
  })

  const updateItemStatus = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: string }) => kitchenApi.updateItemStatus(itemId, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['kitchen-orders'] }); toast.success('Status yangilandi') },
  })

  if (isLoading) return <LoadingSpinner />

  const ordersList = orders || []

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Kutilmoqda', value: stats?.pending_orders || 0, color: 'bg-yellow-500' },
          { label: 'Tayyorlanmoqda', value: stats?.preparing_orders || 0, color: 'bg-orange-500' },
          { label: 'Tayyor', value: stats?.ready_orders || 0, color: 'bg-green-500' },
          { label: 'Bugun yakunlangan', value: stats?.completed_today || 0, color: 'bg-blue-500' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white font-bold`}>{s.value}</div>
            <p className="text-sm text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orders */}
      {ordersList.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-3 opacity-30" />
          <p>Hozirda tayyorlanadigan buyurtma yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordersList.map((order: any) => {
            const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
            return (
              <div key={order.id} className={`card border-2 ${order.status === 'confirmed' ? 'border-yellow-300' : 'border-orange-300'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">#{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {order.table_number ? `Stol #${order.table_number}` : order.order_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm font-medium ${elapsed > 20 ? 'text-red-600' : elapsed > 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      <Clock size={14} /> {elapsed} daq
                    </div>
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => markPreparing.mutate(order.id)}
                        disabled={markPreparing.isPending}
                        className="mt-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded-lg transition-colors"
                      >
                        Boshlash
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg border ${itemStatusColors[item.status] || 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs opacity-70">x{item.quantity} · {item.preparation_time} daq</p>
                        {item.notes && <p className="text-xs italic opacity-60">{item.notes}</p>}
                      </div>
                      <div className="flex gap-1 ml-2">
                        {item.status === 'pending' || item.status === 'preparing' ? (
                          <button
                            onClick={() => updateItemStatus.mutate({ itemId: item.id, status: item.status === 'pending' ? 'preparing' : 'ready' })}
                            className="p-1 hover:bg-white rounded-lg transition-colors"
                            title={item.status === 'pending' ? 'Boshlash' : 'Tayyor'}
                          >
                            {item.status === 'pending' ? <Loader2 size={16} /> : <CheckCircle size={16} />}
                          </button>
                        ) : (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
