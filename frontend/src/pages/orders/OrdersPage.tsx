import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, menuApi, tablesApi } from '../../services/api'
import { Plus, Search, Eye, Trash2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useForm } from 'react-hook-form'
import { Order, MenuItem, Table } from '../../types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'confirmed', label: 'Tasdiqlash' },
  { value: 'preparing', label: 'Tayyorlanmoqda' },
  { value: 'ready', label: 'Tayyor' },
  { value: 'served', label: 'Berildi' },
  { value: 'completed', label: 'Yakunlash' },
  { value: 'cancelled', label: 'Bekor qilish' },
]

function NewOrderModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [selectedItems, setSelectedItems] = useState<{ menu_item: number; quantity: number; name: string; price: string }[]>([])
  const { register, handleSubmit } = useForm({ defaultValues: { order_type: 'dine_in' } })

  const { data: tablesData } = useQuery({ queryKey: ['tables'], queryFn: () => tablesApi.getTables().then(r => r.data?.results || r.data) })
  const { data: menuData } = useQuery({ queryKey: ['menu-items'], queryFn: () => menuApi.getItems({ is_available: true }).then(r => r.data?.results || r.data) })
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => menuApi.getCategories().then(r => r.data?.results || r.data) })

  const mutation = useMutation({
    mutationFn: (data: any) => ordersApi.createOrder(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Buyurtma yaratildi'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Xatolik'),
  })

  const addItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const ex = prev.find(i => i.menu_item === item.id)
      if (ex) return prev.map(i => i.menu_item === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { menu_item: item.id, quantity: 1, name: item.name, price: item.price }]
    })
  }

  const removeItem = (id: number) => setSelectedItems(prev => prev.filter(i => i.menu_item !== id))

  const total = selectedItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

  const onSubmit = (data: any) => {
    if (!selectedItems.length) return toast.error('Kamida 1 ta taom tanlang')
    mutation.mutate({ ...data, items: selectedItems.map(({ menu_item, quantity }) => ({ menu_item, quantity })) })
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-h-[70vh]">
      {/* Menu */}
      <div className="overflow-y-auto space-y-2 pr-2">
        {(catData || []).map((cat: any) => {
          const catItems = (menuData || []).filter((i: MenuItem) => i.category === cat.id)
          if (!catItems.length) return null
          return (
            <div key={cat.id}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{cat.name}</p>
              {catItems.map((item: MenuItem) => (
                <button key={item.id} onClick={() => addItem(item)}
                  className="w-full text-left p-2 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all mb-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-amber-600">{Number(item.price).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400">{item.preparation_time} daq</p>
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {/* Order form */}
      <div className="flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1 overflow-y-auto">
          <div>
            <label className="label">Tur</label>
            <select {...register('order_type')} className="input text-sm">
              <option value="dine_in">Zalda</option>
              <option value="takeaway">Olib ketish</option>
              <option value="delivery">Yetkazib berish</option>
            </select>
          </div>
          <div>
            <label className="label">Stol (ixtiyoriy)</label>
            <select {...register('table')} className="input text-sm">
              <option value="">—</option>
              {(tablesData || []).filter((t: Table) => t.status === 'free').map((t: Table) => (
                <option key={t.id} value={t.id}>Stol #{t.number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mijoz ismi</label>
            <input {...register('customer_name')} className="input text-sm" />
          </div>

          {/* Selected items */}
          <div className="border-t pt-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">Tanlangan taomlar:</p>
            {selectedItems.length === 0 && <p className="text-xs text-gray-400">Hali hech narsa tanlanmagan</p>}
            {selectedItems.map((item) => (
              <div key={item.menu_item} className="flex items-center gap-2 mb-1">
                <span className="flex-1 text-sm">{item.name}</span>
                <span className="text-xs text-gray-500">x{item.quantity}</span>
                <span className="text-xs text-amber-600">{(Number(item.price) * item.quantity).toLocaleString()}</span>
                <button type="button" onClick={() => removeItem(item.menu_item)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>Jami:</span>
              <span className="text-amber-600">{total.toLocaleString()} so'm</span>
            </div>
          </div>
        </form>
        <div className="flex gap-2 mt-3 border-t pt-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor</button>
          <button onClick={handleSubmit(onSubmit)} className="btn-primary flex-1" disabled={mutation.isPending}>
            Buyurtma berish
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalNew, setModalNew] = useState(false)
  const [viewOrder, setViewOrder] = useState<Order | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, statusFilter],
    queryFn: () => ordersApi.getOrders({ search: search || undefined, status: statusFilter || undefined }).then(r => r.data),
    refetchInterval: 15000,
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => ordersApi.changeStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Status yangilandi') },
  })

  const orders = data?.results || data || []

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buyurtma qidirish..." className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-44">
          <option value="">Barcha statuslar</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => setModalNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi buyurtma
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Raqam</th>
                <th className="pb-3 font-medium">Stol</th>
                <th className="pb-3 font-medium">Ofitsiant</th>
                <th className="pb-3 font-medium">Tur</th>
                <th className="pb-3 font-medium">Summa</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Vaqt</th>
                <th className="pb-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">#{order.order_number}</td>
                  <td className="py-3">{order.table_number ? `#${order.table_number}` : '—'}</td>
                  <td className="py-3 text-xs text-gray-500">{order.waiter_name || '—'}</td>
                  <td className="py-3">
                    <span className="badge bg-gray-100 text-gray-700">
                      {order.order_type === 'dine_in' ? 'Zalda' : order.order_type === 'takeaway' ? 'Olib ketish' : 'Yetkazib'}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{Number(order.total_amount).toLocaleString()} so'm</td>
                  <td className="py-3"><StatusBadge status={order.status} /></td>
                  <td className="py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('uz-UZ')}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { ordersApi.getOrder(order.id).then(r => setViewOrder(r.data)) }}
                        className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg"><Eye size={14} /></button>
                      <div className="relative group">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg flex items-center gap-0.5 text-xs">
                          Status <ChevronDown size={12} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 hidden group-hover:block w-36">
                          {STATUS_OPTIONS.map(s => (
                            <button key={s.value} onClick={() => changeStatus.mutate({ id: order.id, status: s.value })}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">{s.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-gray-400 py-8">Buyurtmalar topilmadi</p>}
        </div>
      )}

      <Modal isOpen={modalNew} onClose={() => setModalNew(false)} title="Yangi buyurtma" size="xl">
        <NewOrderModal onClose={() => setModalNew(false)} />
      </Modal>

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Buyurtma #${viewOrder?.order_number}`} size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={viewOrder.status} /></div>
              <div><span className="text-gray-500">Tur:</span> {viewOrder.order_type}</div>
              <div><span className="text-gray-500">Stol:</span> {viewOrder.table_number ? `#${viewOrder.table_number}` : '—'}</div>
              <div><span className="text-gray-500">Ofitsiant:</span> {viewOrder.waiter_name || '—'}</div>
            </div>
            <div className="border-t pt-3">
              <p className="font-semibold mb-2">Taomlar:</p>
              {viewOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1.5 border-b">
                  <span>{item.menu_item_name} x{item.quantity}</span>
                  <span className="text-amber-600">{Number(item.subtotal).toLocaleString()} so'm</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2">
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
