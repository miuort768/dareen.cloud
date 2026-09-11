import { Search, X, MessagesSquare } from 'lucide-react'

interface ForumHeaderProps {
  searchTerm: string
  onSearchChange: (v: string) => void
}

/**
 * هيرو المنتدى — تركيبة مصغّرة بألوان هوية صلبة:
 * أيقونة الدردشة + اسم المنتدى + حقل البحث فقط.
 */
export const ForumHeader = ({ searchTerm, onSearchChange }: ForumHeaderProps) => (
  <div
    className="relative mb-5 overflow-hidden rounded-card border border-divider bg-gradient-to-bl from-primary-deep via-primary to-primary-hover shadow-elevation-2"
    dir="rtl"
  >
    <div className="relative z-10 p-5 sm:p-6">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-on-primary shadow-elevation-1 backdrop-blur-sm">
          <MessagesSquare size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-xl font-black leading-tight text-on-primary sm:text-2xl">
            منتدى دارين السابعة
          </h1>
        </div>
      </div>

      <div className="relative mt-5">
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
)
