import { Loader2, BookOpen } from 'lucide-react';

export const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20 sm:py-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <span className="text-xs font-black text-muted">جاري التحميل...</span>
    </div>
);

export const EmptyState = () => (
    <div className="text-center py-20 sm:py-24 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl sm:rounded-3xl bg-background flex items-center justify-center mx-auto mb-4 border border-border">
            <BookOpen size={24} className="text-muted" />
        </div>
        <p className="text-muted font-black text-base sm:text-lg mb-1">لا يوجد محتوى بعد</p>
        <p className="text-muted text-xs sm:text-sm font-medium">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
    </div>
);
