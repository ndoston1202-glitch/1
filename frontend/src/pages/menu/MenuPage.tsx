import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '../../services/api'
import { Plus, Pencil, Trash2, Search, Leaf, Flame, Upload, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { MenuItem, Category } from '../../types'

// ===================== TAOM FORMASI =====================
function MenuItemForm({ initial, categories, onClose }: { initial?: MenuItem; categories: Category[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [imgPreview, setImgPreview] = useState<string | null>(initial?.image || null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: initial?.name || '',
      category: initial?.category || '',
      description: initial?.description || '',
      price: initial?.price || '',
      cost_price: (initial as any)?.cost_price || '0',
      preparation_time: initial?.preparation_time || 15,
      calories: initial?.calories || '',
      is_available: initial?.is_available ?? true,
      is_vegetarian: initial?.is_vegetarian || false,
      is_spicy: initial?.is_spicy || false,
    }
  })

  const isAvailable = watch('is_available')

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v as any)
      })
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0])
      return initial ? menuApi.updateItem(initial.id, fd) : menuApi.createItem(fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-items'] }); toast.success('Saqlandi!'); onClose() },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImgPreview(URL.createObjectURL(file))
  }

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">


      {/* Taom nomi */}
      <div>
        <label className="label">Taom nomi <span className="text-red-500">*</span></label>
        <input {...register('name', { required: true })} className="input" placeholder="Masalan: Osh, Lag'mon, Shashlik..." />
        {errors.name && <p className="text-red-500 text-xs mt-1">Taom nomini kiriting</p>}
      </div>

      {/* Kategoriya */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Kategoriya</label>
          <div className="relative">
            <select {...register('category')} className="input appearance-none pr-8">
              <option value="">— Tanlang —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="label">Tayyorlash vaqti (daqiqa)</label>
          <input type="number" {...register('preparation_time')} className="input" placeholder="15" />
        </div>
      </div>

      {/* Narx, tannarx va kaloriya */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Sotish narxi (so'm) <span className="text-red-500">*</span></label>
          <input type="number" {...register('price', { required: true })} className="input" placeholder="0" />
          {errors.price && <p className="text-red-500 text-xs mt-1">Narxni kiriting</p>}
        </div>
        <div>
          <label className="label">Tannarx (so'm)</label>
          <input type="number" {...register('cost_price')} className="input" placeholder="0" />
        </div>
        <div>
          <label className="label">Kaloriya (ixtiyoriy)</label>
          <input type="number" {...register('calories')} className="input" placeholder="kcal" />
        </div>
      </div>

      {/* Tavsif */}
      <div>
        <label className="label">Tavsif</label>
        <textarea {...register('description')} className="input" rows={2} placeholder="Taom haqida qisqacha..." />
      </div>

      {/* Rasm */}
      <div>
        <label className="label">Taom rasmi</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
            {imgPreview
              ? <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
              : <span className="text-3xl">🍽️</span>
            }
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Upload size={15} /> Rasm tanlash
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (max 5MB)</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
          </div>
        </div>
      </div>

      {/* Xususiyatlar */}
      <div className="grid grid-cols-3 gap-3">
        <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
          <input type="checkbox" {...register('is_vegetarian')} className="w-4 h-4 accent-green-500" />
          <Leaf size={16} className="text-green-500" />
          <span className="text-sm">Vegetarian</span>
        </label>
        <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
          <input type="checkbox" {...register('is_spicy')} className="w-4 h-4 accent-red-500" />
          <Flame size={16} className="text-red-500" />
          <span className="text-sm">Achchiq</span>
        </label>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-sm">Menyuda</span>
          <button type="button" onClick={() => setValue('is_available', !isAvailable)}>
            {isAvailable
              ? <ToggleRight size={28} className="text-green-500" />
              : <ToggleLeft size={28} className="text-gray-400" />
            }
          </button>
        </div>
      </div>

      {/* Tugmalar */}
      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onClose} className="btn-secondary px-6">Bekor</button>
        <button type="submit" disabled={mutation.isPending}
          className="btn-primary px-6 flex items-center gap-2">
          💾 {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  )
}


// ===================== KATEGORIYA FORMASI =====================
function CategoryForm({ initial, onClose }: { initial?: Category; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({ defaultValues: initial || { is_active: true } })
  const mutation = useMutation({
    mutationFn: (data: any) => initial ? menuApi.updateCategory(initial.id, data) : menuApi.createCategory(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Saqlandi!'); onClose() },
    onError: () => toast.error('Xatolik'),
  })
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="label">Kategoriya nomi <span className="text-red-500">*</span></label>
        <input {...register('name', { required: true })} className="input" placeholder="Masalan: Salatlar, Sho'rvalar..." />
      </div>
      <div>
        <label className="label">Tavsif</label>
        <textarea {...register('description')} className="input" rows={2} />
      </div>
      <div>
        <label className="label">Tartib raqami</label>
        <input type="number" {...register('order')} className="input" defaultValue={0} />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} defaultChecked className="w-4 h-4 accent-amber-500" />
        <span className="text-sm">Faol</span>
      </label>
      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
          💾 Saqlash
        </button>
      </div>
    </form>
  )
}


// ===================== ASOSIY SAHIFA =====================
export default function MenuPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'items' | 'categories'>('items')
  const [search, setSearch] = useState('')
  const [selCat, setSelCat] = useState('')
  const [modalItem, setModalItem] = useState<MenuItem | null | 'new'>(null)
  const [modalCat, setModalCat] = useState<Category | null | 'new'>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories().then(r => r.data?.results || r.data),
  })

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['menu-items', search, selCat],
    queryFn: () => menuApi.getItems({ search: search || undefined, category: selCat || undefined }).then(r => r.data),
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => menuApi.deleteItem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-items'] }); toast.success("O'chirildi") },
  })

  const deleteCat = useMutation({
    mutationFn: (id: number) => menuApi.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success("O'chirildi") },
  })

  const items: MenuItem[] = itemsData?.results || itemsData || []
  const cats: Category[] = categories || []

  return (
    <div className="space-y-5">
      {/* Header tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[{ key: 'items', label: '🍽️ Taomlar' }, { key: 'categories', label: '📂 Kategoriyalar' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${tab === t.key ? 'bg-amber-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'items'
          ? <button onClick={() => setModalItem('new')} className="btn-primary flex items-center gap-2"><Plus size={16} /> Yangi taom</button>
          : <button onClick={() => setModalCat('new')} className="btn-primary flex items-center gap-2"><Plus size={16} /> Yangi kategoriya</button>
        }
      </div>

      {tab === 'items' ? (
        <>
          {/* Filter qator */}
          <div className="flex gap-3 flex-wrap bg-white border rounded-xl p-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Nomi bo'yicha qidirish..." className="input pl-9 text-sm" />
            </div>
            <div className="relative">
              <select value={selCat} onChange={e => setSelCat(e.target.value)} className="input w-52 text-sm appearance-none pr-8">
                <option value="">Barcha kategoriyalar</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Jadval */}
          {isLoading ? <LoadingSpinner /> : (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium w-10">#</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Taom nomi</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Kategoriya</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Narx</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Tannarx</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Foyda</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Vaqt</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Holat</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b hover:bg-amber-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-amber-50 flex items-center justify-center shrink-0">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-lg">🍽️</span>}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {item.is_vegetarian && <span className="text-green-600 text-xs flex items-center gap-0.5"><Leaf size={11} />Veg</span>}
                              {item.is_spicy && <span className="text-red-500 text-xs flex items-center gap-0.5"><Flame size={11} />Achchiq</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">{item.category_name}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-600">{Number(item.price).toLocaleString()} so'm</td>
                      <td className="px-4 py-3 text-gray-500">{Number((item as any).cost_price || 0).toLocaleString()} so'm</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">
                          {(Number(item.price) - Number((item as any).cost_price || 0)).toLocaleString()} so'm
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.preparation_time} daq</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {item.is_available ? '✓ Mavjud' : '✗ Yo\'q'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setModalItem(item)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors" title="Tahrirlash">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { if (confirm('O\'chirilsinmi?')) deleteItem.mutate(item.id) }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="O'chirish">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">🍽️</div>
                  <p>Taomlar topilmadi</p>
                  <button onClick={() => setModalItem('new')} className="btn-primary mt-3 text-sm">Taom qo'shish</button>
                </div>
              )}
              {items.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                  Jami: {items.length} ta taom
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">#</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Kategoriya nomi</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Taomlar soni</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Holat</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((cat, i) => (
                  <tr key={cat.id} className="border-b hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cat.items_count} ta taom</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setModalCat(cat)} className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('O\'chirilsinmi?')) deleteCat.mutate(cat.id) }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cats.length === 0 && <div className="text-center py-12 text-gray-400"><p>Kategoriyalar topilmadi</p></div>}
          </div>
        </>
      )}

      {/* Modal - Taom */}
      <Modal isOpen={!!modalItem} onClose={() => setModalItem(null)}
        title={modalItem === 'new' ? '➕ Yangi taom qo\'shish' : '✏️ Taomni tahrirlash'} size="lg">
        {modalItem && <MenuItemForm initial={modalItem !== 'new' ? modalItem : undefined} categories={cats} onClose={() => setModalItem(null)} />}
      </Modal>

      {/* Modal - Kategoriya */}
      <Modal isOpen={!!modalCat} onClose={() => setModalCat(null)}
        title={modalCat === 'new' ? '➕ Yangi kategoriya' : '✏️ Kategoriyani tahrirlash'}>
        {modalCat && <CategoryForm initial={modalCat !== 'new' ? modalCat : undefined} onClose={() => setModalCat(null)} />}
      </Modal>
    </div>
  )
}
