import { TrendingUp, Download, Activity } from 'lucide-react';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    return (
        <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
            {/* Background Geometric Enhancement - Richer & Larger Shapes */}
            {/* Major Glows & Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>

            {/* Central Geometric elements */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>

            {/* Large Structural Shapes */}
            <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
            <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

            {/* Large Geometric Outlines */}
            <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>

            {/* Pattern Layer */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                        <TrendingUp size={36} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">التحليلات والتقارير العامة</h1>
                        <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                            <Activity size={14} className="text-white" />
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
