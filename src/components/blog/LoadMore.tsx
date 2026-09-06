import { Loader2 } from 'lucide-react'

interface LoadMoreProps {
  page: number
  totalPages: number
  loading: boolean
  onLoadMore: () => void
}

export const LoadMore = ({ page, totalPages, loading, onLoadMore }: LoadMoreProps) => {
  if (page >= totalPages) return null

  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-xs font-extrabold text-on-primary shadow-elevation-1 shadow-primary/10 outline-none transition-all duration-200 hover:bg-primary-hover hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        <span>{loading ? 'جاري التحميل...' : 'تحميل المزيد'}</span>
      </button>
    </div>
  )
}
