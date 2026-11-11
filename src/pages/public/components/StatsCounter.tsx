import { Users, GraduationCap, BookOpen, Award, Globe, type LucideIcon } from 'lucide-react'
import { useAnimatedNumber } from '../../../shared/hooks/useAnimatedNumber'
import { cn } from '../../../lib/utils'

interface StatData {
  icon: LucideIcon
  target: number
  suffix: string
  label: string
  iconBg: string
  iconColor: string
  numColor: string
  accentBar: string
  duration?: number
}

const stats: StatData[] = [
  {
    icon: Users,
    target: 5000,
    suffix: '+',
    label: 'طالب مسجل',
    iconBg: 'bg-primary-soft',
    iconColor: 'text-primary',
    numColor: 'text-primary',
    accentBar: 'bg-primary',
  },
  {
    icon: GraduationCap,
    target: 200,
    suffix: '+',
    label: 'معلم معتمد',
    iconBg: 'bg-success-soft',
    iconColor: 'text-success',
    numColor: 'text-success',
    accentBar: 'bg-success',
  },
  {
    icon: BookOpen,
    target: 10000,
    suffix: '+',
    label: 'حصة تعليمية',
    iconBg: 'bg-info-soft',
    iconColor: 'text-info',
    numColor: 'text-info',
    accentBar: 'bg-info',
  },
  {
    icon: Award,
    target: 5,
    suffix: '+',
    label: 'سنوات من التميز',
    iconBg: 'bg-warning-soft',
    iconColor: 'text-warning',
    numColor: 'text-warning',
    accentBar: 'bg-warning',
  },
  {
    icon: Globe,
    target: 7,
    suffix: '',
    label: 'نخدم في 7 دول',
    iconBg: 'bg-primary-soft',
    iconColor: 'text-primary',
    numColor: 'text-primary',
    accentBar: 'bg-primary',
    duration: 8000,
  },
]

const AnimatedStatCard = ({
  icon: Icon,
  target,
  suffix,
  label,
  iconBg,
  iconColor,
  numColor,
  accentBar,
  duration,
}: StatData) => {
  const { value, ref } = useAnimatedNumber(target, duration)

  return (
    <div
      ref={(el) => {
        ref.current = el
      }}
      className={cn(
        'group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border',
        'bg-card px-3 py-5 text-center shadow-elevation-1',
        'transition-all duration-normal hover:-translate-y-1 hover:shadow-elevation-2',
      )}
    >
      {/* Top accent bar */}
      <span className={cn('absolute start-0 top-0 h-0.5 w-full', accentBar)} aria-hidden="true" />

      {/* Icon badge */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-elevation-1',
          'transition-transform duration-normal group-hover:scale-110',
          iconBg,
          iconColor,
        )}
      >
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </div>

      {/* Number */}
      <div className="flex flex-col items-center gap-0.5">
        <p
          className={cn(
            'font-dash text-3xl font-black tabular-nums leading-none tracking-tight sm:text-4xl',
            numColor,
          )}
        >
          {value.toLocaleString('en')}
          <span className="ms-0.5 text-2xl">{suffix}</span>
        </p>

        {/* Label */}
        <p className="mt-1 text-xs font-bold text-muted">{label}</p>
      </div>
    </div>
  )
}

export const StatsCounter = () => {
  return (
    <section className="relative overflow-hidden bg-surface pb-4 pt-0 transition-colors duration-500 dark:bg-background md:pb-3 md:pt-0">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
            {stats.map((s) => (
              <AnimatedStatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
