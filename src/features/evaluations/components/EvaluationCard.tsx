import { useState } from 'react'
import { Award, Plus, History, Star, TrendingUp, User, GraduationCap, BookOpen } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { RATING_OPTIONS, averageRatingOf, getAvatarGradient } from '../types/constants'
import { EvaluationFormFields } from './EvaluationFormFields'
import { EvaluationHistoryPanel } from './EvaluationHistoryPanel'
import { EvaluationProfilePanel } from './EvaluationProfilePanel'
import type { Student, Evaluation } from '../../../types'

type Panel = 'evaluate' | 'history' | 'profile'

const DEFAULT_INLINE_FORM = { rating: 'ممتاز', points: 0, notes: '' }

interface EvaluationCardProps {
  student: Student
  evaluations: Evaluation[]
  isParent: boolean
  isSubmitting: boolean
  canDelete: (ev: Evaluation) => boolean
  onInlineSubmit: (
    studentId: string,
    data: { rating: string; points: number; notes: string },
  ) => Promise<boolean> | boolean
  onDelete: (id: string) => void
}

export const EvaluationCard = ({
  student,
  evaluations,
  isParent,
  isSubmitting,
  canDelete,
  onInlineSubmit,
  onDelete,
}: EvaluationCardProps) => {
  const [expanded, setExpanded] = useState<Panel | null>(null)
  const [inlineForm, setInlineForm] = useState(DEFAULT_INLINE_FORM)
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
  const ratingOf100 = avgRating ? Math.round((avgRating / 5) * 100) : 0
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

  const togglePanel = (panel: Panel) => {
    if (expanded === panel) {
      setExpanded(null)
      return
    }
    if (panel === 'evaluate') setInlineForm(DEFAULT_INLINE_FORM)
    setExpanded(panel)
  }

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await onInlineSubmit(student.id, inlineForm)
    if (ok) setExpanded(null)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 transition-all duration-slow hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-2">
      {/* Header: avatar + name + grade + XP */}
      <div className="flex items-center gap-3 border-b border-border p-4 pb-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-bold shadow-elevation-2 ring-2 ring-primary/10 transition-transform duration-slow group-hover:scale-105',
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

            <div className="grid grid-cols-3 gap-1.5">
              {statCells.map((cell, i) => (
                <div key={cell.label} className={cn('rounded-xl p-2 text-center', cell.bg)}>
                  <p className="text-[10px] font-bold text-muted">{cell.label}</p>
                  <p
                    className={cn(
                      'tabular-nums',
                      i === 0 ? 'font-dash text-lg font-black md:text-xl' : 'text-xs font-black',
                      cell.text,
                    )}
                  >
                    {cell.value}
                  </p>
                  {i === 0 && ratingOf100 > 0 && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-primary-soft dark:bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-slow"
                        style={{ width: `${ratingOf100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

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
            onClick={() => togglePanel('evaluate')}
            aria-label={`إضافة تقييم لـ ${student.name}`}
            aria-expanded={expanded === 'evaluate'}
            className="flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-[11px] font-bold text-on-primary shadow-elevation-1 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Plus size={12} /> تقييم
          </button>
        )}
        <button
          onClick={() => togglePanel('history')}
          aria-expanded={expanded === 'history'}
          className={cn(
            'flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
            isParent
              ? 'bg-primary text-on-primary hover:bg-primary/90'
              : expanded === 'history'
                ? 'border border-primary bg-primary-soft text-primary'
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
            onClick={() => togglePanel('profile')}
            aria-label={`عرض ملف ${student.name}`}
            aria-expanded={expanded === 'profile'}
            className={cn(
              'flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
              expanded === 'profile'
                ? 'border border-primary bg-primary-soft text-primary'
                : 'border border-border bg-card text-main hover:border-primary/30 hover:bg-hover',
            )}
          >
            <User size={12} /> الملف
          </button>
        )}
      </div>

      {/* Inline panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="inline-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-surface p-3">
              {expanded === 'evaluate' && (
                <EvaluationFormFields
                  formData={inlineForm}
                  onChange={setInlineForm}
                  onSubmit={handleInlineSubmit}
                  onCancel={() => setExpanded(null)}
                  isSubmitting={isSubmitting}
                  formId={`inline-eval-form-${student.id}`}
                />
              )}
              {expanded === 'history' && (
                <EvaluationHistoryPanel
                  student={student}
                  evaluations={evaluations}
                  canDelete={canDelete}
                  onDelete={onDelete}
                />
              )}
              {expanded === 'profile' && (
                <EvaluationProfilePanel student={student} evaluations={evaluations} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
