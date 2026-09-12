import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Search,
  Loader2,
  Sparkles,
  Clock,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  X,
} from 'lucide-react'
import { useCurrentUser } from '../../../context/AppContext'
import { api } from '../../../lib/api'
import { triggerHaptic } from '../../../lib/haptics'
import {
  MobilePage,
  usePullToRefresh,
  MobileSkeleton,
  DayDropdown,
} from '../../../shared/components/mobile'
import { normalizeDayName, to24Minutes } from '../../attendance/utils/slotUtils'
import { appointmentTeacherKeyOf } from '../../appointments/types'

interface TeacherRef {
  id?: string | number
  name?: string
}
interface Student {
  id: string
  name: string
  grade: string
  enrollments: Enrollment[]
}
interface Enrollment {
  teacher: string | TeacherRef
  subject: string
  curr: string
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
}

const TEACHER_PALETTE = [
  {
    text: 'text-primary',
    soft: 'bg-primary-soft',
    bar: 'border-e-primary',
    solid: 'bg-primary text-on-primary',
  },
  {
    text: 'text-success',
    soft: 'bg-success-soft',
    bar: 'border-e-success',
    solid: 'bg-success text-on-success',
  },
  {
    text: 'text-info',
    soft: 'bg-info-soft',
    bar: 'border-e-info',
    solid: 'bg-info text-on-info',
  },
]

const teacherNameOf = (enrollment: Enrollment): string => {
  const t: unknown = enrollment.teacher
  if (typeof t === 'string') return t.trim()
  if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
    return String((t as TeacherRef).name ?? '').trim()
  }
  if (typeof enrollment.teacherFallback === 'string') return enrollment.teacherFallback.trim()
  return ''
}

