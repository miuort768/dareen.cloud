import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  Trash2,
  Phone,
  MessageCircle,
  Search,
  Clock,
  Globe,
  Inbox,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { BLOG_COUNTRIES, COUNTRY_CURRICULUM } from '../components/blog/blogCustomers'
import type { BlogCustomer } from '../components/blog/blogCustomers'
import { api, safeArray } from '../lib/api'
import { confirm } from '../lib/confirmDialog'
import { motion } from 'framer-motion'
import { useIsLoading, useAcademyName } from '../context/AppContext'
import { cn } from '../lib/utils'
import { Skeleton } from '../shared/components/ui'

interface CountryStyle {
  badge: string
  iconBg: string
  iconColor: string
  dot: string
}

const COUNTRY_STYLES: Record<string, CountryStyle> = {
  الكويت: {
    badge: 'bg-info-soft text-info-dark',
    iconBg: 'bg-info-soft',
    iconColor: 'text-info-dark',
    dot: 'bg-info',
  },
  السعودية: {
    badge: 'bg-success-soft text-success',
    iconBg: 'bg-success-soft',
    iconColor: 'text-success',
    dot: 'bg-success',
  },
  قطر: {
    badge: 'bg-warning-soft text-warning',
    iconBg: 'bg-warning-soft',
    iconColor: 'text-warning',
    dot: 'bg-warning',
  },
  الإمارات: {
    badge: 'bg-error-soft text-error',
    iconBg: 'bg-error-soft',
    iconColor: 'text-error',
    dot: 'bg-error',
  },
  عمان: {
    badge: 'bg-primary-soft text-primary',
    iconBg: 'bg-primary-soft',
    iconColor: 'text-primary',
    dot: 'bg-primary',
  },
  الأردن: {
    badge: 'bg-info-soft text-info-dark',
    iconBg: 'bg-info-soft',
    iconColor: 'text-info-dark',
    dot: 'bg-info',
  },
}

const FALLBACK_STYLE: CountryStyle = {
  badge: 'bg-primary-soft text-primary',
  iconBg: 'bg-primary-soft',
  iconColor: 'text-primary',
  dot: 'bg-primary',
}

const getCountryStyle = (country: string) => COUNTRY_STYLES[country] || FALLBACK_STYLE

const CONTACT_LINK_CLASS =
  'inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg bg-success-soft px-2.5 py-2 text-[10px] font-bold text-success transition-colors hover:bg-success-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95'

const FILTER_CHIP_CLASS =
  'flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]'

