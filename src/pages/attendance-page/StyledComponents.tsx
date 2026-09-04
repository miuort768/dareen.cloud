import { cn } from '../../lib/utils'

export const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5', className)}>
    {children}
  </div>
)

export const SectionTitle = ({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  sub?: string
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary-soft text-primary">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-sm font-bold leading-none text-main">{label}</p>
      {sub && <p className="mt-1 text-micro font-bold text-muted">{sub}</p>}
    </div>
  </div>
)
