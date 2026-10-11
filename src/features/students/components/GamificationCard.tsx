import { Trophy, Star, Award, History } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Badge {
  name: string
  color: string
  date: string
}

interface PointLog {
  id: string
  amount: number
  action: string
  timestamp: string
}

interface GamificationCardProps {
  totalPoints: number
  badges: string | Badge[]
  pointLogs?: PointLog[]
}

export const GamificationCard = ({
  totalPoints,
  badges,
  pointLogs = [],
}: GamificationCardProps) => {
  const parsedBadges: Badge[] = typeof badges === 'string' ? JSON.parse(badges || '[]') : badges

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Total Points Card - Compact Style */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-3 shadow-elevation-1 md:p-4">
        <div className="absolute start-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 bg-white/10 blur-2xl transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="mb-0.5 text-micro font-bold uppercase tracking-widest text-on-primary opacity-80 md:text-micro">
              إجمالي نقاط الإنجاز
            </p>
            <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-on-primary md:text-3xl">
              {totalPoints.toLocaleString()}
              <div className="rounded bg-white/20 p-0.5 md:p-1">
                <Star size={12} className="fill-current text-warning md:h-3.5 md:w-3.5" />
              </div>
            </h2>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 md:h-10 md:w-10">
            <Trophy size={16} className="text-on-primary md:h-5 md:w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Badges Collection */}
        <div className="rounded-2xl border border-border bg-card p-3 md:p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-micro font-medium uppercase tracking-widest text-muted md:text-micro">
            <Award size={12} className="text-primary" /> الأوسمة المكتسبة
          </h3>
          <div className="grid grid-cols-4 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
            {parsedBadges.length > 0 ? (
              parsedBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex cursor-help flex-col items-center gap-1 rounded-xl border border-white/20 p-1.5 shadow-elevation-1 ring-1 ring-inset ring-white/20 transition-all hover:brightness-110',
                    badge.color === 'blue'
                      ? 'bg-primary text-on-primary'
                      : badge.color === 'amber'
                        ? 'bg-warning text-on-warning'
                        : badge.color === 'emerald'
                          ? 'bg-success text-on-success'
                          : 'bg-error text-on-error',
                  )}
                  title={`تم الحصول عليه في ${format(new Date(badge.date), 'yyyy/MM/dd')}`}
                >
                  <Award size={14} strokeWidth={2.5} className="md:h-4 md:w-4" />
                  <span className="text-center text-micro font-bold uppercase leading-none">
                    {badge.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-4 rounded-xl border border-dashed border-border bg-surface py-5 text-center">
                <Award size={20} className="mx-auto mb-1.5 text-muted" />
                <p className="text-micro font-bold uppercase tracking-widest text-muted">
                  لا توجد أوسمة بعد
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Points History */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-3 md:p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-micro font-medium uppercase tracking-widest text-muted md:text-micro">
            <History size={12} className="text-primary" /> سجل النشاط الأخير
          </h3>
          <div className="custom-scrollbar max-h-[150px] flex-1 space-y-1.5 overflow-y-auto ps-1 md:max-h-[200px]">
            {pointLogs.length > 0 ? (
              pointLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-2 transition-colors hover:border-primary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-micro font-medium text-main md:text-micro">
                      {log.action}
                    </p>
                    <p className="mt-0.5 text-micro font-normal text-muted">
                      {format(new Date(log.timestamp), 'yyyy/MM/dd', { locale: ar })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'me-1.5 shrink-0 text-micro font-medium md:text-micro',
                      log.amount > 0 ? 'text-success' : 'text-error',
                    )}
                  >
                    {log.amount > 0 ? '+' : ''}
                    {log.amount}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-micro font-normal uppercase tracking-widest text-muted">
                لا توجد سجلات
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
