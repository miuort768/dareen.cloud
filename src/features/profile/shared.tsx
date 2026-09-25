/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, BadgeCheck, LogOut, MessageCircle, PencilLine } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Skeleton } from '../../shared/components/ui'
import { SectionCard as BaseSectionCard } from '../../shared/components/SectionCard'
import { confirm } from '../../lib/confirmDialog'
import { useSettingsStore } from '../../store/settingsStore'

/* ---------- غلاف الصفحة الموحد لكل الحسابات ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      className="profile-scope min-h-full overflow-x-hidden bg-background pb-6 md:pb-10"
    >
      <div className="mx-auto max-w-page space-y-4 px-2 pt-2 md:space-y-5 md:p-6 md:pt-4">
        {children}
      </div>
    </div>
  )
}

/* ---------- ألوان العناصر ---------- */

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'error'
export type { Tone }

/** الهوية الأساسية لصفحات الحسابات = زمردي jade؛ بقية الألوان دلالية للمحتوى */
export const TILE_TONE: Record<Tone, string> = {
  primary: 'bg-jade-soft text-jade ring-jade-soft',
  success: 'bg-success-soft text-success-strong ring-success-soft',
  warning: 'bg-warning-soft text-warning-strong ring-warning-soft',
  info: 'bg-info-soft text-info-strong ring-info-soft',
  error: 'bg-error-soft text-error-strong ring-error-soft',
}

/** لون رقم فقط (لا خلفية) — التلوين المحدث بدون فوضى */
const TEXT_TONE: Record<Tone, string> = {
  primary: 'text-jade',
  success: 'text-success-strong',
  warning: 'text-warning-strong',
  info: 'text-info-strong',
  error: 'text-error-strong',
}

