import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  icon: React.ReactNode
  title: string
  unlocked: boolean
  progress?: number
}

interface ProfileAchievementsProps {
  achievements: Achievement[]
  title?: string
}

export const ProfileAchievements = ({
  achievements,
  title = 'الإنجازات',
}: ProfileAchievementsProps) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-main">{title}</h3>
        <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={cn(
              'flex min-w-[80px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
              ach.unlocked
                ? 'border-border bg-surface'
                : 'bg-background/50 border-border/30 opacity-50',
            )}
          >
            <span className={cn(ach.unlocked ? '' : 'opacity-50 grayscale')}>{ach.icon}</span>
            <p
              className={cn(
                'text-center text-[9px] font-bold leading-tight',
                ach.unlocked ? 'text-main' : 'text-muted',
              )}
            >
              {ach.title}
            </p>
            {ach.progress !== undefined && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={cn('h-full rounded-full', ach.unlocked ? 'bg-primary' : 'bg-border')}
                  style={{ width: `${Math.min(ach.progress, 100)}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
