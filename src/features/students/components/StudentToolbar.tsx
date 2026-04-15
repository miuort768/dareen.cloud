import { Search, Download, Upload, Trash2, X, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onExport: () => void;
    onImport: () => void;
    onDeleteAll: () => void;
    filteredCount: number;
    totalCount: number;
}

export const StudentToolbar = ({
    searchTerm,
    onSearchChange,
    onExport,
    onImport,
    onDeleteAll,
    filteredCount,
    totalCount
}: StudentToolbarProps) => {
    return (
        <div className="bg-white p-6 border-4 border-gray-950 dark:bg-gray-900 dark:border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-8 rounded-none shadow-[8px_8px_0px_0px_black] transition-all mb-8">

            {/* Search Group */}
            <div className="relative w-full lg:max-w-3xl group">
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Search size={22} className="text-gray-950 group-focus-within:text-primary-600 transition-colors" />
                    <div className="h-6 w-1 bg-gray-950 hidden sm:block"></div>
                </div>

                <input
                    type="text"
                    placeholder="ابحث عن طالب بالاسم، الهاتف أو الصف..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-16 pr-16 py-5 bg-gray-50 dark:bg-gray-800 border-4 border-gray-950 rounded-none focus:outline-none focus:bg-white dark:focus:bg-gray-700 dark:text-white font-black text-base shadow-inner transition-all placeholder:text-gray-400 placeholder:font-black uppercase tracking-tight"
                />

                {/* Status Indicator / Clear Button */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="bg-gray-200 p-2 hover:bg-gray-950 hover:text-white border-2 border-gray-950 transition-all font-black"
                            title="مسح البحث"
                        >
                            <X size={18} />
                        </button>
                    )}

                    <div className={cn(
                        "px-4 py-1.5 border-2 border-gray-950 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_black]",
                        searchTerm
                            ? "bg-primary-600 text-white"
                            : "bg-amber-400 text-gray-950"
                    )}>
                        <Filter size={12} />
                        <span>
                            {searchTerm ? `نتائج: ${filteredCount}` : `${totalCount} طالب`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Group */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto no-print justify-center lg:justify-end">


                <div className="flex items-center gap-3 bg-gray-50 p-2 border-2 border-dashed border-gray-300">
                    <button
                        onClick={onExport}
                        title="تصدير البيانات"
                        className="p-3.5 bg-white text-gray-950 border-2 border-gray-950 hover:bg-primary-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                    >
                        <Download size={22} />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد بيانات"
                        className="p-3.5 bg-white text-gray-950 border-2 border-gray-950 hover:bg-blue-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                    >
                        <Upload size={22} />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="حذف جميع السجلات"
                        className="p-3.5 bg-white text-rose-600 border-2 border-gray-950 hover:bg-rose-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                    >
                        <Trash2 size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};
