import { useNavigate } from 'react-router-dom'
import { Megaphone, ArrowLeft } from 'lucide-react'

interface AnnouncementsBannerProps {
  href: string
  label: string
  description: string
}

/** شريط تنقّل بارز للإعلانات — يستخدم في لوحات الطالب وولي الأمر */
export const AnnouncementsBanner = ({ href, label, description }: AnnouncementsBannerProps) => {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(href)}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-l from-primary to-primary-hover px-4 py-3.5 text-start shadow-elevation-2 shadow-black/20 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-3 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]"
      aria-label={`فتح ${label}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -end-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl"
      />
      <span
        aria-hidden
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-on-primary ring-1 ring-white/25"
      >
        <Megaphone size={18} />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-xs font-black text-on-primary">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] font-bold text-on-primary opacity-80">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-on-primary transition-transform duration-normal group-hover:-translate-x-1"
      >
        <ArrowLeft size={16} />
      </span>
    </button>
  )
}
