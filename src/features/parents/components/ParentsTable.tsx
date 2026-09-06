import { memo, useMemo, useState } from 'react'
import {
  Edit,
  Trash2,
  Users,
  Phone,
  MessageCircle,
  ArrowUpRight,
  GraduationCap,
  AlertCircle,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { canonicalPhone } from '../../../lib/phone'
import { Table, ProgressBar } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'
import type { Parent, Student } from '../../../types'

const samePhone = (a?: string | null, b?: string | null) => {
  const ca = canonicalPhone(a)
  const cb = canonicalPhone(b)
  return ca.length > 0 && ca === cb
}

const childrenOf = (parent: Parent, students: Student[]) =>
  students.filter(
    (s) => samePhone(parent.phone, s.parentPhone) || (parent.id && s.parent?.id === parent.id),
  )

interface ParentsTableProps {
  parents: Parent[]
  students: Student[]
  selectedParentId: string | null
  showDetails: boolean
  onSelectParent: (parent: Parent) => void
  onEdit: (parent: Parent) => void
  onDelete: (id: string) => void
  onViewParent?: (parent: Parent) => void
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="group relative">
    {children}
    <div className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-main px-2 py-1 text-[9px] font-bold text-inverse opacity-0 shadow-elevation-1 transition-opacity group-hover:opacity-100">
      {label}
    </div>
  </div>
)

const getStatusBadge = (children: Student[]) => {
  const hasActive = children.some((c) => (c.enrollments?.length || 0) > 0)
  const hasNoEnrollments =
    children.length === 0 || children.every((c) => (c.enrollments?.length || 0) === 0)
  if (hasActive)
    return { label: 'نشط', bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' }
  if (hasNoEnrollments && children.length > 0)
    return { label: 'غير نشط', bg: 'bg-surface', text: 'text-muted', dot: 'bg-muted' }
  return { label: 'جديد', bg: 'bg-info-soft', text: 'text-info', dot: 'bg-info' }
}

const ExpandedRowContent = ({ parent, students }: { parent: Parent; students: Student[] }) => {
  const children = childrenOf(parent, students)

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="space-y-5 border-t border-border bg-surface px-6 py-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-success-soft bg-success-soft px-3 py-2">
            <Phone size={12} className="shrink-0 text-success" />
            <span className="font-mono text-[10px] font-bold text-main" dir="ltr">
              {parent.phone}
            </span>
          </div>
          {parent.phone2 && (
            <div className="flex items-center gap-2 rounded-xl border border-info-soft bg-info-soft px-3 py-2">
              <Phone size={12} className="shrink-0 text-info" />
              <span className="font-mono text-[10px] font-bold text-main" dir="ltr">
                {parent.phone2}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-warning-soft bg-warning-soft px-3 py-2">
            <Users size={12} className="shrink-0 text-warning" />
            <span className="text-[10px] font-bold text-main">{children.length} أبناء</span>
          </div>
        </div>

        <div>
          <h5 className="mb-3 flex items-center gap-2 text-[10px] font-bold text-muted">
            <GraduationCap size={11} />
            الأبناء المسجلين
            <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {children.length}
            </span>
          </h5>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {children.length > 0 ? (
              children.map((child) => {
                const total = (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
                const used = (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
                const progress = total > 0 ? Math.round((used / total) * 100) : 0
                const hasLowBalance = (child.enrollments || []).some(
                  (en) => en.sessionsTotal - en.sessionsUsed <= 2,
                )
                return (
                  <div
                    key={child.id}
                    className="rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20"
                  >
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[9px] font-bold text-primary">
                        {(child.name || '?').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold text-main">{child.name}</p>
                        <p className="text-[9px] text-muted">{child.grade || '—'}</p>
                      </div>
                      {hasLowBalance && <AlertCircle size={10} className="shrink-0 text-error" />}
                    </div>
                    {(child.enrollments || []).length > 0 && (
                      <div className="space-y-1">
                        {(child.enrollments || []).slice(0, 2).map((en, i) => (
                          <div key={i} className="flex items-center justify-between text-[9px]">
                            <span className="text-muted">{en.subject}</span>
                            <span className="font-bold text-main">
                              {en.sessionsUsed}/{en.sessionsTotal}
                            </span>
                          </div>
                        ))}
                        {(child.enrollments || []).length > 2 && (
                          <p className="text-[9px] text-muted">
                            +{(child.enrollments || []).length - 2} مواد أخرى
                          </p>
                        )}
                      </div>
                    )}
                    {total > 0 && (
                      <div className="mt-2">
                        <ProgressBar
                          value={progress}
                          variant={hasLowBalance ? 'error' : 'primary'}
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-border py-6 text-center">
                <p className="text-xs font-bold text-muted">لا يوجد أبناء مرتبطين</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const ParentsTable = memo<ParentsTableProps>(
  ({ parents, students, onSelectParent, onEdit, onDelete, onViewParent }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const handleToggleExpand = (parent: Parent) => {
      setExpandedId(expandedId === parent.id ? null : parent.id)
      onSelectParent(parent)
    }

    const columns: Column<Parent>[] = useMemo(
      () => [
        {
          key: 'name',
          header: 'ولي الأمر',
          sortable: true,
          render: (parent) => {
            const children = childrenOf(parent, students)
            const status = getStatusBadge(children)
            const hasOverdue = children.some((c) =>
              (c.enrollments || []).some((en) => en.sessionsTotal - en.sessionsUsed <= 2),
            )
            const isExpanded = expandedId === parent.id
            return (
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2 transition-all',
                    isExpanded
                      ? 'bg-primary text-on-primary ring-primary/20'
                      : 'bg-primary-soft text-primary ring-primary/20',
                  )}
                >
                  {(parent.name || '?').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-bold leading-tight text-main">
                      {parent.name}
                    </p>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold',
                        status.bg,
                        status.text,
                      )}
                    >
                      <span className={cn('h-1 w-1 rounded-full', status.dot)} />
                      {status.label}
                    </span>
                    {hasOverdue && <AlertTriangle size={8} className="animate-pulse text-error" />}
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] text-muted">
                    ID: {(parent.id || '').substring(0, 8)}
                  </p>
                </div>
              </div>
            )
          },
          mobileLabel: 'ولي الأمر',
        },
        {
          key: 'phone',
          header: 'بيانات التواصل',
          render: (parent) => (
            <div className="flex flex-col gap-1.5">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-success-soft bg-success-soft px-2 py-1">
                <Phone size={9} className="shrink-0 text-success" />
                <span className="font-mono text-[10px] font-bold text-main" dir="ltr">
                  {parent.phone}
                </span>
              </div>
              {parent.phone2 && (
                <div className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-info-soft bg-info-soft px-2 py-1">
                  <Phone size={9} className="shrink-0 text-info" />
                  <span className="font-mono text-[10px] font-bold text-main" dir="ltr">
                    {parent.phone2}
                  </span>
                </div>
              )}
            </div>
          ),
          mobileLabel: 'التواصل',
        },
        {
          key: 'students',
          header: 'الطلاب',
          align: 'center',
          render: (parent) => {
            const children = childrenOf(parent, students)
            return (
              <div className="flex flex-col items-center gap-1">
                <div className="flex -space-x-1.5 space-x-reverse">
                  {children.slice(0, 3).map((child, i) => (
                    <div key={child.id} className="group/child relative">
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg border-2 text-[9px] font-bold transition-all',
                          i === 0
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : i === 1
                              ? 'border-success-soft bg-success-soft text-success'
                              : 'border-warning-soft bg-warning-soft text-warning',
                        )}
                      >
                        {(child.name || '?').charAt(0)}
                      </div>
                      <div className="pointer-events-none absolute -bottom-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-main px-1.5 py-0.5 text-[8px] font-bold text-inverse opacity-0 transition-opacity group-hover/child:opacity-100">
                        {child.name}
                      </div>
                    </div>
                  ))}
                  {children.length > 3 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-primary/30 bg-primary text-[9px] font-bold text-on-primary">
                      +{children.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-muted">{children.length} طلاب</span>
              </div>
            )
          },
          mobileLabel: 'الأبناء',
        },
        {
          key: 'actions',
          header: 'إجراءات',
          align: 'center',
          className: 'text-center',
          render: (parent) => (
            <div className="flex items-center justify-center gap-1">
              <Tooltip label="تعديل">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(parent)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                  aria-label="تعديل"
                >
                  <Edit size={11} />
                </button>
              </Tooltip>
              <Tooltip label="واتساب">
                <a
                  href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-success text-on-success outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                  title="واتساب"
                >
                  <MessageCircle size={11} />
                </a>
              </Tooltip>
              <Tooltip label="حذف">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(parent.id)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-error text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                  aria-label="حذف"
                >
                  <Trash2 size={11} />
                </button>
              </Tooltip>
              <Tooltip label="فتح الملف">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewParent?.(parent)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-primary outline-none transition-all hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                  aria-label="فتح الملف"
                >
                  <ArrowUpRight size={11} />
                </button>
              </Tooltip>
            </div>
          ),
        },
        {
          key: 'expand',
          header: '',
          align: 'center',
          className: 'w-10',
          render: (parent) => (
            <ChevronDown
              size={13}
              className={cn(
                'text-muted transition-transform duration-normal',
                expandedId === parent.id && 'rotate-180',
              )}
            />
          ),
        },
      ],
      [students, expandedId, onEdit, onDelete, onViewParent],
    )

    const mobileCard = (parent: Parent) => {
      const children = childrenOf(parent, students)
      const status = getStatusBadge(children)
      const isExpanded = expandedId === parent.id
      const total = children.reduce(
        (s, c) => s + (c.enrollments || []).reduce((se, en) => se + en.sessionsTotal, 0),
        0,
      )
      const used = children.reduce(
        (s, c) => s + (c.enrollments || []).reduce((se, en) => se + en.sessionsUsed, 0),
        0,
      )

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2',
                  isExpanded
                    ? 'bg-primary text-on-primary ring-primary/20'
                    : 'bg-primary-soft text-primary ring-primary/20',
                )}
              >
                {(parent.name || '?').charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="truncate text-sm font-bold leading-tight text-main">
                    {parent.name}
                  </h4>
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.dot)} />
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <Phone size={8} className="shrink-0 text-success" />
                  <span className="font-mono text-[9px] text-muted" dir="ltr">
                    {parent.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip label="تعديل">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(parent)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                >
                  <Edit size={11} />
                </button>
              </Tooltip>
              <Tooltip label="واتساب">
                <a
                  href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-success text-on-success outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                >
                  <MessageCircle size={11} />
                </a>
              </Tooltip>
              <Tooltip label="حذف">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(parent.id)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-error text-on-error outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                >
                  <Trash2 size={11} />
                </button>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5 space-x-reverse">
              {children.slice(0, 3).map((child, i) => (
                <div
                  key={child.id}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg border-2 text-[8px] font-bold',
                    i === 0
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : i === 1
                        ? 'border-success-soft bg-success-soft text-success'
                        : 'border-warning-soft bg-warning-soft text-warning',
                  )}
                >
                  {(child.name || '?').charAt(0)}
                </div>
              ))}
              {children.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-primary/30 bg-primary text-[8px] font-bold text-on-primary">
                  +{children.length - 3}
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-muted">{children.length} طلاب</span>
          </div>
          {total > 0 && (
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-muted">
                <span>معدل الاستهلاك</span>
                <span className="font-bold tabular-nums">{Math.round((used / total) * 100)}%</span>
              </div>
              <ProgressBar
                value={Math.round((used / total) * 100)}
                variant="primary"
                className="h-1.5"
              />
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-0">
        <Table<Parent>
          data={parents}
          columns={columns}
          headerVariant="gradient"
          getId={(p) => p.id}
          selectedId={expandedId ?? undefined}
          onRowClick={handleToggleExpand}
          mobileCard={mobileCard}
        />

        <AnimatePresence>
          {expandedId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ExpandedRowContent
                parent={parents.find((p) => p.id === expandedId)!}
                students={students}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
