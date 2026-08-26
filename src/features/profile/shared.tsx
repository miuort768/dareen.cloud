/* eslint-disable react-refresh/only-export-components */
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, LogOut, PencilLine } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Skeleton } from '../../shared/components/ui'
import { useNavigate } from 'react-router-dom'
import { confirm } from '../../lib/confirmDialog'

/* ---------- ط¨ط·ط§ظ‚ط© ط§ظ„ظ‡ظٹط±ظˆ ط§ظ„ظ…ظˆط­ط¯ط© ظ„ظƒظ„ ط§ظ„ط­ط³ط§ط¨ط§طھ ---------- */

interface AccountHeroProps {
  name: string
  roleLabel: string
  subtitle?: string
  metaChips?: string[]
  /** ظ…طھط§ط­ ظپظ‚ط· ظ„ظ„ط£ط¯ظˆط§ط± ط§ظ„طھظٹ طھط¯ط¹ظ… ط§ظ„طھط¹ط¯ظٹظ„ ظپط¹ظ„ظٹظ‹ط§ ظپظٹ ط§ظ„ظ†ط¸ط§ظ… */
  onEdit?: () => void
}

export const AccountHero = ({ name, roleLabel, subtitle, metaChips, onEdit }: AccountHeroProps) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 md:p-7"
  >
    <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
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
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#account-hero-grid)" />
      </svg>
    </div>

    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {/* ط­ط±ظپ ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„ ظپظ‚ط· â€” ظ„ط§ طµظˆط±ط© ط´ط®طµظٹط© ظپظٹ ط§ظ„ظ†ط¸ط§ظ… */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-black text-on-primary ring-2 ring-white/40 md:h-16 md:w-16 md:text-2xl">
          {(name || '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-black text-on-primary md:text-2xl">{name}</h1>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-micro font-bold text-on-primary ring-1 ring-white/30">
              <BadgeCheck size={11} />
              {roleLabel}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 truncate text-xs font-medium text-white/80">{subtitle}</p>
          )}
          {metaChips && metaChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {metaChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg bg-white/15 px-2 py-0.5 text-micro font-bold text-on-primary"
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
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-card px-4 py-2.5 text-xs font-bold text-main shadow-elevation-1 transition-all hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <PencilLine size={13} /> طھط¹ط¯ظٹظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ
        </button>
      )}
    </div>
  </motion.section>
)

/* ---------- ط¨ط·ط§ظ‚ط© ظ‚ط³ظ… ط¨ط¹ظ†ظˆط§ظ† ---------- */

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
    className={cn('rounded-2xl border border-border bg-card p-4 md:p-5', className)}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Icon size={16} className="text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold leading-tight text-main">{title}</h2>
          {description && <p className="mt-0.5 text-micro text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </motion.section>
)

/* ---------- طµظپ ظ…ط¹ظ„ظˆظ…ط© ط£ظ†ظٹظ‚ ---------- */

interface InfoRowProps {
  label: string
  value?: ReactNode
  icon?: LucideIcon
  mono?: boolean
}

export const InfoRow = ({ label, value, icon: Icon, mono }: InfoRowProps) => {
  const empty = value === undefined || value === null || value === ''
  return (
    <div className="border-border/60 flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-muted">
        {Icon && <Icon size={12} className="text-muted/70" />}
        {label}
      </span>
      {empty ? (
        <span className="text-muted/70 text-xs">â€”</span>
      ) : (
        <span
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

/* ---------- ط´ط±ظٹط­ط© ط±طھط¨ط© ظ…طµط؛ط±ط© (ظ…ظ† ظ†ط¸ط§ظ… ط§ظ„ط±طھط¨ ط§ظ„ظ…ط´طھط±ظƒ) ---------- */

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

/* ---------- ظ‚ط³ظ… ط§ظ„ط­ط³ط§ط¨ (ط®ط±ظˆط¬) ---------- */

interface AccountActionsProps {
  onLogoutStore: () => void
}

export const AccountActions = ({ onLogoutStore }: AccountActionsProps) => {
  const navigate = useNavigate()
  const handleLogout = async () => {
    if (!(await confirm('ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬طں'))) return
    onLogoutStore()
    navigate('/login')
  }
  return (
    <SectionCard title="ط§ظ„ط­ط³ط§ط¨" icon={LogOut} delay={0.25}>
      <button
        onClick={handleLogout}
        className="bg-error-soft/50 flex w-full items-center justify-center gap-2 rounded-xl border border-error-soft py-3 text-xs font-bold text-error transition-colors hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <LogOut size={14} /> طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬
      </button>
    </SectionCard>
  )
}

/* ---------- ظ‡ظٹظƒظ„ ط§ظ„طھط­ظ…ظٹظ„ ---------- */

export const ProfileSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="ط¬ط§ط±ظٹ طھط­ظ…ظٹظ„ ط§ظ„ط­ط³ط§ط¨">
    <Skeleton className="h-36 w-full rounded-2xl md:h-40" />
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
    </div>
    <Skeleton className="h-48 w-full rounded-2xl" />
  </div>
)

/* ---------- ط­ط§ظ„ط© ط®ط·ط£ ظ…ظˆط­ط¯ط© ---------- */

import { AlertTriangle } from 'lucide-react'

interface ErrorBlockProps {
  onRetry: () => void
}

export const ErrorBlock = ({ onRetry }: ErrorBlockProps) => (
  <div className="bg-error-soft/50 rounded-2xl border border-dashed border-error-soft py-16 text-center">
    <AlertTriangle size={30} className="mx-auto mb-3 text-error" strokeWidth={1.5} />
    <p className="text-sm font-bold text-main">طھط¹ط°ط± طھط­ظ…ظٹظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط­ط³ط§ط¨</p>
    <p className="mt-1 text-xs text-muted">
      طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ط§طھطµط§ظ„ ط«ظ… ط£ط¹ط¯ ط§ظ„ظ…ط­ط§ظˆظ„ط©
    </p>
    <button
      onClick={onRetry}
      className="mx-auto mt-4 block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      ط¥ط¹ط§ط¯ط© ط§ظ„ظ…ط­ط§ظˆظ„ط©
    </button>
  </div>
)
