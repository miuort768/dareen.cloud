import { Plus, Zap, Award, X, Search } from 'lucide-react';

interface EvaluationsHeaderProps {
    totalXP: number;
    showAddButton: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
}

export const EvaluationsHeader = ({ totalXP, showAddButton, searchTerm, onSearchChange, onAddClick }: EvaluationsHeaderProps) => {
    return (
        <div className="space-y-4">
            <div className="shadow-sm px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-none" style={{ backgroundColor: '#00542F' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                        <Award size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">تقييم الطلاب والتحفيز</h1>
                        <p className="text-[10px] font-bold text-white/70 mt-0.5 flex items-center gap-1">
                            <Zap size={11} />نظام المكافآت الذكي والتقييم الأكاديمي الشامل
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 flex items-center gap-1.5 rounded-none" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <p className="text-[9px] font-bold text-white/70">إجمالي النقاط:</p>
                        <p className="text-sm font-black text-white tabular-nums">{totalXP} <span className="text-[9px] font-bold text-white/70">XP</span></p>
                    </div>
                    {showAddButton && (
                        <button onClick={onAddClick} className="flex items-center gap-1.5 bg-white hover:bg-white/90 text-[#00542F] font-bold text-[10px] px-3 py-2 shadow-sm active:scale-95 transition-all shrink-0 rounded-none">
                            <Plus size={14} /><span className="hidden sm:inline whitespace-nowrap">تقييم جديد</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="shadow-sm p-3 rounded-none" style={{ backgroundColor: '#00542F' }}>
                <div className="relative">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="ابحث عن طالب باسمه أو صفه..." className="w-full pr-9 pl-9 py-2 text-[11px] font-bold text-white placeholder:text-white/50 outline-none transition-all rounded-none" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }} />
                    {searchTerm && <button onClick={() => onSearchChange('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"><X size={14} /></button>}
                </div>
            </div>
        </div>
    );
};
