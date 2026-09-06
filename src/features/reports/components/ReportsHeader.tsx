import { Download, BarChart3 } from 'lucide-react'

interface ReportsHeaderProps {
  onExport: () => void
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
            <BarChart3 size={17} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-main">التقارير والتحليلات</h1>
            <p className="text-[10px] text-muted">{dateStr}</p>
          </div>
        </div>
        <div className="no-print flex items-center gap-1.5">
          <button
            onClick={onExport}
            className="flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-[10px] font-bold text-on-primary outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Download size={11} /> <span className="hidden sm:inline">تصدير</span>
          </button>
        </div>
      </div>
    </div>
  )
}
