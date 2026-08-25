import { memo } from 'react'
import { Database, MemoryStick, Cpu, Clock3 } from 'lucide-react'
import type { SystemHealth } from '../../services/executiveService'
import { cn } from '@/lib/utils'

const DOT: Record<string, string> = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-error',
}

export const SystemStatusBar = memo(function SystemStatusBar({ health }: { health: SystemHealth }) {
  if (!health) return null

  const dbOk = health.database?.status === 'connected'
  const redisOk = health.redis?.status === 'connected' && !(health.redis?.fallbacks > 0)
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
    icon: typeof Database
    label: string
    detail: string
    tone: string
  }) => (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <Icon size={12} strokeWidth={1.8} className="text-dim" />
      <span className="text-[10px] font-bold text-muted">{label}</span>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone] || 'bg-muted')} />
      <span className="text-[10px] font-bold tabular-nums text-dim">{detail}</span>
    </span>
  )

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-xl border border-border bg-card px-4 py-2.5 font-dash"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Item
          icon={Database}
          label="قاعدة البيانات"
          detail={dbOk ? `${health.database?.latency ?? 0}ms` : 'منقطعة'}
          tone={dbOk ? 'healthy' : 'critical'}
        />
        <Item
          icon={Database}
          label="Redis"
          detail={redisOk ? 'متصل' : `${health.redis?.fallbacks ?? 0} تجاوز`}
          tone={redisOk ? 'healthy' : health.redis?.fallbacks > 0 ? 'warning' : 'critical'}
        />
        <Item icon={MemoryStick} label="الذاكرة" detail={`${memPercent}%`} tone={memTone} />
        <Item icon={Cpu} label="المعالج" detail={`${cpuLoad.toFixed(0)}%`} tone={cpuTone} />
      </div>
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <Clock3 size={12} strokeWidth={1.8} className="text-dim" />
        <span className="text-[10px] font-bold tabular-nums text-dim">
          تشغيل مستمر {uptimeHours} ساعة
        </span>
      </span>
    </div>
  )
})
