import { Search, X, MessagesSquare, Heart } from 'lucide-react'

interface ForumHeaderProps {
  searchTerm: string
  onSearchChange: (v: string) => void
}

/**
 * رأس المنتدى — بلا هيرو: صفّ العنوان (أيقونة الدردشة + الاسم + قلب أحمر)
 * فوقه حقل البحث فقط.
 */
export const ForumHeader = ({ searchTerm, onSearchChange }: ForumHeaderProps) => (
  <div dir="rtl" className="mb-5">
    <div className="flex items-center gap-2.5">
      <MessagesSquare size={20} className="shrink-0 text-primary" aria-hidden="true" />
      <h1 className="font-heading text-lg font-black leading-snug text-main md:text-xl">
        منتدى دارين السابعة
      </h1>
      <Heart size={18} className="shrink-0 fill-error text-error" aria-hidden="true" />
    </div>

    <div className="relative mt-3">
      <Search
        size={14}
        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        aria-label="بحث في المنتدى"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في المنشورات..."
        className="h-11 w-full rounded-xl border border-border bg-card pe-9 ps-10 text-xs font-bold text-main shadow-elevation-1 outline-none transition-all placeholder:text-muted focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:bg-surface"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          aria-label="مسح البحث"
          className="absolute end-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted outline-none transition-colors hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
        >
          <X size={12} />
        </button>
      )}
    </div>
  </div>
)
