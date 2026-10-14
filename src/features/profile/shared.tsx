/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, BadgeCheck, Check, LogOut, MessageCircle, PencilLine } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Image, Skeleton } from '../../shared/components/ui'
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

/** تعبئة متدرّجة ملوّنة — للبطاقات الكبيرة (مؤشرات/إحصاءات) لمزيد من الغنى البصري */
export const SOLID_GRADIENT: Record<Tone, string> = {
  primary: 'bg-gradient-to-br from-jade to-jade-deep text-jade-on',
  success: 'bg-gradient-to-br from-success to-success-hover text-on-success',
  warning: 'bg-gradient-to-br from-warning to-warning-hover text-on-warning',
  info: 'bg-gradient-to-br from-info to-info-hover text-on-info',
  error: 'bg-gradient-to-br from-error to-error-hover text-on-error',
}

/** شريط لوني جانبي في اتجاه البداية (RTL) لكل نغمة — يوضع مع border-s-4 */
export const ACCENT_BAR: Record<Tone, string> = {
  primary: 'border-s-jade',
  success: 'border-s-success',
  warning: 'border-s-warning',
  info: 'border-s-info',
  error: 'border-s-error',
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
    <div className="relative">
      {/* الغلاف العلوي التزييني */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-24 overflow-hidden rounded-3xl bg-gradient-to-br from-jade via-jade-deep to-jade-hover shadow-elevation-3 md:h-32"
      >
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
        {/* حلقات تزيينية + توهج */}
        <div
          className="pointer-events-none absolute -end-20 -top-20 h-60 w-60 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -start-16 h-52 w-52 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* بطاقة الهوية — متداخلة مع الغلاف */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-3 -mt-8 rounded-2xl border border-border bg-card px-4 pb-4 pt-4 shadow-elevation-3 dark:border-white/[0.06] dark:bg-surface md:mx-6 md:-mt-10 md:px-5 md:pb-5 md:pt-5"
      >
        <div className="flex flex-wrap items-end gap-x-3.5 gap-y-3">
          {/* شعار المنصة + نقطة الحالة */}
          <div className="relative -mt-12 shrink-0 md:-mt-14">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-elevation-2 ring-4 ring-card md:h-24 md:w-24">
              <Image
                src="/dareen_logo_new.v2.webp"
                webpSrc="/dareen_logo_new.v2.webp"
                avifSrc="/dareen_logo_new.v2.avif"
                alt="شعار المنصة"
                loading="eager"
                className="h-full w-full"
                imgClassName="object-contain p-2.5 md:p-3"
              />
            </div>
            <span className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-success shadow-elevation-1 ring-2 ring-card">
              <Check size={11} className="text-on-success" strokeWidth={3} />
            </span>
          </div>

          <div className="min-w-0 flex-1 pb-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 break-words text-xl font-black leading-tight text-main md:text-2xl lg:text-3xl">
                {name}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-jade-deep px-2 py-0.5 text-[9px] font-bold text-jade-on ring-1 ring-white/20 md:px-2.5 md:py-1 md:text-micro">
                <BadgeCheck size={10} />
                {roleLabel}
              </span>
            </div>
            {subtitle && <p className="mt-1 text-xs font-bold text-muted">{subtitle}</p>}
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              className="hidden min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-jade-deep px-4 py-2.5 text-xs font-bold text-jade-on shadow-elevation-1 transition-all hover:-translate-y-0.5 hover:bg-jade hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:flex md:px-5 md:text-xs"
            >
              <PencilLine size={13} /> تعديل البيانات
            </button>
          )}
        </div>

        {metaChips && metaChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-divider pt-3">
            {metaChips.map((chip) => (
              <span
                key={chip}
                className={cn(
                  'inline-flex items-center rounded-full bg-jade-soft font-bold text-jade-deep ring-1 ring-jade-soft',
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

        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-jade-deep px-4 py-2.5 text-xs font-bold text-jade-on shadow-elevation-1 transition-all hover:bg-jade focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] sm:hidden"
          >
            <PencilLine size={13} /> تعديل البيانات
          </button>
        )}
      </motion.div>
    </div>

    {/* بطاقات المؤشرات — متدرّجة ملوّنة بارزة (هوية جريئة) */}
    {quickStats && quickStats.length > 0 && (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {quickStats.map((q) => {
          const Icon = q.icon
          return (
            <div
              key={q.label}
              className={cn(
                'relative overflow-hidden rounded-2xl p-3.5 shadow-elevation-2 ring-1 ring-white/10 transition-transform duration-slow hover:-translate-y-1 sm:p-4',
                SOLID_GRADIENT[q.tone ?? 'primary'],
              )}
            >
              <div className="pointer-events-none absolute -end-6 -top-6 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex items-center gap-2">
                {Icon && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/25 sm:h-10 sm:w-10">
                    <Icon size={16} />
                  </span>
                )}
                <p className="min-w-0 truncate font-dash text-xl font-black tabular-nums leading-none sm:text-2xl md:text-3xl">
                  {q.value}
                </p>
              </div>
              <p className="relative mt-2 text-[9px] font-bold opacity-80 sm:text-micro">
                {q.label}
              </p>
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

/* ---------- صف معلومة — بطاقة تعريف صغيرة أنيقة ---------- */

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
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 transition-all duration-normal hover:border-jade-soft hover:bg-card hover:shadow-elevation-1 dark:border-white/[0.06] md:p-3">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade-soft text-jade ring-1 ring-jade-soft transition-colors duration-normal group-hover:bg-jade group-hover:text-jade-on">
          <Icon size={17} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-micro font-bold text-muted">{label}</p>
        {empty ? (
          <p className="mt-0.5 text-sm font-black text-muted">—</p>
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
      'relative overflow-hidden rounded-2xl p-4 text-center shadow-elevation-2 ring-1 ring-white/10 transition-transform duration-slow hover:-translate-y-0.5',
      SOLID_GRADIENT[tone],
    )}
  >
    <div className="pointer-events-none absolute -end-6 -top-6 h-16 w-16 rounded-full bg-white/10 blur-xl" />
    <div className="relative mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25">
      <Icon size={18} />
    </div>
    <p className="relative truncate font-dash text-2xl font-black tabular-nums leading-none">
      {value}
    </p>
    <p className="relative mt-1.5 text-micro font-bold opacity-80">{label}</p>
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
    <div className="relative">
      <Skeleton className="h-24 w-full rounded-3xl shadow-soft md:h-32" />
      <Skeleton className="-mt-8 h-28 w-full rounded-2xl shadow-soft md:-mt-10" />
    </div>
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
