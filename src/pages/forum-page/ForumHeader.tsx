import { Search, X, MessageSquare } from 'lucide-react'
import { useAcademyName } from '../../context/AppContext'
import { GradientHeroCard } from '../../shared/components/GradientHeroCard'

interface ForumHeaderProps {
  searchTerm?: string
  onSearchChange?: (v: string) => void
}

export const ForumHeader = ({ searchTerm = '', onSearchChange }: ForumHeaderProps) => {
  const academyName = useAcademyName()
  return (
    <div className="mx-4 mb-6 mt-4 md:mx-auto md:max-w-page">
      <GradientHeroCard
        icon={MessageSquare}
        title={`منتدى ${academyName}`}
        subtitle="مساحة للنقاش وتبادل الخبرات بين معلمات وأولياء الأمور والطلاب."
        end={
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
        }
      />
    </div>
  )
}
