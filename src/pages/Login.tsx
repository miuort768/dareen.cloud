import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, ArrowRight, Headphones, ArrowLeft } from 'lucide-react'
import { triggerHaptic } from '../lib/haptics'
import { useLogin, useAcademyName } from '../context/AppContext'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { SEO } from '../components/SEO'
import { MobileHeader } from '../components/public/MobileHeader'
import { PublicNavbar } from '../components/public/PublicNavbar'
import { cn } from '../lib/utils'

export const Login = () => {
  const academyName = useAcademyName()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useLogin()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `تسجيل الدخول — ${academyName}`
  }, [academyName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    triggerHaptic('medium')
    setError('')
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        const savedUser = useAuthStore.getState().currentUser
        if (savedUser?.role === 'chat_user') {
          navigate('/chat', { replace: true })
        } else if (savedUser?.role === 'parent') {
          navigate('/parent-dashboard', { replace: true })
        } else if (savedUser?.role === 'student') {
          navigate('/student-dashboard', { replace: true })
        } else if (savedUser?.role === 'teacher') {
          navigate('/teacher-dashboard', { replace: true })
        } else {
          navigate('/admin-dashboard', { replace: true })
        }
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.message.includes('Failed to fetch') || err.message.includes('Network Error'))
      ) {
        setError('تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت.')
      } else {
        setError(`حدث خطأ: ${err instanceof Error ? err.message : 'غير معروف'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen font-sans">
      <SEO
        title="تسجيل الدخول"
        description="تسجيل دخول الطلاب والمعلمين وأولياء الأمور إلى منصة دارين السابعة"
        url="https://dareen.cloud/login"
        image="/dareen_logo_new.jpg"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'تسجيل الدخول', item: '/login' },
        ]}
      />

      {/* Mobile Header */}
      <div className="relative z-20 lg:hidden">
        <MobileHeader />
      </div>

      {/* Mobile: Full Background Image */}
      <div className="fixed inset-0 lg:hidden">
        <img src="/loginphone.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
      </div>

      {/* Desktop Navbar */}
      <div className="relative z-20 hidden lg:block">
        <PublicNavbar />
      </div>

      {/* Desktop: Full Background Image */}
      <div className="fixed inset-0 hidden lg:block">
        <img src="/login1.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/80 to-white/20 dark:from-background dark:via-background dark:to-background" />
      </div>

      {/* Form — Centered on both, always light-themed */}
      <div className="relative z-10 flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-8 lg:min-h-screen lg:pt-24">
        <div className="mt-32 w-full max-w-sm dark:rounded-2xl dark:bg-white dark:p-8 dark:shadow-2xl lg:mt-0 lg:max-w-md xl:max-w-lg">
          <div className="mb-8 text-center lg:mb-10">
            <h1 className="mb-2 hidden font-heading text-2xl font-black text-main lg:block lg:text-3xl">
              تسجيل الدخول
            </h1>
            <p className="text-sm font-medium text-white/80 dark:text-muted lg:text-base lg:text-main">
              أدخل بياناتك للوصول إلى حسابك
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-error-soft bg-error-soft p-4 dark:border-error-soft dark:bg-error-soft">
              <p className="text-sm font-bold text-error dark:text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="mb-1.5 block text-xs font-bold text-white/80 dark:text-main lg:text-sm lg:text-main"
              >
                اسم المستخدم
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                  className="h-12 w-full rounded-xl border border-border bg-card pe-4 ps-12 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-card dark:text-main dark:placeholder:text-muted lg:h-14 lg:text-base"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-bold text-white/80 dark:text-main lg:text-sm lg:text-main"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="h-12 w-full rounded-xl border border-border bg-card pe-12 ps-12 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-card dark:text-main dark:placeholder:text-muted lg:h-14 lg:text-base"
                  style={{ fontVariantNumeric: showPassword ? 'normal' : 'tabular-nums' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted outline-none transition-colors hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-slow lg:h-14 lg:text-base',
                'bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.98]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'shadow-elevation-3 shadow-primary/20 hover:shadow-elevation-4 hover:shadow-primary/30',
              )}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-on-primary" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 lg:mt-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-white/80 dark:text-warning lg:text-base lg:text-warning lg:hover:text-warning-dark"
            >
              <ArrowRight size={16} />
              <span>العودة للرئيسية</span>
            </Link>

            <div className="w-full border-t border-border pt-4 dark:border-border">
              <a
                href={`https://wa.me/${adminPhone.replace(/\D/g, '')}?text=أحتاج مساعدة في تسجيل الدخول`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-success text-sm font-bold text-on-success transition-all hover:bg-success active:scale-[0.98] lg:h-14 lg:text-base"
              >
                <Headphones size={18} />
                <span>الدعم الفني</span>
              </a>
              <p className="mt-3 text-center text-xs font-medium text-white/90 dark:text-muted lg:text-sm lg:text-main">
                لديك مشكلة؟ تواصل مع الدعم
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
