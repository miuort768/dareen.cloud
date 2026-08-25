import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  ListTodo,
  AlertTriangle,
  Sun,
  Plus,
  ArrowLeft,
  BatteryLow,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FocusSession {
  id: string
  studentName: string
  time: string
  subject?: string
  status?: string
}

interface FocusTask {
  id: string
  title: string
  dueDate?: string
  status?: string
  priority?: string
}

interface TodaysFocusProps {
  todaySessions: FocusSession[]
  tasks: FocusTask[]
  lowBalanceCount: number
}

const STATUS_STYLE: Record<string, { badge: string; label: string }> = {
  completed: { badge: 'bg-success-soft text-success', label: 'حضرت' },
  cancelled: { badge: 'bg-error-soft text-error', label: 'غياب' },
  scheduled: { badge: 'bg-info-soft text-info', label: 'مجدولة' },
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-error',
  medium: 'bg-warning',
  low: 'bg-info',
}

export const TodaysFocus = ({ todaySessions, tasks, lowBalanceCount }: TodaysFocusProps) => {
  const hasAnyData = todaySessions.length > 0 || tasks.length > 0 || lowBalanceCount > 0

  if (!hasAnyData) {
    return (
      <div className="rounded-2xl border border-border bg-card py-8 text-center" dir="rtl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
          <Sun size={24} strokeWidth={1.6} className="text-primary" />
        </div>
        <p className="text-sm font-bold text-muted">لا توجد مهام اليوم</p>
        <p className="mt-1 text-[11px] font-medium text-dim">استمتع بيوم هادئ</p>
        <Link to="/tasks">
          <Button size="sm" className="mt-3 h-8 gap-1.5 rounded-xl px-4 text-[10px] font-bold">
            <Plus size={12} /> إنشاء مهمة
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-1.5" dir="rtl">
      {todaySessions.slice(0, 5).map((s) => {
        const st = STATUS_STYLE[s.status || 'scheduled'] || STATUS_STYLE.scheduled
        return (
          <div
            key={s.id}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-surface"
          >
            <span className="w-[50px] shrink-0 rounded-lg bg-surface py-1.5 text-center text-[10px] font-black tabular-nums leading-none text-main">
              {s.time || '—'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-main">{s.studentName}</p>
              {s.subject && (
                <p className="mt-0.5 truncate text-[10px] font-medium text-muted">{s.subject}</p>
              )}
            </div>
            <span
              className={cn(
                'shrink-0 rounded-lg px-2 py-1 text-[9px] font-black leading-none',
                st.badge,
              )}
            >
              {st.label}
            </span>
          </div>
        )
      })}

      {tasks.slice(0, 3).map((t) => (
        <Link
          key={t.id}
          to="/tasks"
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span className="flex h-[26px] w-[50px] shrink-0 items-center justify-center rounded-lg bg-surface">
            <ListTodo size={13} strokeWidth={1.9} className="text-warning" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-main">{t.title}</p>
            {t.dueDate && (
              <p className="mt-0.5 text-[10px] font-medium tabular-nums text-muted">{t.dueDate}</p>
            )}
          </div>
          <span
            className={cn('h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[t.priority || 'low'])}
          />
        </Link>
      ))}

      {lowBalanceCount > 0 && (
        <Link
          to="/students"
          className="border-error/25 bg-error-soft/60 flex items-center gap-2.5 rounded-xl border p-2.5 outline-none transition-colors hover:bg-error-soft focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span className="flex h-[26px] w-[50px] shrink-0 items-center justify-center rounded-lg bg-card">
            <BatteryLow size={13} strokeWidth={1.9} className="text-error" />
          </span>
          <p className="flex-1 text-xs font-bold text-error">
            {lowBalanceCount} طالب برصيد جلسات منخفض
          </p>
          <AlertTriangle size={13} className="shrink-0 text-error opacity-70" />
        </Link>
      )}

      <div className="flex gap-2 pt-1.5">
        <Link to="/schedule" className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 rounded-xl text-[10px] font-bold"
          >
            <CalendarCheck size={11} />
            الجدول
            <ArrowLeft size={10} />
          </Button>
        </Link>
        <Link to="/tasks" className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 rounded-xl text-[10px] font-bold"
          >
            <ListTodo size={11} />
            المهام
            <ArrowLeft size={10} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
