import { Search, X, MessagesSquare } from 'lucide-react'
import { useAcademyName } from '../../context/AppContext'

interface ForumHeaderProps {
  searchTerm: string
  onSearchChange: (v: string) => void
}

/**
 * هيرو المنتدى — خلفية متدرجة مع أيقونة وعنوان ووصف، يطابق أسلوب صفحة الإعلانات.
 */
export const ForumHeader = ({ searchTerm, onSearchChange }: ForumHeaderProps) => {
  const academyName = useAcademyName()

  return (
    <section
      aria-label="المنتدى"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover shadow-elevation-2"
    >
      {/* زخارف */}
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

      <div className="relative z-10 flex flex-col gap-4 p-5 md:p-6">
        {/* العنوان والوصف */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-elevation-3 backdrop-blur-sm">
            <MessagesSquare size={22} className="text-on-primary" />
          </div>
          <div>
            <span className="mb-1.5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-on-primary backdrop-blur-sm">
              تواصل وشارك
            </span>
            <h1 className="text-sm font-black leading-tight text-on-primary md:text-2xl">
              منتدى {academyName}
            </h1>
            <p className="mt-1 text-xs font-bold text-white/90">
              شارك أفكارك وأسئلتك مع مجتمع دارين
            </p>
          </div>
        </div>

        {/* حقل البحث */}
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-white/60"
          />
          <input
            type="text"
            aria-label="بحث في المنتدى"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في المنشورات..."
            className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pe-9 ps-10 text-xs font-bold text-on-primary outline-none backdrop-blur-sm transition-all placeholder:text-white/50 focus:border-white/30 focus:ring-2 focus:ring-white/20"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="مسح البحث"
              className="absolute end-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-white/60 outline-none transition-colors hover:text-on-primary focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
