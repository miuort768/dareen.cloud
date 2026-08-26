import { Award, Plus, History, Star, Calendar, TrendingUp, User } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { RATING_OPTIONS, averageRatingOf, getAvatarGradient } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface EvaluationCardProps {
  student: Student
  evaluations: Evaluation[]
  isParent: boolean
  onAddEvaluation: (studentId: string) => void
  onViewHistory: (student: Student) => void
  onViewProfile: (student: Student) => void
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
  const avgRating = averageRatingOf(studentEvals)
  const totalEnrollments = (student.enrollments || []).length
  const totalSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
  const usedSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
  const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0
  const gradient = getAvatarGradient(student.name)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2 hover:ring-1 hover:ring-primary/20 dark:bg-card dark:hover:ring-primary/30">
      {/* Gradient Top Bar */}
      <div className={cn('relative h-10 shrink-0 overflow-hidden bg-gradient-to-r', gradient.g)}>
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute -end-4 -top-4 h-12 w-12 rounded-full bg-white/20 blur-xl" />
        <div className="absolute -bottom-4 -start-4 h-8 w-8 rounded-full bg-black/10 blur-lg" />
      </div>

      {/* Avatar + Name Row */}
      <div className="relative z-10 -mt-5 px-4">
        <div className="flex items-end justify-between gap-2">
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
              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg bg-gradient-to-l px-2.5 py-1 shadow-sm',
                  gradient.g,
                )}
              >
                <h4 className="truncate text-sm font-bold text-white">{student.name}</h4>
                {student.grade && (
                  <>
                    <span className="h-3 w-px shrink-0 bg-white/40" />
                    <span className="shrink-0 truncate text-micro font-bold text-white/90">
                      {student.grade}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="dark:border-warning-strong/40 flex shrink-0 items-center gap-1 rounded-xl border border-warning bg-warning-light px-2 py-1 dark:bg-warning-soft">
            <Award size={11} className="text-warning-strong" />
            <span className="text-xs font-bold tabular-nums text-warning-strong">
              {totalStudentXP}
            </span>
            <span className="text-micro font-bold text-warning-strong">XP</span>
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
                      'flex items-center gap-1 rounded px-1.5 py-0.5 text-micro font-bold',
                      lastRating.pill,
                    )}
                  >
                    <lastRating.icon size={9} />
                    {lastEval.rating}
                  </span>
                )}
                <span className="text-micro text-muted">
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
              <div className="rounded-xl bg-primary-soft p-2 text-center dark:bg-primary-soft">
                <p className="text-micro text-muted">المعدل</p>
                <p className="text-xs font-bold tabular-nums text-primary dark:text-primary">
                  {avgRating || '—'}
                </p>
              </div>
              <div className="rounded-xl bg-success-soft p-2 text-center dark:bg-success-soft">
                <p className="text-micro text-muted">الحضور</p>
                <p className="text-xs font-bold tabular-nums text-success-strong">{progress}%</p>
              </div>
              <div className="rounded-xl bg-warning-soft p-2 text-center dark:bg-warning-soft">
                <p className="text-micro text-muted">التقييمات</p>
                <p className="text-xs font-bold tabular-nums text-warning-strong">
                  {studentEvals.length}
                </p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary-soft dark:bg-primary-soft">
              <Award size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted">ابدأ أول تقييم</p>
              <p className="mt-0.5 text-micro text-muted">كل تقييم يزيد XP ويسجل في السجل</p>
            </div>
            {totalEnrollments > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-micro text-muted">
                  <Calendar size={8} /> {totalEnrollments} مواد
                </span>
                <span className="flex items-center gap-1 text-micro text-muted">
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
            aria-label={`إضافة تقييم لـ ${student.name}`}
            className="flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-micro font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Plus size={12} /> تقييم
          </button>
        )}
        <button
          onClick={() => onViewHistory(student)}
          className={cn(
            'flex items-center justify-center gap-1 rounded-xl border py-2.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
            isParent
              ? 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
              : 'border-border bg-surface text-main hover:bg-background',
          )}
        >
          <History size={12} /> السجل
          <span className="me-0.5 rounded-md bg-primary-soft px-1 py-0.5 text-micro font-bold text-primary">
            {studentEvals.length}
          </span>
        </button>
        {!isParent && (
          <button
            onClick={() => onViewProfile(student)}
            aria-label={`عرض ملف ${student.name}`}
            className="flex items-center justify-center gap-1 rounded-xl border border-border bg-surface py-2.5 text-micro font-bold text-main transition-all hover:border-primary/30 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <User size={12} /> الملف
          </button>
        )}
      </div>
    </div>
  )
}
