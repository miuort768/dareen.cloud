import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCurrentUser, useAdminPhone, useAcademyName } from '../context/AppContext'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Skeleton } from '../shared/components/ui'
import { ParentDashboardDesktop } from './parent-dashboard/ParentDashboardDesktop'
import { ParentDashboardMobile } from './parent-dashboard/ParentDashboardMobile'
import type { Student, Enrollment, Session } from '../types'
import {
  normalizeDayName,
  normalizePeriod,
  to24Minutes,
} from '../features/attendance/utils/slotUtils'
import { ARABIC_DAYS } from '../shared/constants/days'
import type {
  ChildStats,
  ChildNextSession,
  ChildNote,
  TodayTimelineItem,
  WeeklyPulseStats,
  ActiveTimerSession,
} from './parent-dashboard/types'

const teacherLabel = (en: Enrollment): string =>
  typeof en.teacher === 'string' ? en.teacher : en.teacher?.name || en.teacherName || ''

/** Next upcoming slot for a child: today's remaining slots first, then the week ahead. */
const findNextSession = (child: Student): ChildNextSession | null => {
  const todayIdx = new Date().getDay()
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  const candidates: (ChildNextSession & { dayIndex: number })[] = []
  ;(child.enrollments || []).forEach((en) => {
    ;(en.schedule || []).forEach((slot) => {
      const day = normalizeDayName(slot.day)
      const dayIndex = ARABIC_DAYS.indexOf(day as (typeof ARABIC_DAYS)[number])
      if (dayIndex === -1) return
      const dayOffset = (dayIndex - todayIdx + 7) % 7
      const minutes = to24Minutes(slot.hour, slot.period)
      // skip today's already-passed slots
      if (dayOffset === 0 && minutes <= nowMinutes) return
      candidates.push({
        day,
        hour: String(parseInt(String(slot.hour), 10) || ''),
        period: normalizePeriod(slot.period),
        subject: en.subject || teacherLabel(en),
        teacher: teacherLabel(en),
        minutes,
        isToday: dayOffset === 0,
        dayIndex: dayOffset,
      })
    })
  })

  if (candidates.length === 0) return null
  candidates.sort((a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes)
  const best = candidates[0]!
  return {
    day: best.day,
    hour: best.hour,
    period: best.period,
    subject: best.subject,
    teacher: best.teacher,
    minutes: best.minutes,
    isToday: best.isToday,
  }
}

const computeChildStats = (child: Student, childSessions: Session[]): ChildStats => {
  const completed = childSessions.filter((s) => s.status === 'completed').length
  const cancelled = childSessions.filter((s) => s.status === 'cancelled').length
  const totalRecorded = completed + cancelled
  const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0

  const enrollments = child.enrollments || []
  const sessionsUsed = enrollments.reduce((s, en) => s + Number(en.sessionsUsed || 0), 0)
  const sessionsTotal = enrollments.reduce((s, en) => s + Number(en.sessionsTotal || 0), 0)

  const notes: ChildNote[] = enrollments
    .filter((en) => en.nextSessionNotes)
    .map((en) => ({
      subject: en.subject || teacherLabel(en),
      teacher: teacherLabel(en),
      text: en.nextSessionNotes || '',
    }))

  return {
    attendanceRate,
    completed,
    cancelled,
    sessionsUsed,
    sessionsTotal,
    progress: sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0,
    nextSession: findNextSession(child),
    notes,
  }
}

export const ParentDashboard = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `لوحة تحكم ولي الأمر | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const adminPhone = useAdminPhone()

  const [partialError, setPartialError] = useState<string | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  const todayArabic = format(new Date(), 'eeee', { locale: ar })

  const {
    data: parentData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['parent-dashboard', currentUser?.id],
    queryFn: async () => {
      setPartialError(null)
      const students = await api.get<Student[]>('/parents/my-children')

      let failedChildren = 0
      const sessionsPromises = students.map(async (s) => {
        try {
          return (await api.get<Session[]>(`/parents/child-sessions/${s.id}`)) || []
        } catch {
          failedChildren++
          return []
        }
      })
      // Points log may be forbidden for parents on some backends — degrade silently.
      const logsPromises = students.map(async (s) => {
        try {
          return (await api.get<unknown[]>(`/student-portal/me/points-log?studentId=${s.id}`)) || []
        } catch {
          return []
        }
      })

      const [allSessionsResults, allLogsResults] = await Promise.all([
        Promise.all(sessionsPromises),
        Promise.all(logsPromises),
      ])

      if (failedChildren > 0)
        setPartialError(`حدث خطأ أثناء تحميل بعض الأبناء. بعض البيانات قد تكون غير محدثة.`)

      const flattenedLogs = allLogsResults
        .map((logs, idx) =>
          (
            (Array.isArray(logs) ? logs : []) as {
              id: string
              date: string
              status: string
              timestamp?: string
              points?: number
            }[]
          ).map((l) => ({ ...l, studentName: students[idx]?.name || '' })),
        )
        .flat()

      return {
        children: students,
        sessions: allSessionsResults.flat(),
        allPointLogs: flattenedLogs.sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
          return timeB - timeA
        }),
      }
    },
    enabled: currentUser?.role === 'parent',
  })

  const children = useMemo(() => parentData?.children ?? [], [parentData])
  const sessions = useMemo(() => parentData?.sessions ?? [], [parentData])
  const allPointLogs = useMemo(() => parentData?.allPointLogs ?? [], [parentData])

  // default selection: first child once data arrives
  useEffect(() => {
    if (!selectedChildId && children.length > 0) setSelectedChildId(children[0]!.id)
  }, [children, selectedChildId])

  const { data: activeTimers = [] } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get<ActiveTimerSession[]>('/active-sessions/my'),
    refetchInterval: 5000,
  })

  const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [, setTimerTick] = useState(0)

  useEffect(() => {
    if (activeTimers.length > 0 && !timerTickRef.current) {
      timerTickRef.current = setInterval(() => setTimerTick((t) => t + 1), 1000)
    } else if (activeTimers.length === 0 && timerTickRef.current) {
      clearInterval(timerTickRef.current)
      timerTickRef.current = null
    }
    return () => {
      if (timerTickRef.current) {
        clearInterval(timerTickRef.current)
        timerTickRef.current = null
      }
    }
  }, [activeTimers.length])

  const formatTime = (startedAt: string | null | undefined) => {
    if (!startedAt) return '--:--'
    const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Derived: per-child stats ───────────────────────────────────────────────
  const childStats = useMemo(() => {
    const map: Record<string, ChildStats> = {}
    children.forEach((child) => {
      const childSessions = sessions.filter((s) => s.studentId === child.id)
      map[child.id] = computeChildStats(child, childSessions)
    })
    return map
  }, [children, sessions])

  // ── Derived: today's timeline (all children) ──────────────────────────────
  const timeline = useMemo<TodayTimelineItem[]>(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const items: TodayTimelineItem[] = []
    children.forEach((child) => {
      ;(child.enrollments || []).forEach((en) => {
        ;(en.schedule || []).forEach((slot) => {
          if (normalizeDayName(slot.day) !== todayArabic) return
          const subject = en.subject || teacherLabel(en)
          const teacher = teacherLabel(en)
          const minutes = to24Minutes(slot.hour, slot.period)
          const matched = sessions.find(
            (s) =>
              s.studentId === child.id &&
              s.subject === subject &&
              (s.teacherId
                ? en.teacherId && s.teacherId === en.teacherId
                : s.teacherName === teacher) &&
              (s.date === todayStr || s.date === format(new Date(), 'en-CA')) &&
              s.status !== 'scheduled',
          )
          const isLive = activeTimers.some((t) => t.studentId === child.id && t.subject === subject)
          items.push({
            id: `${child.id}-${en.id || en.subject}-${slot.hour}-${slot.period}`,
            studentId: child.id,
            studentName: child.name,
            subject,
            teacher,
            hour: String(parseInt(String(slot.hour), 10) || ''),
            period: normalizePeriod(slot.period),
            minutes,
            status: isLive
              ? 'live'
              : matched
                ? (matched.status as 'done' | 'cancelled')
                : 'upcoming',
          })
        })
      })
    })
    return items.sort((a, b) => a.minutes - b.minutes)
  }, [children, todayArabic, sessions, activeTimers])

  // ── Derived: weekly pulse ──────────────────────────────────────────────────
  const weekly = useMemo<WeeklyPulseStats>(() => {
    const completed = sessions.filter((s) => s.status === 'completed').length
    const cancelled = sessions.filter((s) => s.status === 'cancelled').length
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weeklyCompleted = sessions.filter((s) => {
      if (s.status !== 'completed') return false
      const d = s.date
      if (!d || typeof d !== 'string') return false
      try {
        return new Date(d) >= weekStart
      } catch {
        return false
      }
    }).length

    let used = 0
    let total = 0
    children.forEach((c) => {
      ;(c.enrollments || []).forEach((en) => {
        used += Number(en.sessionsUsed || 0)
        total += Number(en.sessionsTotal || 0)
      })
    })
    const totalRecorded = completed + cancelled
    return {
      completed,
      weeklyCompleted,
      cancelled,
      todayCount: timeline.length,
      attendanceRate: totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0,
      academicProgress: total > 0 ? Math.round((used / total) * 100) : 0,
    }
  }, [sessions, children, timeline])

  const points = useMemo(
    () => allPointLogs.reduce((sum, log) => sum + (log.points || 0), 0),
    [allPointLogs],
  )

  const childNames = useMemo(() => {
    const map: Record<string, string> = {}
    children.forEach((c) => {
      map[c.id] = c.name
    })
    return map
  }, [children])

  /** الابن الأكبر: أعلى صف دراسي (نظام 12 صف) — وإن تعذّر المقارنة فالأول في القائمة */
  const eldestChild = useMemo<Student | null>(() => {
    if (children.length === 0) return null
    const gradeValue = (grade?: string | null): number => {
      if (!grade) return -1
      const normalized = grade.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      const m = normalized.match(/(\d{1,2})/)
      return m && m[1] ? parseInt(m[1], 10) : -1
    }
    const sorted = [...children].sort((a, b) => {
      const diff = gradeValue(b.grade) - gradeValue(a.grade)
      return diff !== 0 ? diff : 0
    })
    return sorted[0] ?? null
  }, [children])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="mx-auto max-w-page space-y-5 px-2.5 pt-6 sm:px-4 md:px-6">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <div className="space-y-5 lg:col-span-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
        <div className="max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">فشل تحميل الأبناء. تحقق من اتصالك بالإنترنت.</p>
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-primary hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  const sharedProps = {
    currentUser,
    adminPhone,
    children,
    eldestChild,
    allPointLogs,
    activeTimers,
    childStats,
    timeline,
    weekly,
    points,
    selectedChildId,
    onSelectChild: setSelectedChildId,
    formatTime,
    onRefresh: () => refetch(),
    childNames,
  }

  return (
    <>
      {partialError && (
        <div className="border-b border-warning-soft bg-warning-soft px-4 py-2 text-center dark:border-primary-soft dark:bg-primary-soft">
          <p className="text-xs font-medium text-warning dark:text-primary">{partialError}</p>
        </div>
      )}
      <div className="hidden md:block">
        <ParentDashboardDesktop {...sharedProps} />
      </div>
      <div className="block md:hidden">
        <ParentDashboardMobile {...sharedProps} />
      </div>
    </>
  )
}

export default ParentDashboard
