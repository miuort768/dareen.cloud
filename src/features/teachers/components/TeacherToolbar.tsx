import { Search, Plus, X, Upload, Download, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExport: () => void;
    onDeleteAll: () => void;
}

export const TeacherToolbar = ({ searchTerm, onSearchChange, showAddForm, onToggleAddForm, onImport, onExport, onDeleteAll }: TeacherToolbarProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6" dir="rtl">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-[#5c59f2]"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-9 px-4 flex items-center gap-2 text-[11px] font-bold rounded-xl transition-all shadow-sm active:scale-95",
                        showAddForm 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                        : "bg-[#5c59f2] text-white hover:bg-indigo-700 shadow-indigo-500/10"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة جديدة'}</span>
                </button>
                
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
    );
};
