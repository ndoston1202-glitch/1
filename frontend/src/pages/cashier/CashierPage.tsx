import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, paymentsApi } from '../../services/api'
import { CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { Order } from '../../types'

const METHODS = [
  { value: 'cash', label: 'Naqd pul', icon: Banknote },
  { value: 'card', label: 'Karta', icon: CreditCard },
  { value: 'payme', label: 'Payme', icon: Smartphone },
  { value: 'click', label: 'Click', icon: Smartphone },
]

function PaymentModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient()
  const [method, setMethod] = useState('cash')
  const [paidAmount, setPaidAmount] = useState(order.total_amount)

  const total = Number(order.total_amount)
  const paid = Number(paidAmount)
  const change = Math.max(paid - total, 0)

  const mutation = useMutation({
    mutationFn: () => paymentsApi.createPayment({ order: order.id, method, paid_amount: paid }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders-ready'] })
      toast.success(`To'lov qabul qilindi! Qaytim: ${change.toLocaleString()} so'm`)
      onClose()
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Xatolik'),
  })

  return (
    <div className="space-y-5">
      {/* Order summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="font-semibold mb-2">#{order.order_number}</p>
        {order.items?.map(item => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>{item.menu_item_name} x{item.quantity}</span>
            <span>{Number(item.subtotal).toLocaleString()} so'm</span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between font-bold">
          <span>JAMI:</span>
          <span className="text-amber-600 text-lg">{total.toLocaleString()} so'm</span>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="label">To'lov usuli</p>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMethod(value)}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${method === value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Icon size={18} className={method === value ? 'text-amber-600' : 'text-gray-500'} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="label">Qabul qilingan summa (so'm)</label>
        <input
          type="number"
          value={paidAmount}
          onChange={e => setPaidAmount(e.target.value)}
          className="input text-lg font-bold"
        />
      </div>

      {method === 'cash' && paid >= total && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-700 font-semibold">Qaytim: {change.toLocaleString()} so'm</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1">Bekor</button>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || paid < total}
          className="btn-success flex-1 flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} /> To'lovni qabul qilish
        </button>
      </div>
    </div>
  )
}

export default function CashierPage() {
  const [payingOrder, setPayingOrder] = useState<Order | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders-ready'],
    queryFn: () => ordersApi.getOrders({ status: 'ready,served' }).then(r => r.data),
    refetchInterval: 15000,
  })

  const { data: recentPayments } = useQuery({
    queryKey: ['recent-payments'],
    queryFn: () => paymentsApi.getPayments({ ordering: '-created_at' }).then(r => r.data),
  })

  const orders = data?.results || data || []
  const payments = recentPayments?.results || recentPayments || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Waiting for payment */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">To'lov kutayotgan buyurtmalar</h3>
        {orders.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
            <p>To'lov kutayotgan buyurtma yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-amber-200"
                onClick={() => ordersApi.getOrder(order.id).then(r => setPayingOrder(r.data))}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">#{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {order.table_number ? `Stol #${order.table_number}` : order.order_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600 text-lg">{Number(order.total_amount).toLocaleString()} so'm</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <button className="w-full mt-3 btn-success text-sm">To'lovni qabul qilish</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent payments */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">So'nggi to'lovlar</h3>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Buyurtma</th>
                <th className="pb-2 font-medium">Usul</th>
                <th className="pb-2 font-medium">Summa</th>
                <th className="pb-2 font-medium">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 15).map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">#{p.order_number}</td>
                  <td className="py-2">
                    <span className="badge bg-blue-100 text-blue-700 capitalize">{p.method}</span>
                  </td>
                  <td className="py-2 font-medium">{Number(p.amount).toLocaleString()}</td>
                  <td className="py-2 text-xs text-gray-500">
                    {p.paid_at ? new Date(p.paid_at).toLocaleTimeString('uz-UZ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p className="text-center text-gray-400 py-6">To'lovlar yo'q</p>}
        </div>
      </div>

      <Modal isOpen={!!payingOrder} onClose={() => setPayingOrder(null)} title="To'lovni qabul qilish" size="lg">
        {payingOrder && <PaymentModal order={payingOrder} onClose={() => setPayingOrder(null)} />}
      </Modal>
    </div>
  )
}
