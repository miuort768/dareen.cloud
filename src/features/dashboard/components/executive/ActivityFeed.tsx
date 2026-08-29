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

const VARIANT_CONFIG: Record<string, { bg: string; text: string }> = {
  // backend group values (activity.js getGroup)
  finance: { bg: 'bg-warning-soft', text: 'text-warning' },
  students: { bg: 'bg-primary-soft', text: 'text-primary' },
  teachers: { bg: 'bg-info-soft', text: 'text-info' },
  sessions: { bg: 'bg-success-soft', text: 'text-success' },
  system: { bg: 'bg-surface', text: 'text-muted' },
  other: { bg: 'bg-surface', text: 'text-muted' },
  // legacy keys kept as fallback
  user: { bg: 'bg-info-soft', text: 'text-info' },
  session: { bg: 'bg-success-soft', text: 'text-success' },
  payment: { bg: 'bg-warning-soft', text: 'text-warning' },
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
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
          <History size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-main">النشاطات</h3>
          <p className="text-[10px] text-muted">آخر العمليات</p>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[280px] space-y-1.5 overflow-y-auto">
        {items.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <History size={16} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد نشاطات</p>
          </div>
        )}
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || History
          const v = VARIANT_CONFIG[item.group] || VARIANT_CONFIG.system || { bg: '', text: '' }

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface"
            >
              <div
                className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', v.bg)}
              >
                <Icon size={13} className={v.text} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-main">
                  <span className="text-primary">{item.username || 'النظام'}</span>{' '}
                  {actionLabel(item)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Clock size={9} className="text-muted" />
                <span className="text-[9px] tabular-nums text-muted">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
