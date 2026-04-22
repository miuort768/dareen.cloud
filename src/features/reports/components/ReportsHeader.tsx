import { TrendingUp, Download, Activity, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                    <TrendingUp size={18} className="text-[#5c59f2]" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-800 dark:text-white">التحليلات والتقارير العامة</h1>
                    <p className="text-[10px] text-slate-400">تحليل شامل للأداء الأكاديمي والمالي</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 no-print">
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Activity size={12} className="text-[#5c59f2]" />
                    Analytics Ready
                </div>
                <button
                    onClick={onExport}
                    className={cn(
                        'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
                        'text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all shadow-sm'
                    )}
                >
                    <Download size={14} />
                    <span className="hidden sm:inline">تصدير التقرير</span>
                </button>
            </div>
        </div>
    );
};
