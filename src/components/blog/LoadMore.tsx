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
        <div className="flex justify-center mt-6 sm:mt-8">
            <button onClick={onLoadMore} disabled={loading}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-primary text-on-primary text-xs font-black rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 shadow-lg">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{loading ? 'جاري التحميل...' : 'تحميل المزيد'}</span>
            </button>
        </div>
    );
};