export const AdminBlogCustomers = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `عملاء المدونة | ${academyName}`
  }, [academyName])
  const queryClient = useQueryClient()
  const authLoading = useIsLoading()
  const {
    data: customers = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<BlogCustomer[], Error>({
    queryKey: ['blog-customers'],
    queryFn: () => api.get('/blog-customers'),
    select: (data) =>
      safeArray<BlogCustomer>(data).map((c) => ({ ...c, phone: String(c.phone ?? '') })),
    enabled: !authLoading,
  })
  const error = queryError?.message || null
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      message: 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.',
      title: 'حذف العميل',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true,
      icon: <Trash2 size={28} />,
    })
    if (!confirmed) return
    try {
      await api.delete(`/blog-customers/${id}`)
      queryClient.invalidateQueries({ queryKey: ['blog-customers'] })
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const q = search.trim().toLowerCase()
        if (countryFilter && c.country !== countryFilter) return false
        if (!q) return true
        return (
          (c.country || '').toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          (COUNTRY_CURRICULUM[c.country] || '').toLowerCase().includes(q)
        )
      }),
    [customers, search, countryFilter],
  )

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const todayCount = useMemo(
    () =>
      customers.filter((c) => {
        const d = new Date(c.createdAt)
        const now = new Date()
        return d.toDateString() === now.toDateString()
      }).length,
    [customers],
  )

  const weekCount = useMemo(() => {
    const now = new Date()
    const day = (now.getDay() + 6) % 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - day)
    weekStart.setHours(0, 0, 0, 0)
    return customers.filter((c) => new Date(c.createdAt) >= weekStart).length
  }, [customers])

  const uniqueCountries = useMemo(
    () => new Set(customers.map((c) => c.country).filter(Boolean)).size,
    [customers],
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي العملاء',
        value: customers.length,
        icon: Users,
        gradient: 'bg-gradient-to-br from-primary-soft to-transparent',
        iconBg: 'bg-primary-soft text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'عملاء اليوم',
        value: todayCount,
        icon: Calendar,
        gradient: 'bg-gradient-to-br from-info-soft to-transparent',
        iconBg: 'bg-info-soft text-info-dark',
        accent: 'bg-info',
      },
      {
        label: 'عدد الدول',
        value: uniqueCountries,
        icon: Globe,
        gradient: 'bg-gradient-to-br from-success-soft to-transparent',
        iconBg: 'bg-success-soft text-success',
        accent: 'bg-success',
      },
      {
        label: 'عملاء الأسبوع',
        value: weekCount,
        icon: TrendingUp,
        gradient: 'bg-gradient-to-br from-warning-soft to-transparent',
        iconBg: 'bg-warning-soft text-warning',
        accent: 'bg-warning',
      },
    ],
    [customers.length, todayCount, uniqueCountries, weekCount],
  )

  return (
    <div className="relative min-h-full overflow-x-hidden bg-background pb-24" dir="rtl">
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
                <Mail size={22} className="text-on-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight text-main">عملاء المدونة</h1>
                <p className="mt-0.5 text-xs text-muted">
                  عملاء النشرة البريدية — الدولة ورقم الهاتف
                </p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="grid flex-1 grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-xl font-black tabular-nums leading-none text-primary">
                  {customers.length}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">الإجمالي</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-xl font-black tabular-nums leading-none text-success">
                  {todayCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">اليوم</p>
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
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-4',
                    kpi.gradient,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                    <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
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
          <div className="mb-3 space-y-3 rounded-2xl border border-border bg-card p-3.5">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
              <input
                type="text"
                placeholder="بحث بالدولة أو رقم الهاتف..."
                aria-label="ابحث في عملاء المدونة"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-9 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCountryFilter('')}
                aria-pressed={countryFilter === ''}
                className={cn(
                  FILTER_CHIP_CLASS,
                  countryFilter === ''
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-border bg-card text-muted hover:bg-hover',
                )}
              >
                الكل
              </button>
              {BLOG_COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountryFilter(c)}
                  aria-pressed={countryFilter === c}
                  className={cn(
                    FILTER_CHIP_CLASS,
                    countryFilter === c
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'border border-border bg-card text-muted hover:bg-hover',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="space-y-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`skel-${i}`}
                    className="rounded-xl border border-border bg-card p-4 md:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-2.5 w-14" />
                        </div>
                      </div>
                      <Skeleton className="hidden h-9 w-24 rounded-lg sm:block" />
                    </div>
                    <div className="flex gap-1.5">
                      <Skeleton className="h-6 w-32 rounded-lg" />
                      <Skeleton className="h-6 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-error bg-card p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-error-soft">
                  <AlertCircle size={20} className="text-error" />
                </div>
                <p className="text-xs font-bold text-error">{error}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-on-primary transition-colors hover:bg-primary-hover active:scale-[0.97]"
                >
                  إعادة المحاولة
                </button>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <Inbox size={22} className="text-primary" />
                </div>
                <p className="text-base font-bold text-main">لا يوجد عملاء</p>
                <p className="mt-1.5 text-xs text-muted">سيظهر عملاء النشرة البريدية هنا</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filtered.map((cust, index) => {
                  const style = getCountryStyle(cust.country)
                  return (
                    <motion.div
                      key={cust.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="h-0.5 w-full bg-gradient-to-r from-primary to-primary-light" />
                      <div className="relative z-10 p-4 md:p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                                style.iconBg,
                              )}
                            >
                              <Globe size={15} className={style.iconColor} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-main">{cust.country}</h3>
                              <p className="truncate text-[11px] text-muted">
                                {COUNTRY_CURRICULUM[cust.country] || 'دولة أخرى'}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                            <a
                              href={`tel:${cust.phone}`}
                              className={CONTACT_LINK_CLASS}
                              aria-label={`اتصال بـ ${cust.phone}`}
                            >
                              <Phone size={13} />
                            </a>
                            <a
                              href={`https://wa.me/${cust.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={CONTACT_LINK_CLASS}
                              aria-label="مراسلة عبر واتساب"
                            >
                              <MessageCircle size={13} />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDelete(cust.id)}
                              className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg bg-error-soft px-2.5 py-2 text-[10px] font-semibold text-error transition-colors hover:bg-error-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                              aria-label="حذف العميل"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-lg bg-background px-2 py-1 text-[10px] font-bold text-main"
                            dir="ltr"
                          >
                            <span className="max-w-[140px] truncate">{cust.phone}</span>
                            <Phone size={10} className="text-success" />
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold',
                              style.badge,
                            )}
                          >
                            <span className="max-w-[100px] truncate">
                              {COUNTRY_CURRICULUM[cust.country] || cust.country}
                            </span>
                            <BookOpen size={10} />
                          </span>
                          <span className="hidden items-center gap-1 rounded-lg bg-background px-2 py-1 text-[10px] font-bold text-muted sm:inline-flex">
                            <span>{formatDate(cust.createdAt)}</span>
                            <Clock size={10} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
