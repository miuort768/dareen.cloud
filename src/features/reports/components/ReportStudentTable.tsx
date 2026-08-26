import React, { useState, useEffect } from 'react'
import { Search, Activity, Users, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface StudentProgress {
  id: string
  name: string
  grade: string
  progress?: number
  totalEnrollments?: number
  totalSessions?: number
  usedSessions?: number
}

interface ReportStudentTableProps {
  students: StudentProgress[]
  total: number
  searchTerm: string
  onSearchChange: (val: string) => void
}

const PAGE_SIZE = 10

export const ReportStudentTable = React.memo(
  ({ students, searchTerm, onSearchChange }: ReportStudentTableProps) => {
    const [page, setPage] = useState(1)
    useEffect(() => setPage(1), [searchTerm])

    const sortedStudents = [...students].sort((a, b) => (b.progress || 0) - (a.progress || 0))
    const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PAGE_SIZE))
    const pageStudents = sortedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const renderProgressBar = (prog: number) => {
      const progBg = prog >= 80 ? 'bg-success' : prog >= 50 ? 'bg-warning' : 'bg-error'
      const progText =
        prog >= 80 ? 'text-success-dark' : prog >= 50 ? 'text-warning-dark' : 'text-error-dark'
      return { progBg, progText }
    }

    return (
      <div className="overflow-hidden rounded-card border border-border bg-card">
        <div className="flex flex-col justify-between gap-3 border-b border-border bg-surface px-5 py-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl">
              <Activity size={15} className="text-chart-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-main">تقرير تقدم الطلاب</p>
              <p className="mt-0.5 text-micro font-bold text-muted">
                {sortedStudents.length} طالب • صفحة {page} من {totalPages}
              </p>
            </div>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
            <input
              type="text"
              aria-label="بحث عن طالب"
              placeholder="ابحث عن طالب أو صف..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pe-3 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus:border-chart-4"
            />
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-chart-4 text-on-primary">
                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70">#</th>
                <th className="px-5 py-3 text-start text-micro font-bold text-on-primary opacity-70">
                  اسم الطالب
                </th>
                <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                  الصف
                </th>
                <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                  الاشتراكات
                </th>
                <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                  المتوقعة
                </th>
                <th className="px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                  المستخدمة
                </th>
                <th className="w-40 px-5 py-3 text-center text-micro font-bold text-on-primary opacity-70">
                  التقدم
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {pageStudents.length > 0 ? (
                pageStudents.map((student, idx) => {
                  const prog = student.progress || 0
                  const globalIdx = (page - 1) * PAGE_SIZE + idx + 1
                  const { progBg, progText } = renderProgressBar(prog)
                  return (
                    <tr key={student.id} className="transition-colors hover:bg-hover">
                      <td className="px-5 py-3">
                        <span className="text-micro font-medium tabular-nums text-muted">
                          {String(globalIdx).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl text-micro font-semibold text-chart-4">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-main">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex rounded-lg px-2 py-0.5 text-micro font-bold text-chart-4">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs font-medium tabular-nums text-muted">
                        {student.totalEnrollments}
                      </td>
                      <td className="px-5 py-3 text-center text-xs font-medium tabular-nums text-muted">
                        {student.totalSessions}
                      </td>
                      <td className="px-5 py-3 text-center text-xs font-medium tabular-nums text-success">
                        {student.usedSessions}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 flex-1 overflow-hidden rounded-xl bg-surface">
                            <div
                              className={cn(
                                'h-full rounded-xl transition-all duration-700',
                                progBg,
                              )}
                              style={{ width: `${prog}%` }}
                            />
                          </div>
                          <span className={cn('w-9 text-end text-micro font-medium', progText)}>
                            {prog}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-hover">
                      <Users size={22} className="text-muted" />
                    </div>
                    <p className="text-xs font-bold text-muted">لا توجد نتائج</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-divider md:hidden">
          {pageStudents.length > 0 ? (
            pageStudents.map((student, idx) => {
              const prog = student.progress || 0
              const globalIdx = (page - 1) * PAGE_SIZE + idx + 1
              const { progBg, progText } = renderProgressBar(prog)
              return (
                <div key={student.id} className="flex items-center gap-3 p-4">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-chart-4">
                    {student.name.charAt(0)}
                    <span className="absolute -start-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-chart-4 text-micro font-bold text-on-primary">
                      {globalIdx}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="truncate text-xs font-bold text-main">{student.name}</p>
                      <span className={cn('me-2 shrink-0 text-micro font-bold', progText)}>
                        {prog}%
                      </span>
                    </div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded-lg px-1.5 py-0.5 text-micro font-bold text-chart-4">
                        {student.grade}
                      </span>
                      <span className="text-micro font-bold text-muted">
                        {student.usedSessions}/{student.totalSessions} حصة
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-xl bg-surface">
                      <div
                        className={cn('h-full rounded-xl', progBg)}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-hover">
                <Users size={20} className="text-muted" />
              </div>
              <p className="text-xs font-bold text-muted">لا توجد نتائج</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-surface px-5 py-3">
            <p className="text-micro font-bold text-muted">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedStudents.length)} من{' '}
              {sortedStudents.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                <button
                  key={`page-${i}`}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'h-8 w-8 rounded-xl border text-xs font-bold transition-all active:scale-95',
                    page === i + 1
                      ? 'border-chart-4 bg-chart-4 text-on-primary'
                      : 'border-border bg-card text-muted',
                  )}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 7 && <span className="px-1 text-xs font-bold text-muted">...</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  },
)
ReportStudentTable.displayName = 'ReportStudentTable'
