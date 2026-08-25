import { Search, X } from 'lucide-react'
import { useAcademyName } from '../../context/AppContext'

interface ForumHeaderProps {
  searchTerm?: string
  onSearchChange?: (v: string) => void
}

export const ForumHeader = ({ searchTerm = '', onSearchChange }: ForumHeaderProps) => {
  const academyName = useAcademyName()
  return (
    <div className="mx-4 mb-6 mt-4 rounded-card bg-primary px-6 py-8 md:mx-auto md:max-w-page">
      <div className="flex flex-col items-center text-center">
        <h1 className="mb-2 text-3xl font-bold leading-tight text-on-primary">
          منتدى {academyName}
        </h1>
        <p className="max-w-md text-sm font-medium leading-relaxed text-white/80">
          مساحة للنقاش وتبادل الخبرات بين معلمات وأولياء الأمور والطلاب.
        </p>

        {/* Search — visible on all screen sizes */}
        <div className="relative mt-5 w-full max-w-md">
          <Search size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            aria-label="بحث في المنتدى"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="ابحث في المنشورات..."
            className="w-full rounded-2xl border border-white/20 bg-white/15 py-2.5 pe-9 ps-10 text-xs font-bold text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange?.('')}
              aria-label="مسح البحث"
              className="absolute end-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
