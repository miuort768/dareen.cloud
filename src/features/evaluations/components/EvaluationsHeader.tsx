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
        <>
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 dark:from-slate-950 dark:via-rose-950 dark:to-slate-950 rounded-none shadow-sm shadow-rose-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/15 flex items-center justify-center  border border-white/20 shadow-inner shrink-0">
                            <Award size={20} className="text-white md:hidden" />
                            <Award size={28} className="text-white hidden md:block" />
                        </div>
                        <div>
                            <h1 className="text-base md:text-2xl font-medium tracking-tight leading-none mb-0.5 md:mb-1">تقييم الطلاب والتحفيز</h1>
                            <p className="text-white/70 text-[9px] md:text-[11px] font-normal flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
                                <Zap size={11} className="fill-current" />نظام المكافآت الذكي والتقييم الأكاديمي الشامل</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/15 border border-white/20 px-3 md:px-4 py-2  flex items-center gap-1.5 md:gap-2">
                            <p className="text-[8px] md:text-[9px] font-medium opacity-60 uppercase tracking-widest whitespace-nowrap">إجمالي النقاط:</p>
                            <p className="text-sm md:text-base font-medium tabular-nums whitespace-nowrap">{totalXP} <span className="text-[10px] opacity-60">XP</span></p>
                        </div>
                        {showAddButton && (
                            <button onClick={onAddClick} className="flex items-center gap-1.5 bg-white text-indigo-700 dark:bg-rose-500 dark:text-white font-medium text-[10px] md:text-xs px-3 md:px-4 py-2 shadow-sm hover:shadow-sm hover:scale-105 transition-all shrink-0 self-stretch">
                                <Plus size={14} strokeWidth={3} /><span className="hidden sm:inline whitespace-nowrap">تقييم جديد</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative">
                <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="ابحث عن طالب باسمه أو صفه..." className="w-full pr-10 pl-10 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 bg-white text-sm font-normal text-slate-700 dark:text-white placeholder:text-slate-300 placeholder:font-normal outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                {searchTerm && (
                    <button onClick={() => onSearchChange('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"><X size={14} /></button>
                )}
            </div>
        </>
    );
};
