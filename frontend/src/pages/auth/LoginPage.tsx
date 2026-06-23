import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success(`Xush kelibsiz, ${user.full_name || user.username}!`)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login yoki parol noto\'g\'ri'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Restoran Boshqaruv</h1>
          <p className="text-gray-500 mt-1">Hisobingizga kiring</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Foydalanuvchi nomi</label>
            <input
              {...register('username', { required: 'Foydalanuvchi nomini kiriting' })}
              className="input"
              placeholder="admin"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="label">Parol</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Parolni kiriting' })}
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Restoran Boshqaruv Tizimi v1.0
        </p>
      </div>
    </div>
  )
}
