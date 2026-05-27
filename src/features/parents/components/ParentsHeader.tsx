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
        <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm px-5 md:px-7 py-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>
                    <Users size={22} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-[#0F172A] dark:text-white leading-tight">سجل أولياء الأمور</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-xl border border-blue-100 dark:border-blue-800">{totalParents} ولي أمر</span>
                        <span className="text-[10px] font-medium text-[#64748B]">{totalLinkedStudents} طالب مرتبط</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm ml-2">
                    <button onClick={onImport} className="h-8 px-3 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 text-[10px] font-bold rounded-xl transition-all">استيراد</button>
                    <div className="w-[1px] h-4 bg-slate-100 dark:border-slate-700 mx-1" />
                    <button onClick={onExport} className="h-8 px-3 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 text-[10px] font-bold rounded-xl transition-all">تصدير</button>
                </div>

                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "flex items-center gap-2 h-10 px-5 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm active:scale-95",
                        showAddForm 
                            ? "bg-rose-500 hover:bg-rose-600" 
                            : "bg-[#2563EB] hover:bg-blue-700"
                    )}
                >
                    {showAddForm ? <X size={15} /> : <Plus size={15} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة ولي أمر جديد'}</span>
                </button>
            </div>
        </div>
    );
};
