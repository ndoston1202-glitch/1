import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../services/api'
import { Plus, Eye, ChevronDown, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import NewOrderModal from './NewOrderModal'

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Tasdiqlash' },
  { value: 'preparing', label: 'Tayyorlanmoqda' },
  { value: 'ready',     label: 'Tayyor' },
  { value: 'completed', label: 'Yakunlash' },
  { value: 'cancelled', label: 'Bekor qilish' },
]

export default function RemoteOrders() {
  const qc = useQueryClient()
  const [modalNew, setModalNew] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders-delivery'],
    queryFn: () => ordersApi.getOrders({ order_type: 'delivery' }).then(r => r.data),
    refetchInterval: 15000,
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => ordersApi.changeStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders-delivery'] }); toast.success('Status yangilandi') },
  })

  const orders = data?.results || data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">📱 Masofadan buyurtmalar (Bot / Telefon)</h3>
        <button onClick={() => setModalNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi buyurtma
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-green-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">#</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Buyurtma</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Mijoz</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Manzil</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Summa</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Vaqt</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Amal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, i: number) => (
                <tr key={order.id} className="border-b hover:bg-green-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-green-600">#{order.order_number}</td>
                  <td className="px-4 py-3">
                    <div>{order.customer_name || '—'}</div>
                    <div className="text-xs text-gray-400">{order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-32 truncate">
                    {order.delivery?.address
                      ? <span className="flex items-center gap-1"><MapPin size={11} />{order.delivery.address}</span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold">{Number(order.total_amount).toLocaleString()} so'm</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => ordersApi.getOrder(order.id).then(r => setViewOrder(r.data))}
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-500 rounded-lg"><Eye size={14} /></button>
                      <div className="relative group">
                        <button className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg"><ChevronDown size={14} /></button>
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-xl z-10 hidden group-hover:block w-40 overflow-hidden">
                          {STATUS_OPTIONS.map(s => (
                            <button key={s.value} onClick={() => changeStatus.mutate({ id: order.id, status: s.value })}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-green-50 transition-colors">{s.label}</button>
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
              <p className="text-4xl mb-2">📱</p>
              <p>Masofadan buyurtmalar yo'q</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalNew} onClose={() => setModalNew(false)} title="📱 Masofadan buyurtma" size="xl">
        <NewOrderModal orderType="delivery" onClose={() => { setModalNew(false); qc.invalidateQueries({ queryKey: ['orders-delivery'] }) }} />
      </Modal>

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Buyurtma #${viewOrder?.order_number}`} size="lg">
        {viewOrder && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-500">Mijoz:</span> {viewOrder.customer_name}</div>
              <div><span className="text-gray-500">Tel:</span> {viewOrder.customer_phone}</div>
            </div>
            {viewOrder.delivery?.address && (
              <div className="flex items-center gap-2 text-gray-600 bg-green-50 p-2 rounded-lg">
                <MapPin size={14} className="text-green-500" />
                {viewOrder.delivery.address}
              </div>
            )}
            <div className="border-t pt-3 space-y-1">
              {viewOrder.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-1 border-b">
                  <span>{item.menu_item_name} x{item.quantity}</span>
                  <span className="font-medium">{Number(item.subtotal).toLocaleString()} so'm</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Jami:</span>
                <span className="text-green-600">{Number(viewOrder.total_amount).toLocaleString()} so'm</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
