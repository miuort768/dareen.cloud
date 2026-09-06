import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BlogSearchBarProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  filterType: string
  setFilterType: (v: string) => void
}

const filters = [
  { key: '', label: 'الكل' },
  { key: 'foundation', label: 'تعلم اللغة' },
  { key: 'solutions', label: 'حل الكتب' },
  { key: 'notes', label: 'المذكرات' },
  { key: 'more', label: 'المزيد' },
]

export const BlogSearchBar = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
}: BlogSearchBarProps) => (
  <div className="space-y-3 rounded-2xl border border-border bg-card p-3.5">
    <div className="relative">
      <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
      <input
        type="text"
        aria-label="بحث عن مقالات"
        placeholder="بحث عن مقالات أو تصنيفات..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 md:h-12 md:text-sm"
      />
    </div>
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((btn) => (
        <button
          key={btn.key}
          onClick={() => setFilterType(btn.key)}
          aria-pressed={filterType === btn.key}
          className={cn(
            'flex h-10 items-center justify-center whitespace-nowrap rounded-lg px-3.5 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:h-9',
            filterType === btn.key
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'border border-border bg-card text-muted hover:bg-hover',
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  </div>
)
