import { Users, Search } from 'lucide-react'
import { PageHeader } from '../../../shared/components/ui'

interface ParentsStudentHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export const ParentsStudentHeader = ({
  searchQuery,
  onSearchChange,
}: ParentsStudentHeaderProps) => (
  <PageHeader
    title="قائمة الأبناء"
    subtitle="إدارة ومتابعة التفاصيل الدراسية"
    icon={<Users size={20} />}
    toolbar={
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted transition-colors"
            size={16}
          />
          <input
            type="text"
            aria-label="بحث عن ابن"
            placeholder="بحث عن ابن..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 md:h-10"
          />
        </div>
      </div>
    }
  />
)
