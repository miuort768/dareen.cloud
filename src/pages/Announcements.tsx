import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Bell, Calendar, EyeOff, Trash2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState, SkeletonCard } from '../shared/components/ui'
import { api, safeArray } from '../lib/api'
import { useShowNotification, useAcademyName, useCurrentUser } from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import { AnnouncementCard } from './AnnouncementCard'
import { ParentAnnouncements } from './ParentAnnouncements'
import { AnnouncementFormModal } from './AnnouncementFormModal'
import { cn } from '../lib/utils'
import type { Announcement, AnnouncementType } from '../features/announcements/types'

export const Announcements = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الإعلانات | ${academyName}`
  }, [academyName])
  const showNotification = useShowNotification()
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [fabOpen, setFabOpen] = useState(false)

  const [formData, setFormData] = useState<{
    title: string
    content: string
    type: AnnouncementType
    isActive: boolean
  }>({
    title: '',
    content: '',
    type: 'general',
    isActive: true,
  })

  const openEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann)
    setFormData({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      isActive: ann.isActive,
    })
    setIsModalOpen(true)
  }

  // البيانات من قاعدة البيانات عبر /announcements (React Query) — بلا أي تخزين محلي
  const {
    data: announcements = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const data = await api.get<Announcement[]>('/announcements')
      return safeArray<Announcement>(data)
    },
  })

  const isAdmin = currentUser?.role === 'admin'

  // غير المشرف يرى النشطة فقط (قراءة فقط) — نفس شكل الكاش في كل الصفحات
  const visibleAnnouncements = useMemo(
    () => (isAdmin ? announcements : announcements.filter((a) => a.isActive)),
    [announcements, isAdmin],
  )

  const resetForm = () => setFormData({ title: '', content: '', type: 'general', isActive: true })

  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: Record<string, unknown>; id?: string }) => {
      if (id) return api.put(`/announcements/${id}`, payload)
      return api.post('/announcements', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setIsModalOpen(false)
      setEditingAnnouncement(null)
      resetForm()
      showNotification(
        editingAnnouncement ? 'تم تحديث الإعلان بنجاح' : 'تم نشر الإعلان بنجاح',
        'success',
      )
    },
    onError: () => showNotification('فشل حفظ الإعلان', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      showNotification('تم حذف الإعلان', 'success')
    },
    onError: () => showNotification('فشل حذف الإعلان', 'error'),
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      payload: { ...formData, date: new Date().toISOString() },
      id: editingAnnouncement?.id,
    })
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('هل أنت متأكد من حذف هذا الإعلان؟'))) return
    deleteMutation.mutate(id)
  }

  const [isDeletingAll, setIsDeletingAll] = useState(false)

  const handleDeleteAll = useCallback(async () => {
    if (isDeletingAll || announcements.length === 0) return
    if (!(await confirm(`هل أنت متأكد من حذف جميع الإعلانات (${announcements.length} إعلان)؟`)))
      return
    setIsDeletingAll(true)
    try {
      const results = await Promise.allSettled(
        announcements.map((a) => api.delete(`/announcements/${a.id}`)),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      if (failed > 0) {
        showNotification(`تم الحذف مع فشل ${failed} إعلان، أعد المحاولة`, 'warning')
      } else {
        showNotification('تم حذف جميع الإعلانات بنجاح', 'success')
      }
    } catch (e) {
      console.error(e)
      showNotification('حدث خطأ أثناء حذف الإعلانات', 'error')
    } finally {
      setIsDeletingAll(false)
      setFabOpen(false)
    }
  }, [announcements, isDeletingAll, queryClient, showNotification])

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي الإعلانات',
        value: announcements.length,
        icon: Megaphone,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'النشطة',
        value: announcements.filter((a) => a.isActive).length,
        icon: Bell,
        gradient: 'from-success-soft to-background dark:from-success-soft dark:to-card',
        iconBg: 'bg-white/50 text-success dark:bg-white/10',
        accent: 'bg-success',
      },
      {
        label: 'غير النشطة',
        value: announcements.filter((a) => !a.isActive).length,
        icon: EyeOff,
        gradient: 'from-warning-soft to-background dark:from-warning-soft dark:to-card',
        iconBg: 'bg-white/50 text-warning dark:bg-white/10',
        accent: 'bg-warning',
      },
      {
        label: 'الأحداث',
        value: announcements.filter((a) => a.type === 'event' || a.type === 'holiday').length,
        icon: Calendar,
        gradient: 'from-info-soft to-background dark:from-info-soft dark:to-card',
        iconBg: 'bg-white/50 text-info dark:bg-white/10',
        accent: 'bg-info',
      },
    ],
    [announcements],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: Plus,
        label: 'إعلان جديد',
        onClick: () => {
          setEditingAnnouncement(null)
          resetForm()
          setIsModalOpen(true)
        },
      },
      { icon: Trash2, label: 'حذف الكل', onClick: handleDeleteAll, disabled: isDeletingAll },
    ],
    [handleDeleteAll, isDeletingAll],
  )

  // غير المشرف (معلم/ولي/طالب) يحصل على لوحة الإعلانات للقراءة
  if (currentUser && currentUser.role !== 'admin') {
    return <ParentAnnouncements />
  }

  return (
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background pb-2"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
        {/* Hero — internally divided: identity | stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
        >
          <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="bg-accent/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <Megaphone size={22} className="text-on-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black leading-tight text-main">الإعلانات</h1>
                  <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                    الإدارة
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">نشر وإدارة الإعلانات والتنبيهات</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="grid flex-1 grid-cols-2 gap-2">
              {[
                {
                  label: 'الإجمالي',
                  value: announcements.length,
                  tone: 'text-primary',
                  bg: 'bg-surface',
                },
                {
                  label: 'النشطة',
                  value: announcements.filter((a) => a.isActive).length,
                  tone: 'text-success',
                  bg: 'bg-success-soft',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={cn('rounded-xl border border-border px-3 py-2.5 text-center', s.bg)}
                >
                  <p className={cn('text-xl font-black tabular-nums leading-none', s.tone)}>
                    {s.value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-kpi
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'relative overflow-hidden rounded-none border border-border bg-gradient-to-br p-4 transition-shadow hover:shadow-elevation-2',
                    kpi.gradient,
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5">
                    <div className={cn('h-full rounded-full', kpi.accent)} />
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-main">{kpi.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{kpi.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* المحتوى */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isError ? (
            <div className="bg-error-soft/50 rounded-2xl border border-dashed border-error-soft py-16 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3 text-error" strokeWidth={1.5} />
              <p className="text-sm font-bold text-main">تعذر تحميل الإعلانات</p>
              <button
                onClick={() => refetch()}
                className="mx-auto mt-4 block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {visibleAnnouncements.map((ann, idx) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * idx }}
                >
                  <AnnouncementCard announcement={ann} onEdit={openEdit} onDelete={handleDelete} />
                </motion.div>
              ))}
              {visibleAnnouncements.length === 0 && (
                <EmptyState
                  icon={Megaphone}
                  title="لا توجد إعلانات بعد"
                  subtitle="أنشئ أول إعلان من الزر العائم بالأسفل"
                  className="col-span-full rounded-2xl border border-dashed border-border bg-card"
                />
              )}
            </div>
          )}
        </motion.div>

        <AnnouncementFormModal
          isOpen={isModalOpen}
          editingAnnouncement={editingAnnouncement}
          formData={formData}
          onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAnnouncement(null)
            resetForm()
          }}
          onSubmit={handleSave}
        />
      </div>

      {/* FAB */}
      <div
        className="fixed end-4 z-50 flex flex-col items-end gap-3 md:end-8"
        style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
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
                  disabled={'disabled' in action ? action.disabled : false}
                  aria-label={action.label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-main shadow-elevation-2 transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
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
          aria-label={fabOpen ? 'إغلاق القائمة' : 'خيارات الإعلانات'}
          aria-expanded={fabOpen}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl text-on-primary shadow-elevation-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            fabOpen ? 'rotate-45 bg-error text-on-error' : 'bg-primary',
          )}
        >
          <Plus
            size={24}
            className={cn('transition-transform duration-normal', fabOpen && 'rotate-45')}
          />
        </motion.button>
      </div>
    </div>
  )
}
