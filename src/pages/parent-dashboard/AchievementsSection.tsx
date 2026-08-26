import { motion } from 'framer-motion'
import { Trophy, Star, Flame, BookOpen, Lock } from 'lucide-react'

interface AchievementsSectionProps {
  points: number
  rank: { name: string }
}

export const AchievementsSection = ({ points }: AchievementsSectionProps) => {
  const badges = [
    {
      icon: Star,
      label: 'طالب نشيط',
      unlocked: points >= 100,
      color: 'text-warning',
      bg: 'bg-warning-soft dark:bg-warning-soft',
    },
    {
      icon: Flame,
      label: '7 أيام متتالية',
      unlocked: points >= 200,
      color: 'text-error',
      bg: 'bg-error-soft dark:bg-error-soft',
    },
    {
      icon: BookOpen,
      label: 'أنهيت أول مادة',
      unlocked: points >= 500,
      color: 'text-info',
      bg: 'bg-info-soft dark:bg-info-soft',
    },
    {
      icon: Lock,
      label: 'أكمل 10 واجبات',
      unlocked: points >= 1000,
      color: 'text-muted',
      bg: 'bg-divider dark:bg-surface',
    },
  ]
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft dark:bg-warning-soft">
          <Trophy size={16} className="text-warning dark:text-warning" />
        </div>
        <h3 className="text-base font-bold text-main dark:text-main md:text-lg">الإنجازات</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((badge, i) => {
          const Icon = badge.icon
          return (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={`relative rounded-2xl p-4 ${badge.bg} text-center transition-all duration-300 ${badge.unlocked ? 'hover:-translate-y-0.5 hover:shadow-elevation-1' : ''}`}
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${badge.unlocked ? badge.bg : 'bg-divider dark:bg-surface'}`}
              >
                <Icon size={22} className={badge.unlocked ? badge.color : 'text-muted'} />
              </div>
              <p
                className={`text-xs font-bold ${badge.unlocked ? 'text-main dark:text-main' : 'text-muted dark:text-muted'}`}
              >
                {badge.label}
              </p>
              {!badge.unlocked && (
                <p className="mt-1 text-[10px] text-muted dark:text-muted">مقفل</p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
