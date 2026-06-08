import { Loader2, BookOpen } from 'lucide-react';

export const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20 sm:py-24">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <span className="text-xs font-black text-slate-400">جاري التحميل...</span>
    </div>
);

export const EmptyState = () => (
    <div className="text-center py-20 sm:py-24 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700/50">
            <BookOpen size={24} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 font-black text-base sm:text-lg mb-1">لا يوجد محتوى بعد</p>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
    </div>
);
