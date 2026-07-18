import { Search } from 'lucide-react';

interface ParentsStudentHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const ParentsStudentHeader = ({ searchQuery, onSearchChange }: ParentsStudentHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-main tracking-tight leading-none mb-1">
                    <span className="bg-primary bg-clip-text text-transparent">قائمة الأبناء</span>
                </h1>
                <p className="text-micro md:text-sm text-muted font-normal uppercase tracking-widest leading-none">إدارة ومتابعة التفاصيل الدراسية</p>
            </div>
            <div className="relative group w-full md:w-72">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                <input type="text" aria-label="بحث عن ابن" placeholder="بحث عن ابن..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full ps-9 pe-4 py-2.5 bg-white/80 backdrop-blur-xl border border-border/50 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-normal transition-all text-xs shadow-soft" />
            </div>
        </div>
    );
};
