import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
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
        <div className="w-full mt-10" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm overflow-hidden relative">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner relative group">
                            <Trophy size={32} className="transition-transform group-hover:scale-110" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#5c59f2] text-white rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                                <Star size={10} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles className="text-amber-400" size={18} />
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mt-1">نخبة الدارسين الأكثر تميزاً</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative p-6 rounded-[2rem] border transition-all hover:-translate-y-1 flex flex-col items-center text-center group",
                                    isFirst ? "bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20" : 
                                    isSecond ? "bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700" :
                                    isThird ? "bg-orange-50/20 border-orange-100 dark:bg-orange-900/10" :
                                    "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                                    isFirst ? "bg-amber-400 text-white" : 
                                    isSecond ? "bg-slate-300 text-slate-700" :
                                    isThird ? "bg-orange-400 text-white" :
                                    "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                )}>
                                    {isFirst ? <Crown size={20} /> : 
                                     isSecond ? <Award size={20} /> : 
                                     <Star size={16} fill="currentColor" />}
                                </div>

                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center mb-4 relative overflow-hidden">
                                     <span className="text-xl font-bold text-slate-200">{student.name.charAt(0)}</span>
                                </div>

                                <div className="space-y-2 w-full">
                                    <p className={cn(
                                        "text-sm font-bold truncate",
                                        isFirst ? "text-amber-700 dark:text-amber-500" : "text-slate-800 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-50 dark:border-slate-700 shadow-sm">
                                        <span className="text-xs font-bold text-[#5c59f2] tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">نقطة</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold italic uppercase tracking-wider">
                        <CheckCircle2 size={14} className="text-[#5c59f2]" />
                        تحديث تلقائي بناءً على معايير التميز والأداء الأكاديمي
                    </div>
                </div>
            </div>
        </div>
    );
};
