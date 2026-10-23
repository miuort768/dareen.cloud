import { BookOpen, CalendarDays, Clock, ShieldCheck } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { AppointmentEvent } from '../types'

interface AppointmentDetailBodyProps {
  appointment: AppointmentEvent
}

interface InfoCellProps {
  icon: typeof Clock
  label: string
  value: string | null | undefined
  toneClassName: string
  children?: React.ReactNode
}

const InfoCell = ({ icon: Icon, label, value, toneClassName, children }: InfoCellProps) => (
  <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3">
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface ring-1 ring-border',
        toneClassName,
      )}
    >
      <Icon size={15} strokeWidth={1.7} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-micro font-bold text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-main">{value}</p>
      {children}
    </div>
  </div>
)

/** جسم نافذة تفاصيل الموعد — بطاقة طالب بارزة + شبكة بيانات محايدة (مشترك بين الكمبيوتر والهاتف) */
export const AppointmentDetailBody = ({ appointment }: AppointmentDetailBodyProps) => {
  const initial = appointment.studentName?.trim()?.charAt(0) || '؟'

  return (
    <div className="space-y-2.5">
      {/* بطاقة الطالب البارزة */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-elevation-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-lg font-black text-on-primary shadow-elevation-1">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black text-main md:text-lg">
            {appointment.studentName}
          </p>
          {appointment.studentGrade && (
            <span className="mt-1 inline-block rounded-lg bg-surface px-2 py-0.5 text-micro font-bold text-muted ring-1 ring-border">
              {appointment.studentGrade}
            </span>
          )}
        </div>
      </div>

      {/* شريط الموعد: اليوم في مستطيل ملون بلون واضح + الوقت */}
      <div className="flex items-stretch gap-2.5">
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-gradient-to-l from-primary to-primary-deep p-3 text-on-primary shadow-elevation-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
            <CalendarDays size={16} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-micro font-bold text-white/80">اليوم</p>
            <p className="truncate text-sm font-black text-white">{appointment.day}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-border bg-surface p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary ring-1 ring-border">
            <Clock size={15} strokeWidth={1.7} />
          </div>
          <div className="min-w-0">
            <p className="text-micro font-bold text-muted">الوقت</p>
            <p className="truncate font-dash text-base font-black text-main">{appointment.time}</p>
          </div>
        </div>
      </div>

      {/* المعلمة + المادة */}
      <div className="grid grid-cols-2 gap-2.5">
        <InfoCell
          icon={ShieldCheck}
          label="المعلمة"
          value={appointment.teacherName ?? 'غير محددة'}
          toneClassName="text-info"
        />
        <InfoCell
          icon={BookOpen}
          label="المادة"
          value={appointment.subject}
          toneClassName="text-warning"
        />
      </div>
    </div>
  )
}
