import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  List,
  BarChart3,
  UserCheck,
} from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { ConfirmModal } from '../shared/components/ConfirmModal'
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal'
import { SkeletonCard } from '../shared/components/ui'
import { AttendanceStats } from '../features/attendance/components/AttendanceStats'
import { AttendanceHeader } from '../features/attendance/components/AttendanceHeader'
import { AttendanceFilters } from '../features/attendance/components/AttendanceFilters'

import { TeacherStudentCard } from '../features/attendance/components/TeacherStudentCard'
import { AttendanceHistoryModal } from '../features/attendance/components/AttendanceHistoryModal'
import type { PeriodFilter } from '../features/attendance/components/AttendanceFilters'
import { RescheduleModal } from '../features/attendance/components/RescheduleModal'
import { useAttendance } from '../features/attendance/hooks/useAttendance'
import { useAttendanceLogger } from '../features/attendance/hooks/useAttendanceLogger'
import { getPeriodRange, getPeriodLabel } from '../features/attendance/utils/periodRange'
import { MobileAttendance } from '../features/attendance/components/MobileAttendance'
import type { Student, Enrollment } from '../features/attendance/types'
import {
  SectionCard,
  SectionTitle,
  BulkAttendanceButton,
  AdminTeacherGroupList,
} from './attendance-page'
import { cn } from '../lib/utils'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
  const rounded = useTransform(spring, (v) => Math.round(v))
  const displayValue = useTransform(rounded, (v) => `${v.toLocaleString('ar-EG')}${suffix}`)
  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])
  return <motion.span className="text-3xl font-bold tracking-tight">{displayValue}</motion.span>
}

