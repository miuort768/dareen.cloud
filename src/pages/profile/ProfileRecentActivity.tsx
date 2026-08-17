import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  icon: React.ReactNode
  title: string
  description?: string
  timestamp: string
  type?: 'success' | 'warning' | 'info' | 'default'
}

interface ProfileRecentActivityProps {
  activities: Activity[]
  title?: string
}

const typeColors: Record<string, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
  default: 'bg-surface text-muted',
}

export const ProfileRecentActivity = ({
  activities,
  title = 'آخر النشاطات',
}: ProfileRecentActivityProps) => {
  if (activities.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-main">{title}</h3>
      <div className="space-y-2.5">
        {activities.map((act, i) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="bg-surface/50 border-border/50 flex items-center gap-3 rounded-xl border p-2.5"
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                typeColors[act.type || 'default'],
              )}
            >
              {act.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-main">{act.title}</p>
              {act.description && (
                <p className="truncate text-[10px] text-muted">{act.description}</p>
              )}
            </div>
            <span className="whitespace-nowrap text-[9px] font-medium text-muted">
              {act.timestamp}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
