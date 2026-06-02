import React from 'react';
import { Users, Download, X, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ParentsHeaderProps {
    totalParents: number;
    totalLinkedStudents: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExport: () => void;
}

export const ParentsHeader: React.FC<ParentsHeaderProps> = ({
    totalParents,
    totalLinkedStudents,
    showAddForm,
    onToggleAddForm,
    onImport,
    onExport
}) => {
    return (
        <div className="shadow-sm px-4 md:px-7 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print" style={{ backgroundColor: '#2563EB' }}>
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    <Users size={18} />
                </div>
                <div>
                    <h1 className="text-sm md:text-lg font-bold text-white leading-tight">سجل أولياء الأمور</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>{totalParents} ولي أمر</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-white/60">{totalLinkedStudents} طالب مرتبط</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 p-1 ml-2" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <button onClick={onImport} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all">استيراد</button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <button onClick={onExport} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all">تصدير</button>
                </div>

                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "flex items-center gap-2 h-9 md:h-10 px-2 md:px-5 text-[10px] font-bold transition-all shadow-sm active:scale-95",
                        showAddForm 
                            ? "bg-rose-500 text-white hover:bg-rose-600" 
                            : "bg-white text-[#2563EB] hover:bg-white/90"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span className="hidden md:inline">{showAddForm ? 'إلغاء العملية' : 'إضافة ولي أمر جديد'}</span>
                </button>
            </div>
        </div>
    );
};
