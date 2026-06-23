export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${s} border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin`} />
    </div>
  )
}
