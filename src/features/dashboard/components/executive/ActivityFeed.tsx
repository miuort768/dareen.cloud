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
  LogIn,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, typeof History> = {
  // backend icon values (activity.js getIcon)
  finance: CreditCard,
  students: GraduationCap,
  teachers: UserPlus,
  sessions: History,
  auth: LogIn,
  live: Video,
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
  auth: {
    bg: 'bg-info-soft',
    text: 'text-info',
    chip: 'bg-info-soft text-info',
    label: 'دخول وخروج',
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
  // auth
  LOGIN_SUCCESS: 'سجّل الدخول',
  LOGIN_FAILED: 'محاولة دخول فاشلة',
  LOGOUT: 'سجّل الخروج',
  LOGOUT_ALL: 'سجّل الخروج من كل الأجهزة',
  REFRESH_TOKEN: 'جدّد جلسة الدخول',
  TOKEN_VERIFIED: 'تحقق من جلسة الدخول',
  PASSWORD_RESET_REQUESTED: 'طلب استعادة كلمة المرور',
  PASSWORD_RESET_COMPLETED: 'استعاد كلمة المرور',
  // live sessions (حضور / انصراف)
  LIVE_SESSION_START: 'حضور — بدأ حصة مباشرة',
  LIVE_SESSION_END: 'انصراف — انتهت الحصة',
  // finance
  TRANSACTION_CREATED: 'أنشأ معاملة مالية',
  TRANSACTION_DELETED: 'حذف معاملة مالية',
  TRANSACTION_DELETED_ALL: 'حذف كل المعاملات',
  EXPENSE_UPDATED: 'حدّث مصروفًا ثابتًا',
  EXPENSE_RESET: 'صفّر المصروفات',
  INVOICE_CREATED: 'أنشأ فاتورة',
  INVOICE_UPDATED: 'حدّث فاتورة',
  INVOICE_DELETED: 'حذف فاتورة',
  INVOICE_PAID: 'سدد فاتورة',
  INVOICE_CANCELLED: 'ألغى فاتورة',
  INVOICE_RESTORED: 'استعاد فاتورة',
  REFUND_PROCESSED: 'نفّذ استردادًا ماليًا',
  EXPORT_DATA: 'صدّر بيانات',
  // students / parents
  STUDENT_CREATED: 'أضاف طالبًا جديدًا',
  STUDENT_UPDATED: 'حدّث بيانات طالب',
  STUDENT_DELETED: 'حذف طالب',
  PARENT_CREATED: 'أضاف ولي أمر جديد',
  PARENT_UPDATED: 'حدّث بيانات ولي أمر',
  PARENT_DELETED: 'حذف ولي أمر',
  PARENT_DELETED_ALL: 'حذف ولي أمر مع أبنائه',
  // teachers
  TEACHER_CREATED: 'أضاف معلمة جديدة',
  TEACHER_UPDATED: 'حدّث بيانات معلمة',
  TEACHER_DELETED: 'حذف معلمة',
  TEACHER_SUSPENDED: 'أوقف معلمة',
  // enrollments
  ENROLLMENT_CREATED: 'أنشأ اشتراكًا جديدًا',
  ENROLLMENT_UPDATED: 'حدّث اشتراكًا',
  ENROLLMENT_DELETED: 'حذف اشتراكًا',
  ENROLLMENT_RESTORED: 'استعاد اشتراكًا',
  ENROLLMENT_SUSPENDED: 'أوقف اشتراكًا',
  // sessions
  SESSION_CREATED: 'جدول حصة جديدة',
  SESSION_UPDATED: 'حدّث حصة',
  SESSION_DELETED: 'حذف حصة',
  // users / roles
  USER_CREATED: 'أنشأ مستخدمًا للنظام',
  USER_UPDATED: 'حدّث مستخدمًا للنظام',
  USER_DELETED: 'حذف مستخدمًا للنظام',
  ROLE_CHANGED: 'غيّر دور مستخدم',
  PERMISSION_GRANTED: 'منح صلاحية جديدة',
  PERMISSION_REVOKED: 'سحب صلاحية',
  // system
  SETTING_UPDATED: 'عدّل إعدادات النظام',
  SYSTEM_RESET: 'أجرى إعادة تعيين للنظام',
  SYSTEM_ERROR: 'حدث خطأ في النظام',
  BACKUP_CREATED: 'أنشأ نسخة احتياطية',
  // account migration
  ACCOUNT_CREATED: 'أنشأ حساب دخول',
  ACCOUNT_LINKED: 'ربط حساب دخول',
  ACCOUNT_CUTOVER: 'أتم ترحيل حساب دخول',
  ACCOUNT_SKIPPED_DUPLICATE: 'تخطى حسابًا مكررًا',
  ACCOUNT_MIGRATION_FAILED: 'فشل في ترحيل حساب',
  AUTH_SOURCE_ACCOUNTS: 'دخل عبر حساب موحّد',
  AUTH_SOURCE_LEGACY: 'دخل عبر الحساب القديم',
  // legacy names (kept as fallback)
  LOGIN: 'سجّل الدخول',
  SETTING_UPDATE: 'عدّل إعدادات النظام',
  TRANSACTION_CREATE: 'أنشأ معاملة مالية',
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

// Unknown actions and raw JSON details must never leak English into the feed.
function actionLabel(item: ServiceItem): string {
  const base = ACTION_LABELS[item.action]
  if (base) {
    if (item.action.startsWith('LIVE_SESSION') && item.details) {
      return `${base} — ${item.details}`
    }
    return base
  }
  return 'نفّذ عملية داخل النظام'
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
