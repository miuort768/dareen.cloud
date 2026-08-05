import { Loader2, BookOpen } from 'lucide-react';

export const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <span className="text-xs font-extrabold text-muted">جاري التحميل...</span>
    </div>
);

export const EmptyState = () => (
    <div className="text-center py-20 animate-in fade-in duration-500">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
            <BookOpen size={22} className="text-muted" />
        </div>
        <p className="text-main font-extrabold text-base mb-1">لا يوجد محتوى بعد</p>
        <p className="text-muted text-xs font-medium">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
    </div>
);
