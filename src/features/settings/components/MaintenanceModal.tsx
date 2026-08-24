import { useState } from 'react'
import { Lock, Users, ShieldCheck, Snowflake } from 'lucide-react'
import { Image } from '../../../shared/components/ui'
import { cn } from '../../../lib/utils'

interface MaintenanceModalProps {
  showMaintenanceModal: boolean
  setShowMaintenanceModal: (v: boolean) => void
  maintenanceTarget: boolean
  setMaintenanceTarget: (v: boolean) => void
  setMaintenanceMode: (v: boolean) => Promise<void> | void
  showNotify: (msg: string) => void
}

const CONFIRM_WORD = 'dareen'

export const MaintenanceModal = ({
  showMaintenanceModal,
  setShowMaintenanceModal,
  maintenanceTarget,
  setMaintenanceTarget,
  setMaintenanceMode,
  showNotify,
}: MaintenanceModalProps) => {
  const [input, setInput] = useState('')

  if (!showMaintenanceModal) return null

  const isEnabled = maintenanceTarget
  const handleConfirm = () => {
    Promise.resolve(setMaintenanceMode(isEnabled)).then(() => {
      setShowMaintenanceModal(false)
      setInput('')
      setMaintenanceTarget(isEnabled)
      showNotify(isEnabled ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف وضع الصيانة')
    })
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="border-border/20 space-y-4 border-b p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
            <Image
              src="/dareen_logo_new.webp"
              alt="دارين السابعة"
              className="h-11 w-11"
              imgClassName="object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-main">
              {isEnabled ? 'تفعيل وضع الصيانة' : 'إيقاف وضع الصيانة'}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {isEnabled
                ? 'سيتم منع جميع الطلاب والمعلمين وأولياء الأمور من تسجيل الدخول حتى يتم إيقاف الوضع.'
                : 'سيتم السماح للمستخدمين بتسجيل الدخول والاستخدام الطبيعي للمنصة من جديد.'}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border/20 flex flex-col items-center gap-2 rounded-xl border bg-background p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-soft text-error">
                <Lock size={16} />
              </div>
              <p className="text-[11px] font-bold text-main">
                {isEnabled ? 'تعطيل الدخول' : 'السماح بالدخول'}
              </p>
            </div>
            <div className="border-border/20 flex flex-col items-center gap-2 rounded-xl border bg-background p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <Users size={16} />
              </div>
              <p className="text-[11px] font-bold text-main">
                {isEnabled ? 'جلسات نشطة ستُنهى' : 'جلسات المستخدمين تعود للعمل'}
              </p>
            </div>
          </div>

          <div className="border-border/20 space-y-3 rounded-xl border bg-surface p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <ShieldCheck size={13} className="text-primary" />
              اكتب{' '}
              <span dir="ltr" className="select-all font-mono text-primary">
                {CONFIRM_WORD}
              </span>{' '}
              للتأكيد
            </p>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب dareen..."
              dir="ltr"
              className="border-border/30 placeholder:text-muted/50 w-full rounded-xl border bg-background px-4 py-3 text-center font-mono text-sm font-bold text-main transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowMaintenanceModal(false)
                setInput('')
              }}
              className="border-border/30 flex-1 rounded-xl border py-3 text-xs font-bold text-muted transition-all hover:bg-surface hover:text-main active:scale-[0.97]"
            >
              تراجع
            </button>
            <button
              disabled={input.trim().toLowerCase() !== CONFIRM_WORD}
              onClick={handleConfirm}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40',
                isEnabled
                  ? 'bg-error text-on-error hover:bg-error-hover'
                  : 'bg-primary text-on-primary hover:bg-primary-hover',
              )}
            >
              <Snowflake size={13} className={cn(isEnabled && 'animate-spin-slow')} />
              {isEnabled ? 'تأكيد التفعيل' : 'تأكيد الإيقاف'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
