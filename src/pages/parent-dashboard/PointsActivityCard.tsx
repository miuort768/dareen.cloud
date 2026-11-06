import { Star, XCircle, CheckCircle2, Award } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import { CountUp } from '../../shared/components/CountUp'
import { cn } from '../../lib/utils'
import type { PointLogEntry } from './types'

interface PointsActivityCardProps {
  points: number
  rankName: string
  rankIcon: string
  logs: PointLogEntry[]
}

type FeedItem = {
  id: string
  title: string
  meta: string
  amount: number
  tone: 'positive' | 'negative' | 'neutral'
}

export const PointsActivityCard = ({
  points,
  rankName,
  rankIcon,
  logs,
}: PointsActivityCardProps) => {
  const RankIcon = RANK_ICON_MAP[rankIcon] || Star
  const items: FeedItem[] = logs.slice(0, 5).map((log, i) => {
    const amount = log.amount ?? log.points ?? 0
    return {
      id: log.id || `log-${i}`,
      title: log.action || 'نشاط',
      meta: (() => {
        if (!log.timestamp && !log.date) return log.studentName || ''
        try {
          const d = new Date(log.timestamp || log.date || '')
          if (!isNaN(d.getTime())) {
            const time = format(d, 'd MMM HH:mm', { locale: ar })
            return log.studentName ? `${log.studentName} · ${time}` : time
          }
        } catch {
          /* ignore */
        }
        return log.studentName || ''
      })(),
      amount,
      tone: amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral',
    }
  })

  const toneStyle = (tone: FeedItem['tone']) => {
    if (tone === 'positive') return { tile: 'bg-success-soft text-success-strong', Icon: Star }
    if (tone === 'negative') return { tile: 'bg-error-soft text-error-strong', Icon: XCircle }
    return { tile: 'bg-primary-soft text-primary', Icon: CheckCircle2 }
  }

  return (
    <section
      aria-label="النقاط والنشاطات"
      className="border-border/80 overflow-hidden rounded-[26px] border bg-card shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2"
    >
      {/* رتبة الأبناء */}
      <div className="border-border/70 bg-surface/50 flex items-center justify-between gap-3 border-b p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover text-on-primary shadow-elevation-1">
            <RankIcon size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-main">{rankName}</p>
            <p className="flex items-center gap-1 text-xs text-muted">
              <Award size={12} className="text-primary" /> رتبة ونقاط الأبناء
            </p>
          </div>
        </div>
        <div className="border-border/60 shrink-0 rounded-2xl border bg-card px-3.5 py-2 text-center shadow-elevation-1">
          <CountUp
            value={points}
            className="block font-dash text-xl font-black tabular-nums text-primary"
          />
          <span className="text-[10px] font-semibold text-muted">نقطة</span>
        </div>
      </div>

      {/* قائمة النشاطات */}
      <div className="p-4 sm:p-5">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">لا توجد نشاطات مسجلة بعد</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const { tile, Icon } = toneStyle(item.tone)
              return (
                <div
                  key={item.id}
                  className="border-border/50 bg-surface/30 hover:bg-surface/70 flex items-center justify-between gap-3 rounded-2xl border p-3 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-soft',
                        tile,
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-main">{item.title}</p>
                      {item.meta && <p className="truncate text-[10px] text-muted">{item.meta}</p>}
                    </div>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 font-dash text-sm font-black tabular-nums',
                      item.amount > 0
                        ? 'text-success-strong'
                        : item.amount < 0
                          ? 'text-error'
                          : 'text-main',
                    )}
                  >
                    {item.amount > 0 ? `+${item.amount}` : item.amount}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
