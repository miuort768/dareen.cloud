import { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface PasswordConfirmModalProps {
  show: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: (password: string) => Promise<void>
  onClose: () => void
}

export const PasswordConfirmModal = ({
  show,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: PasswordConfirmModalProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!show) return null

  const handleConfirm = async () => {
    if (!password) {
      setError('أدخل كلمة المرور')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onConfirm(password)
      setPassword('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'كلمة المرور غير صحيحة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 animate-in fade-in md:items-center md:p-4"
      dir="rtl"
    >
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-x-0 border-t border-border bg-card shadow-lg md:max-h-none md:max-w-md md:overflow-hidden md:rounded-2xl md:border-x md:border-b">
        <div className="space-y-3 border-b border-divider p-5 text-center md:p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-warning">
            <Lock size={20} />
          </div>
          <h3 className="text-base font-bold text-main">{title}</h3>
          <p className="text-xs leading-relaxed text-muted">{description}</p>
        </div>
        <div className="space-y-4 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-6">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-muted">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label="كلمة المرور"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm()
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-divider bg-background px-4 py-3 pe-11 text-sm font-bold text-dim text-main outline-none transition-all duration-normal focus:border-primary focus:ring-2 focus:ring-primary/10"
                autoFocus
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-main"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p className="mt-1.5 text-[11px] font-bold text-error">{error}</p>}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-warning-soft px-4 py-3 text-[11px] font-bold text-warning-dark">
            <ShieldCheck size={13} className="shrink-0" />
            إجراء حساس — يُطلب إدخال كلمة مرور المسؤول للتأكيد.
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                onClose()
                setPassword('')
                setError('')
              }}
              className="flex-1 rounded-xl border border-divider py-3 text-xs font-bold text-muted outline-none transition-all hover:bg-surface hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              تراجع
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
                submitting && 'opacity-60',
              )}
            >
              {submitting ? <RefreshCw size={13} className="animate-spin" /> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
