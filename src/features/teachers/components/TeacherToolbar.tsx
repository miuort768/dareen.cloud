import { Search, Plus, X, Upload, Download, Trash2 } from 'lucide-react';

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
        <div className="bg-white p-4 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-none shadow-sm">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500" size={18} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 border border-gray-100 rounded-none focus:outline-none focus:ring-0 focus:border-primary-500 bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium text-sm"
                />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto no-print overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                    onClick={onToggleAddForm}
                    className="bg-primary-600 text-white px-5 py-3 rounded-none flex items-center justify-center gap-2 hover:bg-primary-700 font-bold shadow-lg shadow-primary-600/20 whitespace-nowrap min-w-[140px]"
                >
                    {showAddForm ? <X size={18} /> : <Plus size={18} />}
                    <span>{showAddForm ? 'إلغاء' : 'إضافة معلمة'}</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onExport}
                        title="تصدير"
                        className="p-3 bg-white text-gray-700 border border-gray-100 rounded-none hover:bg-gray-50 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    >
                        <Download size={20} className="text-emerald-500" />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد"
                        className="p-3 bg-white text-gray-700 border border-gray-100 rounded-none hover:bg-gray-50 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    >
                        <Upload size={20} className="text-blue-500" />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="حذف الكل"
                        className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-none hover:bg-rose-100 shadow-sm dark:bg-rose-900/10 dark:border-rose-900/20 dark:text-rose-400"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
