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
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{loading ? 'جاري التحميل...' : 'تحميل المزيد'}</span>
            </button>
        </div>
    );
};
