import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { RefreshCw, type LucideIcon } from 'lucide-react'

export const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'rounded-2xl border border-divider bg-card shadow-sm transition-all hover:shadow-md',
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
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-sm font-bold text-main">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted">{sub}</p>}
    </div>
  </div>
)

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-[10px] font-bold text-muted">{children}</label>
)

export const PrimaryBtn = ({
  onClick,
  loading,
  children,
  className = '',
  disabled,
  type,
}: {
  onClick?: () => void
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
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
  title,
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  title?: string
}) => (
  <button
    title={title}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 rounded-xl border border-divider bg-card px-4 py-2.5 text-xs font-bold text-muted transition-all hover:bg-surface hover:text-main active:scale-[0.97]',
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
  title,
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  title?: string
}) => (
  <button
    title={title}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 rounded-xl border-2 border-error-soft bg-error-soft px-4 py-2.5 text-xs font-bold text-error transition-all hover:bg-error hover:text-on-primary active:scale-[0.97]',
      className,
    )}
  >
    {children}
  </button>
)

const kpiAccentMap = {
  primary: {
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
  },
  success: {
    gradient: 'from-success-soft to-transparent',
    iconBg: 'bg-success-soft text-success',
    accent: 'bg-success',
  },
  error: {
    gradient: 'from-error-soft to-transparent',
    iconBg: 'bg-error-soft text-error',
    accent: 'bg-error',
  },
  warning: {
    gradient: 'from-warning-soft to-transparent',
    iconBg: 'bg-warning-soft text-warning',
    accent: 'bg-warning',
  },
  info: {
    gradient: 'from-info-soft to-transparent',
    iconBg: 'bg-info-soft text-info',
    accent: 'bg-info',
  },
}

export const KpiCard = ({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  accent: 'primary' | 'success' | 'error' | 'warning' | 'info'
}) => {
  const style = kpiAccentMap[accent]
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-3.5',
        style.gradient,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn('rounded-lg p-2', style.iconBg)}>
          <Icon size={16} />
        </div>
        <div className={cn('h-1 w-10 rounded-full', style.accent)} />
      </div>
      <p className="mb-0.5 text-[10px] text-muted">{title}</p>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-bold tabular-nums leading-none text-main"
      >
        {value}
      </motion.p>
    </motion.div>
  )
}
