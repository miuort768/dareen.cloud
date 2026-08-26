import { memo, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Edit,
  Trash2,
  GraduationCap,
  MessageCircle,
  Bell,
  Award,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react'
import type { Teacher } from '../types'
import { cn } from '../../../lib/utils'
import { CURRENCY_SYMBOL } from '../../../config/constants'

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

type SortField = 'name' | 'subject' | 'students' | 'price'
type SortDir = 'asc' | 'desc'

const subjectColorMap: Record<string, string> = {
  رياضيات: 'text-primary bg-primary-soft ring-primary-soft',
  عربي: 'text-success bg-success-soft ring-success-soft',
  'اللغة العربية': 'text-success bg-success-soft ring-success-soft',
  علوم: 'text-info bg-info-soft ring-info-soft',
  إنجليزي: 'text-warning bg-warning-soft ring-warning-soft',
  'اللغة الانجليزية': 'text-warning bg-warning-soft ring-warning-soft',
  فيزياء: 'text-accent bg-accent-soft ring-accent-soft',
  كيمياء: 'text-error bg-error-soft ring-error-soft',
  لغات: 'text-accent bg-accent-soft ring-accent-soft',
  'اللغة الفرنسية': 'text-accent bg-accent-soft ring-accent-soft',
  'اللغة الاسبانية': 'text-info bg-info-soft ring-info-soft',
  أدبي: 'text-warning bg-warning-soft ring-warning-soft',
  دراسات: 'text-success bg-success-soft ring-success-soft',
  قرآن: 'text-primary bg-primary-soft ring-primary-soft',
  قران: 'text-primary bg-primary-soft ring-primary-soft',
  شرعية: 'text-success bg-success-soft ring-success-soft',
  اجتماعيات: 'text-warning bg-warning-soft ring-warning-soft',
}

const getSubjectStyle = (subject?: string) => {
  if (!subject) return 'text-muted bg-surface ring-border'
  const key = Object.keys(subjectColorMap).find((k) => subject.includes(k) || k.includes(subject))
  return key ? subjectColorMap[key] : 'text-info bg-info-soft ring-info-soft'
}

const currencySymbolMap: Record<string, string> = {
  KWD: 'د.ك',
  SAR: 'ر.س',
  EGP: 'ج.م',
  AED: 'د.إ',
  QAR: 'ر.ق',
  OMR: 'ر.ع',
  BHD: 'د.ب',
  USD: '$',
}

const getCurrencySymbol = (currency?: string) => {
  if (!currency) return CURRENCY_SYMBOL
  return currencySymbolMap[currency.toUpperCase()] || `${currency} `
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="group relative">
    {children}
    <div className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-main px-2 py-1 text-[9px] font-bold text-inverse opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
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
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const toggleSort = (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDir('asc')
      }
    }

    const sorted = useMemo(() => {
      const list = [...teachers]
      list.sort((a, b) => {
        let cmp = 0
        switch (sortField) {
          case 'name':
            cmp = a.name.localeCompare(b.name)
            break
          case 'subject':
            cmp = a.subject.localeCompare(b.subject)
            break
          case 'students':
            cmp = (studentCounts[a.name] || 0) - (studentCounts[b.name] || 0)
            break
          case 'price':
            cmp = a.price - b.price
            break
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
      return list
    }, [teachers, sortField, sortDir, studentCounts])

    const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) return <ArrowUpDown size={10} className="opacity-30" />
      return sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
    }

    const computeStatus = (teacher: Teacher): { label: string; dot: string; text: string } => {
      const count = studentCounts[teacher.name] || 0
      if (count > 0)
        return {
          label: 'نشطة',
          dot: 'bg-success',
          text: 'text-success bg-success-soft ring-success-soft',
        }
      return { label: 'متوقفة', dot: 'bg-error', text: 'text-error bg-error-soft ring-error-soft' }
    }

    const teacherPoints = (teacher: Teacher): number => teacher.points ?? 0

    const thClass =
      'px-5 py-3 font-bold text-[10px] tracking-wider text-on-primary select-none cursor-pointer transition-colors'
    const thInnerClass = 'flex items-center gap-1'

    if (teachers.length === 0) {
      return (
        <div className="py-24 text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-muted opacity-40" />
          <p className="text-xs text-muted">لا توجد بيانات معلمات حالياً</p>
        </div>
      )
    }

    return (
      <div className="w-full" dir="rtl">
        {/* Desktop View */}
        <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 lg:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gradient-to-l from-primary to-primary-deep">
                  <th className={thClass} onClick={() => toggleSort('name')}>
                    <div className={thInnerClass}>
                      <SortIcon field="name" /> المعلمة
                    </div>
                  </th>
                  <th className={cn(thClass, 'text-center')} onClick={() => toggleSort('subject')}>
                    <div className={cn(thInnerClass, 'justify-center')}>
                      <SortIcon field="subject" /> التخصص
                    </div>
                  </th>
                  <th className={cn(thClass, 'text-center')}>
                    <div className={cn(thInnerClass, 'justify-center')}>النقاط</div>
                  </th>
                  <th className={cn(thClass, 'text-center')}>
                    <div className={cn(thInnerClass, 'justify-center')}>الحالة</div>
                  </th>
                  <th className={cn(thClass, 'text-center')} onClick={() => toggleSort('students')}>
                    <div className={cn(thInnerClass, 'justify-center')}>
                      <SortIcon field="students" /> الطلاب
                    </div>
                  </th>
                  <th className={cn(thClass, 'text-center')} onClick={() => toggleSort('price')}>
                    <div className={cn(thInnerClass, 'justify-center')}>
                      <SortIcon field="price" /> التعريفة
                    </div>
                  </th>
                  <th className={cn(thClass, 'text-center')}>
                    <div className={cn(thInnerClass, 'justify-center')}>إجراءات</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((teacher) => {
                  const isSelected = selectedId === teacher.id
                  const status = computeStatus(teacher)
                  const points = teacherPoints(teacher)
                  const subjectStyle = getSubjectStyle(teacher.subject)
                  return (
                    <tr
                      key={teacher.id}
                      onClick={() => onSelect(teacher)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected ? 'bg-primary-soft' : 'hover:bg-hover',
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-base font-bold text-on-primary shadow-sm ring-2 ring-primary/20 dark:from-accent dark:to-primary-deep dark:text-on-accent">
                            {(teacher.name || '?').charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-bold leading-tight text-main">
                              {teacher.name || '—'}
                            </p>
                            <p className="mt-1.5 font-mono text-[10px] text-muted">
                              ID: {(teacher.id || '').substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold ring-1',
                            subjectStyle,
                          )}
                        >
                          {teacher.subject}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-bold',
                            points > 0 ? 'text-warning' : 'text-muted',
                          )}
                        >
                          <Award size={11} />
                          {points}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold ring-1',
                            status.text,
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-info-soft text-xs font-bold text-info ring-1 ring-info-soft">
                          {studentCounts[teacher.name] || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <span className="text-sm font-bold text-success">{teacher.price}</span>
                          <span className="text-[9px] text-muted">
                            {getCurrencySymbol(teacher.currency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip label="تعديل">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(teacher)
                              }}
                              className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded-xl bg-primary text-[10px] font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-95"
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
                              className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded-xl bg-warning-soft text-warning transition-all hover:bg-warning-light active:scale-95"
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
                              className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded-xl bg-info-soft text-info transition-all hover:bg-info-light active:scale-95"
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
                              className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded-xl bg-error-soft text-error transition-all hover:bg-error-light active:scale-95"
                              aria-label="حذف"
                            >
                              <Trash2 size={13} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="space-y-2 lg:hidden">
          {sorted.map((teacher) => {
            const isSelected = selectedId === teacher.id
            const status = computeStatus(teacher)
            const points = teacherPoints(teacher)
            const subjectStyle = getSubjectStyle(teacher.subject)
            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelect(teacher)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(teacher)
                  }
                }}
                className={cn(
                  'rounded-2xl border border-border bg-card p-3 shadow-elevation-1 transition-all active:scale-[0.98]',
                  isSelected && 'ring-1 ring-primary/30',
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-base font-bold text-on-primary ring-2 ring-primary/20 dark:from-accent dark:to-primary-deep dark:text-on-accent">
                      {(teacher.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-base font-bold leading-tight text-main">
                          {teacher.name || '—'}
                        </h4>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ring-1',
                            status.text,
                          )}
                        >
                          <span className={cn('h-1 w-1 rounded-full', status.dot)} />
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold ring-1',
                            subjectStyle,
                          )}
                        >
                          {teacher.subject}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-warning">
                          <Award size={9} />
                          {points}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ms-2 shrink-0 text-end">
                    <span className="text-base font-bold text-success">{teacher.price}</span>
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
                    className="flex h-9 items-center justify-center gap-1 rounded-xl bg-info-soft text-[10px] font-bold text-info transition-transform active:scale-95"
                    aria-label="مراسلة"
                  >
                    <MessageCircle size={12} /> مراسلة
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onNotify(teacher)
                    }}
                    className="flex h-9 items-center justify-center gap-1 rounded-xl bg-warning-soft text-[10px] font-bold text-warning transition-transform active:scale-95"
                    aria-label="إرسال إشعار"
                  >
                    <Bell size={12} /> إشعار
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(teacher)
                    }}
                    className="flex h-9 items-center justify-center gap-1 rounded-xl bg-primary-soft text-[10px] font-bold text-primary transition-transform active:scale-95"
                    aria-label="تعديل"
                  >
                    <Edit size={12} /> تعديل
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(teacher.id)
                    }}
                    className="flex h-9 items-center justify-center gap-1 rounded-xl bg-error-soft text-[10px] font-bold text-error transition-transform active:scale-95"
                    aria-label="حذف"
                  >
                    <Trash2 size={12} /> حذف
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  },
)
