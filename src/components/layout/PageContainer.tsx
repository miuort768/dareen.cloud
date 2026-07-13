import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => (
    <div className={cn(
        "min-h-full pb-24 overflow-x-hidden relative",
        "bg-gradient-to-br from-[var(--bg-background)] via-white to-[var(--bg-primary)]/30",
        "dark:from-background dark:via-[var(--bg-background)] dark:to-[var(--bg-primary)]/20",
        className
    )} dir="rtl">
        <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-page mx-auto px-2">
            {children}
        </div>
    </div>
);

interface PageHeaderProps {
    title: string;
    subtitle: string;
    icon?: ReactNode;
    actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, actions }: PageHeaderProps) => (
    <div className="relative overflow-hidden bg-primary-active dark:bg-background border-b-2 border-border dark:border-border px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative z-10 flex items-center gap-4">
            {icon && (
                <div className="w-10 h-10 border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <div>
                <h1 className="text-lg md:text-xl font-medium text-on-primary leading-tight tracking-tighter">{title}</h1>
                <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            </div>
        </div>
        {actions && (
            <div className="relative z-10 flex items-center gap-3 no-print">
                {actions}
            </div>
        )}
    </div>
);

interface SectionCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    icon?: ReactNode;
}

export const SectionCard = ({ children, className, title, icon }: SectionCardProps) => (
    <div className={cn(
        "bg-white dark:bg-primary-active border border-border dark:border-border p-5 md:p-6",
        className
    )}>
        {(title || icon) && (
            <div className="flex items-center gap-3 mb-5">
                {icon}
                {title && <h2 className="text-sm font-medium text-main dark:text-on-primary uppercase tracking-tight">{title}</h2>}
            </div>
        )}
        {children}
    </div>
);
