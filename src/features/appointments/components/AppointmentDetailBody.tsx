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
  bigValue?: boolean
  children?: React.ReactNode
}

const InfoCell = ({
  icon: Icon,
  label,
  value,
  toneClassName,
  bigValue = false,
  children,
}: InfoCellProps) => (
  <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3">
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface',
        toneClassName,
      )}
    >
      <Icon size={14} strokeWidth={1.7} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-micro font-bold text-muted">{label}</p>
      <p
        className={cn(
          'mt-0.5 truncate font-bold text-main',
          bigValue ? 'font-dash text-lg font-black' : 'text-sm',
        )}
      >
        {value}
      </p>
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-black text-primary ring-1 ring-border">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black text-main md:text-lg">
            {appointment.studentName}
          </p>
          {appointment.studentGrade && (
            <span className="mt-1 inline-block rounded-md bg-surface px-2 py-0.5 text-micro font-bold text-muted">
              {appointment.studentGrade}
            </span>
          )}
        </div>
      </div>

      {/* شبكة البيانات */}
      <div className="grid grid-cols-2 gap-2">
        <InfoCell
          icon={Clock}
          label="الوقت"
          value={appointment.time}
          toneClassName="text-primary"
          bigValue
        />
        <InfoCell
          icon={CalendarDays}
          label="اليوم"
          value={appointment.day}
          toneClassName="text-primary"
        />
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
        >
          {appointment.curriculum && (
            <span className="mt-1 inline-block rounded-md bg-surface px-1.5 py-0.5 text-micro font-bold text-muted">
              {appointment.curriculum}
            </span>
          )}
        </InfoCell>
      </div>
    </div>
  )
}
