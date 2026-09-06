/* eslint-disable react-refresh/only-export-components -- constants/variants exported beside the component (intentional UI pattern) */
import type { LucideIcon } from 'lucide-react'
import { RefreshCw } from 'lucide-react'
import { cn } from '../../../lib/utils'

export const ALLOWED_CURRENCIES = [{ code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' }]

export const ALLOWED_CURRENCY_CODES = ALLOWED_CURRENCIES.map((c) => c.code)

export const AVAILABLE_PERMISSIONS = [
  { id: '*', label: 'وصول كامل (Admin)', group: 'عام' },
  { id: 'dashboard', label: 'لوحة التحكم', group: 'الصفحات' },
  { id: 'students', label: 'إدارة الطلاب', group: 'الصفحات' },
  { id: 'teachers', label: 'إدارة المعلمين', group: 'الصفحات' },
  { id: 'evaluations', label: 'التقييمات والنقاط', group: 'الصفحات' },
  { id: 'parents', label: 'أولياء الأمور', group: 'الصفحات' },
  { id: 'monthly_closing', label: 'تقفيل الشهر', group: 'الصفحات' },
  { id: 'attendance', label: 'الحضور والغياب', group: 'الصفحات' },
  { id: 'schedule', label: 'الجداول الدراسية', group: 'الصفحات' },
  { id: 'appointments', label: 'المواعيد', group: 'الصفحات' },
  { id: 'finance', label: 'المالية', group: 'الصفحات' },
  { id: 'leads', label: 'العملاء والمهتمين', group: 'الصفحات' },
  { id: 'trial_sessions', label: 'جلسات المراجعة', group: 'الصفحات' },
  { id: 'student_invoices', label: 'فواتير الطلاب', group: 'الصفحات' },
  { id: 'teacher_invoices', label: 'فواتير المعلمات', group: 'الصفحات' },
  { id: 'tasks', label: 'المهام والطلبات', group: 'الصفحات' },
  { id: 'chat', label: 'الدردشة', group: 'الصفحات' },
  { id: 'reports', label: 'التقارير', group: 'الصفحات' },
  { id: 'announcements', label: 'إدارة الإعلانات', group: 'الصفحات' },
  { id: 'forum', label: 'المنتدى', group: 'الصفحات' },
  { id: 'settings', label: 'الإعدادات', group: 'الصفحات' },
  { id: 'admin', label: 'إدارة متقدمة (أدوار/مراقبة)', group: 'الصفحات' },
  { id: 'admin_contacts', label: 'رسائل الاتصال', group: 'الصفحات' },
  { id: 'admin_jobs', label: 'طلبات التوظيف', group: 'الصفحات' },
  { id: 'parent_dashboard', label: 'بوابة المتابعة (ولي أمر)', group: 'لوحات مخصصة' },
  { id: 'parent_students', label: 'الأبناء', group: 'لوحات مخصصة' },
  { id: 'parent_announcements', label: 'إعلانات ولي الأمر', group: 'لوحات مخصصة' },
  { id: 'student_dashboard', label: 'حساب الطالب', group: 'لوحات مخصصة' },
  { id: 'students.create', label: 'إضافة طالب', group: 'أذونات تفصيلية' },
  { id: 'students.edit', label: 'تعديل طالب', group: 'أذونات تفصيلية' },
  { id: 'students.delete', label: 'حذف طالب', group: 'أذونات تفصيلية' },
  { id: 'teachers.create', label: 'إضافة معلم', group: 'أذونات تفصيلية' },
  { id: 'teachers.edit', label: 'تعديل معلم', group: 'أذونات تفصيلية' },
  { id: 'teachers.delete', label: 'حذف معلم', group: 'أذونات تفصيلية' },
  { id: 'sessions.create', label: 'إضافة جلسة', group: 'أذونات تفصيلية' },
  { id: 'sessions.edit', label: 'تعديل جلسة', group: 'أذونات تفصيلية' },
  { id: 'finance.transactions.create', label: 'إضافة معاملة مالية', group: 'أذونات تفصيلية' },
  { id: 'finance.transactions.delete', label: 'حذف معاملة مالية', group: 'أذونات تفصيلية' },
  { id: 'finance.invoices.edit', label: 'تعديل الفواتير', group: 'أذونات تفصيلية' },
  { id: 'finance.reports', label: 'التقارير المالية', group: 'أذونات تفصيلية' },
  { id: 'system.users', label: 'إدارة المستخدمين', group: 'أذونات تفصيلية' },
  { id: 'system.backup', label: 'النسخ الاحتياطي', group: 'أذونات تفصيلية' },
  { id: 'system.audit', label: 'سجل التدقيق', group: 'أذونات تفصيلية' },
]

export const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'rounded-2xl border border-divider bg-card p-5 md:p-6',
      'shadow-sm transition-all duration-300 hover:shadow-md',
      className,
    )}
  >
    {children}
  </div>
)

