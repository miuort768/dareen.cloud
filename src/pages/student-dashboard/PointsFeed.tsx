import { Star, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { PointLog } from './types'
import type { Session } from './types'

interface PointsFeedProps {
  pointLogs: PointLog[]
  recentSessions: Session[]
}

type FeedItem = {
  id: string
  title: string
  meta: string
  detail?: string
  amount?: number
  tone: 'positive' | 'negative' | 'neutral'
}

export const PointsFeed = ({ pointLogs, recentSessions }: PointsFeedProps) => {
  const pointItems: FeedItem[] = pointLogs.slice(0, 5).map((log, i) => ({
    id: log.id || `pt-${i}`,
    title: log.action,
    meta: (() => {
      if (!log.timestamp && !log.date) return ''
      try {
        const d = new Date(log.timestamp || log.date || '')
        return isNaN(d.getTime()) ? '' : format(d, 'd MMM HH:mm', { locale: ar })
      } catch {
        return ''
      }
    })(),
    amount: log.amount,
    tone: log.amount >= 0 ? 'positive' : 'negative',
  }))

  const sessionItems: FeedItem[] = recentSessions.slice(0, 3).map((s, i) => ({
    id: s.id || `ss-${i}`,
    title: `حصة ${s.subject || ''}`,
    meta: s.date || '',
    detail: s.topics || undefined,
    tone: s.status === 'completed' ? 'neutral' : 'negative',
  }))

  const items = [...pointItems, ...sessionItems].slice(0, 6)
  if (items.length === 0) return null

  return (
    <section
      aria-label="آخر النشاطات"
      className="rounded-none border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
          <Activity size={14} className="text-primary" />
        </div>
        <h3 className="text-sm font-black text-main">آخر النشاطات</h3>
      </div>

      <ol className="relative space-y-3" role="list">
        <div className="absolute bottom-1 end-[9px] top-1 w-px bg-divider" aria-hidden="true" />
        {items.map((item) => {
          const isPositive = item.tone === 'positive'
          const isNegative = item.tone === 'negative'
          const Icon = isPositive ? Star : isNegative ? XCircle : CheckCircle2
          return (
            <li key={item.id} className="relative flex items-center gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-main">{item.title}</p>
                {item.meta && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-muted">
                    <Clock size={8} />
                    {item.meta}
                  </p>
                )}
                {item.detail && (
                  <p className="mt-1 rounded-none border border-primary/20 bg-primary-soft p-1.5 text-[10px] font-bold leading-relaxed text-main">
                    {item.detail}
                  </p>
                )}
              </div>
              {item.amount !== undefined && (
                <span
                  className={`shrink-0 rounded-none px-2 py-0.5 text-[11px] font-black tabular-nums ${
                    isPositive ? 'bg-success-soft text-success' : 'bg-error-soft text-error'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {item.amount}
                </span>
              )}
              <span
                className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${
                  isPositive ? 'bg-success-soft' : isNegative ? 'bg-error-soft' : 'bg-primary-soft'
                }`}
                aria-hidden="true"
              >
                <Icon
                  size={10}
                  className={
                    isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-primary'
                  }
                />
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
