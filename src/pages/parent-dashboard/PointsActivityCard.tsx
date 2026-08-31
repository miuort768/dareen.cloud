import { Star, Clock, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { RANK_ICON_MAP } from '../../shared/utils/ranks'
import type { PointLogEntry } from './types'

interface PointsActivityCardProps {
  points: number
  rankName: string
  rankIcon: string
  logs: PointLogEntry[]
}

export const PointsActivityCard = ({
  points,
  rankName,
  rankIcon,
  logs,
}: PointsActivityCardProps) => {
  const RankIcon = RANK_ICON_MAP[rankIcon] || Star
  const recent = logs.slice(0, 5)

  return (
    <section
      aria-label="النقاط والنشاطات"
      className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-colors duration-300"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface">
            <RankIcon size={17} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-main">{rankName}</p>
            <p className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <Sparkles size={9} /> رتبة الأبناء
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-xl bg-surface px-3 py-1.5 text-center">
          <p className="text-lg font-black tabular-nums leading-none text-primary">{points}</p>
          <p className="mt-0.5 text-[9px] font-bold text-muted">نقطة</p>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="p-4">
          <h3 className="mb-3 text-xs font-black text-muted">آخر النشاطات</h3>
          <ol className="relative space-y-3" role="list">
            <div className="absolute bottom-1 end-[9px] top-1 w-px bg-divider" aria-hidden="true" />
            {recent.map((log, i) => {
              const amount = log.amount ?? log.points ?? 0
              const isPositive = amount >= 0
              return (
                <li key={log.id || `log-${i}`} className="relative flex items-center gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-black text-main">{log.action}</p>
                    <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
                      {log.studentName}
                      {log.timestamp && (
                        <>
                          <Clock size={8} />
                          {(() => {
                            try {
                              const d = new Date(log.timestamp!)
                              return isNaN(d.getTime())
                                ? ''
                                : format(d, 'd MMM HH:mm', { locale: ar })
                            } catch {
                              return ''
                            }
                          })()}
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-black tabular-nums ${
                      isPositive ? 'bg-success-soft text-success' : 'bg-error-soft text-error'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {amount}
                  </span>
                  <span
                    className={`z-10 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-surface ${
                      isPositive ? 'bg-success' : 'bg-error'
                    }`}
                    aria-hidden="true"
                  />
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}
