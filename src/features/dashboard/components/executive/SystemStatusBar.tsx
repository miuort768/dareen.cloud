import { memo } from 'react'
import { Zap, MemoryStick, Cpu, Clock3, Activity } from 'lucide-react'
import type { SystemHealth } from '../../services/executiveService'
import { cn } from '@/lib/utils'

const DOT: Record<string, string> = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-error',
}

export const SystemStatusBar = memo(function SystemStatusBar({ health }: { health: SystemHealth }) {
  if (!health) return null

  const redisStatus = health.redis?.status || 'fallback'
  const redisOk = redisStatus === 'connected' && !(health.redis?.fallbacks > 0)
  const redisDetail = redisOk
    ? 'متصل'
    : redisStatus === 'fallback'
      ? 'بديل (ذاكرة)'
      : health.redis?.fallbacks > 0
        ? `${health.redis.fallbacks} تجاوز`
        : 'منقطعة'
  const memPercent = Math.round(health.memory?.usagePercent || 0)
  const cpuLoad = health.cpu?.load || 0
  const uptimeHours = health.uptime ? Math.round(health.uptime / 3600) : 0

  const memTone = memPercent > 90 ? 'critical' : memPercent > 75 ? 'warning' : 'healthy'
  const cpuTone = cpuLoad > 90 ? 'critical' : cpuLoad > 70 ? 'warning' : 'healthy'

  const Item = ({
    icon: Icon,
    label,
    detail,
    tone,
  }: {
    icon: typeof Zap
    label: string
    detail: string
    tone: string
  }) => (
    <div className="border-border/60 bg-surface/60 flex items-center gap-2 rounded-xl border px-3 py-1.5 shadow-soft">
      <Icon size={13} strokeWidth={1.9} className="text-muted" />
      <span className="text-[11px] font-medium text-main">{label}</span>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone] || 'bg-muted')} />
      <span className="text-[11px] font-semibold tabular-nums text-dim">{detail}</span>
    </div>
  )

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 font-dash shadow-elevation-1 sm:px-4 sm:py-2.5"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="me-1 flex items-center gap-1.5 text-xs font-semibold text-main">
          <Activity size={14} className="text-primary" />
          <span>حالة البنية التحتية:</span>
        </div>
        <Item
          icon={Zap}
          label="Redis"
          detail={redisDetail}
          tone={redisOk ? 'healthy' : 'warning'}
        />
        <Item icon={MemoryStick} label="الذاكرة" detail={`${memPercent}%`} tone={memTone} />
        <Item icon={Cpu} label="المعالج" detail={`${cpuLoad.toFixed(0)}%`} tone={cpuTone} />
      </div>
      <div className="border-border/60 bg-surface/40 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs text-muted shadow-soft">
        <Clock3 size={13} strokeWidth={1.9} className="text-muted" />
        <span className="font-medium tabular-nums">تشغيل مستمر {uptimeHours} ساعة</span>
      </div>
    </div>
  )
})
