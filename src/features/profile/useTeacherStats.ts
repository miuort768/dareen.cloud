import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '../../lib/api'
import type { Session, Student, TeacherInvoice } from '../../types'
import { getPaidInv } from '../dashboard/utils/dashboardHelpers'

interface UseTeacherStatsResult {
  /** جاري تحميل بيانات المؤشرات أول مرة */
  loading: boolean
  /** عدد الحصص المنفذة */
  completedCount: number
  /** صافي الربح الإجمالي بعملة المعلمة = إيرادات الحصص المنفذة − الفواتير المدفوعة */
  profit: number
  currency: string
}

/**
 * مؤشرات المعلمة في ملفها الشخصي — نفس منطق لوحة التحكم:
 * الحصص المنفذة لكل معلمة، والربح الحالي = مجموع قيمة الحصص المنفذة
 * بعملة المعلمة فقط ناقصًا إجمالي فواتير المعلمة المدفوعة بنفس العملة.
 */
export const useTeacherStats = (
  currentUserId?: string,
  teacherName?: string,
  currency?: string,
): UseTeacherStatsResult => {
  const enabled = !!currentUserId
  const results = useQueries({
    queries: [
      { queryKey: ['students'], queryFn: () => api.get<Student[]>('/students'), enabled },
      {
        queryKey: ['sessions'],
        queryFn: () => api.get<Session[]>('/sessions'),
        enabled,
      },
      {
        queryKey: ['teacherInvoices'],
        queryFn: () => api.get<TeacherInvoice[]>('/invoices/me/teacher'),
        enabled,
      },
    ],
  })

  return useMemo<UseTeacherStatsResult>(() => {
    const students = results[0].data ?? []
    const sessions = results[1].data ?? []
    const invoices = results[2].data ?? []
    const loading = enabled && results.some((r) => r.isLoading)

    const targetCurrency = currency || 'EGP'
    const normalizedName = (teacherName || '').trim().toLowerCase()

    const mySessions = sessions.filter(
      (s: Session) =>
        (s.teacherName || '').trim().toLowerCase() === normalizedName ||
        s.teacherId === currentUserId,
    )
    const completed = mySessions.filter((s: Session) =>
      ['completed', 'مكتملة', 'تم الإنجاز'].includes((s.status || '').toLowerCase()),
    )

    const revenue = completed
      .filter((s: Session) => {
        const cur =
          s.studentCurrency ||
          students.find((st: Student) => st.id === s.studentId)?.currency ||
          'EGP'
        return cur === targetCurrency
      })
      .reduce((sum: number, s: Session) => {
        const price =
          s.price ?? students.find((st: Student) => st.id === s.studentId)?.sessionPrice ?? 0
        return sum + (Number(price) || 0)
      }, 0)

    const expenses = getPaidInv(invoices, targetCurrency)

    return {
      loading,
      completedCount: completed.length,
      profit: revenue - expenses,
      currency: targetCurrency,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, enabled, teacherName, currency, currentUserId])
}
