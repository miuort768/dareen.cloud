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
            <div className="bg-primary p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 rounded-none" dir="rtl">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-primary opacity-50" size={14} />
                    <input
                        type="text"
                        placeholder="البحث في قاعدة بيانات الطلاب..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-6 pr-9 py-2 text-xs font-bold text-on-primary placeholder:text-on-primary placeholder:opacity-50 outline-none transition-all rounded-none bg-white/15 border border-white/20"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-on-primary opacity-70">
                        {filteredCount} / {totalCount} طالب
                    </div>
                    
                    <div className="flex items-center gap-1.5 border-r border-white/20 pr-2 mr-1">
                        <button onClick={onImport} className="w-8 h-8 flex items-center justify-center text-on-primary opacity-70 hover:opacity-100 transition-all rounded-none bg-white/10" title="استيراد">
                            <Upload size={14} />
                        </button>
                        <button onClick={onExport} className="w-8 h-8 flex items-center justify-center text-on-primary opacity-70 hover:opacity-100 transition-all rounded-none bg-white/10" title="تصدير">
                            <Download size={14} />
                        </button>
                        <button onClick={onDeleteAll} className="w-8 h-8 flex items-center justify-center text-on-primary opacity-70 hover:opacity-100 transition-all rounded-none bg-white/10" title="تصفير">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

