import { GraduationCap, Sparkles, Plus, X, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative border-b-4 border-emerald-600 dark:border-emerald-500 mb-10 overflow-hidden" dir="rtl">
            {/* Geometric Background Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 -skew-x-12 transform translate-x-32 -translate-y-32"></div>
            
            <div className="relative bg-white dark:bg-slate-950 px-6 py-8 md:px-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Identity Section */}
                <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-900 dark:bg-black flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Users size={32} className="md:size-48 relative z-10" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 shadow-lg">
                            <Sparkles size={12} className="md:size-16" />
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-emerald-600 text-white text-[9px] md:text-[10px] font-black px-3 py-1 uppercase tracking-[2px] italic leading-none">الإدارة التعليمية</span>
                            <GraduationCap className="text-emerald-600 md:size-[18px]" size={14} />
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">سِجلّ الطلاب النخبوي</h1>
                        <p className="hidden sm:block text-slate-400 font-black mt-3 text-[10px] md:text-xs uppercase tracking-widest italic opacity-70">
                            مركز التحكم الشامل بالمتابعة الأكاديمية والنمو الطلابـي
                        </p>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto justify-end border-t md:border-t-0 md:border-r-2 border-slate-100 dark:border-slate-800 pt-6 md:pt-0 md:pr-8">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-2 italic">القوة النخبوية</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-600 tabular-nums italic leading-none">{count}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase italic">طالب</span>
                        </div>
                    </div>

                    <button
                        onClick={onToggleAddForm}
                        className={cn(
                            "relative px-6 py-4 md:px-10 md:py-5 font-black text-[10px] md:text-xs uppercase tracking-[3px] transition-all flex items-center gap-3 italic group shadow-2xl active:translate-y-1 active:shadow-none",
                            showAddForm 
                            ? "bg-rose-600 text-white hover:bg-rose-700" 
                            : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white"
                        )}
                    >
                        {showAddForm ? <X size={18} /> : <Plus size={18} className="group-hover:rotate-90 transition-transform" />}
                        <span>{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
