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
  <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
    <div className="relative flex-grow">
      <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
      <input
        type="text"
        aria-label="بحث عن مقالات"
        placeholder="بحث عن مقالات أو تصنيفات..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-primary-soft/30 w-full rounded-xl border border-border py-3 ps-12 text-sm font-bold outline-none transition-all focus:outline-none focus:ring-2 focus:ring-focus"
      />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((btn) => (
        <button
          key={btn.key}
          onClick={() => setFilterType(btn.key)}
          className={cn(
            'rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.97]',
            filterType === btn.key
              ? 'bg-error text-on-error shadow-sm'
              : 'border border-border bg-card text-muted hover:bg-hover',
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  </div>
)
