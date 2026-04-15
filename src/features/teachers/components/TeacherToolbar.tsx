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
        <div className="bg-white p-3 border-2 border-gray-950 dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-none shadow-[4px_4px_0px_0px_black] mb-4">
            <div className="relative w-full md:max-w-xl group">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Search size={18} className="text-gray-950 group-focus-within:text-primary-600 transition-colors" />
                    <div className="h-4 w-0.5 bg-gray-950 hidden sm:block"></div>
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن معلمة..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-950 rounded-none focus:outline-none focus:bg-white dark:focus:bg-gray-700 dark:text-white font-black text-sm shadow-inner transition-all placeholder:text-gray-400 placeholder:font-black"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="bg-amber-400 text-gray-950 px-2 py-0.5 border-2 border-gray-950 font-black text-[9px] uppercase tracking-widest flex items-center gap-1 shadow-[2px_2px_0px_0px_black]">
                        <Filter size={10} />
                        <span>بحث</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto no-print justify-center md:justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={`px-4 py-2.5 border-2 border-gray-950 font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest shadow-[2px_2px_0px_0px_black] active:shadow-none translate-y-0 active:translate-y-0.5 active:translate-x-0.5 text-xs ${
                        showAddForm 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-primary-600 text-white hover:bg-primary-500'
                    }`}
                >
                    {showAddForm ? <X size={16} /> : <Plus size={16} />}
                    <span>{showAddForm ? 'إلغاء' : 'إضافة معلمة'}</span>
                </button>

                <div className="flex items-center gap-2 bg-gray-100 p-1.5 border-2 border-dashed border-gray-300">
                    <button
                        onClick={onExport}
                        title="تصدير"
                        className="p-1.5 bg-white text-emerald-600 border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] hover:bg-emerald-600 hover:text-white transition-all"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد"
                        className="p-1.5 bg-white text-blue-600 border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] hover:bg-blue-600 hover:text-white transition-all"
                    >
                        <Upload size={16} />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="تصفير"
                        className="p-1.5 bg-white text-rose-600 border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] hover:bg-rose-600 hover:text-white transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
