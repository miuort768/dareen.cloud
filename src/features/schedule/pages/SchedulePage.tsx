import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  Sparkles,
  Clock,
  BookOpen,
  Plus,
  CalendarDays,
  GraduationCap,
  Users,
  Filter,
  CheckCircle2,
  PartyPopper,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser, useLogout } from '../../../context/AppContext'
import { api } from '../../../lib/api'
import { MobileSchedule } from '../components/MobileSchedule'
import { ScheduleHeader, ScheduleGrid, SchedulePopover } from './schedule-page'
import { TeacherDashboardHeader } from '../../../pages/TeacherDashboardHeader'
import { StudentDashboardHeader } from '../../../pages/student-dashboard/StudentDashboardHeader'
import { cn } from '../../../lib/utils'
import { to24Minutes, normalizeDayName } from '../../attendance/utils/slotUtils'

interface Student {
  id: string
  name: string
  grade: string
  parentPhone: string
  enrollments: Enrollment[]
  totalPoints?: number
}
interface Enrollment {
  teacher: string | { id?: string | number; name?: string }
  subject: string
  curr: string
  sessionsTotal: number
  sessionsUsed: number
  schedule: ScheduleSlot[]
  teacherId?: string | number
}
interface ScheduleSlot {
  day: string
  hour: string
  period: string
}
interface ScheduleEvent {
  id: string
  studentId: string
  studentName: string
  studentGrade: string
  teacherName: string
  subject: string
  curriculum: string
  day: string
  hour: string
  period: string
  time: string
  studentPoints?: number
}

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const teacherNameOf = (enrollment: Enrollment): string => {
  const t: unknown = enrollment.teacher
  if (typeof t === 'string') return t.trim()
  if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
    return String((t as { name?: unknown }).name ?? '').trim()
  }
  return ''
}

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

