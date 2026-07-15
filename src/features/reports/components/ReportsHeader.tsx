import { Download, BarChart3 } from 'lucide-react';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-card rounded-card shadow-soft border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary-soft">
                    <BarChart3 size={22} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-black text-main leading-tight">التحليلات والتقارير العامة</h1>
                    <p className="text-xs font-bold text-muted mt-0.5">{dateStr}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 no-print">
                <div className="hidden md:flex items-center gap-1.5 text-micro font-bold px-3 py-1.5 rounded-xl bg-success-soft text-success-dark">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-success" />
                    مزامنة نشطة
                </div>
                <button
                    onClick={onExport}
                    className="flex items-center justify-center gap-2 bg-primary text-on-primary text-micro font-bold px-4 py-2.5 rounded-xl shadow-soft active:scale-95 transition-all"
                >
                    <Download size={14} />
                    <span className="hidden sm:inline">تصدير</span>
                </button>
            </div>
        </div>
    );
};
