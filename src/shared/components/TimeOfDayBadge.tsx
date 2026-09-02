import { motion } from 'framer-motion'
import { Sunrise, Sun, MoonStar, Moon } from 'lucide-react'
import { cn } from '../../lib/utils'

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night'

const getPeriod = (): TimePeriod => {
  const h = new Date().getHours()
  if (h < 5) return 'night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 20) return 'evening'
  return 'night'
}

const PERIOD_META: Record<TimePeriod, { icon: typeof Sun; label: string }> = {
  morning: { icon: Sunrise, label: 'صباحك ساطع' },
  afternoon: { icon: Sun, label: 'نهارك مثمر' },
  evening: { icon: MoonStar, label: 'مساءك هادئ' },
  night: { icon: Moon, label: 'للتوفيق دائماً' },
}

interface TimeOfDayBadgeProps {
  variant?: 'soft' | 'glass'
}

export const TimeOfDayBadge = ({ variant = 'soft' }: TimeOfDayBadgeProps) => {
  const period = getPeriod()
  const Icon = PERIOD_META[period].icon

  return (
    <span
      className="relative inline-flex shrink-0"
      role="img"
      aria-label={PERIOD_META[period].label}
      title={PERIOD_META[period].label}
    >
      <motion.span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-full',
          variant === 'glass' ? 'bg-white/20' : 'bg-primary/20 dark:bg-primary/30',
        )}
        animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />
      <span
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full border',
          variant === 'glass'
            ? 'border-white/20 bg-white/10 text-on-primary'
            : 'border-primary/20 bg-primary-soft text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-primary',
        )}
      >
        <Icon size={16} />
      </span>
    </span>
  )
}
