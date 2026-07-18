import { Search, Plus, TrendingUp } from 'lucide-react';

interface StudentsPageHeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    totalStudents: number;
    onAdd: () => void;
}

export const StudentsPageHeader = ({ searchTerm, onSearchChange, totalStudents, onAdd }: StudentsPageHeaderProps) => (
    <div className="bg-primary shadow-sm px-4 md:px-7 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl">
        <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-sm rounded-2xl bg-white/20 text-on-primary">
                <TrendingUp size={20} />
            </div>
            <div>
                <h1 className="text-sm md:text-lg font-bold text-on-primary leading-tight">إدارة الطلاب</h1>
                <p className="text-micro md:text-micro font-bold text-on-primary/70 mt-0.5">سجل الطلاب والمنتسبين — {totalStudents} طالب نشط</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search size={13} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-on-primary/50" />
                <input
                    type="text"
                    aria-label="بحث عن طالب"
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-full md:w-52 border text-on-primary placeholder:text-on-primary/50 text-micro md:text-micro font-bold px-7 py-1 outline-none transition-all rounded-2xl bg-white/15 border-white/20"
                />
            </div>
            <button onClick={onAdd} className="flex items-center gap-1 bg-card hover:bg-surface text-primary text-micro md:text-micro font-bold px-2 md:px-3 py-1 md:py-1.5 transition-all active:scale-[0.97] shadow-sm rounded-2xl"><Plus size={11} /> إضافة</button>
        </div>
    </div>
);
