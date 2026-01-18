import { Search, Plus, X, Upload, Download } from 'lucide-react';

interface TeacherToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExport: () => void;
}

export const TeacherToolbar = ({ searchTerm, onSearchChange, showAddForm, onToggleAddForm, onImport, onExport }: TeacherToolbarProps) => {
    return (
        <div className="bg-primary-50/50 p-4 border border-primary-100 dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة بالاسم، المادة أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto no-print">
                <button
                    onClick={onExport}
                    className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 font-bold hover:bg-gray-50 flex items-center gap-2 rounded-none shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                    <Download size={18} className="text-emerald-600" />
                    <span>تصدير</span>
                </button>
                <button
                    onClick={onImport}
                    className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 font-bold hover:bg-gray-50 flex items-center gap-2 rounded-none shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                    <Upload size={18} className="text-blue-600" />
                    <span>استيراد</span>
                </button>
                <button
                    onClick={onToggleAddForm}
                    className="bg-primary-600 text-white px-6 py-2.5 rounded-none flex items-center justify-center gap-2 hover:bg-primary-700 active:bg-primary-800 transition-all font-bold shadow-sm h-full w-full md:w-auto"
                >
                    {showAddForm ? <X size={18} /> : <Plus size={18} />}
                    <span>{showAddForm ? 'إلغاء' : 'إضافة معلمة'}</span>
                </button>
            </div>
        </div>
    );
};
