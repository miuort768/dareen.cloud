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
    primary: 'bg-primary-600 border-primary-500 text-primary-100',
    indigo: 'bg-indigo-600 border-indigo-500 text-indigo-100',
    emerald: 'bg-emerald-600 border-emerald-500 text-emerald-100',
    amber: 'bg-amber-600 border-amber-500 text-amber-100',
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
        <div className={cn("relative p-8 shadow-xl overflow-hidden border-b-4 rounded-none mb-6", colorMap[color])}>
            <div className="relative flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                        <Icon size={36} className="text-white relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight uppercase">{title}</h1>
                        {subtitle && <p className="text-sm font-bold opacity-80">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap no-print">
                    {stats && stats.map((stat, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm px-6 py-2 border-r-4 border-white/30">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                            <p className="text-white text-2xl font-black">{stat.value}</p>
                        </div>
                    ))}
                    {actions}
                </div>
            </div>
        </div>
    );
};
