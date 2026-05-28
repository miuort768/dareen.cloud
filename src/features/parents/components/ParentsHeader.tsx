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
        <div className="shadow-sm px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print rounded-none" style={{ backgroundColor: '#2563EB' }}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    <Users size={22} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white leading-tight">سجل أولياء الأمور</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-none" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>{totalParents} ولي أمر</span>
                        <span className="text-[10px] font-bold text-white/60">{totalLinkedStudents} طالب مرتبط</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 p-1 ml-2 rounded-none" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <button onClick={onImport} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all rounded-none">استيراد</button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <button onClick={onExport} className="h-8 px-3 flex items-center gap-2 hover:bg-white/20 text-white/80 text-[10px] font-bold transition-all rounded-none">تصدير</button>
                </div>

                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "flex items-center gap-2 h-10 px-5 text-[10px] font-bold transition-all shadow-sm active:scale-95 rounded-none",
                        showAddForm 
                            ? "bg-rose-500 text-white hover:bg-rose-600" 
                            : "bg-white text-[#2563EB] hover:bg-white/90"
                    )}
                >
                    {showAddForm ? <X size={15} /> : <Plus size={15} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة ولي أمر جديد'}</span>
                </button>
            </div>
        </div>
    );
};
