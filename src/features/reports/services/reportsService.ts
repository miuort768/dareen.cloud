import { api } from '../../../lib/api'
import type { ReportData, FinanceStatsSummary } from '../types'
import type { Student, Session, StudentInvoice } from '../../../types'

export const reportsService = {
  async getReportData(): Promise<ReportData> {
    const [students, sessions, invoices] = await Promise.all([
      api.get<Student[]>('/students'),
      api.get<Session[]>('/sessions'),
      api.get<StudentInvoice[]>('/invoices'),
    ])

    return {
      students,
      sessions,
      invoices,
    }
  },

  /**
   * Server-computed money numbers (currency conversion, invoice states, fixed
   * expenses) — same endpoint the Finance page uses, so both pages agree.
   */
  async getFinanceStats(): Promise<FinanceStatsSummary> {
    return api.get<FinanceStatsSummary>('/finance/stats')
  },
}
