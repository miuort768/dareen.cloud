import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import { safeArray } from '../../../lib/api'
import type { ReportData, ReportType } from '../types'
import type { Student, Session, StudentInvoice } from '../../../types'

const EMPTY_DATA: ReportData = { students: [], sessions: [], invoices: [] }

export const useReports = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: reportData = EMPTY_DATA, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsService.getReportData(),
  })

  const data = reportData

  const stats = useMemo(() => {
    const now = new Date()
    // Local month keys — UTC shifting via toISOString mislabels month boundaries
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`

    // General Arrays
    const students = safeArray<Student>(data.students)
    const sessions = safeArray<Session>(data.sessions)
    const invoices = safeArray<StudentInvoice>(data.invoices)

    const totalStudents = students.length
    const totalEnrollments = students.reduce((sum, s) => sum + (s.enrollments?.length || 0), 0)

    // Attendance
    const totalSessions = sessions.length
    const completedSessions = sessions.filter((s) => s.status === 'completed').length
    const cancelledSessions = sessions.filter((s) => s.status === 'cancelled').length
    const attendanceRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

    // Financial calculations
    // Currency policy: reports display EGP — non-EGP sessions excluded (same as dashboard totals).
    const isEgp = (c?: string) => !c || c === 'EGP'

    const totalRevenue = sessions
      .filter((s) => s.status === 'completed' && isEgp(s.studentCurrency))
      .reduce((sum, s) => {
        let price = Number(s.price) || 0
        if (price === 0) {
          const student = students.find((st) => st.id === s.studentId)
          price = Number(student?.sessionPrice) || 0
        }
        return sum + price
      }, 0)

    // Expenses = what the academy owes teachers for completed sessions.
    // Labor cost includes ALL sessions regardless of student currency — the teacher
    // expense is still owed (same policy as the finance page).
    // NOTE: student invoices are collections (revenue), never expenses.
    const teacherCostFromSessions = sessions
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0)

    const totalExpenses = teacherCostFromSessions

    const monthRevenue = sessions
      .filter(
        (s) =>
          s.status === 'completed' &&
          s.date?.startsWith(currentMonthStr) &&
          isEgp(s.studentCurrency),
      )
      .reduce((sum, s) => {
        let price = Number(s.price) || 0
        if (price === 0) {
          const student = students.find((st) => st.id === s.studentId)
          price = Number(student?.sessionPrice) || 0
        }
        return sum + price
      }, 0)

    const prevMonthRevenue = sessions
      .filter(
        (s) =>
          s.status === 'completed' && s.date?.startsWith(prevMonthStr) && isEgp(s.studentCurrency),
      )
      .reduce((sum, s) => {
        let price = Number(s.price) || 0
        if (price === 0) {
          const student = students.find((st) => st.id === s.studentId)
          price = Number(student?.sessionPrice) || 0
        }
        return sum + price
      }, 0)

    const revenueGrowth =
      prevMonthRevenue > 0
        ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : monthRevenue > 0
          ? 100
          : 0

    const monthTeacherCost = sessions
      .filter((s) => s.status === 'completed' && s.date?.startsWith(currentMonthStr))
      .reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0)

    const monthExpenses = monthTeacherCost

    // Months
    const uniqueMonths = Array.from(
      new Set(
        [
          ...sessions.map((s) => s.date?.slice(0, 7)),
          ...invoices.map((inv) => inv.date?.slice(0, 7)),
        ].filter((m): m is string => Boolean(m)),
      ),
    )
      .sort()
      .reverse()

    // Chart Data
    const monthlySessionsData = uniqueMonths
      .slice(0, 6)
      .reverse()
      .map((month) => {
        const monthSessions = sessions.filter((s) => s.date?.startsWith(month))
        return {
          month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
          completed: monthSessions.filter((s) => s.status === 'completed').length,
          cancelled: monthSessions.filter((s) => s.status === 'cancelled').length,
          total: monthSessions.length,
        }
      })

    // Distributions
    const subjectDistribution = students
      .flatMap((s) => s.enrollments || [])
      .reduce(
        (acc, e) => {
          if (e.subject && e.subject.trim()) {
            acc[e.subject.trim()] = (acc[e.subject.trim()] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

    const subjectPieData = Object.entries(subjectDistribution).map(([subject, count]) => ({
      name: subject,
      value: count,
    }))

    // FIX NULL IN GRADE DISTRIBUTION
    const gradeDistribution = students.reduce(
      (acc, s) => {
        const raw = s.grade
        const gradeKey =
          !raw ||
          String(raw).trim() === '' ||
          String(raw).toLowerCase() === 'null' ||
          String(raw).toLowerCase() === 'undefined'
            ? 'غير محدد'
            : String(raw).trim()
        acc[gradeKey] = (acc[gradeKey] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const gradeBarData = Object.entries(gradeDistribution).map(([grade, count]) => ({
      name: grade,
      count,
    }))

    // Teacher Performance
    const teacherPerformance = sessions.reduce(
      (acc, s) => {
        const teacher = s.teacherName && s.teacherName.trim() ? s.teacherName.trim() : 'غير محدد'
        if (!acc[teacher]) {
          acc[teacher] = { total: 0, completed: 0, cancelled: 0 }
        }
        acc[teacher]!.total++
        if (s.status === 'completed') acc[teacher]!.completed++
        if (s.status === 'cancelled') acc[teacher]!.cancelled++
        return acc
      },
      {} as Record<string, { total: number; completed: number; cancelled: number }>,
    )

    const teacherPerformanceData = Object.entries(teacherPerformance).map(([teacher, stats]) => ({
      teacher,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }))

    // Student Progress
    const studentProgressData = students.map((student) => {
      const tSessions =
        student.enrollments?.reduce((sum, e) => sum + (e.sessionsTotal || 0), 0) || 0
      const uSessions = student.enrollments?.reduce((sum, e) => sum + (e.sessionsUsed || 0), 0) || 0
      const progress = tSessions > 0 ? Math.round((uSessions / tSessions) * 100) : 0

      const rawGrade = student.grade
      const grade =
        !rawGrade ||
        String(rawGrade).trim() === '' ||
        String(rawGrade).toLowerCase() === 'null' ||
        String(rawGrade).toLowerCase() === 'undefined'
          ? 'غير محدد'
          : String(rawGrade).trim()

      return {
        id: student.id,
        name: student.name,
        grade,
        totalEnrollments: student.enrollments?.length || 0,
        totalSessions: tSessions,
        usedSessions: uSessions,
        progress,
      }
    })

    return {
      totalStudents,
      totalEnrollments,
      totalSessions,
      completedSessions,
      cancelledSessions,
      attendanceRate,
      totalRevenue,
      totalExpenses,
      monthRevenue,
      monthExpenses,
      revenueGrowth,
      monthlySessionsData,
      subjectPieData,
      gradeBarData,
      teacherPerformanceData,
      studentProgressData,
    }
  }, [data])

  const filteredStudentProgress = useMemo(() => {
    return stats.studentProgressData.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.grade.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [stats.studentProgressData, searchTerm])

  return {
    state: {
      loading: isLoading,
      activeReport,
      searchTerm,
      ...stats,
    },
    actions: {
      setActiveReport,
      setSearchTerm,
    },
    filtered: {
      studentProgress: filteredStudentProgress,
    },
  }
}
