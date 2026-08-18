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
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="relative flex max-h-[75vh] w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2"
            dir="rtl"
          >
            {/* Compact Header */}
            <div className={cn('relative overflow-hidden px-4 py-3', gradient.g)}>
              <div className="absolute inset-0 bg-white/10" />
              <button
                onClick={onClose}
                className={cn(
                  'absolute end-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/10 transition-all hover:bg-black/20',
                  gradient.on,
                )}
              >
                <X size={12} />
              </button>
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold ring-1 ring-white/30',
                    gradient.on,
                  )}
                >
                  {(student?.name || '?').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={cn('truncate text-xs font-bold', gradient.on)}>{student?.name}</h2>
                  <p className="text-[10px] text-white/60">{student?.grade || '—'}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      <Star size={8} /> {avgRating || '—'}
                    </span>
                    {totalXP > 0 && (
                      <span className="bg-warning/70 flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-on-warning">
                        <Award size={8} /> {totalXP} XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    icon: BookOpen,
                    value: (student?.enrollments || []).length,
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
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-surface p-2 text-center"
                  >
                    <div
                      className={cn(
                        'mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-md',
                        item.color,
                      )}
                    >
                      <item.icon size={11} />
                    </div>
                    <p className="text-[11px] font-bold tabular-nums text-main">{item.value}</p>
                    <p className="text-[8px] text-muted">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {totalSessions > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-muted">
                    <span>تقدم الحصص</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <ProgressBar
                    value={progress}
                    variant={progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'error'}
                    className="h-1.5"
                  />
                </div>
              )}

              {/* Enrollments */}
              {(student?.enrollments || []).length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="flex items-center gap-1 text-[10px] font-bold text-muted">
                    <GraduationCap size={10} /> المواد
                  </h5>
                  {(student?.enrollments || []).map((en, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-main">{en.subject}</p>
                        <p className="text-[9px] text-muted">{en.teacher}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-bold tabular-nums text-main">
                        {en.sessionsUsed}/{en.sessionsTotal}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Evaluations History */}
              <div className="space-y-1.5">
                <h5 className="flex items-center gap-1 text-[10px] font-bold text-muted">
                  <History size={10} /> سجل التقييمات
                  <span className="rounded bg-primary-soft px-1 py-0.5 text-[8px] font-bold text-primary">
                    {studentEvals.length}
                  </span>
                </h5>
                {studentEvals.length > 0 ? (
                  studentEvals.map((ev) => {
                    const r =
                      RATING_OPTIONS.find((ro) => ro.value === ev.rating) || RATING_OPTIONS[0]
                    return (
                      <div key={ev.id} className="rounded-lg border border-border bg-surface p-2">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span
                              className={cn(
                                'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold',
                                r.pill,
                              )}
                            >
                              <r.icon size={8} />
                              {ev.rating}
                            </span>
                            {ev.points > 0 && (
                              <span className="rounded bg-warning-soft px-1 py-0.5 text-[9px] font-bold text-warning">
                                +{ev.points}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-muted">
                              {format(new Date(ev.created_at || ev.date), 'dd/MM')}
                            </span>
                            {canDelete(ev) && (
                              <button
                                onClick={() => onDelete(ev.id)}
                                className="rounded p-0.5 text-muted transition-colors hover:text-error"
                              >
                                <Trash2 size={9} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted">
                          {ev.notes || 'بدون ملاحظات'}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-border py-6 text-center">
                    <History size={16} className="text-muted/30 mx-auto mb-1" />
                    <p className="text-[10px] text-muted">لا يوجد سجل</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-3 py-2">
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-surface py-2 text-[10px] font-bold text-main transition-colors hover:bg-hover"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
