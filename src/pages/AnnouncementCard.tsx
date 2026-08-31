import { Edit3, Trash2, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '../lib/utils'
import { announcementTypeOf } from '../features/announcements/types'
import type { Announcement } from '../features/announcements/types'

interface AnnouncementCardProps {
  announcement: Announcement
  onEdit?: (ann: Announcement) => void
  onDelete?: (id: string) => void
}

export const AnnouncementCard = ({
  announcement: ann,
  onEdit,
  onDelete,
}: AnnouncementCardProps) => {
  const meta = announcementTypeOf(ann.type)
  const Icon = meta.icon
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-card border border-border bg-card p-4 shadow-sm transition-all duration-300 dark:bg-surface md:p-5',
        !ann.isActive && 'border-dashed opacity-60 grayscale',
      )}
    >
      <div className="flex-1 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                meta.iconBg,
              )}
            >
              <Icon size={18} className={meta.iconText} />
            </div>
            <div>
              <span
                className={cn(
                  'mb-0.5 inline-flex items-center rounded-lg px-2 py-0.5 text-micro font-bold',
                  meta.badge,
                )}
              >
                {meta.label}
              </span>
              <p className="text-micro font-bold text-muted">
                {format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}
              </p>
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1.5">
              {onEdit && (
                <button
                  onClick={() => onEdit(ann)}
                  aria-label={`تعديل الإعلان: ${ann.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-all hover:bg-primary hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                >
                  <Edit3 size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(ann.id)}
                  aria-label={`حذف الإعلان: ${ann.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-error transition-all hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2 md:space-y-3">
          <h3 className="text-sm font-bold leading-tight text-main md:text-base">{ann.title}</h3>
          <p className="line-clamp-4 border-s-2 border-border ps-2 text-micro font-bold leading-relaxed text-muted md:ps-3 md:text-xs">
            {ann.content}
          </p>
        </div>
      </div>
      {!ann.isActive && (
        <div className="mt-5 border-t border-dashed border-border pt-3">
          <span className="flex items-center gap-1.5 text-micro font-bold text-warning-dark dark:text-primary">
            <Info size={10} /> غير نشط
          </span>
        </div>
      )}
    </div>
  )
}
