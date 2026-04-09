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
    primary: 'bg-primary-600',
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
};

const lightColorMap = {
    primary: 'bg-primary-50 text-primary-700 border-primary-600',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-600',
    amber: 'bg-amber-50 text-amber-900 border-amber-600',
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
        <div className="relative bg-white border-4 border-gray-950 p-6 md:p-8 shadow-[10px_10px_0px_0px_black] overflow-hidden mb-10 rounded-none">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            <div className="relative flex items-center justify-between flex-wrap gap-8">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-16 h-16 text-white flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] transform -rotate-2",
                        colorMap[color]
                    )}>
                        <Icon size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={cn("w-2 h-2", colorMap[color])}></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">بوابة الأكاديمية الإلكترونية</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-950 mb-1 tracking-tighter uppercase leading-none">{title}</h1>
                        {subtitle && <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap no-print">
                    {stats && stats.map((stat, i) => (
                        <div key={i} className={cn(
                            "px-6 py-2 border-2 border-gray-950 flex flex-col items-center min-w-[120px] shadow-[4px_4px_0px_0px_black]",
                            lightColorMap[color]
                        )}>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">{stat.label}</p>
                            <p className="text-2xl font-black leading-none">{stat.value}</p>
                        </div>
                    ))}
                    {actions && <div className="flex gap-4">{actions}</div>}
                </div>
            </div>
            
            {/* Bottom Accent Bar */}
            <div className={cn("absolute bottom-0 left-0 w-full h-2", colorMap[color])}></div>
        </div>
    );
};
