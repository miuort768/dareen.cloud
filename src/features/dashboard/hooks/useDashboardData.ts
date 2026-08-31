import { useMemo } from 'react'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { User } from '../../../types/auth'
import type {
  Student,
  Teacher,
  Parent,
  Session,
  TeacherInvoice,
  StudentInvoice,
  Transaction,
  FixedExpense,
  Enrollment,
  ScheduleSlot,
} from '../../../types'
import type { DashboardStats, DashboardTask } from '../types'
import {
  getSafeArray,
  isSameMonth,
  computeLowBalanceStudents,
  computeChartData,
  getPaidInv,
  getManualExp,
} from '../utils/dashboardHelpers'
import { normalizeDayName } from '../../attendance/utils/slotUtils'
import { INVOICE_STATUS, normalizeInvoiceStatus } from '../../../types/invoice'

export const useDashboardData = (currentUser: User | null) => {
  const queryClient = useQueryClient()

  const enabled = !!currentUser
  const isTeacher = currentUser?.role === 'teacher'

  const results = useQueries({
    queries: [
      {
        queryKey: ['students'],
        queryFn: () => api.get<Student[]>('/students'),
        staleTime: 5 * 60 * 1000,
        enabled,
      },
      {
        queryKey: ['teachers'],
        queryFn: () => api.get<Teacher[]>('/teachers'),
        staleTime: 5 * 60 * 1000,
        enabled: enabled && !isTeacher,
      },
      {
        queryKey: ['teacherMe'],
        queryFn: () => api.get<Teacher>('/teachers/me'),
        staleTime: 5 * 60 * 1000,
        enabled: enabled && isTeacher,
      },
      {
        queryKey: ['parents'],
        queryFn: () => api.get<Parent[]>('/parents'),
        staleTime: 5 * 60 * 1000,
        enabled: enabled && !isTeacher,
      },
      {
        queryKey: ['sessions'],
        queryFn: () => api.get<Session[]>('/sessions'),
        staleTime: 1 * 60 * 1000,
        enabled,
      },
      {
        queryKey: ['teacherInvoices'],
        queryFn: () =>
          api.get<TeacherInvoice[]>(isTeacher ? '/invoices/me/teacher' : '/invoices/teacher'),
        staleTime: 5 * 60 * 1000,
        enabled,
      },
      {
        queryKey: ['studentInvoices'],
        queryFn: () => api.get<StudentInvoice[]>('/invoices/student'),
        staleTime: 5 * 60 * 1000,
        enabled: enabled && !isTeacher,
      },
      {
        queryKey: ['tasks'],
        queryFn: () => api.get<DashboardTask[]>('/tasks'),
        staleTime: 1 * 60 * 1000,
        enabled,
      },
      {
        queryKey: ['transactions'],
        queryFn: () => api.get<Transaction[]>('/finance/transactions'),
        staleTime: 5 * 60 * 1000,
        enabled: enabled && !isTeacher,
      },
      {
        queryKey: ['fixedExpenses'],
        queryFn: () => api.get<FixedExpense[]>('/finance/fixed-expenses'),
        staleTime: 5 * 60 * 1000,
        enabled: enabled && !isTeacher,
      },
      {
        queryKey: ['evaluations'],
        queryFn: () => api.get<Record<string, unknown>[]>('/evaluations'),
        staleTime: 1 * 60 * 1000,
        enabled,
      },
    ],
  })

  const [
    studentsQuery,
    teachersQuery,
    teacherMeQuery,
    parentsQuery,
    sessionsQuery,
    teacherInvoicesQuery,
    studentInvoicesQuery,
    tasksQuery,
    transactionsQuery,
    fixedExpensesQuery,
    evaluationsQuery,
  ] = results

  const isLoading = results.some((r) => r.isLoading)
  const hasErrors = results.some((r) => r.isError)

  // Process Data
  const processedData = useMemo(() => {
    if (isLoading || !currentUser) return null

    const students = getSafeArray(studentsQuery.data) as Student[]
    const teachers = getSafeArray(teachersQuery.data) as Teacher[]
    const teacherMe = teacherMeQuery.data as Teacher | undefined
    const parents = getSafeArray(parentsQuery.data) as Parent[]
    const sessions = getSafeArray(sessionsQuery.data) as Session[]
    const teacherInvoices = getSafeArray(teacherInvoicesQuery.data) as TeacherInvoice[]
    const studentInvoices = getSafeArray(studentInvoicesQuery.data) as StudentInvoice[]
    const transactions = getSafeArray(transactionsQuery.data) as Transaction[]
    const fixedExpenses = getSafeArray(fixedExpensesQuery.data) as FixedExpense[]
    const evaluations = getSafeArray(evaluationsQuery.data) as {
      studentId: string
      teacherId?: string
      date?: string
      rating?: string
    }[]

    const isTeacher = currentUser.role === 'teacher'
    const teacherName = currentUser.teacherName || currentUser.name

    // 1. Filter based on role
    const normalizedCurrentUserTeacherName = (teacherName || '').trim().toLowerCase()

    const filteredSessions = isTeacher
      ? sessions.filter(
          (s: Session) =>
            s.teacherName?.trim().toLowerCase() === normalizedCurrentUserTeacherName ||
            (s.teacherId && s.teacherId === currentUser.id),
        )
      : sessions

    const filteredStudents = isTeacher
      ? students.filter((s: Student) =>
          s.enrollments?.some((e: Enrollment) => {
            const tName = typeof e.teacher === 'string' ? e.teacher.trim().toLowerCase() : ''
            return (
              tName === normalizedCurrentUserTeacherName ||
              (!!e.teacherId && e.teacherId === currentUser.id)
            )
          }),
        )
      : students

    // 2. Dates
    const now = new Date()
    const today = new Date().toLocaleDateString('en-CA') // تاريخ محلي صحيح قرب منتصف الليل
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const currentDayName = dayNames[now.getDay()]

    // 3. Sessions & Performance
    const completedSessions = filteredSessions.filter((s: Session) =>
      ['completed', 'مكتملة', 'تم الإنجاز'].includes(s.status?.toLowerCase()),
    )
    const monthComplete = completedSessions.filter((s: Session) => isSameMonth(s.date, now))

    // Today's Scheduled via Schedule logic
    let todayScheduledCount = 0
    filteredStudents.forEach((s: Student) => {
      s.enrollments?.forEach((en: Enrollment) => {
        if (isTeacher && en.teacher !== teacherName && en.teacherId !== currentUser.id) return
        en.schedule?.forEach((slot: ScheduleSlot) => {
          if (normalizeDayName(slot.day) === currentDayName) todayScheduledCount++
        })
      })
    })

    // 4. Financials — currency-aware computation
    // Determine target currency: teacher uses their own currency, admin uses EGP (server converts)
    const targetCurrency = isTeacher ? teacherMe?.currency || 'EGP' : 'EGP'

    const getSessionRev = (s: Session) => {
      if (s.price !== null && s.price !== undefined) return Number(s.price)
      const stu = students.find((st: Student) => st.id === s.studentId)
      return Number(stu?.sessionPrice) || 0
    }

    const getSessionCur = (s: Session): string => {
      return (
        s.studentCurrency ||
        students.find((st: Student) => st.id === s.studentId)?.currency ||
        'EGP'
      )
    }

    const fixedTotal = fixedExpenses.reduce(
      (sum: number, item: FixedExpense) => sum + (Number(item.amount) || 0),
      0,
    )

    // Sum revenue only in target currency (avoids mixing KWD+EGP etc.)
    const totalRevenueValue =
      completedSessions
        .filter((s: Session) => getSessionCur(s) === targetCurrency)
        .reduce((sum: number, s: Session) => sum + getSessionRev(s), 0) +
      transactions
        .filter((t: Transaction) => t.type === 'income' && (t.currency || 'EGP') === targetCurrency)
        .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0)

    const monthRevenueValue =
      monthComplete
        .filter((s: Session) => getSessionCur(s) === targetCurrency)
        .reduce((sum: number, s: Session) => sum + getSessionRev(s), 0) +
      transactions
        .filter(
          (t: Transaction) =>
            t.type === 'income' &&
            isSameMonth(t.date, now) &&
            (t.currency || 'EGP') === targetCurrency,
        )
        .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0)

    const totalExpensesValue = isTeacher
      ? getPaidInv(
          teacherInvoices.filter(
            (inv: TeacherInvoice) => (inv.currency || 'EGP') === targetCurrency,
          ),
        ) +
        transactions
          .filter(
            (t: Transaction) => t.type === 'expense' && (t.currency || 'EGP') === targetCurrency,
          )
          .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0)
      : getPaidInv(teacherInvoices, targetCurrency) +
        getManualExp(transactions, targetCurrency) +
        fixedTotal

    const monthExpensesValue = isTeacher
      ? getPaidInv(
          teacherInvoices.filter(
            (inv: TeacherInvoice) =>
              isSameMonth(inv.date, now) && (inv.currency || 'EGP') === targetCurrency,
          ),
        ) +
        transactions
          .filter(
            (t: Transaction) =>
              t.type === 'expense' &&
              isSameMonth(t.date, now) &&
              (t.currency || 'EGP') === targetCurrency,
          )
          .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0)
      : getPaidInv(
          teacherInvoices.filter((inv: TeacherInvoice) => isSameMonth(inv.date, now)),
          targetCurrency,
        ) +
        getManualExp(
          transactions.filter((t: Transaction) => isSameMonth(t.date, now)),
          targetCurrency,
        ) +
        fixedTotal

    const totalNetProfitValue = totalRevenueValue - totalExpensesValue
    const monthNetProfitValue = monthRevenueValue - monthExpensesValue

    // 5. Chart Data — local month keys (UTC shift mislabels first-day sessions)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })

    const chartData = computeChartData(
      last6Months,
      filteredSessions,
      transactions,
      teacherInvoices,
      fixedTotal,
      isTeacher,
      now,
      students,
      targetCurrency,
    )

    // 6. Low Balance
    const { lowBalance, anticipatedCollection } = computeLowBalanceStudents(
      filteredStudents,
      sessions,
      teacherName,
      currentUser.id,
      isTeacher,
    )

    // 6b. Focus List
    const focusStudentsList: {
      id: string
      name: string
      reason: string
      type: 'attendance' | 'performance' | 'engagement'
    }[] = []
    filteredStudents.forEach((s: Student) => {
      const stuSessions = filteredSessions.filter((ss: Session) => ss.studentId === s.id)
      const stuCompleted = stuSessions.filter((ss: Session) =>
        ['completed', 'مكتملة', 'تم الإنجاز'].includes(ss.status?.toLowerCase()),
      )
      const attendanceRate = stuSessions.length >= 3 ? stuCompleted.length / stuSessions.length : 1

      const stuEvals = isTeacher
        ? evaluations.filter((e) => e.studentId === s.id && e.teacherId === currentUser.id)
        : evaluations.filter((e) => e.studentId === s.id)
      const lastEval = [...stuEvals].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]
      const needsEval =
        stuCompleted.length > 0 &&
        (!lastEval?.date ||
          now.getTime() - new Date(lastEval.date).getTime() > 7 * 24 * 60 * 60 * 1000)

      if (attendanceRate < 0.7) {
        focusStudentsList.push({
          id: s.id,
          name: s.name,
          reason: `نسبة الحضور منخفضة (${Math.round(attendanceRate * 100)}%)`,
          type: 'attendance',
        })
      } else if (lastEval && (lastEval.rating === 'ضعيف' || lastEval.rating === 'مقبول')) {
        focusStudentsList.push({
          id: s.id,
          name: s.name,
          reason: `آخر تقييم: ${lastEval.rating}`,
          type: 'performance',
        })
      } else if (needsEval) {
        focusStudentsList.push({
          id: s.id,
          name: s.name,
          reason: 'لم يتم التقييم منذ أسبوع',
          type: 'engagement',
        })
      }
    })

    // 7b. Week load — scheduled slots per day for the next 7 days (teacher view)
    const weekCounts = [0, 0, 0, 0, 0, 0, 0]
    if (isTeacher) {
      filteredStudents.forEach((s: Student) => {
        s.enrollments?.forEach((en: Enrollment) => {
          if (en.teacher !== teacherName && en.teacherId !== currentUser.id) return
          en.schedule?.forEach((slot: ScheduleSlot) => {
            const idx = dayNames.indexOf(normalizeDayName(slot.day))
            if (idx === -1) return
            const dayOffset = (idx - now.getDay() + 7) % 7
            weekCounts[dayOffset]++
          })
        })
      })
    }

    // 8. Stats Object
    const stats: DashboardStats = {
      studentsCount: filteredStudents.length,
      teachersCount: teachers.length,
      parentsCount: parents.length,
      totalEnrollments: filteredStudents.reduce(
        (sum: number, s: Student) =>
          sum +
          (isTeacher
            ? s.enrollments?.filter(
                (en: Enrollment) =>
                  en.teacher === teacherName || (en.teacherId && en.teacherId === currentUser.id),
              ).length || 0
            : s.enrollments?.length || 0),
        0,
      ),
      totalRevenue: totalRevenueValue,
      totalExpenses: totalExpensesValue,
      totalNetProfit: totalNetProfitValue,
      monthRevenue: monthRevenueValue,
      monthExpenses: monthExpensesValue,
      monthNetProfit: monthNetProfitValue,
      todaySessions: todayScheduledCount,
      completedSessions: completedSessions.length,
      cancelledSessions: filteredSessions.filter((s: Session) =>
        ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(s.status?.toLowerCase()),
      ).length,
      attendanceRate:
        filteredSessions.length > 0
          ? Math.round((completedSessions.length / filteredSessions.length) * 100)
          : 0,
      lowBalanceCount: lowBalance.length,
      expectedCollection: anticipatedCollection,
      currency: targetCurrency,
      totalSessions: filteredSessions.length,
      monthCompletedSessions: monthComplete.length,
      monthTotalSessions: filteredSessions.filter(
        (s: Session) =>
          isSameMonth(s.date, now) &&
          ['scheduled', 'مجدولة', 'completed', 'مكتملة', 'تم الإنجاز'].includes(
            s.status?.toLowerCase() || '',
          ),
      ).length,

      pendingInvoices: studentInvoices.filter((inv: StudentInvoice) =>
        ['pending', 'overdue', 'unpaid', 'partially_paid'].includes(
          normalizeInvoiceStatus(inv.status),
        ),
      ).length,
      paidInvoices: studentInvoices.filter(
        (inv: StudentInvoice) => normalizeInvoiceStatus(inv.status) === INVOICE_STATUS.PAID,
      ).length,

      teacherPoints: isTeacher
        ? (teacherMe?.points ?? teachers.find((t: Teacher) => t.id === currentUser.id)?.points) || 0
        : undefined,
      weekTotalSessions: isTeacher
        ? filteredSessions.filter((s: Session) => {
            const sDate = new Date(s.date)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return sDate >= weekAgo && s.status === 'completed'
          }).length
        : undefined,
      newBadgesRecommended: isTeacher
        ? (
            getSafeArray(tasksQuery.data) as { teacherId: string; type: string; status?: string }[]
          ).filter(
            (t) =>
              t.teacherId === currentUser.id &&
              t.type === 'badge_suggestion' &&
              ['pending', 'في انتظار الموافقة', 'جديدة', 'new'].includes(
                String(t.status ?? '').toLowerCase(),
              ),
          ).length
        : undefined,
      bestStudentName:
        isTeacher && filteredStudents.length > 0
          ? [...filteredStudents].sort(
              (a: Student, b: Student) =>
                (Number(b.totalPoints) || 0) - (Number(a.totalPoints) || 0),
            )[0]?.name
          : undefined,
      todayTimeline: isTeacher
        ? (() => {
            // Start with actual Session records for today
            const sessionTimeline = filteredSessions
              .filter((s: Session) => s.date === today)
              .map((s: Session) => ({
                id: s.id,
                studentId: s.studentId,
                studentName: s.studentName,
                time: s.time,
                subject: s.subject,
                status: s.status,
              }))

            // Also add schedule-based upcoming sessions from enrollments
            const existingStudentIds = new Set(
              sessionTimeline
                .filter((s) => s.status === 'scheduled' || String(s.status) === 'in-progress')
                .map((s) => s.studentId),
            )

            const nowMinutes = now.getHours() * 60 + now.getMinutes()
            const scheduleTimeline: {
              id: string
              studentId?: string
              studentName: string
              time: string
              subject: string
              status: string
            }[] = []

            filteredStudents.forEach((s: Student) => {
              s.enrollments?.forEach((en: Enrollment) => {
                if (isTeacher && en.teacher !== teacherName && en.teacherId !== currentUser.id)
                  return
                en.schedule?.forEach((slot: ScheduleSlot) => {
                  if (normalizeDayName(slot.day) !== currentDayName) return
                  // Skip if this student already has a scheduled/in-progress Session record
                  if (existingStudentIds.has(s.id)) return
                  // Parse slot hour to check if it's still upcoming
                  const [h, m] = (slot.hour || '0:0').split(':').map(Number)
                  const slotMinutes = (h || 0) * 60 + (m || 0)
                  if (slotMinutes <= nowMinutes) return // Already passed
                  scheduleTimeline.push({
                    id: `schedule-${s.id}-${slot.hour}`,
                    studentId: s.id,
                    studentName: s.name,
                    time: slot.hour || '',
                    subject: en.subject || 'دورة',
                    status: 'scheduled',
                  })
                })
              })
            })

            return [...sessionTimeline, ...scheduleTimeline]
          })()
        : undefined,
      teacherSessionPrice: isTeacher
        ? (teacherMe?.price ?? teachers.find((t: Teacher) => t.id === currentUser.id)?.price) || 0
        : undefined,
      evaluationsCompleted: isTeacher
        ? filteredSessions.filter(
            (s: Session) => s.status === 'completed' && s.topics && s.topics !== '',
          ).length
        : undefined,
    }

    return {
      stats,
      todaySessions: filteredSessions.filter((s: Session) => s.date === today),
      monthlyData: chartData,
      lowBalanceStudents: lowBalance,
      weekCounts,
      tasks: (getSafeArray(tasksQuery.data) as unknown as DashboardTask[]).filter((t) =>
        [
          'pending',
          'في انتظار الموافقة',
          'جديدة',
          'new',
          'in-progress',
          'قيد التنفيذ',
          'جاري',
        ].includes(String(t.status ?? '').toLowerCase()),
      ),
      topStudents: isTeacher
        ? filteredStudents
            .sort(
              (a: Student, b: Student) =>
                (Number(b.totalPoints) || 0) - (Number(a.totalPoints) || 0),
            )
            .slice(0, 5)
        : [],
      focusStudents: focusStudentsList,
    }
  }, [
    isLoading,
    currentUser,
    studentsQuery.data,
    teachersQuery.data,
    parentsQuery.data,
    sessionsQuery.data,
    teacherInvoicesQuery.data,
    studentInvoicesQuery.data,
    tasksQuery.data,
    transactionsQuery.data,
    fixedExpensesQuery.data,
    evaluationsQuery.data,
    teacherMeQuery.data,
  ])

  return {
    stats: processedData?.stats || {
      studentsCount: 0,
      teachersCount: 0,
      parentsCount: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      totalNetProfit: 0,
      monthRevenue: 0,
      monthExpenses: 0,
      monthNetProfit: 0,
      todaySessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      attendanceRate: 0,
      pendingInvoices: 0,
      paidInvoices: 0,
      lowBalanceCount: 0,
      expectedCollection: 0,
      totalSessions: 0,
      monthCompletedSessions: 0,
      monthTotalSessions: 0,
    },
    todaySessions: processedData?.todaySessions || [],
    monthlyData: processedData?.monthlyData || [],
    lowBalanceStudents: processedData?.lowBalanceStudents || [],
    weekCounts: processedData?.weekCounts || [0, 0, 0, 0, 0, 0, 0],
    tasks: processedData?.tasks || [],
    topStudents: processedData?.topStudents || [],
    focusStudents: processedData?.focusStudents || [],
    loading: isLoading,
    rawStudents: getSafeArray(studentsQuery.data),
    rawSessions: getSafeArray(sessionsQuery.data) as Session[],
    rawStudentInvoices: getSafeArray(studentInvoicesQuery.data),
    isLoading,
    hasErrors,
    fetchDashboardData: () => queryClient.invalidateQueries(),
  }
}
