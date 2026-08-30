import { ListTodo, Calendar, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ActivityTimelineProps {
  sessions: { id: string; studentName: string; date?: string; status?: string }[]
  tasks: { id: string; title: string; dueDate?: string; status?: string; priority?: string }[]
  showHeader?: boolean
}

interface TimelineItem {
  id: string
  title: string
  time: string
  icon: LucideIcon
  variant: 'success' | 'error' | 'info' | 'warning'
  badge: string
}

export const ActivityTimeline = ({ sessions, tasks, showHeader = true }: ActivityTimelineProps) => {
  const sessionItems: TimelineItem[] = sessions.slice(0, 5).map((s) => ({
    id: `s-${s.id}`,
    title: `جلسة: ${s.studentName}`,
    time: s.date || '',
    icon: Calendar,
    variant: s.status === 'completed' ? 'success' : s.status === 'cancelled' ? 'error' : 'info',
    badge: s.status === 'completed' ? 'تمت' : s.status === 'cancelled' ? 'ملغاة' : 'نشطة',
  }))

  const taskItems: TimelineItem[] = tasks.slice(0, 5).map((t) => ({
    id: `t-${t.id}`,
    title: t.title,
    time: t.dueDate || '',
    icon: ListTodo,
    variant: t.status === 'completed' ? 'success' : 'warning',
    badge: t.status === 'completed' ? 'منجزة' : 'نشطة',
  }))

  const allItems = [...sessionItems, ...taskItems]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)

  const variantStyles: Record<
    TimelineItem['variant'],
    { dot: string; badge: string; iconBg: string; iconText: string }
  > = {
    success: {
      dot: 'bg-success',
      badge: 'bg-success-soft text-success border-border',
      iconBg: 'bg-success-soft',
      iconText: 'text-success',
    },
    error: {
      dot: 'bg-error',
      badge: 'bg-error-soft text-error border-border',
      iconBg: 'bg-error-soft',
      iconText: 'text-error',
    },
    info: {
      dot: 'bg-info',
      badge: 'bg-info-soft text-info border-border',
      iconBg: 'bg-info-soft',
      iconText: 'text-info',
    },
    warning: {
      dot: 'bg-warning',
      badge: 'bg-warning-soft text-warning border-border',
      iconBg: 'bg-warning-soft',
      iconText: 'text-warning',
    },
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 font-dash" dir="rtl">
      {showHeader && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft">
              <Clock size={16} className="text-info" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-main">سجل النشاطات</h3>
              <p className="text-[10px] text-muted">آخر العمليات المسجلة</p>
            </div>
          </div>
          {allItems.length > 0 && (
            <Badge
              variant="default"
              className="h-5 rounded-lg border-border bg-info-soft px-2.5 text-[10px] text-info"
            >
              {allItems.length} نشاط
            </Badge>
          )}
        </div>
      )}

      {allItems.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Clock size={24} className="text-primary-200" />
          </div>
          <p className="text-sm font-bold text-muted dark:text-muted">لا توجد نشاطات مؤخراً</p>
          <p className="mt-1 text-[11px] text-dim dark:text-dim">ستظهر الأنشطة عند تسجيلها</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allItems.map((item) => {
            const Icon = item.icon
            const v = variantStyles[item.variant] || variantStyles.info

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-hover dark:bg-hover dark:hover:bg-hover"
              >
                <div className="relative shrink-0">
                  <div
                    className={cn('flex h-8 w-8 items-center justify-center rounded-lg', v.iconBg)}
                  >
                    <Icon size={13} className={v.iconText} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-[11px] font-bold text-main dark:text-main">
                    {item.title}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Clock size={9} className="shrink-0 text-muted dark:text-dim" />
                    <span className="text-[10px] text-muted dark:text-muted">{item.time}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('h-5 shrink-0 rounded-md border px-2 text-[9px]', v.badge)}
                >
                  {item.badge}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
