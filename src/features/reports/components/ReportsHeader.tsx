import { TrendingUp, Download, Activity } from 'lucide-react';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    return (
        <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
            <div className="relative flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                        <TrendingUp size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight">التحليلات والتقارير العامة</h1>
                        <p className="text-primary-100/90 text-sm font-bold flex items-center gap-2">
                            <Activity size={14} />
                            تحليل شامل للأداء الأكاديمي والمالي والحضور
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 no-print">
                    <button
                        onClick={onExport}
                        className="bg-white text-primary-700 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <Download size={20} />
                        <span>تصدير التقرير الفني</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
