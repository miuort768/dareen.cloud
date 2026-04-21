import { Award, Star, TrendingUp, Trophy, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Student {
    id: string;
    name: string;
    totalPoints?: number;
    avatar?: string;
}

interface HonorRollProps {
    students: Student[];
}

export const HonorRoll = ({ students }: HonorRollProps) => {
    const topStudents = [...students]
        .filter(s => (s.totalPoints || 0) > 0)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 5);

    if (topStudents.length === 0) return null;

    return (
        <div className="w-full mt-8 relative group">
            {/* Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-[#5c59f2] to-emerald-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-xl">
                
                {/* Header Decoration */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2rem] flex items-center justify-center shadow-inner rotate-3">
                                <Trophy size={42} />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#5c59f2] text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 animate-bounce">
                                <Star size={14} fill="currentColor" />
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-3">
                                لوحة الشرف
                                <Sparkles className="text-amber-400" size={24} />
                            </h2>
                            <p className="text-slate-400 font-bold mt-1 text-base">نحتفي بأفضل خمسة طلاب حققوا أعلى نقاط تميز هذا الشهر</p>
                        </div>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex -space-x-3 rtl:space-x-reverse">
                            {topStudents.map((s) => (
                                <div key={s.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-[#5c59f2] flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
                                    {s.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                        <span className="px-3 text-xs font-bold text-slate-500">نخبة الدارسين</span>
                    </div>
                </div>

                {/* Top Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative group/card p-6 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center",
                                    isFirst ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50 ring-4 ring-amber-50/50" : 
                                    isSecond ? "bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700" :
                                    isThird ? "bg-orange-50/30 border-orange-200 dark:bg-orange-900/5" :
                                    "bg-white dark:bg-slate-800/20 border-slate-800 dark:border-slate-800"
                                )}
                            >
                                {/* Rank Icon / Medal */}
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-black/5",
                                    isFirst ? "bg-amber-400 text-white" : 
                                    isSecond ? "bg-slate-300 text-slate-700" :
                                    isThird ? "bg-orange-400 text-white" :
                                    "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                )}>
                                    {isFirst ? <Crown size={24} /> : 
                                     isSecond ? <Award size={24} /> : 
                                     <Star size={20} fill="currentColor" />}
                                </div>

                                {/* Student Face / Avatar Placeholder */}
                                <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-xl flex items-center justify-center mb-4 relative overflow-hidden">
                                     <span className="text-2xl font-black text-slate-300">{student.name.charAt(0)}</span>
                                     {isFirst && <div className="absolute inset-0 bg-amber-400/10 animate-pulse"></div>}
                                </div>

                                <div className="space-y-1 w-full overflow-hidden">
                                    <p className={cn(
                                        "text-sm font-black truncate",
                                        isFirst ? "text-amber-700 dark:text-amber-500" : "text-slate-800 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="flex flex-col items-center gap-1 mt-3">
                                        <div className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                                            <span className="text-lg font-black text-[#5c59f2]">{student.totalPoints}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">نقطة</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Small Indicator Overlay */}
                                <div className="absolute top-4 left-4">
                                     <TrendingUp size={14} className={cn(isFirst ? "text-amber-500" : "text-emerald-500 opacity-30")} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Message */}
                <div className="mt-12 text-center border-t border-slate-50 dark:border-slate-800 pt-8" dir="rtl">
                    <p className="text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} className="text-[#5c59f2]" />
                        يتم تحديث لوحة الشرف تلقائياً بناءً على تقييمات المعلمين والنشاط الأكاديمي
                    </p>
                </div>
            </div>
        </div>
    );
};
