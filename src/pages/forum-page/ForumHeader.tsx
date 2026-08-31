import { Search, X, MessageSquare } from 'lucide-react'
import { useAcademyName } from '../../context/AppContext'

interface ForumHeaderProps {
  searchTerm?: string
  onSearchChange?: (v: string) => void
}

export const ForumHeader = ({ searchTerm = '', onSearchChange }: ForumHeaderProps) => {
  const academyName = useAcademyName()
  return (
    <div className="mx-4 mb-6 mt-4 md:mx-auto md:max-w-page">
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-elevation-2 md:p-6">
        <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
              <MessageSquare size={22} className="text-on-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-tight text-on-primary">
                منتدى {academyName}
              </h1>
              <p className="mt-0.5 text-xs text-white/70">
                مساحة للنقاش وتبادل الخبرات بين معلمات وأولياء الأمور والطلاب.
              </p>
            </div>
          </div>

          <div className="hidden h-12 w-px bg-white/20 lg:block" />

          <div className="relative w-full lg:max-w-md lg:flex-1">
            <Search
              size={14}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-white/70"
            />
            <input
              type="text"
              aria-label="بحث في المنتدى"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="ابحث في المنشورات..."
              className="h-11 w-full rounded-xl border border-white/20 bg-white/10 pe-9 ps-10 text-xs font-bold text-on-primary outline-none backdrop-blur-sm transition-all placeholder:text-white/60 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20"
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
    </div>
  )
}