export const Schedule = () => {
  useEffect(() => {
    document.title = 'الجدول الدراسي | دارين السابعة للتعليم والتدريب'
  }, [])
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fabOpen, setFabOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const todayDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
  const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim()
  const isTeacher = currentUser?.role === 'teacher'
  const isStudent = currentUser?.role === 'student'
  const isAdmin = !isTeacher && !isStudent
  const logout = useLogout()

  // Completed sessions (daily reset via same API as Appointments)
  const { data: completedSessionIds = [] } = useQuery({
    queryKey: ['completed-sessions'],
    queryFn: async () => {
      const sessions = await api.get('/appointments/completed-sessions')
      return (sessions || []) as string[]
    },
    refetchInterval: 15000,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post('/appointments/completed-sessions', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['completed-sessions'] }),
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      if (isStudent) {
        const me = await api.get<Record<string, unknown>>('/student-portal/me')
        setStudents([me] as unknown as Student[])
      } else {
        const data = await api.get<Record<string, unknown>[]>('/students')
        setStudents(Array.isArray(data) ? data : data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setLoading(false)
    }
  }, [isStudent])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const weekLabel = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    const dayOfWeek = now.getDay()
    const diffToSat = dayOfWeek === 6 ? 0 : -(dayOfWeek + 1)
    start.setDate(now.getDate() + diffToSat + currentWeekOffset * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const options = { weekday: 'long', day: 'numeric', month: 'short' } as const
    return `${start.toLocaleDateString('ar-EG', options)} — ${end.toLocaleDateString('ar-EG', options)}`
  }, [currentWeekOffset])

  const allEvents: ScheduleEvent[] = useMemo(() => {
    return students.flatMap((student) =>
      (student.enrollments || [])
        .filter(
          (enrollment) =>
            !isTeacher ||
            teacherNameOf(enrollment) === teacherToMatch ||
            enrollment.teacherId === currentUser.id,
        )
        .flatMap((enrollment) =>
          (enrollment.schedule || []).map((slot) => {
            const normalizedPeriod = (slot.period || '').trim().toLowerCase()
            const isAM =
              ['am', 'صباحاً', 'صباحا', 'ص', 'am.', 'a.m', 'a.m.'].includes(normalizedPeriod) ||
              normalizedPeriod.startsWith('صباح')
            const sId = student.id
            const tName = teacherNameOf(enrollment)
            return {
              id: `${sId}-${tName}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
              studentId: sId,
              studentName: student.name,
              studentGrade: student.grade,
              teacherName: tName,
              subject: enrollment.subject,
              curriculum: enrollment.curr,
              day: normalizeDayName(slot.day),
              hour: String(parseInt(String(slot.hour).trim(), 10) || ''),
              period: isAM ? 'am' : 'pm',
              time: `${String(parseInt(String(slot.hour).trim(), 10) || '')}:00 ${isAM ? 'ص' : 'م'}`,
              studentPoints: student.totalPoints || 0,
            }
          }),
        ),
    )
  }, [students, isTeacher, teacherToMatch, currentUser?.id])

  const uniqueTeachers = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.teacherName))).sort(),
    [allEvents],
  )
  const uniqueSubjects = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.subject))).sort(),
    [allEvents],
  )

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        event.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDay = filterDay === 'all' || event.day === filterDay
      const matchesTeacher = filterTeacher === 'all' || event.teacherName === filterTeacher
      const matchesSubject = filterSubject === 'all' || event.subject === filterSubject
      return matchesSearch && matchesDay && matchesTeacher && matchesSubject
    })
  }, [allEvents, searchTerm, filterDay, filterTeacher, filterSubject])

  const weekStats = useMemo(
    () => ({
      sessions: filteredEvents.length,
      teachers: new Set(filteredEvents.map((e) => e.teacherName)).size,
      students: new Set(filteredEvents.map((e) => e.studentId)).size,
    }),
    [filteredEvents],
  )

  const nextSession = useMemo(() => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
    const todayEvents = filteredEvents
      .filter((e) => e.day === today)
      .filter((e) => to24Minutes(e.hour, e.period) >= currentMinutes)
      .sort((a, b) => to24Minutes(a.hour, a.period) - to24Minutes(b.hour, b.period))
    if (todayEvents.length > 0) return todayEvents[0]
    const todayIdx = DAYS.indexOf(today)
    for (let i = 1; i <= 7; i++) {
      const nextDay = DAYS[(todayIdx + i) % 7]
      const nextEvents = filteredEvents
        .filter((e) => e.day === nextDay)
        .sort((a, b) => to24Minutes(a.hour, a.period) - to24Minutes(b.hour, b.period))
      if (nextEvents.length > 0) return nextEvents[0]
    }
    return null
  }, [filteredEvents])

  // Today's session queue (teacher only)
  const todayQueue = useMemo(() => {
    if (!isTeacher) return []
    return filteredEvents
      .filter((e) => e.day === todayDayName)
      .sort((a, b) => to24Minutes(a.hour, a.period) - to24Minutes(b.hour, b.period))
  }, [filteredEvents, isTeacher, todayDayName])

  const remainingQueue = useMemo(() => {
    return todayQueue.filter((e) => !completedSessionIds.includes(e.id))
  }, [todayQueue, completedSessionIds])

  const currentSession = remainingQueue[0] || null
  const queueDone = todayQueue.length > 0 && remainingQueue.length === 0
  const queueProgress =
    todayQueue.length > 0
      ? ((todayQueue.length - remainingQueue.length) / todayQueue.length) * 100
      : 0

  const handlePrint = () => {
    window.print()
  }

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event)
    setShowDetails(true)
  }

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي الحصص',
        value: weekStats.sessions,
        icon: BookOpen,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'المعلمات',
        value: weekStats.teachers,
        icon: GraduationCap,
        gradient: 'from-success-soft to-background dark:from-success-soft dark:to-card',
        iconBg: 'bg-white/50 text-success dark:bg-white/10',
        accent: 'bg-success',
      },
      {
        label: 'الطلاب',
        value: weekStats.students,
        icon: Users,
        gradient: 'from-warning-soft to-background dark:from-warning-soft dark:to-card',
        iconBg: 'bg-white/50 text-warning dark:bg-white/10',
        accent: 'bg-warning',
      },
      {
        label: 'الأيام',
        value: DAYS.length,
        icon: CalendarDays,
        gradient: 'from-info-soft to-background dark:from-info-soft dark:to-card',
        iconBg: 'bg-white/50 text-info dark:bg-white/10',
        accent: 'bg-info',
      },
    ],
    [weekStats],
  )

  const fabActions = useMemo(
    () => [
      { icon: CalendarDays, label: 'اليوم', onClick: () => setFilterDay(todayDayName) },
      { icon: Filter, label: 'كل الأيام', onClick: () => setFilterDay('all') },
    ],
    [todayDayName],
  )

  if (loading)
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-xs font-bold text-muted">جاري تحميل الجدول...</p>
      </div>
    )

  return (
    <div className="relative min-h-full pb-24" dir="rtl">
      {isTeacher && (
        <div className="hidden md:block">
          <TeacherDashboardHeader logout={logout} />
        </div>
      )}
      {isStudent && (
        <div className="hidden md:block">
          <StudentDashboardHeader logout={logout} />
        </div>
      )}
      <div className="mx-auto hidden max-w-page px-2 md:block">
        <div className="relative overflow-hidden rounded-2xl">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="pointer-events-none absolute z-10 rounded-full bg-white/10"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
          <ScheduleHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterDay={filterDay}
            onDayChange={setFilterDay}
            filterTeacher={filterTeacher}
            onTeacherChange={setFilterTeacher}
            filterSubject={filterSubject}
            onSubjectChange={setFilterSubject}
            uniqueTeachers={uniqueTeachers}
            uniqueSubjects={uniqueSubjects}
            todayDayName={todayDayName}
            weekLabel={weekLabel}
            onWeekChange={(d) => setCurrentWeekOffset((v) => v + d)}
            onPrint={handlePrint}
            stats={weekStats}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'border-border relative overflow-hidden rounded-xl border bg-gradient-to-br p-4',
                    kpi.gradient,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                    <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Session Queue (Teacher ONLY — hidden for admin) */}
        {isTeacher && todayQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <AnimatePresence mode="wait">
              {queueDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border-success-soft relative overflow-hidden rounded-2xl border bg-gradient-to-br from-success-soft via-background to-background p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                    className="bg-success-soft mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                  >
                    <PartyPopper size={28} className="text-success" />
                  </motion.div>
                  <h3 className="mb-1 text-lg font-bold text-main">
                    ماشاء الله! أنهيتِ كل حصص اليوم 🎉
                  </h3>
                  <p className="text-sm text-muted">أحسنتِ يا معلمة — استمري في التميّز</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-success">
                    <CheckCircle2 size={14} />
                    <span>{todayQueue.length} حصص مكتملة</span>
                  </div>
                </motion.div>
              ) : currentSession ? (
                <motion.div
                  key={currentSession.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="border-border rounded-2xl border bg-card p-4"
                >
                  {/* Progress bar */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary-soft p-1.5 text-primary">
                        <Sparkles size={14} />
                      </div>
                      <span className="text-xs font-bold text-muted">
                        الحصة الحالية — {todayQueue.length - remainingQueue.length + 1}/
                        {todayQueue.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {remainingQueue.slice(1, 4).map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-border" />
                      ))}
                      {remainingQueue.length > 4 && (
                        <span className="text-[9px] font-bold text-muted">
                          +{remainingQueue.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${queueProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Current session card */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {currentSession.studentName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-main">
                          {currentSession.studentName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {currentSession.subject} — {currentSession.teacherName}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <Clock size={12} />
                        <span className="text-xs font-bold">{currentSession.time}</span>
                      </div>
                      <button
                        onClick={() => completeMutation.mutate(currentSession.id)}
                        disabled={completeMutation.isPending}
                        className="flex items-center gap-1.5 rounded-xl bg-success px-3 py-1.5 text-xs font-bold text-on-success transition-all hover:bg-success-hover active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} />
                        <span className="hidden sm:inline">إتمام</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Next session banner — shown for admin and student (NOT for teacher) */}
        {!isTeacher && !isAdmin && nextSession && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <div className="border-border flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Sparkles size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted">الحصة القادمة</p>
                  <p className="mt-0.5 text-xs font-bold text-main">
                    {nextSession.subject} — {nextSession.studentName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted">
                  <Clock size={10} />
                  <span className="text-[10px] font-bold">{nextSession.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <BookOpen size={10} />
                  <span className="text-[10px] font-bold">{nextSession.teacherName}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={printRef} id="printable-schedule">
          <ScheduleGrid
            filteredEvents={filteredEvents}
            uniqueTeachers={uniqueTeachers}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-info" size={24} />
          </div>
        )}
      </div>

      <div className="block md:hidden">
        <MobileSchedule />
      </div>

      <SchedulePopover
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false)
          setSelectedEvent(null)
        }}
        onViewStudent={() => navigate('/students')}
      />

      {/* FAB — square with rounded corners (not circle) */}
      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Print button (separate, always visible) */}
        <motion.button
          onClick={handlePrint}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="طباعة الجدول"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-main shadow-md transition-all hover:bg-hover"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
          </svg>
        </motion.button>

        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-schedule,
          #printable-schedule * { visibility: visible !important; }
          #printable-schedule {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 8px !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: white !important;
            z-index: 9999 !important;
          }
          #printable-schedule .no-print { display: none !important; }
          #printable-schedule [class*="overflow-x-auto"] { overflow: visible !important; }
          #printable-schedule [class*="min-w-"] { min-width: 0 !important; width: 100% !important; }
          #printable-schedule [class*="min-h-[80px]"] { min-height: 40px !important; }
          #printable-schedule { font-size: 8px !important; }
          @page { size: landscape; margin: 0.5cm; }
        }
      `}</style>
    </div>
  )
}

export default Schedule
