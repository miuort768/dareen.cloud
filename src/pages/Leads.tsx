import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search,
  Plus,
  EyeOff,
  Eye,
  AlertTriangle,
  X,
  Activity,
  BarChart3,
  Phone,
  Users,
  UserPlus,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmService } from '../features/crm/services/crmService'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS } from '../lib/socket-events'
import type { Lead, LeadStatus } from '../features/crm/types'
import { ErrorBanner } from '../shared/components/ui/ErrorState'
import { PrimaryBtn, statusColors } from './leads/components/LeadsUI'
import { LeadTable } from './leads/components/LeadTable'
import { LeadCards } from './leads/components/LeadCards'
import { LeadsSkeleton } from './leads/components/LeadsSkeleton'
import { LeadDrawer } from './leads/components/LeadDrawer'
import { FilterDropdown } from '../shared/components/ui'
import { useUIStore } from '../store/uiStore'
import { useAcademyName } from '../context/AppContext'
import { cn } from '../lib/utils'

const ConfirmDeleteModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    cancelRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm dark:bg-black/70 sm:items-center sm:p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:max-w-sm sm:rounded-2xl"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between bg-error px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <AlertTriangle size={18} className="text-on-error" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
              <p className="text-white/70 mt-0.5 text-[10px]">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="bg-white/15 hover:bg-white/25 flex h-8 w-8 items-center justify-center rounded-full text-on-error transition-all"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5">
          <p className="mb-1 text-sm font-bold text-main">هل أنت متأكد من حذف هذا العميل؟</p>
          <p className="text-xs leading-relaxed text-muted">
            سيتم نقل العميل <span className="font-bold text-error">المفقود</span> إلى قائمة العملاء
            المفقودين ولن يظهر مرة أخرى.
          </p>
        </div>
        <div className="flex gap-2 p-5 pt-0">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-surface py-3.5 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-error py-3.5 text-xs font-bold text-on-error shadow-sm transition-all hover:bg-error-hover active:scale-[0.98]"
          >
            تأكيد الحذف
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ConfirmDeleteAllModal = ({
  onConfirm,
  onCancel,
  isLoading,
}: {
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}) => {
  const [typed, setTyped] = useState('')
  const verified = typed.trim().toLowerCase() === 'dareen'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm dark:bg-black/70 sm:items-center sm:p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:max-w-sm sm:rounded-2xl"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between bg-error px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <Trash2 size={18} className="text-on-error" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-error">حذف جميع العملاء</h3>
              <p className="text-white/70 mt-0.5 text-[10px]">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="bg-white/15 hover:bg-white/25 flex h-8 w-8 items-center justify-center rounded-full text-on-error transition-all"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5">
          <p className="mb-1 text-sm font-bold text-main">هل أنت متأكد من حذف جميع العملاء؟</p>
          <p className="text-xs leading-relaxed text-muted">
            سيتم <span className="font-bold text-error">حذف جميع العملاء نهائيًا</span> بما فيهم
            المفقودون، ولن يمكن استعادتهم.
          </p>
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-bold text-muted">
              اكتب{' '}
              <span dir="ltr" className="font-black text-error">
                dareen
              </span>{' '}
              للتأكيد
            </label>
            <input
              dir="ltr"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="dareen"
              className="focus-visible:ring-error-soft placeholder:text-muted w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-center text-[13px] font-black tracking-widest text-main outline-none transition-all duration-200 focus-visible:border-error focus-visible:ring-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && verified) onConfirm()
              }}
              aria-label="اكتب dareen للتأكيد"
            />
          </div>
        </div>
        <div className="flex gap-2 p-5 pt-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-surface py-3.5 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !verified}
            className="flex-1 rounded-xl bg-error py-3.5 text-xs font-bold text-on-error shadow-sm transition-all hover:bg-error-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'جاري الحذف...' : 'حذف الكل'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const StatusKeys: LeadStatus[] = ['new', 'contacted', 'interested', 'trial', 'converted']

const inputClass =
  'w-full bg-surface border border-border px-3.5 py-3 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 text-main rounded-xl transition-all duration-200 placeholder:text-muted font-bold'
