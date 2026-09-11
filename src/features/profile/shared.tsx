/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, BadgeCheck, LogOut, PencilLine } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Skeleton } from '../../shared/components/ui'
import { confirm } from '../../lib/confirmDialog'

/* ---------- بطاقة الهيرو الموحدة لكل الحسابات ---------- */

interface AccountHeroProps {
  name: string
  roleLabel: string
  subtitle?: string
  metaChips?: string[]
  /** متاح فقط للأدوار التي تدعم التعديل فعليًا في النظام */
  onEdit?: () => void
}

export const AccountHero = ({ name, roleLabel, subtitle, metaChips, onEdit }: AccountHeroProps) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="relative overflow-hidden rounded-card border border-border bg-gradient-to-br from-primary-light via-primary-soft to-card p-5 shadow-elevation-1 transition-colors duration-slow dark:border-primary/30 dark:from-card dark:via-surface dark:to-card md:p-8"
  >
    <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="account-hero-grid"
            x="0"
            y="0"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" className="fill-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#account-hero-grid)" />
      </svg>
    </div>

    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {/* حرف الاسم الأول فقط — لا صورة شخصية في النظام */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-xl font-black text-primary shadow-elevation-1 ring-1 ring-primary/10 md:h-16 md:w-16 md:text-2xl">
          {(name || '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 break-words text-2xl font-black leading-snug text-main md:text-3xl">
              {name}
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-micro font-bold text-primary ring-1 ring-primary/10">
              <BadgeCheck size={11} />
              {roleLabel}
            </span>
          </div>
          {subtitle && <p className="mt-1 truncate text-xs font-bold text-muted">{subtitle}</p>}
          {metaChips && metaChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {metaChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-primary-soft px-2.5 py-0.5 text-micro font-bold text-primary"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {onEdit && (
        <button
          onClick={onEdit}
          className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-elevation-3 shadow-black/20 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
        >
          <PencilLine size={13} /> تعديل البيانات
        </button>
      )}
    </div>
  </motion.section>
)

/* ---------- بطاقة قسم بعنوان ---------- */

interface SectionCardProps {
  title: string
  icon?: LucideIcon
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}

export const SectionCard = ({
  title,
  icon: Icon,
  description,
  action,
  children,
  className,
  delay = 0,
}: SectionCardProps) => (
  <motion.section
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className={cn(
      'rounded-2xl border border-border bg-surface p-4 shadow-elevation-1 transition-colors duration-slow dark:border-primary/20 dark:bg-card md:p-5',
      className,
    )}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft ring-1 ring-primary/10">
            <Icon size={16} className="text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-black leading-tight text-main">{title}</h2>
          {description && <p className="mt-0.5 text-micro text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </motion.section>
)

/* ---------- صف معلومة أنيق ---------- */

interface InfoRowProps {
  label: string
  value?: ReactNode
  icon?: LucideIcon
  mono?: boolean
}

export const InfoRow = ({ label, value, icon: Icon, mono }: InfoRowProps) => {
  const empty = value === undefined || value === null || value === ''
  const tooltip = typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
  return (
    <div className="flex items-center justify-between gap-3 border-b border-divider py-2.5 last:border-b-0">
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted">
        {Icon && <Icon size={13} className="text-primary/70" />}
        {label}
      </span>
      {empty ? (
        <span className="text-muted/70 text-xs">—</span>
      ) : (
        <span
          title={tooltip}
          className={cn(
            'min-w-0 truncate text-start text-xs font-bold text-main',
            mono && 'font-mono tabular-nums',
          )}
        >
          {value}
        </span>
      )}
    </div>
  )
}

/* ---------- شارة الحالة «نشط» الموحدة ---------- */

export const StatusBadge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-micro font-bold text-success-strong ring-1 ring-success-soft">
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
    نشط
  </span>
)

/** تنسيق تاريخ عربي مختصر — يُرجع نصًا فارغًا إن لم يتوفر تاريخ */
export const formatJoinDate = (iso?: string | Date): string => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/* ---------- قسم الحساب (خروج) ---------- */

interface AccountActionsProps {
  onLogoutStore: () => void
}

export const AccountActions = ({ onLogoutStore }: AccountActionsProps) => {
  const navigate = useNavigate()
  const handleLogout = async () => {
    if (!(await confirm('هل أنت متأكد من تسجيل الخروج؟'))) return
    onLogoutStore()
    navigate('/login')
  }
  return (
    <SectionCard title="الحساب" icon={LogOut} delay={0.25}>
      <button
        onClick={handleLogout}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-error-soft bg-error-soft py-3 text-xs font-bold text-error transition-colors hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <LogOut size={14} /> تسجيل الخروج
      </button>
    </SectionCard>
  )
}

/* ---------- هيكل التحميل ---------- */

export const ProfileSkeleton = () => (
  <div className="space-y-4 md:space-y-5" aria-busy="true" aria-label="جاري تحميل الحساب">
    <Skeleton className="h-36 w-full rounded-2xl shadow-elevation-1 md:h-40" />
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-64 rounded-2xl shadow-elevation-1" />
      <Skeleton className="h-64 rounded-2xl shadow-elevation-1 lg:col-span-2" />
    </div>
    <Skeleton className="h-48 w-full rounded-2xl shadow-elevation-1" />
  </div>
)

/* ---------- حالة خطأ موحدة ---------- */

interface ErrorBlockProps {
  onRetry: () => void
}

export const ErrorBlock = ({ onRetry }: ErrorBlockProps) => (
  <div className="rounded-2xl border border-dashed border-error-soft bg-error-soft py-16 text-center">
    <AlertTriangle size={30} className="mx-auto mb-3 text-error" strokeWidth={1.5} />
    <p className="text-sm font-bold text-main">تعذر تحميل بيانات الحساب</p>
    <p className="mt-1 text-xs text-muted">تحقق من الاتصال ثم أعد المحاولة</p>
    <button
      onClick={onRetry}
      className="mx-auto mt-4 flex min-h-11 items-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-on-primary shadow-elevation-2 shadow-black/20 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
    >
      إعادة المحاولة
    </button>
  </div>
)
