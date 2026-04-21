import React from 'react';
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

export const HonorRoll: React.FC<HonorRollProps> = ({ students }) => {
    const topStudents = [...students]
        .filter(s => (s.totalPoints || 0) > 0)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 5);

    if (topStudents.length === 0) return null;

    return (
        <div className="w-full mt-6 relative group" dir="rtl">
            {/* Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-[#5c59f2] to-emerald-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            
            <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden">
                
                {/* Header Decoration */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
                                <Trophy size={32} />
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#5c59f2] text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
                                <Star size={10} fill="currentColor" />
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles className="text-amber-400" size={18} />
                            </h2>
                            <p className="text-slate-400 font-bold mt-0.5 text-sm uppercase tracking-widest opacity-60">نخبة الدارسين الأكثر تميزاً</p>
                        </div>
                    </div>
                </div>

                {/* Top Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative p-5 rounded-3xl border transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center group/card",
                                    isFirst ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/40" : 
                                    isSecond ? "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700" :
                                    isThird ? "bg-orange-50/20 border-orange-200 dark:bg-orange-900/5" :
                                    "bg-white dark:bg-slate-800/20 border-slate-100 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mb-5 shadow-sm",
                                    isFirst ? "bg-amber-400 text-white" : 
                                    isSecond ? "bg-slate-300 text-slate-700" :
                                    isThird ? "bg-orange-400 text-white" :
                                    "bg-slate-50 dark:bg-slate-700 text-slate-400"
                                )}>
                                    {isFirst ? <Crown size={20} /> : 
                                     isSecond ? <Award size={20} /> : 
                                     <Star size={16} fill="currentColor" />}
                                </div>

                                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full border-2 border-slate-100 shadow-lg flex items-center justify-center mb-3 relative overflow-hidden">
                                     <span className="text-xl font-black text-slate-300">{student.name.charAt(0)}</span>
                                </div>

                                <div className="space-y-0.5 w-full overflow-hidden">
                                    <p className={cn(
                                        "text-[13px] font-black truncate",
                                        isFirst ? "text-amber-700 dark:text-amber-500" : "text-slate-800 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="flex flex-col items-center gap-1 mt-2">
                                        <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5">
                                            <span className="text-sm font-black text-[#5c59f2]">{student.totalPoints}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">نقطة</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Message */}
                <div className="mt-8 text-center border-t border-slate-50 dark:border-slate-800 pt-6">
                    <p className="text-slate-400 text-[11px] font-bold flex items-center justify-center gap-2 italic">
                        <CheckCircle2 size={14} className="text-[#5c59f2]" />
                        تحديث تلقائي بناءً على تقييمات النشاط الأكاديمي والتميز السلوكي
                    </p>
                </div>
            </div>
        </div>
    );
};