const labelClass = 'text-[11px] font-bold text-muted mb-1.5 block'

const AddLeadModalInline = ({
  formRef,
  addMutation,
  onClose,
}: {
  formRef: React.RefObject<HTMLFormElement | null>
  addMutation: { mutate: (data: Record<string, unknown>) => void; isPending: boolean }
  onClose: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="p-4"
  >
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 dark:shadow-none">
      <div className="flex items-center justify-between bg-gradient-to-l from-primary to-primary-deep px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30">
            <UserPlus size={16} className="text-on-primary" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-on-primary">إضافة عميل جديد</h2>
            <p className="text-[10px] text-white/80">أدخل بيانات العميل</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-white/15 hover:bg-white/25 flex h-8 w-8 items-center justify-center rounded-full text-on-primary transition-all"
          aria-label="إغلاق"
        >
          <X size={14} />
        </button>
      </div>
      <form
        ref={formRef}
        className="space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const g = (n: string) => (fd.get(n) as string) || ''
          addMutation.mutate({
            studentName: g('name'),
            phone: g('phone'),
            subject: g('subject'),
            curriculum: g('curriculum'),
            status: 'new',
            priority: g('priority'),
            notes: g('notes'),
          })
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>اسم الطالب</label>
            <input name="name" className={inputClass} placeholder="مثال: أم أحمد" />
          </div>
          <div>
            <label className={labelClass}>المنهج</label>
            <input name="curriculum" required className={inputClass} placeholder="مثال: مصري" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>رقم الهاتف</label>
            <input
              name="phone"
              required
              className={inputClass}
              placeholder="05XXXXXXXX"
              dir="ltr"
              style={{ textAlign: 'right' }}
            />
          </div>
          <div>
            <label className={labelClass}>المادة المهتم بها</label>
            <input name="subject" required className={inputClass} placeholder="مثال: رياضيات" />
          </div>
        </div>
        <div>
          <label className={labelClass}>الأولوية</label>
          <select name="priority" aria-label="الأولوية" className={inputClass}>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>ملاحظات</label>
          <textarea
            name="notes"
            rows={2}
            className={inputClass + ' resize-none'}
            placeholder="اكتب أي تفاصيل..."
          />
        </div>
        <div className="flex gap-3 pt-1">
          <PrimaryBtn type="submit" disabled={addMutation.isPending} className="flex-1 py-3">
            {addMutation.isPending ? 'جاري الحفظ...' : 'إضافة العميل'}
          </PrimaryBtn>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-surface py-3 text-[11px] font-bold text-muted transition-all hover:bg-hover"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </motion.div>
)

export const Leads = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `العملاء المحتملون | ${academyName} للتعليم والتدريب`
  }, [academyName])
  const queryClient = useQueryClient()
  const showNotification = useUIStore((s) => s.showNotification)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showLost, setShowLost] = useState(false)
  const [confirmLeadId, setConfirmLeadId] = useState<string | null>(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const {
    data: leads = [],
    isLoading,
    isError: isLeadsError,
  } = useQuery({ queryKey: ['leads'], queryFn: crmService.getAll })
  const { data: stats } = useQuery({ queryKey: ['lead-stats'], queryFn: crmService.getStats })

  useEffect(() => {
    const socket = socketService.getSocket()
    if (!socket) return
    const handleLeadUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] })
    }
    socket.on(SOCKET_EVENTS.LEAD_UPDATED, handleLeadUpdate)
    return () => {
      socket.off(SOCKET_EVENTS.LEAD_UPDATED, handleLeadUpdate)
    }
  }, [queryClient])

  const addMutation = useMutation({
    mutationFn: crmService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] })
      setIsAddModalOpen(false)
      formRef.current?.reset()
      showNotification('تمت إضافة العميل بنجاح', 'success')
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      showNotification(err?.response?.data?.error || err.message, 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) =>
      crmService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] })
      showNotification('تم تحديث العميل بنجاح', 'success')
    },
    onError: (err: Error) => {
      showNotification(err.message, 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => crmService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] })
      showNotification('تم حذف العميل', 'success')
    },
    onError: (err: Error) => {
      showNotification(err.message, 'error')
    },
  })

  const deleteAllMutation = useMutation({
    mutationFn: crmService.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] })
      setConfirmDeleteAll(false)
      showNotification('تم حذف جميع العملاء', 'success')
    },
    onError: (err: Error) => {
      showNotification(err.message, 'error')
    },
  })

  const filteredLeads = useMemo(
    () =>
      leads.filter((l: Lead) => {
        if (showLost) return l.status === 'lost'
        const q = searchTerm.toLowerCase()
        const matchesSearch =
          !searchTerm ||
          l.studentName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.subject?.toLowerCase().includes(q) ||
          l.curriculum?.toLowerCase().includes(q) ||
          statusColors[l.status as LeadStatus]?.label.includes(q)
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus
        return matchesSearch && matchesStatus && l.status !== 'lost'
      }),
    [leads, showLost, searchTerm, filterStatus],
  )

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: leads.filter((l: Lead) => l.status !== 'lost').length,
    }
    StatusKeys.forEach((key) => {
      counts[key] = leads.filter((l: Lead) => l.status === key).length
    })
    return counts
  }, [leads])

  const filterItems = [
    { key: 'all', label: `الكل (${statusCounts.all})` },
    ...StatusKeys.map((key) => ({
      key,
      label: `${statusColors[key].label} (${statusCounts[key]})`,
      dot: statusColors[key].dot,
    })),
  ]

  const handleMarkLost = (id: string) => setConfirmLeadId(id)
  const handleConfirmDelete = () => {
    if (confirmLeadId) deleteMutation.mutate(confirmLeadId)
    setConfirmLeadId(null)
  }
  const handleOpenDrawer = (lead: Lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  if (isLoading) return <LeadsSkeleton />

  if (isLeadsError) {
    return (
      <div className="min-h-screen bg-background pb-24" dir="rtl">
        <div className="relative z-10 mx-auto max-w-page px-2.5 sm:px-4 md:px-6">
          <ErrorBanner className="mt-6 md:mt-10" />
        </div>
      </div>
    )
  }

  const activeCount = leads.filter((l: Lead) => l.status !== 'lost').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background pb-24"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto max-w-page px-4 md:px-6">
        {/* ===== HEADER ===== */}
        <div className="pb-2 pt-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/20">
                  <Users size={20} />
                </div>
                <div>
                  <h1 className="font-outfit text-lg font-black text-main md:text-xl">
                    العملاء المحتملون
                  </h1>
                  <p className="text-[11px] text-muted">إدارة طلبات التسجيل والعملاء المتوقعين</p>
                </div>
              </div>
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 flex items-center gap-2"
          >
            <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="flex-1 h-11 text-xs">
              <Plus size={16} /> عميل جديد
            </PrimaryBtn>
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-error px-4 text-xs font-bold text-main shadow-sm transition-all hover:bg-error-hover active:scale-95"
            >
              <Trash2 size={16} /> حذف
            </button>
            <button
              onClick={() => setShowLost(!showLost)}
              className={cn(
                'flex-1 flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all active:scale-95',
                showLost
                  ? 'border-transparent bg-error-soft text-error'
                  : 'border-border bg-surface text-muted hover:text-main',
              )}
            >
              {showLost ? <Eye size={16} /> : <EyeOff size={16} />} مفقودين
            </button>
          </motion.div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'إجمالي العملاء',
              value: stats?.total || 0,
              sub: `${activeCount} نشط`,
              icon: Users,
              card: 'border-primary-soft bg-primary-soft',
              iconColor: 'text-primary',
              valueColor: 'text-primary',
              delay: 0.15,
            },
            {
              label: 'عملاء جدد',
              value: statusCounts['new'] || 0,
              sub: 'هذا الشهر',
              icon: Activity,
              card: 'border-info-soft bg-info-soft',
              iconColor: 'text-info',
              valueColor: 'text-info',
              accent: true,
              delay: 0.2,
            },
            {
              label: 'تم التحويل',
              value: stats?.converted || 0,
              sub: 'إلى مشتركين',
              icon: Phone,
              card: 'border-success-soft bg-success-soft',
              iconColor: 'text-success',
              valueColor: 'text-success',
              delay: 0.25,
            },
            {
              label: 'معدل التحويل',
              value: `${(stats?.conversionRate ?? 0).toFixed(1)}%`,
              sub: 'معدل النجاح',
              icon: BarChart3,
              card: 'border-warning-soft bg-warning-soft',
              iconColor: 'text-warning',
              valueColor: 'text-warning',
              delay: 0.3,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: stat.delay }}
              className={cn(
                'rounded-2xl border p-4 transition-all duration-300 hover:shadow-elevation-1',
                stat.card,
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-main">{stat.label}</span>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl bg-white/50 dark:bg-white/10')}>
                  <stat.icon size={14} className={stat.iconColor} />
                </div>
              </div>
              <div className={cn('font-outfit text-2xl font-black tabular-nums', stat.valueColor)}>
                {stat.value}
              </div>
              <div className={cn('mt-1 flex items-center gap-1 text-[10px] font-medium', stat.accent ? 'text-success' : 'text-muted')}>
                {stat.accent && <span>↗</span>}
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 dark:shadow-none">
          {/* Toolbar */}
          <div className="border-b border-border p-4 lg:p-5">
            <div className="relative">
              <Search
                size={15}
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                aria-label="بحث عن عميل"
                className="h-11 w-full rounded-xl border border-border bg-surface pe-10 ps-10 text-[13px] text-main outline-none transition-all duration-200 placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  aria-label="مسح البحث"
                  onClick={() => setSearchTerm('')}
                  className="absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-all hover:text-main"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <FilterDropdown
                value={filterStatus}
                items={filterItems}
                onChange={(k) => setFilterStatus(k as LeadStatus | 'all')}
                className={filterStatus === 'all' ? 'col-span-2' : ''}
              />
              {filterStatus !== 'all' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFilterStatus('all')}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-error-soft px-3 text-[11px] font-bold text-error transition-all hover:bg-error-light"
                >
                  <X size={13} /> مسح الفلاتر
                </motion.button>
              )}
            </div>
            <div className="mt-2 flex">
              <span className="rounded-lg border border-border bg-surface px-2 py-1 text-[10px] font-bold text-muted">
                النتائج: {filteredLeads.length}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            {isDrawerOpen && selectedLead ? (
              <LeadDrawer
                lead={selectedLead}
                onClose={() => {
                  setIsDrawerOpen(false)
                  setSelectedLead(null)
                }}
                updateMutation={updateMutation}
              />
            ) : isAddModalOpen ? (
              <AddLeadModalInline
                formRef={formRef}
                addMutation={addMutation}
                onClose={() => setIsAddModalOpen(false)}
              />
            ) : (
              <>
                <LeadTable
                  filteredLeads={filteredLeads}
                  updateMutation={updateMutation}
                  handleMarkLost={handleMarkLost}
                  onLeadClick={handleOpenDrawer}
                />
                <LeadCards
                  filteredLeads={filteredLeads}
                  updateMutation={updateMutation}
                  handleMarkLost={handleMarkLost}
                  onLeadClick={handleOpenDrawer}
                />
              </>
            )}
          </div>
        </div>

        {/* FAB */}
        <motion.button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover active:scale-95 md:bottom-8 md:left-8 md:h-14 md:w-14"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label="إضافة عميل"
        >
          <Plus size={22} />
        </motion.button>

        {/* Modals */}
        <AnimatePresence>
          {confirmLeadId && (
            <ConfirmDeleteModal
              onConfirm={handleConfirmDelete}
              onCancel={() => setConfirmLeadId(null)}
            />
          )}
          {confirmDeleteAll && (
            <ConfirmDeleteAllModal
              onConfirm={() => deleteAllMutation.mutate()}
              onCancel={() => setConfirmDeleteAll(false)}
              isLoading={deleteAllMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
