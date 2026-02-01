import { Search, Printer, Download, Upload, Trash2, X, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onPrint: () => void;
    onExport: () => void;
    onImport: () => void;
    onDeleteAll: () => void;
    filteredCount: number;
    totalCount: number;
}

export const StudentToolbar = ({
    searchTerm,
    onSearchChange,
    onPrint,
    onExport,
    onImport,
    onDeleteAll,
    filteredCount,
    totalCount
}: StudentToolbarProps) => {
    return (
        <div className="bg-white p-5 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-6 rounded-none shadow-sm transition-all">

            {/* Search Group */}
            <div className="relative w-full lg:max-w-2xl group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Search size={19} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                </div>

                <input
                    type="text"
                    placeholder="ابحث عن طالب بالاسم، الهاتف أو الصف..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 bg-gray-50/50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 dark:text-white font-bold text-sm shadow-inner transition-all placeholder:text-gray-400 placeholder:font-medium"
                />

                {/* Status Indicator / Clear Button */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="مسح البحث"
                        >
                            <X size={16} />
                        </button>
                    )}

                    <div className={cn(
                        "px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 shadow-sm",
                        searchTerm
                            ? "bg-primary-50 text-primary-700 border border-primary-100 animate-in fade-in zoom-in-95"
                            : "bg-gray-100 text-gray-500 border border-gray-200 hidden sm:flex"
                    )}>
                        <Filter size={10} className={searchTerm ? "animate-pulse" : ""} />
                        <span>
                            {searchTerm ? `تم العثور على ${filteredCount}` : `${totalCount} طالب`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-3 w-full lg:w-auto no-print overflow-x-auto pb-1 lg:pb-0 scrollbar-none justify-center lg:justify-end">
                <button
                    onClick={onPrint}
                    className="bg-primary-600 text-white px-8 py-4 rounded-none flex items-center justify-center gap-3 hover:bg-primary-700 font-black shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
                >
                    <Printer size={19} />
                    <span>طباعة الكشوف</span>
                </button>

                <div className="flex items-center gap-2 border-r border-gray-100 dark:border-gray-800 pr-3 mr-1">
                    <button
                        onClick={onExport}
                        title="تصدير البيانات"
                        className="p-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-none hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all"
                    >
                        <Download size={21} />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد بيانات"
                        className="p-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-none hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all"
                    >
                        <Upload size={21} />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="حذف جميع السجلات"
                        className="p-3.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 rounded-none hover:bg-rose-100 shadow-sm transition-all"
                    >
                        <Trash2 size={21} />
                    </button>
                </div>
            </div>
        </div>
    );
};
