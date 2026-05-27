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
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm px-5 md:px-7 py-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#E11D4812', color: '#E11D48' }}>
                        <Award size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[#0F172A] dark:text-white leading-tight">تقييم الطلاب والتحفيز</h1>
                        <p className="text-[10px] font-medium text-[#64748B] mt-0.5 flex items-center gap-1">
                            <Zap size={11} />نظام المكافآت الذكي والتقييم الأكاديمي الشامل
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-[#E11D4808] border border-[#E11D48]20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <p className="text-[9px] font-bold text-[#64748B]">إجمالي النقاط:</p>
                        <p className="text-sm font-black text-[#E11D48] tabular-nums">{totalXP} <span className="text-[9px] font-bold text-[#64748B]">XP</span></p>
                    </div>
                    {showAddButton && (
                        <button onClick={onAddClick} className="flex items-center gap-1.5 bg-[#E11D48] hover:bg-rose-700 text-white font-bold text-[10px] px-3 py-2 shadow-sm active:scale-95 transition-all shrink-0 rounded-xl">
                            <Plus size={14} /><span className="hidden sm:inline whitespace-nowrap">تقييم جديد</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm p-3 rounded-2xl">
                <div className="relative">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="ابحث عن طالب باسمه أو صفه..." className="w-full pr-9 pl-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-400 transition-all rounded-xl" />
                    {searchTerm && <button onClick={() => onSearchChange('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"><X size={14} /></button>}
                </div>
            </div>
        </div>
    );
};
