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
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-2xl shadow-2xl shadow-indigo-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
            {icon && (
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 bg-white/10 backdrop-blur-md flex items-center justify-center">
                    {icon}
                </div>
            )}
            <div>
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter">{title}</h1>
                <p className="text-xs md:text-sm text-slate-300/80 mt-0.5">{subtitle}</p>
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
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 p-5 md:p-6",
        className
    )}>
        {(title || icon) && (
            <div className="flex items-center gap-3 mb-5">
                {icon}
                {title && <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h2>}
            </div>
        )}
        {children}
    </div>
);
