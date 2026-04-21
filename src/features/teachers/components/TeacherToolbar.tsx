import { Search, Plus, X, Upload, Download, Trash2, Filter } from 'lucide-react';

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
        <div className="bg-white dark:bg-slate-900 p-2 md:p-3 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm mb-6" dir="rtl">
            <div className="relative w-full md:max-w-md group">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#5c59f2] transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-r-2 border-r-slate-200 dark:border-r-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-700 dark:text-white font-bold text-sm transition-all placeholder:text-slate-300"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "px-4 py-2 font-black flex items-center justify-center gap-2 transition-all text-xs tracking-tight",
                        showAddForm 
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-100' 
                        : 'bg-[#5c59f2] text-white hover:bg-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none'
                    )}
                >
                    {showAddForm ? <X size={16} /> : <Plus size={16} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة جديدة'}</span>
                </button>

                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block mx-1"></div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onExport}
                        title="تصدير البيانات"
                        className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-[#5c59f2] hover:text-white transition-all shadow-sm"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد البيانات"
                        className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                        <Upload size={16} />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="تصفير الجدول"
                        className="p-2 bg-slate-50 dark:bg-slate-800 text-rose-400 border border-slate-100 dark:border-slate-800 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
