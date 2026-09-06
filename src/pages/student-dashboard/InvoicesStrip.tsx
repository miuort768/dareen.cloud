import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, ArrowLeft } from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser } from '../../context/AppContext'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { normalizeInvoiceStatus } from '../../types/invoice'

interface StudentInvoice {
  id: string
  studentId: string
  amount: number
  description: string
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  currency?: string
}

export const InvoicesStrip = () => {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const [invoices, setInvoices] = useState<StudentInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchInvoices = async () => {
      try {
        const data = await api.get<StudentInvoice[]>('/invoices/me/student')
        const all = Array.isArray(data) ? data : []
        const mine = all.filter((inv) => inv.studentId === currentUser?.id)
        if (!cancelled) setInvoices(mine)
      } catch {
        // silent — invoices are non-critical
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    if (currentUser?.id) fetchInvoices()
    return () => {
      cancelled = true
    }
  }, [currentUser?.id])

  if (isLoading || invoices.length === 0) return null

  const pending = invoices.filter((i) =>
    ['pending', 'overdue', 'unpaid', 'partially_paid'].includes(normalizeInvoiceStatus(i.status)),
  )
  const totalPending = pending.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  return (
    <button
      onClick={() => navigate('/student-invoices')}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-start shadow-sm transition-all duration-normal hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]"
      aria-label={`الفواتير: ${pending.length} فاتورة معلقة، الإجمالي ${totalPending.toFixed(3)} ${CURRENCY_SYMBOL}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft">
        <Receipt size={17} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-main">الفواتير</p>
        <p className="text-[11px] font-bold text-muted">{pending.length} فاتورة معلقة</p>
      </div>
      <div className="shrink-0 rounded-2xl bg-primary-soft px-3 py-1.5 text-[11px] font-black tabular-nums text-primary">
        {totalPending.toFixed(3)} {CURRENCY_SYMBOL}
      </div>
      <ArrowLeft size={14} className="shrink-0 text-muted" />
    </button>
  )
}
