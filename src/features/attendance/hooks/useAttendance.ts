import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { api } from '../../../lib/api'
import { attendanceService } from '../services/attendanceService'
import type {
  Session,
  Student,
  AttendanceStats,
  TeacherStats,
  TeacherAttendanceRate,
  GlobalUser,
  ScheduleSlot,
} from '../types'

export const teacherNameOf = (enrollment: { teacher: unknown }): string => {
  const t = enrollment.teacher
  if (typeof t === 'string') return t.trim()
  if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
    return String((t as { name?: unknown }).name ?? '').trim()
  }
  return ''
}

export const useAttendance = (
  currentUser: GlobalUser | null,
  date: string,
  dateRange?: { start: string; end: string },
) => {
  const [students, setStudents] = useState<Student[]>([])
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherProfile, setTeacherProfile] = useState<{ id: string; name: string } | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Resolve the REAL Teacher row for the logged-in teacher account. Enrollments
  // reference the Teacher row id — matching by the account id alone misses them.
  useEffect(() => {
    if (currentUser?.role !== 'teacher') return
    let cancelled = false
    api
      .get<{ id?: string | number; name?: string }>('/teachers/me')
      .then((t) => {
        if (cancelled || !t) return
        setTeacherProfile({
          id: String(t.id ?? ''),
          name: String(t.name ?? '').trim(),
        })
      })
      .catch(() => {
        // account-only logins fall back to name matching below
      })
    return () => {
      cancelled = true
    }
  }, [currentUser?.role, currentUser?.id])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sessionsData, studentsData] = await Promise.all([
        attendanceService.getSessions(),
        attendanceService.getStudents(),
      ])
      if (mountedRef.current) {
        setAllSessions(sessionsData)
        setStudents(studentsData)
      }
    } catch (error) {
      console.error('Error fetching attendance data', error)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [date, fetchAll])

  const logAttendance = async (
    sessionData: Omit<Session, 'id'>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await attendanceService.createSession(sessionData)
      fetchAll()
      return { success: true }
    } catch (error) {
      console.error('Error logging attendance', error)
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      return { success: false, error: message }
    }
  }

  const updateSchedule = async (
    student: Student,
    enrollmentIndex: number,
    newSchedule: ScheduleSlot[],
  ) => {
    try {
      const enrollment = student.enrollments?.[enrollmentIndex]
      if (!enrollment?.id) return false
      await attendanceService.updateSchedule(student.id, enrollment.id, newSchedule)
      fetchAll()
      return true
    } catch (error) {
      console.error('Error updating schedule', error)
      return false
    }
  }

  // حالة الحفظ للمزامنة مع نافذة إدارة الجدول (تعطيل الأزرار أثناء الحفظ)
  const [schedulePending, setSchedulePending] = useState(false)
  const updateScheduleTracked = async (
    student: Student,
    enrollmentIndex: number,
    newSchedule: ScheduleSlot[],
  ) => {
    setSchedulePending(true)
    try {
      return await updateSchedule(student, enrollmentIndex, newSchedule)
    } finally {
      setSchedulePending(false)
    }
  }

  const updateEnrollmentNotes = async (studentId: string, subject: string, notes: string) => {
    try {
      const student = students.find((s) => s.id === studentId)
      if (!student) return false

      const enrollment = student.enrollments.find((e) => e.subject === subject)
      if (!enrollment?.id) return false

      await attendanceService.updateEnrollmentNotes(studentId, enrollment.id, notes)
      // Deep update state to ensure re-render
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                enrollments: s.enrollments.map((e) =>
                  e.subject === subject ? { ...e, nextSessionNotes: notes } : e,
                ),
              }
            : s,
        ),
      )
      return true
    } catch (error) {
      console.error('Error updating enrollment notes', error)
      return false
    }
  }

  const requestReschedule = async (
    studentId: string,
    studentName: string,
    subject: string,
    data: { date: string; time: string; reason: string },
  ) => {
    try {
      await api.post('/tasks', {
        id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        title: `طلب تأجيل: ${studentName}`,
        description: `الحصة: ${subject}\nالموعد المقترح: ${data.date} - ${data.time}\nالسبب: ${data.reason}`,
        status: 'pending',
        priority: 'medium',
        dueDate: data.date,
        teacherId: currentUser?.id,
        studentId: studentId,
      })
      return true
    } catch (err) {
      console.error('Reschedule error:', err)
      return false
    }
  }

  const stats = useMemo<AttendanceStats>(() => {
    // We filter sessions by date here to match the logic in Attendance.tsx
    const todaySessions = allSessions.filter((s) => {
      if (s.date === date) return true
      if (s.status === 'scheduled') {
        const sessionDate = new Date(s.date)
        const clientDate = new Date(date)
        const diffTime = clientDate.getTime() - sessionDate.getTime()
        const diffDays = diffTime / (1000 * 3600 * 24)
        return diffDays > 0 && diffDays <= 1
      }
      return false
    })

    return {
      todayCompleted: todaySessions.filter((s) => s.status === 'completed').length,
      todayCancelled: todaySessions.filter((s) => s.status === 'cancelled').length,
      todayScheduled: todaySessions.filter((s) => s.status === 'scheduled').length,
      todayTotal: todaySessions.length,
      totalCompleted: allSessions.filter((s) => s.status === 'completed').length,
      totalCancelled: allSessions.filter((s) => s.status === 'cancelled').length,
    }
  }, [allSessions, date])

  const periodStats = useMemo(() => {
    if (!dateRange) return null
    const { start, end } = dateRange
    const rangeSessions = allSessions.filter((s) => {
      return s.date >= start && s.date <= end
    })
    const startDate = new Date(`${start}T00:00:00`)
    const endDate = new Date(`${end}T00:00:00`)
    const lengthDays = Math.max(
      Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1,
      1,
    )
    const prevEnd = new Date(startDate)
    prevEnd.setDate(startDate.getDate() - 1)
    const prevStart = new Date(startDate)
    prevStart.setDate(startDate.getDate() - lengthDays)
    const prevStartStr = prevStart.toLocaleDateString('en-CA')
    const prevEndStr = prevEnd.toLocaleDateString('en-CA')
    const prevSessions = allSessions.filter((s) => s.date >= prevStartStr && s.date <= prevEndStr)
    return {
      completed: rangeSessions.filter((s) => s.status === 'completed').length,
      cancelled: rangeSessions.filter((s) => s.status === 'cancelled').length,
      scheduled: rangeSessions.filter((s) => s.status === 'scheduled').length,
      total: rangeSessions.length,
      prevCompleted: prevSessions.filter((s) => s.status === 'completed').length,
      prevCancelled: prevSessions.filter((s) => s.status === 'cancelled').length,
    }
  }, [allSessions, dateRange])

  const teacherData = useMemo(() => {
    // Match the teacher's enrollments by ANY known identity: the resolved Teacher
    // row id/name, the account id, and the account teacherName/name. Enrollments
    // may reference the row id while logins carry the account id (or vice versa).
    const idCandidates = [teacherProfile?.id, currentUser?.id]
      .filter(Boolean)
      .map((id) => String(id))
    const nameCandidates = [teacherProfile?.name, currentUser?.teacherName, currentUser?.name]
      .map((n) => (n || '').trim().toLowerCase())
      .filter(Boolean)

    // Flatten enrollments to handle multiple subjects per student for the same teacher
    const matchedEnrollments = students.flatMap((s) =>
      (s.enrollments || [])
        .filter((en) => {
          const enTeacherName = teacherNameOf(en).toLowerCase()
          const enId = en.teacherId != null ? String(en.teacherId) : ''
          const isIdMatch = !!enId && idCandidates.includes(enId)
          const isNameMatch = !!enTeacherName && nameCandidates.includes(enTeacherName)
          return isIdMatch || isNameMatch
        })
        .map((en) => ({
          student: s,
          enrollment: en,
        })),
    )

    const expectedTotal = 16 // Fixed total sessions for percentage calculation
    const teacherStats: TeacherStats = {
      expected: expectedTotal,
      used: matchedEnrollments.reduce((acc, me) => acc + (me.enrollment.sessionsUsed || 0), 0),
      remaining: 0,
      rate: 0,
    }

    teacherStats.remaining = expectedTotal - teacherStats.used
    teacherStats.rate =
      expectedTotal > 0 ? Math.round((teacherStats.used / expectedTotal) * 100) : 0

    return { matchedEnrollments, teacherStats }
  }, [students, currentUser, teacherProfile])

  const uniqueTeachers = useMemo(() => {
    return Array.from(
      new Set(students.flatMap((s) => s.enrollments?.map((e) => teacherNameOf(e)) || [])),
    )
      .filter(Boolean)
      .sort()
  }, [students])

  const uniqueSubjects = useMemo(() => {
    const fromSessions = allSessions.map((s) => s.subject).filter(Boolean)
    const fromEnrollments = students
      .flatMap((s) => s.enrollments?.map((e) => e.subject) || [])
      .filter(Boolean)
    return Array.from(new Set([...fromSessions, ...fromEnrollments])).sort()
  }, [allSessions, students])

  const teacherAttendanceRates = useMemo<TeacherAttendanceRate[]>(() => {
    const rates = uniqueTeachers.map((teacherName) => {
      // Start from enrollments — ensures all students appear even without sessions
      const teacherEnrollments = students.flatMap((s) =>
        (s.enrollments || [])
          .filter((en) => teacherNameOf(en) === teacherName)
          .map((en) => ({ student: s, enrollment: en })),
      )

      // Build student list from enrollments
      const studentMap = new Map<
        string,
        {
          studentId: string
          studentName: string
          subject: string
          completed: number
          total: number
        }
      >()

      teacherEnrollments.forEach(({ student, enrollment }) => {
        const key = `${student.id}-${enrollment.subject}`
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentId: student.id,
            studentName: student.name || '',
            subject: enrollment.subject || '',
            completed: 0,
            total: 0,
          })
        }
      })

      // Overlay session stats
      const teacherSessions = allSessions.filter(
        (s) => (s.teacherName || '').trim() === teacherName,
      )
      teacherSessions.forEach((s) => {
        const key = `${s.studentId}-${s.subject}`
        const entry = studentMap.get(key)
        if (entry) {
          entry.total++
          if (s.status === 'completed') entry.completed++
        } else {
          // Session exists but no enrollment found — still show it
          studentMap.set(key, {
            studentId: s.studentId,
            studentName: s.studentName || '',
            subject: s.subject || '',
            completed: s.status === 'completed' ? 1 : 0,
            total: 1,
          })
        }
      })

      const studentsList = Array.from(studentMap.values()).map((data) => {
        let sCompleted = 0
        let sCancelled = 0
        teacherSessions
          .filter((s) => s.studentId === data.studentId && s.subject === data.subject)
          .forEach((s) => {
            if (s.status === 'completed') sCompleted++
            else if (s.status === 'cancelled') sCancelled++
          })
        const resolved = sCompleted + sCancelled
        return { ...data, rate: resolved > 0 ? Math.round((sCompleted / resolved) * 100) : 0 }
      })

      const completed = teacherSessions.filter((s) => s.status === 'completed').length
      const cancelled = teacherSessions.filter((s) => s.status === 'cancelled').length
      const scheduled = teacherSessions.filter((s) => s.status === 'scheduled').length
      const totalSessions = completed + cancelled + scheduled
      const resolvedSessions = completed + cancelled
      const rate = resolvedSessions > 0 ? Math.round((completed / resolvedSessions) * 100) : 0

      return {
        teacherName,
        totalSessions,
        completed,
        cancelled,
        scheduled,
        rate,
        students: studentsList,
      }
    })
    return rates.sort((a, b) => b.rate - a.rate)
  }, [allSessions, uniqueTeachers, students])

  return {
    students,
    allSessions,
    loading,
    logAttendance,
    updateSchedule: updateScheduleTracked,
    updateScheduleTracked,
    schedulePending,
    updateEnrollmentNotes,
    requestReschedule,
    stats,
    periodStats,
    ...teacherData,
    uniqueTeachers,
    uniqueSubjects,
    teacherAttendanceRates,
    refresh: fetchAll,
  }
}
