import { memo } from 'react'
import { Edit, Trash2, GraduationCap, MessageCircle, Bell, Award } from 'lucide-react'
import type { Teacher } from '../types'
import { cn } from '../../../lib/utils'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { Table, EmptyState } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'

interface TeacherTableProps {
  teachers: Teacher[]
  onEdit: (teacher: Teacher) => void
  onDelete: (id: string) => void
  onSelect: (teacher: Teacher) => void
  onChat: (id: string) => void
  onNotify: (teacher: Teacher) => void
  selectedId?: string
  studentCounts: Record<string, number>
}

const subjectColorMap: Record<string, string> = {
  رياضيات: 'text-primary bg-primary-soft',
  عربي: 'text-success bg-success-soft',
  'اللغة العربية': 'text-success bg-success-soft',
  علوم: 'text-info bg-info-soft',
  إنجليزي: 'text-warning bg-warning-soft',
  'اللغة الانجليزية': 'text-warning bg-warning-soft',
  فيزياء: 'text-accent bg-accent-soft',
  كيمياء: 'text-error bg-error-soft',
  لغات: 'text-accent bg-accent-soft',
  'اللغة الفرنسية': 'text-accent bg-accent-soft',
  'اللغة الاسبانية': 'text-info bg-info-soft',
  أدبي: 'text-warning bg-warning-soft',
  دراسات: 'text-success bg-success-soft',
  قرآن: 'text-primary bg-primary-soft',
  قران: 'text-primary bg-primary-soft',
  شرعية: 'text-success bg-success-soft',
  اجتماعيات: 'text-warning bg-warning-soft',
}

const getSubjectStyle = (subject?: string) => {
  if (!subject) return 'text-muted bg-surface'
  const key = Object.keys(subjectColorMap).find((k) => subject.includes(k) || k.includes(subject))
  return key ? subjectColorMap[key] : 'text-info bg-info-soft'
}

const currencySymbolMap: Record<string, string> = {
  EGP: 'ج.م',
}

const getCurrencySymbol = (currency?: string) => {
  if (!currency) return CURRENCY_SYMBOL
  return currencySymbolMap[currency.toUpperCase()] || CURRENCY_SYMBOL
}

const computeStatus = (teacher: Teacher, studentCounts: Record<string, number>) => {
  const count = studentCounts[teacher.name] || 0
  if (count > 0)
    return {
      label: 'نشطة',
      dot: 'bg-success',
      text: 'text-success-strong bg-success-soft',
    }
  return { label: 'متوقفة', dot: 'bg-error', text: 'text-error bg-error-soft' }
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="group relative">
    {children}
    <div className="pointer-events-none absolute -top-8 start-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-main px-2 py-1 text-[9px] font-bold text-inverse opacity-0 shadow-elevation-1 transition-opacity group-hover:opacity-100">
      {label}
    </div>
  </div>
)

