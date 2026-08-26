import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser, useShowNotification } from '../../../context/AppContext'
import { api } from '../../../lib/api'
import { normalizeDayName } from '../../attendance/utils/slotUtils'
import { appointmentTeacherNameOf, type AppointmentEvent, type Student } from '../types'

/**
 * جلب الطلاب حسب الدور:
 * طالب → نفسه من البوابة، ولي الأمر → أبناؤه فقط (خصوصية)،
 * غير ذلك (مشرف/معلم) → جميع الطلاب مع فلترة جانب المعلم لاحقًا.
 */
export const useAppointmentStudents = () => {
  const currentUser = useCurrentUser()
  return useQuery<Student[]>({
    queryKey: ['appointments-students', currentUser?.role],
    queryFn: async (): Promise<Student[]> => {
      if (currentUser?.role === 'student') {
        const me = await api.get<Student>('/student-portal/me')
        return [me]
      }
      if (currentUser?.role === 'parent') {
        const children = await api.get<Student[] | { data?: Student[] }>('/parents/my-children')
        return Array.isArray(children) ? children : children.data || []
      }
      const data = await api.get<Student[] | { data?: Student[] }>('/students')
      return Array.isArray(data) ? data : data.data || []
    },
  })
}

/**
 * جلسات مكتملة (معرفات الأحداث) — مصدر واحد يستخدمه المواعيد والجداول.
 * يشمل منطق تصفير اليوم للمشرف + تحديث كل 15 ثانية + mutation بالإشعارات.
 */
export const useCompletedSessions = () => {
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const queryClient = useQueryClient()
  const canComplete = currentUser?.role === 'admin' || currentUser?.role === 'teacher'

  const query = useQuery<string[]>({
    queryKey: ['completed-sessions'],
    queryFn: async () => {
      if (currentUser?.role === 'admin') {
        const settings = await api.get<{ last_appointment_reset?: string }>('/system/settings')
        const lastResetDate = settings?.last_appointment_reset
        const todayStr = new Date().toDateString()
        if (lastResetDate !== todayStr) {
          await api.delete('/appointments/completed-sessions/reset')
          await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr })
          return []
        }
      }
      const sessions = await api.get<string[]>('/appointments/completed-sessions')
      return sessions || []
    },
    refetchInterval: 15000,
    enabled: canComplete,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post('/appointments/completed-sessions', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['completed-sessions'] }),
    onError: () => {
      showNotification('عذراً، حدث خطأ في تسجيل إتمام الحصة. يرجى المحاولة مرة أخرى.', 'error')
    },
  })

  return {
    completedSessionIds: query.data ?? [],
    completeMutation,
    canComplete,
  }
}

interface BuildAppointmentsOptions {
  currentUserRole?: string
  currentUserId?: string | number
  teacherToMatch?: string
}

/** تحويل الطلاب → أحداث مواعيد مسطحة (بأسماء معلمات آمنة ومعرفات متطابقة بين الواجهتين) */
export const buildAppointmentEvents = (
  students: Student[],
  options: BuildAppointmentsOptions,
): AppointmentEvent[] =>
  (students || []).flatMap((student) =>
    (student.enrollments || [])
      .filter(
        (enrollment) =>
          options.currentUserRole !== 'teacher' ||
          appointmentTeacherNameOf(enrollment) === (options.teacherToMatch || '') ||
          enrollment.teacherId === options.currentUserId,
      )
      .flatMap((enrollment) =>
        (enrollment.schedule || []).map((slot) => {
          const isPM = !(
            slot.period === 'am' ||
            slot.period === 'صباحاً' ||
            slot.period === 'صباحا' ||
            slot.period === 'ص'
          )
          const normalizedPeriod = isPM ? 'م' : 'ص'
          const normHour = String(parseInt(String(slot.hour).trim(), 10) || '')
          const tName = appointmentTeacherNameOf(enrollment)
          return {
            id: `${student.id}-${tName}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
            studentName: student.name,
            studentGrade: student.grade,
            teacherName: tName,
            subject: enrollment.subject,
            curriculum: enrollment.curr,
            day: normalizeDayName(slot.day),
            hour: normHour,
            period: slot.period,
            time: `${normHour} ${normalizedPeriod}`,
            isPM,
          }
        }),
      ),
  )

/** الهوك الجامع — يُستخدم في واجهتي سطح المكتب والهاتف */
export const useAppointmentsData = () => {
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const studentsQuery = useAppointmentStudents()
  const { completedSessionIds, completeMutation, canComplete } = useCompletedSessions()

  const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim()

  const allAppointments = useMemo(
    () =>
      buildAppointmentEvents(studentsQuery.data ?? [], {
        currentUserRole: currentUser?.role,
        currentUserId: currentUser?.id,
        teacherToMatch,
      }),
    [studentsQuery.data, currentUser?.role, currentUser?.id, teacherToMatch],
  )

  const uniqueTeachers = useMemo(
    () => Array.from(new Set(allAppointments.map((a) => a.teacherName))).filter(Boolean),
    [allAppointments],
  )

  const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
  const todayAppointments = useMemo(
    () => allAppointments.filter((a) => a.day === todayName),
    [allAppointments, todayName],
  )
  const remainingToday = useMemo(
    () => todayAppointments.filter((a) => !completedSessionIds.includes(a.id)),
    [todayAppointments, completedSessionIds],
  )
  const completedCount = useMemo(
    () => allAppointments.filter((a) => completedSessionIds.includes(a.id)).length,
    [allAppointments, completedSessionIds],
  )

  return {
    studentsQuery,
    loading: studentsQuery.isLoading,
    isError: studentsQuery.isError,
    refetch: async () => {
      await Promise.all([
        studentsQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ['completed-sessions'] }),
      ])
    },
    allAppointments,
    uniqueTeachers,
    completedSessionIds,
    completeMutation,
    canComplete,
    todayName,
    stats: {
      total: allAppointments.length,
      today: todayAppointments.length,
      remainingToday: remainingToday.length,
      completed: completedCount,
    },
  }
}
