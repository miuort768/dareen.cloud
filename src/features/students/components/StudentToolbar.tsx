import { Search, Printer, Download, Upload, Trash2 } from 'lucide-react';

interface StudentToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onPrint: () => void;
    onExport: () => void;
    onImport: () => void;
    onDeleteAll: () => void;
}

export const StudentToolbar = ({ searchTerm, onSearchChange, onPrint, onExport, onImport, onDeleteAll }: StudentToolbarProps) => {
    return (
        <div className="bg-primary-50/50 p-4 border border-primary-100 dark:bg-gray-900 dark:border-gray-800 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="بحث عن طالب بالاسم أو رقم الهاتف..."
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
                <button onClick={onPrint} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 font-bold hover:bg-gray-50 flex items-center gap-2 rounded-none shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                    <Printer size={18} className="text-primary-600" />
                    <span>طباعة</span>
                </button>
                <button onClick={onExport} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 font-bold hover:bg-gray-50 flex items-center gap-2 rounded-none shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                    <Download size={18} className="text-emerald-600" />
                    <span>تصدير</span>
                </button>
                <button onClick={onImport} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 font-bold hover:bg-gray-50 flex items-center gap-2 rounded-none shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                    <Upload size={18} className="text-blue-600" />
                    <span>استيراد</span>
                </button>
                <button onClick={onDeleteAll} className="bg-white text-red-600 border border-red-100 px-4 py-2.5 font-bold hover:bg-red-50 flex items-center gap-2 rounded-none shadow-sm transition-all dark:bg-gray-900 dark:border-red-900/30">
                    <Trash2 size={18} />
                    <span>حذف الكل</span>
                </button>
            </div>
        </div>
    );
};
