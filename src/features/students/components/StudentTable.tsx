import { memo, useMemo } from 'react'
import { Edit, Trash, Bell, GraduationCap, Star, AlertTriangle } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Table, ProgressBar } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'
import type { Student } from '../types'

interface StudentTableProps {
  students: Student[]
  selectedId?: string
  onSelect: (student: Student) => void
  onEdit: (student: Student) => void
  onDelete: (id: string) => void
  onNotify: (student: Student) => void
  showDetails?: boolean
  isTeacherView?: boolean
  teachers?: unknown[]
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="group relative">
    {children}
    <div className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-main px-2 py-1 text-[9px] font-bold text-inverse opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
      {label}
    </div>
  </div>
)

const gradeColors: Record<string, { bg: string; text: string; ring: string }> = {
  أول: { bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20' },
  ثاني: { bg: 'bg-success-soft', text: 'text-success', ring: 'ring-success-soft' },
  ثالث: { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info-soft' },
  رابع: { bg: 'bg-warning-soft', text: 'text-warning', ring: 'ring-warning-soft' },
  خامس: { bg: 'bg-accent-soft', text: 'text-accent', ring: 'ring-accent-soft' },
  سادس: { bg: 'bg-error-soft', text: 'text-error', ring: 'ring-error-soft' },
}

const getGradeColor = (grade?: string) => {
  if (!grade) return { bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/20' }
  const key = Object.keys(gradeColors).find((k) => grade.includes(k))
  return key ? gradeColors[key]! : { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info-soft' }
}

export const StudentTable = memo(
  ({ students, selectedId, onSelect, onEdit, onDelete, onNotify }: StudentTableProps) => {
    const columns: Column<Student>[] = useMemo(
      () => [
        {
          key: 'name',
          header: 'الطالب',
          sortable: true,
          render: (student) => {
            const hasLowBalance = (student.enrollments || []).some(
              (en) => en.sessionsTotal - en.sessionsUsed <= 2,
            )
            const gc = getGradeColor(student.grade)
            return (
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2',
                    gc.bg,
                    gc.text,
                    gc.ring,
                  )}
                >
                  {(student.name || '?').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold leading-tight text-main">
                      {student.name || '—'}
                    </p>
                    {hasLowBalance && (
                      <span className="animate-pulse rounded bg-error-soft px-1.5 py-0.5 text-[8px] font-bold text-error">
                        <AlertTriangle size={8} />
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-[9px] text-muted">
                      ID: {(student.id || '').substring(0, 6)}
                    </span>
                    {student.parentPhone && (
                      <span className="text-[9px] text-muted">{student.parentPhone}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          },
          mobileLabel: 'الطالب',
        },
        {
          key: 'grade',
          header: 'المستوى',
          sortable: true,
          align: 'center',
          render: (student) => {
            const gc = getGradeColor(student.grade)
            return (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold ring-1',
                  gc.bg,
                  gc.text,
                  gc.ring,
                )}
              >
                <GraduationCap size={10} />
                {student.grade || '—'}
              </span>
            )
          },
          mobileLabel: 'المستوى',
        },
        {
          key: 'enrollments',
          header: 'الاشتراكات',
          align: 'center',
          render: (student) => {
            const count = student.enrollments?.length || 0
            return (
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ring-1',
                  count > 0
                    ? 'bg-primary-soft text-primary ring-primary/20'
                    : 'bg-surface text-muted ring-border',
                )}
              >
                {count}
              </span>
            )
          },
          mobileLabel: 'العقود',
        },
        {
          key: 'sessions',
          header: 'الحصص',
          sortable: true,
          align: 'center',
          render: (student) => {
            const totalExpected = (student.enrollments || []).reduce(
              (acc, en) => acc + (en.sessionsTotal || 0),
              0,
            )
            const totalUsed = (student.enrollments || []).reduce(
              (acc, en) => acc + (en.sessionsUsed || 0),
              0,
            )
            const remaining = totalExpected - totalUsed
            return (
              <span className="text-xs font-bold tabular-nums text-main">
                {totalUsed} <span className="text-muted">/</span> {totalExpected}
                {remaining <= 2 && remaining > 0 && (
                  <span className="block text-[9px] text-error">{remaining} رصيد</span>
                )}
              </span>
            )
          },
          mobileLabel: 'الحصص',
        },
        {
          key: 'progress',
          header: 'التقدم',
          align: 'center',
          render: (student) => {
            const totalExpected = (student.enrollments || []).reduce(
              (acc, en) => acc + (en.sessionsTotal || 0),
              0,
            )
            const totalUsed = (student.enrollments || []).reduce(
              (acc, en) => acc + (en.sessionsUsed || 0),
              0,
            )
            const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0
            const isLow = totalExpected - totalUsed <= 2
            return (
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={progress}
                  showLabel
                  variant={isLow ? 'error' : 'primary'}
                  className="min-w-[120px]"
                />
              </div>
            )
          },
          mobileLabel: 'التقدم',
        },
        {
          key: 'xp',
          header: 'XP',
          align: 'center',
          render: (student) => {
            const pts = student.totalPoints || 0
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning">
                <Star size={10} />
                {pts > 0 ? pts.toLocaleString() : '—'}
              </span>
            )
          },
          mobileLabel: 'XP',
        },
        {
          key: 'actions',
          header: 'إجراءات',
          align: 'center',
          className: 'text-center',
          render: (student) => (
            <div className="flex items-center justify-center gap-1">
              <Tooltip label="تعديل">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(student)
                  }}
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-primary text-[10px] font-bold text-on-primary shadow-sm outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                  aria-label="تعديل"
                >
                  <Edit size={13} />
                </button>
              </Tooltip>
              <Tooltip label="إشعار">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onNotify(student)
                  }}
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-xl text-muted transition-all hover:bg-warning-soft hover:text-warning"
                  aria-label="إشعار"
                >
                  <Bell size={13} />
                </button>
              </Tooltip>
              <Tooltip label="حذف">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(student.id)
                  }}
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-xl text-muted transition-all hover:bg-error-soft hover:text-error"
                  aria-label="حذف"
                >
                  <Trash size={13} />
                </button>
              </Tooltip>
            </div>
          ),
        },
      ],
      [onEdit, onNotify, onDelete],
    )

    const mobileCard = (student: Student) => {
      const totalExpected = (student.enrollments || []).reduce(
        (acc, en) => acc + (en.sessionsTotal || 0),
        0,
      )
      const totalUsed = (student.enrollments || []).reduce(
        (acc, en) => acc + (en.sessionsUsed || 0),
        0,
      )
      const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0
      const hasLowBalance = (student.enrollments || []).some(
        (en) => en.sessionsTotal - en.sessionsUsed <= 2,
      )
      const gc = getGradeColor(student.grade)
      const pts = student.totalPoints || 0

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2',
                  gc.bg,
                  gc.text,
                  gc.ring,
                )}
              >
                {(student.name || '?').charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold leading-tight text-main">
                  {student.name || '—'}
                </h4>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ring-1',
                      gc.bg,
                      gc.text,
                      gc.ring,
                    )}
                  >
                    {student.grade || '—'}
                  </span>
                  {pts > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-warning">
                      <Star size={8} />
                      {pts}
                    </span>
                  )}
                  {hasLowBalance && <AlertTriangle size={10} className="text-error" />}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip label="تعديل">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(student)
                  }}
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-primary text-on-primary outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                  aria-label="تعديل"
                >
                  <Edit size={13} />
                </button>
              </Tooltip>
              <Tooltip label="إشعار">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onNotify(student)
                  }}
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-xl text-muted hover:bg-warning-soft hover:text-warning"
                  aria-label="إشعار"
                >
                  <Bell size={13} />
                </button>
              </Tooltip>
              <Tooltip label="حذف">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(student.id)
                  }}
                  className="flex min-h-9 min-w-9 items-center justify-center rounded-xl text-muted hover:bg-error-soft hover:text-error"
                  aria-label="حذف"
                >
                  <Trash size={13} />
                </button>
              </Tooltip>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-primary-soft p-2 text-center">
              <span className="block text-[9px] font-bold text-muted">العقود</span>
              <span className="text-xs font-bold text-primary">
                {student.enrollments?.length || 0}
              </span>
            </div>
            <div className="rounded-xl bg-success-soft p-2 text-center">
              <span className="block text-[9px] font-bold text-muted">المستخدم</span>
              <span className="text-xs font-bold text-success">{totalUsed}</span>
            </div>
            <div className="rounded-xl bg-warning-soft p-2 text-center">
              <span className="block text-[9px] font-bold text-muted">الرصيد</span>
              <span
                className={cn('text-xs font-bold', hasLowBalance ? 'text-error' : 'text-warning')}
              >
                {totalExpected - totalUsed}
              </span>
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-muted">
              <span>معدل الاستهلاك</span>
              <span className="font-bold tabular-nums">{progress}%</span>
            </div>
            <ProgressBar
              value={progress}
              variant={hasLowBalance ? 'error' : 'primary'}
              className="h-1.5"
            />
          </div>
        </div>
      )
    }

    if (students.length === 0) {
      return (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <GraduationCap size={48} className="mx-auto mb-3 text-muted opacity-20" />
          <p className="text-xs font-bold text-muted">لا توجد بيانات طلاب حالياً</p>
          <p className="mt-1 text-[10px] text-muted opacity-60">قم بإضافة طالب جديد للبدء</p>
        </div>
      )
    }

    return (
      <Table<Student>
        data={students}
        columns={columns}
        headerVariant="gradient"
        getId={(s) => s.id}
        selectedId={selectedId}
        onRowClick={onSelect}
        mobileCard={mobileCard}
      />
    )
  },
)
