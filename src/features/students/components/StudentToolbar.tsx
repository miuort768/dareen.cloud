import { Search, Download, Upload, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] mb-10" dir="rtl">
            
            {/* Search Input Container */}
            <div className="relative w-full md:max-w-xl group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="البحث الذكي في قاعدة البيانات..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-black text-xs transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest italic"
                />
            </div>

            {/* Actions & Status */}
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
                {/* Stats Badge */}
                <div className="px-5 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[2px] italic border-l-4 border-emerald-500">
                    <span className="opacity-60">النتائج:</span> {filteredCount} / {totalCount}
                </div>

                <div className="flex items-center gap-2">
                    <ToolbarButton onClick={onExport} icon={Download} title="تصدير" color="indigo" />
                    <ToolbarButton onClick={onImport} icon={Upload} title="استيراد" color="emerald" />
                    <ToolbarButton onClick={onDeleteAll} icon={Trash2} title="تصفير" color="rose" />
                </div>
            </div>
        </div>
    );
};

const ToolbarButton = ({ onClick, icon: Icon, title, color }: any) => {
    const colors: any = {
        indigo: "hover:bg-indigo-600",
        emerald: "hover:bg-emerald-600",
        rose: "hover:bg-rose-600"
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 border-2 border-transparent hover:text-white transition-all active:scale-95",
                colors[color]
            )}
        >
            <Icon size={20} />
        </button>
    );
};
