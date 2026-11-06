import { Star, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import type { PointLog, Session } from './types'
import { sessionOutcome } from '../../shared/utils/enrollments'

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
    detail:
      s.topics && s.homework
        ? `${s.topics} · الواجب: ${s.homework}`
        : s.topics
          ? s.topics
          : s.homework
            ? `الواجب: ${s.homework}`
            : undefined,
    tone: sessionOutcome(s.status) === 'done' ? 'neutral' : 'negative',
  }))

  const items = [...pointItems, ...sessionItems].slice(0, 5)
  if (items.length === 0) return null

  const toneStyle = (tone: FeedItem['tone']) => {
    if (tone === 'positive') return { tile: 'bg-success-soft text-success-strong', Icon: Star }
    if (tone === 'negative') return { tile: 'bg-error-soft text-error-strong', Icon: XCircle }
    return { tile: 'bg-primary-soft text-primary', Icon: CheckCircle2 }
  }

  return (
    <section
      aria-label="آخر النشاطات"
      className="border-border/80 rounded-[26px] border bg-card p-5 shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-soft">
            <Activity size={16} />
          </div>
          <h3 className="text-sm font-black text-main">آخر النشاطات والحصص</h3>
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary">
          {items.length}
        </span>
      </div>

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
                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                    {item.meta && <span>{item.meta}</span>}
                    {item.detail && (
                      <>
                        <span>·</span>
                        <span className="truncate">{item.detail}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {typeof item.amount === 'number' && (
                <span
                  className={cn(
                    'shrink-0 font-dash text-xs font-black tabular-nums',
                    item.amount > 0
                      ? 'text-success-strong'
                      : item.amount < 0
                        ? 'text-error'
                        : 'text-main',
                  )}
                >
                  {item.amount > 0 ? `+${item.amount}` : item.amount}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
