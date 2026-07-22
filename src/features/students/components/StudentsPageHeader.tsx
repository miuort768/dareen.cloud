import { Search, Plus, Users } from 'lucide-react';

interface StudentsPageHeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    totalStudents: number;
    onAdd: () => void;
}

export const StudentsPageHeader = ({ searchTerm, onSearchChange, totalStudents, onAdd }: StudentsPageHeaderProps) => (
    <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                    <Users size={17} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-main leading-tight">إدارة الطلاب</h1>
                    <p className="text-[10px] text-dim">{totalStudents} طالب نشط</p>
                </div>
            </div>
            <button onClick={onAdd} className="flex items-center gap-1.5 bg-primary text-on-primary text-[11px] font-bold px-3 py-2 rounded-xl active:scale-[0.97] transition-transform">
                <Plus size={13} /> إضافة
            </button>
        </div>
        <div className="relative">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
                type="text"
                aria-label="بحث عن طالب"
                placeholder="بحث بالاسم أو الهاتف أو المرحلة..."
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full bg-background border border-border text-main text-xs font-bold ps-9 pe-3 py-2.5 outline-none focus:border-primary rounded-xl transition-colors placeholder:text-dim"
            />
        </div>
    </div>
);
