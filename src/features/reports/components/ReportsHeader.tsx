import { Download, BarChart3 } from 'lucide-react';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#2563EB12' }}>
                    <BarChart3 size={22} style={{ color: '#2563EB' }} />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">التحليلات والتقارير العامة</h1>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">{dateStr}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 no-print">
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#10B98112', color: '#059669' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
                    مزامنة نشطة
                </div>
                <button
                    onClick={onExport}
                    className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
                >
                    <Download size={14} />
                    <span className="hidden sm:inline">تصدير</span>
                </button>
            </div>
        </div>
    );
};

