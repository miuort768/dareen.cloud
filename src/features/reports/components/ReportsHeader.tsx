import { Download, Activity, BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="relative overflow-hidden bg-slate-950 px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5">
            {/* Geometric accent */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rotate-45 translate-y-[-50%] translate-x-[-30%] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-10 w-48 h-48 bg-purple-500/10 rotate-12 translate-y-[40%] blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-none shadow-sm">
                    <BarChart3 size={22} className="text-indigo-300" />
                </div>
                <div>
                    <h1 className="text-base md:text-xl font-medium text-white uppercase tracking-tighter">التحليلات والتقارير العامة</h1>
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">{dateStr}</p>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 no-print">
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-none">
                    <Activity size={12} />
                    مزامنة نشطة
                </div>
                <button
                    onClick={onExport}
                    className={cn(
                        'flex items-center justify-center gap-2',
                        'bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium px-4 py-2 rounded-none transition-all shadow-sm shadow-indigo-500/20 uppercase tracking-widest'
                    )}
                >
                    <Download size={14} />
                    <span className="hidden sm:inline">تصدير</span>
                </button>
            </div>
        </div>
    );
};

