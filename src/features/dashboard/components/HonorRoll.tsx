import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles } from 'lucide-react';
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
        .slice(0, 6);

    if (topStudents.length === 0) return null;

    return (
        <div className="w-full mt-6" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative group">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400 text-slate-950 border border-white/20 flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                لوحة الشرف
                                <Sparkles className="text-amber-500" size={14} />
                            </h2>
                            <p className="text-[9px] font-medium text-slate-400 uppercase mt-0.5">الأداء المتميز</p>
                        </div>
                    </div>
                </div>

                {/* Compact Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative p-3 border transition-all hover:-translate-y-1 flex flex-col items-center text-center shadow-sm",
                                    isFirst ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-500/30" : 
                                    isSecond ? "bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700" :
                                    isThird ? "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-500/30" :
                                    "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                                )}
                            >
                                <div className={cn(
                                    "w-7 h-7 border border-white/20 flex items-center justify-center mb-3 shadow-sm",
                                    isFirst ? "bg-amber-400 text-slate-950" : 
                                    isSecond ? "bg-slate-300 text-slate-700" :
                                    isThird ? "bg-orange-400 text-white" :
                                    "bg-indigo-50 dark:bg-slate-700 text-indigo-500"
                                )}>
                                    {isFirst ? <Crown size={14} /> : 
                                     isSecond ? <Award size={14} /> : 
                                     <Star size={12} fill={index < 3 ? "currentColor" : "none"} />}
                                </div>

                                <div className="w-11 h-11 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center mb-2 relative overflow-hidden rounded-full shadow-inner">
                                     <span className="text-lg font-medium text-slate-200 dark:text-slate-500">{student.name.charAt(0)}</span>
                                     {student.avatar && <img src={student.avatar} alt={student.name} className="absolute inset-0 w-full h-full object-cover" />}
                                </div>

                                <div className="w-full">
                                    <p className={cn(
                                        "text-[10px] font-medium truncate uppercase mb-1",
                                        isFirst ? "text-amber-900 dark:text-amber-400" : "text-slate-900 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                        <span className="text-[9px] font-medium tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[7px] font-medium opacity-70">نقطة</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );


};
