import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  Trash2,
  Phone,
  MessageCircle,
  Search,
  Clock,
  User,
  BookOpen,
  Inbox,
  Download,
  MailOpen,
  Calendar,
  X,
  AlertTriangle,
} from 'lucide-react'
import { api, safeArray } from '../lib/api'
import { confirm } from '../lib/confirmDialog'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsLoading, useAcademyName } from '../context/AppContext'
import { cn } from '../lib/utils'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS } from '../lib/socket-events'
import { Skeleton, SkeletonText } from '../shared/components/ui/Skeleton'

interface ContactMsg {
  id: string
  name: string
  phone: string
  subject: string
  curriculum: string
  message: string
  createdAt: string
}

const READ_STORAGE_KEY = 'readContactMessages'

function formatDateNumeric(dateStr: string) {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function exportToCsv(messages: ContactMsg[]) {
  const headers = ['الاسم', 'رقم الهاتف', 'المادة', 'الموضوع', 'الرسالة', 'التاريخ']
  const rows = messages.map((m) => [
    m.name || 'بدون اسم',
    m.phone || '',
    m.curriculum || '-',
    m.subject || 'بدون موضوع',
    (m.message || '').replace(/\n/g, ' '),
    formatDateNumeric(m.createdAt),
  ])
  const bom = '﻿'
  const csv =
    bom + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contact-messages.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const AdminContacts = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `رسائل التواصل | ${academyName}`
  }, [academyName])
  const queryClient = useQueryClient()
  const authLoading = useIsLoading()

  const {
    data: messages = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<ContactMsg[], Error>({
    queryKey: ['contacts'],
    queryFn: () => api.get('/contact'),
    select: (data) => safeArray<ContactMsg>(data),
    enabled: !authLoading,
    retry: 1,
    refetchInterval: 30000,
  })
  const error = queryError?.message || null

  const [search, setSearch] = useState('')
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all')
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readIds))
    } catch {
      /* noop */
    }
  }, [readIds])

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  useEffect(() => {
    const socket = socketService.connect()
    if (!socket) return
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
    socket.on(SOCKET_EVENTS.CONTACT_MESSAGE_RECEIVED, handleNewMessage)
    return () => {
      socket.off(SOCKET_EVENTS.CONTACT_MESSAGE_RECEIVED, handleNewMessage)
    }
  }, [queryClient])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      'هل أنت متأكد من حذف هذه الرسالة؟ لن يمكن التراجع عن هذا الإجراء.',
    )
    if (!confirmed) return
    try {
      await api.delete(`/contact/${id}`)
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAll = async () => {
    if (messages.length === 0) return
    const confirmed = await confirm(
      'هل أنت متأكد من حذف جميع الرسائل؟ لن يمكن التراجع عن هذا الإجراء.',
    )
    if (!confirmed) return
    try {
      await Promise.allSettled(messages.map((m) => api.delete(`/contact/${m.id}`)))
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    } catch (err) {
      console.error(err)
    }
  }

  const retryFetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
  }, [queryClient])

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const q = search.trim().toLowerCase()
      const phone = (m.phone || '').replace(/\s/g, '')
      const matchesSearch =
        !q ||
        (m.name || '').toLowerCase().includes(q) ||
        phone.includes(q.replace(/\s/g, '')) ||
        (m.subject || '').toLowerCase().includes(q) ||
        (m.message || '').toLowerCase().includes(q) ||
        (m.curriculum || '').toLowerCase().includes(q)
      const isMsgRead = readIds.includes(m.id)
      const matchesRead =
        filterRead === 'all' ||
        (filterRead === 'read' && isMsgRead) ||
        (filterRead === 'unread' && !isMsgRead)
      return matchesSearch && matchesRead
    })
  }, [messages, search, filterRead, readIds])

  const unreadCount = useMemo(
    () => messages.filter((m) => !readIds.includes(m.id)).length,
    [messages, readIds],
  )
  const todayCount = useMemo(
    () =>
      messages.filter((m) => {
        const d = new Date(m.createdAt)
        const now = new Date()
        return d.toDateString() === now.toDateString()
      }).length,
    [messages],
  )
  const withPhoneCount = useMemo(
    () => messages.filter((m) => (m.phone || '').replace(/\D/g, '').length >= 7).length,
    [messages],
  )
  const uniqueSubjects = useMemo(
    () => new Set(messages.map((m) => m.subject).filter(Boolean)).size,
    [messages],
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي الرسائل',
        value: messages.length,
        icon: Mail,
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        label: 'رسائل اليوم',
        value: todayCount,
        icon: Calendar,
        color: 'text-info',
        bg: 'bg-info-soft',
      },
      {
        label: 'بها هواتف',
        value: withPhoneCount,
        icon: Phone,
        color: 'text-success',
        bg: 'bg-success-soft',
      },
      {
        label: 'المواضيع',
        value: uniqueSubjects,
        icon: BookOpen,
        color: 'text-warning',
        bg: 'bg-warning-soft',
      },
    ],
    [messages, todayCount, withPhoneCount, uniqueSubjects],
  )

  const readFilterPills = [
    { key: 'all' as const, label: 'الكل', count: messages.length },
    { key: 'unread' as const, label: 'غير مقروءة', count: unreadCount },
    { key: 'read' as const, label: 'مقروءة', count: messages.length - unreadCount },
  ]

  return (
    <div
      className="from-info-soft/40 min-h-full bg-gradient-to-b via-background to-background pb-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl px-2.5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-5 pt-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Mail size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-main">رسائل التواصل</h1>
                <p className="mt-0.5 text-xs text-muted">إدارة ومتابعة رسائل الزوار والعملاء</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCsv(filtered)}
                className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-xs font-bold text-on-success transition-colors duration-fast hover:bg-success-hover active:scale-[0.98]"
              >
                <Download size={14} />
                <span className="hidden sm:inline">تصدير</span>
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 rounded-xl bg-error px-4 py-2.5 text-xs font-bold text-on-error transition-colors duration-fast hover:bg-error-hover active:scale-[0.98]"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">حذف الكل</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn('flex h-9 w-9 items-center justify-center rounded-lg', kpi.bg)}
                    >
                      <Icon size={16} className={kpi.color} />
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
          <div className="relative mb-3">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              type="text"
              aria-label="بحث في الرسائل"
              placeholder="بحث بالاسم أو الهاتف أو الموضوع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-3 pe-4 ps-10 text-xs font-bold text-main transition-colors duration-fast focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted transition-colors duration-fast hover:text-main"
                aria-label="مسح البحث"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {readFilterPills.map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setFilterRead(pill.key)}
                aria-pressed={filterRead === pill.key}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-micro font-bold transition-colors duration-fast active:scale-[0.97]',
                  filterRead === pill.key
                    ? 'bg-primary text-on-primary'
                    : 'border border-border bg-card text-muted hover:border-primary/30 hover:text-main',
                )}
              >
                {pill.label}
                <span
                  className={cn(
                    'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-micro',
                    filterRead === pill.key
                      ? 'bg-white/20 text-on-primary'
                      : 'bg-divider text-muted',
                  )}
                >
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={`skel-${i}`} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/3 rounded-lg" />
                        <Skeleton className="h-2.5 w-1/4 rounded-lg" />
                      </div>
                    </div>
                    <SkeletonText lines={3} className="mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-lg" />
                      <Skeleton className="h-6 w-24 rounded-lg" />
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
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover active:scale-[0.97]"
                >
                  إعادة تحميل
                </button>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Inbox size={24} className="text-primary" />
                </div>
                <p className="mb-1 text-sm font-bold text-main">
                  {messages.length === 0 ? 'لا توجد رسائل' : 'لا توجد نتائج'}
                </p>
                <p className="text-xs text-muted">
                  {messages.length === 0
                    ? 'ستظهر رسائل الزوار هنا'
                    : 'جرّب تغيير كلمة البحث أو الفلتر'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filtered.map((msg, index) => {
                  const isMsgRead = readIds.includes(msg.id)
                  const safePhone = msg.phone || ''
                  return (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={cn(
                        'overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-normal hover:shadow-elevation-1',
                        !isMsgRead && 'border-primary/20',
                      )}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                isMsgRead ? 'bg-success-soft' : 'bg-primary/10',
                              )}
                            >
                              <User
                                size={15}
                                className={isMsgRead ? 'text-success' : 'text-primary'}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-main">
                                  {msg.name || 'بدون اسم'}
                                </h3>
                                {!isMsgRead && (
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}
                                {isMsgRead && (
                                  <span className="rounded-lg bg-success-soft px-1.5 py-0.5 text-micro font-bold text-success">
                                    مقروءة
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-micro text-muted">
                                {msg.subject || 'بدون موضوع'}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {safePhone.replace(/\D/g, '') && (
                              <>
                                <a
                                  href={`tel:${safePhone.replace(/\s/g, '')}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-success transition-colors duration-fast hover:bg-success hover:text-on-success active:scale-95"
                                  aria-label={`اتصال بـ ${safePhone}`}
                                >
                                  <Phone size={14} />
                                </a>
                                <a
                                  href={`https://wa.me/${safePhone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-success transition-colors duration-fast hover:bg-success hover:text-on-success active:scale-95"
                                  aria-label="مراسلة عبر واتساب"
                                >
                                  <MessageCircle size={14} />
                                </a>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => markAsRead(msg.id)}
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-fast active:scale-95',
                                isMsgRead
                                  ? 'bg-success-soft text-success hover:bg-success hover:text-on-success'
                                  : 'bg-surface text-muted hover:bg-hover',
                              )}
                              aria-label={isMsgRead ? 'مقروءة' : 'تحديد كمقروءة'}
                            >
                              <MailOpen size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(msg.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-soft text-error transition-colors duration-fast hover:bg-error hover:text-on-error active:scale-95"
                              aria-label="حذف الرسالة"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="from-info-soft/40 mb-3 rounded-xl border border-divider bg-gradient-to-b via-background to-background p-3.5">
                          <p className="whitespace-pre-wrap text-xs font-bold leading-relaxed text-main">
                            {msg.message || 'لا توجد رسالة'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-micro font-bold text-success">
                            <span className="max-w-[120px] truncate">{safePhone}</span>
                            <Phone size={10} />
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-micro font-bold text-primary">
                            <span className="max-w-[100px] truncate">{msg.curriculum || '-'}</span>
                            <BookOpen size={10} />
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-micro font-bold text-muted">
                            <span>{formatDateNumeric(msg.createdAt)}</span>
                            <Clock size={10} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
