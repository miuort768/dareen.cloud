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
import { MobilePage, usePullToRefresh, MobileSkeleton } from '../../../shared/components/mobile'
import { normalizeDayName, to24Minutes } from '../../attendance/utils/slotUtils'

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

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const TEACHER_PALETTE = [
  { text: 'text-primary', soft: 'bg-primary-soft', bar: 'border-e-primary', chip: 'bg-primary' },
  { text: 'text-success', soft: 'bg-success-soft', bar: 'border-e-success', chip: 'bg-success' },
  { text: 'text-info', soft: 'bg-info-soft', bar: 'border-e-info', chip: 'bg-info' },
]

const teacherNameOf = (enrollment: Enrollment): string => {
  const t: unknown = enrollment.teacher
  if (typeof t === 'string') return t.trim()
  if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
    return String((t as TeacherRef).name ?? '').trim()
  }
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
              id: `${student.id}-${teacherNameOf(enrollment)}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
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
      .filter((e) => e.day === selectedDay)
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
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-micro font-bold text-muted">
                  <CalendarDays size={12} />
                  اليوم · {todayName}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-main">جدول الحصص</h1>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <CalendarDays size={20} />
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-divider rounded-xl bg-surface py-2.5">
              {[
                { value: countsByDay[todayName] || 0, label: 'حصة اليوم' },
                { value: allEvents.length, label: 'هذا الأسبوع' },
                { value: uniqueTeachers.length, label: 'معلمة' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center px-1 text-center">
                  <span className="text-base font-black tabular-nums text-main">{s.value}</span>
                  <span className="mt-0.5 text-micro font-medium text-muted">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                aria-label="بحث في الجدول"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن طالب أو معلمة أو مادة..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pe-9 ps-9 text-xs font-bold text-main outline-none transition-colors duration-fast placeholder:font-medium placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="مسح البحث"
                  className="absolute end-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:text-main"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== DAY CHIPS ===== */}
        <div className="custom-scrollbar overflow-x-auto px-3 pb-1 pt-3" dir="ltr">
          <div className="flex min-w-max gap-1.5" dir="rtl">
            {DAYS.map((day) => {
              const isActive = day === selectedDay
              const isToday = day === todayName
              const count = countsByDay[day] || 0
              return (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerHaptic('light')
                    setSelectedDay(day)
                  }}
                  aria-pressed={isActive}
                  className={`flex min-w-[68px] flex-col items-center gap-0.5 rounded-xl border px-3 py-1.5 transition-colors duration-fast ${
                    isActive
                      ? 'border-primary bg-primary'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <span
                    className={`flex items-center gap-1 text-xs font-bold ${
                      isActive ? 'text-on-primary' : 'text-main'
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          isActive ? 'bg-white' : 'bg-primary'
                        }`}
                      />
                    )}
                  </span>
                  <span
                    className={`text-micro font-bold tabular-nums ${
                      isActive ? 'text-on-primary/75' : 'text-muted'
                    }`}
                  >
                    {count} حصة
                  </span>
                </motion.button>
              )
            })}
          </div>
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
              <div className="border-success/20 flex items-center gap-2.5 rounded-xl border bg-success-soft p-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-success">
                  <Sparkles size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-micro font-bold text-success">الحصة القادمة اليوم</p>
                  <p className="truncate text-xs font-bold text-main">
                    {nextSession.studentName} · {nextSession.time}
                  </p>
                </div>
                <Clock size={14} className="shrink-0 text-success" />
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
                <span className="text-micro font-bold text-muted">حصص {selectedDay}</span>
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
                    className={`cursor-pointer overflow-hidden rounded-xl border border-e-[3px] border-border bg-card transition-colors duration-fast hover:border-border ${ts.bar}`}
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
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ts.soft}`}
                      >
                        <span className={`text-sm font-black ${ts.text}`}>
                          {event.studentName.charAt(0)}
                        </span>
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
                            className={`inline-flex max-w-full items-center gap-1 truncate rounded-lg px-1.5 py-0.5 text-micro font-bold ${ts.soft} ${ts.text}`}
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
                {searchTerm ? 'جرّب كلمة بحث أخرى' : 'اختر يوماً آخر من الأيام أعلاه'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MobilePage>
  )
}
