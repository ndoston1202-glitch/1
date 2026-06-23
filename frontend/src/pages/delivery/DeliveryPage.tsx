import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deliveryApi, ordersApi } from '../../services/api'
import { Plus, MapPin, Clock, Bike } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useForm } from 'react-hook-form'

const DELIVERY_STATUSES = [
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'assigned', label: 'Tayinlash' },
  { value: 'picked_up', label: 'Olingan' },
  { value: 'on_way', label: 'Yo\'lda' },
  { value: 'delivered', label: 'Yetkazildi' },
  { value: 'failed', label: 'Muvaffaqiyatsiz' },
]

function NewDeliveryForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm()
  const { data: zones } = useQuery({ queryKey: ['zones'], queryFn: () => deliveryApi.getZones().then(r => r.data?.results || r.data) })
  const { data: orders } = useQuery({
    queryKey: ['orders-delivery'],
    queryFn: () => ordersApi.getOrders({ order_type: 'delivery', status: 'confirmed,preparing,ready' }).then(r => r.data?.results || r.data),
  })

  const mutation = useMutation({
    mutationFn: (data: any) => deliveryApi.createDelivery(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliveries'] }); toast.success('Yaratildi'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Xatolik'),
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="label">Buyurtma</label>
        <select {...register('order', { required: true })} className="input">
          <option value="">Tanlang</option>
          {(orders || []).map((o: any) => (
            <option key={o.id} value={o.id}>#{o.order_number} — {o.customer_name || 'Noma\'lum'}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Hudud</label>
        <select {...register('zone')} className="input">
          <option value="">Tanlang</option>
          {(zones || []).map((z: any) => (
            <option key={z.id} value={z.id}>{z.name} — {Number(z.delivery_fee).toLocaleString()} so'm ({z.estimated_time} daq)</option>
          ))}
        </select>
      </div>
      <div><label className="label">Manzil</label><textarea {...register('address', { required: true })} className="input" rows={2} /></div>
      <div><label className="label">Izoh</label><textarea {...register('notes')} className="input" rows={2} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Yaratish</button>
      </div>
    </form>
  )
}

function ZoneForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({ defaultValues: { is_active: true, estimated_time: 30 } })
  const mutation = useMutation({
    mutationFn: (data: any) => deliveryApi.createZone(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['zones'] }); toast.success('Hudud qo\'shildi'); onClose() },
  })
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div><label className="label">Hudud nomi</label><input {...register('name', { required: true })} className="input" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Min. buyurtma (so'm)</label><input type="number" {...register('min_order')} className="input" /></div>
        <div><label className="label">Yetkazib berish narxi</label><input type="number" {...register('delivery_fee')} className="input" /></div>
      </div>
      <div><label className="label">Taxminiy vaqt (daq)</label><input type="number" {...register('estimated_time')} className="input" /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} id="zone-active" />
        <label htmlFor="zone-active" className="text-sm">Faol</label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Qo'shish</button>
      </div>
    </form>
  )
}

export default function DeliveryPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'deliveries' | 'zones'>('deliveries')
  const [modalNew, setModalNew] = useState(false)
  const [modalZone, setModalZone] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', statusFilter],
    queryFn: () => deliveryApi.getDeliveries({ status: statusFilter || undefined }).then(r => r.data),
    refetchInterval: 20000,
  })

  const { data: zonesData } = useQuery({
    queryKey: ['zones'],
    queryFn: () => deliveryApi.getZones().then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => deliveryApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliveries'] }); toast.success('Status yangilandi') },
  })

  const deliveries = data?.results || data || []
  const zones = zonesData?.results || zonesData || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {[{ key: 'deliveries', label: 'Yetkazib berishlar' }, { key: 'zones', label: 'Hududlar' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === key ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === 'deliveries' && (
            <>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
                <option value="">Barcha</option>
                {DELIVERY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button onClick={() => setModalNew(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Yangi</button>
            </>
          )}
          {tab === 'zones' && (
            <button onClick={() => setModalZone(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Hudud qo'shish</button>
          )}
        </div>
      </div>

      {tab === 'deliveries' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveries.length === 0 ? (
            <div className="col-span-3 card text-center py-12 text-gray-400">
              <Bike size={48} className="mx-auto mb-3 opacity-30" />
              <p>Yetkazib berishlar yo'q</p>
            </div>
          ) : deliveries.map((d: any) => (
            <div key={d.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold">#{d.order_number}</p>
                  {d.courier_name && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Bike size={12} /> {d.courier_name}
                    </p>
                  )}
                </div>
                <StatusBadge status={d.status} type="delivery" />
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />{d.address}</p>
                {d.zone_name && <p className="text-xs text-gray-500">Hudud: {d.zone_name}</p>}
                {d.estimated_time && (
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> ~{d.estimated_time} daq
                  </p>
                )}
                <p className="text-xs text-amber-600 font-medium">{Number(d.delivery_fee).toLocaleString()} so'm</p>
              </div>
              <div className="flex gap-1 flex-wrap mt-3">
                {DELIVERY_STATUSES.filter(s => s.value !== d.status).map(s => (
                  <button key={s.value} onClick={() => updateStatus.mutate({ id: d.id, status: s.value })}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone: any) => (
            <div key={zone.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{zone.name}</h3>
                <span className={`badge ${zone.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {zone.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Min. buyurtma: <strong>{Number(zone.min_order).toLocaleString()} so'm</strong></p>
                <p>Yetkazib berish: <strong className="text-amber-600">{Number(zone.delivery_fee).toLocaleString()} so'm</strong></p>
                <p className="flex items-center gap-1"><Clock size={13} /> ~{zone.estimated_time} daqiqa</p>
              </div>
            </div>
          ))}
          {zones.length === 0 && (
            <div className="col-span-3 card text-center py-10 text-gray-400">
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p>Hududlar qo'shilmagan</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalNew} onClose={() => setModalNew(false)} title="Yangi yetkazib berish" size="lg">
        <NewDeliveryForm onClose={() => setModalNew(false)} />
      </Modal>
      <Modal isOpen={modalZone} onClose={() => setModalZone(false)} title="Yangi hudud">
        <ZoneForm onClose={() => setModalZone(false)} />
      </Modal>
    </div>
  )
}
