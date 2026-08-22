import { useState, useEffect } from 'react'
import { Receipt, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useCurrentUser } from '../../context/AppContext'
import { CURRENCY_SYMBOL } from '@/config/constants'

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

export const InvoicesCard = () => {
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

  const pending = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue')
  const totalPending = pending.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="rounded-3xl border border-border/50 shadow-sm bg-surface p-5 transition-colors duration-300 dark:border-primary/20 dark:bg-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <Receipt size={14} className="text-primary dark:text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main dark:text-main">الفواتير</h3>
            <p className="text-[11px] text-muted dark:text-muted">{pending.length} فاتورة معلقة</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/student-invoices')}
          className="flex items-center gap-1 text-xs font-semibold text-primary transition-all hover:underline dark:text-primary"
        >
          عرض الكل <ArrowLeft size={10} className="rtl:rotate-180" />
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary-soft p-3 dark:border-primary/10 dark:bg-primary/5">
        <span className="text-[11px] font-medium text-muted dark:text-muted">المبلغ المطلوب</span>
        <span className="text-sm font-bold text-primary dark:text-primary">
          {totalPending.toFixed(3)} {CURRENCY_SYMBOL}
        </span>
      </div>
    </div>
  )
}
