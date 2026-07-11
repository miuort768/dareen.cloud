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
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6" dir="rtl">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                <input
                    type="text"
                    placeholder="ابحث عن معلمة باسمها أو تخصصها..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pe-4 ps-9 py-2.5 bg-card border border-border/60 rounded-xl outline-none text-xs text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-9 px-5 flex items-center gap-2 text-xs font-bold rounded-xl transition-all shadow-soft active:scale-95",
                        showAddForm 
                        ? "bg-error text-on-primary hover:bg-error-hover" 
                        : "bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/25"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء' : 'إضافة معلمة'}</span>
                </button>
                
                <div className="flex items-center gap-2 border-s border-border/50 ps-3 ms-1">
                    <button onClick={onImport} className="w-9 h-9 flex items-center justify-center bg-card border border-border/60 text-muted hover:bg-primary hover:text-on-primary rounded-xl transition-all shadow-soft" title="استيراد">
                        <Upload size={14} />
                    </button>
                    <button onClick={onExportExcel} className="w-9 h-9 flex items-center justify-center bg-success/10 border border-success/30 text-success hover:bg-success hover:text-on-success rounded-xl transition-all shadow-soft" title="Excel">
                        <FileSpreadsheet size={14} />
                    </button>
                    <button onClick={onExportPDF} className="w-9 h-9 flex items-center justify-center bg-error/10 border border-error/30 text-error hover:bg-error hover:text-on-error rounded-xl transition-all shadow-soft" title="PDF">
                        <FileText size={14} />
                    </button>
                    <button onClick={onDeleteAll} className="w-9 h-9 flex items-center justify-center bg-card border border-border/60 text-muted hover:bg-error hover:text-on-primary rounded-xl transition-all shadow-soft" title="تصفير">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
