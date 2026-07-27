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
        <div className="space-y-3">
            <div className="bg-card border border-border rounded-2xl p-3 md:p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center ring-1 ring-primary/20">
                            <Award size={17} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-main leading-tight">تقييم الطلاب</h1>
                            <p className="text-[10px] text-muted flex items-center gap-1">
                                <Zap size={9} />{totalXP} XP
                            </p>
                        </div>
                    </div>
                    {showAddButton && (
                        <button onClick={onAddClick} className="flex items-center gap-1 h-8 px-2.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg active:scale-95 transition-transform">
                            <Plus size={11} /> تقييم
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-2">
                <div className="relative">
                    <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="ابحث عن طالب..." className="w-full ps-8 pe-8 py-2 text-xs font-bold text-main placeholder:text-muted bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    {searchTerm && <button onClick={() => onSearchChange('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"><X size={13} /></button>}
                </div>
            </div>
        </div>
    );
};
