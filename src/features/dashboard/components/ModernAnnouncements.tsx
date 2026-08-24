import { useState, useEffect } from 'react'
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Info,
  X,
  Check,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'urgent' | 'holiday' | 'event'
  date: string
  isActive: boolean
}

export const ModernAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissed_announcements')
    return saved ? JSON.parse(saved) : []
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAcknowledge, setShowAcknowledge] = useState(false)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.get<Announcement[]>('/announcements')
        const active = data?.filter((a) => a.isActive && !dismissedIds.includes(a.id)) || []
        setAnnouncements(active)
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [dismissedIds])

  useEffect(() => {
    if (announcements.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [announcements.length])

  if (loading || announcements.length === 0) return null

  const current = announcements[currentIndex]
  if (!current) return null

  const getTypeDetails = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          icon: AlertTriangle,
          color: 'text-error',
          bg: 'bg-error-soft',
          label: 'تنبيه عاجل',
        }
      case 'holiday':
        return {
          icon: Calendar,
          color: 'text-warning',
          bg: 'bg-warning-soft',
          label: 'إجازة رسمية',
        }
      case 'event':
        return {
          icon: Megaphone,
          color: 'text-primary',
          bg: 'bg-primary-soft',
          label: 'فعالية قادمة',
        }
      default:
        return { icon: Info, color: 'text-success', bg: 'bg-success-soft', label: 'إعلان عام' }
    }
  }

  const type = getTypeDetails(current.type)

  const handleDismiss = () => {
    const updated = [...dismissedIds, current.id]
    setDismissedIds(updated)
    localStorage.setItem('dismissed_announcements', JSON.stringify(updated))
    setShowAcknowledge(false)
    setCurrentIndex(0)
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card font-dash dark:border-primary/20 dark:bg-card"
      dir="rtl"
    >
      <div className="flex flex-col items-stretch md:flex-row">
        {/* Type Indicator */}
        <div
          onClick={() => setShowAcknowledge(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowAcknowledge(true)
            }
          }}
          aria-expanded={showAcknowledge}
          className={cn(
            'flex w-full cursor-pointer flex-row items-center justify-center gap-2.5 border-b border-border p-4 transition-colors md:w-24 md:flex-col md:border-b-0 md:border-s',
            type.bg,
          )}
        >
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', type.bg)}>
            <type.icon size={18} className={type.color} />
          </div>
          <span className={cn('text-center text-[11px] font-bold leading-tight', type.color)}>
            {type.label}
          </span>
        </div>

        {/* Content */}
        <div
          onClick={() => setShowAcknowledge(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowAcknowledge(true)
            }
          }}
          aria-expanded={showAcknowledge}
          className="group relative flex-1 cursor-pointer p-5"
        >
          <div className="absolute end-4 top-3 flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-[10px] font-semibold text-muted dark:bg-surface dark:text-muted">
            <span>
              {currentIndex + 1} / {announcements.length}
            </span>
          </div>

          <div key={current.id} className="mt-2">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('h-5 rounded-lg border px-2 text-[9px]', type.bg, type.color)}
              >
                {current.date}
              </Badge>
            </div>
            <h4 className="mb-1 text-[13px] font-bold leading-tight text-main dark:text-main">
              {current.title}
            </h4>
            <p className="line-clamp-2 text-[11px] leading-relaxed text-muted dark:text-muted">
              {current.content}
            </p>
          </div>

          {announcements.length > 1 && (
            <div
              className="absolute bottom-3 end-4 flex gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentIndex(
                    (prev) => (prev - 1 + announcements.length) % announcements.length,
                  )
                }
                aria-label="السابق"
                className="h-8 w-8 rounded-lg"
              >
                <ChevronRight size={13} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                aria-label="التالي"
                className="h-8 w-8 rounded-lg"
              >
                <ChevronLeft size={13} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1 w-full bg-surface dark:bg-surface">
        <div
          className="absolute start-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
        />
      </div>

      {/* Acknowledgment Modal */}
      {showAcknowledge && (
        <div
          className="bg-background/60 fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm dark:bg-black/70"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowAcknowledge(false)
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl dark:border-primary/20 dark:bg-card">
            <div className="mb-5 flex items-center gap-3">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', type.bg)}>
                <type.icon size={22} className={type.color} />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight text-main dark:text-main">
                  تأكيد القراءة
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-muted dark:text-muted">
                  إشعار الامتثال
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border-s-4 border-primary bg-surface p-4 dark:border-primary dark:bg-surface">
              <p className="text-sm leading-relaxed text-main dark:text-main">
                "{current.content}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDismiss} className="h-10 gap-1.5 rounded-xl text-xs font-bold">
                <Check size={14} />
                موافق، تم الاطلاع
              </Button>
              <Button
                onClick={() => setShowAcknowledge(false)}
                variant="outline"
                className="h-10 gap-1.5 rounded-xl text-xs font-bold"
              >
                <X size={14} />
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
