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
        <div className={cn("relative p-4 md:p-6 shadow-xl overflow-hidden border-b-4 rounded-none mb-6", colorMap[color])}>
            {/* Background Geometric Enhancement - Richer & Larger Shapes */}
            {/* Major Glows & Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px] pointer-events-none"></div>

            {/* Large Structural Shapes */}
            <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
            <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

            {/* Large Geometric Outlines */}
            <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-[-40px] left-1/4 w-56 h-56 border-[2px] border-white/10 rounded-[3rem] rotate-45 pointer-events-none"></div>
            <div className="absolute bottom-[-80px] right-1/4 w-72 h-72 border-[1px] border-white/20 rounded-full pointer-events-none"></div>

            {/* Central Geometric Elements */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 border-[1px] border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"></div>

            {/* Pattern Layer */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

            <div className="relative flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                        <Icon size={36} className="text-white relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">{title}</h1>
                        {subtitle && <p className="text-[10px] md:text-sm font-bold opacity-80">{subtitle}</p>}
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
