import { useNavigate } from 'react-router-dom'
import { Megaphone, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AnnouncementsBannerProps {
  href: string
  label: string
  description: string
  variant?: 'brand' | 'classic'
}

/** شريط تنقّل بارز للإعلانات — يستخدم في لوحات الطالب وولي الأمر */
export const AnnouncementsBanner = ({
  href,
  label,
  description,
  variant = 'brand',
}: AnnouncementsBannerProps) => {
  const navigate = useNavigate()
  const isClassic = variant === 'classic'

  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-start shadow-elevation-2 shadow-black/20 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]',
        isClassic
          ? 'bg-gold text-black hover:bg-gold-hover dark:bg-info dark:text-white dark:hover:bg-info-hover'
          : 'bg-gradient-to-l from-primary to-primary-hover text-on-primary hover:brightness-110',
      )}
      aria-label={`فتح ${label}`}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -end-8 -top-10 h-24 w-24 rounded-full blur-2xl',
          isClassic ? 'bg-black/5 dark:bg-white/10' : 'bg-white/10',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1',
          isClassic
            ? 'bg-black/10 text-black ring-black/10 dark:bg-white/20 dark:text-white dark:ring-white/25'
            : 'bg-white/20 text-on-primary ring-white/25',
        )}
      >
        <Megaphone size={18} />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-xs font-black">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] font-bold opacity-80">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-normal group-hover:-translate-x-1',
          isClassic
            ? 'bg-black/10 text-black dark:bg-white/15 dark:text-white'
            : 'bg-white/15 text-on-primary',
        )}
      >
        <ArrowLeft size={16} />
      </span>
    </button>
  )
}
