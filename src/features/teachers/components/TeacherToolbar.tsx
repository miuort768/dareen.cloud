import { Search, Plus, X, Upload, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
    onDeleteAll: () => void;
}

export const TeacherToolbar = ({ searchTerm, onSearchChange, showAddForm, onToggleAddForm, onImport, onExportExcel, onExportPDF, onDeleteAll }: TeacherToolbarProps) => {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8" dir="rtl">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C4BFF] transition-colors" size={14} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-[11px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-10 px-6 flex items-center gap-2 text-[11px] font-bold rounded-xl transition-all shadow-sm active:scale-95",
                        showAddForm 
                        ? "bg-rose-500 text-white hover:bg-rose-600" 
                        : "bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-purple-500/25"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة'}</span>
                </button>
                
                <div className="flex items-center gap-2 border-r border-gray-200 dark:border-slate-700 pr-3 mr-1">
                    <button onClick={onImport} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-[#6C4BFF] hover:text-white hover:border-[#6C4BFF] rounded-xl transition-all group shadow-sm" title="استيراد">
                        <Upload size={14} />
                    </button>
                    <button onClick={onExportExcel} className="w-10 h-10 flex items-center justify-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all group shadow-sm" title="Excel">
                        <FileSpreadsheet size={14} />
                    </button>
                    <button onClick={onExportPDF} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all group shadow-sm" title="PDF">
                        <FileText size={14} />
                    </button>
                    <button onClick={onDeleteAll} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-xl transition-all group shadow-sm" title="تصفير">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
