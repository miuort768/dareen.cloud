import { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, safeArray } from '../lib/api'
import { confirm } from '../lib/confirmDialog'
import { SUBJECTS } from '../data/subjects'
import { useAcademyName, useIsLoading } from '../context/AppContext'
import { cn } from '../lib/utils'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS } from '../lib/socket-events'

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
  const period = hours >= 12 ? '\u0645' : '\u0635'
  const h12 = hours % 12 || 12
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(h12)}:${pad(d.getMinutes())} ${period}`
}

function exportToCsv(apps: JobApp[]) {
  const headers = [
    '\u0627\u0644\u0627\u0633\u0645',
    '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
    '\u0627\u0644\u0645\u0646\u0627\u0647\u062c',
    '\u0633\u0646\u0648\u0627\u062a \u0627\u0644\u062e\u0628\u0631\u0629',
  ]
  const rows = apps.map((a) => [
    a.name || '',
    a.phone || '',
    a.curriculums || '-',
    a.onlineYears || '0',
  ])
  const bom = '\uFEFF'
  const csv =
    bom + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
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
  '\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064a\u0645':
    'bg-success/10 text-success border-success/30',
  '\u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0634\u0631\u0639\u064a\u0629':
    'bg-success/10 text-success border-success/30',
  '\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629':
    'bg-primary/10 text-primary border-primary/30',
  '\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629':
    'bg-info/10 text-info border-info/30',
  '\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629':
    'bg-info/10 text-info border-info/30',
  '\u0627\u0644\u0631\u064a\u0627\u0636\u064a\u0627\u062a':
    'bg-warning/10 text-warning border-warning/30',
  '\u0627\u0644\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629':
    'bg-accent/10 text-accent border-accent/30',
  '\u0627\u0644\u0639\u0644\u0648\u0645 \u0623\u0648 \u0641\u0631\u0648\u0639\u0647\u0627':
    'bg-info/10 text-info border-info/30',
}

function getSubjectColor(subject: string): string {
  return subjectColorMap[subject] || 'bg-primary/10 text-primary border-primary/30'
}

export const AdminJobs = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الوظائف | ${academyName}`
  }, [academyName])
  const queryClient = useQueryClient()
  const authLoading = useIsLoading()

  const { data: apps = [], isLoading: loading } = useQuery<JobApp[]>({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs'),
    select: (data) =>
      safeArray<JobApp>(data).map((a) => ({ ...a, contacted: a.contacted ? 1 : 0 })),
    enabled: !authLoading,
    retry: 1,
    refetchInterval: 30000,
  })

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
      '\u0647ل أنت متأكد من حذف طلب التوظيف هذا؟ لا يمكن التراجع عن هذا الإجراء.',
      {
        title: '\u062dذف الطلب',
        confirmText: '\u062dذف',
        cancelText: '\u062aضاعف',
        isDestructive: true,
        icon: <Trash2 size={28} />,
      },
    )
    if (!confirmed) return
    try {
      await api.delete(`/jobs/${id}`)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAll = async () => {
    const confirmed = await confirm(
      '\u0647ل أنت متأكد من حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.',
      {
        title: '\u062dذف جميع الطلبات',
        confirmText: '\u062dذف الكل',
        cancelText: '\u062aضاعف',
        isDestructive: true,
        icon: <Trash2 size={28} />,
      },
    )
    if (!confirmed) return
    try {
      for (const app of filtered) {
        await api.delete(`/jobs/${app.id}`)
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleContacted = async (id: string) => {
    try {
      await api.patch<{ contacted: boolean }>(`/jobs/${id}/contacted`)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    } catch (err) {
      console.error(err)
    }
  }

  const exportToPdf = async () => {
    try {
      const res = await api.get('/jobs/export/pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(res)
      const a = document.createElement('a')
      a.href = url
      a.download = 'job-applications.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const q = search.trim().toLowerCase()
      if (!q && !subjectFilter) return true
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        (a.whatsapp || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        a.position.toLowerCase().includes(q)
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
        label: '\u0625جمالي \u0627لطلبات',
        value: apps.length,
        icon: Briefcase,
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
      },
      {
        label: 'بانتظار التواصل',
        value: pendingCount,
        icon: Inbox,
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
      },
      {
        label: 'تم التواصل',
        value: contactedCount,
        icon: CheckCircle2,
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
      },
      {
        label: 'المواد',
        value: uniqueSubjects,
        icon: BookOpen,
        color: 'text-info',
        bg: 'bg-info/10',
        border: 'border-info/20',
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
    <div className="min-h-full pb-8" dir="rtl">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mx-4 border-b border-border bg-gradient-to-l from-primary/5 via-transparent to-primary/10 px-4 pb-5 pt-6 sm:-mx-6 sm:px-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Briefcase size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-main">طلبات التوظيف</h1>
                <p className="mt-0.5 text-xs text-muted">إدارة طلبات المتقدمين للوظائف</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCsv(filtered)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted transition-all duration-200 hover:border-primary/20 hover:bg-hover active:scale-[0.98]"
              >
                <Download size={14} />
                <span>تصدير CSV</span>
              </button>
              <button
                onClick={exportToPdf}
                className="bg-error/5 border-error/20 hover:bg-error/10 hover:border-error/30 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-error transition-all duration-200 active:scale-[0.98]"
              >
                <FileText size={14} />
                <span>تصدير PDF</span>
              </button>
              <button
                onClick={handleDeleteAll}
                className="hover:bg-error/5 hover:border-error/30 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-error transition-all duration-200 active:scale-[0.98]"
              >
                <Trash2 size={14} />
                <span>حذف الكل</span>
              </button>
            </div>
          </div>
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
                  className={cn(
                    'rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-elevation-1',
                    kpi.border,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn('flex h-9 w-9 items-center justify-center rounded-lg', kpi.bg)}
                    >
                      <Icon size={16} className={kpi.color} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                  <p className="mt-1 text-[11px] text-muted">{kpi.label}</p>
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
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold transition-all duration-200 active:scale-[0.97]',
                  subjectFilter === pill.key
                    ? 'border-primary bg-primary text-on-primary shadow-sm'
                    : pill.color + ' hover:shadow-sm',
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
              aria-label="\u0628\u062d\u062b"
              placeholder="\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0627\u0644\u0645نصب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="placeholder:text-muted/60 w-full rounded-xl border border-border bg-card py-3 pe-4 ps-10 text-xs font-bold text-main transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-main"
                aria-label="\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b"
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
                  <div
                    key={`skel-${i}`}
                    className="animate-pulse rounded-xl border border-border bg-card p-5"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-surface" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded-lg bg-surface" />
                        <div className="h-2.5 w-1/4 rounded-lg bg-surface" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-8 rounded-lg bg-surface" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : apps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Briefcase size={24} className="text-primary" />
                </div>
                <p className="mb-1 text-sm font-bold text-main">لا توجد طلبات</p>
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
                <p className="mb-1 text-sm font-bold text-main">لا توجد نتائج</p>
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
                      'overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-elevation-1',
                      app.contacted
                        ? 'border-r-success/40 border-r-4 opacity-60'
                        : 'border-r-4 border-r-primary/40',
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
                              {app.name.charAt(0)}
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
                                'truncate text-[11px] font-bold',
                                app.contacted ? 'text-muted' : 'text-primary',
                              )}
                            >
                              {app.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => handleContacted(app.id)}
                            className={cn(
                              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 active:scale-95',
                              app.contacted
                                ? 'bg-success/10 border-success/30 border text-success'
                                : 'bg-success/10 border-success/20 hover:bg-success/20 border text-success',
                            )}
                            title="\u062a\u0645 \u0627\u0644\u062a\u0648\u0627\u0635\u0644"
                            aria-label="\u062a\u0645 \u0627\u0644\u062a\u0648\u0627\u0635\u0644"
                          >
                            <CheckCircle2 size={13} />
                            <span>\u062a\u0645 \u0627\u0644\u062a\u0648\u0627\u0635\u0644</span>
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="bg-error/10 border-error/20 hover:bg-error/20 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold text-error transition-all duration-200 active:scale-95"
                            aria-label="\u062d\u0630\u0641 \u0627\u0644\u0637\u0644\u0628"
                          >
                            <Trash2 size={13} />
                            <span>\u062d\u0630\u0641</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border pt-3 text-xs sm:grid-cols-4">
                        <DetailRow
                          icon={Phone}
                          label="\u0627\u0644\u0647\u0627\u062a\u0641"
                          value={app.phone}
                          contacted={!!app.contacted}
                          phoneLink
                        />
                        <DetailRow
                          icon={MessageCircle}
                          label="\u0648\u0627\u062a\u0633\u0627\u0628"
                          value={app.whatsapp || '-'}
                          contacted={!!app.contacted}
                          phoneLink={!!app.whatsapp}
                          whatsappLink
                        />
                        <DetailRow
                          icon={GraduationCap}
                          label="\u0627\u0644\u0645\u0624\u0647\u0644"
                          value={app.qualification}
                          contacted={!!app.contacted}
                        />
                        <DetailRow
                          icon={Award}
                          label="\u0627\u0644\u062a\u0642\u062f\u064a\u0631"
                          value={app.grade || '-'}
                          contacted={!!app.contacted}
                        />
                        {app.subject && (
                          <DetailRow
                            icon={BookMarked}
                            label="\u0627\u0644\u0645\u0627\u062f\u0629"
                            value={app.subject}
                            contacted={!!app.contacted}
                          />
                        )}
                        <DetailRow
                          icon={Calendar}
                          label="\u0633\u0646\u0629 \u0627\u0644\u062a\u062e\u0631\u064a\u062c"
                          value={app.graduationYear || '-'}
                          contacted={!!app.contacted}
                        />
                        <DetailRow
                          icon={Globe}
                          label="\u062e\u0628\u0631\u0629 \u0623\u0648\u0646 \u0644\u0627\u064a\u0646"
                          value={`${app.onlineYears || '0'} \u0633\u0646\u0629`}
                          contacted={!!app.contacted}
                        />
                        <DetailRow
                          icon={Calendar}
                          label="\u0627\u0644\u062a\u0627\u0631\u064a\u062e"
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
                            <p className="mb-0.5 text-[10px] font-bold text-muted">
                              \u0627\u0644\u0645\u0646\u0627\u0647\u062c
                            </p>
                            <span className="text-[10px] font-bold text-main">
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
  icon: React.FC<{ size?: number; className?: string }>
  label: string
  value: string
  contacted?: boolean
  phoneLink?: boolean
  whatsappLink?: boolean
}) => {
  const cleanPhone = value.replace(/\s/g, '')
  const content = (
    <div className={cn('flex items-center gap-2', contacted && 'opacity-50')}>
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon size={10} className={contacted ? 'text-muted' : 'text-primary'} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted">{label}</p>
        <span
          className={cn(
            'block truncate text-[10px] font-bold',
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
          href={`https://wa.me/${cleanPhone.replace(/^\+/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-bold text-success hover:underline"
        >
          {content}
        </a>
      </div>
    )
  }

  if (phoneLink && value && value !== '-') {
    return (
      <a href={`tel:${cleanPhone}`} className="flex items-center gap-1">
        {content}
      </a>
    )
  }

  return content
}
