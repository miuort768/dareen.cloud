import { Search, Plus, X, Upload, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
    onDeleteAll: () => void;
}

export const TeacherToolbar = ({ searchTerm, onSearchChange, showAddForm, onToggleAddForm, onImport, onExportExcel, onExportPDF, onDeleteAll }: TeacherToolbarProps) => {
    return (
        <div className="bg-white/80 dark:bg-primary-active/80 backdrop-blur-xl rounded-2xl shadow-sm border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8" dir="rtl">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-primary transition-colors" size={14} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-6 pr-10 py-2.5 bg-surface border border-border rounded-xl outline-none text-xs font-bold text-main placeholder:text-dim focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-10 px-6 flex items-center gap-2 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95",
                        showAddForm 
                        ? "bg-error text-on-error hover:bg-error-hover" 
                        : "bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/25"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة'}</span>
                </button>
                
                <div className="flex items-center gap-2 border-e border-border pr-3 ms-1">
                    <button onClick={onImport} className="w-10 h-10 flex items-center justify-center bg-surface border border-border text-muted hover:bg-primary hover:text-on-primary hover:border-primary rounded-xl transition-all group shadow-sm" title="استيراد">
                        <Upload size={14} />
                    </button>
                    <button onClick={onExportExcel} className="w-10 h-10 flex items-center justify-center bg-success-soft border border-success text-success hover:bg-success hover:text-on-success rounded-xl transition-all group shadow-sm" title="Excel">
                        <FileSpreadsheet size={14} />
                    </button>
                    <button onClick={onExportPDF} className="w-10 h-10 flex items-center justify-center bg-error-soft border border-error text-error hover:bg-error hover:text-on-error rounded-xl transition-all group shadow-sm" title="PDF">
                        <FileText size={14} />
                    </button>
                    <button onClick={onDeleteAll} className="w-10 h-10 flex items-center justify-center bg-surface border border-border text-muted hover:bg-error hover:text-on-error hover:border-error rounded-xl transition-all group shadow-sm" title="تصفير">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
