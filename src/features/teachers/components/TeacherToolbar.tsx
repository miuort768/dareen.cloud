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
        <div className="bg-white p-6 border-4 border-gray-950 dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 rounded-none shadow-[8px_8px_0px_0px_black] mb-8">
            <div className="relative w-full md:max-w-xl group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Search size={22} className="text-gray-950 group-focus-within:text-primary-600 transition-colors" />
                    <div className="h-6 w-1 bg-gray-950 hidden sm:block"></div>
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن معلمة بالاسم أو التخصص..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-14 py-5 bg-gray-50 dark:bg-gray-800 border-4 border-gray-950 rounded-none focus:outline-none focus:bg-white dark:focus:bg-gray-700 dark:text-white font-black text-base shadow-inner transition-all placeholder:text-gray-400 placeholder:font-black"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="bg-amber-400 text-gray-950 px-3 py-1 border-2 border-gray-950 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-[2px_2px_0px_0px_black]">
                        <Filter size={12} />
                        <span>بحث متقدم</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto no-print justify-center md:justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={`px-8 py-5 border-4 border-gray-950 font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest shadow-[4px_4px_0px_0px_black] active:shadow-none translate-y-0 active:translate-y-1 active:translate-x-1 ${
                        showAddForm 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-primary-600 text-white hover:bg-primary-500'
                    }`}
                >
                    {showAddForm ? <X size={22} /> : <Plus size={22} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة'}</span>
                </button>

                <div className="flex items-center gap-3 bg-gray-100 p-2 border-2 border-dashed border-gray-300">
                    <button
                        onClick={onExport}
                        title="تصدير للنسخة الاحتياطية"
                        className="p-3.5 bg-white text-emerald-600 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:bg-emerald-600 hover:text-white transition-all"
                    >
                        <Download size={24} />
                    </button>
                    <button
                        onClick={onImport}
                        title="استيراد بيانات خارجية"
                        className="p-3.5 bg-white text-blue-600 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:bg-blue-600 hover:text-white transition-all"
                    >
                        <Upload size={24} />
                    </button>
                    <button
                        onClick={onDeleteAll}
                        title="تصفير قاعدة البيانات"
                        className="p-3.5 bg-white text-rose-600 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:bg-rose-600 hover:text-white transition-all"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
