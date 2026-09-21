import { Users, GraduationCap, BookOpen, Award, Globe, type LucideIcon } from 'lucide-react'
import { useAnimatedNumber } from '../../../shared/hooks/useAnimatedNumber'
import { StatCard } from '../../../shared/components/ui'
import type { StatCardProps } from '../../../shared/components/ui'

interface StatData {
  icon: LucideIcon
  target: number
  suffix: string
  label: string
  variant: StatCardProps['variant']
  duration?: number
}

const AnimatedStatCard = ({ icon, target, suffix, label, variant, duration }: StatData) => {
  const { value, ref } = useAnimatedNumber(target, duration)
  return (
    <div
      ref={(el) => {
        ref.current = el
      }}
    >
      <StatCard icon={icon} title={label} value={`${value}${suffix}`} variant={variant} />
    </div>
  )
}

export const StatsCounter = () => {
  const stats: StatData[] = [
    { icon: Users, target: 5000, suffix: '+', label: 'طالب مسجل', variant: 'default' },
    { icon: GraduationCap, target: 200, suffix: '+', label: 'معلم معتمد', variant: 'default' },
    { icon: BookOpen, target: 10000, suffix: '+', label: 'حصة تعليمية', variant: 'default' },
    { icon: Award, target: 5, suffix: '+', label: 'سنوات من التميز', variant: 'default' },
    {
      icon: Globe,
      target: 7,
      suffix: '',
      label: 'نخدم في 7 دول',
      variant: 'default',
      duration: 8000,
    },
  ]

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