export const TeacherTable = memo(
  ({
    teachers,
    onEdit,
    onDelete,
    onSelect,
    onChat,
    onNotify,
    selectedId,
    studentCounts,
  }: TeacherTableProps) => {
    const columns: Column<Teacher>[] = [
      {
        key: 'name',
        header: 'المعلمة',
        sortable: true,
        mobileLabel: 'المعلمة',
        render: (teacher) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-on-primary shadow-elevation-1 dark:bg-accent dark:text-on-accent">
              {(teacher.name || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-main">
                {teacher.name || '—'}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-muted">
                ID: {(teacher.id || '').substring(0, 8)}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'subject',
        header: 'التخصص',
        sortable: true,
        align: 'center',
        mobileLabel: 'التخصص',
        render: (teacher) => (
          <span
            className={cn(
              'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold',
              getSubjectStyle(teacher.subject),
            )}
          >
            {teacher.subject}
          </span>
        ),
      },
      {
        key: 'points',
        header: 'النقاط',
        align: 'center',
        hideOnMobile: true,
        render: (teacher) => {
          const points = teacher.points ?? 0
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-bold',
                points > 0 ? 'text-warning-strong' : 'text-muted',
              )}
            >
              <Award size={11} />
              {points}
            </span>
          )
        },
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        mobileLabel: 'الحالة',
        render: (teacher) => {
          const status = computeStatus(teacher, studentCounts)
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold',
                status.text,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
              {status.label}
            </span>
          )
        },
      },
      {
        key: 'students',
        header: 'الطلاب',
        sortable: true,
        align: 'center',
        hideOnMobile: true,
        render: (teacher) => (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-info-soft text-xs font-bold text-info-strong">
            {studentCounts[teacher.name] || 0}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'التعريفة',
        sortable: true,
        align: 'center',
        mobileLabel: 'التعريفة',
        render: (teacher) => (
          <div className="inline-flex items-center gap-1">
            <span className="text-sm font-bold text-success-strong">{teacher.price}</span>
            <span className="text-[9px] text-muted">{getCurrencySymbol(teacher.currency)}</span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'إجراءات',
        align: 'center',
        hideOnMobile: true,
        render: (teacher) => (
          <div className="flex items-center justify-center gap-1">
            <Tooltip label="تعديل">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(teacher)
                }}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-primary-soft text-primary outline-none transition-all hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                aria-label="تعديل"
              >
                <Edit size={13} />
              </button>
            </Tooltip>
            <Tooltip label="إشعار">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNotify(teacher)
                }}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-warning-soft text-warning-strong outline-none transition-all hover:bg-warning-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                aria-label="إرسال إشعار"
              >
                <Bell size={13} />
              </button>
            </Tooltip>
            <Tooltip label="محادثة">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onChat(teacher.id)
                }}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-info-soft text-info-strong outline-none transition-all hover:bg-info-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                aria-label="مراسلة"
              >
                <MessageCircle size={13} />
              </button>
            </Tooltip>
            <Tooltip label="حذف">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(teacher.id)
                }}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-xl bg-error-soft text-error outline-none transition-all hover:bg-error-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                aria-label="حذف"
              >
                <Trash2 size={13} />
              </button>
            </Tooltip>
          </div>
        ),
      },
    ]

    if (teachers.length === 0) {
      return (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={GraduationCap}
            title="لا توجد بيانات معلمات حالياً"
            subtitle="ستظهر المعلمات هنا بعد إضافتها"
          />
        </div>
      )
    }

    return (
      <div className="w-full" dir="rtl">
        {/* Desktop + mobile — shared DataTable with custom mobile cards (keep action row) */}
        <Table<Teacher>
          data={teachers}
          columns={columns}
          headerVariant="surface"
          onRowClick={onSelect}
          selectedId={selectedId}
          getId={(t) => t.id}
          mobileCard={(teacher) => {
            const status = computeStatus(teacher, studentCounts)
            const subjectStyle = getSubjectStyle(teacher.subject)
            return (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-on-primary dark:bg-accent dark:text-on-accent">
                      {(teacher.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-base font-bold leading-tight text-main">
                          {teacher.name || '—'}
                        </h4>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold',
                            status.text,
                          )}
                        >
                          <span className={cn('h-1 w-1 rounded-full', status.dot)} />
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold',
                            subjectStyle,
                          )}
                        >
                          {teacher.subject}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-warning-strong">
                          <Award size={9} />
                          {teacher.points ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ms-2 shrink-0 text-end">
                    <span className="text-base font-bold text-success-strong">{teacher.price}</span>
                    <span className="mt-0.5 block text-[9px] text-muted">
                      {getCurrencySymbol(teacher.currency)} / حصة
                    </span>
                  </div>
                </div>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onChat(teacher.id)
                    }}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-info-soft text-[11px] font-bold text-info-strong outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                    aria-label="مراسلة"
                  >
                    <MessageCircle size={13} /> مراسلة
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onNotify(teacher)
                    }}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-warning-soft text-[11px] font-bold text-warning-strong outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                    aria-label="إرسال إشعار"
                  >
                    <Bell size={13} /> إشعار
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(teacher)
                    }}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-primary-soft text-[11px] font-bold text-primary outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                    aria-label="تعديل"
                  >
                    <Edit size={13} /> تعديل
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(teacher.id)
                    }}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-error-soft text-[11px] font-bold text-error outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                    aria-label="حذف"
                  >
                    <Trash2 size={13} /> حذف
                  </button>
                </div>
              </>
            )
          }}
        />
      </div>
    )
  },
)
