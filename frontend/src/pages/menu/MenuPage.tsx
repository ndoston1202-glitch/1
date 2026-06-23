import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '../../services/api'
import { Plus, Pencil, Trash2, Search, Leaf, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { MenuItem, Category } from '../../types'

function CategoryForm({ initial, onClose }: { initial?: Category; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({ defaultValues: initial })
  const mutation = useMutation({
    mutationFn: (data: any) => initial ? menuApi.updateCategory(initial.id, data) : menuApi.createCategory(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Saqlandi'); onClose() },
    onError: () => toast.error('Xatolik yuz berdi'),
  })
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div><label className="label">Nomi</label><input {...register('name', { required: true })} className="input" /></div>
      <div><label className="label">Tavsif</label><textarea {...register('description')} className="input" rows={2} /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} id="cat-active" defaultChecked />
        <label htmlFor="cat-active" className="text-sm">Faol</label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Saqlash</button>
      </div>
    </form>
  )
}

function MenuItemForm({ initial, categories, onClose }: { initial?: MenuItem; categories: Category[]; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({
    defaultValues: initial ? { ...initial, category: initial.category } : { is_available: true }
  })
  const mutation = useMutation({
    mutationFn: (data: any) => initial ? menuApi.updateItem(initial.id, data) : menuApi.createItem(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-items'] }); toast.success('Saqlandi'); onClose() },
    onError: () => toast.error('Xatolik'),
  })
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Nomi</label><input {...register('name', { required: true })} className="input" /></div>
        <div>
          <label className="label">Kategoriya</label>
          <select {...register('category', { required: true })} className="input">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Tavsif</label><textarea {...register('description')} className="input" rows={2} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Narx (so'm)</label><input type="number" {...register('price', { required: true })} className="input" /></div>
        <div><label className="label">Tayyorlash vaqti (daq)</label><input type="number" {...register('preparation_time')} className="input" defaultValue={15} /></div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_available')} /> Mavjud</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_vegetarian')} /> Vegetarian</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_spicy')} /> Achchiq</label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Saqlash</button>
      </div>
    </form>
  )
}

export default function MenuPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'items' | 'categories'>('items')
  const [search, setSearch] = useState('')
  const [selCat, setSelCat] = useState('')
  const [modalItem, setModalItem] = useState<MenuItem | null | 'new'>(null)
  const [modalCat, setModalCat] = useState<Category | null | 'new'>(null)

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories().then((r) => r.data?.results || r.data),
  })

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', search, selCat],
    queryFn: () => menuApi.getItems({ search: search || undefined, category: selCat || undefined }).then((r) => r.data),
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => menuApi.deleteItem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-items'] }); toast.success('O\'chirildi') },
  })

  const deleteCat = useMutation({
    mutationFn: (id: number) => menuApi.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('O\'chirildi') },
  })

  const items = itemsData?.results || itemsData || []
  const cats = categories || []

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('items')} className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === 'items' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
          Taomlar
        </button>
        <button onClick={() => setTab('categories')} className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === 'categories' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
          Kategoriyalar
        </button>
      </div>

      {tab === 'items' ? (
        <>
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Taom qidirish..." className="input pl-9"
              />
            </div>
            <select value={selCat} onChange={(e) => setSelCat(e.target.value)} className="input w-48">
              <option value="">Barcha kategoriyalar</option>
              {cats.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setModalItem('new')} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Yangi taom
            </button>
          </div>

          {/* Items grid */}
          {itemsLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {items.map((item: MenuItem) => (
                <div key={item.id} className="card hover:shadow-md transition-shadow">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  {!item.image && (
                    <div className="w-full h-32 bg-amber-50 rounded-lg mb-3 flex items-center justify-center text-amber-300 text-4xl">🍽️</div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.category_name}</p>
                    </div>
                    <div className="flex gap-1">
                      {item.is_vegetarian && <Leaf size={14} className="text-green-500" />}
                      {item.is_spicy && <Flame size={14} className="text-red-500" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-amber-600">{Number(item.price).toLocaleString()} so'm</span>
                    <span className={`badge ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.is_available ? 'Mavjud' : 'Yo\'q'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.preparation_time} daq</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setModalItem(item)} className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                      <Pencil size={13} /> Tahrirlash
                    </button>
                    <button
                      onClick={() => { if (confirm('O\'chirilsinmi?')) deleteItem.mutate(item.id) }}
                      className="flex-1 btn-danger text-xs py-1.5 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={13} /> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <button onClick={() => setModalCat('new')} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Yangi kategoriya
            </button>
          </div>
          {catLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cats.map((cat: Category) => (
                <div key={cat.id} className="card flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{cat.items_count} ta taom</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModalCat(cat)} className="p-2 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
                    <button
                      onClick={() => { if (confirm('O\'chirilsinmi?')) deleteCat.mutate(cat.id) }}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                    ><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={!!modalItem} onClose={() => setModalItem(null)} title={modalItem === 'new' ? 'Yangi taom' : 'Taomni tahrirlash'} size="lg">
        {modalItem && (
          <MenuItemForm
            initial={modalItem !== 'new' ? modalItem : undefined}
            categories={cats}
            onClose={() => setModalItem(null)}
          />
        )}
      </Modal>
      <Modal isOpen={!!modalCat} onClose={() => setModalCat(null)} title={modalCat === 'new' ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}>
        {modalCat && (
          <CategoryForm initial={modalCat !== 'new' ? modalCat : undefined} onClose={() => setModalCat(null)} />
        )}
      </Modal>
    </div>
  )
}
