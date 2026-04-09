import { TrendingUp, Download, Activity, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReportsHeaderProps {
    onExport: () => void;
}

export const ReportsHeader = ({ onExport }: ReportsHeaderProps) => {
    return (
        <div className="relative bg-white border-4 border-gray-950 p-8 shadow-[12px_12px_0px_0px_black] overflow-hidden mb-10 rounded-none">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-0 right-0 w-48 h-full bg-purple-600/5 -skew-x-12 transform translate-x-24 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-8 px-2">
                <div className="flex items-center gap-6">
                    <div className="w-18 h-18 bg-purple-600 text-white flex items-center justify-center border-4 border-gray-950 transform rotate-2 shadow-[4px_4px_0px_0px_black] group">
                        <TrendingUp size={36} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] font-mono italic leading-none">ANALYTICS & INSIGHTS HUB</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-gray-950 mb-1 tracking-tighter uppercase leading-none">التحليلات والتقارير العامة</h1>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Activity size={14} className="text-purple-600" />
                            تحليل شامل للأداء الأكاديمي والمالي وتدفقات الحضور
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 no-print items-center">
                    <div className="bg-amber-400 text-gray-950 px-4 py-2 border-2 border-gray-950 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_black]">
                        DATA READY
                    </div>
                    <button
                        onClick={onExport}
                        className="bg-gray-950 text-white px-8 py-5 border-4 border-gray-950 flex items-center gap-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black shadow-[6px_6px_0px_0px_#444] uppercase tracking-widest text-sm"
                    >
                        <Download size={22} strokeWidth={3} />
                        <span>تصدير مستند التحليل الفني</span>
                    </button>
                </div>
            </div>
            
            {/* Design accents */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-purple-600"></div>
        </div>
    );
};
