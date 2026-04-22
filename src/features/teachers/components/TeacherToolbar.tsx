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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-none shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8" dir="rtl">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary-color,#5c59f2)] transition-colors" size={14} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-none outline-none text-[11px] font-black uppercase tracking-tight focus:border-[var(--primary-color,#5c59f2)] focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 placeholder:font-bold"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-10 px-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest rounded-none transition-all shadow-sm active:scale-95",
                        showAddForm 
                        ? "bg-rose-500 text-white hover:bg-rose-600" 
                        : "bg-[var(--primary-color,#5c59f2)] text-white hover:opacity-90 shadow-indigo-500/10"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة'}</span>
                </button>
                
                <div className="flex items-center gap-2 border-r border-slate-100 dark:border-slate-800 pr-3 mr-1">
                    <button onClick={onImport} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 rounded-none transition-all group" title="استيراد">
                        <Upload size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={onExport} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-[var(--primary-color,#5c59f2)] hover:border-[var(--primary-color,#5c59f2)] rounded-none transition-all group" title="تصدير">
                        <Download size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={onDeleteAll} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-none transition-all group" title="تصفير">
                        <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
