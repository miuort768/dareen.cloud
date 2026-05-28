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
        <div className="shadow-sm p-3 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 rounded-none" style={{ backgroundColor: '#8B5CF6' }} dir="rtl">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={14} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-3 bg-white/15 border border-white/20 outline-none text-[11px] font-bold text-white placeholder:text-white/50 focus:border-white/40 transition-all rounded-none"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-10 px-6 flex items-center gap-2 text-[11px] font-bold transition-all shadow-sm active:scale-95 rounded-none",
                        showAddForm 
                        ? "bg-rose-500 text-white hover:bg-rose-600" 
                        : "bg-white text-[#8B5CF6] hover:bg-white/90"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة'}</span>
                </button>
                
                <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
                    <button onClick={onImport} className="w-10 h-10 flex items-center justify-center bg-white/15 border border-white/20 text-white hover:bg-white/30 transition-all group shadow-sm rounded-none" title="استيراد">
                        <Upload size={14} />
                    </button>
                    <button onClick={onExport} className="w-10 h-10 flex items-center justify-center bg-white/15 border border-white/20 text-white hover:bg-white/30 transition-all group shadow-sm rounded-none" title="تصدير">
                        <Download size={14} />
                    </button>
                    <button onClick={onDeleteAll} className="w-10 h-10 flex items-center justify-center bg-white/15 border border-white/20 text-white hover:bg-white/30 transition-all group shadow-sm rounded-none" title="تصفير">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

