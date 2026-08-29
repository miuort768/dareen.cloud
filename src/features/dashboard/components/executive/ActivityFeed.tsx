import { memo } from 'react'
import type { ActivityItem as ServiceItem } from '../../services/executiveService'
import {
  History,
  TrendingUp,
  UserPlus,
  CreditCard,
  Edit3,
  Trash2,
  GraduationCap,
  Lock,
  Clock,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, typeof History> = {
  // backend icon values (activity.js getIcon)
  finance: CreditCard,
  students: GraduationCap,
  teachers: UserPlus,
  sessions: History,
  system: Settings,
  other: History,
  // legacy keys kept as fallback
  person_add: UserPlus,
  payment: CreditCard,
  edit: Edit3,
  delete: Trash2,
  school: GraduationCap,
  lock: Lock,
  trending_up: TrendingUp,
}

const VARIANT_CONFIG: Record<string, { bg: string; text: string; chip: string; label: string }> = {
  // backend group values (activity.js getGroup)
  finance: {
    bg: 'bg-warning-soft',
    text: 'text-warning',
    chip: 'bg-warning-soft text-warning',
    label: 'مالية',
  },
  students: {
    bg: 'bg-primary-soft',
    text: 'text-primary',
    chip: 'bg-primary-soft text-primary',
    label: 'طلاب',
  },
  teachers: {
    bg: 'bg-info-soft',
    text: 'text-info',
    chip: 'bg-info-soft text-info',
    label: 'معلمات',
  },
  sessions: {
    bg: 'bg-success-soft',
    text: 'text-success',
    chip: 'bg-success-soft text-success',
    label: 'حصص',
  },
  system: {
    bg: 'bg-surface',
    text: 'text-muted',
    chip: 'bg-surface text-muted',
    label: 'نظام',
  },
  other: {
    bg: 'bg-surface',
    text: 'text-muted',
    chip: 'bg-surface text-muted',
    label: 'أخرى',
  },
  // legacy keys kept as fallback
  user: { bg: 'bg-info-soft', text: 'text-info', chip: 'bg-info-soft text-info', label: 'مستخدم' },
  session: {
    bg: 'bg-success-soft',
    text: 'text-success',
    chip: 'bg-success-soft text-success',
    label: 'حصص',
  },
  payment: {
    bg: 'bg-warning-soft',
    text: 'text-warning',
    chip: 'bg-warning-soft text-warning',
    label: 'مالية',
  },
}

const ACTION_LABELS: Record<string, string> = {
  TRANSACTION_CREATE: 'أنشأ معاملة مالية',
  TRANSACTION_DELETE: 'حذف معاملة مالية',
  EXPENSE_UPDATE: 'حدّث مصروفًا ثابتًا',
  INVOICE_CREATE: 'أنشأ فاتورة',
  INVOICE_UPDATE: 'حدّث فاتورة',
  INVOICE_DELETE: 'حذف فاتورة',
  STUDENT_CREATE: 'أضاف طالبًا جديدًا',
  STUDENT_UPDATE: 'حدّث بيانات طالب',
  STUDENT_DELETE: 'حذف طالب',
  TEACHER_CREATE: 'أضاف معلمة جديدة',
  TEACHER_UPDATE: 'حدّث بيانات معلمة',
  TEACHER_DELETE: 'حذف معلمة',
  SESSION_CREATE: 'جدول حصة جديدة',
  SESSION_UPDATE: 'حدّث حصة',
  SESSION_DELETE: 'حذف حصة',
  SETTING_UPDATE: 'عدّل إعدادات النظام',
  SYSTEM_RESET: 'أجرى إعادة تعيين للنظام',
  BACKUP_CREATED: 'أنشأ نسخة احتياطية',
  LOGIN: 'سجّل الدخول',
  LOGIN_FAILED: 'محاولة دخول فاشلة',
  LOGOUT: 'سجّل الخروج',
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return timestamp
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'الآن'
  if (diffSec < 3600) return `منذ ${Math.floor(diffSec / 60)} د`
  if (diffSec < 86400) return `منذ ${Math.floor(diffSec / 3600)} س`
  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

function actionLabel(item: ServiceItem): string {
  if (ACTION_LABELS[item.action]) return ACTION_LABELS[item.action]
  if (item.details) return item.details
  return item.action
}

export const ActivityFeed = memo(function ActivityFeed({ items }: { items: ServiceItem[] }) {
  if (!items) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-5 font-dash" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
            <History size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main">النشاطات</h3>
            <p className="text-[10px] text-muted">سجل العمليات المباشر</p>
          </div>
        </div>
        {items.length > 0 && (
          <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-black tabular-nums text-primary">
            {items.length}
          </span>
        )}
      </div>

      <div className="custom-scrollbar max-h-[300px] overflow-y-auto pe-1">
        {items.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <History size={16} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد نشاطات بعد</p>
            <p className="mt-0.5 text-[10px] text-dim">ستظهر العمليات هنا فور حدوثها</p>
          </div>
        )}
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || History
          const v = VARIANT_CONFIG[item.group] || VARIANT_CONFIG.other
          const isLast = i === items.length - 1

          return (
            <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <div className="absolute bottom-0 start-[19px] top-11 w-px bg-border" aria-hidden />
              )}
              <div
                className={cn(
                  'z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  v.bg,
                )}
              >
                <Icon size={15} className={v.text} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs leading-relaxed">
                  <span className="font-black text-primary">{item.username || 'النظام'}</span>{' '}
                  <span className="font-medium text-main">{actionLabel(item)}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 rounded-md bg-surface px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-muted">
                    <Clock size={8} />
                    {formatTimestamp(item.timestamp)}
                  </span>
                  <span className={cn('rounded-md px-1.5 py-0.5 text-[9px] font-bold', v.chip)}>
                    {v.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
