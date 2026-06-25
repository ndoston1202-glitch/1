import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '../../services/api'
import { Plus, Users, MapPin, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useForm } from 'react-hook-form'
import { Table, Reservation } from '../../types'
import NewOrderModal from '../orders/NewOrderModal'

const STATUS_COLORS: Record<string, string> = {
  free:     'border-green-400 bg-green-50',
  occupied: 'border-red-400 bg-red-50',
  reserved: 'border-yellow-400 bg-yellow-50',
  cleaning: 'border-blue-400 bg-blue-50',
}

const STATUS_LABELS: Record<string, string> = {
  free: 'Bo\'sh', occupied: 'Band', reserved: 'Bron', cleaning: 'Tozalanmoqda'
}

function TableForm({ initial, onClose }: { initial?: Table; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({ defaultValues: initial || { capacity: 4, is_active: true } })
  const mutation = useMutation({
    mutationFn: (data: any) => initial ? tablesApi.updateTable(initial.id, data) : tablesApi.createTable(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Saqlandi!'); onClose() },
  })
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Stol raqami</label><input type="number" {...register('number', { required: true })} className="input" /></div>
        <div><label className="label">Sig'imi (kishi)</label><input type="number" {...register('capacity')} className="input" /></div>
      </div>
      <div><label className="label">Joylashuv (Zal, Teras, VIP...)</label><input {...register('location')} className="input" /></div>
      <label className="flex items-center gap-2"><input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-amber-500" /><span className="text-sm">Faol</span></label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>💾 Saqlash</button>
      </div>
    </form>
  )
}

function ReservationForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: tables } = useQuery({ queryKey: ['tables'], queryFn: () => tablesApi.getTables().then(r => r.data?.results || r.data) })
  const { register, handleSubmit } = useForm()
  const mutation = useMutation({
    mutationFn: (data: any) => tablesApi.createReservation(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Bron yaratildi!'); onClose() },
  })
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div><label className="label">Stol</label>
        <select {...register('table', { required: true })} className="input">
          {(tables || []).map((t: Table) => <option key={t.id} value={t.id}>Stol #{t.number} ({t.capacity} kishi)</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Mijoz ismi</label><input {...register('customer_name', { required: true })} className="input" /></div>
        <div><label className="label">Telefon</label><input {...register('customer_phone')} className="input" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Mehmonlar soni</label><input type="number" {...register('guest_count', { required: true })} className="input" /></div>
        <div><label className="label">Davomiyligi (soat)</label><input type="number" {...register('duration')} className="input" defaultValue={2} /></div>
      </div>
      <div><label className="label">Bron vaqti</label><input type="datetime-local" {...register('reserved_at', { required: true })} className="input" /></div>
      <div><label className="label">Izoh</label><textarea {...register('notes')} className="input" rows={2} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>📅 Bron qilish</button>
      </div>
    </form>
  )
}

export default function TablesPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'tables' | 'reservations'>('tables')
  const [modalTable, setModalTable] = useState<Table | null | 'new'>(null)
  const [modalReserv, setModalReserv] = useState(false)
  const [orderTable, setOrderTable] = useState<Table | null>(null)

  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tablesApi.getTables().then(r => r.data),
    refetchInterval: 20000,
  })

  const { data: reservData } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => tablesApi.getReservations().then(r => r.data),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => tablesApi.changeStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })

  const tables = tablesData?.results || tablesData || []
  const reservations = reservData?.results || reservData || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {[{ k: 'tables', l: '🪑 Stollar' }, { k: 'reservations', l: '📅 Bronlar' }].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === k ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === 'tables' && <button onClick={() => setModalTable('new')} className="btn-primary flex items-center gap-2"><Plus size={16} /> Yangi stol</button>}
          {tab === 'reservations' && <button onClick={() => setModalReserv(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Bron qilish</button>}
        </div>
      </div>

      {/* Ranglar izohi */}
      {tab === 'tables' && (
        <div className="flex gap-4 text-xs text-gray-500 bg-white p-3 rounded-xl border">
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded border-2 ${STATUS_COLORS[k]}`}></span> {v}
            </span>
          ))}
          <span className="ml-auto text-gray-400">💡 Stolni bosing → Buyurtma bering</span>
        </div>
      )}

      {tab === 'tables' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table: Table) => (
            <div key={table.id}
              className={`card cursor-pointer hover:shadow-lg transition-all border-2 ${STATUS_COLORS[table.status]} hover:scale-[1.02]`}>
              {/* Stol raqami - bosish → buyurtma */}
              <div className="text-center mb-3" onClick={() => setOrderTable(table)}>
                <div className="text-3xl font-bold text-gray-800">#{table.number}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                  <Users size={12} /> {table.capacity} kishi
                </div>
                {table.location && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={11} /> {table.location}
                  </div>
                )}
                <div className="mt-2">
                  <StatusBadge status={table.status} type="table" />
                </div>
              </div>

              {/* Buyurtma tugmasi */}
              <button
                onClick={() => setOrderTable(table)}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 mb-2 transition-colors">
                <ClipboardList size={13} /> Buyurtma
              </button>

              {/* Status tugmalari */}
              <div className="grid grid-cols-2 gap-1">
                {[
                  { v: 'free',     l: "Bo'sh",       c: 'bg-green-500' },
                  { v: 'occupied', l: 'Band',         c: 'bg-red-500' },
                  { v: 'reserved', l: 'Bron',         c: 'bg-yellow-500' },
                  { v: 'cleaning', l: 'Tozalash',     c: 'bg-blue-500' },
                ].map(s => (
                  <button key={s.v} disabled={table.status === s.v}
                    onClick={() => changeStatus.mutate({ id: table.id, status: s.v })}
                    className={`text-[10px] py-1 px-1 rounded text-white transition-opacity ${s.c} ${table.status === s.v ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'}`}>
                    {s.l}
                  </button>
                ))}
              </div>
              <button onClick={() => setModalTable(table)} className="w-full mt-1.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                ✏️ Tahrirlash
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Mijoz</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Stol</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Mehmonlar</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Bron vaqti</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r: Reservation) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.customer_name}</div>
                    <div className="text-xs text-gray-400">{r.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">#{r.table_number}</span></td>
                  <td className="px-4 py-3">{r.guest_count} kishi</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.reserved_at).toLocaleString('uz-UZ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {reservations.length === 0 && <div className="text-center py-10 text-gray-400">Bronlar yo'q</div>}
        </div>
      )}

      {/* Stol ustida buyurtma berish */}
      <Modal
        isOpen={!!orderTable}
        onClose={() => setOrderTable(null)}
        title={`🪑 Stol #${orderTable?.number} — Buyurtma`}
        size="xl">
        {orderTable && (
          <NewOrderModal
            orderType="dine_in"
            tableId={orderTable.id}
            onClose={() => {
              setOrderTable(null)
              qc.invalidateQueries({ queryKey: ['tables'] })
              // Stolni "band" qilish
              tablesApi.changeStatus(orderTable.id, 'occupied')
            }}
          />
        )}
      </Modal>

      {/* Stol tahrirlash */}
      <Modal isOpen={!!modalTable} onClose={() => setModalTable(null)} title={modalTable === 'new' ? 'Yangi stol' : 'Stolni tahrirlash'}>
        {modalTable && <TableForm initial={modalTable !== 'new' ? modalTable : undefined} onClose={() => setModalTable(null)} />}
      </Modal>

      {/* Bron */}
      <Modal isOpen={modalReserv} onClose={() => setModalReserv(false)} title="📅 Stol bron qilish" size="lg">
        <ReservationForm onClose={() => setModalReserv(false)} />
      </Modal>
    </div>
  )
}
