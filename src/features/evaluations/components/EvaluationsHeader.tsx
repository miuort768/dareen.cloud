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
            <div className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] shadow-lg px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl mt-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-xl">
                        <Award size={22} className="text-on-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-on-primary leading-tight">تقييم الطلاب والتحفيز</h1>
                        <p className="text-micro font-bold text-white/70 mt-0.5 flex items-center gap-1">
                            <Zap size={11} />نظام المكافآت الذكي والتقييم الأكاديمي الشامل
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl">
                        <p className="text-micro font-bold text-white/70">إجمالي النقاط:</p>
                        <p className="text-sm font-black text-on-primary tabular-nums">{totalXP} <span className="text-micro font-bold text-white/70">XP</span></p>
                    </div>
                    {showAddButton && (
                        <button onClick={onAddClick} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-on-primary font-bold text-micro px-3 py-2 shadow-sm active:scale-95 transition-all shrink-0 rounded-xl">
                            <Plus size={14} /><span className="hidden sm:inline whitespace-nowrap">تقييم جديد</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl shadow-sm border border-white/20 p-3 rounded-2xl">
                <div className="relative">
                    <Search size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                    <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="ابحث عن طالب باسمه أو صفه..." className="w-full pe-9 ps-9 py-2 text-xs font-bold text-main dark:text-on-primary placeholder:text-muted outline-none transition-all rounded-xl bg-primary/5 border border-primary/10 focus:border-primary/30 focus:bg-white dark:focus:bg-primary-active" />
                    {searchTerm && <button onClick={() => onSearchChange('')} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted hover:text-muted transition-colors"><X size={14} /></button>}
                </div>
            </div>
        </div>
    );
};
