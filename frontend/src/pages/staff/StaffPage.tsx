import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, staffApi } from '../../services/api'
import { Plus, UserCheck, Clock, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { User } from '../../types'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Menejer' },
  { value: 'waiter', label: 'Ofitsiant' },
  { value: 'cashier', label: 'Kassir' },
  { value: 'chef', label: 'Oshpaz' },
  { value: 'delivery', label: 'Kuryer' },
]

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  waiter: 'bg-green-100 text-green-700',
  cashier: 'bg-amber-100 text-amber-700',
  chef: 'bg-red-100 text-red-700',
  delivery: 'bg-teal-100 text-teal-700',
}

function UserForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const mutation = useMutation({
    mutationFn: (data: any) => authApi.createUser(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Xodim qo\'shildi'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.username?.[0] || 'Xatolik'),
  })
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Ism</label><input {...register('first_name', { required: true })} className="input" /></div>
        <div><label className="label">Familiya</label><input {...register('last_name')} className="input" /></div>
      </div>
      <div><label className="label">Foydalanuvchi nomi</label><input {...register('username', { required: true })} className="input" /></div>
      <div><label className="label">Telefon</label><input {...register('phone')} className="input" /></div>
      <div>
        <label className="label">Lavozim</label>
        <select {...register('role')} className="input">
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Parol</label><input type="password" {...register('password', { required: true, minLength: 6 })} className="input" /></div>
        <div><label className="label">Parolni tasdiqlash</label><input type="password" {...register('password_confirm', { required: true })} className="input" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Qo'shish</button>
      </div>
    </form>
  )
}

export default function StaffPage() {
  const [tab, setTab] = useState<'users' | 'shifts' | 'attendance'>('users')
  const [modalNew, setModalNew] = useState(false)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getUsers().then(r => r.data),
  })

  const { data: shiftsData } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => staffApi.getShifts().then(r => r.data),
  })

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => staffApi.getAttendance().then(r => r.data),
  })

  const users = usersData?.results || usersData || []
  const shifts = shiftsData?.results || shiftsData || []
  const attendance = attendanceData?.results || attendanceData || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: 'users', label: 'Xodimlar', icon: UserCheck },
            { key: 'shifts', label: 'Smenalar', icon: Clock },
            { key: 'attendance', label: 'Davomat', icon: Calendar },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${tab === key ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        {tab === 'users' && (
          <button onClick={() => setModalNew(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Yangi xodim
          </button>
        )}
      </div>

      {tab === 'users' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user: User) => (
            <div key={user.id} className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg">
                  {user.first_name?.[0] || user.username[0]}
                </div>
                <div>
                  <p className="font-semibold">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`badge ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                  {ROLES.find(r => r.value === user.role)?.label || user.role}
                </span>
                <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              {user.phone && <p className="text-xs text-gray-500 mt-2">{user.phone}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'shifts' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Xodim</th>
                <th className="pb-2 font-medium">Boshlanish</th>
                <th className="pb-2 font-medium">Tugash</th>
                <th className="pb-2 font-medium">Davomiyligi</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift: any) => (
                <tr key={shift.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{shift.employee_name}</td>
                  <td className="py-2 text-xs">{new Date(shift.started_at).toLocaleString('uz-UZ')}</td>
                  <td className="py-2 text-xs">{shift.ended_at ? new Date(shift.ended_at).toLocaleString('uz-UZ') : '—'}</td>
                  <td className="py-2">{shift.duration_hours ? `${shift.duration_hours} soat` : 'Davom etmoqda'}</td>
                  <td className="py-2">
                    <span className={`badge ${shift.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {shift.status === 'active' ? 'Faol' : 'Yakunlangan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shifts.length === 0 && <p className="text-center text-gray-400 py-6">Smenalar yo'q</p>}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Xodim</th>
                <th className="pb-2 font-medium">Sana</th>
                <th className="pb-2 font-medium">Kelish</th>
                <th className="pb-2 font-medium">Ketish</th>
                <th className="pb-2 font-medium">Holat</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a: any) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{a.employee_name}</td>
                  <td className="py-2">{a.date}</td>
                  <td className="py-2">{a.check_in || '—'}</td>
                  <td className="py-2">{a.check_out || '—'}</td>
                  <td className="py-2">
                    <span className={`badge ${a.is_present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {a.is_present ? 'Keldi' : 'Kelmadi'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && <p className="text-center text-gray-400 py-6">Davomat ma'lumotlari yo'q</p>}
        </div>
      )}

      <Modal isOpen={modalNew} onClose={() => setModalNew(false)} title="Yangi xodim qo'shish" size="lg">
        <UserForm onClose={() => setModalNew(false)} />
      </Modal>
    </div>
  )
}
