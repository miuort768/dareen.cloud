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
import {
  useCurrentUser,
  useShowNotification,
  useWhatsappAutoNotify,
  useWhatsappTemplate,
  useLogout,
  useAcademyName,
} from '../context/AppContext'
import { ConfirmModal } from '../shared/components/ConfirmModal'
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal'
import { AttendanceStats } from '../features/attendance/components/AttendanceStats'
import { AttendanceHeader } from '../features/attendance/components/AttendanceHeader'
import { AttendanceFilters } from '../features/attendance/components/AttendanceFilters'
import { AttendanceLiveFeed } from '../features/attendance/components/AttendanceLiveFeed'
import { TeacherStudentCard } from '../features/attendance/components/TeacherStudentCard'
import { AttendanceHistoryModal } from '../features/attendance/components/AttendanceHistoryModal'
import type { PeriodFilter } from '../features/attendance/components/AttendanceFilters'
import { RescheduleModal } from '../features/attendance/components/RescheduleModal'
import { useAttendance } from '../features/attendance/hooks/useAttendance'
import { MobileAttendance } from '../features/attendance/components/MobileAttendance'
import type { Student, Enrollment, Session } from '../features/attendance/types'
import { generateWhatsAppLink } from '../lib/whatsapp'
import {
  SectionCard,
  SectionTitle,
  BulkAttendanceButton,
  AdminTeacherGroupList,
} from './attendance-page'
import { TeacherDashboardHeader } from './TeacherDashboardHeader'
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
  const logout = useLogout()
  const showNotification = useShowNotification()
  const whatsappAutoNotify = useWhatsappAutoNotify()
  const whatsappTemplate = useWhatsappTemplate()
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [fabOpen, setFabOpen] = useState(false)

  const dateRange = useMemo(() => {
    const d = new Date(date)
    switch (periodFilter) {
      case 'today':
        return { start: date, end: date }
      case 'week': {
        const day = d.getDay()
        const diff = day === 0 ? 6 : day - 1
        const mon = new Date(d)
        mon.setDate(d.getDate() - diff)
        const sun = new Date(d)
        sun.setDate(mon.getDate() + 6)
        return {
          start: mon.toLocaleDateString('en-CA'),
          end: sun.toLocaleDateString('en-CA'),
        }
      }
      case 'month':
        return {
          start: new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA'),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('en-CA'),
        }
      case 'custom':
        return { start: customStartDate || date, end: customEndDate || date }
      default:
        return { start: date, end: date }
    }
  }, [date, periodFilter, customStartDate, customEndDate])

  const periodLabel = useMemo(() => {
    switch (periodFilter) {
      case 'today':
        return 'اليوم'
      case 'week':
        return 'الأسبوع'
      case 'month':
        return 'الشهر'
      case 'custom':
        return 'الفترة'
      default:
        return 'اليوم'
    }
  }, [periodFilter])

  const {
    students,
    allSessions,
    updateStatus,
    logAttendance,
    updateSchedule,
    updateEnrollmentNotes,
    requestReschedule,
    stats,
    periodStats,
    matchedEnrollments,
    uniqueTeachers,
    refresh,
    teacherStats,
  } = useAttendance(currentUser, date, dateRange)

  const [rescheduleData, setRescheduleData] = useState<{
    student: Student
    enrollment: Enrollment
  } | null>(null)
  const [secureModalData, setSecureModalData] = useState<{
    student: Student
    enrollment: Enrollment
  } | null>(null)
  const [isLogging, setIsLogging] = useState(false)
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
  const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'))

  const handleConfirmLog = async (
    status: 'completed' | 'cancelled',
    topics?: string,
    homework?: string,
    needsCompensation?: boolean,
  ) => {
    if (!secureModalData || !logDate || isLogging) return false
    setIsLogging(true)
    const { student, enrollment } = secureModalData
    const alreadyLogged = allSessions.some(
      (s) => s.studentId === student.id && s.subject === enrollment.subject && s.date === logDate,
    )
    if (alreadyLogged) {
      showNotification('الحصة مسجلة بالفعل لهذا الطالب والمادة في هذا التاريخ', 'warning')
      setSecureModalData(null)
      setIsLogging(false)
      return true
    }
    const now = new Date()
    const currentTime = now.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    const calculatedPrice = enrollment.price
      ? enrollment.price - (enrollment.discount || 0)
      : undefined
    const result = await logAttendance({
      studentId: student.id,
      studentName: student.name || 'غير محدد',
      teacherName: enrollment.teacher || currentUser?.teacherName || currentUser?.name || '',
      teacherId: enrollment.teacherId,
      subject: enrollment.subject,
      date: logDate,
      time: currentTime,
      status,
      day: new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' }),
      topics,
      homework,
      needsCompensation,
      price: calculatedPrice,
    })
    if (result.success) {
      showNotification(
        `تم تسجيل ${student.name} (${status === 'completed' ? 'حضور' : 'غياب'})`,
        'success',
      )
      if (whatsappAutoNotify && status === 'completed' && student.parentPhone) {
        const waLink = generateWhatsAppLink(student.parentPhone, whatsappTemplate, {
          Student: student.name,
          Subject: enrollment.subject,
          Teacher: enrollment.teacher,
          Date: logDate,
          Price: calculatedPrice?.toString() || '0',
        })
        window.open(waLink, '_blank')
      }
      setSecureModalData(null)
      setIsLogging(false)
      return true
    } else {
      showNotification(result.error || 'فشل تسجيل الحصة', 'error')
      setIsLogging(false)
      return false
    }
  }

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

  const handleUpdateStatus = async (id: string, status: Session['status']) => {
    const success = await updateStatus(id, status)
    showNotification(
      success ? 'تم تحديث حالة الجلسة' : 'لم يتم التحديث',
      success ? 'success' : 'error',
    )
  }

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
    return searchMatch && statusMatch && teacherMatch
  })

  const isTeacher = currentUser?.role === 'teacher'

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
        icon: Plus,
        label: 'تسجيل حضور',
        onClick: () => document.querySelector<HTMLButtonElement>('[data-attendance-log]')?.click(),
      },
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
    <div className="relative min-h-full bg-background pb-24 font-sans" dir="rtl">
      {/* Mobile view */}
      <div className="md:hidden">
        <MobileAttendance />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        {currentUser?.role === 'teacher' && <TeacherDashboardHeader logout={logout} />}
        <div className="mx-auto max-w-page space-y-4 px-2">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary p-6 md:p-8"
          >
            <div className="absolute inset-0 opacity-[0.06]">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="att-hero-grid"
                    x="0"
                    y="0"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1" fill="white" />
                    <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#att-hero-grid)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                    <UserCheck className="text-white" size={20} />
                  </div>
                  <span className="text-xs font-medium text-white/70">نظام الحضور والغياب</span>
                </div>
                <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">
                  الحضور والغياب
                </h1>
                <p className="text-sm text-white/70">متابعة حضور وغياب الطلاب بشكل يومي</p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-center">
                  <p className="mb-1 text-xs text-white/60">إجمالي الحضور</p>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stats.totalCompleted} />
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <p className="mb-1 text-xs text-white/60">الغياب</p>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stats.totalCancelled} />
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <p className="mb-1 text-xs text-white/60">المقررة</p>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stats.todayTotal} />
                  </div>
                </div>
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
              <div className="space-y-4">
                <SectionCard className="overflow-hidden p-0">
                  <div className="flex flex-col items-center justify-between gap-4 border-b border-border px-4 py-2 md:flex-row">
                    <SectionTitle icon={Activity} label="حصص الطلاب المقررة" />
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
                        className="w-full rounded-xl border border-border bg-surface py-2 pe-4 ps-10 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                    {(matchedEnrollments || []).filter(
                      (me) =>
                        (me.student.name || '')
                          .toLowerCase()
                          .includes((searchTerm || '').toLowerCase()) ||
                        (me.enrollment.subject || '')
                          .toLowerCase()
                          .includes((searchTerm || '').toLowerCase()),
                    ).length > 0 ? (
                      (matchedEnrollments || [])
                        .filter(
                          (me) =>
                            (me.student.name || '')
                              .toLowerCase()
                              .includes((searchTerm || '').toLowerCase()) ||
                            (me.enrollment.subject || '')
                              .toLowerCase()
                              .includes((searchTerm || '').toLowerCase()),
                        )
                        .map(({ student, enrollment }, idx) => (
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
                              onLogAttendance={(s, e) =>
                                setSecureModalData({
                                  student: s,
                                  enrollment: e,
                                })
                              }
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
                        <Users className="mx-auto mb-2 text-primary/20" size={32} />
                        <p className="text-xs font-bold text-muted">لا يوجد طلاب متاحون</p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            ) : (
              <>
                <AdminTeacherGroupList
                  uniqueTeachers={uniqueTeachers}
                  filterTeacher={filterTeacher}
                  students={students}
                  searchTerm={searchTerm}
                  filteredSessions={filteredSessions}
                  date={date}
                  isLogging={isLogging}
                  onLogAttendance={(s, e) => {
                    setLogDate(date)
                    setSecureModalData({ student: s, enrollment: e })
                  }}
                  onViewHistory={handleViewHistory}
                  onUpdateStatus={handleUpdateStatus}
                />
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AttendanceLiveFeed sessions={filteredSessions} />
                </motion.div>
              </>
            )}
          </motion.div>

          <SecureAttendanceModal
            isOpen={!!secureModalData}
            onClose={() => setSecureModalData(null)}
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
                updateSchedule(student, student.enrollments.indexOf(enrollment), newSch)
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
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
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
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-all',
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
