import type { Student, Session, StudentInvoice } from '../../types'

export interface ReportData {
  students: Student[]
  sessions: Session[]
  invoices: StudentInvoice[]
}

/** Shape returned by GET /finance/stats — single source of truth for money numbers */
export interface FinanceStatsSummary {
  totalIncome: number
  monthIncome: number
  totalExpenses: number
  monthExpenses: number
  netProfit: number
  monthProfit: number
  profitMargin: string
  reportCurrency: string
  monthlyData: { month: string; income: number; expense: number }[]
  pieData: { name: string; value: number; fill?: string }[]
}

export type ReportType = 'overview' | 'academic' | 'attendance' | 'financial' | 'enrollment'

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-1)',
  'var(--chart-2)',
]
