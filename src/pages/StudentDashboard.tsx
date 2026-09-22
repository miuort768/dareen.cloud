import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { Skeleton, ErrorState } from '../shared/components/ui'
import { useDeviceWidth } from '../shared/hooks/useDeviceWidth'
import { ARABIC_DAYS } from '../shared/constants/days'
import {
  normalizeDayName,
  normalizePeriod,
  parseTimeTo24,
  to24Minutes,
} from '../features/attendance/utils/slotUtils'
import type {
  StudentDashboardData,
  Session,
  PointLog,
  StudentStats,
  NextSessionInfo,
  TodayTimelineItem,
  SubjectProgress,
} from './student-dashboard/types'
import { StudentDashboardDesktop } from './student-dashboard/StudentDashboardDesktop'
import { StudentDashboardMobile } from './student-dashboard/StudentDashboardMobile'
import type { StudentActiveSession } from './student-dashboard/LiveSessionBanner'
import { format } from 'date-fns'
import { enrollmentTeacherNameOf, sessionOutcome } from '../shared/utils/enrollments'

const teacherLabel = (en: {
  teacher?: string | { id: string; name: string } | null
  teacherName?: string
  teacherId?: string
}): string => enrollmentTeacherNameOf(en)

/** يطابق الجلسة بالاشتراك عبر teacherId أولاً (الأدق) ثم بالاسم كخطة بديلة */
const teacherMatches = (
  en: { teacher?: string; teacherName?: string; teacherId?: string },
  s: { teacherName?: string; teacherId?: string },
): boolean => {
  if (s.teacherId && en.teacherId) return s.teacherId === en.teacherId
  const a = teacherLabel(en).trim().toLowerCase()
  const b = (s.teacherName || '').trim().toLowerCase()
  return Boolean(a) && a === b
}

const DAY_CHIPS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

const dayChip = (day: string): string => {
  const idx = ARABIC_DAYS.indexOf(normalizeDayName(day) as (typeof ARABIC_DAYS)[number])
  return idx >= 0 ? (DAY_CHIPS[idx] ?? day) : day
}

