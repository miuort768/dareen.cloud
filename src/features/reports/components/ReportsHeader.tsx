import { TrendingUp, Download, Activity, Sparkles } from 'lucide-react';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    return (
        <div className="relative bg-white border-2 border-gray-950 p-4 shadow-[4px_4px_0px_0px_black] overflow-hidden mb-4 rounded-none">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-purple-600/5 -skew-x-12 transform translate-x-16 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-600 text-white flex items-center justify-center border-2 border-gray-950 transform rotate-2 shadow-[2px_2px_0px_0px_black] group">
                        <TrendingUp size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles size={10} className="text-amber-500" />
                            <span className="text-[7px] font-black text-purple-600 uppercase tracking-widest italic leading-none">ANALYTICS & INSIGHTS</span>
                        </div>
                        <h1 className="text-sm md:text-lg font-black text-gray-950 mb-0.5 tracking-tighter uppercase leading-none">التحليلات والتقارير العامة</h1>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 italic">
                            <Activity size={10} className="text-purple-600" />
                            تحليل شامل للأداء الأكاديمي والمالي وتدفقات الحضور
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 no-print items-center">
                    <div className="bg-amber-400 text-gray-950 px-2 py-1 border-2 border-gray-950 font-black text-[8px] uppercase tracking-widest shadow-[1px_1px_0px_0px_black]">
                        READY
                    </div>
                    <button
                        onClick={onExport}
                        className="bg-gray-950 text-white px-4 py-2 border-2 border-gray-950 flex items-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-black shadow-[2px_2px_0px_0px_#444] uppercase tracking-widest text-[10px]"
                    >
                        <Download size={16} strokeWidth={3} />
                        <span>تصدير مستند التحليل</span>
                    </button>
                </div>
            </div>
            
            {/* Design accents */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600"></div>
        </div>
    );
};
