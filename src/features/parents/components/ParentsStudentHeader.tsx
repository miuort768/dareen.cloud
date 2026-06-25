import { Search } from 'lucide-react';

interface ParentsStudentHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const ParentsStudentHeader = ({ searchQuery, onSearchChange }: ParentsStudentHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                    <span className="bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] bg-clip-text text-transparent">قائمة الأبناء</span>
                </h1>
                <p className="text-[9px] md:text-sm text-gray-500 font-normal dark:text-gray-400 uppercase tracking-widest leading-none">إدارة ومتابعة التفاصيل الدراسية</p>
            </div>
            <div className="relative group w-full md:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C4BFF] transition-colors" size={16} />
                <input type="text" placeholder="بحث عن ابن..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pr-9 pl-4 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 font-normal transition-all text-xs shadow-sm" />
            </div>
        </div>
    );
};
