import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, AlertTriangle, X, Check, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { announcementTypeOf } from '../../announcements/types'
import type { Announcement } from '../../announcements/types'

const DISMISSED_KEY = 'dismissed_announcements'

/** قراءة آمنة لقائمة المُسلَّم منها — لا تكسر الشجرة عند قيمة تالفة */
const loadDismissedIds = (): string[] => {
  try {
    const saved = localStorage.getItem(DISMISSED_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export const ModernAnnouncements = () => {
  const [rawAnnouncements, setRawAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>(loadDismissedIds)
  const [currentIndex, setCurrentIndex] = useState(0)
  // الإعلان المثبّت للإقرار — يمنع تبديل المحتوى أثناء الدوران التلقائي
  const [ackTarget, setAckTarget] = useState<Announcement | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  // جلب واحد فقط — بلا عاصفة refetch عند كل استبعاد
  useEffect(() => {
    let cancelled = false
    const fetchAnnouncements = async () => {
      try {
        const data = await api.get<Announcement[]>('/announcements')
        if (!cancelled) setRawAnnouncements(data?.filter((a) => a.isActive) || [])
      } catch (err) {
        console.error('Error fetching announcements:', err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAnnouncements()
    return () => {
      cancelled = true
    }
  }, [])

  const announcements = useMemo(
    () => rawAnnouncements.filter((a) => !dismissedIds.includes(a.id)),
    [rawAnnouncements, dismissedIds],
  )

  // إبقاء الفهرس داخل الحدود بعد أي تغيير للقائمة
  useEffect(() => {
    setCurrentIndex((prev) =>
      announcements.length === 0 ? 0 : Math.min(prev, announcements.length - 1),
    )
  }, [announcements.length])

  // دوران تلقائي كل 8 ثوانٍ — يتوقف أثناء نافذة الإقرار (WCAG 2.2.2)
  useEffect(() => {
    if (ackTarget !== null || announcements.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [announcements.length, ackTarget])

  const current = announcements[currentIndex]

  const handleDismiss = useCallback((target: Announcement) => {
    setDismissedIds((prev) => {
      const updated = [...prev, target.id]
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed persisting dismissal', e)
      }
      return updated
    })
    setAckTarget(null)
    setCurrentIndex(0)
  }, [])

  // Escape + تركيز أولي لنافذة الإقرار (محمولة عبر portal)
  useEffect(() => {
    if (!ackTarget) return
    confirmBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAckTarget(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ackTarget])

  if (loading || (!error && announcements.length === 0)) return null

  if (error) {
    return (
      <div
        dir="rtl"
        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 dark:border-primary/20"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-error">
          <AlertTriangle size={14} />
          تعذر تحميل الإعلانات
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-xs font-bold"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={12} /> إعادة
        </Button>
      </div>
    )
  }

  if (!current) return null

  const type = announcementTypeOf(current.type)
  const TypeIcon = type.icon

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card font-dash dark:border-primary/20 dark:bg-card"
      dir="rtl"
    >
      {/* الرأس: النوع + العداد + التنقل */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-micro font-bold',
            type.badge,
          )}
        >
          <TypeIcon size={12} />
          {type.label}
        </span>

        <div className="flex items-center gap-1.5">
          {announcements.length > 1 && (
            <>
              <span className="rounded-lg bg-surface px-2 py-0.5 text-micro font-semibold tabular-nums text-muted">
                {currentIndex + 1} / {announcements.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentIndex(
                    (prev) => (prev - 1 + announcements.length) % announcements.length,
                  )
                }
                aria-label="الإعلان السابق"
                className="h-7 w-7 rounded-lg"
              >
                <ChevronRight size={13} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                aria-label="الإعلان التالي"
                className="h-7 w-7 rounded-lg"
              >
                <ChevronLeft size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* المحتوى القابل للنقر للإقرار */}
      <button
        type="button"
        onClick={() => setAckTarget(current)}
        aria-haspopup="dialog"
        className="block w-full cursor-pointer p-5 text-start transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
      >
        <div key={current.id}>
          <Badge
            variant="outline"
            className={cn('h-5 rounded-lg border px-2 text-micro', type.badge)}
          >
            {current.date}
          </Badge>
          <h4 className="mb-1 mt-2 text-xs font-bold leading-tight text-main">{current.title}</h4>
          <p className="line-clamp-2 text-micro leading-relaxed text-muted">{current.content}</p>
        </div>
      </button>

      {/* شريط التقدم */}
      <div className="relative h-1 w-full bg-surface">
        <div
          className="absolute start-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
        />
      </div>

      {/* نافذة تأكيد القراءة — مثبتة على الإعلان المفتوح */}
      {ackTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="تأكيد قراءة الإعلان"
            onClick={() => setAckTarget(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    ackTarget && announcementTypeOf(ackTarget.type).iconBg,
                  )}
                >
                  {(() => {
                    const AckIcon = announcementTypeOf(ackTarget.type).icon
                    return (
                      <AckIcon size={22} className={announcementTypeOf(ackTarget.type).iconText} />
                    )
                  })()}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight text-main">تأكيد القراءة</h3>
                  <p className="mt-0.5 text-micro font-medium text-muted">إشعار الامتثال</p>
                </div>
                <button
                  onClick={() => setAckTarget(null)}
                  aria-label="إغلاق"
                  className="ms-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-muted transition-colors hover:bg-hover hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:h-9 md:w-9"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mb-5 rounded-xl border-s-4 border-primary bg-surface p-4">
                <p className="text-sm font-bold leading-relaxed text-main">«{ackTarget.title}»</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {ackTarget.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  ref={confirmBtnRef}
                  onClick={() => handleDismiss(ackTarget)}
                  className="h-10 gap-1.5 rounded-xl text-xs font-bold"
                >
                  <Check size={14} />
                  موافق، تم الاطلاع
                </Button>
                <Button
                  onClick={() => setAckTarget(null)}
                  variant="outline"
                  className="h-10 gap-1.5 rounded-xl text-xs font-bold"
                >
                  <X size={14} />
                  إغلاق
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
