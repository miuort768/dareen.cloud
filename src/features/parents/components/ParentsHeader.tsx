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
        <div className="relative overflow-hidden bg-slate-950 px-4 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 no-print">
            {/* Design Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rotate-45 translate-y-[-50%] translate-x-[30%] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/10 rotate-12 translate-y-[40%] blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-none shadow-sm">
                    <Users size={22} className="text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-base md:text-xl font-medium text-white uppercase tracking-tighter">سجل أولياء الأمور</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 border border-indigo-400/20">
                            {totalParents} ولي أمر
                        </span>
                        <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                            {totalLinkedStudents} طالب مرتبـط
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-none border border-white/5 mr-2">
                    <button
                        onClick={onImport}
                        className="h-8 px-3 flex items-center gap-2 hover:bg-white/10 text-slate-300 text-[10px] font-medium rounded-none transition-all uppercase tracking-widest"
                    >
                        <Download size={13} />
                        استيراد
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button
                        onClick={onExport}
                        className="h-8 px-3 flex items-center gap-2 hover:bg-white/10 text-slate-300 text-[10px] font-medium rounded-none transition-all uppercase tracking-widest"
                    >
                        <Download size={13} className="rotate-180" />
                        تصدير
                    </button>
                </div>

                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "flex items-center gap-2 h-10 px-5 text-white text-[10px] font-medium rounded-none transition-all uppercase tracking-widest shadow-sm shadow-indigo-500/20 border",
                        showAddForm 
                            ? "bg-rose-500 border-rose-400/50 hover:bg-rose-600 shadow-rose-500/20" 
                            : "bg-indigo-600 border-indigo-400/50 hover:bg-indigo-700"
                    )}
                >
                    {showAddForm ? <X size={15} /> : <Plus size={15} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة ولي أمر جديد'}</span>
                </button>
            </div>
        </div>
    );
};
