import { Download, BarChart3 } from 'lucide-react';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                        <BarChart3 size={17} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-main leading-tight">التقارير والتحليلات</h1>
                        <p className="text-[10px] text-dim">{dateStr}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 no-print">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-1 h-8 px-2.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg active:scale-95 transition-transform"
                    >
                        <Download size={11} /> <span className="hidden sm:inline">تصدير</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
