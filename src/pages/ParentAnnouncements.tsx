import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Search,
  Clock,
  ShieldCheck,
  Grid,
  Zap,
  Umbrella,
  MessageCircle,
  AlertTriangle,
  ChevronDown,
  Calendar,
} from 'lucide-react'
import { api, safeArray } from '../lib/api'
import { useAdminPhone, useAcademyName } from '../context/AppContext'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { LucideIcon } from 'lucide-react'
import { Skeleton, EmptyState } from '../shared/components/ui'
import { announcementTypeOf } from '../features/announcements/types'
import type { Announcement } from '../features/announcements/types'

export const ParentAnnouncements = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الإعلانات | ${academyName}`
  }, [academyName])
  const adminPhone = useAdminPhone()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // نفس مفتاح الكاش ونفس شكل الاستجابة (قائمة كاملة) — الفلترة في select وليس queryFn
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
    select: (data) => data.filter((a) => a.isActive),
  })

  const filteredAnnouncements = useMemo(
    () =>
      announcements
        .filter(
          (ann) =>
            (filterType === 'all' || ann.type === filterType) &&
            ((ann.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
              (ann.content || '').toLowerCase().includes((searchQuery || '').toLowerCase())),
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [announcements, filterType, searchQuery],
  )

  // رابط واتساب فقط عند توفر رقم فعلي — بلا أرقام وهمية
  const waPhone = useMemo(() => {
    const digits = (adminPhone || '').replace(/\D/g, '').replace(/^0/, '20')
    return digits.length >= 10 ? digits : null
  }, [adminPhone])

  if (isLoading) {
    return (
      <div className="min-h-full space-y-4 bg-background pb-2 pt-3 md:space-y-5 md:pt-8" dir="rtl">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full space-y-4 bg-background pb-2 pt-3 md:space-y-5 md:pt-8" dir="rtl">
      {/* الترويسة */}
      <div className="rounded-2xl border border-border bg-card px-4 py-6 md:px-6 md:py-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-micro font-bold text-primary">
              آخر إعلانات المؤسسة
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold leading-tight text-main md:text-2xl">
            آخر إعلانات {academyName}
          </h1>
          <p className="text-xs font-bold text-muted">
            تابع كل أخبار المؤسسة والفعاليات والإعلانات هنا
          </p>
        </div>
      </div>

      {/* البحث والفلاتر */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            aria-label="بحث عن إعلان"
            placeholder="بحث عن إعلان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card pe-3 ps-10 text-xs font-bold text-main shadow-elevation-1 transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:h-12 md:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
          <FilterButton
            label="كل شيء"
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
            icon={Grid}
            activeColor="var(--bg-primary)"
            activeTextColor="text-on-primary"
          />
          <FilterButton
            label="عاجل"
            active={filterType === 'urgent'}
            onClick={() => setFilterType('urgent')}
            icon={Zap}
            activeColor="var(--bg-error)"
            activeTextColor="text-on-error"
          />
          <FilterButton
            label="إجازة"
            active={filterType === 'holiday'}
            onClick={() => setFilterType('holiday')}
            icon={Umbrella}
            activeColor="var(--bg-warning)"
            activeTextColor="text-on-warning"
          />
          <FilterButton
            label="عام"
            active={filterType === 'general'}
            onClick={() => setFilterType('general')}
            icon={Calendar}
            activeColor="var(--bg-primary)"
            activeTextColor="text-on-primary"
          />
        </div>
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {isError ? (
          <div className="bg-error-soft/50 col-span-full rounded-2xl border border-dashed border-error-soft py-16 text-center">
            <AlertTriangle size={30} className="mx-auto mb-3 text-error" strokeWidth={1.5} />
            <p className="text-sm font-bold text-main">تعذر تحميل الإعلانات</p>
            <button
              onClick={() => refetch()}
              className="mx-auto mt-4 block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((ann, idx) => {
              const config = announcementTypeOf(ann.type)
              const isExpanded = expandedIds.has(ann.id)
              const isLong = (ann.content || '').length > 220
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                  key={ann.id}
                  className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-micro font-bold text-muted">
                      <Clock size={12} />
                      {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                    </div>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1 text-micro font-bold',
                        config.badge,
                      )}
                    >
                      {ann.type === 'urgent' && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70" />
                      )}
                      {config.label}
                    </span>
                  </div>

                  <div className="mb-5 flex-1 space-y-2.5">
                    <h3 className="text-sm font-bold leading-tight text-main md:text-lg">
                      {ann.title}
                    </h3>
                    <p
                      className={cn(
                        'whitespace-pre-line text-xs font-bold leading-relaxed text-muted',
                        !isExpanded && 'line-clamp-4',
                      )}
                    >
                      {ann.content}
                    </p>
                    {isLong && (
                      <button
                        onClick={() =>
                          setExpandedIds((prev) => {
                            const next = new Set(prev)
                            if (next.has(ann.id)) next.delete(ann.id)
                            else next.add(ann.id)
                            return next
                          })
                        }
                        aria-expanded={isExpanded}
                        className="flex items-center gap-1 text-micro font-bold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
                        <ChevronDown
                          size={11}
                          className={cn('transition-transform', isExpanded && 'rotate-180')}
                        />
                      </button>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft">
                        <ShieldCheck size={14} className="text-primary" />
                      </div>
                      <span className="text-micro font-bold text-muted">إدارة المؤسسة</span>
                    </div>

                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`مرحباً ${academyName}،\nلدي استفسار بخصوص الإعلان: «${ann.title}» المنشور بتاريخ ${format(new Date(ann.date), 'dd/MM/yyyy')}.\nشكراً لكم.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-primary px-4 py-1.5 text-micro font-bold text-primary transition-all hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                      >
                        <MessageCircle size={14} />
                        استفسار
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {!isError && filteredAnnouncements.length === 0 && (
          <EmptyState
            icon={Bell}
            compact
            title="لا توجد إعلانات حالياً"
            subtitle={
              searchQuery
                ? `لا نتائج مطابقة لـ "${searchQuery}"`
                : 'تابع أحدث الإعلانات والأخبار هنا'
            }
            className="col-span-full rounded-2xl border border-dashed border-border bg-card"
          />
        )}
      </div>
    </div>
  )
}

const FilterButton = ({
  label,
  active,
  onClick,
  icon: Icon,
  activeColor,
  activeTextColor = 'text-on-primary',
}: {
  label: string
  active: boolean
  onClick: () => void
  icon: LucideIcon
  activeColor: string
  activeTextColor?: string
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'flex items-center justify-between rounded-xl border px-4 py-3.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:text-xs',
      active
        ? `${activeTextColor} border-transparent`
        : 'border-border bg-card text-muted hover:bg-surface',
    )}
    style={active ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
  >
    <span>{label}</span>
    <Icon size={14} className={active ? 'opacity-100' : 'opacity-40'} />
  </button>
)
