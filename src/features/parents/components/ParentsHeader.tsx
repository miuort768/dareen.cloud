import React from 'react';
import { Users, X, Plus, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ParentsHeaderProps {
    totalParents: number;
    totalLinkedStudents: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
}

export const ParentsHeader: React.FC<ParentsHeaderProps> = ({
    totalParents,
    totalLinkedStudents,
    showAddForm,
    onToggleAddForm,
    onImport,
    onExportExcel,
    onExportPDF
}) => {
    return (
        <div className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] shadow-lg px-4 md:px-7 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print rounded-2xl mt-4">
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-xl">
                    <Users size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-sm md:text-lg font-bold text-white leading-tight">سجل أولياء الأمور</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 bg-white/15 backdrop-blur-sm text-white rounded-lg">{totalParents} ولي أمر</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-white/60">{totalLinkedStudents} طالب مرتبط</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 p-1 ml-2 bg-white/15 backdrop-blur-sm rounded-xl">
                    <button onClick={onImport} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all rounded-lg">استيراد</button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <button onClick={onExportExcel} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all rounded-lg"><FileSpreadsheet size={12} /> Excel</button>
                    <button onClick={onExportPDF} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all rounded-lg"><FileText size={12} /> PDF</button>
                </div>

                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "flex items-center gap-2 h-9 md:h-10 px-2 md:px-5 text-[10px] font-bold transition-all shadow-sm active:scale-95 rounded-xl",
                        showAddForm 
                            ? "bg-rose-500 text-white hover:bg-rose-600" 
                            : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span className="hidden md:inline">{showAddForm ? 'إلغاء العملية' : 'إضافة ولي أمر جديد'}</span>
                </button>
            </div>
        </div>
    );
};
