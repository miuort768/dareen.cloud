/* eslint-disable react-refresh/only-export-components */
import { useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  LogOut,
  MessageCircle,
  PencilLine,
  ShieldCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Avatar, Skeleton } from '../../shared/components/ui'
import { SectionCard as BaseSectionCard } from '../../shared/components/SectionCard'
import { confirm } from '../../lib/confirmDialog'
import { useSettingsStore } from '../../store/settingsStore'

/* ---------- غلاف الصفحة الموحد لكل الحسابات ---------- */

interface PageShellProps {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      dir="rtl"
      className="profile-scope min-h-full overflow-x-hidden bg-background pb-12 transition-colors duration-slow md:pb-16"
    >
      <div
        className={cn(
          'mx-auto max-w-page space-y-6 px-3 pt-3 sm:px-6 sm:pt-6 lg:space-y-8 lg:px-8 lg:pt-8',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

/* ---------- ألوان العناصر ---------- */

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'error'
export type { Tone }

export const TILE_TONE: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary ring-primary-soft',
  success: 'bg-success-soft text-success ring-success-soft',
  warning: 'bg-warning-soft text-warning ring-warning-soft',
  info: 'bg-info-soft text-info ring-info-soft',
  error: 'bg-error-soft text-error ring-error-soft',
}

export const SOLID_FILL: Record<Tone, string> = {
  primary: 'bg-primary text-on-primary',
  success: 'bg-success text-on-success',
  warning: 'bg-warning text-on-warning',
  info: 'bg-info text-on-info',
  error: 'bg-error text-on-error',
}

export const SOLID_GRADIENT: Record<Tone, string> = {
  primary: 'bg-gradient-to-br from-primary via-primary-active to-primary-deep text-on-primary',
  success: 'bg-gradient-to-br from-success to-success-dark text-on-success',
  warning: 'bg-gradient-to-br from-warning to-warning-dark text-on-warning',
  info: 'bg-gradient-to-br from-info to-info-dark text-on-info',
  error: 'bg-gradient-to-br from-error to-error-active text-on-error',
}

export const ACCENT_BAR: Record<Tone, string> = {
  primary: 'border-s-primary',
  success: 'border-s-success',
  warning: 'border-s-warning',
  info: 'border-s-info',
  error: 'border-s-error',
}

export const TONE_ORDER: Tone[] = ['primary', 'info', 'success', 'warning']

/** رقم واتساب الدعم الفني من إعدادات المنصة */
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

/* ---------- بطاقة الهيرو الفاخرة على الكمبيوتر ---------- */

export interface QuickStatItem {
  label: string
  value?: ReactNode
  tone?: Tone
  icon?: LucideIcon
}

interface AccountHeroProps {
  name: string
  roleLabel: string
  subtitle?: string
  metaChips?: string[]
  chipsBold?: boolean
  chipsInline?: boolean
  chipTones?: Tone[]
  quickStats?: QuickStatItem[]
  onEdit?: () => void
  avatarSrc?: string
}

export const AccountHero = ({
  name,
  roleLabel,
  subtitle,
  metaChips,
  chipsBold,
  chipTones,
  quickStats,
  onEdit,
  avatarSrc,
}: AccountHeroProps) => {
  const hasChips = Boolean(metaChips && metaChips.length > 0)
  const chipNodes = metaChips?.map((chip, index) => {
    const tone = chipTones?.[index] ?? 'primary'
    return (
      <span
        key={chip}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium ring-1 transition-all',
          TILE_TONE[tone],
          chipsBold
            ? 'px-3 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm'
            : 'px-2.5 py-0.5 text-micro sm:px-3 sm:py-1 sm:text-xs',
        )}
      >
        {chip}
      </span>
    )
  })

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* الغلاف العلوي + بطاقة الهوية بتقنية Double-Bezel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-border/80 relative overflow-hidden rounded-[28px] border bg-card p-1.5 shadow-elevation-2 dark:border-white/[0.08]"
      >
        {/* خلفية الترويسة المتدرجة */}
        <div className="relative min-h-[140px] overflow-hidden rounded-[22px] bg-gradient-to-br from-primary via-primary-active to-primary-deep p-5 sm:min-h-[170px] sm:p-7 lg:p-8">
          {/* شبكة نقاط زخرفية */}
          <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden="true">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="hero-dots"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-dots)" />
            </svg>
          </div>

          {/* هالات مضيئة وتوهجات محيطية */}
          <div
            className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="bg-accent/20 pointer-events-none absolute -bottom-24 -start-16 h-56 w-56 rounded-full blur-3xl"
            aria-hidden="true"
          />

          {/* شريط مسار علوي خفيف */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-white/90">
            <div className="flex items-center gap-2 text-micro sm:text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-medium text-on-primary ring-1 ring-white/20 backdrop-blur-md">
                <ShieldCheck size={13} />
                بوابة الحساب الموحدة
              </span>
              <span className="hidden text-white/60 sm:inline">·</span>
              <span className="hidden text-white/80 sm:inline">دارين للتعليم والتدريب</span>
            </div>

            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-medium text-on-primary ring-1 ring-white/25 backdrop-blur-md transition-all hover:bg-white/30 hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
              >
                <PencilLine size={13} />
                <span>تعديل البيانات</span>
              </button>
            )}
          </div>
        </div>

        {/* كتلة بيانات المستخدم والـ Avatar المتداخلة */}
        <div className="relative z-10 px-4 pb-5 pt-0 sm:px-6 sm:pb-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5">
              {/* صورة الحساب / الصورة الرمزية الراقية */}
              <div className="relative -mt-12 sm:-mt-16">
                <div className="relative rounded-full bg-card p-1 shadow-elevation-3 ring-4 ring-card">
                  <Avatar
                    name={name}
                    src={avatarSrc}
                    size="xl"
                    indicator="online"
                    className="h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl"
                  />
                </div>
              </div>

              {/* الاسم واللقب والبيانات */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <h1 className="truncate text-xl font-black text-main sm:text-2xl lg:text-3xl">
                    {name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/20">
                    <BadgeCheck size={14} />
                    {roleLabel}
                  </span>
                </div>

                {subtitle && (
                  <p className="mt-1 text-xs font-medium text-muted sm:text-sm">{subtitle}</p>
                )}

                {hasChips && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {chipNodes}
                  </div>
                )}
              </div>
            </div>

            {/* نقطة الحالة على الشاشات الكبيرة */}
            <div className="border-border/80 bg-surface/70 hidden items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-elevation-1 lg:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <div className="text-end">
                <p className="text-micro font-medium text-muted">حالة الحساب</p>
                <p className="text-xs font-bold text-main">نشط ومعتمد</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* المؤشرات الرئيسية (KPI Cards) بتصميم Bento عالي الفخامة للكمبيوتر */}
      {quickStats && quickStats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {quickStats.map((q, idx) => {
            const Icon = q.icon
            const tone = q.tone ?? 'primary'
            return (
              <motion.div
                key={q.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="border-border/80 group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:shadow-elevation-2 dark:border-white/[0.08] dark:bg-card sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-micro font-medium text-muted sm:text-xs">
                      {q.label}
                    </p>
                    <p className="mt-1.5 truncate font-dash text-2xl font-black tabular-nums text-main sm:text-3xl">
                      {q.value}
                    </p>
                  </div>
                  {Icon && (
                    <span
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-normal group-hover:scale-105 sm:h-12 sm:w-12',
                        TILE_TONE[tone],
                      )}
                    >
                      <Icon size={20} />
                    </span>
                  )}
                </div>

                {/* مؤشر بصري سفلي ناعم */}
                <div
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100',
                    ACCENT_BAR[tone].replace('border-s-', 'bg-'),
                  )}
                />
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------- بطاقة قسم بعنوان (SectionCard) ---------- */

interface SectionCardProps {
  title: string
  icon?: LucideIcon
  description?: ReactNode
  descClassName?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
  tone?: Tone
  headerTone?: Tone
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
  headerTone,
}: SectionCardProps) => (
  <BaseSectionCard
    animated
    entrance="soft"
    delay={delay}
    padding="base"
    shadow="elevation-1"
    transition="colors"
    slow
    className={cn(
      'border-border/80 rounded-2xl border bg-card dark:border-white/[0.08] dark:bg-card',
      className,
    )}
  >
    {headerTone ? (
      <div
        className={cn(
          'mb-5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-elevation-1',
          SOLID_FILL[headerTone],
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/25">
              <Icon size={19} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black leading-tight sm:text-base">{title}</h2>
            {description && (
              <p className={cn('mt-0.5 text-micro opacity-85', descClassName)}>{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    ) : (
      <div className="border-border/70 mb-5 flex items-center justify-between gap-3 border-b pb-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-elevation-1',
                TILE_TONE[tone],
              )}
            >
              <Icon size={19} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black leading-tight text-main sm:text-base">
              {title}
            </h2>
            {description && (
              <p className={cn('mt-0.5 text-micro text-muted', descClassName)}>{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    )}
    {children}
  </BaseSectionCard>
)

/* ---------- صف معلومة راقي مع خيار النسخ على الكمبيوتر ---------- */

interface InfoRowProps {
  label: string
  value?: ReactNode
  icon?: LucideIcon
  mono?: boolean
  copyable?: boolean
}

export const InfoRow = ({ label, value, icon: Icon, mono, copyable }: InfoRowProps) => {
  const [copied, setCopied] = useState(false)
  const empty = value === undefined || value === null || value === ''
  const stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : ''

  const handleCopy = async () => {
    if (!stringValue || copied) return
    try {
      await navigator.clipboard.writeText(stringValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="border-border/70 bg-surface/60 dark:bg-card/50 group flex items-center gap-3 rounded-2xl border p-3 transition-all duration-normal hover:border-border hover:bg-surface hover:shadow-elevation-1 dark:border-white/[0.06]">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary-soft transition-transform group-hover:scale-105">
          <Icon size={17} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-micro font-medium text-muted">{label}</p>
        {empty ? (
          <p className="mt-0.5 text-xs font-normal text-muted">—</p>
        ) : (
          <p
            className={cn(
              'mt-0.5 min-w-0 break-words text-xs font-bold text-main sm:text-sm',
              mono && 'font-mono tabular-nums tracking-wide',
            )}
          >
            {value}
          </p>
        )}
      </div>

      {copyable && !empty && stringValue && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`نسخ ${label}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
        </button>
      )}
    </div>
  )
}

/* ---------- بطاقة معلومة ملوّنة صغيرة ---------- */

interface InfoTileProps {
  label: string
  value?: ReactNode
  icon: LucideIcon
  tone?: Tone
}

export const InfoTile = ({ label, value, icon: Icon, tone = 'primary' }: InfoTileProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-2xl p-4 text-center shadow-elevation-1 ring-1 ring-white/10 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2',
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
    <p className="relative mt-1.5 text-micro font-medium opacity-90">{label}</p>
  </div>
)

/* ---------- بطاقة روابط سريعة للكمبيوتر ---------- */

interface QuickNavCardProps {
  title: string
  subtitle: string
  icon: LucideIcon
  to: string
  tone?: Tone
}

export const QuickNavCard = ({
  title,
  subtitle,
  icon: Icon,
  to,
  tone = 'primary',
}: QuickNavCardProps) => {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="border-border/80 bg-surface/70 group flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-start shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-white/[0.06] dark:bg-card"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-normal group-hover:scale-105',
            TILE_TONE[tone],
          )}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-main transition-colors group-hover:text-primary">
            {title}
          </p>
          <p className="truncate text-micro font-normal text-muted">{subtitle}</p>
        </div>
      </div>
      <ExternalLink
        size={14}
        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  )
}

/* ---------- شارة الحالة الموحدة ---------- */

export const StatusBadge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-micro font-semibold text-success ring-1 ring-success-soft">
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
    نشط ومعتمد
  </span>
)

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

/* ---------- قسم الدعم وتسجيل الخروج في الشريط الجانبي ---------- */

interface AccountActionsProps {
  onLogoutStore: () => void
  supportPhone?: string
}

export const AccountActions = ({ onLogoutStore, supportPhone }: AccountActionsProps) => {
  const navigate = useNavigate()
  const handleLogout = async () => {
    if (!(await confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من الحساب؟'))) return
    onLogoutStore()
    navigate('/login')
  }

  return (
    <div className="space-y-3">
      {supportPhone && (
        <a
          href={`https://wa.me/${supportPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary-active to-primary-deep px-5 py-3 text-xs font-bold text-on-primary shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-2 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
        >
          <MessageCircle size={15} />
          <span>تواصل مع الدعم الفني والأكاديمي</span>
        </a>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="border-error/30 bg-error-soft/60 dark:bg-error/10 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold text-error transition-all duration-normal hover:-translate-y-0.5 hover:bg-error hover:text-on-error hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
      >
        <LogOut size={15} />
        <span>تسجيل الخروج من الحساب</span>
      </button>
    </div>
  )
}

/* ---------- هيكل التحميل الشامل للكمبيوتر ---------- */

export const ProfileSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="جاري تحميل الحساب">
    <div className="border-border/80 rounded-[28px] border bg-card p-2 shadow-elevation-1">
      <Skeleton className="h-40 w-full rounded-[22px]" />
      <div className="flex items-center gap-4 px-6 pb-6 pt-4">
        <Skeleton className="-mt-14 h-24 w-24 rounded-full ring-4 ring-card" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="space-y-6 lg:col-span-4">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  </div>
)

/* ---------- حالة خطأ موحدة ---------- */

interface ErrorBlockProps {
  onRetry: () => void
}

export const ErrorBlock = ({ onRetry }: ErrorBlockProps) => (
  <div className="bg-error-soft/50 rounded-3xl border border-dashed border-error-soft py-16 text-center">
    <AlertTriangle size={36} className="mx-auto mb-3 text-error" strokeWidth={1.5} />
    <p className="text-base font-bold text-main">تعذر تحميل بيانات الحساب</p>
    <p className="mt-1 text-xs text-muted">يرجى التحقق من اتصالك بالإنترنت ثم إعادة المحاولة</p>
    <button
      type="button"
      onClick={onRetry}
      className="mx-auto mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-xs font-bold text-on-primary shadow-elevation-2 transition-all hover:-translate-y-0.5 hover:shadow-elevation-3 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
    >
      إعادة المحاولة
    </button>
  </div>
)
