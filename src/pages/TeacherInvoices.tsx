import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Plus, RefreshCw, FileText, AlertCircle } from 'lucide-react'
import { ConfirmModal } from '../shared/components/ConfirmModal'
import { api } from '../lib/api'
import { CURRENCY_SYMBOL } from '../config/constants'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import {
  type TeacherInvoice,
  type Teacher,
  type TeacherInvoiceFormData,
  INVOICE_STATUS,
  normalizeInvoiceStatus,
} from '../types/invoice'
import { PageLoader } from '../components/ui/PageLoader'
import { InvoiceStats } from './teacher-invoices/components/InvoiceStats'
import { InvoiceForm } from './teacher-invoices/components/InvoiceForm'
import { InvoiceTable } from './teacher-invoices/components/InvoiceTable'
import { TeacherInvoicesHeader } from './teacher-invoices/teacher-invoices-page'
import { cn } from '../lib/utils'

export const TeacherInvoices = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `فواتير المعلمات | ${academyName}`
  }, [academyName])
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [, setIsDeletingAll] = useState(false)
  const [formData, setFormData] = useState<TeacherInvoiceFormData>({
    teacherId: '',
    teacher: '',
    specialization: '',
    amount: '',
    paymentMethod: '',
    status: INVOICE_STATUS.PROCESSING,
    personalExpenses: '',
    currency: 'EGP',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
  })
  const [fabOpen, setFabOpen] = useState(false)
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const isTeacher = currentUser?.role === 'teacher'
  const teacherName = currentUser?.teacherName || currentUser?.name
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    isDestructive?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: true,
  })

  const { data: invoicesData, isLoading: loading } = useQuery({
    queryKey: ['teacher-invoices'],
    queryFn: async () => {
      const [invData, teaData] = await Promise.all([
        api.get<TeacherInvoice[]>(isTeacher ? '/invoices/me/teacher' : '/invoices/teacher'),
        api.get<Teacher[]>('/teachers'),
      ])
      const formattedData = (
        Array.isArray(invData) ? invData : (invData as { data?: TeacherInvoice[] }).data || []
      ).map((item) => ({ ...item, id: String(item.id) }))
      const teachersData = Array.isArray(teaData)
        ? teaData
        : (teaData as { data?: Teacher[] }).data || []
      return { invoices: formattedData, teachers: teachersData }
    },
  })

  const invoices = useMemo(() => invoicesData?.invoices ?? [], [invoicesData])
  const teachers = useMemo(() => invoicesData?.teachers ?? [], [invoicesData])

  const invalidateInvoices = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['teacher-invoices'] })
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await api.post('/invoices/teacher', data)
    },
    onSuccess: () => {
      invalidateInvoices()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await api.put(`/invoices/teacher/${id}`, data)
    },
    onSuccess: () => {
      invalidateInvoices()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/teacher/${id}`)
    },
    onSuccess: () => {
      invalidateInvoices()
    },
  })

  const handleImportTeachers = useCallback(async () => {
    try {
      const [teachersList, allSessions] = await Promise.all([
        api.get<Teacher[]>('/teachers'),
        api.get<
          {
            id?: string
            teacherId?: string
            teacherName?: string
            teacherPrice?: number
            status?: string
          }[]
        >('/sessions'),
      ])
      const currentTeacherNames = new Set(invoices.map((inv) => inv.teacher))
      const teachersToImport = teachersList.filter((t) => !currentTeacherNames.has(t.name))
      if (teachersToImport.length === 0) {
        setConfirmModal({
          isOpen: true,
          title: 'لا يوجد معلمون جدد',
          message: 'جميع المعلمين المسجلين موجودون بالفعل في الفواتير.',
          isDestructive: false,
          onConfirm: () => {},
        })
        return
      }
      setConfirmModal({
        isOpen: true,
        title: 'استيراد المعلمات',
        message: `سيتم استيراد ${teachersToImport.length} معلمة جديد إلى الفواتير. هل تريد المتابعة؟`,
        isDestructive: false,
        onConfirm: async () => {
          try {
            setIsSaving(true)
            await Promise.all(
              teachersToImport.map((t) => {
                const teacherSessions = allSessions.filter(
                  (sess) =>
                    (sess.teacherId === t.id || sess.teacherName === t.name) &&
                    sess.status === 'completed',
                )
                const totalAmount = teacherSessions.reduce(
                  (sum, sess) => sum + (sess.teacherPrice || t.price || 0),
                  0,
                )
                return api.post('/invoices/teacher', {
                  teacherId: t.id || null,
                  teacher: t.name,
                  specialization: t.subject || '',
                  amount: totalAmount,
                  paymentMethod: 'نقدي',
                  status: INVOICE_STATUS.PROCESSING,
                  personalExpenses: 0,
                  currency: 'EGP',
                  date: new Date().toISOString().split('T')[0],
                })
              }),
            )
            invalidateInvoices()
            showNotification(`تم استيراد ${teachersToImport.length} معلمة بنجاح`, 'success')
          } catch (error) {
            console.error('Error importing teachers:', error)
            showNotification('فشل استيراد المعلمات', 'error')
          } finally {
            setIsSaving(false)
          }
        },
      })
    } catch (error) {
      console.error('Error during import process:', error)
      showNotification('فشل تحميل بيانات المعلمات', 'error')
    }
  }, [invoices, invalidateInvoices, showNotification])

  const handleFabAction = useCallback(
    (action: string) => {
      setFabOpen(false)
      switch (action) {
        case 'add':
          if (!isTeacher) setShowForm(!showForm)
          break
        case 'import':
          if (!isTeacher) handleImportTeachers()
          break
        case 'print':
          window.print()
          break
      }
    },
    [isTeacher, showForm, handleImportTeachers],
  )

  const filteredInvoices = useMemo(() => {
    let list = invoices
    if (isTeacher)
      list = list.filter(
        (inv) =>
          (inv.teacherId && inv.teacherId === currentUser?.id) ||
          (inv.teacher && inv.teacher.trim().toLowerCase() === teacherName?.trim().toLowerCase()),
      )
    return list.filter((invoice) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        (invoice.teacher || '').toLowerCase().includes(q) ||
        (invoice.specialization || '').toLowerCase().includes(q)
      const matchesStatus =
        filterStatus === 'all' || normalizeInvoiceStatus(invoice.status) === filterStatus
      const matchesDate = !invoice.date || (invoice.date >= startDate && invoice.date <= endDate)
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, searchTerm, filterStatus, startDate, endDate, isTeacher, teacherName, currentUser])

  // Currency policy: admin scope sums EGP only; teacher scope sums the dominant
  // currency of their own invoices. Others excluded from totals (warning shown).
  const { mixedCount, scopedInvoices } = useMemo(() => {
    const byCur: Record<string, number> = {}
    invoices.forEach((inv) => {
      const c = inv.currency || 'EGP'
      byCur[c] = (byCur[c] || 0) + (Number(inv.amount) || 0)
    })
    const entries = Object.entries(byCur).sort((a, b) => b[1] - a[1])
    const target = isTeacher ? entries[0]?.[0] || 'EGP' : 'EGP'
    const scoped = invoices.filter((inv) => (inv.currency || 'EGP') === target)
    return { mixedCount: invoices.length - scoped.length, scopedInvoices: scoped }
  }, [invoices, isTeacher])

  const stats = useMemo(() => {
    const result = scopedInvoices.reduce(
      (acc, inv) => {
        acc.totalAmount += inv.amount
        acc.personalExpenses += inv.personalExpenses || 0
        if (normalizeInvoiceStatus(inv.status) === INVOICE_STATUS.PAID) acc.paidAmount += inv.amount
        else acc.unpaidAmount += inv.amount
        return acc
      },
      { totalAmount: 0, paidAmount: 0, unpaidAmount: 0, personalExpenses: 0 },
    )
    const unpaidPercentage =
      result.totalAmount > 0 ? Math.round((result.unpaidAmount / result.totalAmount) * 100) : 0
    return { totalTeachers: scopedInvoices.length, ...result, unpaidPercentage }
  }, [scopedInvoices])

  const handleEdit = useCallback(
    (invoice: TeacherInvoice) => {
      setEditingId(invoice.id)
      const teacherObj = teachers.find((t) => t.name === invoice.teacher)
      setFormData({
        teacherId: teacherObj?.id || '',
        teacher: invoice.teacher,
        specialization: invoice.specialization,
        amount: invoice.amount.toString(),
        paymentMethod: invoice.paymentMethod,
        status: invoice.status,
        personalExpenses: invoice.personalExpenses ? invoice.personalExpenses.toString() : '',
        currency: invoice.currency || 'EGP',
      })
      setShowForm(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [teachers],
  )

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setFormData({
      teacherId: '',
      teacher: '',
      specialization: '',
      amount: '',
      paymentMethod: '',
      status: INVOICE_STATUS.PROCESSING,
      personalExpenses: '',
      currency: 'EGP',
    })
    setShowForm(false)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSaving(true)
      const amountValue = parseFloat(formData.amount) || 0
      const personalExpValue = parseFloat(formData.personalExpenses) || 0
      const invoiceData = {
        teacherId: formData.teacherId || null,
        teacher: formData.teacher,
        specialization: formData.specialization,
        amount: amountValue,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        personalExpenses: personalExpValue,
        currency: formData.currency || 'EGP',
        date: new Date().toISOString().split('T')[0],
      }
      try {
        if (editingId)
          await updateMutation.mutateAsync({
            id: editingId,
            data: { ...invoiceData, id: editingId },
          })
        else await createMutation.mutateAsync(invoiceData)
        handleCancel()
        showNotification(
          editingId ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح',
          'success',
        )
      } catch (error) {
        console.error('Error saving invoice:', error)
        showNotification('فشل حفظ الفاتورة', 'error')
      } finally {
        setIsSaving(false)
      }
    },
    [formData, editingId, handleCancel, createMutation, updateMutation, showNotification],
  )

  const handleDelete = useCallback(
    (id: string) => {
      setConfirmModal({
        isOpen: true,
        title: 'حذف الفاتورة',
        message: 'هل أنت متأكد من أنك تريد حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.',
        isDestructive: true,
        onConfirm: async () => {
          try {
            await deleteMutation.mutateAsync(id)
            showNotification('تم حذف الفاتورة بنجاح', 'success')
          } catch (error) {
            console.error('Error deleting invoice:', error)
            showNotification('فشل حذف الفاتورة', 'error')
          }
        },
      })
    },
    [deleteMutation, showNotification],
  )

  const handleDeleteAll = useCallback(() => {
    if (invoices.length === 0) return
    setConfirmModal({
      isOpen: true,
      title: 'حذف جميع الفواتير',
      message: `هل أنت متأكد من حذف جميع الفواتير (${invoices.length})؟ لا يمكن التراجع عن هذا الإجراء.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          setIsDeletingAll(true)
          await Promise.all(invoices.map((inv) => api.delete(`/invoices/teacher/${inv.id}`)))
          invalidateInvoices()
          showNotification('تم حذف جميع الفواتير بنجاح', 'success')
        } catch (error) {
          console.error('Error deleting all invoices:', error)
          showNotification('فشل حذف جميع الفواتير', 'error')
        } finally {
          setIsDeletingAll(false)
        }
      },
    })
  }, [invoices, invalidateInvoices, showNotification])

  const fabActions = useMemo(
    () => [
      { icon: Plus, label: 'إضافة فاتورة', onClick: () => handleFabAction('add') },
      { icon: RefreshCw, label: 'استيراد معلمات', onClick: () => handleFabAction('import') },
      { icon: FileText, label: 'طباعة', onClick: () => handleFabAction('print') },
    ],
    [handleFabAction],
  )

  if (loading && invoices.length === 0) return <PageLoader />

  return (
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-page px-2">
        {/* Hero — internally divided: identity | stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
        >
          <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="bg-success/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <GraduationCap size={22} className="text-on-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight text-main">فواتير المعلمات</h1>
                <p className="mt-0.5 text-xs text-muted">إدارة مستحقات المعلمات المالية</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="grid flex-1 grid-cols-2 gap-2">
              <div className="rounded-xl border border-primary-soft bg-primary-soft px-3 py-2.5 text-center">
                <p className="text-lg font-black tabular-nums leading-none text-primary">
                  {stats.totalAmount.toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">الإجمالي {CURRENCY_SYMBOL}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-lg font-black tabular-nums leading-none text-success">
                  {filteredInvoices.length}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">فاتورة</p>
              </div>
            </div>
          </div>

          {mixedCount > 0 && (
            <p className="relative z-10 mt-3 flex items-center gap-1.5 rounded-xl bg-warning-soft px-3 py-2 text-[11px] font-bold text-warning">
              <AlertCircle size={13} className="shrink-0" />
              {mixedCount} فاتورة بعملة مختلفة غير مضممة في الإجماليات
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InvoiceStats stats={stats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TeacherInvoicesHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            showForm={showForm}
            onToggleForm={() => setShowForm(!showForm)}
            onImport={handleImportTeachers}
            onDeleteAll={handleDeleteAll}
            onPrint={() => window.print()}
            isTeacher={isTeacher}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InvoiceForm
            showForm={showForm}
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            teachers={teachers}
            isSaving={isSaving}
            INVOICE_STATUS={INVOICE_STATUS}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <InvoiceTable
            filteredInvoices={filteredInvoices}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            isTeacher={isTeacher}
          />
        </motion.div>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDestructive={confirmModal.isDestructive}
        />
      </div>

      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions
              .filter((a) => (isTeacher ? a.label === 'طباعة' : true))
              .map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.3, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3, y: 20 }}
                  transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                  className="flex items-center gap-2"
                >
                  <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                    {action.label}
                  </span>
                  <button
                    onClick={() => {
                      action.onClick()
                      setFabOpen(false)
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
                  >
                    <action.icon size={18} />
                  </button>
                </motion.div>
              ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <GraduationCap size={22} />
        </motion.button>
      </div>
    </div>
  )
}

export default TeacherInvoices
