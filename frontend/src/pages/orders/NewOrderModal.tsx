import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ordersApi, menuApi, tablesApi } from '../../services/api'
import { Plus, Minus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { MenuItem, Category, Table } from '../../types'
import LoadingSpinner from '../../components/common/LoadingSpinner'

interface Props {
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  tableId?: number
  onClose: () => void
}

interface CartItem {
  id: number
  name: string
  price: string
  quantity: number
}

export default function NewOrderModal({ orderType, tableId, onClose }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [selectedTable, setSelectedTable] = useState<number | undefined>(tableId)
  const [notes, setNotes] = useState('')

  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories().then(r => r.data?.results || r.data),
  })

  const { data: itemsData } = useQuery({
    queryKey: ['menu-items-available', selectedCat],
    queryFn: () => menuApi.getItems({ is_available: true, category: selectedCat || undefined }).then(r => r.data?.results || r.data),
  })

  const { data: tablesData } = useQuery({
    queryKey: ['tables-free'],
    queryFn: () => tablesApi.getTables({ status: 'free' }).then(r => r.data?.results || r.data),
    enabled: orderType === 'dine_in',
  })

  const mutation = useMutation({
    mutationFn: (data: any) => ordersApi.createOrder(data),
    onSuccess: () => { toast.success('Buyurtma yaratildi! ✅'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Xatolik'),
  })

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id)
      if (ex) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const changeQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    )
  }

  const total = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

  const handleSubmit = () => {
    if (cart.length === 0) return toast.error('Kamida 1 ta taom tanlang!')
    mutation.mutate({
      order_type: orderType,
      table: selectedTable || undefined,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes,
      items: cart.map(i => ({ menu_item: i.id, quantity: i.quantity })),
    })
  }

  const categories: Category[] = cats || []
  const items: MenuItem[] = itemsData || []

  return (
    <div className="grid grid-cols-5 gap-4 max-h-[75vh]">

      {/* Chap: Menyu */}
      <div className="col-span-3 flex flex-col overflow-hidden">
        {/* Kategoriyalar */}
        <div className="flex gap-2 flex-wrap mb-3">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedCat ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Barchasi
          </button>
          {categories.map(c => (
            <button key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCat === c.id ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Taomlar */}
        <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-2 pr-1">
          {items.map(item => (
            <button key={item.id} onClick={() => addToCart(item)}
              className="text-left p-3 border-2 border-transparent hover:border-amber-300 hover:bg-amber-50 rounded-xl transition-all bg-white shadow-sm">
              <div className="flex items-start gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <span>🍽️</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs leading-tight truncate">{item.name}</p>
                  <p className="text-amber-600 font-bold text-xs mt-0.5">{Number(item.price).toLocaleString()}</p>
                  <p className="text-gray-400 text-[10px]">{item.preparation_time} daq</p>
                </div>
              </div>
            </button>
          ))}
          {items.length === 0 && <div className="col-span-2 text-center py-8 text-gray-400 text-sm">Taomlar topilmadi</div>}
        </div>
      </div>

      {/* O'ng: Savat + Ma'lumotlar */}
      <div className="col-span-2 flex flex-col border-l pl-4">

        {/* Mijoz ma'lumotlari */}
        <div className="space-y-2 mb-3">
          {orderType === 'dine_in' && (
            <div>
              <label className="text-xs text-gray-500 font-medium">Stol</label>
              <select value={selectedTable || ''} onChange={e => setSelectedTable(Number(e.target.value) || undefined)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm mt-0.5">
                <option value="">— Tanlang —</option>
                {(tablesData || []).map((t: Table) => (
                  <option key={t.id} value={t.id}>Stol #{t.number} ({t.capacity} kishi)</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 font-medium">Mijoz ismi</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm mt-0.5" placeholder="Ism..." />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Telefon</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm mt-0.5" placeholder="+998..." />
          </div>
          {orderType === 'delivery' && (
            <div>
              <label className="text-xs text-gray-500 font-medium">Manzil</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm mt-0.5" placeholder="Ko'cha, uy..." />
            </div>
          )}
        </div>

        {/* Savat */}
        <div className="flex-1 overflow-y-auto space-y-1 border-t pt-2">
          <p className="text-xs font-semibold text-gray-500 mb-1">SAVAT</p>
          {cart.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Taom tanlang</p>}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-2 py-1.5 border-b">
              <span className="flex-1 text-xs font-medium truncate">{item.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => changeQty(item.id, -1)} className="w-5 h-5 bg-gray-100 hover:bg-red-100 rounded flex items-center justify-center">
                  <Minus size={10} />
                </button>
                <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                <button onClick={() => changeQty(item.id, 1)} className="w-5 h-5 bg-gray-100 hover:bg-green-100 rounded flex items-center justify-center">
                  <Plus size={10} />
                </button>
              </div>
              <span className="text-xs text-amber-600 font-medium w-16 text-right">
                {(Number(item.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Jami va tugmalar */}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold mb-3">
            <span>Jami:</span>
            <span className="text-amber-600">{total.toLocaleString()} so'm</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">Bekor</button>
            <button onClick={handleSubmit} disabled={mutation.isPending || cart.length === 0}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {mutation.isPending ? 'Saqlanmoqda...' : '✅ Buyurtma'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
