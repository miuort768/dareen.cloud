import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Bell, Calendar, EyeOff, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { api, safeArray } from '../lib/api'
import { useShowNotification, useAcademyName } from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import { AnnouncementCard } from './AnnouncementCard'
import { ParentAnnouncements } from './ParentAnnouncements'
import { AnnouncementFormModal } from './AnnouncementFormModal'
import { cn } from '../lib/utils'
import { useCurrentUser } from '../context/AppContext'

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event'

interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  date: string
  isActive: boolean
}

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

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

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const data = await api.get<Announcement[]>('/announcements')
      return safeArray<Announcement>(data)
    },
  })

  const isAdmin = currentUser?.role === 'admin'

  // Non-admin roles see ONLY active announcements (read-only)
  const visibleAnnouncements = useMemo(
    () => (isAdmin ? announcements : announcements.filter((a) => a.isActive)),
    [announcements, isAdmin],
  )

  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: Record<string, unknown>; id?: string }) => {
      if (id) return api.put(`/announcements/${id}`, payload)
      return api.post('/announcements', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setIsModalOpen(false)
      setEditingAnnouncement(null)
      setFormData({ title: '', content: '', type: 'general', isActive: true })
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

  const handleDeleteAll = useCallback(async () => {
    if (announcements.length === 0) {
      showNotification('لا توجد إعلانات لحذفها', 'info')
      return
    }
    if (!(await confirm(`هل أنت متأكد من حذف جميع الإعلانات (${announcements.length} إعلان)؟`)))
      return
    try {
      await Promise.all(announcements.map((a) => api.delete(`/announcements/${a.id}`)))
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      showNotification('تم حذف جميع الإعلانات بنجاح', 'success')
    } catch (e) {
      console.error(e)
      showNotification('حدث خطأ أثناء حذف الإعلانات', 'error')
    }
  }, [announcements, queryClient, showNotification])

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
          setFormData({ title: '', content: '', type: 'general', isActive: true })
          setIsModalOpen(true)
        },
      },
      { icon: Trash2, label: 'حذف الكل', onClick: handleDeleteAll },
    ],
    [handleDeleteAll],
  )

  // Non-admin roles (teacher/parent) get the student-facing announcements design
  if (currentUser && currentUser.role !== 'admin') {
    return <ParentAnnouncements />
  }

  return (
    <div className="relative min-h-full overflow-x-hidden pb-2" dir="rtl">
      <div className="mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-primary via-primary-deep to-primary-hover shadow-xl dark:border-primary/40 dark:from-primary dark:via-primary-deep dark:to-primary-hover"
        >
          <div className="absolute inset-0 opacity-[0.06]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="ann-hero-grid"
                  x="0"
                  y="0"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="white" />
                  <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ann-hero-grid)" />
            </svg>
          </div>
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
          <div className="relative z-10 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div>
              <div className="mb-2.5 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                  <Megaphone size={18} className="text-on-primary" />
                </div>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-micro font-bold text-white/80">
                  الإدارة
                </span>
              </div>
              <h1 className="mb-1 text-2xl font-black tracking-tight text-on-primary md:text-3xl">
                الإعلانات
              </h1>
              <p className="text-xs font-medium text-white/70 md:text-sm">
                نشر وإدارة الإعلانات والتنبيهات
              </p>
            </div>
            <div className="hidden items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm md:flex">
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">الإجمالي</p>
                <p className="text-2xl font-bold text-white">{announcements.length}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">النشطة</p>
                <p className="text-2xl font-bold text-white">
                  {announcements.filter((a) => a.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {isAdmin && (
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
                      'relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-4 transition-shadow hover:shadow-elevation-2',
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
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {visibleAnnouncements.map((ann, idx) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
              >
                <AnnouncementCard
                  announcement={ann}
                  onEdit={isAdmin ? openEdit : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              </motion.div>
            ))}
            {visibleAnnouncements.length === 0 && !isLoading && (
              <EmptyState
                icon={Megaphone}
                title="لا توجد إعلانات بعد"
                className="col-span-full rounded-2xl border border-dashed border-border bg-card"
              />
            )}
          </div>
        </motion.div>

        <AnnouncementFormModal
          isOpen={isModalOpen}
          editingAnnouncement={editingAnnouncement}
          formData={formData}
          onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAnnouncement(null)
            setFormData({ title: '', content: '', type: 'general', isActive: true })
          }}
          onSubmit={handleSave}
        />
      </div>

      {isAdmin && (
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
                    aria-label={action.label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-main shadow-elevation-2 transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
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
              'flex h-14 w-14 items-center justify-center rounded-2xl text-on-primary shadow-elevation-3 transition-colors focus-visible:ring-2 focus-visible:ring-focus',
              fabOpen ? 'bg-error' : 'bg-primary',
            )}
          >
            <Plus
              size={24}
              className={cn('transition-transform duration-normal', fabOpen && 'rotate-45')}
            />
          </motion.button>
        </div>
      )}
    </div>
  )
}
