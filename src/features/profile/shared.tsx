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

/* ---------- ألوان العناصر ---------- */

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'error'
export type { Tone }

const TILE_TONE: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary ring-primary/10',
  success: 'bg-success-soft text-success-strong ring-success-soft',
  warning: 'bg-warning-soft text-warning-strong ring-warning-soft',
  info: 'bg-info-soft text-info-strong ring-info-soft',
  error: 'bg-error-soft text-error-strong ring-error-soft',
}

/** لون رقم فقط (لا خلفية) لمؤشرات شريط الهيرو — التلوين المحدث بدون فوضى */
const TEXT_TONE: Record<Tone, string> = {
  primary: 'text-primary',
  success: 'text-success-strong',
  warning: 'text-warning-strong',
  info: 'text-info-strong',
  error: 'text-error-strong',
}

/** خلفية الهيرو — تدرّج ناعم بلون الدور (فاتح) بدل البطاقة أحادية اللون */
const HERO_TONE: Record<Tone, string> = {
  primary:
    'from-primary-light via-primary-soft to-card dark:from-primary-soft dark:via-card dark:to-card',
  success:
    'from-success-light via-success-soft to-card dark:from-success-soft dark:via-card dark:to-card',
  warning:
    'from-warning-light via-warning-soft to-card dark:from-warning-soft dark:via-card dark:to-card',
  info: 'from-info-light via-info-soft to-card dark:from-info-soft dark:via-card dark:to-card',
  error: 'from-error-light via-error-soft to-card dark:from-error-soft dark:via-card dark:to-card',
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

/* ---------- بطاقة الهيرو — مسطّحة وهادئة مع شريط مؤشرات بريميوم ---------- */

interface AccountHeroProps {
  name: string
  roleLabel: string
  subtitle?: string
  metaChips?: string[]
  /** تكبير خط الكبسولات (المادة/سعر الحصة في صفحة المعلمة) */
  chipsBold?: boolean
  quickStats?: { label: string; value?: ReactNode; tone?: Tone; icon?: LucideIcon }[]
  /** هوية لونية خفيفة للهيرو حسب الدور (افتراضي primary) */
  accent?: Tone
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
  accent = 'primary',
  onEdit,
}: AccountHeroProps) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn(
      'rounded-2xl border border-border bg-gradient-to-br p-5 shadow-elevation-1 transition-colors duration-slow dark:border-primary/20 md:p-8',
      HERO_TONE[accent],
    )}
  >
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {/* الحرف الأول — خلية متدرجة هادئة */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-2xl font-black text-on-primary shadow-elevation-2 ring-1 ring-primary/20 md:h-20 md:w-20 md:text-3xl">
          {(name || '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 break-words text-lg font-black leading-snug text-main md:text-2xl">
              {name}
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-micro font-bold text-primary ring-1 ring-primary/10">
              <BadgeCheck size={11} />
              {roleLabel}
            </span>
          </div>
          {subtitle && <p className="mt-1 text-xs font-bold text-muted">{subtitle}</p>}
          {metaChips && metaChips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {metaChips.map((chip) => (
                <span
                  key={chip}
                  className={cn(
                    'inline-flex items-center rounded-full border border-border bg-card font-bold text-main dark:border-primary/20 dark:bg-surface',
                    chipsBold ? 'px-3.5 py-1.5 text-sm md:text-base' : 'px-3 py-1 text-xs',
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

    {/* شريط المؤشرات — خلايا نظيفة بفواصل رفيعة ورموز/أرقام ملوّنة فقط */}
    {quickStats && quickStats.length > 0 && (
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border dark:border-primary/20 dark:bg-border sm:grid-cols-3">
        {quickStats.map((q) => {
          const Icon = q.icon
          return (
            <div key={q.label} className="bg-card px-4 py-3 dark:bg-surface sm:px-5 sm:py-4">
              <p
                className={cn(
                  'flex items-center gap-1.5 leading-none',
                  TEXT_TONE[q.tone ?? 'primary'],
                )}
              >
                {Icon && <Icon size={15} className="shrink-0" />}
                <span className="min-w-0 truncate text-lg font-black tabular-nums">{q.value}</span>
              </p>
              <p className="mt-1.5 text-micro font-bold text-muted">{q.label}</p>
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
  /** لون أيقونة القسم (افتراضي primary) */
  tone?: Tone
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
  tone = 'primary',
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
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
              TILE_TONE[tone],
            )}
          >
            <Icon size={16} />
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

/* ---------- صف معلومة — قائمة تعريفات هادئة ---------- */

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
      <span className="flex shrink-0 items-center gap-2 text-micro font-bold text-muted">
        {Icon && <Icon size={14} className="text-primary/70" />}
        {label}
      </span>
      {empty ? (
        <span className="text-xs text-muted">—</span>
      ) : (
        <span
          title={tooltip}
          className={cn(
            'min-w-0 break-words text-start text-xs font-bold text-main sm:text-sm',
            mono && 'font-mono tabular-nums',
          )}
        >
          {value}
        </span>
      )}
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
    <SectionCard title="الحساب" icon={LogOut} tone="error" delay={0.25}>
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
