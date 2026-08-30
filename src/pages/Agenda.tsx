import { useState, useEffect, useMemo, useRef } from 'react'
import { CalendarCheck, CheckCircle2, Search, Calendar, User, BookOpen } from 'lucide-react'
import { useCurrentUser, useShowNotification } from '../context/AppContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { cn } from '../lib/utils'
import { PageHeader, ProgressBar } from '../shared/components/ui'
import type { Student, Session, Enrollment } from '../types'
import { periodLabel, normalizeDayName } from '../features/attendance/utils/slotUtils'

export const Agenda = () => {
  useEffect(() => {
    document.title = 'الأجندة | دارين السابعة للتعليم والتدريب'
  }, [])
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const isTeacher = currentUser?.role === 'teacher'
  const teacherName = currentUser?.teacherName || currentUser?.name
  const markBusyRef = useRef(false)

  const [activeDay, setActiveDay] = useState(
    new Date().toLocaleDateString('ar-EG', { weekday: 'long' }),
  )
  const [searchTerm, setSearchTerm] = useState('')

  const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const data = await api.get<Student[]>('/students')
      return Array.isArray(data)
        ? data
        : ((data as Record<string, unknown>).data as Student[]) || []
    },
  })

  const { data: sessions = [], isLoading: loadingSessions } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const data = await api.get<Session[]>('/sessions')
      return Array.isArray(data) ? data : []
    },
  })

  const logAttendanceMutation = useMutation({
    mutationFn: async (sessionData: Record<string, unknown>) => {
      return api.post('/sessions', sessionData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      showNotification('تم تسجيل الحضور بنجاح', 'success')
    },
    onError: () => {
      showNotification('فشل تسجيل الحضور', 'error')
    },
  })

  // Extract scheduled slots for the active day
  const scheduledAppointments = useMemo(() => {
    const list: {
      id: string
      date: string
      time: string
      title: string
      description?: string
      type: string
      studentName: string
      studentId: string
      studentGrade: string
      teacherName: string
      subject: string
      hour: string
      period: string
      isDone: boolean
      enrollment: Enrollment
    }[] = []
    students.forEach((student) => {
      student.enrollments?.forEach((enrollment: Enrollment) => {
        // If teacher view, only show their students
        if (
          isTeacher &&
          enrollment.teacher !== teacherName &&
          enrollment.teacherId !== currentUser?.id
        )
          return

        enrollment.schedule?.forEach((slot) => {
          if (normalizeDayName(slot.day) === activeDay) {
            // Check if already completed today
            const today = new Date().toLocaleDateString('en-CA')
            const isDone = sessions.some(
              (s) =>
                s.studentId === student.id &&
                ((s.teacherId && enrollment.teacherId && s.teacherId === enrollment.teacherId) ||
                  s.teacherName === enrollment.teacher) &&
                s.subject === enrollment.subject &&
                s.date === today &&
                s.status === 'completed',
            )

            list.push({
              id: `${student.id}-${enrollment.teacher}-${enrollment.subject}-${slot.hour}-${slot.period}`,
              date: today,
              type: 'session',
              title: `${student.name} - ${enrollment.subject}`,
              studentId: student.id,
              studentName: student.name,
              studentGrade: student.grade,
              teacherName:
                typeof enrollment.teacher === 'string'
                  ? enrollment.teacher
                  : (enrollment.teacher?.name ?? ''),
              subject: enrollment.subject,
              time: `${slot.hour} ${periodLabel(slot.period, true)}`,
              hour: slot.hour,
              period: slot.period,
              isDone,
              enrollment,
            })
          }
        })
      })
    })

    return list.filter(
      (item) =>
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [students, sessions, activeDay, isTeacher, teacherName, searchTerm, currentUser?.id])

  type ScheduledAppointment = {
    id: string
    date: string
    time: string
    title: string
    description?: string
    type: string
    studentName: string
    studentId: string
    studentGrade: string
    teacherName: string
    subject: string
    hour: string
    period: string
    isDone: boolean
    enrollment: Enrollment
  }

  const handleMarkDone = async (appointment: ScheduledAppointment) => {
    if (markBusyRef.current) return
    markBusyRef.current = true

    const alreadyDone = scheduledAppointments.some(
      (a) => a.isDone && a.studentId === appointment.studentId && a.subject === appointment.subject,
    )
    if (alreadyDone) {
      showNotification('هذه الحصة مسجلة بالفعل', 'warning')
      markBusyRef.current = false
      return
    }

    try {
      await logAttendanceMutation.mutateAsync({
        studentId: appointment.studentId,
        studentName: appointment.studentName,
        teacherName: appointment.teacherName,
        subject: appointment.subject,
        date: new Date().toLocaleDateString('en-CA'),
        time: new Date().toLocaleTimeString('ar-EG', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
        status: 'completed',
        day: activeDay,
      })
    } catch {
      // notification already shown by onError
    } finally {
      markBusyRef.current = false
    }
  }

  const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  if (loadingStudents || loadingSessions) {
    return <div className="p-6 text-center lg:p-12">جاري تحميل البيانات...</div>
  }

  return (
    <div
      className="from-info-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background pb-24 font-sans"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto max-w-page px-2">
        <PageHeader
          title="جدول المواعيد"
          subtitle="متابعة جميع حصص الطلاب المسجلين"
          icon={<CalendarCheck />}
          stats={
            <>
              <div className="flex items-center gap-2 text-xs font-bold text-dim">
                <span>كل المواعيد:</span>
                <span className="text-main">{scheduledAppointments.length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-dim">
                <span>تم الإنجاز:</span>
                <span className="text-success">
                  {scheduledAppointments.filter((a) => a.isDone).length}
                </span>
              </div>
            </>
          }
        />

        {/* Quick Filters */}
        <div className="mx-2 mb-3 rounded-2xl border border-border bg-surface p-2">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-bold transition-all',
                  activeDay === day
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'from-info-soft/40 border border-border bg-gradient-to-b via-background to-background text-dim hover:text-main',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 px-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
            <input
              type="text"
              aria-label="بحث عن طالب"
              placeholder="بحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pe-3 ps-8 text-xs font-bold text-main transition-all placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 gap-3 px-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {scheduledAppointments.length > 0 ? (
            scheduledAppointments.map((app) => (
              <div
                key={app.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all',
                  app.isDone ? 'border-success-soft' : 'border-border hover:border-warning',
                )}
              >
                {/* Status Stripe */}
                <div
                  className={cn(
                    'absolute start-0 top-0 h-full w-1 transition-all',
                    app.isDone ? 'bg-success' : 'bg-warning',
                  )}
                ></div>

                <div className="space-y-2.5 p-3 ps-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors',
                          app.isDone
                            ? 'bg-success-soft text-success'
                            : 'bg-warning-soft text-warning',
                        )}
                      >
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight text-main">
                          {app.studentName}
                        </h4>
                        <p className="text-[10px] font-bold text-dim">{app.studentGrade}</p>
                      </div>
                    </div>
                    <div className="from-info-soft/40 rounded-lg bg-gradient-to-b via-background to-background px-2 py-1 font-mono text-[10px] font-bold text-dim">
                      {app.time}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-dim">
                      <BookOpen size={12} className="text-warning" />
                      <span>{app.subject}</span>
                    </div>
                    {!isTeacher && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-dim">
                        <User size={12} className="text-info" />
                        <span>{app.teacherName}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress for that enrollment */}
                  <div className="pt-1">
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-dim">
                      <span>التقدم</span>
                      <span>
                        {app.enrollment.sessionsUsed}/{app.enrollment.sessionsTotal}
                      </span>
                    </div>
                    <ProgressBar
                      value={(app.enrollment.sessionsUsed / app.enrollment.sessionsTotal) * 100}
                      variant={app.isDone ? 'success' : 'warning'}
                    />
                  </div>

                  <div className="pt-1">
                    {app.isDone ? (
                      <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-success-soft py-2 text-[10px] font-bold text-success">
                        <CheckCircle2 size={13} />
                        تم الإنجاز
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkDone(app)}
                        disabled={logAttendanceMutation.isPending}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-warning py-2 text-[10px] font-bold text-on-warning transition-all active:scale-95 disabled:opacity-50"
                      >
                        {logAttendanceMutation.isPending ? (
                          'جاري...'
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            تسجيل الإنجاز
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full mx-2 rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
              <Calendar size={32} className="mx-auto mb-2 text-dim" />
              <h3 className="text-xs font-bold text-muted">لا توجد مواعيد لهذا اليوم</h3>
              <p className="mt-1 text-[10px] text-dim">اختر يوماً آخر</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
