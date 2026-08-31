import { Clock, Calendar } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface StudentCardTimerProps {
  timerRunning: boolean
  timerSeconds: number
  onToggle: () => void
  onReschedule?: () => void
  formatTime: (secs: number) => string
}

export const StudentCardTimer = ({
  timerRunning,
  timerSeconds,
  onToggle,
  onReschedule,
  formatTime,
}: StudentCardTimerProps) => (
  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center justify-between rounded-none border px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
        timerRunning
          ? 'border-error bg-error text-on-error'
          : 'border-primary bg-primary text-on-primary hover:bg-primary-hover',
      )}
    >
      <div className="flex items-center gap-2">
        <Clock size={14} className={cn(timerRunning && 'animate-spin-slow')} />
        <span className="font-mono text-xs font-bold">{formatTime(timerSeconds)}</span>
      </div>
      <span className="text-micro font-bold uppercase">{timerRunning ? 'إنهاء' : 'بدء'}</span>
    </button>
    <button
      onClick={onReschedule}
      className="flex items-center justify-center gap-2 rounded-none border border-border bg-card px-3 py-2.5 text-micro font-bold uppercase text-muted transition-all hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
    >
      <Calendar size={14} /> إعادة جدولة
    </button>
  </div>
)
