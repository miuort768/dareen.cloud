import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCurrentUser, useAdminPhone, useLogout, useAcademyName } from '../context/AppContext'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Skeleton } from '../shared/components/ui'
import { ParentDashboardDesktop } from './parent-dashboard/ParentDashboardDesktop'
import { ParentDashboardMobile } from './parent-dashboard/ParentDashboardMobile'
import type { Student } from '../types'
import { normalizeDayName } from '../features/attendance/utils/slotUtils'

export const ParentDashboard = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `لوحة تحكم ولي الأمر | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const adminPhone = useAdminPhone()
  const logout = useLogout()

  const [partialError, setPartialError] = useState<string | null>(null)

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
          return (await api.get<Student[]>(`/parents/child-sessions/${s.id}`)) || []
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
  const sessions = parentData?.sessions ?? []
  const allPointLogs = parentData?.allPointLogs ?? []

  const { data: activeTimers = [] } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get<Student[]>('/active-sessions/my'),
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

  const todayTasks = useMemo(() => {
    const tasks: {
      studentName: string
      subject: string
      teacher: string
      time: string
      period: string
    }[] = []
    children.forEach((child) => {
      ;(child.enrollments || []).forEach((en) => {
        ;(en.schedule || []).forEach((slot) => {
          if (normalizeDayName(slot.day) === todayArabic) {
            tasks.push({
              studentName: child.name,
              subject: en.subject || en.teacherName || '',
              teacher: typeof en.teacher === 'string' ? en.teacher : en.teacher?.name || '',
              time: slot.hour,
              period: slot.period,
            })
          }
        })
      })
    })
    return tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [children, todayArabic])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background" dir="rtl">
        <div className="sticky top-0 z-[100] border-b border-border bg-surface dark:border-border dark:bg-card">
          <div className="mx-auto flex max-w-page items-center justify-between px-4 pb-3 pt-4 md:px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-page space-y-6 px-4 pt-6">
          <Skeleton className="h-44 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background dark:bg-background"
        dir="rtl"
      >
        <div className="max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-8 text-center dark:border-border dark:bg-card">
          <p className="text-sm text-muted dark:text-muted">
            فشل تحميل الأبناء. تحقق من اتصالك بالإنترنت.
          </p>
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
    sessions,
    allPointLogs,
    activeTimers,
    todayTasks,
    formatTime,
    logout,
    onRefresh: () => refetch(),
  }

  return (
    <>
      {partialError && (
        <div className="border-warning/20 border-b bg-warning-soft px-4 py-2 text-center">
          <p className="text-xs font-medium text-warning">{partialError}</p>
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
