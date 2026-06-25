import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, tablesApi } from '../../services/api'
import { Plus, Eye, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import NewOrderModal from './NewOrderModal'

const STATUS_OPTIONS = [
  { value: 'confirmed',  label: 'Tasdiqlash' },
  { value: 'preparing',  label: 'Tayyorlanmoqda' },
  { value: 'ready',      label: 'Tayyor' },
  { value: 'served',     label: 'Berildi' },
  { value: 'completed',  label: 'Yakunlash' },
  { value: 'cancelled',  label: 'Bekor qilish' },
]

export default function DineInOrders() {
  const qc = useQueryClient()
  const [modalNew, setModalNew] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders-dine'],
    queryFn: () => ordersApi.getOrders({ order_type: 'dine_in' }).then(r => r.data),
    refetchInterval: 15000,
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => ordersApi.changeStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders-dine'] }); toast.success('Status yangilandi') },
  })

  const orders = data?.results || data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">🪑 Stoldagi buyurtmalar</h3>
        <button onClick={() => setModalNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi buyurtma
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">#</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Buyurtma</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Stol</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Ofitsiant</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Summa</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Vaqt</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Amal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, i: number) => (
                <tr key={order.id} className="border-b hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-amber-600">#{order.order_number}</td>
                  <td className="px-4 py-3">
                    {order.table_number
                      ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">Stol #{order.table_number}</span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{order.waiter_name || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{Number(order.total_amount).toLocaleString()} so'm</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => ordersApi.getOrder(order.id).then(r => setViewOrder(r.data))}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg"><Eye size={14} /></button>
                      <div className="relative group">
                        <button className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-0.5 text-xs text-gray-600">
                          <ChevronDown size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-xl z-10 hidden group-hover:block w-40 overflow-hidden">
                          {STATUS_OPTIONS.map(s => (
                            <button key={s.value}
                              onClick={() => changeStatus.mutate({ id: order.id, status: s.value })}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-amber-50 transition-colors">
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">🪑</p>
              <p>Stoldagi buyurtmalar yo'q</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalNew} onClose={() => setModalNew(false)} title="🪑 Stol buyurtmasi" size="xl">
        <NewOrderModal orderType="dine_in" onClose={() => { setModalNew(false); qc.invalidateQueries({ queryKey: ['orders-dine'] }) }} />
      </Modal>

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Buyurtma #${viewOrder?.order_number}`} size="lg">
        {viewOrder && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={viewOrder.status} /></div>
              <div><span className="text-gray-500">Stol:</span> {viewOrder.table_number ? `#${viewOrder.table_number}` : '—'}</div>
            </div>
            <div className="border-t pt-3 space-y-2">
              {viewOrder.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-1 border-b">
                  <span>{item.menu_item_name} x{item.quantity}</span>
                  <span className="font-medium">{Number(item.subtotal).toLocaleString()} so'm</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Jami:</span>
                <span className="text-amber-600">{Number(viewOrder.total_amount).toLocaleString()} so'm</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
