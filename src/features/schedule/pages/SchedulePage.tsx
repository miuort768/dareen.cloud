import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Loader2,
  Sparkles,
  Clock,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Users,
  CheckCircle2,
  PartyPopper,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '../../../context/AppContext'
import { api } from '../../../lib/api'
import { MobileSchedule } from '../components/MobileSchedule'
import { ScheduleHeader, ScheduleGrid, SchedulePopover } from './schedule-page'
import { cn } from '../../../lib/utils'
import { to24Minutes, normalizeDayName } from '../../attendance/utils/slotUtils'
import { useCompletedSessions } from '../../appointments/hooks/useAppointments'

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
  if (typeof t === 'string' && t.trim()) return t.trim()
  if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
    const n = String((t as { name?: unknown }).name ?? '').trim()
    if (n) return n
  }
  const fallback = (enrollment as unknown as { teacherName?: unknown }).teacherName
  if (typeof fallback === 'string' && fallback.trim()) return fallback.trim()
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
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const todayDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
  const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim()
  const isTeacher = currentUser?.role === 'teacher'
  const isStudent = currentUser?.role === 'student'
  const isAdmin = currentUser?.role === 'admin'

  // Completed sessions — مصدر موحد مشترك مع صفحة المواعيد (نفس الكاش ونفس منطق التصفير)
  const { completedSessionIds, completeMutation } = useCompletedSessions()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      if (isStudent) {
        const me = await api.get<Record<string, unknown>>('/student-portal/me')
        setStudents([me] as unknown as Student[])
      } else if (currentUser?.role === 'parent') {
        const children = await api.get<Record<string, unknown>[]>('/parents/my-children')
        setStudents((Array.isArray(children) ? children : []) as unknown as Student[])
      } else {
        const data = await api.get<Record<string, unknown>[]>('/students')
        setStudents(
          Array.isArray(data)
            ? (data as unknown as Student[])
            : (((data as { data?: Record<string, unknown>[] }).data || []) as unknown as Student[]),
        )
      }
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setLoading(false)
    }
  }, [isStudent, currentUser])

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
    const teacherToMatchLower = teacherToMatch.toLowerCase()
    return students.flatMap((student) =>
      (student.enrollments || [])
        .filter(
          (enrollment) =>
            !isTeacher ||
            teacherNameOf(enrollment).toLowerCase() === teacherToMatchLower ||
            String(enrollment.teacherId ?? '') === String(currentUser?.id ?? ''),
        )
        .flatMap((enrollment) =>
          (enrollment.schedule || []).map((slot) => {
            const normalizedPeriod = (slot.period || '').trim().toLowerCase()
            const isAM =
              ['am', 'صباحاً', 'صباحا', 'ص', 'am.', 'a.m', 'a.m.'].includes(normalizedPeriod) ||
              normalizedPeriod.startsWith('صباح')
            const sId = student.id
            const tName = teacherNameOf(enrollment)
            const hourMatch = /(\d{1,2})/.exec(String(slot.hour ?? ''))
            const hourNum = hourMatch?.[1] ?? ''
            return {
              id: `${sId}-${tName}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
              studentId: sId,
              studentName: student.name,
              studentGrade: student.grade,
              teacherName: tName,
              subject: enrollment.subject,
              curriculum: enrollment.curr,
              day: normalizeDayName(slot.day),
              hour: hourNum,
              period: isAM ? 'am' : 'pm',
              time: `${hourNum}:00 ${isAM ? 'ص' : 'م'}`,
              studentPoints: student.totalPoints || 0,
            }
          }),
        ),
    )
  }, [students, isTeacher, teacherToMatch, currentUser?.id])

  const uniqueTeachers = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.teacherName).filter(Boolean))).sort(),
    [allEvents],
  )
  const uniqueSubjects = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.subject))).sort(),
    [allEvents],
  )

  // Real teacher names from the Teachers page — used for the admin filter dropdown
  const { data: teachersList = [] } = useQuery({
    queryKey: ['schedule-teachers-list'],
    queryFn: async () => {
      const data = await api.get<unknown>('/teachers')
      const arr = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data || []
      return arr
        .map((t: unknown) => {
          const tt = t as { name?: unknown; teacherName?: unknown }
          const n =
            typeof tt.name === 'string'
              ? tt.name.trim()
              : typeof tt.teacherName === 'string'
                ? tt.teacherName.trim()
                : ''
          return n
        })
        .filter(Boolean)
        .sort()
    },
    enabled: isAdmin,
  })

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
        iconBg: 'bg-primary/10 text-primary',
      },
      {
        label: 'المعلمات',
        value: weekStats.teachers,
        icon: GraduationCap,
        iconBg: 'bg-success-soft text-success',
      },
      {
        label: 'الطلاب',
        value: weekStats.students,
        icon: Users,
        iconBg: 'bg-warning-soft text-warning',
      },
      {
        label: 'الأيام',
        value: DAYS.length,
        icon: CalendarDays,
        iconBg: 'bg-info-soft text-info',
      },
    ],
    [weekStats],
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
            uniqueTeachers={teachersList.length > 0 ? teachersList : uniqueTeachers}
            uniqueSubjects={uniqueSubjects}
            showTeacherSubjectFilters={isAdmin}
            todayDayName={todayDayName}
            weekLabel={weekLabel}
            onWeekChange={(d) => setCurrentWeekOffset((v) => v + d)}
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
                  className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
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
                  className="relative overflow-hidden rounded-2xl border border-success-soft bg-success-soft p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                    className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft"
                  >
                    <PartyPopper size={28} className="text-success" />
                  </motion.div>
                  <h3 className="mb-1 text-lg font-bold text-main">
                    ماشاء الله! أنهيتِ كل حصص اليوم
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
                  className="rounded-2xl border border-border bg-card p-4"
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

        {/* Next session banner — shown for students & parents */}
        {!isTeacher && !isAdmin && nextSession && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
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

        <div>
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

      {isMobile && <MobileSchedule />}

      <SchedulePopover
        event={selectedEvent}
        onClose={() => {
          setShowDetails(false)
          setSelectedEvent(null)
        }}
      />
    </div>
  )
}

export default Schedule