export const Attendance = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الحضور والغياب | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [fabOpen, setFabOpen] = useState(false)

  const dateRange = useMemo(
    () => getPeriodRange(date, periodFilter, customStartDate, customEndDate),
    [date, periodFilter, customStartDate, customEndDate],
  )
  const periodLabel = useMemo(() => getPeriodLabel(periodFilter), [periodFilter])

  const {
    students,
    allSessions,
    loading,
    logAttendance,
    updateSchedule,
    updateEnrollmentNotes,
    requestReschedule,
    stats,
    periodStats,
    matchedEnrollments,
    uniqueTeachers,
    uniqueSubjects,
    teacherAttendanceRates,
    refresh,
    teacherStats,
  } = useAttendance(currentUser, date, dateRange)

  const { logDate, setLogDate, secureModalData, openSecureLog, closeSecureLog, handleConfirmLog } =
    useAttendanceLogger({ allSessions, logAttendance })

  const [rescheduleData, setRescheduleData] = useState<{
    student: Student
    enrollment: Enrollment
  } | null>(null)
  const [historyStudent, setHistoryStudent] = useState<{
    id: string
    name: string
    grade?: string
    subject?: string
    curriculum?: string
  } | null>(null)
  const [deletingSlot, setDeletingSlot] = useState<{
    student: Student
    enrollment: Enrollment
    slotIndex: number
  } | null>(null)

  const handleViewHistory = useCallback(
    (studentId: string, studentName: string, grade?: string, subject?: string) => {
      const foundStudent = students.find((s) => s.id === studentId)
      const enrollment = foundStudent?.enrollments?.find((e) => e.subject === subject)
      setHistoryStudent({
        id: studentId,
        name: studentName,
        grade,
        subject,
        curriculum: enrollment?.curriculum,
      })
    },
    [students],
  )

  const filteredSessions = allSessions.filter((s) => {
    const dateMatch =
      s.date === date ||
      (s.status === 'scheduled' &&
        (new Date(date).getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24) <= 1)
    if (!dateMatch) return false
    const searchMatch =
      !searchTerm ||
      (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = filterStatus === 'all' || s.status === filterStatus
    const teacherMatch = filterTeacher === 'all' || s.teacherName === filterTeacher
    const subjectMatch = filterSubject === 'all' || s.subject === filterSubject
    return searchMatch && statusMatch && teacherMatch && subjectMatch
  })

  const isTeacher = currentUser?.role === 'teacher'

  const filteredTeacherEnrollments = useMemo(
    () =>
      (matchedEnrollments || []).filter(
        (me) =>
          (me.student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (me.enrollment.subject || '').toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [matchedEnrollments, searchTerm],
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي الحضور',
        value: periodStats?.completed || stats.totalCompleted,
        icon: CheckCircle,
        color: 'text-success bg-success-soft',
        accent: 'bg-success',
      },
      {
        label: 'إجمالي الغياب',
        value: periodStats?.cancelled || stats.totalCancelled,
        icon: XCircle,
        color: 'text-error bg-error-soft',
        accent: 'bg-error',
      },
      {
        label: 'الجدول الكلي',
        value: periodStats?.scheduled || stats.todayTotal,
        icon: Clock,
        color: 'text-warning bg-warning-soft',
        accent: 'bg-warning',
      },
      {
        label: 'المعلمات',
        value: uniqueTeachers.length,
        icon: Users,
        color: 'text-primary bg-primary-soft',
        accent: 'bg-primary',
      },
    ],
    [periodStats, stats, uniqueTeachers.length],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: List,
        label: 'سجل الجلسات',
        onClick: () => {
          const first = filteredSessions[0]
          if (first)
            handleViewHistory(
              first.studentId || '',
              first.studentName || '',
              undefined,
              first.subject,
            )
        },
      },
      {
        icon: BarChart3,
        label: 'إحصائيات',
        onClick: () =>
          document.querySelector('[data-stats-section]')?.scrollIntoView({ behavior: 'smooth' }),
      },
    ],
    [filteredSessions, handleViewHistory],
  )

  return (
    <div
      className="from-success-soft/40 relative min-h-full bg-gradient-to-b via-background to-background pb-24 font-sans"
      dir="rtl"
    >
      {/* Mobile view */}
      <div className="md:hidden">
        <MobileAttendance />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-page space-y-4 px-2">
          {/* Hero — internally divided: identity | stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
          >
            <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="bg-info/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                  <UserCheck size={22} className="text-on-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-black leading-tight text-main">الحضور والغياب</h1>
                  <p className="text-xs text-muted">متابعة حضور وغياب الطلاب بشكل يومي</p>
                </div>
              </div>

              <div className="hidden h-12 w-px bg-border lg:block" />

              <div className="grid flex-1 grid-cols-3 gap-2">
                {[
                  { label: 'إجمالي الحضور', value: stats.totalCompleted, tone: 'text-success' },
                  { label: 'الغياب', value: stats.totalCancelled, tone: 'text-error' },
                  { label: 'المقررة', value: stats.todayTotal, tone: 'text-warning' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-surface px-2 py-2.5 text-center"
                  >
                    <p className={cn('text-lg font-black tabular-nums leading-none', s.tone)}>
                      {s.value.toLocaleString('ar-EG')}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            data-stats-section
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {kpiCards.map((kpi, i) => {
                const showKpi = i < 3 || (i === 3 && isTeacher)
                if (!showKpi) return null
                const Icon = kpi.icon
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.06 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={cn('flex rounded-lg p-2', kpi.color)}>
                        <Icon size={16} />
                      </div>
                      <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                    </div>
                    <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                    <p className="text-2xl font-bold text-main">
                      <AnimatedCounter value={kpi.value} />
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AttendanceHeader
              date={date}
              onDateChange={setDate}
              stats={{
                todayTotal: stats.todayTotal,
                totalCompleted: stats.totalCompleted,
              }}
              isTeacher={isTeacher}
              teacherCount={uniqueTeachers.length}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <AttendanceStats
              stats={
                periodStats
                  ? {
                      ...stats,
                      todayCompleted: periodStats.completed,
                      todayCancelled: periodStats.cancelled,
                      todayScheduled: periodStats.scheduled,
                    }
                  : stats
              }
              teacherStats={teacherStats}
              isTeacher={isTeacher}
              periodLabel={periodLabel}
              prevCompleted={periodStats?.prevCompleted}
              prevCancelled={periodStats?.prevCancelled}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isTeacher && (
              <BulkAttendanceButton
                matchedEnrollments={matchedEnrollments}
                allSessions={allSessions}
                logDate={logDate}
                logAttendance={logAttendance}
              />
            )}

            {!isTeacher && (
              <AttendanceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                filterTeacher={filterTeacher}
                onTeacherChange={setFilterTeacher}
                uniqueTeachers={uniqueTeachers}
                filterSubject={filterSubject}
                onSubjectChange={setFilterSubject}
                uniqueSubjects={uniqueSubjects}
                periodFilter={periodFilter}
                onPeriodChange={setPeriodFilter}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomStartChange={setCustomStartDate}
                onCustomEndChange={setCustomEndDate}
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {isTeacher ? (
              <SectionCard className="overflow-hidden p-0">
                <div className="flex flex-col items-center justify-between gap-4 border-b border-border px-4 py-2 md:flex-row">
                  <SectionTitle
                    icon={Activity as React.ComponentType<{ size?: number }>}
                    label="حصص الطلاب المقررة"
                  />
                  <div className="relative w-full md:w-[400px]">
                    <Search
                      size={14}
                      className="absolute start-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="text"
                      aria-label="بحث"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث باسم الطالب أو المادة..."
                      className="w-full rounded-xl border border-border bg-surface py-2 pe-4 ps-10 text-xs font-bold transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
                  ) : filteredTeacherEnrollments.length > 0 ? (
                    filteredTeacherEnrollments.map(({ student, enrollment }, idx) => (
                      <motion.div
                        key={`${student.id}-${enrollment.id || enrollment.subject || idx}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * idx }}
                      >
                        <TeacherStudentCard
                          student={student}
                          enrollment={enrollment}
                          actualSessionsUsed={enrollment.sessionsUsed}
                          onUpdateSchedule={updateSchedule}
                          onLogAttendance={(s, e) => openSecureLog(s, e)}
                          onViewHistory={(id, name, grade, subject, curriculum) =>
                            setHistoryStudent({
                              id,
                              name,
                              grade,
                              subject,
                              curriculum,
                            })
                          }
                          onDeleteSlot={(s, e, i) =>
                            setDeletingSlot({
                              student: s,
                              enrollment: e,
                              slotIndex: i,
                            })
                          }
                          onUpdateNotes={updateEnrollmentNotes}
                          onReschedule={(s, e) =>
                            setRescheduleData({
                              student: s,
                              enrollment: e,
                            })
                          }
                          logDate={logDate}
                          onDateChange={setLogDate}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-16 text-center">
                      <Users className="mx-auto mb-2 text-muted" size={32} strokeWidth={1.5} />
                      <p className="text-xs font-bold text-muted">لا يوجد طلاب متاحون</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            ) : loading && teacherAttendanceRates.length === 0 ? (
              <div className="grid grid-cols-1 gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <AdminTeacherGroupList
                teacherAttendanceRates={teacherAttendanceRates}
                filterTeacher={filterTeacher}
                filterSubject={filterSubject}
                onViewHistory={handleViewHistory}
              />
            )}
          </motion.div>

          <SecureAttendanceModal
            isOpen={!!secureModalData}
            onClose={closeSecureLog}
            onConfirm={handleConfirmLog}
            studentName={secureModalData?.student.name || ''}
            date={logDate}
          />
          <ConfirmModal
            isOpen={!!deletingSlot}
            title="حذف موعد الحصة"
            message="هل أنت متأكد من حذف هذا الموعد؟ لا يمكن الرجوع عن هذا الإجراء"
            onConfirm={() => {
              if (deletingSlot) {
                const { student, enrollment, slotIndex } = deletingSlot
                const newSch = enrollment.schedule.filter((_, idx) => idx !== slotIndex)
                const enrollIdx = student.enrollments.findIndex(
                  (e) => e.id === enrollment.id && e.subject === enrollment.subject,
                )
                if (enrollIdx >= 0) updateSchedule(student, enrollIdx, newSch)
                setDeletingSlot(null)
              }
            }}
            onClose={() => setDeletingSlot(null)}
          />
          <AttendanceHistoryModal
            isOpen={!!historyStudent}
            onClose={() => setHistoryStudent(null)}
            studentId={historyStudent?.id || ''}
            studentName={historyStudent?.name || ''}
            teacherName={currentUser?.teacherName || currentUser?.name || ''}
            studentGrade={historyStudent?.grade}
            studentSubject={historyStudent?.subject}
            studentCurriculum={historyStudent?.curriculum}
            onSessionChange={refresh}
            canDelete={currentUser?.role !== 'teacher'}
          />
          {rescheduleData && (
            <RescheduleModal
              isOpen={!!rescheduleData}
              onClose={() => setRescheduleData(null)}
              studentName={rescheduleData.student.name}
              subject={rescheduleData.enrollment.subject}
              onConfirm={(data) => {
                requestReschedule(
                  rescheduleData.student.id,
                  rescheduleData.student.name,
                  rescheduleData.enrollment.subject,
                  data,
                )
                setRescheduleData(null)
              }}
            />
          )}
        </div>

        {/* FAB */}
        {!isTeacher && (
          <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
              {fabOpen &&
                fabActions.map((action, i) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.3, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, y: 20 }}
                    transition={{
                      delay: 0.05 * (fabActions.length - 1 - i),
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                      {action.label}
                    </span>
                    <button
                      onClick={() => {
                        action.onClick()
                        setFabOpen(false)
                      }}
                      aria-label={action.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <action.icon size={18} />
                    </button>
                  </motion.div>
                ))}
            </AnimatePresence>
            <motion.button
              onClick={() => setFabOpen(!fabOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={fabOpen ? 'إغلاق الإجراءات السريعة' : 'إجراءات سريعة'}
              aria-expanded={fabOpen}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                fabOpen ? 'rotate-45 bg-error text-on-error' : 'bg-primary text-on-primary',
              )}
            >
              <Plus size={24} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
