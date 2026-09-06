import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Briefcase,
  Trash2,
  Phone,
  MessageCircle,
  GraduationCap,
  Calendar,
  Award,
  Globe,
  BookOpen,
  Search,
  CheckCircle2,
  BookMarked,
  Download,
  Inbox,
  X,
  FileText,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, safeArray } from '../lib/api'
import { downloadExport } from '../lib/download'
import { confirm } from '../lib/confirmDialog'
import { SUBJECTS } from '../data/subjects'
import { useAcademyName, useIsLoading, useShowNotification } from '../context/AppContext'
import { cn } from '../lib/utils'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS } from '../lib/socket-events'
import { Skeleton, SkeletonText } from '../shared/components/ui/Skeleton'
import { PageHeader } from '../shared/components/ui'

interface JobApp {
  id: string
  name: string
  phone: string
  whatsapp: string
  position: string
  qualification: string
  grade: string
  graduationYear: string
  onlineYears: string
  curriculums: string
  subject: string
  contacted: number
  createdAt: string
}

function formatDate12h(dateStr: string) {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  const hours = d.getHours()
  const period = hours >= 12 ? 'م' : 'ص'
  const h12 = hours % 12 || 12
  return (
    d.getFullYear() +
    '/' +
    pad(d.getMonth() + 1) +
    '/' +
    pad(d.getDate()) +
    ' ' +
    pad(h12) +
    ':' +
    pad(d.getMinutes()) +
    ' ' +
    period
  )
}

function exportToCsv(apps: JobApp[]) {
  const headers = [
    'الاسم',
    'الهاتف',
    'واتساب',
    'المنصب',
    'المادة',
    'المؤهل',
    'التقدير',
    'سنة التخرج',
    'خبرة أون لاين',
    'المناهج',
    'الحالة',
    'التاريخ',
  ]
  const rows = apps.map((a) => [
    a.name || '',
    a.phone || '',
    a.whatsapp || '',
    a.position || '',
    a.subject || '',
    a.qualification || '',
    a.grade || '',
    a.graduationYear || '',
    a.onlineYears || '0',
    a.curriculums || '',
    a.contacted ? 'تم التواصل' : 'بانتظار التواصل',
    formatDate12h(a.createdAt),
  ])
  const bom = '﻿'
  const newLine = '\n'
  const csv =
    bom +
    [headers.join(','), ...rows.map((r) => r.map((c) => '"' + c + '"').join(','))].join(newLine)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'job-applications.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const subjectColorMap: Record<string, string> = {
  'القرآن الكريم': 'bg-success-soft text-success border-success-soft',
  'المواد الشرعية': 'bg-success-soft text-success border-success-soft',
  'اللغة العربية': 'bg-primary/10 text-primary border-primary/30',
  'اللغة الإنجليزية': 'bg-info-soft text-info border-info-soft',
  'اللغة الفرنسية': 'bg-info-soft text-info border-info-soft',
  الرياضيات: 'bg-warning-soft text-warning border-warning-soft',
  'الدراسات الاجتماعية': 'bg-accent-soft text-accent border-accent-soft',
  'العلوم أو فروعها': 'bg-info-soft text-info border-info-soft',
}

function getSubjectColor(subject: string): string {
  return subjectColorMap[subject] || 'bg-primary/10 text-primary border-primary/30'
}

