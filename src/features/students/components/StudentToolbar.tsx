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
        <div className="px-0 mb-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-none shadow-sm flex flex-col md:flex-row items-center justify-between gap-4" dir="rtl">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                        type="text"
                        placeholder="البحث في قاعدة بيانات الطلاب..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-6 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none outline-none text-xs font-normal focus:border-[#5c59f2]"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-normal text-slate-400 rounded-lg">
                        {filteredCount} / {totalCount} طالب
                    </div>
                    
                    <div className="flex items-center gap-1.5 border-r border-slate-100 dark:border-slate-800 pr-2 mr-1">
                        <button onClick={onImport} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-lg transition-all" title="استيراد">
                            <Upload size={14} />
                        </button>
                        <button onClick={onExport} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#5c59f2] rounded-lg transition-all" title="تصدير">
                            <Download size={14} />
                        </button>
                        <button onClick={onDeleteAll} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-lg transition-all" title="تصفير">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

