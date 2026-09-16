import { Star, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import type { PointLog, Session } from './types'

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
    detail: s.topics && s.homework ? `${s.topics} · الواجب: ${s.homework}` : s.topics || undefined,
    tone: s.status === 'completed' ? 'neutral' : 'negative',
  }))

  const items = [...pointItems, ...sessionItems].slice(0, 6)
  if (items.length === 0) return null

  const toneStyle = (tone: FeedItem['tone']) => {
    if (tone === 'positive') return { tile: 'bg-success-soft text-success-strong', Icon: Star }
    if (tone === 'negative') return { tile: 'bg-error-soft text-error-strong', Icon: XCircle }
    return { tile: 'bg-primary-soft text-primary', Icon: CheckCircle2 }
  }

  return (
    <section
      aria-label="آخر النشاطات"
      className="rounded-2xl border border-border bg-card p-4 shadow-elevation-1 transition-colors duration-slow sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Activity size={14} />
        </div>
        <h3 className="text-sm font-black text-main">آخر النشاطات</h3>
      </div>

      <ol className="relative space-y-0.5" role="list">
        <div className="absolute bottom-1 end-[15px] top-1 w-px bg-divider" aria-hidden="true" />
        {items.map((item) => {
          const { tile, Icon } = toneStyle(item.tone)
          return (
            <li
              key={item.id}
              className="relative flex items-start gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-surface"
            >
              <span
                className={cn(
                  'z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-2 ring-card',
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
                {item.detail && (
                  <p className="mt-1.5 rounded-xl border border-primary/20 bg-primary-soft p-2 text-[10px] font-bold leading-relaxed text-main">
                    {item.detail}
                  </p>
                )}
              </div>

              {item.amount !== undefined && (
                <span
                  className={cn(
                    'shrink-0 self-center rounded-full px-2 py-0.5 font-dash text-[11px] font-black tabular-nums',
                    item.amount >= 0 ? 'bg-success text-on-success' : 'bg-error text-on-error',
                  )}
                >
                  {item.amount >= 0 ? '+' : ''}
                  {item.amount}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
