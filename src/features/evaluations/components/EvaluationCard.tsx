import { Award, Plus, History, Star, TrendingUp, User, GraduationCap, BookOpen } from 'lucide-react'
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

  const statCells = [
    {
      label: 'المعدل',
      value: avgRating || '—',
      text: 'text-primary',
      bg: 'bg-primary-soft dark:bg-primary/10',
    },
    { label: 'الحضور', value: `${progress}%`, text: 'text-success-strong', bg: 'bg-success-soft' },
    {
      label: 'التقييمات',
      value: studentEvals.length,
      text: 'text-info-strong',
      bg: 'bg-info-soft',
    },
  ]

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 transition-all duration-slow hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-2">
      {/* Header: avatar + name + grade + XP */}
      <div className="flex items-center gap-3 border-b border-border p-4 pb-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-bold shadow-md ring-2 ring-primary/10 transition-transform duration-slow group-hover:scale-105',
            gradient.g,
            gradient.on,
          )}
        >
          {(student.name || '?').charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-black text-main">{student.name}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {student.grade && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-0.5 text-[10px] font-bold text-muted ring-1 ring-border">
                <GraduationCap size={10} className="text-dim" />
                {student.grade}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/10">
              <Award size={10} />
              {totalStudentXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {lastEval ? (
          <>
            {/* Last evaluation summary + note — صندوق واحد مريح */}
            <div className="rounded-xl border border-border bg-surface p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-muted">
                  <Star size={10} /> آخر تقييم
                </span>
                <div className="flex min-w-0 items-center gap-1.5">
                  {lastRating && (
                    <span
                      className={cn(
                        'flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold',
                        lastRating.pill,
                      )}
                    >
                      <lastRating.icon size={9} />
                      {lastEval.rating}
                    </span>
                  )}
                  <span className="shrink-0 text-[10px] text-dim">
                    {format(new Date(lastEval.created_at || lastEval.date), 'dd/MM')}
                  </span>
                </div>
              </div>
              <p className="mt-1.5 line-clamp-2 border-t border-border pt-1.5 text-xs italic leading-relaxed text-muted">
                &ldquo;{lastEval.notes || 'بدون ملاحظات'}&rdquo;
              </p>
            </div>

            {/* Stats — خلايا ملونة ناعمة تكسر البياض */}
            <div className="grid grid-cols-3 gap-1.5">
              {statCells.map((cell) => (
                <div key={cell.label} className={cn('rounded-xl p-2 text-center', cell.bg)}>
                  <p className="text-[10px] font-bold text-muted">{cell.label}</p>
                  <p className={cn('text-xs font-black tabular-nums', cell.text)}>{cell.value}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-hover">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    progress >= 75 ? 'bg-success' : progress >= 50 ? 'bg-info' : 'bg-error',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-5 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary-soft dark:bg-primary/10">
              <Award size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-main">ابدأ أول تقييم</p>
              <p className="mt-0.5 text-[10px] text-muted">كل تقييم يزيد XP ويسجل في السجل</p>
            </div>
            {totalEnrollments > 0 && (
              <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[10px] font-bold text-muted ring-1 ring-border">
                  <BookOpen size={9} /> {totalEnrollments} مواد
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-info-soft px-2 py-1 text-[10px] font-bold text-info-strong">
                  <TrendingUp size={9} /> {progress}% حضور
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className={cn(
          'grid gap-1.5 border-t border-border bg-surface p-3',
          isParent ? 'grid-cols-1' : 'grid-cols-3',
        )}
      >
        {!isParent && (
          <button
            onClick={() => onAddEvaluation(student.id)}
            aria-label={`إضافة تقييم لـ ${student.name}`}
            className="flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-[11px] font-bold text-on-primary shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Plus size={12} /> تقييم
          </button>
        )}
        <button
          onClick={() => onViewHistory(student)}
          className={cn(
            'flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
            isParent
              ? 'bg-primary text-on-primary hover:bg-primary/90'
              : 'border border-border bg-card text-main hover:border-primary/30 hover:bg-hover',
          )}
        >
          <History size={12} /> السجل
          <span className="me-0.5 rounded-md bg-primary-soft px-1 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/10">
            {studentEvals.length}
          </span>
        </button>
        {!isParent && (
          <button
            onClick={() => onViewProfile(student)}
            aria-label={`عرض ملف ${student.name}`}
            className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2.5 text-[11px] font-bold text-main transition-all hover:border-primary/30 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <User size={12} /> الملف
          </button>
        )}
      </div>
    </div>
  )
}