export const StudentDashboard = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `لوحة تحكم الطالب | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const device = useDeviceWidth()

  const { data, isLoading, error } = useQuery<{
    studentData: StudentDashboardData
    sessions: Session[]
    pointLogs: PointLog[]
  }>({
    queryKey: ['student-dashboard', currentUser?.id],
    queryFn: async () => {
      const [me, sessions, pointLogs] = await Promise.all([
        api.get<StudentDashboardData>('/student-portal/me'),
        api.get<Session[]>('/student-portal/me/sessions'),
        api.get<PointLog[]>('/student-portal/me/points-log'),
      ])
      return { studentData: me, sessions, pointLogs }
    },
    enabled: currentUser?.role === 'student',
  })

  const studentData = data?.studentData ?? null
  const sessions = useMemo(() => data?.sessions ?? [], [data])
  const pointLogs = useMemo(() => data?.pointLogs ?? [], [data])
  const enrollments = useMemo(() => studentData?.enrollments || [], [studentData])

  // ── Live session timer: يرصد /active-sessions/my كل 5 ثوانٍ (المعلمة بدأت الحصة) ──
  const { data: activeSessions } = useQuery<StudentActiveSession[]>({
    queryKey: ['active-sessions'],
    queryFn: () => api.get<StudentActiveSession[]>('/active-sessions/my'),
    refetchInterval: 5000,
    enabled: currentUser?.role === 'student',
  })
  const activeSession = useMemo(() => activeSessions?.[0] ?? null, [activeSessions])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo<StudentStats>(() => {
    const attendance = sessions.filter((s) => s.status === 'completed').length
    const absence = sessions.filter((s) => s.status === 'cancelled').length
    const recorded = attendance + absence
    let used = 0
    let total = 0
    enrollments.forEach((en) => {
      used += Number(en.sessionsUsed || 0)
      total += Number(en.sessionsTotal || 0)
    })
    return {
      sessionsUsed: used,
      sessionsTotal: total,
      attendance,
      absence,
      attendanceRate: recorded > 0 ? Math.round((attendance / recorded) * 100) : 0,
      curriculumProgress: total > 0 ? Math.round((used / total) * 100) : 0,
    }
  }, [sessions, enrollments])

  // ── Next session: today's remaining slots first, then the week ahead ──────
  const nextSession = useMemo<NextSessionInfo | null>(() => {
    const todayIdx = new Date().getDay()
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

    type Candidate = NextSessionInfo & { dayIndex: number }
    const candidates: Candidate[] = []
    enrollments.forEach((en) => {
      if (en.isFrozen) return
      ;(en.schedule || []).forEach((slot) => {
        const day = normalizeDayName(slot.day)
        const dayIndex = ARABIC_DAYS.indexOf(day as (typeof ARABIC_DAYS)[number])
        if (dayIndex === -1) return
        const dayOffset = (dayIndex - todayIdx + 7) % 7
        const minutes = to24Minutes(slot.hour, slot.period)
        if (dayOffset === 0 && minutes <= nowMinutes) return
        candidates.push({
          subject: en.subject || 'دورة',
          teacher: teacherLabel(en),
          hour: String(parseInt(String(slot.hour), 10) || ''),
          period: normalizePeriod(slot.period),
          day,
          isToday: dayOffset === 0,
          minutes,
          notes: en.nextSessionNotes || undefined,
          dayIndex: dayOffset,
        })
      })
    })

    if (candidates.length === 0) return null
    candidates.sort((a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes)
    const best = candidates[0]!
    return {
      subject: best.subject,
      teacher: best.teacher,
      hour: best.hour,
      period: best.period,
      day: best.day,
      isToday: best.isToday,
      minutes: best.minutes,
      notes: best.notes,
    }
  }, [enrollments])

  // ── Today's timeline with status from session records ─────────────────────
  const todayItems = useMemo<TodayTimelineItem[]>(() => {
    const todayName = ARABIC_DAYS[new Date().getDay()] || ''
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const items: TodayTimelineItem[] = []
    const matchedSessionIds = new Set<string>()

    const todaySession = (s: Session) =>
      s.date === todayStr || s.date === new Date().toLocaleDateString('en-CA')

    enrollments.forEach((en) => {
      ;(en.schedule || []).forEach((slot) => {
        if (normalizeDayName(slot.day) !== todayName) return
        const subject = en.subject || 'دورة'
        const matched = sessions.find(
          (s) =>
            s.subject === subject &&
            teacherMatches(en, s) &&
            todaySession(s) &&
            s.status !== 'scheduled',
        )
        if (matched?.id) matchedSessionIds.add(matched.id)
        const outcome = matched ? sessionOutcome(matched.status) : null
        items.push({
          id: `${en.id || en.subject}-${slot.hour}-${slot.period}`,
          subject,
          teacher: teacherLabel(en),
          hour: String(parseInt(String(slot.hour), 10) || ''),
          period: normalizePeriod(slot.period),
          minutes: to24Minutes(slot.hour, slot.period),
          notes: en.nextSessionNotes || undefined,
          topics: outcome === 'done' ? matched?.topics || undefined : undefined,
          homework: outcome === 'done' ? matched?.homework || undefined : undefined,
          status: outcome ?? (activeSession?.subject === subject ? 'live' : 'upcoming'),
        })
      })
    })

    // أي حصة مسجّلة اليوم لم تُطابَق بموعد في الجدول الأسبوعي (حصة استدراكية مثلاً)
    sessions.forEach((s) => {
      if (!s.id || matchedSessionIds.has(s.id)) return
      if (!todaySession(s)) return
      const outcome = sessionOutcome(s.status)
      if (!outcome) return
      const { h, m } = parseTimeTo24(s.time)
      const hour12 = h % 12 === 0 ? 12 : h % 12
      items.push({
        id: `session-${s.id}`,
        subject: s.subject || 'دورة',
        teacher: s.teacherName || '',
        hour: String(hour12),
        period: h >= 12 ? 'pm' : 'am',
        minutes: h * 60 + m,
        topics: outcome === 'done' ? s.topics || undefined : undefined,
        homework: outcome === 'done' ? s.homework || undefined : undefined,
        status: outcome,
      })
    })

    return items.sort((a, b) => a.minutes - b.minutes)
  }, [enrollments, sessions, activeSession])

  // ── Subjects board data ───────────────────────────────────────────────────
  const subjects = useMemo<SubjectProgress[]>(
    () =>
      enrollments.map((en, idx) => {
        const used = Number(en.sessionsUsed || 0)
        const total = Number(en.sessionsTotal || 0)
        const days = [...new Set((en.schedule || []).map((s) => dayChip(s.day)))]
        return {
          id: en.id || `en-${idx}`,
          subject: en.subject || 'دورة',
          teacher: teacherLabel(en) || '—',
          used,
          total,
          percent: total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0,
          isFrozen: Boolean(en.isFrozen),
          weekDays: days,
          notes: en.nextSessionNotes || undefined,
        }
      }),
    [enrollments],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="mx-auto max-w-page space-y-5 pt-6 sm:px-4 md:px-6">
          <Skeleton className="h-44 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-52 rounded-2xl" />
            </div>
            <div className="space-y-5 lg:col-span-4">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
        <ErrorState
          title="تعذر تحميل لوحة الطالب"
          message={error.message || 'فشل تحميل البيانات. تحقق من اتصالك بالإنترنت.'}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ['student-dashboard', currentUser?.id] })
          }
          retryLabel="إعادة المحاولة"
        />
      </div>
    )
  }

  const sharedProps = {
    studentData,
    sessions,
    pointLogs,
    stats,
    todayItems,
    nextSession,
    subjects,
    activeSession,
    onRefresh: () =>
      queryClient.invalidateQueries({ queryKey: ['student-dashboard', currentUser?.id] }),
  }

  return (
    <>
      {device === 'mobile' ? (
        <StudentDashboardMobile {...sharedProps} />
      ) : (
        <StudentDashboardDesktop {...sharedProps} />
      )}
    </>
  )
}

export default StudentDashboard
