import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Award,
  Star,
  Calendar,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Trophy,
  Trash2,
  History,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { ProgressBar } from '../../../shared/components/ui'
import { RATING_OPTIONS } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface EvaluationDrawerProps {
  student: Student | null
  evaluations: Evaluation[]
  canDelete: (ev: Evaluation) => boolean
  onDelete: (id: string) => void
  onClose: () => void
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

export const EvaluationDrawer = ({
  student,
  evaluations,
  canDelete,
  onDelete,
  onClose,
}: EvaluationDrawerProps) => {
  const studentEvals = useMemo(
    () =>
      (evaluations || [])
        .filter((ev) => ev.studentId === student?.id)
        .sort(
          (a, b) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime(),
        ),
    [evaluations, student?.id],
  )

  useEffect(() => {
    if (!student) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [student, onClose])

  const totalXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0)
  const totalEnrollments = (student?.enrollments || []).length
  const totalSessions = (student?.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
  const usedSessions = (student?.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
  const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0
  const gradient = getAvatarGradient(student?.name || '')

  const rMap: Record<string, number> = { ممتاز: 5, 'جيد جدًا': 4, جيد: 3, 'يحتاج تحسين': 2 }
  const avgRating =
    studentEvals.length > 0
      ? Math.round(
          (studentEvals.reduce((s, ev) => s + (rMap[ev.rating] || 3), 0) / studentEvals.length) *
            10,
        ) / 10
      : 0

  return (
    <AnimatePresence>
      {student && (
        <motion.div
          key="drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex justify-end"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative flex w-full max-w-md flex-col overflow-hidden border-s border-border bg-background shadow-elevation-3"
            dir="rtl"
          >
            {/* Header */}
            <div className={cn('relative overflow-hidden bg-gradient-to-br p-5', gradient.g)}>
              <div className="absolute inset-0 bg-white/10" />
              <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-6 -start-6 h-16 w-16 rounded-full bg-black/10 blur-xl" />
              <button
                onClick={onClose}
                className={cn(
                  'absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 transition-all hover:bg-black/20',
                  gradient.on,
                )}
              >
                <X size={16} />
              </button>
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold shadow-lg ring-2 ring-white/30 backdrop-blur-sm',
                    gradient.on,
                  )}
                >
                  {(student?.name || '?').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={cn('truncate text-base font-bold', gradient.on)}>
                    {student?.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/70">{student?.grade || '—'}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="bg-warning-soft/60 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold text-warning">
                      <Award size={10} /> {totalXP} XP
                    </span>
                    <span className="flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
                      <Star size={10} /> {avgRating || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    icon: BookOpen,
                    value: totalEnrollments,
                    label: 'المواد',
                    color: 'text-primary bg-primary-soft',
                  },
                  {
                    icon: Calendar,
                    value: `${usedSessions}/${totalSessions}`,
                    label: 'الحصص',
                    color: 'text-info bg-info-soft',
                  },
                  {
                    icon: TrendingUp,
                    value: `${progress}%`,
                    label: 'الحضور',
                    color: 'text-success bg-success-soft',
                  },
                  {
                    icon: History,
                    value: studentEvals.length,
                    label: 'التقييمات',
                    color: 'text-warning bg-warning-soft',
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-3.5">
                    <div
                      className={cn(
                        'mb-2 flex h-8 w-8 items-center justify-center rounded-lg',
                        item.color,
                      )}
                    >
                      <item.icon size={14} />
                    </div>
                    <p className="text-base font-bold tabular-nums text-main">{item.value}</p>
                    <p className="mt-0.5 text-xs text-muted">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {totalSessions > 0 && (
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-muted">
                    <span>تقدم الحصص</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <ProgressBar
                    value={progress}
                    variant={progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'error'}
                    className="h-2"
                  />
                </div>
              )}

              {/* Enrollments */}
              {(student?.enrollments || []).length > 0 && (
                <div className="space-y-2">
                  <h5 className="flex items-center gap-1.5 text-xs font-bold text-muted">
                    <GraduationCap size={12} /> المواد المسجلة
                  </h5>
                  <div className="space-y-1.5">
                    {(student?.enrollments || []).map((en, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-main">{en.subject}</p>
                          <p className="text-xs text-muted">{en.teacher}</p>
                        </div>
                        <div className="shrink-0 text-end">
                          <p className="text-sm font-bold tabular-nums text-main">
                            {en.sessionsUsed}/{en.sessionsTotal}
                          </p>
                          <p className="text-[10px] text-muted">حصة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluations History */}
              <div className="space-y-2">
                <h5 className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <History size={12} /> سجل التقييمات
                  <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {studentEvals.length}
                  </span>
                </h5>
                <div className="space-y-2">
                  {studentEvals.length > 0 ? (
                    studentEvals.map((ev) => {
                      const r =
                        RATING_OPTIONS.find((ro) => ro.value === ev.rating) || RATING_OPTIONS[0]
                      return (
                        <div
                          key={ev.id}
                          className="rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20"
                        >
                          <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold',
                                  r.pill,
                                )}
                              >
                                <r.icon size={10} />
                                {ev.rating}
                              </span>
                              {ev.points > 0 && (
                                <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-bold text-warning">
                                  +{ev.points} XP
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted">
                                {format(new Date(ev.created_at || ev.date), 'dd/MM/yyyy')}
                              </span>
                              {canDelete(ev) && (
                                <button
                                  onClick={() => onDelete(ev.id)}
                                  className="rounded p-0.5 text-muted transition-colors hover:text-error"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="border-s-2 border-primary/20 ps-2 text-xs italic leading-relaxed text-muted">
                            &ldquo;{ev.notes || 'لا يوجد ملاحظات'}&rdquo;
                          </p>
                          <p className="mt-1 text-[10px] text-muted">
                            بواسطة: {ev.teacherName || 'نظام آلي'}
                          </p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-10 text-center">
                      <Trophy size={28} className="mx-auto mb-2 text-muted opacity-30" />
                      <p className="text-sm text-muted">لا يوجد سجل تقييمات</p>
                      <p className="text-muted/60 mt-0.5 text-xs">أضف التقييم الأول للطالب</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