/** تعبئة صلبة — البطاقات الإحصائية الصغيرة الكاملة اللون */
const INFO_FILL: Record<Tone, string> = {
  primary: 'bg-jade-deep',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  error: 'bg-error',
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

/* ---------- بطاقة الهيرو — هوية زمردية فاخرة + بطاقات مؤشرات عائمة ---------- */

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
    className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-jade-light via-card to-card p-4 shadow-soft transition-colors duration-slow dark:border-white/[0.06] dark:from-jade-soft dark:via-card dark:to-card sm:p-5 md:p-8"
  >
    {/* توهج زمردي خفيف في الزاوية */}
    <div className="pointer-events-none absolute -end-12 -top-12 hidden h-44 w-44 rounded-full bg-jade-light blur-3xl dark:bg-jade-soft sm:block" />

    <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {/* الحرف الأول — خلية زمردية متدرجة */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jade to-jade-deep text-lg font-black text-jade-on shadow-soft ring-1 ring-jade-light md:h-20 md:w-20 md:rounded-2xl md:text-3xl md:shadow-elevation-1">
          {(name || '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 break-words text-lg font-black leading-snug text-main md:text-2xl lg:text-3xl">
              {name}
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-jade-deep px-2 py-1 text-[9px] font-bold text-jade-on shadow-[0_4px_12px_rgb(10_123_112/0.3)] dark:shadow-[0_4px_12px_rgb(23_160_144/0.25)] md:px-2.5 md:text-micro">
              <BadgeCheck size={10} />
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
                    'inline-flex items-center rounded-full bg-white/70 font-bold text-main ring-1 ring-inset ring-border backdrop-blur-sm dark:bg-white/[0.06] dark:text-main dark:ring-white/10',
                    chipsBold
                      ? 'px-3 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm md:text-base'
                      : 'px-2.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-xs',
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
          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-jade-deep px-4 py-2 text-[9px] font-bold text-jade-on shadow-soft transition-all hover:-translate-y-0.5 hover:bg-jade hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] md:min-h-11 md:px-5 md:py-2.5 md:text-xs"
        >
          <PencilLine size={13} /> تعديل البيانات
        </button>
      )}
    </div>

    {/* بطاقات المؤشرات — عائمة بظلال ناعمة + رقاقات ملوّنة + أرقام كبيرة */}
    {quickStats && quickStats.length > 0 && (
      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-3">
        {quickStats.map((q) => {
          const Icon = q.icon
          return (
            <div
              key={q.label}
              className="rounded-xl border border-border bg-card px-2.5 py-2 shadow-soft transition-colors duration-slow dark:border-white/[0.06] dark:bg-card sm:rounded-2xl sm:px-5 sm:py-4"
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {Icon && (
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 sm:h-9 sm:w-9 sm:rounded-xl',
                      TILE_TONE[q.tone ?? 'primary'],
                    )}
                  >
                    <Icon size={12} className="sm:hidden" />
                    <Icon size={16} className="hidden sm:block" />
                  </div>
                )}
                <p
                  className={cn(
                    'min-w-0 truncate font-dash text-sm font-black tabular-nums leading-none sm:text-lg',
                    TEXT_TONE[q.tone ?? 'primary'],
                  )}
                >
                  {q.value}
                </p>
              </div>
              <p className="mt-1 text-[8px] font-bold text-muted sm:mt-2 sm:text-micro">
                {q.label}
              </p>
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
  /** لون أيقونة القسم (افتراضي زمردي jade) */
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
  <BaseSectionCard
    animated
    entrance="soft"
    delay={delay}
    padding="sm"
    shadow="soft"
    transition="colors"
    slow
    className={cn('dark:border-white/[0.06] dark:bg-card', className)}
    title={title}
    icon={
      Icon ? (
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
            TILE_TONE[tone],
          )}
        >
          <Icon size={16} />
        </div>
      ) : undefined
    }
    description={description}
    descClassName={descClassName}
    action={action}
  >
    {children}
  </BaseSectionCard>
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
    <div className="group flex items-center gap-3 rounded-xl px-1.5 py-2 transition-colors duration-normal hover:bg-hover sm:px-2.5">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-jade ring-1 ring-inset ring-border">
          <Icon size={16} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-micro font-bold text-muted">{label}</p>
        {empty ? (
          <p className="mt-0.5 text-sm font-bold text-muted">—</p>
        ) : (
          <p
            title={tooltip}
            className={cn(
              'mt-0.5 min-w-0 break-words text-sm font-black leading-snug text-main sm:text-base',
              mono && 'font-mono tabular-nums',
            )}
          >
            {value}
          </p>
        )}
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
  <div
    className={cn(
      'relative overflow-hidden rounded-2xl p-4 text-center shadow-soft transition-colors duration-slow',
      INFO_FILL[tone],
    )}
  >
    <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
      <Icon size={16} />
    </div>
    <p className="truncate font-dash text-2xl font-black tabular-nums leading-none text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.15)]">
      {value}
    </p>
    <p className="mt-1.5 text-micro font-bold text-white/80">{label}</p>
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

/* ---------- قسم الحساب (دعم فني زمردي + تسجيل خروج مصمت) ---------- */

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
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-jade-deep px-4 py-3 text-xs font-bold text-jade-on shadow-soft transition-all hover:-translate-y-0.5 hover:bg-jade hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            <MessageCircle size={14} /> تواصل مع الدعم الفني
          </a>
        )}
        <button
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-error px-4 py-3 text-xs font-bold text-on-error shadow-soft transition-all hover:-translate-y-0.5 hover:bg-error-hover hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
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
    <Skeleton className="h-40 w-full rounded-3xl shadow-soft md:h-44" />
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-64 rounded-2xl shadow-soft" />
      <Skeleton className="h-64 rounded-2xl shadow-soft lg:col-span-2" />
    </div>
    <Skeleton className="h-48 w-full rounded-2xl shadow-soft" />
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
      className="mx-auto mt-4 flex min-h-11 items-center rounded-full bg-jade-deep px-6 py-2.5 text-xs font-bold text-jade-on shadow-soft transition-all hover:-translate-y-0.5 hover:bg-jade hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
    >
      إعادة المحاولة
    </button>
  </div>
)
