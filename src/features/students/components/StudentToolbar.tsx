import { Search, Download, Upload, Trash2 } from 'lucide-react';

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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 md:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm mb-6 rounded-none" dir="rtl">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md group">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن طالب، رقم هاتف، أو مرحلة دراسية..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-r-2 border-r-emerald-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 dark:text-white font-bold text-sm transition-all placeholder:text-slate-300"
                />
            </div>

            {/* Actions & Status */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
                {/* Stats Badge */}
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                    عرض <span className="text-emerald-600 dark:text-emerald-500">{filteredCount}</span> من <span className="text-slate-600 dark:text-slate-300">{totalCount}</span> طالب
                </div>

                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block mx-1"></div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onExport}
                        title="تصدير البيانات"
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-[#5c59f2] hover:text-white transition-all shadow-sm"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد البيانات"
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                        <Upload size={18} />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="حذف جميع البيانات"
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 text-rose-400 border border-slate-100 dark:border-slate-800 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
