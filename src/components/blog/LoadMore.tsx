import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
    page: number;
    totalPages: number;
    loading: boolean;
    onLoadMore: () => void;
}

export const LoadMore = ({ page, totalPages, loading, onLoadMore }: LoadMoreProps) => {
    if (page >= totalPages) return null;

    return (
        <div className="flex justify-center mt-8">
            <button type="button" onClick={onLoadMore} disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-on-primary text-xs font-extrabold rounded-xl hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 shadow-sm shadow-primary/10 hover:shadow-primary/20">
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                <span>{loading ? 'جاري التحميل...' : 'تحميل المزيد'}</span>
            </button>
        </div>
    );
};
