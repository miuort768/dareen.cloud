import { Search } from 'lucide-react'

interface ParentsStudentHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export const ParentsStudentHeader = ({
  searchQuery,
  onSearchChange,
}: ParentsStudentHeaderProps) => {
  return (
    <div className="flex flex-col justify-between gap-4 px-4 md:flex-row md:items-center md:px-0">
      <div>
        <h1 className="mb-1 text-lg font-bold leading-none tracking-tight text-main md:text-2xl">
          <span className="bg-primary bg-clip-text text-transparent">قائمة الأبناء</span>
        </h1>
        <p className="text-micro font-normal uppercase leading-none tracking-label text-muted md:text-sm">
          إدارة ومتابعة التفاصيل الدراسية
        </p>
      </div>
      <div className="group relative w-full md:w-72">
        <Search
          className="absolute start-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
          size={16}
        />
        <input
          type="text"
          aria-label="بحث عن ابن"
          placeholder="بحث عن ابن..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pe-4 ps-9 text-xs font-normal transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>
    </div>
  )
}
