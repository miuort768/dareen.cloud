import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Target } from 'lucide-react'

interface ProfileBottomMotivationProps {
  icon?: ReactNode
  title: string
  description: string
  progress?: number
  progressLabel?: string
  targetLabel?: string
  color?: 'primary' | 'success' | 'warning' | 'info'
}

const colorMap = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
  success: { bg: 'bg-success/10', text: 'text-success', bar: 'bg-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', bar: 'bg-warning' },
  info: { bg: 'bg-info/10', text: 'text-info', bar: 'bg-info' },
}

export const ProfileBottomMotivation = ({
  icon = <Target size={22} className="text-primary" />,
  title,
  description,
  progress,
  progressLabel,
  targetLabel,
  color = 'primary',
}: ProfileBottomMotivationProps) => {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', c.bg)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-0.5 text-sm font-bold leading-tight text-main">{title}</h3>
          <p className="text-[11px] text-muted">{description}</p>
        </div>
      </div>

      {progress !== undefined && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            {progressLabel && (
              <span className="text-[10px] font-bold text-muted">{progressLabel}</span>
            )}
            <span className="text-[11px] font-bold tabular-nums text-main">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <motion.div
              className={cn('h-full rounded-full', c.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          {targetLabel && <p className="mt-1 text-[9px] font-medium text-muted">{targetLabel}</p>}
        </div>
      )}
    </motion.div>
  )
}
