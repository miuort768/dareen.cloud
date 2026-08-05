import { ArrowLeft, Library } from 'lucide-react';
import { Breadcrumb } from '../../shared/components/ui';
import type { BreadcrumbItem } from '../../shared/components/ui';

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

    const content = (
        <>
            <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} separator="chevron" />
            </div>

            <div className="flex gap-2 mb-6">
                {showChangeButton && (
                    <button onClick={onBack} className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border border-border text-main hover:border-primary/40 hover:text-primary text-xs font-extrabold rounded-xl transition-all duration-200">
                        <ArrowLeft size={14} /><span>تغيير المادة</span>
                    </button>
                )}
                <button onClick={onHome} className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary-hover text-xs font-extrabold rounded-xl transition-all duration-200">
                    <Library size={14} /><span>الرئيسية</span>
                </button>
            </div>
        </>
    );

    if (isMobile) {
        return <div className="bg-card rounded-2xl p-4 mb-4 border border-border mt-1">{content}</div>;
    }
    return <>{content}</>;
};
