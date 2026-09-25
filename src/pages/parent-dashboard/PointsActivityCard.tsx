import { Star, Clock, XCircle, CheckCircle2, Sparkles, Award } from 'lucide-react'
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
      className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition-colors duration-slow"
    >
      {/* رتبة الأبناء */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-elevation-1">
            <RankIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-main">{rankName}</p>
            <p className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <Award size={9} className="text-primary" /> رتبة الأبناء
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl bg-card px-3 py-1.5 text-center shadow-elevation-1">
          <CountUp
            value={points}
            className="block font-dash text-lg font-black tabular-nums leading-none text-primary"
          />
          <p className="mt-0.5 text-[9px] font-bold text-muted">نقطة</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-black text-muted">
            <Sparkles size={12} className="text-primary" />
            آخر النشاطات
          </h3>
          <ol className="relative space-y-0.5" role="list">
            <div
              className="absolute bottom-1 end-[15px] top-1 w-px bg-divider"
              aria-hidden="true"
            />
            {items.map((item) => {
              const { tile, Icon } = toneStyle(item.tone)
              return (
                <li
                  key={item.id}
                  className="relative flex items-start gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-hover"
                >
                  <span
                    className={cn(
                      'z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-2 ring-surface',
                      tile,
                    )}
                    aria-hidden="true"
                  >
                    <Icon size={13} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-black text-main">{item.title}</p>
                    {item.meta && (
                      <p className="flex items-center gap-1 text-[10px] font-bold text-muted">
                        <Clock size={8} />
                        {item.meta}
                      </p>
                    )}
                  </div>

                  <span
                    className={cn(
                      'shrink-0 self-center rounded-full px-2 py-0.5 font-dash text-[11px] font-black tabular-nums',
                      item.tone === 'positive' && 'bg-success text-on-success',
                      item.tone === 'negative' && 'bg-error text-on-error',
                      item.tone === 'neutral' && 'bg-primary-soft text-primary',
                    )}
                  >
                    {item.amount > 0 ? '+' : ''}
                    {item.amount}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}
