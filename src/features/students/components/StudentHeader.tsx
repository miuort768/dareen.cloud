import { GraduationCap, Plus, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative overflow-hidden bg-rose-600 px-4 md:px-8 py-8 flex flex-row items-center justify-between gap-4 border-b border-rose-700 rounded-none shadow-xl" dir="rtl">
            {/* Geometric Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rotate-45 -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-none shadow-lg">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <div>
                    <h1 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter">سجل الطلاب والمنتسبين</h1>
                    <div className="hidden md:flex items-center gap-3 mt-1.5">
                         <p className="text-[10px] text-rose-100 font-black uppercase tracking-widest">الإدارة الأكاديمية • {count} طالب نشط</p>
                         <span className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse"></span>
                         <span className="text-[9px] font-black text-white uppercase tracking-widest border border-white/20 px-2 py-0.5 bg-white/10">مركز التحكم</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 no-print">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-12 px-6 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest rounded-none transition-all shadow-xl active:scale-95 border",
                        showAddForm 
                        ? "bg-white text-rose-600 border-white hover:bg-rose-50" 
                        : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                    )}
                >
                    {showAddForm ? <X size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                    <span className="hidden sm:inline">{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                </button>
            </div>
        </div>
    );
};
