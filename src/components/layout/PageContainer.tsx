import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => (
    <div className={cn(
        "min-h-full pb-24 overflow-x-hidden relative",
        "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30",
        "dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20",
        className
    )} dir="rtl">
        <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
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
    <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 border-b-2 border-slate-700 dark:border-slate-800 px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative z-10 flex items-center gap-4">
            {icon && (
                <div className="w-10 h-10 border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <div>
                <h1 className="text-lg md:text-xl font-medium text-white leading-tight tracking-tighter">{title}</h1>
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
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
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6",
        className
    )}>
        {(title || icon) && (
            <div className="flex items-center gap-3 mb-5">
                {icon}
                {title && <h2 className="text-sm font-medium text-slate-800 dark:text-white uppercase tracking-tight">{title}</h2>}
            </div>
        )}
        {children}
    </div>
);
