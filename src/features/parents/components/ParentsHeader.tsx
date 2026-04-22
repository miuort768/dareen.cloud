import React from 'react';
import { Users, Download, X, Plus } from 'lucide-react';

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
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-[#5c59f2] text-white rounded-xl shadow-lg shadow-indigo-500/20">
                    <Users size={18} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">سجل أولياء الأمور</h1>
                    <div className="flex items-center gap-2">
                         <p className="text-[10px] text-slate-400 italic font-bold">إدارة البيانات العائلية • {totalParents} ولي أمر</p>
                         <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                         <span className="text-[10px] font-bold text-[#5c59f2] bg-indigo-50 px-1.5 py-0.5 rounded-md">{totalLinkedStudents} طالب مرتبط</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 no-print">
                <button
                    onClick={onImport}
                    className="h-9 px-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-xl hover:bg-slate-100 transition-all"
                >
                    <Download size={14} />
                    استيراد
                </button>
                <button
                    onClick={onExport}
                    className="h-9 px-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-xl hover:bg-slate-100 transition-all"
                >
                    <Download size={14} className="rotate-180" />
                    تصدير
                </button>
                <button
                    onClick={onToggleAddForm}
                    className="h-9 px-4 flex items-center gap-2 bg-[#5c59f2] text-white text-[11px] font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء' : 'إضافة ولي أمر'}</span>
                </button>
            </div>
        </div>
    );
};
