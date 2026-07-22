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
        <div className="space-y-2">
            <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" size={14} />
                <input
                    type="text"
                    aria-label="بحث عن معلمة"
                    placeholder="بحث بالاسم أو التخصص..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-background border border-border text-main text-xs font-bold ps-9 pe-3 py-2.5 outline-none focus:border-primary rounded-xl transition-colors placeholder:text-dim"
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-8 px-3 flex items-center gap-1.5 text-[11px] font-bold rounded-lg transition-all active:scale-95",
                        showAddForm 
                        ? "bg-error text-on-error" 
                        : "bg-primary text-on-primary"
                    )}
                >
                    {showAddForm ? <X size={12} /> : <Plus size={12} />}
                    {showAddForm ? 'إلغاء' : 'إضافة معلمة'}
                </button>
                <div className="flex items-center gap-1">
                    <button onClick={onImport} className="w-8 h-8 flex items-center justify-center bg-background border border-border text-dim rounded-lg active:scale-95 transition-transform" aria-label="استيراد">
                        <Upload size={12} />
                    </button>
                    <button onClick={onExportExcel} className="w-8 h-8 flex items-center justify-center bg-success-soft border border-success/20 text-success rounded-lg active:scale-95 transition-transform" aria-label="تصدير Excel">
                        <FileSpreadsheet size={12} />
                    </button>
                    <button onClick={onExportPDF} className="w-8 h-8 flex items-center justify-center bg-error-soft border border-error/20 text-error rounded-lg active:scale-95 transition-transform" aria-label="تصدير PDF">
                        <FileText size={12} />
                    </button>
                    <button onClick={onDeleteAll} className="w-8 h-8 flex items-center justify-center bg-error-soft border border-error/20 text-error rounded-lg active:scale-95 transition-transform" aria-label="حذف الكل">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};