export const SectionTitle = ({
  icon: Icon,
  label,
  sub,
}: {
  icon: LucideIcon
  label: string
  sub?: string
}) => (
  <div className="mb-5 flex items-center gap-3 border-b border-divider pb-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
      <Icon size={18} className="text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-main">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] font-bold text-muted">{sub}</p>}
    </div>
    <div className="hidden h-0.5 w-16 rounded-full bg-gradient-to-l from-primary/40 to-transparent sm:block" />
  </div>
)

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-muted">{children}</label>
)

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      'w-full border border-divider bg-background',
      'px-4 py-3 text-sm font-bold text-main',
      'outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
      'rounded-xl transition-all duration-200',
      'text-dim',
      props.className,
    )}
  />
)

export const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={cn(
      'w-full border border-divider bg-background',
      'resize-none px-4 py-3 text-sm font-bold text-main',
      'outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
      'rounded-xl transition-all duration-200',
      'text-dim',
      props.className,
    )}
  />
)

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={cn(
      'relative h-6 w-11 shrink-0 rounded-full transition-all duration-300',
      checked
        ? 'bg-gradient-to-r from-primary to-primary-active shadow-sm shadow-primary/30'
        : 'bg-divider hover:bg-border',
    )}
  >
    <span
      className={cn(
        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300',
        checked ? 'start-[1.375rem]' : 'start-0.5',
      )}
    />
  </button>
)

export const PrimaryBtn = ({
  onClick,
  loading,
  children,
  className = '',
}: {
  onClick?: () => void
  loading?: boolean
  children: React.ReactNode
  className?: string
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-active',
      'hover:from-primary-hover hover:to-primary',
      'rounded-xl px-6 py-3 text-xs font-bold text-on-primary',
      'outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
      'shadow-sm shadow-primary/20 hover:shadow-md',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >
    {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
  </button>
)

export const SecondaryBtn = ({
  onClick,
  children,
  className = '',
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 border border-divider bg-card',
      'text-muted hover:border-border hover:bg-surface hover:text-main',
      'rounded-xl px-5 py-2.5 text-xs font-bold',
      'outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
      className,
    )}
  >
    {children}
  </button>
)

export const DangerBtn = ({
  onClick,
  children,
  className = '',
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 bg-gradient-to-br from-error-soft to-transparent',
      'border-2 border-error-soft hover:border-error hover:from-error hover:to-error-dark',
      'rounded-xl px-5 py-2.5 text-xs font-bold text-error hover:text-on-error',
      'shadow-sm outline-none transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
      className,
    )}
  >
    {children}
  </button>
)

export const ToggleRow = ({
  icon: Icon,
  label,
  sub,
  checked,
  onChange,
}: {
  icon: LucideIcon
  label: string
  sub?: string
  checked: boolean
  onChange: () => void
}) => (
  <div className="flex items-center justify-between rounded-xl border border-divider bg-background px-4 py-3 transition-colors duration-200 hover:border-divider">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon size={15} className="text-primary" />
      </div>
      <div>
        <p className="text-xs font-bold text-main">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] font-bold text-muted">{sub}</p>}
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
)
