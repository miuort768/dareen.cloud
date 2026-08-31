import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Users,
  History,
  Activity,
  CheckCircle2,
  Loader2,
  Sparkles,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  X,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useCurrentUser, useShowNotification } from '../../../context/AppContext'
import { useAttendance } from '../hooks/useAttendance'
import { useAttendanceLogger } from '../hooks/useAttendanceLogger'
import { getPeriodRange, getPeriodLabel } from '../utils/periodRange'
import { MobilePage, usePullToRefresh } from '../../../shared/components/mobile'
import { SkeletonCard } from '../../../shared/components/ui'
import { triggerHaptic } from '../../../lib/haptics'
import { confirm } from '../../../lib/confirmDialog'
import type { PeriodFilter } from './AttendanceFilters'
import type { Student } from '../types'
import { SecureAttendanceModal } from '../../../shared/components/SecureAttendanceModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { AttendanceHistoryModal } from './AttendanceHistoryModal'
import { RescheduleModal } from './RescheduleModal'
import { normalizeDayName } from '../utils/slotUtils'
import {
  AttendanceHeroCard,
  StudentAttendanceCard,
  AttendanceHistoryView,
  AdminAttendanceView,
} from './mobile-attendance'

/** واجهة الهاتف الكاملة لصفحة الحضور — تصميم جديد: Hero بحلقة نسبة + تبويبات لاصقة + سجل مجمّع */
export const MobileAttendance = () => {
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()

  const [activeSection, setActiveSection] = useState<'record' | 'history'>('record')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today')

  const dateRange = useMemo(() => getPeriodRange(date, periodFilter), [date, periodFilter])
  const periodLabel = useMemo(() => getPeriodLabel(periodFilter), [periodFilter])

  const {
    students,
    allSessions,
    loading,
    logAttendance,
    updateSchedule,
    requestReschedule,
    matchedEnrollments,
    uniqueTeachers,
    uniqueSubjects,
    teacherAttendanceRates,
    refresh,
  } = useAttendance(currentUser, date, dateRange)

  const { logDate, setLogDate, secureModalData, openSecureLog, closeSecureLog, handleConfirmLog } =
    useAttendanceLogger({ allSessions, logAttendance })

  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh: refresh })

  const isTeacher = currentUser?.role === 'teacher'

  // إحصائيات اليوم المحدد لبطاقة البطل
  const todayStats = useMemo(() => {
    const daySessions = allSessions.filter((s) => s.date === date)
    return {
      completed: daySessions.filter((s) => s.status === 'completed').length,
      cancelled: daySessions.filter((s) => s.status === 'cancelled').length,
      scheduled: daySessions.filter((s) => s.status !== 'cancelled' && s.status !== 'completed')
        .length,
    }
  }, [allSessions, date])

  const filteredSessions = useMemo(
    () =>
      allSessions.filter((s) => {
        const inRange = s.date >= dateRange.start && s.date <= dateRange.end
        if (!inRange) return false
        const searchMatch =
          !searchTerm ||
          (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
        const teacherMatch = filterTeacher === 'all' || s.teacherName === filterTeacher
        const subjectMatch = filterSubject === 'all' || s.subject === filterSubject
        return searchMatch && teacherMatch && subjectMatch
      }),
    [allSessions, dateRange, searchTerm, filterTeacher, filterSubject],
  )

  const filteredStudents = useMemo(
    () =>
      (matchedEnrollments || []).filter(
        (me) =>
          (me.student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (me.enrollment.subject || '').toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [matchedEnrollments, searchTerm],
  )

  // عدد الطلاب المقرر لهم حصة في تاريخ التسجيل ولم يسجلوا بعد (لزر التسجيل الجماعي)
  const pendingTodayCount = useMemo(() => {
    if (!isTeacher) return 0
    const selectedDayName = new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' })
    return (matchedEnrollments || []).filter(({ student, enrollment }) => {
      const isScheduledToday = enrollment.schedule?.some(
        (slot) => normalizeDayName(slot.day) === selectedDayName,
      )
      const alreadyLogged = allSessions.some(
        (s) => s.studentId === student.id && s.subject === enrollment.subject && s.date === logDate,
      )
      return isScheduledToday && !alreadyLogged
    }).length
  }, [isTeacher, matchedEnrollments, allSessions, logDate])

  const [historyStudent, setHistoryStudent] = useState<{
    id: string
    name: string
    grade?: string
    subject?: string
    curriculum?: string
  } | null>(null)

  const [deletingSlot, setDeletingSlot] = useState<{
    student: Student
    subject: string
    slotIndex: number
  } | null>(null)

  const [rescheduleTarget, setRescheduleTarget] = useState<{
    student: Student
    subject: string
  } | null>(null)

  const handleViewHistory = (
    studentId: string,
    studentName: string,
    grade?: string,
    subject?: string,
  ) => {
    const foundStudent = students.find((s) => s.id === studentId)
    const enrollment = foundStudent?.enrollments?.find((e) => e.subject === subject)
    setHistoryStudent({
      id: studentId,
      name: studentName,
      grade,
      subject,
      curriculum: (enrollment as { curriculum?: string } | undefined)?.curriculum,
    })
  }

  const handleBulkAttendance = async () => {
    if (!(await confirm(`سيتم تسجيل (${pendingTodayCount}) طالب كحضور تلقائي`))) return
    triggerHaptic('medium')
    const selectedDayName = new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' })
    const todayStudents = (matchedEnrollments || []).filter(({ student, enrollment }) => {
      const isScheduledToday = enrollment.schedule?.some(
        (slot) => normalizeDayName(slot.day) === selectedDayName,
      )
      const alreadyLogged = allSessions.some(
        (s) => s.studentId === student.id && s.subject === enrollment.subject && s.date === logDate,
      )
      return isScheduledToday && !alreadyLogged
    })
    if (todayStudents.length === 0) {
      showNotification('لا يوجد طلاب متاحون للتسجيل', 'info')
      return
    }
    const now = new Date()
    const currentTime = now.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    let successCount = 0
    let failedCount = 0
    for (const { student, enrollment } of todayStudents) {
      const teacherRaw = enrollment.teacher
      const result = await logAttendance({
        studentId: student.id,
        studentName: student.name,
        teacherName: typeof teacherRaw === 'string' ? teacherRaw : (teacherRaw?.name ?? ''),
        teacherId: enrollment.teacherId,
        subject: enrollment.subject,
        date: logDate,
        time: currentTime,
        status: 'completed',
        day: selectedDayName,
        price: enrollment.price ? enrollment.price - (enrollment.discount || 0) : undefined,
      })
      if (result?.success) successCount++
      else failedCount++
    }
    if (failedCount > 0) {
      showNotification(
        `تم تسجيل ${successCount} طالب — فشل ${failedCount}، أعد المحاولة لهم`,
        'warning',
      )
    } else {
      showNotification(`تم تسجيل ${successCount} طالب بنجاح`, 'success')
    }
  }

  const tabs = [
    {
      id: 'record' as const,
      label: isTeacher ? 'التحضير' : 'المتابعة',
      icon: isTeacher ? ClipboardCheck : Activity,
    },
    { id: 'history' as const, label: 'السجل', icon: History },
  ]

  return (
    <MobilePage>
      <div {...handlers}>
        {/* السحب للتحديث */}
        <motion.div
          style={{ height: pullDistance }}
          animate={{ height: isRefreshing ? 50 : pullDistance }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="flex w-full items-center justify-center overflow-hidden"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium text-primary">
            {isRefreshing ? (
              <>
                <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                <span>جاري التحديث...</span>
              </>
            ) : pullDistance > 55 ? (
              <>
                <Sparkles size={16} className="animate-pulse" strokeWidth={1.5} />
                <span>أفلت للتحديث</span>
              </>
            ) : (
              <span className="text-muted">اسحب للتحديث</span>
            )}
          </div>
        </motion.div>

        {/* بطاقة البطل — حلقة النسبة والعدادات */}
        <AttendanceHeroCard
          completedToday={todayStats.completed}
          cancelledToday={todayStats.cancelled}
          scheduledToday={todayStats.scheduled}
          date={date}
          onDateChange={!isTeacher ? setDate : undefined}
        />

        {/* التبويبات اللاصقة */}
        <div className="bg-background/95 sticky top-0 z-30 px-4 pb-2 pt-3 backdrop-blur-sm">
          <div className="flex gap-1 rounded-none border border-border bg-card p-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light')
                  setActiveSection(tab.id)
                }}
                whileTap={{ scale: 0.96 }}
                aria-current={activeSection === tab.id ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 items-center justify-center gap-1.5 rounded-none px-2 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  activeSection === tab.id
                    ? 'bg-primary font-bold text-on-primary shadow-elevation-1'
                    : 'font-bold text-muted hover:text-main',
                )}
              >
                <tab.icon size={14} strokeWidth={1.7} />
                <span className="text-xs">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-3 px-4 pt-1">
          <AnimatePresence mode="wait">
            {activeSection === 'record' && (
              <motion.div
                key="record"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-3"
              >
                {/* البحث */}
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      aria-label="مسح البحث"
                      className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-surface p-1.5 text-muted transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <X size={11} strokeWidth={2} />
                    </button>
                  )}
                  <input
                    type="search"
                    aria-label="بحث عن طالب أو مادة"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الطالب أو المادة..."
                    className="w-full rounded-none border border-border bg-card py-3 pe-10 ps-9 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary"
                  />
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : (
                  <>
                    {/* زر التسجيل الجماعي للمعلم */}
                    {isTeacher && pendingTodayCount > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => handleBulkAttendance()}
                        whileTap={{ scale: 0.97 }}
                        className="flex w-full items-center justify-center gap-2 rounded-none bg-success py-3.5 text-xs font-bold text-on-success shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <CheckCircle2 size={15} strokeWidth={1.7} />
                        تسجيل حضور اليوم ({pendingTodayCount})
                      </motion.button>
                    )}

                    {/* فلاتر الأدمن */}
                    {!isTeacher && (
                      <div className="flex gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-none border border-border bg-card px-2 py-1.5">
                          <GraduationCap size={13} className="shrink-0 text-primary" />
                          <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            aria-label="تصفية حسب المعلمة"
                            className="min-w-0 flex-1 cursor-pointer appearance-none truncate rounded-none bg-transparent px-1 py-0.5 text-micro font-bold text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
                          >
                            <option value="all">كل المعلمات</option>
                            {uniqueTeachers.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        {uniqueSubjects.length > 0 && (
                          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-none border border-border bg-card px-2 py-1.5">
                            <BookOpen size={13} className="shrink-0 text-primary" />
                            <select
                              value={filterSubject}
                              onChange={(e) => setFilterSubject(e.target.value)}
                              aria-label="تصفية حسب المادة"
                              className="min-w-0 flex-1 cursor-pointer appearance-none truncate rounded-none bg-transparent px-1 py-0.5 text-micro font-bold text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            >
                              <option value="all">كل المواد</option>
                              {uniqueSubjects.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* المحتوى حسب الدور */}
                    {isTeacher ? (
                      filteredStudents.length > 0 ? (
                        <div className="space-y-2.5">
                          {filteredStudents.map(({ student, enrollment }) => (
                            <StudentAttendanceCard
                              key={`${student.id}-${enrollment.id || enrollment.subject}`}
                              student={student}
                              enrollment={enrollment}
                              onAttend={() => {
                                setLogDate(date)
                                openSecureLog(student, enrollment)
                              }}
                              onHistory={() =>
                                handleViewHistory(
                                  student.id,
                                  student.name,
                                  student.grade,
                                  enrollment.subject,
                                )
                              }
                              onDeleteSlot={(i) =>
                                setDeletingSlot({
                                  student,
                                  subject: enrollment.subject,
                                  slotIndex: i,
                                })
                              }
                              onReschedule={() =>
                                setRescheduleTarget({ student, subject: enrollment.subject })
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-none border border-dashed border-border bg-card py-12 text-center">
                          <Users className="mx-auto mb-2 text-muted" size={28} strokeWidth={1.5} />
                          <p className="text-xs font-bold text-muted">
                            {searchTerm ? 'لا نتائج مطابقة للبحث' : 'لا يوجد طلاب متاحون'}
                          </p>
                        </div>
                      )
                    ) : (
                      <AdminAttendanceView
                        teacherAttendanceRates={teacherAttendanceRates}
                        filterTeacher={filterTeacher}
                        filterSubject={filterSubject}
                        onViewHistory={(id, name, grade, subject) =>
                          handleViewHistory(id, name, grade, subject)
                        }
                      />
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeSection === 'history' && (
              <div className="pt-1">
                <AttendanceHistoryView
                  periodFilter={periodFilter}
                  setPeriodFilter={setPeriodFilter}
                  filteredSessions={filteredSessions}
                  periodLabel={periodLabel}
                  onViewHistory={(id, name, subject) =>
                    handleViewHistory(id, name, undefined, subject)
                  }
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* النوافذ المنبثقة */}
        <SecureAttendanceModal
          isOpen={!!secureModalData}
          onClose={closeSecureLog}
          onConfirm={handleConfirmLog}
          studentName={secureModalData?.student.name || ''}
          date={logDate}
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
        <ConfirmModal
          isOpen={!!deletingSlot}
          title="حذف موعد الحصة"
          message="هل أنت متأكد من حذف هذا الموعد؟ لا يمكن الرجوع عن هذا الإجراء"
          onConfirm={() => {
            if (deletingSlot) {
              const { student, subject, slotIndex } = deletingSlot
              const enrollIdx = student.enrollments.findIndex((e) => e.subject === subject)
              const enrollment = enrollIdx >= 0 ? student.enrollments[enrollIdx] : undefined
              if (enrollment) {
                const newSch = enrollment.schedule.filter((_, idx) => idx !== slotIndex)
                updateSchedule(student, enrollIdx, newSch)
              }
              setDeletingSlot(null)
            }
          }}
          onClose={() => setDeletingSlot(null)}
        />
        {rescheduleTarget && (
          <RescheduleModal
            isOpen={!!rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            studentName={rescheduleTarget.student.name}
            subject={rescheduleTarget.subject}
            onConfirm={(data) => {
              requestReschedule(
                rescheduleTarget.student.id,
                rescheduleTarget.student.name,
                rescheduleTarget.subject,
                data,
              )
              setRescheduleTarget(null)
            }}
          />
        )}
      </div>
    </MobilePage>
  )
}
