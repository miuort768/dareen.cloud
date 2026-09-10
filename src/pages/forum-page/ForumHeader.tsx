import { Search, X, MessagesSquare, Users } from 'lucide-react'
import { TimeOfDayBadge } from '../../shared/components/TimeOfDayBadge'

interface ForumHeaderProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  participants: number
}

/**
 * هيرو المنتدى الحصري — نفس اللغة البصرية لهيرو المكتبة:
 * تدرج هوية + شبكة خفيفة + حلقات زخرفية + شارة الوقت + نبض مجتمع حي + بحث زجاجي
 */
export const ForumHeader = ({ searchTerm, onSearchChange, participants }: ForumHeaderProps) => (
  <div
    className="relative mb-5 overflow-hidden rounded-card border border-divider bg-gradient-to-bl from-primary-deep via-primary to-primary-hover shadow-elevation-2"
    dir="rtl"
  >
    {/* زخارف: شبكة خفيفة + حلقات + توهجات */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -end-20 -top-24 h-64 w-64 rounded-full border border-white/10"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -end-6 -top-10 h-36 w-36 rounded-full border border-white/5"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -bottom-16 -start-12 h-44 w-44 rounded-full bg-white/5"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-transparent to-white/5"
      aria-hidden="true"
    />

    <div className="relative z-10 p-5 sm:p-6">
      {/* الصف الأول: هوية + شارة الوقت */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-on-primary shadow-elevation-1 backdrop-blur-sm">
            <MessagesSquare size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="mb-1 truncate font-heading text-xl font-black leading-tight text-on-primary sm:text-2xl">
              منتدى دارين
            </h1>
            <p className="text-[11px] font-medium leading-relaxed text-white/90 sm:text-xs">
              مجتمع تعليمي يجمع المعلمات والطلاب وأولياء الأمور لتبادل المعرفة والخبرات.
            </p>
          </div>
        </div>
        <TimeOfDayBadge variant="glass" />
      </div>

      {/* الصف الثاني: نبض المجتمع + البحث */}
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-bold text-on-primary backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <Users size={12} />
          {participants} مشارك في المجتمع
        </span>

        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-white/90"
          />
          <input
            type="text"
            aria-label="بحث في المنتدى"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في المنشورات..."
            className="h-11 w-full rounded-xl border border-white/20 bg-white/10 pe-9 ps-10 text-xs font-bold text-on-primary outline-none backdrop-blur-sm transition-all placeholder:text-white/80 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="مسح البحث"
              className="absolute end-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-white/90 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)
