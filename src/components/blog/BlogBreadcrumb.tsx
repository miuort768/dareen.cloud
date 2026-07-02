import { ArrowLeft, Library } from 'lucide-react';
import { Breadcrumb } from '../../shared/components/ui/Breadcrumb';
import type { BreadcrumbItem } from '../../shared/components/ui/Breadcrumb';

interface BlogBreadcrumbProps {
    items: BreadcrumbItem[];
    currentName?: string;
    onBack: () => void;
    onHome: () => void;
    showChangeButton?: boolean;
    isMobile?: boolean;
}

export const BlogBreadcrumb = ({ items, currentName, onBack, onHome, showChangeButton, isMobile }: BlogBreadcrumbProps) => {
    const breadcrumbItems: BreadcrumbItem[] = currentName
        ? [...items, { label: currentName }]
        : items;

    const containerClass = isMobile
        ? "bg-card rounded-3xl p-5 mb-5 shadow-sm border border-border mt-1"
        : "";

    const content = (
        <>
            <div className="mb-3 sm:mb-6">
                <Breadcrumb items={breadcrumbItems} separator="chevron" />
            </div>

            <div className="flex gap-2 mb-4 sm:mb-8">
                {showChangeButton && (
                    <button onClick={onBack} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-on-primary hover:bg-primary-hover text-[11px] sm:text-xs font-black rounded-xl sm:rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={14} /><span>تغيير المادة</span>
                    </button>
                )}
                <button onClick={onHome} className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-on-primary hover:bg-primary-hover text-[11px] sm:text-xs font-black rounded-xl sm:rounded-2xl transition-all shadow-sm">
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
