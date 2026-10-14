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

/** تعبئة مصمتة ملوّنة (هوية جريئة) — للبطاقات والأيقونات البارزة + نص on-* لكل لون */
export const SOLID_FILL: Record<Tone, string> = {
  primary: 'bg-jade text-jade-on',
  success: 'bg-success text-on-success',
  warning: 'bg-warning text-on-warning',
  info: 'bg-info text-on-info',
  error: 'bg-error text-on-error',
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
  <>
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-jade via-jade-deep to-jade-hover p-4 shadow-elevation-2 sm:p-5 md:p-8"
    >
      {/* نسيج نقطي خفيف */}
      <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="account-hero-dots"
              x="0"
              y="0"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#account-hero-dots)" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -end-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {/* الحرف الأول — مربّع زجاجي فاتح بحرف بلون الهوية */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-jade-on ring-2 ring-white/30 backdrop-blur-sm md:h-20 md:w-20 md:rounded-3xl md:text-3xl">
            {(name || '?').charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 break-words text-xl font-black leading-snug text-jade-on md:text-2xl lg:text-3xl">
                {name}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[9px] font-bold text-jade-on ring-1 ring-white/30 backdrop-blur-sm md:px-2.5 md:text-micro">
                <BadgeCheck size={10} />
                {roleLabel}
              </span>
            </div>
            {subtitle && (
              <p className="mt-1 text-xs font-bold text-jade-on opacity-80">{subtitle}</p>
            )}
            {metaChips && metaChips.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {metaChips.map((chip) => (
                  <span
                    key={chip}
                    className={cn(
                      'inline-flex items-center rounded-full bg-white/15 font-bold text-jade-on ring-1 ring-inset ring-white/25 backdrop-blur-sm',
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
            className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-jade-on px-4 py-2 text-[9px] font-bold text-jade-deep shadow-elevation-1 transition-all hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-[0.97] md:min-h-11 md:px-5 md:py-2.5 md:text-xs"
          >
            <PencilLine size={13} /> تعديل البيانات
          </button>
        )}
      </div>
    </motion.section>

    {/* بطاقات المؤشرات — مصمتة ملوّنة بارزة (هوية جريئة) */}
    {quickStats && quickStats.length > 0 && (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {quickStats.map((q) => {
          const Icon = q.icon
          return (
            <div
              key={q.label}
              className={cn(
                'relative overflow-hidden rounded-2xl p-3 shadow-elevation-1 transition-transform duration-slow hover:-translate-y-0.5 sm:p-4',
                SOLID_FILL[q.tone ?? 'primary'],
              )}
            >
              <div className="flex items-center gap-2">
                {Icon && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25 sm:h-9 sm:w-9">
                    <Icon size={15} />
                  </span>
                )}
                <p className="min-w-0 truncate font-dash text-lg font-black tabular-nums leading-none sm:text-2xl">
                  {q.value}
                </p>
              </div>
              <p className="mt-2 text-[9px] font-bold opacity-80 sm:text-micro">{q.label}</p>
            </div>
          )
        })}
      </div>
    )}
  </>
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
  >
    {/* شريط العنوان — أيقونة مصمتة ملوّنة + عنوان قوي */}
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-divider pb-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-elevation-1',
              SOLID_FILL[tone],
            )}
          >
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black leading-tight text-main">{title}</h2>
          {description && (
            <p className={cn('mt-0.5 text-micro text-muted', descClassName)}>{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
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
    <div className="group flex items-center gap-3 border-b border-divider px-1.5 py-2.5 transition-colors duration-normal last:border-b-0 hover:bg-jade-soft sm:px-2.5">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jade-soft text-jade ring-1 ring-jade-soft">
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
      'relative overflow-hidden rounded-2xl p-4 text-center shadow-elevation-1 transition-transform duration-slow hover:-translate-y-0.5',
      SOLID_FILL[tone],
    )}
  >
    <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25">
      <Icon size={18} />
    </div>
    <p className="truncate font-dash text-2xl font-black tabular-nums leading-none">{value}</p>
    <p className="mt-1.5 text-micro font-bold opacity-80">{label}</p>
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
