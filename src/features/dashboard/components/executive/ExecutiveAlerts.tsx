import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ExecutiveAlerts as AlertsType } from '../../services/executiveService'
import { AlertTriangle, XCircle, Info, Clock, Bell, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEVERITY_CONFIG: Record<
  string,
  { icon: typeof XCircle; rowBg: string; text: string; dot: string; label: string }
> = {
  critical: {
    icon: XCircle,
    rowBg: 'bg-error-soft border-border',
    text: 'text-error',
    dot: 'bg-error',
    label: 'حرج',
  },
  warning: {
    icon: AlertTriangle,
    rowBg: 'bg-warning-soft border-border',
    text: 'text-warning',
    dot: 'bg-warning',
    label: 'تحذير',
  },
  reminder: {
    icon: Clock,
    rowBg: 'bg-info-soft border-border',
    text: 'text-info',
    dot: 'bg-info',
    label: 'تذكير',
  },
  info: {
    icon: Info,
    rowBg: 'bg-surface border-border',
    text: 'text-muted',
    dot: 'bg-muted',
    label: 'معلومة',
  },
}

type SeverityKey = keyof typeof SEVERITY_CONFIG

function actionRouteFor(message: string): string | null {
  if (/فاتورة|تحصيل|دفعة/.test(message)) return '/student-invoices'
  if (/رصيد|جلسات قليلة/.test(message)) return '/students'
  if (/غياب|حضور/.test(message)) return '/attendance'
  if (/جدول|موعد|تأخير/.test(message)) return '/schedule'
  return null
}

export const ExecutiveAlerts = memo(function ExecutiveAlerts({ alerts }: { alerts: AlertsType }) {
  const [filter, setFilter] = useState<SeverityKey | 'all'>('all')
  if (!alerts) return null

  const allAlerts = [
    ...(alerts.critical || []).map((a) => ({ ...a, severity: 'critical' as SeverityKey })),
    ...(alerts.warning || []).map((a) => ({ ...a, severity: 'warning' as SeverityKey })),
    ...(alerts.reminder || []).map((a) => ({ ...a, severity: 'reminder' as SeverityKey })),
    ...(alerts.info || []).map((a) => ({ ...a, severity: 'info' as SeverityKey })),
  ]

  const counts = {
    all: allAlerts.length,
    critical: alerts.critical?.length || 0,
    warning: alerts.warning?.length || 0,
    reminder: alerts.reminder?.length || 0,
    info: alerts.info?.length || 0,
  }

  const filtered = filter === 'all' ? allAlerts : allAlerts.filter((a) => a.severity === filter)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 font-dash" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-soft">
            <Bell size={16} className="text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main">التنبيهات</h3>
            <p className="text-[10px] text-muted">مراقبة الأنظمة</p>
          </div>
        </div>
        {counts.critical > 0 && (
          <span className="rounded-lg border border-border bg-error-soft px-2 py-0.5 text-[10px] font-bold text-error">
            {counts.critical} حرج
          </span>
        )}
      </div>

      <div className="scrollbar-none mb-3 flex gap-1 overflow-x-auto pb-1">
        {(['all', 'critical', 'warning', 'reminder', 'info'] as const).map((key) => {
          const isActive = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all',
                isActive ? 'bg-primary text-on-primary' : 'bg-surface text-muted hover:text-main',
              )}
            >
              {key === 'all' ? 'الكل' : SEVERITY_CONFIG[key]?.label} ({counts[key] ?? 0})
            </button>
          )
        })}
      </div>

      <div className="custom-scrollbar max-h-64 space-y-1.5 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft">
              <Info size={16} className="text-success" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد تنبيهات</p>
          </div>
        )}
        {filtered.map((alert, i) => {
          const cfg = SEVERITY_CONFIG[alert.severity] ||
            SEVERITY_CONFIG.info || { icon: Info, rowBg: '', text: '', dot: '', label: '' }
          const Icon = cfg.icon
          const actionTo = actionRouteFor(alert.message)
          const body = (
            <>
              <div className="relative mt-0.5 shrink-0">
                <Icon size={14} className={cfg.text} />
                <span
                  className={cn('absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full', cfg.dot)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold leading-relaxed text-main">{alert.message}</p>
                {alert.time && <p className="mt-0.5 text-[10px] text-muted">{alert.time}</p>}
              </div>
              {actionTo ? (
                <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-primary">
                  متابعة
                  <ChevronLeft size={11} className="rtl:rotate-180" />
                </span>
              ) : (
                alert.count && (
                  <span className="shrink-0 text-[10px] font-bold text-muted">+{alert.count}</span>
                )
              )}
            </>
          )
          const rowClass = cn(
            'flex items-start gap-2.5 rounded-xl border p-3 transition-colors',
            cfg.rowBg,
            actionTo && 'hover:border-primary/30 hover:bg-card',
          )

          return actionTo ? (
            <Link
              key={`alert-${i}`}
              to={actionTo}
              className={cn(
                rowClass,
                'block outline-none focus-visible:ring-2 focus-visible:ring-focus',
              )}
            >
              {body}
            </Link>
          ) : (
            <div key={`alert-${i}`} className={rowClass}>
              {body}
            </div>
          )
        })}
      </div>
    </div>
  )
})