export const AdminJobs = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = 'الوظائف | ' + academyName
  }, [academyName])
  const queryClient = useQueryClient()
  const authLoading = useIsLoading()
  const showNotification = useShowNotification()

  const {
    data: apps = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<JobApp[]>({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs'),
    select: (data) =>
      safeArray<JobApp>(data).map((a) => ({ ...a, contacted: a.contacted ? 1 : 0 })),
    enabled: !authLoading,
    retry: 1,
    refetchInterval: 30000,
  })
  const error = queryError?.message || null

  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  useEffect(() => {
    const socket = socketService.connect()
    if (!socket) return
    const handleNewJob = () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    }
    socket.on(SOCKET_EVENTS.JOB_APPLICATION_RECEIVED, handleNewJob)
    return () => {
      socket.off(SOCKET_EVENTS.JOB_APPLICATION_RECEIVED, handleNewJob)
    }
  }, [queryClient])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      'هل أنت متأكد من حذف طلب التوظيف هذا؟ لا يمكن التراجع عن هذا الإجراء.',
    )
    if (!confirmed) return
    try {
      await api.delete('/jobs/' + id)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAll = async () => {
    if (apps.length === 0) return
    const confirmed = await confirm(
      'هل أنت متأكد من حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.',
    )
    if (!confirmed) return
    try {
      await Promise.allSettled(apps.map((app) => api.delete('/jobs/' + app.id)))
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleContacted = async (id: string) => {
    try {
      await api.patch<{ contacted: boolean }>('/jobs/' + id + '/contacted')
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportPdf = () => {
    downloadExport('jobs', 'pdf').catch((e: Error) => {
      showNotification(e.message || 'فشل تصدير PDF', 'error')
    })
  }

  const retryFetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
  }, [queryClient])

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const q = search.trim().toLowerCase()
      if (!q && !subjectFilter) return true
      const phone = (a.phone || '').replace(/\s/g, '')
      const matchesSearch =
        !q ||
        (a.name || '').toLowerCase().includes(q) ||
        phone.includes(q.replace(/\s/g, '')) ||
        (a.whatsapp || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        (a.position || '').toLowerCase().includes(q)
      const matchesSubject = !subjectFilter || a.subject === subjectFilter
      return matchesSearch && matchesSubject
    })
  }, [apps, search, subjectFilter])

  const pendingCount = useMemo(() => apps.filter((a) => !a.contacted).length, [apps])
  const contactedCount = useMemo(() => apps.filter((a) => a.contacted).length, [apps])
  const uniqueSubjects = useMemo(
    () => new Set(apps.map((a) => a.subject).filter(Boolean)).size,
    [apps],
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي الطلبات',
        value: apps.length,
        icon: Briefcase,
        bg: 'bg-primary-soft text-primary',
      },
      {
        label: 'قيد المراجعة',
        value: pendingCount,
        icon: Inbox,
        bg: 'bg-warning-soft text-warning-strong',
      },
      {
        label: 'تم التواصل',
        value: contactedCount,
        icon: CheckCircle2,
        bg: 'bg-success-soft text-success-strong',
      },
      {
        label: 'المناصب',
        value: uniqueSubjects,
        icon: BookOpen,
        bg: 'bg-info-soft text-info-strong',
      },
    ],
    [apps, pendingCount, contactedCount, uniqueSubjects],
  )

  const subjectPills = useMemo(
    () => [
      { key: '', label: 'الكل', color: 'bg-primary/10 text-primary border-primary/30' },
      ...SUBJECTS.map((s) => ({ key: s, label: s, color: getSubjectColor(s) })),
    ],
    [],
  )

  const emptySearch = !loading && filtered.length === 0 && apps.length > 0

  return (
    <div
      className="from-warning-soft/40 min-h-full bg-gradient-to-b via-background to-background pb-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl px-2.5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border pb-5 pt-6"
        >
          <PageHeader
            title="طلبات التوظيف"
            subtitle="إدارة طلبات المتقدمين للوظائف"
            icon={<Briefcase size={22} />}
            meta={
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold tabular-nums text-muted">
                {apps.length} طلب
              </span>
            }
            actions={
              <>
                <button
                  onClick={() => exportToCsv(filtered)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-main shadow-elevation-1 transition-all duration-normal hover:bg-hover hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <Download size={14} />
                  <span>تصدير CSV</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-main shadow-elevation-1 transition-all duration-normal hover:bg-hover hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <FileText size={14} />
                  <span>تصدير PDF</span>
                </button>
              </>
            }
            action={
              <button
                onClick={handleDeleteAll}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-error px-4 text-sm font-semibold text-on-error shadow-elevation-1 transition-all duration-normal hover:bg-error-hover hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <Trash2 size={14} />
                <span>حذف الكل</span>
              </button>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-elevation-1 transition-shadow duration-normal hover:shadow-elevation-1"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn('flex h-9 w-9 items-center justify-center rounded-lg', kpi.bg)}
                    >
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                  <p className="mt-1 text-micro text-muted">{kpi.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {subjectPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setSubjectFilter(pill.key)}
                aria-pressed={subjectFilter === pill.key}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-2.5 text-micro font-bold outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:py-2',
                  subjectFilter === pill.key
                    ? 'border-primary bg-primary text-on-primary'
                    : pill.color + ' hover:border-primary/30',
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              type="text"
              aria-label="بحث"
              placeholder="ابحث بالاسم أو الهاتف أو المنصب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-3 pe-4 ps-10 text-xs font-bold text-main outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted outline-none transition-colors duration-fast hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="مسح البحث"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={`skel-${i}`} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/3 rounded-lg" />
                        <Skeleton className="h-2.5 w-1/4 rounded-lg" />
                      </div>
                    </div>
                    <SkeletonText lines={2} className="mb-3" />
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="h-8 rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-error-soft bg-card p-8 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-error-soft">
                  <AlertTriangle size={20} className="text-error" />
                </div>
                <p className="text-xs font-bold text-error">{error}</p>
                <button
                  type="button"
                  onClick={retryFetch}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary outline-none transition-colors duration-fast hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  إعادة تحميل
                </button>
              </motion.div>
            ) : apps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Briefcase size={24} className="text-primary" />
                </div>
                <p className="mb-1 text-xs font-bold text-muted">لا توجد طلبات</p>
                <p className="text-xs text-muted">سيتم عرض طلبات المتقدمين هنا</p>
              </motion.div>
            ) : emptySearch ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Search size={24} className="text-primary" />
                </div>
                <p className="mb-1 text-xs font-bold text-muted">لا توجد نتائج</p>
                <p className="text-xs text-muted">جرّب تغيير كلمات البحث أو الفلتر</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filtered.map((app, index) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={cn(
                      'overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-normal hover:shadow-elevation-1',
                      app.contacted
                        ? 'border-s-4 border-s-success'
                        : 'border-s-4 border-s-primary/40',
                    )}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                              app.contacted ? 'border border-border bg-surface' : 'bg-primary/10',
                            )}
                          >
                            <span
                              className={cn(
                                'text-sm font-bold',
                                app.contacted ? 'text-muted' : 'text-primary',
                              )}
                            >
                              {(app.name || '?').charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3
                              className={cn(
                                'truncate text-sm font-bold',
                                app.contacted ? 'text-muted' : 'text-main',
                              )}
                            >
                              {app.name}
                            </h3>
                            <p
                              className={cn(
                                'truncate text-micro font-bold',
                                app.contacted ? 'text-muted' : 'text-primary',
                              )}
                            >
                              {app.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {!app.contacted && (
                            <button
                              onClick={() => handleContacted(app.id)}
                              className="flex h-9 items-center gap-1.5 rounded-lg bg-success px-3 text-micro font-bold text-on-success outline-none transition-colors duration-fast hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-auto sm:py-1.5"
                              title="تم التواصل"
                              aria-label="تم التواصل"
                            >
                              <CheckCircle2 size={13} />
                              <span>تم التواصل</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-error text-on-error outline-none transition-colors duration-fast hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
                            aria-label="حذف الطلب"
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">حذف</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border pt-3 text-xs sm:grid-cols-4">
                        <DetailRow
                          icon={Phone}
                          label="الهاتف"
                          value={app.phone}
                          contacted={!!app.contacted}
                          phoneLink
                        />
                        <DetailRow
                          icon={MessageCircle}
                          label="واتساب"
                          value={app.whatsapp || '-'}
                          contacted={!!app.contacted}
                          phoneLink={!!app.whatsapp}
                          whatsappLink
                        />
                        <DetailRow
                          icon={GraduationCap}
                          label="المؤهل"
                          value={app.qualification}
                          contacted={!!app.contacted}
                        />
                        <DetailRow
                          icon={Award}
                          label="التقدير"
                          value={app.grade || '-'}
                          contacted={!!app.contacted}
                        />
                        {app.subject && (
                          <DetailRow
                            icon={BookMarked}
                            label="المادة"
                            value={app.subject}
                            contacted={!!app.contacted}
                          />
                        )}
                        <DetailRow
                          icon={Calendar}
                          label="سنة التخرج"
                          value={app.graduationYear || '-'}
                          contacted={!!app.contacted}
                        />
                        <DetailRow
                          icon={Globe}
                          label="خبرة أون لاين"
                          value={(app.onlineYears || '0') + ' سنة'}
                          contacted={!!app.contacted}
                        />
                        <DetailRow
                          icon={Calendar}
                          label="التاريخ"
                          value={formatDate12h(app.createdAt)}
                          contacted={!!app.contacted}
                        />
                        <div className="col-span-2 mt-1 flex items-start gap-2.5 border-t border-border pt-3 sm:col-span-4">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen
                              size={10}
                              className={app.contacted ? 'text-muted' : 'text-primary'}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="mb-0.5 text-micro font-bold text-muted">المناهج</p>
                            <span className="text-micro font-bold text-main">
                              {app.curriculums || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
  contacted,
  phoneLink,
  whatsappLink,
}: {
  icon: LucideIcon
  label: string
  value: string
  contacted?: boolean
  phoneLink?: boolean
  whatsappLink?: boolean
}) => {
  const cleanPhone = (value || '').replace(/\s/g, '')
  const content = (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon size={10} className={contacted ? 'text-muted' : 'text-primary'} />
      </div>
      <div className="min-w-0">
        <p className="text-micro font-bold text-muted">{label}</p>
        <span
          className={cn(
            'block truncate text-micro font-bold',
            contacted ? 'text-muted' : 'text-main',
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )

  if (whatsappLink && value && value !== '-') {
    return (
      <div className="flex items-center gap-1.5">
        <a
          href={'https://wa.me/' + cleanPhone.replace(/^\+/, '')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-micro font-bold text-success hover:underline"
        >
          {content}
        </a>
      </div>
    )
  }

  if (phoneLink && value && value !== '-') {
    return (
      <a href={'tel:' + cleanPhone} className="flex items-center gap-1">
        {content}
      </a>
    )
  }

  return content
}
