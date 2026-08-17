import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressItem {
  label: string
  value: number
  color?: string
}

interface ProfileProgressProps {
  items: ProgressItem[]
  title?: string
}

export const ProfileProgress = ({ items, title = 'مؤشرات الأداء' }: ProfileProgressProps) => {
  const getColor = (value: number) => {
    if (value >= 80) return 'bg-success'
    if (value >= 50) return 'bg-warning'
    return 'bg-error'
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-main">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-main">{item.label}</span>
              <span
                className={cn(
                  'text-[11px] font-bold tabular-nums',
                  item.value >= 80
                    ? 'text-success'
                    : item.value >= 50
                      ? 'text-warning'
                      : 'text-error',
                )}
              >
                {item.value}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <motion.div
                className={cn('h-full rounded-full', item.color || getColor(item.value))}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(item.value, 100)}%` }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
