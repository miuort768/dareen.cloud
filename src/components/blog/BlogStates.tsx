import { Loader2, BookOpen } from 'lucide-react'

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
    <span className="text-xs font-semibold text-muted">جاري التحميل...</span>
  </div>
)

export const EmptyState = () => (
  <div className="py-20 text-center duration-500 animate-in fade-in">
    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface">
      <BookOpen size={22} className="text-muted" />
    </div>
    <p className="mb-1 text-base font-semibold text-main">لا يوجد محتوى بعد</p>
    <p className="text-xs font-medium text-muted">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
  </div>
)
