import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    stats?: {
        label: string;
        value: string | number;
    }[];
    actions?: React.ReactNode;
    color?: 'primary' | 'indigo' | 'emerald' | 'amber';
}

const colorMap = {
    primary: 'bg-primary',
    indigo: 'bg-primary',
    emerald: 'bg-success',
    amber: 'bg-warning',
};

const lightColorMap = {
    primary: 'bg-primary-soft text-primary border-primary',
    indigo: 'bg-primary-soft text-primary border-primary',
    emerald: 'bg-success-light text-success border-success',
    amber: 'bg-warning-light text-warning border-warning',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    stats,
    actions,
    color = 'primary'
}) => {
    return (
        <div className="relative bg-white border-2 border-border p-4 md:p-6 shadow-[2px_2px_0px_0px_black] overflow-hidden mb-8 rounded-none">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            <div className="relative flex items-center justify-between flex-wrap gap-8">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-12 h-12 text-on-primary flex items-center justify-center border-2 border-border shadow-[2px_2px_0px_0px_black] transform -rotate-2",
                        colorMap[color]
                    )}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={cn("w-2 h-2", colorMap[color])}></div>
                            <span className="text-[10px] font-medium text-muted uppercase tracking-widest">بوابة الأكاديمية الإلكترونية</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-medium text-main mb-1 tracking-tighter uppercase leading-none">{title}</h1>
                        {subtitle && <p className="text-[9px] font-medium text-muted uppercase tracking-widest italic">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap no-print">
                    {stats && stats.map((stat, i) => (
                        <div key={i} className={cn(
                            "px-4 py-2 border-2 border-border flex flex-col items-center min-w-[100px] shadow-[2px_2px_0px_0px_black]",
                            lightColorMap[color]
                        )}>
                            <p className="text-[9px] font-medium uppercase tracking-widest leading-none mb-1 opacity-60">{stat.label}</p>
                            <p className="text-xl font-medium leading-none">{stat.value}</p>
                        </div>
                    ))}
                    {actions && <div className="flex gap-4">{actions}</div>}
                </div>
            </div>
            
            {/* Bottom Accent Bar */}
            <div className={cn("absolute bottom-0 left-0 w-full h-1", colorMap[color])}></div>
        </div>
    );
};
