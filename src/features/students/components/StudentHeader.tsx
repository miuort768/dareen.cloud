import { GraduationCap, Sparkles, Plus, X, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative group mb-8" dir="rtl">
            {/* Background Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-[#5c59f2] rounded-none blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm">
                {/* Decorative Background Patterns */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 px-4 py-4 md:px-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Identity Section */}
                    <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-lg -rotate-2 group-hover:rotate-0 transition-transform">
                                <Users size={24} className="md:size-32" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-emerald-600 rounded-none border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <Sparkles size={8} className="md:size-[10px] text-white" />
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 text-[9px] md:text-[10px] font-black px-2 py-0.5 uppercase tracking-widest leading-none">إدارة شؤون الطلاب</span>
                                <GraduationCap className="text-emerald-500 md:size-[14px]" size={12} />
                            </div>
                            <h1 className="text-lg md:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter uppercase italic">قاعدة بيانات الطلاب</h1>
                            <p className="hidden sm:block text-slate-400 font-bold mt-2 text-xs opacity-70">المتابعة الأكاديمية، سجلات الحضور، وإدارة الاشتراكات</p>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto justify-end">
                        <div className="hidden lg:flex flex-col items-end px-4 border-r-2 border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">الطلاب النشطون</span>
                            <span className="text-xl font-black text-emerald-600 tabular-nums">{count} طالب</span>
                        </div>

                        <button
                            onClick={onToggleAddForm}
                            className={cn(
                                "relative px-4 py-2.5 md:px-6 md:py-3 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 md:gap-3 shadow-xl",
                                showAddForm 
                                ? "bg-rose-500 text-white hover:bg-rose-600" 
                                : "bg-[#5c59f2] text-white hover:bg-indigo-600 shadow-indigo-100 dark:shadow-none"
                            )}
                        >
                            {showAddForm ? <X size={16} className="md:size-[18px]" /> : <Plus size={16} className="md:size-[18px]" />}
                            <span>{showAddForm ? 'إلغاء' : 'إضافة طالب'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
