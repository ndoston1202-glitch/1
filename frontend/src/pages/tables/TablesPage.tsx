import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '../../services/api'
import { Plus, Users, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useForm } from 'react-hook-form'
import { Table, Reservation } from '../../types'

const statusOptions = [
  { value: 'free', label: 'Bo\'sh', color: 'bg-green-500' },
  { value: 'occupied', label: 'Band', color: 'bg-red-500' },
  { value: 'reserved', label: 'Bron', color: 'bg-yellow-500' },
  { value: 'cleaning', label: 'Tozalanmoqda', color: 'bg-blue-500' },
]

function TableForm({ initial, onClose }: { initial?: Table; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({ defaultValues: initial || { capacity: 4, is_active: true } })
  const mutation = useMutation({
    mutationFn: (data: any) => initial ? tablesApi.updateTable(initial.id, data) : tablesApi.createTable(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Saqlandi'); onClose() },
  })
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Stol raqami</label><input type="number" {...register('number', { required: true })} className="input" /></div>
        <div><label className="label">Sig'imi (kishi)</label><input type="number" {...register('capacity')} className="input" /></div>
      </div>
      <div><label className="label">Joylashuv (Zal, Teras...)</label><input {...register('location')} className="input" /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} id="tbl-active" />
        <label htmlFor="tbl-active" className="text-sm">Faol</label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Saqlash</button>
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Bron yaratildi'); onClose() },
  })
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="label">Stol</label>
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
        <div><label className="label">Vaqt (soat)</label><input type="number" {...register('duration')} className="input" defaultValue={2} /></div>
      </div>
      <div><label className="label">Bron vaqti</label><input type="datetime-local" {...register('reserved_at', { required: true })} className="input" /></div>
      <div><label className="label">Izoh</label><textarea {...register('notes')} className="input" rows={2} /></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Bron qilish</button>
      </div>
    </form>
  )
}

export default function TablesPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'tables' | 'reservations'>('tables')
  const [modalTable, setModalTable] = useState<Table | null | 'new'>(null)
  const [modalReserv, setModalReserv] = useState(false)

  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tablesApi.getTables().then((r) => r.data),
    refetchInterval: 20000,
  })

  const { data: reservData } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => tablesApi.getReservations().then((r) => r.data),
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
          {['tables', 'reservations'].map((t) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === t ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t === 'tables' ? 'Stollar' : 'Bronlar'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === 'tables' && (
            <button onClick={() => setModalTable('new')} className="btn-primary flex items-center gap-2"><Plus size={16} /> Yangi stol</button>
          )}
          {tab === 'reservations' && (
            <button onClick={() => setModalReserv(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Bron qilish</button>
          )}
        </div>
      </div>

      {tab === 'tables' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table: Table) => (
            <div key={table.id} className={`card cursor-pointer hover:shadow-md transition-all border-2 ${
              table.status === 'free' ? 'border-green-300' :
              table.status === 'occupied' ? 'border-red-300' :
              table.status === 'reserved' ? 'border-yellow-300' : 'border-blue-300'
            }`}>
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-gray-800">#{table.number}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                  <Users size={12} /> {table.capacity} kishi
                </div>
                {table.location && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} /> {table.location}
                  </div>
                )}
              </div>
              <StatusBadge status={table.status} type="table" />
              <div className="mt-3 grid grid-cols-2 gap-1">
                {statusOptions.map((s) => (
                  <button
                    key={s.value}
                    disabled={table.status === s.value}
                    onClick={() => changeStatus.mutate({ id: table.id, status: s.value })}
                    className={`text-xs py-1 px-1 rounded text-white transition-opacity ${s.color} ${table.status === s.value ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setModalTable(table)} className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700">
                Tahrirlash
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Mijoz</th>
                <th className="pb-3 font-medium">Stol</th>
                <th className="pb-3 font-medium">Mehmonlar</th>
                <th className="pb-3 font-medium">Bron vaqti</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r: Reservation) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div>{r.customer_name}</div>
                    <div className="text-xs text-gray-500">{r.customer_phone}</div>
                  </td>
                  <td className="py-3">#{r.table_number}</td>
                  <td className="py-3">{r.guest_count} kishi</td>
                  <td className="py-3 text-xs">{new Date(r.reserved_at).toLocaleString('uz-UZ')}</td>
                  <td className="py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!modalTable} onClose={() => setModalTable(null)} title={modalTable === 'new' ? 'Yangi stol' : 'Stolni tahrirlash'}>
        {modalTable && <TableForm initial={modalTable !== 'new' ? modalTable : undefined} onClose={() => setModalTable(null)} />}
      </Modal>
      <Modal isOpen={modalReserv} onClose={() => setModalReserv(false)} title="Stol bron qilish" size="lg">
        <ReservationForm onClose={() => setModalReserv(false)} />
      </Modal>
    </div>
  )
}
