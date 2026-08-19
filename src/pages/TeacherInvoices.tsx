import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Plus,
  RefreshCw,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
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

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

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
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
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
      const matchesSearch = invoice.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus
      const matchesDate = !invoice.date || (invoice.date >= startDate && invoice.date <= endDate)
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, searchTerm, filterStatus, startDate, endDate, isTeacher, teacherName, currentUser])

  const stats = useMemo(() => {
    const result = filteredInvoices.reduce(
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
    return { totalTeachers: filteredInvoices.length, ...result, unpaidPercentage }
  }, [filteredInvoices])

  const kpiCards = useMemo(
    () => [
      {
        label: 'المعلمات',
        value: filteredInvoices.length,
        icon: GraduationCap,
        accent: 'primary' as const,
      },
      {
        label: 'الإجمالي',
        value: `${stats.totalAmount.toLocaleString()} ${CURRENCY_SYMBOL}`,
        icon: DollarSign,
        accent: 'success' as const,
      },
      {
        label: 'مدفوع',
        value: `${stats.paidAmount.toLocaleString()} ${CURRENCY_SYMBOL}`,
        icon: CheckCircle2,
        accent: 'info' as const,
      },
      {
        label: 'معلق',
        value: `${stats.unpaidAmount.toLocaleString()} ${CURRENCY_SYMBOL}`,
        icon: AlertCircle,
        accent: 'error' as const,
      },
    ],
    [filteredInvoices.length, stats],
  )

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
        currency: invoice.currency || 'SAR',
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
        currency: formData.currency || 'SAR',
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
    <div className="relative min-h-full overflow-x-hidden pb-28" dir="rtl">
      <div className="mx-auto max-w-page px-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">المالية</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">
                فواتير المعلمات
              </h1>
              <p className="text-sm text-white/70">إدارة مستحقات المعلمات المالية</p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">الإجمالي</p>
                <p className="text-2xl font-bold tabular-nums text-white">
                  {stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">المعلمات</p>
                <p className="text-lg font-bold text-white">{filteredInvoices.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              const gradientMap = {
                primary: 'from-primary/20 to-primary/5',
                success: 'from-success/20 to-success/5',
                info: 'from-info/20 to-info/5',
                error: 'from-error/20 to-error/5',
                warning: 'from-warning/20 to-warning/5',
              }
              const iconBgMap = {
                primary: 'bg-primary/10 text-primary',
                success: 'bg-success/10 text-success',
                info: 'bg-info/10 text-info',
                error: 'bg-error/10 text-error',
                warning: 'bg-warning/10 text-warning',
              }
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'border-border/50 relative overflow-hidden rounded-xl border bg-gradient-to-br p-4',
                    gradientMap[kpi.accent],
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', iconBgMap[kpi.accent])}>
                      <Icon size={16} />
                    </div>
                    <div
                      className={cn(
                        'h-1 w-12 rounded-full',
                        kpi.accent === 'primary'
                          ? 'bg-primary'
                          : kpi.accent === 'success'
                            ? 'bg-success'
                            : kpi.accent === 'info'
                              ? 'bg-info'
                              : 'bg-error',
                      )}
                    />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-lg font-bold tabular-nums text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="border-border/30 flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
              <input
                aria-label="تاريخ البداية"
                type="date"
                className="w-[120px] border-none bg-transparent text-xs font-bold text-main outline-none [color-scheme:var(--color-scheme)]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-muted">–</span>
              <input
                aria-label="تاريخ النهاية"
                type="date"
                className="w-[120px] border-none bg-transparent text-xs font-bold text-main outline-none [color-scheme:var(--color-scheme)]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <input
                aria-label="بحث باسم المعلمة"
                type="text"
                placeholder="بحث باسم المعلمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-border/30 placeholder:text-muted/60 flex-1 rounded-xl border bg-card px-3.5 py-2 text-xs font-bold text-main transition-all focus:border-primary focus:outline-none"
              />
              <select
                aria-label="فلترة الحالة"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-border/30 cursor-pointer appearance-none rounded-xl border bg-card px-3 py-2 text-xs font-bold text-main transition-all focus:border-primary focus:outline-none"
              >
                <option value="all">الكل</option>
                <option value={INVOICE_STATUS.PAID}>مدفوعة</option>
                <option value={INVOICE_STATUS.PROCESSING}>قيد المعالجة</option>
                <option value={INVOICE_STATUS.REVIEWED}>تمت المراجعة</option>
                <option value={INVOICE_STATUS.UNPAID}>غير مدفوعة</option>
              </select>
            </div>
          </div>
        </motion.div>

        <InvoiceStats stats={stats} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <TeacherInvoicesHeader
            stats={stats}
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