export const MobileSchedule = () => {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const mountedRef = useRef(true)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
  const [selectedDay, setSelectedDay] = useState(todayName)

  const isStudent = currentUser?.role === 'student'
  const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      if (isStudent) {
        const me = await api.get<unknown>('/student-portal/me')
        if (mountedRef.current) setStudents([me] as unknown as Student[])
      } else if (currentUser?.role === 'parent') {
        const children = await api.get<unknown>('/parents/my-children')
        if (mountedRef.current) setStudents(Array.isArray(children) ? (children as Student[]) : [])
      } else {
        const raw = await api.get<unknown>('/students')
        if (mountedRef.current) {
          setStudents(
            Array.isArray(raw)
              ? (raw as Student[])
              : (raw as { data?: Student[] } | null)?.data || [],
          )
        }
      }
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [isStudent, currentUser])

  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh: fetchData })

  useEffect(() => {
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  const allEvents: ScheduleEvent[] = useMemo(() => {
    const teacherToMatchLower = teacherToMatch.toLowerCase()
    return students.flatMap((student) =>
      (student.enrollments || [])
        .filter(
          (enrollment) =>
            currentUser?.role !== 'teacher' ||
            teacherNameOf(enrollment).toLowerCase() === teacherToMatchLower ||
            String(enrollment.teacherId ?? '') === String(currentUser?.id ?? ''),
        )
        .flatMap((enrollment) =>
          (enrollment.schedule || []).map((slot) => {
            const normalizedPeriod = (slot.period || '').trim().toLowerCase()
            const isAM =
              ['am', 'صباحاً', 'صباحا', 'ص', 'am.', 'a.m', 'a.m.'].includes(normalizedPeriod) ||
              normalizedPeriod.startsWith('صباح')
            const hourMatch = /(\d{1,2})/.exec(String(slot.hour ?? ''))
            const hourNum = hourMatch?.[1] ?? ''
            return {
              id: `${student.id}-${appointmentTeacherKeyOf(enrollment)}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
              studentId: student.id,
              studentName: student.name,
              studentGrade: student.grade,
              teacherName: teacherNameOf(enrollment),
              subject: enrollment.subject,
              curriculum: enrollment.curr,
              day: normalizeDayName(slot.day),
              hour: hourNum,
              period: isAM ? 'am' : 'pm',
              time: `${hourNum}:00 ${isAM ? 'ص' : 'م'}`,
            }
          }),
        ),
    )
  }, [students, currentUser, teacherToMatch])

  const countsByDay = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of allEvents) map[e.day] = (map[e.day] || 0) + 1
    return map
  }, [allEvents])

  const uniqueTeachers = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.teacherName))).sort(),
    [allEvents],
  )

  const getTeacherStyle = (teacherName: string) => {
    const idx = uniqueTeachers.indexOf(teacherName)
    return TEACHER_PALETTE[(idx < 0 ? 0 : idx) % TEACHER_PALETTE.length]!
  }

  const dayEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return allEvents
      .filter((e) => selectedDay === 'all' || e.day === selectedDay)
      .filter(
        (e) =>
          !q ||
          e.studentName.toLowerCase().includes(q) ||
          e.teacherName.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q),
      )
      .sort((a, b) => to24Minutes(a.hour, a.period) - to24Minutes(b.hour, b.period))
  }, [allEvents, selectedDay, searchTerm])

  const nextSession = useMemo(() => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return (
      dayEvents
        .filter((e) => e.day !== todayName || to24Minutes(e.hour, e.period) >= currentMinutes)
        .filter((e) => e.day === todayName)
        .sort((a, b) => to24Minutes(a.hour, a.period) - to24Minutes(b.hour, b.period))[0] || null
    )
  }, [dayEvents, todayName])

  const openInAppointments = () => {
    triggerHaptic('light')
    navigate('/appointments')
  }

  return (
    <MobilePage>
      <div {...handlers}>
        {/* Pull-to-refresh indicator */}
        <motion.div
          initial={{ height: pullDistance }}
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

        {/* ===== HEADER ===== */}
        <div className="px-3 pt-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-4 shadow-elevation-2">
            <div className="pointer-events-none absolute -end-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -start-16 h-44 w-44 rounded-full bg-black/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-micro font-bold text-white/80">
                  <CalendarDays size={12} />
                  اليوم · {todayName}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-on-primary">
                  جدول الحصص
                </h1>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-on-primary shadow-elevation-3 backdrop-blur-sm">
                <CalendarDays size={20} />
              </div>
            </div>

            {/* Stats strip */}
            <div className="relative mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-white/20 rounded-xl bg-white/10 py-2.5 backdrop-blur-sm">
              {[
                { value: countsByDay[todayName] || 0, label: 'حصة اليوم' },
                { value: allEvents.length, label: 'هذا الأسبوع' },
                { value: uniqueTeachers.length, label: 'معلمة' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center px-1 text-center">
                  <span className="text-base font-black tabular-nums text-on-primary">
                    {s.value}
                  </span>
                  <span className="mt-0.5 text-micro font-medium text-white/90">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search
                size={14}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-white/60"
              />
              <input
                type="text"
                aria-label="بحث في الجدول"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن طالب أو معلمة أو مادة..."
                className="w-full rounded-xl border border-white/20 bg-white/15 py-2.5 pe-9 ps-9 text-xs font-bold text-on-primary shadow-elevation-1 outline-none transition-colors duration-fast placeholder:font-medium placeholder:text-white/70 focus:border-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/25"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="مسح البحث"
                  className="absolute end-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-white/70 outline-none transition-colors duration-fast hover:text-on-primary focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== DAY FILTER ===== */}
        <div className="px-3 pb-1 pt-3">
          <DayDropdown
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            todayName={todayName}
            dayCounts={countsByDay}
          />
        </div>

        {/* ===== NEXT SESSION BANNER ===== */}
        <AnimatePresence>
          {nextSession && !searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-3 mt-2"
            >
              <div className="flex flex-col gap-2 rounded-xl border border-success-soft bg-success-soft p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-success">
                    <Sparkles size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-micro font-bold text-success">الحصة القادمة</p>
                    <p className="truncate text-sm font-black text-main">
                      {nextSession.studentName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-card px-2 py-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <CalendarDays size={11} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-black text-main">
                      {nextSession.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-card px-2 py-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-info-soft text-info">
                      <Clock size={11} />
                    </span>
                    <span className="text-xs font-black tabular-nums text-main">
                      {nextSession.time}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-card px-2 py-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-success-soft text-success">
                      <GraduationCap size={11} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-black text-main">
                      {nextSession.teacherName || 'غير محددة'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== SESSIONS TIMELINE ===== */}
        <div className="px-3 pb-4 pt-3">
          {loading && students.length === 0 ? (
            <MobileSkeleton rows={6} />
          ) : dayEvents.length > 0 ? (
            <div className="space-y-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-micro font-bold text-muted">
                  {selectedDay === 'all' ? 'كل الحصص' : `حصص ${selectedDay}`}
                </span>
                <span className="rounded-lg bg-surface px-2 py-0.5 text-micro font-bold tabular-nums text-muted">
                  {dayEvents.length}
                </span>
              </div>
              {dayEvents.map((event, idx) => {
                const ts = getTeacherStyle(event.teacherName)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.25 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openInAppointments}
                    className={`cursor-pointer overflow-hidden rounded-none border border-e-[3px] border-border bg-card transition-colors duration-fast hover:border-border ${ts.bar}`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {/* Time gutter */}
                      <div className="w-11 shrink-0 text-center">
                        <p className="text-sm font-black tabular-nums leading-none text-main">
                          {event.time.split(':')[0]}
                        </p>
                        <p className="mt-1 text-micro font-bold text-muted">
                          {event.time.includes('ص') ? 'صباحاً' : 'مساءً'}
                        </p>
                      </div>

                      {/* Avatar */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-elevation-1 ${ts.solid}`}
                      >
                        <span className="text-sm font-black">{event.studentName.charAt(0)}</span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold leading-tight text-main">
                          {event.studentName}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-micro font-medium text-muted">
                          <BookOpen size={10} className="shrink-0" />
                          {event.subject}
                          {event.curriculum ? ` · ${event.curriculum}` : ''}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className={`inline-flex max-w-full items-center gap-1 truncate rounded-lg px-1.5 py-0.5 text-micro font-bold ${ts.solid}`}
                          >
                            <GraduationCap size={10} className="shrink-0" />
                            <span className="truncate">{event.teacherName || 'غير محددة'}</span>
                          </span>
                          {event.studentGrade && (
                            <span className="shrink-0 rounded-lg bg-surface px-1.5 py-0.5 text-micro font-bold text-muted">
                              {event.studentGrade}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronLeft size={16} className="shrink-0 text-muted" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-dashed border-border bg-card py-14 text-center"
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft">
                <CalendarDays size={26} className="text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold text-main">
                {searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد حصص في هذا اليوم'}
              </p>
              <p className="mt-1 text-xs font-medium text-muted">
                {searchTerm ? 'جرّب كلمة بحث أخرى' : 'اختر يوماً آخر من القائمة'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MobilePage>
  )
}
