interface Props {
  status: string
  type?: 'order' | 'table' | 'delivery' | 'payment'
}

const orderColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-teal-100 text-teal-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
}

const tableColors: Record<string, string> = {
  free: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  cleaning: 'bg-blue-100 text-blue-800',
}

const deliveryColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-orange-100 text-orange-800',
  on_way: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

const labels: Record<string, string> = {
  pending: 'Kutilmoqda', confirmed: 'Tasdiqlangan', preparing: 'Tayyorlanmoqda',
  ready: 'Tayyor', served: 'Berildi', completed: 'Yakunlangan', cancelled: 'Bekor',
  free: 'Bo\'sh', occupied: 'Band', reserved: 'Bron', cleaning: 'Tozalanmoqda',
  assigned: 'Tayinlangan', picked_up: 'Olingan', on_way: 'Yo\'lda', delivered: 'Yetkazildi',
  failed: 'Muvaffaqiyatsiz',
}

export default function StatusBadge({ status, type = 'order' }: Props) {
  const colorMap = type === 'table' ? tableColors : type === 'delivery' ? deliveryColors : orderColors
  const color = colorMap[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`badge ${color}`}>{labels[status] || status}</span>
  )
}
