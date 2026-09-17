import { useNavigate } from 'react-router-dom'
import { Megaphone, ArrowLeft } from 'lucide-react'

interface AnnouncementsBannerProps {
  href: string
  label: string
  description: string
}

/** شريط تنقّل خفيف للإعلانات — يستخدم في لوحات الطالب وولي الأمر */
export const AnnouncementsBanner = ({ href, label, description }: AnnouncementsBannerProps) => {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(href)}
      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-start shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:bg-hover hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      aria-label={`فتح ${label}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning-strong">
        <Megaphone size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-black text-main">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] font-bold text-muted">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning-strong transition-transform duration-normal group-hover:-translate-x-1"
      >
        <ArrowLeft size={16} />
      </span>
    </button>
  )
}
