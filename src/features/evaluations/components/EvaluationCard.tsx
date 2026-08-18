import { Award, Plus, History, Star, Calendar, TrendingUp, User } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { RATING_OPTIONS } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface EvaluationCardProps {
  student: Student
  evaluations: Evaluation[]
  isParent: boolean
  onAddEvaluation: (studentId: string) => void
  onViewHistory: (student: Student) => void
  onViewProfile: (student: Student) => void
}

const avatarGradients = [
  { g: 'from-primary to-primary-hover', on: 'text-on-primary' },
  { g: 'from-success to-success-hover', on: 'text-on-success' },
  { g: 'from-info to-info-hover', on: 'text-on-info' },
  { g: 'from-warning to-warning-hover', on: 'text-on-warning' },
  { g: 'from-error to-error-hover', on: 'text-on-error' },
  { g: 'from-accent to-accent-hover', on: 'text-on-accent' },
]

const getAvatarGradient = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

const getAvgRating = (studentEvals: Evaluation[]) => {
  if (studentEvals.length === 0) return null
  const rMap: Record<string, number> = { ممتاز: 5, 'جيد جدًا': 4, جيد: 3, 'يحتاج تحسين': 2 }
  const avg = studentEvals.reduce((s, ev) => s + (rMap[ev.rating] || 3), 0) / studentEvals.length
  return Math.round(avg * 10) / 10
}

export const EvaluationCard = ({
  student,
  evaluations,
  isParent,
  onAddEvaluation,
  onViewHistory,
  onViewProfile,
}: EvaluationCardProps) => {
  const studentEvals = evaluations
    .filter((ev) => ev.studentId === student.id)
    .sort(
      (a, b) =>
        new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime(),
    )
  const lastEval = studentEvals[0]
  const lastRating = lastEval
    ? RATING_OPTIONS.find((r) => r.value === lastEval.rating) || RATING_OPTIONS[0]
    : null
  const totalStudentXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0)
  const avgRating = getAvgRating(studentEvals)
  const totalEnrollments = (student.enrollments || []).length
  const totalSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
  const usedSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
  const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0
  const gradient = getAvatarGradient(student.name)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2 hover:ring-1 hover:ring-primary/20">
      {/* Gradient Top Bar */}
      <div className={cn('relative h-10 shrink-0 overflow-hidden bg-gradient-to-r', gradient.g)}>
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute -end-4 -top-4 h-12 w-12 rounded-full bg-white/20 blur-xl" />
        <div className="absolute -bottom-4 -start-4 h-8 w-8 rounded-full bg-black/10 blur-lg" />
      </div>

      {/* Avatar + Name Row */}
      <div className="relative z-10 -mt-5 px-4">
        <div className="flex items-end justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold shadow-lg ring-2 ring-background',
                gradient.g,
                gradient.on,
              )}
            >
              {(student.name || '?').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-main">{student.name}</h4>
              <p className="truncate text-xs text-muted">{student.grade || '—'}</p>
            </div>
          </div>
          <div className="border-warning/10 bg-warning-soft/60 flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1">
            <Award size={11} className="text-warning" />
            <span className="text-xs font-bold tabular-nums text-warning">{totalStudentXP}</span>
            <span className="text-warning/60 text-[10px]">XP</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-2 pt-3">
        {lastEval ? (
          <>
            {/* Last Evaluation */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-bold text-muted">
                <Star size={10} /> آخر تقييم
              </span>
              <div className="flex items-center gap-2">
                {lastRating && (
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold',
                      lastRating.pill,
                    )}
                  >
                    <lastRating.icon size={9} />
                    {lastEval.rating}
                  </span>
                )}
                <span className="text-[10px] text-muted">
                  {format(new Date(lastEval.created_at || lastEval.date), 'dd/MM')}
                </span>
              </div>
            </div>
            <div className="min-h-[40px] rounded-xl border border-border bg-surface p-2.5">
              <p className="line-clamp-2 text-xs italic leading-relaxed text-muted">
                &ldquo;{lastEval.notes || 'بدون ملاحظات'}&rdquo;
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-primary-soft/30 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted">المعدل</p>
                <p className="text-xs font-bold tabular-nums text-primary">{avgRating || '—'}</p>
              </div>
              <div className="bg-success-soft/30 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted">الحضور</p>
                <p className="text-xs font-bold tabular-nums text-success">{progress}%</p>
              </div>
              <div className="bg-warning-soft/30 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted">التقييمات</p>
                <p className="text-xs font-bold tabular-nums text-warning">{studentEvals.length}</p>
              </div>
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    progress >= 75 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-error',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
            <div className="bg-primary-soft/50 flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-primary/20">
              <Award size={16} className="text-primary/30" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted">ابدأ أول تقييم</p>
              <p className="text-muted/60 mt-0.5 text-[10px]">كل تقييم يزيد XP ويسجل في السجل</p>
            </div>
            {totalEnrollments > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <Calendar size={8} /> {totalEnrollments} مواد
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <TrendingUp size={8} /> {progress}% حضور
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className={cn(
          'grid gap-1.5 border-t border-border p-3 pt-2',
          isParent ? 'grid-cols-1' : 'grid-cols-3',
        )}
      >
        {!isParent && (
          <button
            onClick={() => onAddEvaluation(student.id)}
            className="flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-95"
          >
            <Plus size={11} /> تقييم
          </button>
        )}
        <button
          onClick={() => onViewHistory(student)}
          className={cn(
            'flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition-all active:scale-95',
            isParent
              ? 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
              : 'border-border bg-surface text-main hover:bg-background',
          )}
        >
          <History size={11} /> السجل
          <span className="me-0.5 rounded bg-primary-soft px-1 py-0.5 text-[9px] font-bold text-primary">
            {studentEvals.length}
          </span>
        </button>
        {!isParent && (
          <button
            onClick={() => onViewProfile(student)}
            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-surface py-2 text-xs font-bold text-main transition-all hover:border-primary/30 hover:bg-background active:scale-95"
          >
            <User size={11} /> الملف
          </button>
        )}
      </div>
    </div>
  )
}
