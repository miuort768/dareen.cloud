import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Phone, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { triggerHaptic } from '../../lib/haptics'

export interface ProfileEditValues {
  name: string
  phone?: string
}

interface EditNameModalProps {
  isOpen: boolean
  initialName: string
  initialPhone?: string
  saving?: boolean
  onClose: () => void
  /** يُستدعى بالقيم الجديدة — الاسم مطلوب، الهاتف اختياري (11 رقمًا أو فارغ) */
  onSubmit: (values: ProfileEditValues) => void | Promise<void>
}

/**
 * تعديل بيانات الحساب (الاسم + رقم الجوال) لكل الأدوار.
 * Bottom Sheet على الهاتف ونافذة مركزية على الشاشات الكبيرة.
 * يُرسم عبر React Portal خارج سياق التكديس الرئيسي حتى لا يظهر
 * أسفل شريط التنقل السفلي (AppTabBar) على الهاتف.
 */
export const EditNameModal = ({
  isOpen,
  initialName,
  initialPhone = '',
  saving = false,
  onClose,
  onSubmit,
}: EditNameModalProps) => {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setPhone(initialPhone)
    }
  }, [isOpen, initialName, initialPhone])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || saving) return
    triggerHaptic('light')
    await onSubmit({ name: name.trim(), phone: phone.trim() })
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="edit-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="تعديل بيانات الحساب"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevation-3 sm:rounded-2xl"
            dir="rtl"
          >
            {/* مقبض السحب — هاتف */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1.5 w-10 rounded-full bg-border" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
              <div>
                <h3 className="text-sm font-bold text-main">تعديل بيانات الحساب</h3>
                <p className="mt-0.5 text-micro text-muted">يمكنك تحديث الاسم ورقم الجوال فقط</p>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted transition-colors hover:bg-hover hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                ✕<span className="sr-only">إغلاق</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="account-name"
                  className="flex items-center gap-1.5 text-xs font-bold text-muted"
                >
                  <User size={12} className="text-primary" />
                  الاسم
                </label>
                <input
                  id="account-name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="account-phone"
                  className="flex items-center gap-1.5 text-xs font-bold text-muted"
                >
                  <Phone size={12} className="text-primary" />
                  رقم الجوال
                </label>
                <input
                  id="account-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  disabled={saving}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-bold tabular-nums text-main outline-none transition-all placeholder:font-sans placeholder:font-medium placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
                  placeholder="01XXXXXXXXX"
                />
                {phone && !/^01[0-9]{9}$/.test(phone) && (
                  <p className="text-micro font-bold text-warning">
                    الرقم يجب أن يكون 11 خانة ويبدأ بـ 01
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-xl border border-border bg-surface py-3 text-xs font-bold text-main transition-all hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !name.trim() ||
                    (name.trim() === initialName && phone.trim() === initialPhone.trim())
                  }
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary shadow-elevation-1 transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
