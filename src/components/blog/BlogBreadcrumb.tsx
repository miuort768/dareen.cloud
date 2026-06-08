import { ChevronLeft, ArrowLeft, Library } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    onClick: () => void;
}

interface BlogBreadcrumbProps {
    items: BreadcrumbItem[];
    currentName?: string;
    onBack: () => void;
    onHome: () => void;
    showChangeButton?: boolean;
    isMobile?: boolean;
}

export const BlogBreadcrumb = ({ items, currentName, onBack, onHome, showChangeButton, isMobile }: BlogBreadcrumbProps) => {
    const containerClass = isMobile
        ? "bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl p-5 mb-5 shadow-sm border border-violet-100/50 dark:border-slate-800 mt-1"
        : "";

    const content = (
        <>
            <div className={`flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-6 text-[11px] sm:text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 flex-wrap`}>
                {items.map((crumb, i, arr) => (
                    <span key={i} className="flex items-center gap-1 sm:gap-2">
                        {i > 0 && <ChevronLeft size={10} className="text-slate-300 dark:text-slate-600" />}
                        <button onClick={crumb.onClick}
                            className={i === arr.length - 1 && !currentName ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors'}>
                            {crumb.label}
                        </button>
                    </span>
                ))}
                {currentName && (
                    <><ChevronLeft size={10} className="text-slate-300 dark:text-slate-600" /><span className="text-indigo-600 dark:text-indigo-400 font-black">{currentName}</span></>
                )}
            </div>

            <div className="flex gap-2 mb-4 sm:mb-8">
                {showChangeButton && (
                    <button onClick={onBack} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-[11px] sm:text-xs font-black rounded-xl sm:rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={14} /><span>تغيير المادة</span>
                    </button>
                )}
                <button onClick={onHome} className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-950 dark:bg-indigo-950 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-black rounded-xl sm:rounded-2xl transition-all shadow-sm">
                    <Library size={14} /><span>الرئيسية</span>
                </button>
            </div>
        </>
    );

    if (isMobile) {
        return <div className={containerClass}>{content}</div>;
    }
    return <>{content}</>;
};
