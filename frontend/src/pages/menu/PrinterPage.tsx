import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '../../services/api'
import { Plus, Pencil, Trash2, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { useForm } from 'react-hook-form'

interface PrinterType {
  id: number
  name: string
  location: string
  ip_address: string
  is_active: boolean
}

function PrinterForm({ initial, onClose }: { initial?: PrinterType; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({
    defaultValues: initial || { is_active: true }
  })
  const mutation = useMutation({
    mutationFn: (data: any) =>
      initial ? menuApi.updatePrinter(initial.id, data) : menuApi.createPrinter(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['printers'] })
      toast.success('Saqlandi!')
      onClose()
    },
    onError: () => toast.error('Xatolik'),
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="label">Printer nomi <span className="text-red-500">*</span></label>
        <input {...register('name', { required: true })} className="input"
          placeholder="Masalan: Oshxona #1, Salat bar..." />
      </div>
      <div>
        <label className="label">Joylashuv</label>
        <input {...register('location')} className="input"
          placeholder="Masalan: Asosiy oshxona, Salat stansiyasi..." />
      </div>
      <div>
        <label className="label">IP manzil (ixtiyoriy)</label>
        <input {...register('ip_address')} className="input" placeholder="192.168.1.100" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} defaultChecked className="w-4 h-4 accent-amber-500" />
        <span className="text-sm">Faol</span>
      </label>
      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          💾 Saqlash
        </button>
      </div>
    </form>
  )
}

export default function PrinterPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<PrinterType | null | 'new'>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['printers'],
    queryFn: () => menuApi.printers().then(r => r.data?.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuApi.deletePrinter(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['printers'] })
      toast.success("O'chirildi")
    },
  })

  const printers: PrinterType[] = data || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Printer size={20} className="text-amber-500" /> Printerlar boshqaruvi
        </h2>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi printer
        </button>
      </div>

      {/* Izoh */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>💡 Qanday ishlaydi:</strong> Har bir taomga printer tayinlang. 
        Buyurtma berganda taom avtomatik o'sha oshxona printeriga chiqadi.
        Masalan: Sho'rvalar → Oshxona #1, Salatlar → Salat bar.
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.map(printer => (
            <div key={printer.id} className={`card border-2 ${printer.is_active ? 'border-green-200' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${printer.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Printer size={20} className={printer.is_active ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{printer.name}</h3>
                    {printer.location && (
                      <p className="text-xs text-gray-500">{printer.location}</p>
                    )}
                  </div>
                </div>
                <span className={`badge ${printer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {printer.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              {printer.ip_address && (
                <p className="text-xs text-gray-400 mb-3">🌐 {printer.ip_address}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setModal(printer)}
                  className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                  <Pencil size={12} /> Tahrirlash
                </button>
                <button
                  onClick={() => { if (confirm("O'chirilsinmi?")) deleteMutation.mutate(printer.id) }}
                  className="flex-1 btn-danger text-xs py-1.5 flex items-center justify-center gap-1">
                  <Trash2 size={12} /> O'chirish
                </button>
              </div>
            </div>
          ))}
          {printers.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <Printer size={48} className="mx-auto mb-3 opacity-20" />
              <p>Printerlar qo'shilmagan</p>
              <button onClick={() => setModal('new')} className="btn-primary mt-3 text-sm">
                Printer qo'shish
              </button>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'new' ? '🖨️ Yangi printer' : '✏️ Printerni tahrirlash'}>
        {modal && (
          <PrinterForm
            initial={modal !== 'new' ? modal : undefined}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}
