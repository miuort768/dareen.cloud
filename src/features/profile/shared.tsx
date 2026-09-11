/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, BadgeCheck, LogOut, MessageCircle, PencilLine } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Skeleton } from '../../shared/components/ui'
import { confirm } from '../../lib/confirmDialog'
import { useSettingsStore } from '../../store/settingsStore'

/* ---------- غلاف الصفحة الموحد لكل الحسابات ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-full overflow-x-hidden bg-background pb-6 md:pb-10">
      <div className="mx-auto max-w-page space-y-4 p-3 pt-2 md:space-y-5 md:p-6 md:pt-4">
        {children}
      </div>
    </div>
  )
}

/* ---------- ألوان العناصر (تلوين الأيقونات والكبسولات لا الخلفيات) ---------- */

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'error'

const TILE_TONE: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary ring-primary/10',
  success: 'bg-success-soft text-success-strong ring-success-soft',
  warning: 'bg-warning-soft text-warning-strong ring-warning-soft',
  info: 'bg-info-soft text-info-strong ring-info-soft',
  error: 'bg-error-soft text-error-strong ring-error-soft',
}

export const TONE_ORDER: Tone[] = ['primary', 'info', 'success', 'warning']

/** رقم واتساب الدعم الفني من إعدادات المنصة (مفتاح «تواصل مع الدعم الفني») */
export const useSupportWhatsappNumber = (): string => {
  const raw = useSettingsStore((s) => s.whatsappNumbers)
  try {
    const entries: { label: string; phone: string }[] = JSON.parse(raw)
    const found = entries.find((e) => e.label === 'تواصل مع الدعم الفني')
    return (found?.phone || '201015098836').replace(/\D/g, '')
  } catch {
    return '201015098836'
  }
}

/* ---------- بطاقة الهيرو الموحدة — ألوان على العناصر وليس خلفية المستطيل ---------- */

interface AccountHeroProps {
  name: string
  roleLabel: string
  subtitle?: string
  metaChips?: string[]
  /** تكبير خط الكبسولات (المادة/سعر الحصة في صفحة المعلمة) */
  chipsBold?: boolean
  quickStats?: { label: string; value?: ReactNode; tone?: Tone; icon?: LucideIcon }[]
  /** متاح فقط للأدوار التي تدعم التعديل فعليًا في النظام */
  onEdit?: () => void
}

