import React from 'react';
import { GraduationCap, Plus, X, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl shadow-sm">
                    <GraduationCap size={18} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">سجل الطلاب والمنتسبين</h1>
                    <div className="flex items-center gap-2">
                         <p className="text-[10px] text-slate-400 italic font-bold">الإدارة الأكاديمية • {count} طالب نشط</p>
                         <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                         <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">مركز التحكم</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 no-print">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-9 px-4 flex items-center gap-2 text-[11px] font-bold rounded-xl transition-all shadow-sm active:scale-95",
                        showAddForm 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                        : "bg-[#5c59f2] text-white hover:bg-indigo-700 shadow-indigo-500/10"
                    )}
                >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                </button>
            </div>
        </div>
    );
};