export const AccountHero = ({
  name,
  roleLabel,
  subtitle,
  metaChips,
  chipsBold,
  quickStats,
  onEdit,
}: AccountHeroProps) => (
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
        {/* حرف الاسم الأول — خلية ملونة متدرجة */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover text-xl font-black text-on-primary shadow-elevation-2 ring-1 ring-primary/20 md:h-16 md:w-16 md:text-2xl">
          {(name || '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 break-words text-2xl font-black leading-snug text-main md:text-3xl">
              {name}
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-micro font-bold text-success-strong ring-1 ring-success-soft">
              <BadgeCheck size={11} />
              {roleLabel}
            </span>
          </div>
          {subtitle && <p className="mt-1 truncate text-xs font-bold text-muted">{subtitle}</p>}
          {metaChips && metaChips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {metaChips.map((chip, i) => (
                <span
                  key={chip}
                  className={cn(
                    'inline-flex items-center rounded-full font-black ring-1',
                    TILE_TONE[TONE_ORDER[i % TONE_ORDER.length]],
                    chipsBold ? 'px-3.5 py-1.5 text-sm md:text-base' : 'px-2.5 py-0.5 text-micro',
                  )}
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

    {/* إحصائيات سريعة — خلايا ملونة على العناصر */}
    {quickStats && quickStats.length > 0 && (
      <div className="relative z-10 mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {quickStats.map((q) => {
          const Icon = q.icon
          return (
            <div
              key={q.label}
              className={cn('rounded-xl px-3 py-2.5 ring-1', TILE_TONE[q.tone ?? 'primary'])}
            >
              <div className="flex items-center gap-1.5">
                {Icon && <Icon size={13} className="shrink-0" />}
                <span className="min-w-0 truncate text-sm font-black tabular-nums leading-none">
                  {q.value}
                </span>
              </div>
              <span className="mt-1 block text-micro font-bold opacity-70">{q.label}</span>
            </div>
          )
        })}
      </div>
    )}
  </motion.section>
)

/* ---------- بطاقة قسم بعنوان ---------- */

interface SectionCardProps {
  title: string
  icon?: LucideIcon
  description?: ReactNode
  /** تخصيص خط الوصف على الشاشات الصغيرة فقط */
  descClassName?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}

export const SectionCard = ({
  title,
  icon: Icon,
  description,
  descClassName,
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
          {description && (
            <p className={cn('mt-0.5 text-micro text-muted', descClassName)}>{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
    {children}
  </motion.section>
)

/* ---------- صف معلومة أنيق (يُستخدم داخليًا في طرق الدفع) ---------- */

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

/* ---------- خلية بيانات ملونة — شبكة بديلة للصفوف ---------- */

interface InfoCellProps {
  label: string
  value?: ReactNode
  icon?: LucideIcon
  tone?: Tone
  mono?: boolean
}

export const InfoCell = ({ label, value, icon: Icon, tone = 'primary', mono }: InfoCellProps) => {
  const empty = value === undefined || value === null || value === ''
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-elevation-1 dark:border-primary/20 dark:bg-surface">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1',
              TILE_TONE[tone],
            )}
          >
            <Icon size={15} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-micro font-bold text-muted">{label}</p>
          {empty ? (
            <p className="text-muted/70 text-xs font-bold">—</p>
          ) : (
            <p
              className={cn(
                'truncate text-xs font-black leading-snug text-main sm:text-sm',
                mono && 'font-mono tabular-nums',
              )}
            >
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- بطاقة معلومة صغيرة (إحصائية) ---------- */

interface InfoTileProps {
  label: string
  value?: ReactNode
  icon: LucideIcon
  tone?: Tone
}

export const InfoTile = ({ label, value, icon: Icon, tone = 'primary' }: InfoTileProps) => (
  <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-elevation-1 dark:border-primary/20 dark:bg-surface">
    <div
      className={cn(
        'mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl ring-1',
        TILE_TONE[tone],
      )}
    >
      <Icon size={16} />
    </div>
    <p className="truncate text-sm font-black leading-tight text-main">{value}</p>
    <p className="mt-1 text-micro text-muted">{label}</p>
  </div>
)

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

/* ---------- قسم الحساب (دعم فني + تسجيل خروج مصمت) ---------- */

interface AccountActionsProps {
  onLogoutStore: () => void
  /** رقم واتساب الدعم الفني — عند تمريره يظهر زر «تواصل مع الدعم الفني» فوق الخروج */
  supportPhone?: string
}

export const AccountActions = ({ onLogoutStore, supportPhone }: AccountActionsProps) => {
  const navigate = useNavigate()
  const handleLogout = async () => {
    if (!(await confirm('هل أنت متأكد من تسجيل الخروج؟'))) return
    onLogoutStore()
    navigate('/login')
  }
  return (
    <SectionCard title="الحساب" icon={LogOut} delay={0.25}>
      <div className="space-y-2.5">
        {supportPhone && (
          <a
            href={`https://wa.me/${supportPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-success px-4 py-3 text-xs font-bold text-on-success shadow-elevation-2 shadow-black/20 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            <MessageCircle size={14} /> تواصل مع الدعم الفني
          </a>
        )}
        <button
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-error px-4 py-3 text-xs font-bold text-on-error shadow-elevation-2 shadow-black/20 transition-all hover:bg-error-hover hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
        >
          <LogOut size={14} /> تسجيل الخروج
        </button>
      </div>
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
